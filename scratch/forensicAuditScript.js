import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../server/src/config/db.js';

async function runForensicAudit() {
  await connectDB();

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false }));
  const Marketplace = mongoose.model('Marketplace', new mongoose.Schema({}, { strict: false }));
  const PriceHistory = mongoose.model('PriceHistory', new mongoose.Schema({}, { strict: false }));

  console.log('--- SECTION 1: COLLECTION COUNTS ---');
  const prodCount = await Product.countDocuments();
  const mpCount = await MarketplaceProduct.countDocuments();
  const storeCount = await Marketplace.countDocuments();
  const phCount = await PriceHistory.countDocuments();
  console.log({ Products: prodCount, MarketplaceProducts: mpCount, Marketplaces: storeCount, PriceHistory: phCount });

  console.log('\n--- SECTION 2: SAMPLE 20 PRODUCTS ---');
  const prods = await Product.find({}).limit(20);
  prods.forEach((p, idx) => console.log(`P[${idx+1}]`, {
    _id: p._id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    image: p.image || 'null',
    source: p.source || 'FIELD DOES NOT EXIST',
    imageStatus: p.imageStatus || 'FIELD DOES NOT EXIST',
    sku: p.sku || 'FIELD DOES NOT EXIST',
    asin: p.asin || 'FIELD DOES NOT EXIST',
    externalId: p.externalId || 'FIELD DOES NOT EXIST'
  }));

  console.log('\n--- SECTION 3: SAMPLE 20 MARKETPLACE PRODUCTS & MISMATCH CHECK ---');
  const mps = await MarketplaceProduct.find({}).limit(20);
  let mismatchCount = 0;
  for (const mp of mps) {
    const p = await Product.findById(mp.product);
    console.log({
      mpId: mp._id,
      productIdRef: mp.product,
      productFoundName: p ? p.name : 'ORPHAN_NULL',
      sku: mp.sku || 'N/A',
      url: mp.url,
      currentPrice: mp.currentPrice,
      originalPrice: mp.originalPrice
    });
    if (!p) mismatchCount++;
  }
  console.log('Mismatch / Orphan count:', mismatchCount);

  console.log('\n--- SECTION 4: PRICE AUDIT ---');
  const price2999Count = await MarketplaceProduct.countDocuments({ currentPrice: 2999 });
  const price54900Count = await MarketplaceProduct.countDocuments({ currentPrice: 54900 });
  const price999Count = await MarketplaceProduct.countDocuments({ currentPrice: 999 });
  const price4999Count = await MarketplaceProduct.countDocuments({ currentPrice: 4999 });
  console.log({ price2999Count, price54900Count, price999Count, price4999Count });

  // Group by currentPrice to find all repeated prices > 10 occurrences
  const priceFreq = await MarketplaceProduct.aggregate([
    { $group: { _id: '$currentPrice', count: { $sum: 1 } } },
    { $match: { count: { $gt: 5 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('REPEATED PRICES (>5 occurrences):', priceFreq);

  console.log('\n--- SECTION 5: PRICE HISTORY AUDIT ---');
  const uniqueMpInHistory = await PriceHistory.distinct('marketplaceProduct');
  const phDates = await PriceHistory.aggregate([
    { $group: { _id: null, minDate: { $min: '$timestamp' }, maxDate: { $max: '$timestamp' } } }
  ]);
  console.log({ totalHistoryRecords: phCount, uniqueMarketplaceProducts: uniqueMpInHistory.length, dateRange: phDates });

  console.log('\n--- SECTION 6: IMAGE AUDIT ---');
  const nullImages = await Product.countDocuments({ $or: [{ image: null }, { image: '' }, { image: { $exists: false } }] });
  const unsplashImages = await Product.countDocuments({ image: { $regex: 'unsplash.com', $options: 'i' } });
  const amazonCdnImages = await Product.countDocuments({ image: { $regex: 'media-amazon.com', $options: 'i' } });
  
  // Calculate duplicate image URLs across products
  const imgUrlFreq = await Product.aggregate([
    { $match: { image: { $ne: null } } },
    { $group: { _id: '$image', count: { $sum: 1 }, sampleProductIds: { $push: '$_id' }, sampleNames: { $push: '$name' } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log({ nullImages, unsplashImages, amazonCdnImages, duplicateImageUrlGroups: imgUrlFreq.length });
  console.log('TOP DUPLICATE IMAGE GROUPS:');
  imgUrlFreq.slice(0, 5).forEach(g => console.log({ image: g._id, count: g.count, sampleNames: g.sampleNames.slice(0, 3) }));

  console.log('\n--- SECTION 7: CATEGORY DISTRIBUTION & CONTAMINATION ---');
  const catDist = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('CATEGORY DISTRIBUTION:', catDist);

  console.log('\n--- SECTION 8: RELATIONSHIP ORPHANS ---');
  const allMps = await MarketplaceProduct.find({});
  let orphanMps = 0;
  for (const mp of allMps) {
    const p = await Product.findById(mp.product);
    if (!p) orphanMps++;
  }
  const allPh = await PriceHistory.find({});
  let orphanPh = 0;
  for (const ph of allPh) {
    const mp = await MarketplaceProduct.findById(ph.marketplaceProduct);
    if (!mp) orphanPh++;
  }
  console.log({ orphanMarketplaceProducts: orphanMps, orphanPriceHistory: orphanPh });

  await disconnectDB();
}

runForensicAudit().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
