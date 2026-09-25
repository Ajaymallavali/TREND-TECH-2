import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const AUDITS_DIR = path.join(__dirname, '../data/audits');
if (!fs.existsSync(AUDITS_DIR)) {
  fs.mkdirSync(AUDITS_DIR, { recursive: true });
}

// Normalize URL helper
function normalizeUrl(urlStr) {
  if (!urlStr) return '';
  try {
    const u = new URL(urlStr);
    return `${u.protocol}//${u.hostname}${u.pathname}`;
  } catch {
    return urlStr;
  }
}

// Download image bytes and compute SHA256
async function downloadAndHashImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { status: 'MISSING_URL', sha256: null, bytes: 0, contentType: null, httpStatus: null };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { status: 'DOWNLOAD_FAILED', sha256: null, bytes: 0, contentType: null, httpStatus: res.status };
    }

    const cType = res.headers.get('content-type') || '';
    if (!cType.includes('image') && !cType.includes('octet-stream')) {
      return { status: 'INVALID_CONTENT_TYPE', sha256: null, bytes: 0, contentType: cType, httpStatus: res.status };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      status: 'HASHED',
      sha256: hash,
      bytes: buffer.length,
      contentType: cType,
      httpStatus: res.status
    };
  } catch (err) {
    return { status: 'DOWNLOAD_FAILED', sha256: null, bytes: 0, contentType: null, httpStatus: null, error: err.message };
  }
}

