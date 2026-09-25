import mongoose from 'mongoose';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { VERIFIED_CATALOG_DATA } from '../data/verifiedCatalog.data.js';

async function testCatalogResolution() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();

  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const catalogImageMap = new Map();
  [...REAL_VERIFIED_CATALOG, ...VERIFIED_CATALOG_DATA].forEach(item => {
    if (item.name && item.image && !item.image.includes('unsplash.com')) {
      catalogImageMap.set(normalize(item.name), item.image);
    }
  });

  console.log(`Source catalog has ${catalogImageMap.size} verified product image mappings.\n`);

  let resolvedCount = 0;
  let testSample = [];

  for (const p of products) {
    let finalImg = p.image;
    if (!finalImg || finalImg.includes('unsplash.com')) {
      const match = catalogImageMap.get(normalize(p.name));
      if (match) {
        finalImg = match;
        resolvedCount++;
      } else {
        finalImg = null;
      }
    }

    if (testSample.length < 15 && finalImg && !finalImg.includes('unsplash.com')) {
      testSample.push({ name: p.name, image: finalImg });
    }
  }

  console.log(`Products resolved to verified CDN images: ${resolvedCount} out of ${products.length}`);
  console.log('\nSample 15 Verified Product Images Resolved:');
  testSample.forEach((item, idx) => {
    console.log(`[${idx+1}] ${item.name.padEnd(45)} -> ${item.image}`);
  });

  await mongoose.disconnect();
}

testCatalogResolution().catch(console.error);
