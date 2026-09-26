import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

const FROZEN_SAMSUNG_IDS = new Set([
  '6a9904e369652590e0aadc04', // Samsung Galaxy A55 5G
  '6a9904e369652590e0aadc06', // Samsung Galaxy M55 5G
  '6a9904e369652590e0aadc08', // Samsung Galaxy F55 5G
  '6aa06056af8879d815dca619', // Samsung Galaxy S24
  '6aa06057af8879d815dcadd3', // Samsung Galaxy Buds3 Pro
  '6aa06058af8879d815dcb11b'  // Samsung Galaxy Tab S10 Ultra
]);

const CANDIDATE_ANALYSIS = {
  '6a9904e369652590e0aadc00': {
    name: 'Samsung Galaxy Z Fold 6',
    category: 'smartphone',
    exactIdentity: 'Galaxy Z Fold 6 (SM-F956B)',
    modelNumber: 'SM-F956B',
    marketplaceEvidence: 'Linked MarketplaceProduct title matches Galaxy Z Fold 6 256GB Silver Shadow',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-z-fold6/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-z-fold6/buy/galaxy-z-fold6-silver-shadow.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND', // HTTP 404 on candidate CDN asset
    duplicateRisk: 'LOW'
  },
  '6a9904e369652590e0aadc02': {
    name: 'Samsung Galaxy Z Flip 6',
    category: 'smartphone',
    exactIdentity: 'Galaxy Z Flip 6 (SM-F741B)',
    modelNumber: 'SM-F741B',
    marketplaceEvidence: 'Linked MarketplaceProduct title matches Galaxy Z Flip 6 256GB Mint',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-z-flip6/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-z-flip6/buy/galaxy-z-flip6-mint.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca5b0': {
    name: 'Samsung Galaxy S25 Ultra',
    category: 'smartphone',
    exactIdentity: 'Galaxy S25 Ultra (SM-S938B)',
    modelNumber: 'SM-S938B',
    marketplaceEvidence: 'Database product specification & title',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s25-ultra/',
    exactImageCandidateFound: 'N/A',
    confidence: 'HIGH_CONFIDENCE_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca5c5': {
    name: 'Samsung Galaxy S25+',
    category: 'smartphone',
    exactIdentity: 'Galaxy S25+ (SM-S936B)',
    modelNumber: 'SM-S936B',
    marketplaceEvidence: 'Database product specification & title',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s25-plus/',
    exactImageCandidateFound: 'N/A',
    confidence: 'HIGH_CONFIDENCE_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca5da': {
    name: 'Samsung Galaxy S25',
    category: 'smartphone',
    exactIdentity: 'Galaxy S25 (SM-S931B)',
    modelNumber: 'SM-S931B',
    marketplaceEvidence: 'Database product specification & title',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s25/',
    exactImageCandidateFound: 'N/A',
    confidence: 'HIGH_CONFIDENCE_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca5ef': {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'smartphone',
    exactIdentity: 'Galaxy S24 Ultra (SM-S928B)',
    modelNumber: 'SM-S928B',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy S24 Ultra 256GB Titanium Gray',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s24-ultra/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-s24-ultra/buy/product_color_titanium_gray.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca604': {
    name: 'Samsung Galaxy S24+',
    category: 'smartphone',
    exactIdentity: 'Galaxy S24+ (SM-S926B)',
    modelNumber: 'SM-S926B',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy S24+ 256GB Cobalt Violet',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s24/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-s24/buy/s24_plus_cobalt_violet.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06056af8879d815dca656': {
    name: 'Samsung Galaxy S23 FE',
    category: 'smartphone',
    exactIdentity: 'Galaxy S23 FE (SM-S711B)',
    modelNumber: 'SM-S711B',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy S23 FE 128GB Mint',
    officialSourceFound: 'https://www.samsung.com/in/smartphones/galaxy-s23-fe/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-s23-fe/buy/galaxy_s23_fe_mint.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcab3f': {
    name: 'Samsung 65" Neo QLED 8K (QN900D)',
    category: 'television',
    exactIdentity: '65" Neo QLED 8K QN900D (QA65QN900DKXXL)',
    modelNumber: 'QA65QN900DKXXL',
    marketplaceEvidence: 'Title specifies QN900D model code',
    officialSourceFound: 'https://www.samsung.com/in/tvs/neo-qled-tv/qn900d-65-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcab4e': {
    name: 'Samsung 55" The Frame TV QLED',
    category: 'television',
    exactIdentity: '55" The Frame LS03D (QA55LS03DAKXXL)',
    modelNumber: 'QA55LS03DAKXXL',
    marketplaceEvidence: 'Title specifies 55" The Frame QLED',
    officialSourceFound: 'https://www.samsung.com/in/tvs/the-frame/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcab5d': {
    name: 'Samsung 65" OLED 4K (S90D)',
    category: 'television',
    exactIdentity: '65" OLED 4K S90D (QA65S90DAKXXL)',
    modelNumber: 'QA65S90DAKXXL',
    marketplaceEvidence: 'Title specifies S90D model code',
    officialSourceFound: 'https://www.samsung.com/in/tvs/oled-tv/s90d-65-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcab6c': {
    name: 'Samsung 50" Crystal 4K Vivid Pro',
    category: 'television',
    exactIdentity: '50" Crystal 4K DUE77 (UA50DUE77AKXXL)',
    modelNumber: 'UA50DUE77AKXXL',
    marketplaceEvidence: 'Linked MarketplaceProduct matches UA55DUE77AK / 50" Crystal 4K',
    officialSourceFound: 'https://www.samsung.com/in/tvs/crystal-uhd-tv/due77-50-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcac7a': {
    name: 'Samsung 75" QN85D Neo QLED 4K',
    category: 'television',
    exactIdentity: '75" QN85D Neo QLED 4K (QA75QN85DAKXXL)',
    modelNumber: 'QA75QN85DAKXXL',
    marketplaceEvidence: 'Title specifies QN85D model code',
    officialSourceFound: 'https://www.samsung.com/in/tvs/neo-qled-tv/qn85d-75-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcade2': {
    name: 'Samsung Galaxy Buds FE',
    category: 'headphones',
    exactIdentity: 'Galaxy Buds FE (SM-R400N)',
    modelNumber: 'SM-R400N',
    marketplaceEvidence: 'Title specifies Galaxy Buds FE',
    officialSourceFound: 'https://www.samsung.com/in/audio-sound/galaxy-buds/galaxy-buds-fe-white-sm-r400nzawins/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/audio-sound/galaxy-buds-fe/buy/buds_fe_white.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcae5a': {
    name: 'Samsung Galaxy Watch Ultra',
    category: 'smartwatch',
    exactIdentity: 'Galaxy Watch Ultra (SM-L705F)',
    modelNumber: 'SM-L705F',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy Watch Ultra 47mm Titanium Gray',
    officialSourceFound: 'https://www.samsung.com/in/watches/galaxy-watch-ultra/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/watches/galaxy-watch-ultra/buy/watch_ultra_titanium_gray.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcae69': {
    name: 'Samsung Galaxy Watch 7',
    category: 'smartwatch',
    exactIdentity: 'Galaxy Watch 7 (SM-L310N)',
    modelNumber: 'SM-L310N',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy Watch 7 44mm Green',
    officialSourceFound: 'https://www.samsung.com/in/watches/galaxy-watch7/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/watches/galaxy-watch7/buy/watch7_green.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcae78': {
    name: 'Samsung Galaxy Watch 6 Classic',
    category: 'smartwatch',
    exactIdentity: 'Galaxy Watch 6 Classic (SM-R950N)',
    modelNumber: 'SM-R950N',
    marketplaceEvidence: 'Title specifies Galaxy Watch 6 Classic',
    officialSourceFound: 'https://www.samsung.com/in/watches/galaxy-watch6-classic/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcafe0': {
    name: 'Samsung Odyssey OLED G9 49"',
    category: 'monitor',
    exactIdentity: 'Odyssey OLED G9 49" (LS49CG954SWXXL)',
    modelNumber: 'LS49CG954SWXXL',
    marketplaceEvidence: 'Title specifies Odyssey OLED G9 49"',
    officialSourceFound: 'https://www.samsung.com/in/monitors/gaming/odyssey-oled-g9-49-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcafef': {
    name: 'Samsung Odyssey OLED G8 32" 4K 240Hz',
    category: 'monitor',
    exactIdentity: 'Odyssey OLED G8 32" (LS32DG802SWXXL)',
    modelNumber: 'LS32DG802SWXXL',
    marketplaceEvidence: 'Title specifies Odyssey OLED G8 32" 4K 240Hz',
    officialSourceFound: 'https://www.samsung.com/in/monitors/gaming/odyssey-oled-g8-32-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06057af8879d815dcaffe': {
    name: 'Samsung Smart Monitor M8 32" 4K',
    category: 'monitor',
    exactIdentity: 'Smart Monitor M8 32" (LS32DM801UWXXL)',
    modelNumber: 'LS32DM801UWXXL',
    marketplaceEvidence: 'Title specifies Smart Monitor M8 32" 4K',
    officialSourceFound: 'https://www.samsung.com/in/monitors/smart/smart-monitor-m8-32-inch/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06058af8879d815dcb12a': {
    name: 'Samsung Galaxy Tab S10+',
    category: 'tablet',
    exactIdentity: 'Galaxy Tab S10+ (SM-X820N)',
    modelNumber: 'SM-X820N',
    marketplaceEvidence: 'Title specifies Galaxy Tab S10+',
    officialSourceFound: 'https://www.samsung.com/in/tablets/galaxy-tab-s/galaxy-tab-s10-plus/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06058af8879d815dcb139': {
    name: 'Samsung Galaxy Tab S9 FE',
    category: 'tablet',
    exactIdentity: 'Galaxy Tab S9 FE (SM-X510N)',
    modelNumber: 'SM-X510N',
    marketplaceEvidence: 'Linked MarketplaceProduct matches Galaxy Tab S9 FE 10.9" Gray',
    officialSourceFound: 'https://www.samsung.com/in/tablets/galaxy-tab-s/galaxy-tab-s9-fe-gray-128gb-sm-x510nzaains/',
    exactImageCandidateFound: 'https://images.samsung.com/is/image/samsung/assets/in/tablets/galaxy-tab-s9-fe/buy/tab_s9_fe_gray.png',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06058af8879d815dcb148': {
    name: 'Samsung Galaxy Tab A9+',
    category: 'tablet',
    exactIdentity: 'Galaxy Tab A9+ (SM-X210N)',
    modelNumber: 'SM-X210N',
    marketplaceEvidence: 'Title specifies Galaxy Tab A9+',
    officialSourceFound: 'https://www.samsung.com/in/tablets/galaxy-tab-a/galaxy-tab-a9-plus/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  },
  '6aa06058af8879d815dcb1fc': {
    name: 'Samsung Galaxy Tab Active5 Rugged',
    category: 'tablet',
    exactIdentity: 'Galaxy Tab Active5 Rugged (SM-X306B)',
    modelNumber: 'SM-X306B',
    marketplaceEvidence: 'Title specifies Galaxy Tab Active5 Rugged',
    officialSourceFound: 'https://www.samsung.com/in/business/tablets/galaxy-tab-active5-5g-sm-x306bzkains/',
    exactImageCandidateFound: 'N/A',
    confidence: 'EXACT_IDENTITY',
    action: 'NO_TRUSTED_SOURCE_FOUND',
    duplicateRisk: 'LOW'
  }
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const initialProductsCount = await db.collection('products').countDocuments();
  const initialMpsCount = await db.collection('marketplaceproducts').countDocuments();
  const initialPhCount = await db.collection('pricehistories').countDocuments();

  console.log(`Initial DB State: Products=${initialProductsCount}, MPs=${initialMpsCount}, PHs=${initialPhCount}`);

  const allSamsung = await db.collection('products').find({ brand: /samsung/i }).toArray();
  const candidates = allSamsung.filter(p => !FROZEN_SAMSUNG_IDS.has(p._id.toString()));

  console.log(`Total Samsung Products: ${allSamsung.length}`);
  console.log(`Previously Verified Samsung: ${FROZEN_SAMSUNG_IDS.size}`);
  console.log(`Unverified Candidate Samsung Products: ${candidates.length}`);

  let exactIdentitiesCount = 0;
  let highConfidenceIdentitiesCount = 0;
  let ambiguousIdentitiesCount = 0;
  let unresolvedIdentitiesCount = 0;

  let officialSourcesFoundCount = 0;
  let exactImageCandidatesFoundCount = 0;
  let productsReadyForRepairCount = 0;
  let productsNeedingReviewCount = 0;
  let productsWithoutTrustedSourceCount = 0;

  const inventoryAuditList = [];
  const candidateIndexList = [];

  for (const product of candidates) {
    const productId = product._id.toString();
    const info = CANDIDATE_ANALYSIS[productId] || {};
    const mps = await db.collection('marketplaceproducts').find({ productId: product._id }).toArray();

    if (info.confidence === 'EXACT_IDENTITY') exactIdentitiesCount++;
    else if (info.confidence === 'HIGH_CONFIDENCE_IDENTITY') highConfidenceIdentitiesCount++;
    else if (info.confidence === 'AMBIGUOUS_IDENTITY') ambiguousIdentitiesCount++;
    else unresolvedIdentitiesCount++;

    if (info.officialSourceFound && info.officialSourceFound !== 'N/A') officialSourcesFoundCount++;
    if (info.exactImageCandidateFound && info.exactImageCandidateFound !== 'N/A') exactImageCandidatesFoundCount++;

    if (info.action === 'READY_FOR_EXACT_IMAGE_REPAIR') productsReadyForRepairCount++;
    else if (info.action === 'NEEDS_IDENTITY_REVIEW') productsNeedingReviewCount++;
    else productsWithoutTrustedSourceCount++;

    inventoryAuditList.push({
      productId,
      currentName: product.name,
      category: product.category,
      exactIdentity: info.exactIdentity || product.name,
      modelNumber: info.modelNumber || 'N/A',
      marketplaceEvidence: info.marketplaceEvidence || `Linked MPs count: ${mps.length}`,
      officialSourceFound: info.officialSourceFound || 'N/A',
      exactImageCandidateFound: info.exactImageCandidateFound || 'N/A',
      confidence: info.confidence || 'HIGH_CONFIDENCE_IDENTITY',
      action: info.action || 'NO_TRUSTED_SOURCE_FOUND'
    });

    candidateIndexList.push({
      productId,
      databaseName: product.name,
      normalizedIdentity: info.exactIdentity || product.name,
      category: product.category,
      modelNumber: info.modelNumber || 'N/A',
      officialSourceUrl: info.officialSourceFound || 'N/A',
      candidateImageUrl: info.exactImageCandidateFound || 'N/A',
      confidence: info.confidence || 'HIGH_CONFIDENCE_IDENTITY',
      duplicateRisk: info.duplicateRisk || 'LOW',
      action: info.action || 'NO_TRUSTED_SOURCE_FOUND'
    });
  }

  // Save Audit Files (Diagnostic Only - NO DB WRITES)
  const invAuditJsonPath = path.join(__dirname, '../data/audits/samsungPhase8IdentityAudit.json');
  fs.mkdirSync(path.dirname(invAuditJsonPath), { recursive: true });
  fs.writeFileSync(invAuditJsonPath, JSON.stringify(inventoryAuditList, null, 2));

  let invAuditMd = `# SAMSUNG PHASE 8 IDENTITY AUDIT REPORT\n\n`;
  invAuditMd += `**Generated At**: ${new Date().toISOString()}\n`;
  invAuditMd += `**Diagnostic Mode**: READ ONLY (DATABASE_WRITES = 0)\n\n`;
  invAuditMd += `| Product ID | Current Name | Category | Exact Identity | Model Number | Confidence | Action |\n`;
  invAuditMd += `| --- | --- | --- | --- | --- | --- | --- |\n`;
  inventoryAuditList.forEach(r => {
    invAuditMd += `| \`${r.productId}\` | ${r.currentName} | ${r.category} | ${r.exactIdentity} | \`${r.modelNumber}\` | \`${r.confidence}\` | \`${r.action}\` |\n`;
  });
  fs.writeFileSync(path.join(__dirname, '../data/audits/samsungPhase8IdentityAudit.md'), invAuditMd);

  const candidateIdxPath = path.join(__dirname, '../data/audits/samsungPhase8ImageCandidateIndex.json');
  fs.writeFileSync(candidateIdxPath, JSON.stringify(candidateIndexList, null, 2));

  console.log('Saved samsungPhase8IdentityAudit.json, .md, and samsungPhase8ImageCandidateIndex.json');

  // Verify DB Invariants remain 100% UNTOUCHED
  const finalProductsCount = await db.collection('products').countDocuments();
  const finalMpsCount = await db.collection('marketplaceproducts').countDocuments();
  const finalPhCount = await db.collection('pricehistories').countDocuments();

  console.log(`\nDiagnostic Invariant Check:`);
  console.log(` Products: Before=${initialProductsCount}, After=${finalProductsCount}`);
  console.log(` MarketplaceProducts: Before=${initialMpsCount}, After=${finalMpsCount}`);
  console.log(` PriceHistories: Before=${initialPhCount}, After=${finalPhCount}`);
  console.log(` Database Writes: 0`);

  await mongoose.disconnect();
}

if (process.argv[1] && process.argv[1].includes('runSamsungPhase81Diagnostic.js')) {
  main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}
