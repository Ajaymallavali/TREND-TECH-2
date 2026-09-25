import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { canonicalImageUrl } from '../server/src/services/imagePipeline.service.js';
import { computeImageSha256 } from '../server/src/services/imageDeduplicationGuard.service.js';

async function runFinalForensicAudit() {
  await connectDB();

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false }));
  const Marketplace = mongoose.model('Marketplace', new mongoose.Schema({}, { strict: false }));
  const PriceHistory = mongoose.model('PriceHistory', new mongoose.Schema({}, { strict: false }));

  console.log('--- A. DATABASE COUNTS ---');
  const prodCount = await Product.countDocuments();
  const mpCount = await MarketplaceProduct.countDocuments();
  const storeCount = await Marketplace.countDocuments();
  const phCount = await PriceHistory.countDocuments();
  console.log({ Products: prodCount, MarketplaceProducts: mpCount, Marketplaces: storeCount, PriceHistory: phCount });

  console.log('\n--- B. 50 RANDOM PRODUCT SAMPLING & SYNTHETIC CLASSIFICATION ---');
  const sample50 = await Product.find({}).limit(50);
  let syntheticCount = 0;
  let realCount = 0;
  
  sample50.forEach((p, idx) => {
    const isTemplateName = /^Smartphone\s+/i.test(p.name) || /^Laptop\s+/i.test(p.name) || /^Audio\s+/i.test(p.name) || p.name.includes('series') || p.name.includes('Pro Max Silicone Case');
    const isUnsplash = p.image && p.image.includes('unsplash.com');
    const isSynthetic = isTemplateName || isUnsplash || !p.imageStatus;
    
    if (isSynthetic) syntheticCount++; else realCount++;

    if (idx < 15) {
      console.log(`[P${idx+1}] ${p.name} | Brand: ${p.brand} | Category: ${p.category} | Class: ${isSynthetic ? 'SYNTHETIC' : 'REAL'}`);
    }
  });

  console.log(`Sample of 50 classification: Synthetic=${syntheticCount}, Real=${realCount}`);

  console.log('\n--- C. REPEATED PRICES ---');
  const p2999 = await MarketplaceProduct.countDocuments({ currentPrice: 2999 });
  const p8990 = await MarketplaceProduct.countDocuments({ currentPrice: 8990 });
  const p54900 = await MarketplaceProduct.countDocuments({ currentPrice: 54900 });
  console.log({ p2999, p8990, p54900 });

  console.log('\n--- D & E. 30 PRODUCT IMAGE TRACE & SHA-256 COLLISION ---');
  const sample30 = await Product.find({}).limit(30);
  const seenShaMap = new Map();
  let collisionCount = 0;

  for (const p of sample30) {
    const canonical = canonicalImageUrl(p.image);
    const sha = computeImageSha256(canonical);
    let classif = 'MISSING';
    if (p.image) {
      if (p.image.includes('unsplash.com')) classif = 'UNSPLASH';
      else if (p.image.includes('media-amazon.com')) classif = 'STATIC_AMAZON_CDN';
      else classif = 'GENERIC_IMAGE';
    }

    if (sha) {
      if (seenShaMap.has(sha)) {
        collisionCount++;
        console.log(`COLLISION: Product "${p.name}" shares SHA-256 hash ${sha.slice(0, 8)}... with "${seenShaMap.get(sha)}"`);
      } else {
        seenShaMap.set(sha, p.name);
      }
    }
  }

  console.log('\n--- F. MARKETPLACE URL & ASIN AUDIT ---');
  const mps = await MarketplaceProduct.find({});
  let searchUrls = 0;
  let generatedUrls = 0;
  let realDirectUrls = 0;
  let generatedAsins = 0;

  mps.forEach(mp => {
    const url = mp.url || '';
    const sku = mp.sku || '';

    if (url.includes('/search') || url.includes('/s?k=')) searchUrls++;
    else if (url.includes('/dp/B06A9904') || url.includes('/dp/B0')) generatedUrls++;
    else realDirectUrls++;

    if (sku.startsWith('ASIN-6A9904') || sku.startsWith('B06A9904')) generatedAsins++;
  });

  console.log({ totalOffers: mps.length, searchUrls, generatedUrls, realDirectUrls, generatedAsins });

  await disconnectDB();
}

runFinalForensicAudit().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
