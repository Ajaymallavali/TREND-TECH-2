import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { Product } from '../server/src/models/Product.model.js';
import { Marketplace } from '../server/src/models/Marketplace.model.js';
import { MarketplaceProduct } from '../server/src/models/MarketplaceProduct.model.js';

async function runTrace() {
  await connectDB();

  const queries = ['Apple iPhone 16e', 'Samsung Galaxy S24 Ultra', 'Sony Bravia', 'Sony WH-1000XM5', 'Dell Inspiron'];

  for (const q of queries) {
    console.log(`\n=================== TRACE TEST: ${q} ===================`);
    const prods = await Product.find({ name: new RegExp(q, 'i') });
    console.log(`Found ${prods.length} product(s) matching "${q}":`);
    for (const p of prods) {
      const mps = await MarketplaceProduct.find({ product: p._id }).populate('marketplace');
      console.log(`\n  [PRODUCT RECORD]`);
      console.log(`  _id: ${p._id}`);
      console.log(`  name: "${p.name}"`);
      console.log(`  brand: "${p.brand}"`);
      console.log(`  category: "${p.category}"`);
      console.log(`  image: ${p.image || 'null'}`);
      console.log(`  imageStatus: ${p.imageStatus || 'undefined'}`);
      console.log(`  [MARKETPLACE OFFERS (${mps.length})]`);
      mps.forEach(mp => {
        console.log(`    └─ Store: ${mp.marketplace ? mp.marketplace.name : 'Unknown'}`);
        console.log(`       Price: ₹${mp.currentPrice}`);
        console.log(`       OriginalPrice: ${mp.originalPrice ? '₹' + mp.originalPrice : 'null'}`);
        console.log(`       URL: ${mp.url}`);
        console.log(`       SKU: ${mp.sku}`);
      });
    }
  }

  await disconnectDB();
}

runTrace().catch(err => {
  console.error('Trace error:', err);
  process.exit(1);
});
