import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isValidMarketplaceUrl } from '../utils/urlValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

function classifyUrl(url) {
  if (!url || typeof url !== 'string' || !isValidMarketplaceUrl(url)) {
    return 'INVALID_URL';
  }
  const lower = url.toLowerCase();
  if (lower.includes('search') || lower.includes('/s?') || lower.includes('?q=')) {
    return 'SEARCH_URL';
  }
  if (lower.includes('/dp/') || lower.includes('/product/') || lower.includes('/p/')) {
    return 'EXACT_PRODUCT_URL';
  }
  return 'UNKNOWN';
}

async function runPhase1Diagnostics() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB (Read-Only Phase 1 Diagnostics):', MONGODB_URI);

  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();
  const offers = await db.collection('marketplaceproducts').find({}).toArray();

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

  // Phase 1E: URL Classification
  const urlClassificationStats = {
    EXACT_PRODUCT_URL: 0,
    SEARCH_URL: 0,
    INVALID_URL: 0,
    UNKNOWN: 0
  };

  const amazonAsinList = [];
  const asinCounts = {};

  for (const off of offers) {
    const cls = classifyUrl(off.url);
    urlClassificationStats[cls] = (urlClassificationStats[cls] || 0) + 1;

    if (off.url && off.url.includes('amazon.in')) {
      const asinMatch = off.url.match(/\/dp\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        const asin = asinMatch[1].toUpperCase();
        asinCounts[asin] = (asinCounts[asin] || 0) + 1;
        amazonAsinList.push({
          offerId: off._id.toString(),
          productId: off.product ? off.product.toString() : null,
          asin,
          url: off.url
        });
      }
    }
  }

  const duplicateAsins = Object.entries(asinCounts)
    .filter(([_, count]) => count > 1)
    .map(([asin, count]) => ({ asin, count }));

  const urlClassificationReport = {
    timestamp: new Date().toISOString(),
    totalOffers: offers.length,
    classification: urlClassificationStats,
    amazonAsinCount: amazonAsinList.length,
    duplicateAsinCount: duplicateAsins.length,
    duplicateAsins
  };

  fs.writeFileSync(path.join(auditDir, 'phase1UrlClassification.json'), JSON.stringify(urlClassificationReport, null, 2));

  // Phase 1G: Product Identity Audit
  const productIdsSet = new Set(products.map(p => p._id.toString()));
  const productOfferCountMap = {};
  for (const p of products) productOfferCountMap[p._id.toString()] = 0;

  let orphanOffers = 0;
  let offersWithSearchUrls = 0;
  let invalidMarketplaceUrls = 0;

  for (const off of offers) {
    const pId = off.product ? off.product.toString() : null;
    if (!pId || !productIdsSet.has(pId)) {
      orphanOffers++;
    } else {
      productOfferCountMap[pId]++;
    }

    if (classifyUrl(off.url) === 'SEARCH_URL') offersWithSearchUrls++;
    if (classifyUrl(off.url) === 'INVALID_URL') invalidMarketplaceUrls++;
  }

  const productsWithZeroOffers = Object.values(productOfferCountMap).filter(c => c === 0).length;
  const productsWithMultipleOffers = Object.values(productOfferCountMap).filter(c => c > 1).length;

  let nullImageProducts = 0;
  let unsplashImageProducts = 0;
  let amazonCdnImageProducts = 0;

  for (const p of products) {
    if (!p.image) nullImageProducts++;
    else if (p.image.includes('unsplash.com')) unsplashImageProducts++;
    else if (p.image.includes('media-amazon.com') || p.image.includes('amazon.in')) amazonCdnImageProducts++;
  }

  const productIdentityReport = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    totalOffers: offers.length,
    orphanOffers,
    productsWithZeroOffers,
    productsWithMultipleOffers,
    offersWithSearchUrls,
    invalidMarketplaceUrls,
    amazonAsinListCount: amazonAsinList.length,
    duplicateAsinsCount: duplicateAsins.length,
    nullImageProducts,
    unsplashImageProducts,
    amazonCdnImageProducts
  };

  fs.writeFileSync(path.join(auditDir, 'phase1ProductIdentityAudit.json'), JSON.stringify(productIdentityReport, null, 2));

  console.log('\n========================================');
  console.log('PHASE 1E & 1G DIAGNOSTICS COMPLETED');
  console.log('========================================');
  console.log('URL Classification:', JSON.stringify(urlClassificationStats, null, 2));
  console.log(`Orphan Offers: ${orphanOffers}`);
  console.log(`Products with 0 Offers: ${productsWithZeroOffers}`);
  console.log(`Products with >1 Offers: ${productsWithMultipleOffers}`);
  console.log(`Duplicate ASINs: ${duplicateAsins.length}`);
  console.log('========================================\n');

  await mongoose.disconnect();
}

runPhase1Diagnostics().catch(err => {
  console.error('Phase 1 Diagnostics error:', err);
  process.exit(1);
});
