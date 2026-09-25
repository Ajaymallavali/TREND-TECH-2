import mongoose from 'mongoose';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { VERIFIED_CATALOG_DATA } from '../data/verifiedCatalog.data.js';

async function testFuzzyMatching() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();

  const allCatalog = [...REAL_VERIFIED_CATALOG, ...VERIFIED_CATALOG_DATA].filter(
    c => c.name && c.image && !c.image.includes('unsplash.com')
  );

  const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  const getTokens = (s) => new Set(clean(s).split(/\s+/).filter(t => t.length > 1));

  let matchedCount = 0;
  let testOutput = [];

  for (const p of products) {
    let resolvedImg = p.image && !p.image.includes('unsplash.com') ? p.image : null;

    if (!resolvedImg) {
      const pTokens = getTokens(p.name);
      let bestMatch = null;
      let maxOverlap = 0;

      for (const catItem of allCatalog) {
        if (p.brand && catItem.brand && p.brand.toLowerCase() !== catItem.brand.toLowerCase()) continue;
        const cTokens = getTokens(catItem.name);
        let overlap = 0;
        for (const t of pTokens) {
          if (cTokens.has(t)) overlap++;
        }
        if (overlap > maxOverlap && overlap >= 2) {
          maxOverlap = overlap;
          bestMatch = catItem.image;
        }
      }

      if (bestMatch) {
        resolvedImg = bestMatch;
        matchedCount++;
      }
    }

    if (testOutput.length < 20 && resolvedImg && !resolvedImg.includes('unsplash.com')) {
      testOutput.push({ name: p.name, image: resolvedImg });
    }
  }

  console.log(`Matched & Resolved CDN Images: ${matchedCount} additional products`);
  console.log('Sample 20 Resolved Images:');
  testOutput.forEach((item, i) => console.log(`[${i+1}] ${item.name.padEnd(45)} -> ${item.image}`));

  await mongoose.disconnect();
}

testFuzzyMatching().catch(console.error);
