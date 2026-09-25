import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { determineProductCategory, normalizeCategory, isUserFacingProductEligible } from '../utils/categoryMapper.js';
import { isValidMarketplaceUrl } from '../utils/urlValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function runAudit() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();
  const offers = await db.collection('marketplaceproducts').find({}).toArray();
  const marketplaces = await db.collection('marketplaces').find({}).toArray();

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  // 1. IMAGE DUPLICATION AUDIT (Phase 29)
  const imageMap = {};
  for (const p of products) {
    if (p.image && typeof p.image === 'string' && p.image.startsWith('http')) {
      const img = p.image.trim();
      if (!imageMap[img]) imageMap[img] = [];
      imageMap[img].push({
        _id: p._id.toString(),
        name: p.name,
        brand: p.brand,
        category: p.category
      });
    }
  }

  const duplicates = [];
  for (const [imageUrl, prods] of Object.entries(imageMap)) {
    if (prods.length > 1) {
      duplicates.push({
        imageUrl,
        count: prods.length,
        products: prods
      });
    }
  }

  const imageDuplicateReport = {
    timestamp: new Date().toISOString(),
    totalUniqueImages: Object.keys(imageMap).length,
    duplicateImageCount: duplicates.length,
    duplicates
  };

  fs.writeFileSync(path.join(auditDir, 'imageDuplicateReport.json'), JSON.stringify(imageDuplicateReport, null, 2));

  // 2. CATEGORY INTEGRITY AUDIT (Phase 30)
  const categoryStats = {};
  let validCategoryCount = 0;
  let misclassifiedCategoryCount = 0;
  let syntheticCount = 0;

  for (const p of products) {
    const isEligible = isUserFacingProductEligible(p);
    if (!isEligible) {
      syntheticCount++;
      continue;
    }

    const determined = determineProductCategory(p);
    const existingNorm = normalizeCategory(p.category);

    const catKey = determined || 'unknown';
    if (!categoryStats[catKey]) {
      categoryStats[catKey] = {
        category: catKey,
        totalProducts: 0,
        validProducts: 0,
        misclassifiedProducts: 0
      };
    }

    categoryStats[catKey].totalProducts++;

    if (determined === existingNorm) {
      categoryStats[catKey].validProducts++;
      validCategoryCount++;
    } else {
      categoryStats[catKey].misclassifiedProducts++;
      misclassifiedCategoryCount++;
    }
  }

  const categoryIntegrityReport = {
    timestamp: new Date().toISOString(),
    totalProductsScanned: products.length,
    eligibleProducts: products.length - syntheticCount,
    validCategoryCount,
    misclassifiedCategoryCount,
    syntheticCount,
    categoryBreakdown: Object.values(categoryStats)
  };

  fs.writeFileSync(path.join(auditDir, 'categoryIntegrityReport.json'), JSON.stringify(categoryIntegrityReport, null, 2));

  // 3. OFFER INTEGRITY AUDIT (Phase 31)
  const productIdsSet = new Set(products.map(p => p._id.toString()));
  const mpIdsSet = new Set(marketplaces.map(m => m._id.toString()));

  let validOffersCount = 0;
  let invalidOffersCount = 0;
  const invalidOfferDetails = [];

  for (const o of offers) {
    const pId = o.product ? o.product.toString() : null;
    const mId = o.marketplace ? o.marketplace.toString() : null;

    const hasValidProduct = pId && productIdsSet.has(pId);
    const hasValidMarketplace = mId && mpIdsSet.has(mId);
    const hasValidUrl = o.url && isValidMarketplaceUrl(o.url);
    const hasValidPrice = o.currentPrice && o.currentPrice > 0;

    if (hasValidProduct && hasValidMarketplace && hasValidUrl && hasValidPrice) {
      validOffersCount++;
    } else {
      invalidOffersCount++;
      invalidOfferDetails.push({
        _id: o._id.toString(),
        productId: pId,
        hasValidProduct,
        hasValidMarketplace,
        hasValidUrl,
        hasValidPrice,
        url: o.url,
        price: o.currentPrice
      });
    }
  }

  const offerIntegrityReport = {
    timestamp: new Date().toISOString(),
    totalOffersScanned: offers.length,
    validOffersCount,
    invalidOffersCount,
    invalidOfferDetails
  };

  fs.writeFileSync(path.join(auditDir, 'offerIntegrityReport.json'), JSON.stringify(offerIntegrityReport, null, 2));

  console.log('\n========================================');
  console.log('PHASE 29, 30, 31 — AUDIT REPORTS SUMMARY');
  console.log('========================================');
  console.log(`Image Duplicates Found: ${duplicates.length}`);
  console.log(`Category Integrities: Valid = ${validCategoryCount}, Misclassified Re-routed = ${misclassifiedCategoryCount}, Synthetic = ${syntheticCount}`);
  console.log(`Offer Integrities: Valid = ${validOffersCount}, Invalid = ${invalidOffersCount}`);
  console.log('========================================\n');

  await mongoose.disconnect();
}

runAudit().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
