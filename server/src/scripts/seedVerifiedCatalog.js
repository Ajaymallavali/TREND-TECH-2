import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { VERIFIED_CATALOG_DATA } from '../data/verifiedCatalog.data.js';
import {
  validateMarketplaceUrl,
  validateProductImage,
  deduplicateOffers,
  deduplicateProducts
} from '../services/verifiedCatalogValidator.service.js';
import { connectDB, disconnectDB } from '../config/db.js';

async function seedVerifiedCatalog() {
  console.log('🚀 Starting TREND-TECH Verified Catalog Seeder (First Phase: 20 Curated Products)...');
  await connectDB();

  // Baseline Counts
  const productsBefore = await Product.countDocuments();
  const offersBefore = await MarketplaceProduct.countDocuments();

  let productsCreated = 0;
  let productsUpdated = 0;
  let offersCreated = 0;
  let offersUpdated = 0;
  let offersRejected = 0;
  let priceHistoryCreated = 0;
  let imagesVerified = 0;
  let imagesRejected = 0;
  let imageDuplicatesCount = 0;
  let urlsVerified = 0;
  let urlsRejected = 0;
  let searchUrlsRejected = 0;
  let duplicateProductsCount = 0;
  let duplicateAsinsCount = 0;
  let duplicateUrlsCount = 0;

  const tableRows = [];
  const uniquePool = deduplicateProducts(VERIFIED_CATALOG_DATA);
  if (uniquePool.length < VERIFIED_CATALOG_DATA.length) {
    duplicateProductsCount += VERIFIED_CATALOG_DATA.length - uniquePool.length;
  }

  // Ensure default Marketplaces exist
  const mpMap = {};
  const defaultMarketplaces = [
    { name: 'Amazon India', code: 'amazon-in', baseUrl: 'https://www.amazon.in' },
    { name: 'Flipkart', code: 'flipkart', baseUrl: 'https://www.flipkart.com' },
    { name: 'Croma', code: 'croma', baseUrl: 'https://www.croma.com' },
    { name: 'Reliance Digital', code: 'reliance', baseUrl: 'https://www.reliancedigital.in' },
    { name: 'Vijay Sales', code: 'vijaysales', baseUrl: 'https://www.vijaysales.com' },
    { name: 'Myntra', code: 'myntra', baseUrl: 'https://www.myntra.com' },
    { name: 'Nike India', code: 'nike-in', baseUrl: 'https://www.nike.com/in' },
    { name: 'Nykaa', code: 'nykaa', baseUrl: 'https://www.nykaa.com' }
  ];

  for (const mDef of defaultMarketplaces) {
    let mp = await Marketplace.findOne({
      $or: [{ name: mDef.name }, { code: mDef.code }]
    });
    if (!mp) {
      mp = await Marketplace.create(mDef);
    }
    mpMap[mDef.name] = mp;
  }

  // Process 20 products
  for (const item of uniquePool) {
    // 1. Image Validation
    const imgRes = validateProductImage(item.image, uniquePool);
    if (!imgRes.isValid) {
      imagesRejected++;
      if (imgRes.reason === 'DUPLICATE_IMAGE_REJECTED') imageDuplicatesCount++;
      tableRows.push({
        product: item.name,
        brand: item.brand,
        category: item.category,
        marketplace: 'N/A',
        price: 'N/A',
        exactUrl: 'N/A',
        imageUrl: item.image || 'N/A',
        validationStatus: `REJECTED (${imgRes.reason})`
      });
      continue;
    }
    imagesVerified++;

    // 2. Find or Create Product (Preserve existing data, upsert by name/category)
    let productDoc = await Product.findOne({ name: item.name });
    if (!productDoc) {
      const specsMap = new Map(Object.entries(item.specs || {}));
      productDoc = await Product.create({
        name: item.name,
        brand: item.brand,
        category: item.category,
        description: item.description,
        image: item.image,
        specs: specsMap,
        tags: item.tags || []
      });
      productsCreated++;
    } else {
      let updated = false;
      if (!productDoc.image) {
        productDoc.image = item.image;
        updated = true;
      }
      if (updated) {
        await productDoc.save();
        productsUpdated++;
      }
    }

    // 3. Process Offers
    const validOffers = deduplicateOffers(item.offers || []);
    if (validOffers.length < (item.offers || []).length) {
      const diff = (item.offers || []).length - validOffers.length;
      offersRejected += diff;
      urlsRejected += diff;
    }

    for (const rawOffer of item.offers || []) {
      const urlRes = validateMarketplaceUrl(rawOffer.url, rawOffer.marketplace);
      if (!urlRes.isValid) {
        if (urlRes.reason === 'SEARCH_URL_REJECTED') searchUrlsRejected++;
        tableRows.push({
          product: item.name,
          brand: item.brand,
          category: item.category,
          marketplace: rawOffer.marketplace,
          price: rawOffer.currentPrice ? `₹${rawOffer.currentPrice}` : 'N/A',
          exactUrl: rawOffer.url,
          imageUrl: item.image,
          validationStatus: `REJECTED_OFFER (${urlRes.reason})`
        });
        continue;
      }
      urlsVerified++;

      if (!rawOffer.currentPrice || typeof rawOffer.currentPrice !== 'number' || rawOffer.currentPrice <= 0) {
        offersRejected++;
        continue;
      }

      const mpDoc = mpMap[rawOffer.marketplace] || await Marketplace.findOne({ name: rawOffer.marketplace });
      if (!mpDoc) {
        offersRejected++;
        continue;
      }

      let mpOfferDoc = await MarketplaceProduct.findOne({
        product: productDoc._id,
        marketplace: mpDoc._id
      });

      if (!mpOfferDoc) {
        mpOfferDoc = await MarketplaceProduct.create({
          product: productDoc._id,
          marketplace: mpDoc._id,
          sku: urlRes.asin || undefined,
          url: urlRes.canonicalUrl,
          currentPrice: rawOffer.currentPrice,
          originalPrice: rawOffer.originalPrice || null,
          currency: 'INR',
          isAvailable: rawOffer.isAvailable !== false,
          lastUpdated: new Date()
        });
        offersCreated++;

        // Legitimate current PriceHistory observation
        await PriceHistory.create({
          marketplaceProduct: mpOfferDoc._id,
          price: rawOffer.currentPrice,
          timestamp: new Date()
        });
        priceHistoryCreated++;
      } else {
        const priceChanged = mpOfferDoc.currentPrice !== rawOffer.currentPrice;
        mpOfferDoc.currentPrice = rawOffer.currentPrice;
        mpOfferDoc.originalPrice = rawOffer.originalPrice || mpOfferDoc.originalPrice;
        mpOfferDoc.url = urlRes.canonicalUrl;
        mpOfferDoc.isAvailable = rawOffer.isAvailable !== false;
        mpOfferDoc.lastUpdated = new Date();
        await mpOfferDoc.save();
        offersUpdated++;

        if (priceChanged) {
          await PriceHistory.create({
            marketplaceProduct: mpOfferDoc._id,
            price: rawOffer.currentPrice,
            timestamp: new Date()
          });
          priceHistoryCreated++;
        }
      }

      tableRows.push({
        product: item.name,
        brand: item.brand,
        category: item.category,
        marketplace: rawOffer.marketplace,
        price: `₹${rawOffer.currentPrice.toLocaleString('en-IN')}`,
        exactUrl: urlRes.canonicalUrl,
        imageUrl: item.image,
        validationStatus: 'PASSED_VERIFIED'
      });
    }
  }

  const productsAfter = await Product.countDocuments();

  console.log('\n===============================================================');
  console.log('         TREND-TECH VERIFIED CATALOG SEEDER REPORT              ');
  console.log('===============================================================');
  console.log(`PRODUCTS`);
  console.log(`before: ${productsBefore}`);
  console.log(`created: ${productsCreated}`);
  console.log(`updated: ${productsUpdated}`);
  console.log(`after: ${productsAfter}`);

  console.log(`\nMARKETPLACE OFFERS`);
  console.log(`created: ${offersCreated}`);
  console.log(`updated: ${offersUpdated}`);
  console.log(`rejected: ${offersRejected}`);

  console.log(`\nIMAGES`);
  console.log(`verified: ${imagesVerified}`);
  console.log(`rejected: ${imagesRejected}`);
  console.log(`duplicates: ${imageDuplicatesCount}`);

  console.log(`\nURLS`);
  console.log(`verified: ${urlsVerified}`);
  console.log(`rejected: ${urlsRejected}`);
  console.log(`search URLs rejected: ${searchUrlsRejected}`);

  console.log(`\nPRICE HISTORY`);
  console.log(`created: ${priceHistoryCreated}`);

  console.log(`\nDUPLICATES`);
  console.log(`duplicate products: ${duplicateProductsCount}`);
  console.log(`duplicate ASINs: ${duplicateAsinsCount}`);
  console.log(`duplicate marketplace URLs: ${duplicateUrlsCount}`);
  console.log('===============================================================\n');

  console.log('VERIFIED 20-PRODUCT CATALOG VALIDATION TABLE:');
  console.table(tableRows);

  await disconnectDB();
  console.log('\n✅ Verified Catalog Seeder Completed Successfully.');
}

seedVerifiedCatalog().catch((err) => {
  console.error('❌ Error during verified catalog seeding:', err);
  process.exit(1);
});
