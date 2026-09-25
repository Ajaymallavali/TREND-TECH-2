import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { isAccessory } from '../services/productMatching.service.js';

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

async function generateSummary() {
  await connectDB();

  const products = await Product.find({}).lean();
  const marketplaceProducts = await MarketplaceProduct.find({}).populate('marketplace').lean();

  const totalProducts = products.length;
  let productsWithImage = 0;
  let productsWithoutImage = 0;

  const urlMap = {};
  const genericList = [];
  const accessoryList = [];
  const brokenList = [];
  const exactModelList = [];
  const weakIdentityList = [];

  const mpOffersByProduct = {};
  for (const mp of marketplaceProducts) {
    const pId = mp.product ? mp.product.toString() : null;
    if (pId) {
      if (!mpOffersByProduct[pId]) mpOffersByProduct[pId] = [];
      mpOffersByProduct[pId].push(mp);
    }
  }

  const missingMarketplaceImageList = [];

  for (const p of products) {
    const img = p.image ? p.image.trim() : null;
    if (img) {
      productsWithImage++;
      if (!urlMap[img]) urlMap[img] = [];
      urlMap[img].push(p.name);
    } else {
      productsWithoutImage++;
    }

    if (img) {
      if (KNOWN_GENERIC_URLS.has(img) || GENERIC_STOCK_DOMAINS.some((d) => img.includes(d))) {
        genericList.push({ name: p.name, image: img });
      }
    }

    if (isAccessory(p.name) || (img && isAccessory(img))) {
      accessoryList.push({ name: p.name, image: img });
    }

    if (img) {
      try {
        const u = new URL(img);
        if (!['http:', 'https:'].includes(u.protocol)) {
          brokenList.push({ name: p.name, image: img, reason: 'Invalid protocol' });
        }
      } catch {
        brokenList.push({ name: p.name, image: img, reason: 'Malformed URL' });
      }
    }

    const offers = mpOffersByProduct[p._id.toString()] || [];
    if (offers.length === 0) {
      missingMarketplaceImageList.push({ name: p.name, reason: 'No marketplace offers' });
    }

    const nameWords = p.name.trim().split(/\s+/);
    const hasModelSpec = /\b(15|16|17|24|25|5G|M2|M3|M4|Pro|Max|Ultra|Plus|Slim|OLED|QLED|4K|8K|A15|XM5|1000XM5)\b/i.test(p.name);

    if (p.brand && nameWords.length >= 2 && hasModelSpec) {
      exactModelList.push(p.name);
    } else {
      weakIdentityList.push(p.name);
    }
  }

  const allUrls = Object.keys(urlMap);
  const uniqueUrls = allUrls.length;
  const duplicateUrlEntries = Object.entries(urlMap).filter(([url, prods]) => prods.length > 1);

  console.log('=== SUMMARY METRICS ===');
  console.log('Total Products:', totalProducts);
  console.log('Products With Image:', productsWithImage);
  console.log('Products Without Image:', productsWithoutImage);
  console.log('Unique Image URLs:', uniqueUrls);
  console.log('Duplicate Image URLs:', duplicateUrlEntries.length);
  console.log('Generic/Category-Level Images:', genericList.length);
  console.log('Accessory Product/Image Items:', accessoryList.length);
  console.log('Broken Image URLs:', brokenList.length);
  console.log('Missing Marketplace Image Offers:', missingMarketplaceImageList.length);
  console.log('Exact Model Identity Products:', exactModelList.length);
  console.log('Weak/Ambiguous Identity Products:', weakIdentityList.length);

  console.log('\n=== SHARED IMAGE URL BREAKDOWN ===');
  for (const [url, prods] of duplicateUrlEntries) {
    console.log(`URL: ${url}`);
    console.log(`Shared by ${prods.length} products:`, prods);
  }

  console.log('\n=== WEAK / AMBIGUOUS IDENTITY EXAMPLES ===');
  console.log(weakIdentityList);

  await disconnectDB();
}

generateSummary().catch(console.error);
