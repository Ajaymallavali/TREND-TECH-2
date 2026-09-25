import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { isAccessory } from '../services/productMatching.service.js';

// Known generic / category-level stock image URLs / domains
const GENERIC_STOCK_DOMAINS = [
  'images.unsplash.com',
  'stock.adobe.com',
  'shutterstock.com',
  'freepik.com',
  'pixabay.com',
  'via.placeholder.com',
  'placeholder',
];

const KNOWN_GENERIC_URLS = new Set([
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=60',
]);

async function auditDatabase() {
  await connectDB();

  const products = await Product.find({}).lean();
  const marketplaceProducts = await MarketplaceProduct.find({}).populate('marketplace').lean();

  const totalProducts = products.length;
  let productsWithImage = 0;
  let productsWithoutImage = 0;

  const imageUrlToProductsMap = {}; // url -> [productNames]
  const genericCategoryProducts = [];
  const accessoryImageProducts = [];
  const brokenImageProducts = [];
  const exactModelProducts = [];
  const weakAmbiguousProducts = [];
  const missingMarketplaceImageProducts = [];

  // Group marketplace offers by product
  const marketplaceOffersByProduct = {};
  for (const mp of marketplaceProducts) {
    const pId = mp.product ? mp.product.toString() : null;
    if (pId) {
      if (!marketplaceOffersByProduct[pId]) marketplaceOffersByProduct[pId] = [];
      marketplaceOffersByProduct[pId].push(mp);
    }
  }

  for (const p of products) {
    const img = p.image ? p.image.trim() : null;

    if (img) {
      productsWithImage++;
      if (!imageUrlToProductsMap[img]) {
        imageUrlToProductsMap[img] = [];
      }
      imageUrlToProductsMap[img].push({ id: p._id, name: p.name, brand: p.brand });
    } else {
      productsWithoutImage++;
    }

    // 1. Check generic/category-level image
    if (img) {
      const isKnownGeneric = KNOWN_GENERIC_URLS.has(img);
      const isStockDomain = GENERIC_STOCK_DOMAINS.some((domain) => img.includes(domain));
      if (isKnownGeneric || isStockDomain) {
        genericCategoryProducts.push({ id: p._id, name: p.name, image: img });
      }
    }

    // 2. Check if product or image is an accessory
    const isAccProduct = isAccessory(p.name);
    const imgIsAcc = img && (isAccessory(img) || img.includes('case') || img.includes('cover') || img.includes('charger'));
    if (isAccProduct || imgIsAcc) {
      accessoryImageProducts.push({ id: p._id, name: p.name, brand: p.brand, image: img });
    }

    // 3. Check URL validity / broken image format
    if (img) {
      try {
        const parsed = new URL(img);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          brokenImageProducts.push({ id: p._id, name: p.name, image: img, reason: 'Invalid protocol' });
        }
      } catch {
        brokenImageProducts.push({ id: p._id, name: p.name, image: img, reason: 'Malformed URL' });
      }
    }

    // 4. Check missing marketplace image (where MarketplaceProduct has no valid image or offer URL)
    const offers = marketplaceOffersByProduct[p._id.toString()] || [];
    if (offers.length === 0) {
      missingMarketplaceImageProducts.push({ id: p._id, name: p.name, reason: 'No marketplace offers' });
    } else {
      const validMarketplaceImageOffers = offers.filter((o) => o.marketplace && (o.marketplace.logoUrl || o.url));
      if (validMarketplaceImageOffers.length === 0) {
        missingMarketplaceImageProducts.push({ id: p._id, name: p.name, reason: 'No valid marketplace logo/url' });
      }
    }

    // 5. Check exact model identity vs weak/ambiguous identity
    // Exact model contains specific brand + series/model number/spec (e.g. "Apple iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "ASUS TUF Gaming A15")
    const nameWords = p.name.trim().split(/\s+/);
    const hasModelNumberOrSpec = /\b(15|16|17|24|25|5G|M2|M3|M4|Pro|Max|Ultra|Plus|Slim|OLED|QLED|4K|8K|A15|XM5|1000XM5)\b/i.test(p.name);

    if (p.brand && nameWords.length >= 2 && hasModelNumberOrSpec) {
      exactModelProducts.push({ id: p._id, name: p.name, brand: p.brand });
    } else {
      weakAmbiguousProducts.push({ id: p._id, name: p.name, brand: p.brand });
    }
  }

  // Calculate unique & duplicate image URLs
  const allImageUrls = Object.keys(imageUrlToProductsMap);
  const uniqueImageUrls = allImageUrls.length;
  const sharedImageMap = {}; // url -> count & product names

  let duplicateImageUrlsCount = 0;
  for (const [url, prods] of Object.entries(imageUrlToProductsMap)) {
    if (prods.length > 1) {
      duplicateImageUrlsCount++;
      sharedImageMap[url] = {
        count: prods.length,
        products: prods.map((pr) => pr.name),
      };
    }
  }

  const report = {
    totalProducts,
    productsWithImage,
    productsWithoutImage,
    uniqueImageUrls,
    duplicateImageUrls: duplicateImageUrlsCount,
    sharedImageMap,
    productsGenericCategoryCount: genericCategoryProducts.length,
    genericCategoryProducts,
    productsAccessoryCount: accessoryImageProducts.length,
    accessoryImageProducts,
    productsBrokenImageCount: brokenImageProducts.length,
    brokenImageProducts,
    productsMissingMarketplaceImageCount: missingMarketplaceImageProducts.length,
    missingMarketplaceImageProducts,
    productsExactModelIdentityCount: exactModelProducts.length,
    exactModelProducts,
    productsWeakAmbiguousIdentityCount: weakAmbiguousProducts.length,
    weakAmbiguousProducts,
  };

  console.log(JSON.stringify(report, null, 2));
  await disconnectDB();
}

auditDatabase().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
