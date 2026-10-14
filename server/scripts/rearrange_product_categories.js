import mongoose from 'mongoose';
import { resolveTrueCategoryAndBrand } from './test_complete_resolver.js';

async function rearrangeAllCategories() {
  console.log('🚀 Starting Category Realignment across all products in MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const products = await Product.find({});
  console.log(`Found ${products.length} products to evaluate.`);

  let updatedCount = 0;
  let smartphoneCount = 0;
  const categoryStats = {};

  for (const p of products) {
    const resolved = resolveTrueCategoryAndBrand(p);
    categoryStats[resolved.category] = (categoryStats[resolved.category] || 0) + 1;

    if (resolved.category === 'smartphone') {
      smartphoneCount++;
    }

    const needsUpdate = p.category !== resolved.category || (p.brand === 'UNKNOWN' && resolved.brand !== 'UNKNOWN');

    if (needsUpdate) {
      p.category = resolved.category;
      p.brand = resolved.brand;
      await p.save();
      updatedCount++;
    }
  }

  console.log(`\n Category Realignment Complete!`);
  console.log(`- Total Products In DB: ${products.length} (0 removed, 100% preserved)`);
  console.log(`- Products Updated with True Category & Brand: ${updatedCount}`);
  console.log(`- Smartphones Section Total: ${smartphoneCount} (Exclusively genuine mobile devices)`);
  console.log('\nFinal Category Breakdown:');
  console.table(categoryStats);

  process.exit(0);
}

rearrangeAllCategories().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
