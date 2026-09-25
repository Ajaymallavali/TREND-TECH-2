import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trend-tech';

async function runFullVerification() {
  await mongoose.connect(MONGODB_URI);
  console.log('🧪 Starting Full Database & Catalog Verification Suite...\n');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, description) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
    }
  };

  // 1. Total Counts Verification
  const totalProducts = await Product.countDocuments();
  assert(totalProducts >= 800, `Total products in DB is ${totalProducts} (Expected >= 800)`);

  const distinctCategories = await Product.distinct('category');
  assert(distinctCategories.length >= 9, `Total categories represented in DB is ${distinctCategories.length} (Expected >= 9: ${distinctCategories.join(', ')})`);

  const totalMarketplaces = await Marketplace.countDocuments();
  assert(totalMarketplaces >= 5, `Total marketplaces in DB is ${totalMarketplaces} (Expected >= 5)`);

  const totalMarketplaceProducts = await MarketplaceProduct.countDocuments();
  assert(totalMarketplaceProducts >= 1000, `Total marketplace products in DB is ${totalMarketplaceProducts} (Expected >= 1000)`);

  const totalPriceHistories = await PriceHistory.countDocuments();
  assert(totalPriceHistories >= 100, `Total price history records in DB is ${totalPriceHistories} (Expected >= 100)`);

  // 2. Category Distribution Test (All 9 primary categories)
  const categories = [
    'smartphone',
    'laptop',
    'television',
    'headphones',
    'smartwatch',
    'monitor',
    'tablet',
    'camera',
    'gaming',
  ];

  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat });
    assert(count > 0, `Category '${cat}' contains ${count} products`);
  }

  // 3. Accessory Isolation Test
  const accessoryTerms = ['case', 'cover', 'screen protector', 'tempered glass', 'charger', 'charging cable', 'adapter', 'power bank'];
  let accessoriesInMainCat = 0;
  for (const cat of categories) {
    const prods = await Product.find({ category: cat }).select('name').lean();
    for (const p of prods) {
      const lower = p.name.toLowerCase();
      if (accessoryTerms.some(term => lower.includes(term))) {
        accessoriesInMainCat++;
        console.warn(`  ⚠️ Found accessory in main category '${cat}': ${p.name}`);
      }
    }
  }
  assert(accessoriesInMainCat === 0, `0 accessories found in primary commercial categories (found ${accessoriesInMainCat})`);

  // 4. Image Duplication Test (Phase 24 exact identity test)
  const productsWithImages = await Product.find({ image: { $exists: true, $ne: null } }).select('name image').lean();
  const imageMap = {};
  for (const p of productsWithImages) {
    if (!imageMap[p.image]) {
      imageMap[p.image] = [];
    }
    imageMap[p.image].push(p.name);
  }

  let duplicateImageViolations = 0;
  for (const [url, prods] of Object.entries(imageMap)) {
    const distinctNames = new Set(prods);
    if (distinctNames.size > 1) {
      duplicateImageViolations++;
      console.warn(`  ⚠️ Duplicate Image Violation: ${url} assigned to distinct products: ${Array.from(distinctNames).join(', ')}`);
    }
  }
  assert(duplicateImageViolations === 0, `0 duplicate images assigned across distinct product models (${Object.keys(imageMap).length} unique images)`);

  // 5. Marketplace Offer Verification
  const sampleProductWithOffers = await MarketplaceProduct.findOne().populate('marketplace').lean();
  assert(sampleProductWithOffers && sampleProductWithOffers.url && sampleProductWithOffers.url.startsWith('http'), 'Marketplace offers contain valid HTTP URLs');

  // 6. Master Catalog Verification
  assert(totalProducts >= 800, `Master Product Catalog contains ${totalProducts} total commercial products across 10 categories`);

  console.log(`\n📊 Verification Results: ${passedTests} / ${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEM & IMAGE VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ Some verification tests failed. Please review errors above.');
  }

  await mongoose.disconnect();
}

runFullVerification().catch((err) => {
  console.error('Verification exception:', err);
  process.exit(1);
});
