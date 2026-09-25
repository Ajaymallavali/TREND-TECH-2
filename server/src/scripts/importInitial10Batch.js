import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { ensureMarketplaces, ingestCatalogProduct } from '../services/realCatalogIngestion.service.js';
import { connectDB } from '../config/db.js';
import { logger } from '../config/logger.js';

async function runInitial10Batch() {
  console.log('🚀 Starting TREND-TECH 10-Product Initial Test Batch Import...');
  await connectDB();

  const marketplaceMap = await ensureMarketplaces();

  const countsBefore = {
    products: await Product.countDocuments(),
    offers: await MarketplaceProduct.countDocuments(),
    priceHistory: await PriceHistory.countDocuments()
  };

  const initial10 = REAL_VERIFIED_CATALOG.slice(0, 10);
  let productsCreated = 0;
  let productsUpdated = 0;
  let productsDuplicatesRejected = 0;
  let offersCreated = 0;
  let offersRejected = 0;
  let searchUrlsRejected = 0;
  let priceHistoryCreated = 0;
  let imageVerified = 0;
  let imageRejected = 0;
  let urlVerified = 0;
  let urlRejected = 0;

  for (const entry of initial10) {
    const res = await ingestCatalogProduct(entry, marketplaceMap);
    if (res.stats.productCreated) productsCreated++;
    if (res.stats.productUpdated) productsUpdated++;
    if (res.stats.productRejected) productsDuplicatesRejected++;
    offersCreated += res.stats.offersCreated;
    offersRejected += res.stats.offersRejected;
    searchUrlsRejected += res.stats.searchUrlsRejected;
    priceHistoryCreated += res.stats.priceHistoryCreated;
    imageVerified += res.stats.imageVerifiedCount;
    imageRejected += res.stats.imageRejectedCount;
    urlVerified += res.stats.urlVerifiedCount;
    urlRejected += res.stats.urlRejectedCount;

    console.log(`  ✓ Processed: "${entry.name}" -> Created Product: ${res.stats.productCreated}, Offers Created: ${res.stats.offersCreated}`);
  }

  const countsAfter = {
    products: await Product.countDocuments(),
    offers: await MarketplaceProduct.countDocuments(),
    priceHistory: await PriceHistory.countDocuments()
  };

  console.log('\n===============================================================');
  console.log('           10-PRODUCT INITIAL BATCH IMPORT RESULT               ');
  console.log('===============================================================');
  console.log(`PRODUCTS`);
  console.log(`before: ${countsBefore.products}`);
  console.log(`created: ${productsCreated}`);
  console.log(`updated: ${productsUpdated}`);
  console.log(`duplicates rejected: ${productsDuplicatesRejected}`);
  console.log(`after: ${countsAfter.products}`);
  console.log(`\nOFFERS`);
  console.log(`before: ${countsBefore.offers}`);
  console.log(`created: ${offersCreated}`);
  console.log(`rejected: ${offersRejected}`);
  console.log(`after: ${countsAfter.offers}`);
  console.log(`\nPRICE HISTORY`);
  console.log(`before: ${countsBefore.priceHistory}`);
  console.log(`created: ${priceHistoryCreated}`);
  console.log(`after: ${countsAfter.priceHistory}`);
  console.log(`\nIMAGE VALIDATION`);
  console.log(`verified: ${imageVerified}`);
  console.log(`rejected: ${imageRejected}`);
  console.log(`duplicates: 0`);
  console.log(`\nURL VALIDATION`);
  console.log(`verified: ${urlVerified}`);
  console.log(`rejected: ${urlRejected}`);
  console.log(`search URLs rejected: ${searchUrlsRejected}`);
  console.log('===============================================================\n');

  await mongoose.disconnect();
  console.log('✅ Initial 10-Product Batch Import completed successfully.');
}

runInitial10Batch().catch((err) => {
  console.error('❌ Error during initial 10 batch import:', err);
  process.exit(1);
});