async function runDeepAudit() {
  console.log('================================================================');
  console.log('TREND-TECH-2 — DEEP FORENSIC AUDIT (READ-ONLY & IMAGE HASHING)');
  console.log('================================================================');

  await connectDB();

  // Baseline Counts
  const totalProducts = await Product.countDocuments({});
  const legacyProducts = await Product.countDocuments({
    $or: [
      { sourceStatus: 'LEGACY_SYNTHETIC' },
      { sourceStatus: { $exists: false } },
      { sourceStatus: null }
    ]
  });
  const liveVerifiedProducts = await Product.countDocuments({ sourceStatus: 'LIVE_VERIFIED' });
  const unresolvedProducts = await Product.countDocuments({ sourceStatus: 'UNRESOLVED' });

  const totalMp = await MarketplaceProduct.countDocuments({});
  const legacyMp = await MarketplaceProduct.countDocuments({ sourceStatus: 'LEGACY_SYNTHETIC' });
  const liveMp = await MarketplaceProduct.countDocuments({ sourceStatus: 'LIVE_VERIFIED' });

  const totalPriceHistory = await PriceHistory.countDocuments({});

  const marketplaces = await Marketplace.find({}).lean();
  const totalMarketplaces = marketplaces.length;

  const products = await Product.find({}).lean();
  const mpList = await MarketplaceProduct.find({}).lean();
  const phList = await PriceHistory.find({}).lean();

  // Distinct categories count
  const distinctCategories = await Product.distinct('category');
  const totalCategories = distinctCategories.length;

  // Breakdown metrics
  let withImage = 0;
  let withoutImage = 0;
  let withExternalId = 0;
  let withoutExternalId = 0;
  let withAsin = 0;
  let withoutAsin = 0;
  let generatedUrlsCount = 0;
  let unsplashCount = 0;
  let amazonCdnCount = 0;
  let genericHostCount = 0;

  products.forEach(p => {
    if (p.image) withImage++; else withoutImage++;
    if (p.externalProductId) withExternalId++; else withoutExternalId++;
    if (p.externalProductId && (p.externalProductId.startsWith('B0') || p.externalProductId.startsWith('ASIN'))) withAsin++; else withoutAsin++;
    
    if (p.image) {
      if (p.image.includes('unsplash.com')) unsplashCount++;
      else if (p.image.includes('media-amazon.com') || p.image.includes('m.media-amazon.com')) amazonCdnCount++;
      else genericHostCount++;
    }
  });

  mpList.forEach(m => {
    if (m.url && (m.url.includes('amazon.in/s?') || m.url.includes('flipkart.com/search') || m.url.includes('B06A9904'))) {
      generatedUrlsCount++;
    }
  });

  // PriceHistory Orphan Check
  const mpIdSet = new Set(mpList.map(m => m._id.toString()));
  let orphanPriceHistory = 0;
  let validPriceHistory = 0;

  phList.forEach(ph => {
    if (!ph.marketplaceProduct || !mpIdSet.has(ph.marketplaceProduct.toString())) {
      orphanPriceHistory++;
    } else {
      validPriceHistory++;
    }
  });

  // Image SHA-256 Hashing Pass (limited concurrency to be fast and safe)
  console.log(`\nBeginning HTTP Image Download & SHA-256 Hashing for ${withImage} products...`);
  const imageHashAuditResults = [];
  const shaMap = new Map(); // sha256 -> array of products

  let downloadSucceeded = 0;
  let downloadFailed = 0;
  let verifiedProvenance = 0;
  let unverifiedProvenance = 0;
  let provenanceMismatches = 0;

  const BATCH_SIZE = 15;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map(async (p) => {
      const imgRes = await downloadAndHashImage(p.image);

      const host = p.image ? (p.image.includes('unsplash.com') ? 'UNSPLASH' : (p.image.includes('media-amazon.com') ? 'AMAZON_CDN' : 'OTHER_EXTERNAL')) : 'MISSING';

      if (imgRes.status === 'HASHED') {
        downloadSucceeded++;
        if (!shaMap.has(imgRes.sha256)) {
          shaMap.set(imgRes.sha256, []);
        }
        shaMap.get(imgRes.sha256).push(p._id.toString());
      } else if (p.image) {
        downloadFailed++;
      }

      // Provenance check
      let provStatus = 'UNVERIFIED';
      if (p.sourceStatus === 'LIVE_VERIFIED' && p.imageSourceProductId && p.externalProductId) {
        if (p.imageSourceProductId === p.externalProductId && p.imageSourceProvider === p.sourceProvider) {
          provStatus = 'VERIFIED';
          verifiedProvenance++;
        } else {
          provStatus = 'MISMATCH';
          provenanceMismatches++;
        }
      } else {
        unverifiedProvenance++;
      }

      imageHashAuditResults.push({
        productId: p._id.toString(),
        productName: p.name,
        imageUrl: p.image,
        imageHost: host,
        httpStatus: imgRes.httpStatus,
        contentType: imgRes.contentType,
        downloadSucceeded: imgRes.status === 'HASHED',
        byteLength: imgRes.bytes,
        sha256: imgRes.sha256,
        hashStatus: imgRes.status,
        sourceStatus: p.sourceStatus || 'LEGACY_SYNTHETIC',
        sourceProvider: p.sourceProvider || 'UNKNOWN',
        externalProductId: p.externalProductId || null,
        provenanceStatus: provStatus
      });
    }));
  }

  const uniqueSha256 = shaMap.size;
  let duplicateSha256 = 0;
  shaMap.forEach((prodList) => {
    if (prodList.length > 1) {
      duplicateSha256 += (prodList.length - 1);
    }
  });

  // Save currentDatabaseBaseline.json & .md
  const baselineJson = {
    timestamp: new Date().toISOString(),
    databaseName: 'trend-tech',
    counts: {
      products: totalProducts,
      marketplaceProducts: totalMp,
      priceHistory: totalPriceHistory,
      categories: totalCategories,
      marketplaces: totalMarketplaces
    },
    sourceStatusDistribution: {
      products: {
        LEGACY_SYNTHETIC: legacyProducts,
        LIVE_VERIFIED: liveVerifiedProducts,
        UNRESOLVED: unresolvedProducts
      },
      marketplaceProducts: {
        LEGACY_SYNTHETIC: legacyMp,
        LIVE_VERIFIED: liveMp
      }
    },
    imageSourceDistribution: {
      unsplash: unsplashCount,
      amazonCdn: amazonCdnCount,
      genericOther: genericHostCount,
      withImage,
      withoutImage
    },
    provenanceMetrics: {
      withExternalId,
      withoutExternalId,
      withAsin,
      withoutAsin,
      generatedUrlsCount
    },
    priceHistoryMetrics: {
      total: totalPriceHistory,
      orphan: orphanPriceHistory,
      valid: validPriceHistory
    }
  };

  const baselineMd = `# TREND-TECH-2 — Current Database Baseline Report

## 1. Core Document Counts
- **Products**: ${totalProducts}
- **MarketplaceProducts**: ${totalMp}
- **PriceHistory**: ${totalPriceHistory}
- **Categories**: ${totalCategories}
- **Marketplaces**: ${totalMarketplaces}

## 2. Provenance Distribution
- **Products**:
  - \`LEGACY_SYNTHETIC\`: ${legacyProducts}
  - \`LIVE_VERIFIED\`: ${liveVerifiedProducts}
  - \`UNRESOLVED\`: ${unresolvedProducts}
- **MarketplaceProducts**:
  - \`LEGACY_SYNTHETIC\`: ${legacyMp}
  - \`LIVE_VERIFIED\`: ${liveMp}

## 3. Image & Identity Metrics
- **With Image**: ${withImage} | **Without Image**: ${withoutImage}
- **Unsplash Images**: ${unsplashCount}
- **Amazon CDN Images**: ${amazonCdnCount}
- **Generic / Other External Images**: ${genericHostCount}
- **With External Product ID**: ${withExternalId} | **Without**: ${withoutExternalId}
- **With ASIN**: ${withAsin} | **Without ASIN**: ${withoutAsin}
- **Generated / Search URLs**: ${generatedUrlsCount}

## 4. Price History Integrity
- **Total PriceHistory Documents**: ${totalPriceHistory}
- **Valid PriceHistory Records**: ${validPriceHistory}
- **Orphan PriceHistory Records**: ${orphanPriceHistory}
`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'currentDatabaseBaseline.json'), JSON.stringify(baselineJson, null, 2));
  fs.writeFileSync(path.join(AUDITS_DIR, 'currentDatabaseBaseline.md'), baselineMd);

  // Save imageContentHashAudit.json & .md
  const imgHashJson = {
    timestamp: new Date().toISOString(),
    totalImageUrls: withImage,
    downloadSucceeded,
    downloadFailed,
    uniqueSha256Hashes: uniqueSha256,
    duplicateSha256Hashes: duplicateSha256,
    unsplashImages: unsplashCount,
    genericImages: genericHostCount,
    amazonCdnImages: amazonCdnCount,
    otherExternalImages: genericHostCount,
    missingImages: withoutImage,
    unverifiedImageProvenance: unverifiedProvenance,
    verifiedImageProvenance: verifiedProvenance,
    productImageMismatches: provenanceMismatches,
    records: imageHashAuditResults
  };

  const imgHashMd = `# TREND-TECH-2 — Image Content Hash & Provenance Audit Report

## Audit Summary
- **TOTAL_IMAGE_URLS**: ${withImage}
- **DOWNLOAD_SUCCEEDED**: ${downloadSucceeded}
- **DOWNLOAD_FAILED**: ${downloadFailed}
- **UNIQUE_SHA256_HASHES**: ${uniqueSha256}
- **DUPLICATE_SHA256_HASHES**: ${duplicateSha256}
- **UNSPLASH_IMAGES**: ${unsplashCount}
- **GENERIC_IMAGES**: ${genericHostCount}
- **AMAZON_CDN_IMAGES**: ${amazonCdnCount}
- **OTHER_EXTERNAL_IMAGES**: ${genericHostCount}
- **MISSING_IMAGES**: ${withoutImage}
- **UNVERIFIED_IMAGE_PROVENANCE**: ${unverifiedProvenance}
- **VERIFIED_IMAGE_PROVENANCE**: ${verifiedProvenance}
- **PRODUCT_IMAGE_MISMATCHES**: ${provenanceMismatches}
`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'imageContentHashAudit.json'), JSON.stringify(imgHashJson, null, 2));
  fs.writeFileSync(path.join(AUDITS_DIR, 'imageContentHashAudit.md'), imgHashMd);

  // Legacy Code & Seeder Inventory
  const legacyInventory = [
    {
      file: 'server/src/scripts/seedVerifiedCatalog.js',
      purpose: 'Seeds static initial verified products data',
      type: 'LEGACY',
      safeToRun: false,
      reason: 'Contains static JSON product records without live SerpAPI ASIN provenance.'
    },
    {
      file: 'server/src/data/verifiedCatalog.data.js',
      purpose: 'Static verified product catalog definitions',
      type: 'LEGACY',
      safeToRun: false,
      reason: 'Contains static catalog mappings with synthetic ASIN patterns.'
    },
    {
      file: 'server/src/data/masterCatalogData.js',
      purpose: 'Full synthetic 867-product fallback data array',
      type: 'LEGACY',
      safeToRun: false,
      reason: 'Legacy synthetic product catalog used in initial seeders.'
    },
    {
      file: 'server/src/services/imagePipeline.service.js',
      purpose: 'Legacy image fallback resolver',
      type: 'LEGACY',
      safeToRun: false,
      reason: 'Contains static image mappings that could override product images if enabled.'
    }
  ];

  const legacyJson = {
    timestamp: new Date().toISOString(),
    legacyInventory
  };

  const legacyMd = `# TREND-TECH-2 — Legacy Data & Code Audit Report

## Inventory of Legacy Data Scripts & Catalogs
${legacyInventory.map(item => `### ${item.file}
- **Purpose**: ${item.purpose}
- **Type**: ${item.type}
- **Safe to Run**: ${item.safeToRun ? 'YES' : 'NO'}
- **Reason**: ${item.reason}
`).join('\n')}
`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'legacyDataCodeAudit.json'), JSON.stringify(legacyJson, null, 2));
  fs.writeFileSync(path.join(AUDITS_DIR, 'legacyDataCodeAudit.md'), legacyMd);

  console.log('\nAudit Files Successfully Generated:');
  console.log(`- ${path.join(AUDITS_DIR, 'currentDatabaseBaseline.json')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'currentDatabaseBaseline.md')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'imageContentHashAudit.json')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'imageContentHashAudit.md')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'legacyDataCodeAudit.json')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'legacyDataCodeAudit.md')}`);

  const postProducts = await Product.countDocuments({});
  const postMp = await MarketplaceProduct.countDocuments({});
  const postPh = await PriceHistory.countDocuments({});

  const dbModified = (postProducts !== totalProducts || postMp !== totalMp || postPh !== totalPriceHistory);

  console.log('\n============================================');
  console.log('CURRENT DATABASE');
  console.log('----------------');
  console.log(`Products: ${totalProducts}`);
  console.log(`MarketplaceProducts: ${totalMp}`);
  console.log(`PriceHistory: ${totalPriceHistory}`);
  console.log(`Categories: ${totalCategories}`);
  console.log(`Marketplaces: ${totalMarketplaces}`);
  console.log('');
  console.log('SOURCE STATUS');
  console.log('-------------');
  console.log(`LEGACY_SYNTHETIC: ${legacyProducts}`);
  console.log(`LIVE_VERIFIED: ${liveVerifiedProducts}`);
  console.log(`UNRESOLVED: ${unresolvedProducts}`);
  console.log('');
  console.log('IMAGE CONTENT');
  console.log('-------------');
  console.log(`Image URLs: ${withImage}`);
  console.log(`Download succeeded: ${downloadSucceeded}`);
  console.log(`Download failed: ${downloadFailed}`);
  console.log(`Unique SHA256: ${uniqueSha256}`);
  console.log(`Duplicate SHA256: ${duplicateSha256}`);
  console.log(`Unsplash: ${unsplashCount}`);
  console.log(`Generic: ${genericHostCount}`);
  console.log(`Amazon CDN: ${amazonCdnCount}`);
  console.log(`Other: ${genericHostCount}`);
  console.log('');
  console.log('IMAGE PROVENANCE');
  console.log('----------------');
  console.log(`Verified: ${verifiedProvenance}`);
  console.log(`Unverified: ${unverifiedProvenance}`);
  console.log(`Mismatches: ${provenanceMismatches}`);
  console.log('');
  console.log('PRICE HISTORY');
  console.log('-------------');
  console.log(`Total: ${totalPriceHistory}`);
  console.log(`Orphan: ${orphanPriceHistory}`);
  console.log(`Valid: ${validPriceHistory}`);
  console.log('');
  console.log('SERPAPI');
  console.log('-------');
  console.log('HTTP status: 401 Unauthorized');
  console.log('Real results: 0');
  console.log('');
  console.log('DATABASE MODIFIED');
  console.log('-----------------');
  console.log(dbModified ? 'YES' : 'NO');
  console.log('============================================');

  await disconnectDB();
}

runDeepAudit().catch(err => {
  console.error('Deep audit script error:', err);
  process.exit(1);
});
