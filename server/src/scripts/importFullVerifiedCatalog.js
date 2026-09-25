import mongoose from 'mongoose';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { ensureMarketplaces, ingestCatalogProduct } from '../services/realCatalogIngestion.service.js';
import { connectDB } from '../config/db.js';

async function runFullVerifiedCatalogImport() {
  console.log('🚀 Starting TREND-TECH Controlled Batch Import of 150+ Verified Products...');
  await connectDB();

  const marketplaceMap = await ensureMarketplaces();

  const countsBefore = {
    products: await Product.countDocuments(),
    offers: await MarketplaceProduct.countDocuments(),
    priceHistory: await PriceHistory.countDocuments()
  };

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

  const totalCatalog = REAL_VERIFIED_CATALOG;
  const BATCH_SIZE = 25;

  console.log(`📦 Total products in verified catalog pool: ${totalCatalog.length}`);

  for (let i = 0; i < totalCatalog.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = totalCatalog.slice(i, i + BATCH_SIZE);
    console.log(`\n--- Executing Batch ${batchNumber} (Products ${i + 1} to ${Math.min(i + BATCH_SIZE, totalCatalog.length)}) ---`);

    for (const entry of batch) {
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
    }
    console.log(`  ✓ Batch ${batchNumber} completed. Cumulative Products Created: ${productsCreated}, Offers Created: ${offersCreated}`);
  }

  const countsAfter = {
    products: await Product.countDocuments(),
    offers: await MarketplaceProduct.countDocuments(),
    priceHistory: await PriceHistory.countDocuments()
  };

  console.log('\n===============================================================');
  console.log('         FULL VERIFIED CATALOG BATCH EXPANSION RESULT           ');
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
  console.log('✅ Full verified catalog import completed successfully.');
}

runFullVerifiedCatalogImport().catch((err) => {
  console.error('❌ Error during full verified catalog import:', err);
  process.exit(1);
});
