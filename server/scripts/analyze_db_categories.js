import mongoose from 'mongoose';

async function analyzeAllProducts() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const products = await Product.find({});
  console.log('Total products:', products.length);

  // Group products by current DB category
  const groups = {};
  for (const p of products) {
    const c = p.category || 'NO_CATEGORY';
    if (!groups[c]) groups[c] = [];
    groups[c].push(p);
  }

  for (const [cat, list] of Object.entries(groups)) {
    console.log(`\n================ Category: "${cat}" (${list.length} products) ================`);
    // Print first 10 names
    list.slice(0, 10).forEach(p => {
      console.log(`  - [${p.brand}] "${p.name}"`);
    });
    if (list.length > 10) {
      console.log(`  ... and ${list.length - 10} more`);
    }
  }

  process.exit(0);
}

analyzeAllProducts().catch(console.error);
