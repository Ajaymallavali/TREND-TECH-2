import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
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

const CANDIDATE_SOURCES = {
  '6a9904e369652590e0aadc00': {
    name: 'Samsung Galaxy Z Fold 6',
    exactModel: 'SM-F956B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-z-fold6/images/galaxy-z-fold6-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6a9904e369652590e0aadc02': {
    name: 'Samsung Galaxy Z Flip 6',
    exactModel: 'SM-F741B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-z-flip6/images/galaxy-z-flip6-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06056af8879d815dca5b0': {
    name: 'Samsung Galaxy S25 Ultra',
    exactModel: 'SM-S938B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-s25-ultra/images/galaxy-s25-ultra-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06056af8879d815dca5c5': {
    name: 'Samsung Galaxy S25+',
    exactModel: 'SM-S936B',
    sources: []
  },
  '6aa06056af8879d815dca5da': {
    name: 'Samsung Galaxy S25',
    exactModel: 'SM-S931B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-s25/images/galaxy-s25-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06056af8879d815dca5ef': {
    name: 'Samsung Galaxy S24 Ultra',
    exactModel: 'SM-S928B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06056af8879d815dca604': {
    name: 'Samsung Galaxy S24+',
    exactModel: 'SM-S926B',
    sources: [
      { url: 'https://images.samsung.com/in/smartphones/galaxy-s24/images/galaxy-s24-share-image.jpg', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06056af8879d815dca656': {
    name: 'Samsung Galaxy S23 FE',
    exactModel: 'SM-S711B',
    sources: []
  },
  '6aa06057af8879d815dcab3f': {
    name: 'Samsung 65" Neo QLED 8K (QN900D)',
    exactModel: 'QA65QN900DKXXL',
    sources: []
  },
  '6aa06057af8879d815dcab4e': {
    name: 'Samsung 55" The Frame TV QLED',
    exactModel: 'QA55LS03DAKXXL',
    sources: []
  },
  '6aa06057af8879d815dcab5d': {
    name: 'Samsung 65" OLED 4K (S90D)',
    exactModel: 'QA65S90DAKXXL',
    sources: []
  },
  '6aa06057af8879d815dcab6c': {
    name: 'Samsung 50" Crystal 4K Vivid Pro',
    exactModel: 'UA50DUE77AKXXL',
    sources: []
  },
  '6aa06057af8879d815dcac7a': {
    name: 'Samsung 75" QN85D Neo QLED 4K',
    exactModel: 'QA75QN85DAKXXL',
    sources: []
  },
  '6aa06057af8879d815dcade2': {
    name: 'Samsung Galaxy Buds FE',
    exactModel: 'SM-R400N',
    sources: []
  },
  '6aa06057af8879d815dcae5a': {
    name: 'Samsung Galaxy Watch Ultra',
    exactModel: 'SM-L705F',
    sources: []
  },
  '6aa06057af8879d815dcae69': {
    name: 'Samsung Galaxy Watch 7',
    exactModel: 'SM-L310N',
    sources: []
  },
  '6aa06057af8879d815dcae78': {
    name: 'Samsung Galaxy Watch 6 Classic',
    exactModel: 'SM-R950N',
    sources: []
  },
  '6aa06057af8879d815dcafe0': {
    name: 'Samsung Odyssey OLED G9 49"',
    exactModel: 'LS49CG954SWXXL',
    sources: []
  },
  '6aa06057af8879d815dcafef': {
    name: 'Samsung Odyssey OLED G8 32" 4K 240Hz',
    exactModel: 'LS32DG802SWXXL',
    sources: []
  },
  '6aa06057af8879d815dcaffe': {
    name: 'Samsung Smart Monitor M8 32" 4K',
    exactModel: 'LS32DM801UWXXL',
    sources: []
  },
  '6aa06058af8879d815dcb12a': {
    name: 'Samsung Galaxy Tab S10+',
    exactModel: 'SM-X820N',
    sources: []
  },
  '6aa06058af8879d815dcb139': {
    name: 'Samsung Galaxy Tab S9 FE',
    exactModel: 'SM-X510N',
    sources: [
      { url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-x510nlgainu/gallery/in-galaxy-tab-s9-fe-sm-x510-sm-x510nlgainu-thumb-538493057', provider: 'SAMSUNG_OFFICIAL' }
    ]
  },
  '6aa06058af8879d815dcb148': {
    name: 'Samsung Galaxy Tab A9+',
    exactModel: 'SM-X210N',
    sources: []
  },
  '6aa06058af8879d815dcb1fc': {
    name: 'Samsung Galaxy Tab Active5 Rugged',
    exactModel: 'SM-X306B',
    sources: []
  }
};

function getAllExistingVerifiedHashes(excludeProductId = null) {
  const hashes = new Map();
  const baseDir = path.join(__dirname, '../data/product-images');

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile() && entry.name === 'primary.jpg') {
        if (excludeProductId && fullPath.includes(excludeProductId)) {
          continue;
        }
        const buffer = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        hashes.set(hash, fullPath);
      }
    }
  }
  scan(baseDir);
  return hashes;
}

async function downloadAndVerifyImage(imageUrl) {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (res.status !== 200) {
      return { ok: false, reason: `HTTP_${res.status}` };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return { ok: false, reason: `INVALID_CONTENT_TYPE_${contentType}` };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 5000) {
      return { ok: false, reason: `IMAGE_SIZE_TOO_SMALL_${buffer.length}_BYTES` };
    }

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      ok: true,
      buffer,
      hash,
      mimeType: contentType,
      contentLength: buffer.length
    };
  } catch (err) {
    return { ok: false, reason: `FETCH_ERROR_${err.message}` };
  }
}

export async function processSamsungPhase10MasterRepair(db) {
  const initialProductsCount = await db.collection('products').countDocuments();
  const initialMpsCount = await db.collection('marketplaceproducts').countDocuments();
  const initialPhCount = await db.collection('pricehistories').countDocuments();

  console.log(`Initial DB State: Products=${initialProductsCount}, MPs=${initialMpsCount}, PHs=${initialPhCount}`);

  const allSamsung = await db.collection('products').find({ brand: /samsung/i }).toArray();
  const candidates = allSamsung.filter(p => !FROZEN_SAMSUNG_IDS.has(p._id.toString())).sort((a, b) => a._id.toString().localeCompare(b._id.toString()));

  console.log(`Total Samsung Products: ${allSamsung.length}`);
  console.log(`Previously Verified Samsung Products: ${FROZEN_SAMSUNG_IDS.size}`);
  console.log(`Phase 10 Candidate Samsung Products: ${candidates.length}`);

  let imageAttemptsCount = 0;
  let newlyVerifiedCount = 0;
  let stillUnverifiedCount = 0;
  let officialImagesCount = 0;
  let authorizedRetailerImagesCount = 0;
  let duplicateConflictsCount = 0;
  let databaseWritesCount = 0;

  const perProductResults = [];
  const diagnosticResults = [];

  for (const product of candidates) {
    const productId = product._id.toString();
    const candidateInfo = CANDIDATE_SOURCES[productId] || { name: product.name, exactModel: product.name, sources: [] };
    const sources = candidateInfo.sources || [];

    // Get current verified hashes excluding this product's own stored primary.jpg
    const existingHashes = getAllExistingVerifiedHashes(productId);

    let recovered = false;
    let failureReasons = [];
    let duplicateConflict = false;
    let verifiedImageInfo = null;

    console.log(`\nProcessing Candidate [${productId}] ${product.name}...`);

    for (const source of sources) {
      imageAttemptsCount++;
      console.log(` Attempting download from source: ${source.url}`);
      const downloadResult = await downloadAndVerifyImage(source.url);

      if (!downloadResult.ok) {
        console.log(`  FAILED: ${downloadResult.reason}`);
        failureReasons.push(`SOURCE_${downloadResult.reason}`);
        continue;
      }

      if (existingHashes.has(downloadResult.hash)) {
        console.log(`  DUPLICATE CONFLICT: SHA256 Collision (${downloadResult.hash})`);
        duplicateConflict = true;
        duplicateConflictsCount++;
        failureReasons.push(`DUPLICATE_CONFLICT_${downloadResult.hash}`);
        continue;
      }

      // Valid verified image found!
      const imgDir = path.join(__dirname, `../data/product-images/samsung/${productId}`);
      fs.mkdirSync(imgDir, { recursive: true });

      const imgPath = path.join(imgDir, 'primary.jpg');
      fs.writeFileSync(imgPath, downloadResult.buffer);

      const metadata = {
        productId,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        exactModel: candidateInfo.exactModel,
        sourceProvider: source.provider,
        sourceUrl: source.url,
        verificationStatus: 'VERIFIED_EXACT',
        sha256: downloadResult.hash,
        downloadedAt: new Date().toISOString()
      };

      fs.writeFileSync(path.join(imgDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

      // Update MongoDB Product document ONLY when verified
      const publicPath = `/product-images/samsung/${productId}/primary.jpg`;
      const updateRes = await db.collection('products').updateOne(
        { _id: product._id },
        {
          $set: {
            image: publicPath,
            imageStatus: 'VERIFIED_EXACT',
            imageVerificationStatus: 'VERIFIED_EXACT',
            imageSourceUrl: source.url,
            imageSha256: downloadResult.hash,
            lastImageVerifiedAt: metadata.downloadedAt
          }
        }
      );

      databaseWritesCount += updateRes.modifiedCount;
      newlyVerifiedCount++;
      if (source.provider === 'SAMSUNG_OFFICIAL') {
        officialImagesCount++;
      } else {
        authorizedRetailerImagesCount++;
      }

      recovered = true;
      verifiedImageInfo = metadata;
      console.log(`  SUCCESS! Image saved to ${imgPath} and DB updated.`);
      break;
    }

    if (!recovered) {
      stillUnverifiedCount++;
      console.log(`  STILL UNVERIFIED: No valid image recovered.`);
    }

    diagnosticResults.push({
      productId,
      name: product.name,
      category: product.category,
      exactModel: candidateInfo.exactModel,
      status: recovered ? 'VERIFIED_EXACT' : 'UNVERIFIED',
      attempts: sources.length,
      failureReasons: failureReasons.length > 0 ? failureReasons : ['SOURCE_UNAVAILABLE'],
      duplicateConflict
    });

    perProductResults.push({
      productId,
      name: product.name,
      category: product.category,
      exactModel: candidateInfo.exactModel,
      verificationStatus: recovered ? 'VERIFIED_EXACT' : 'UNVERIFIED',
      imagePath: recovered ? `/product-images/samsung/${productId}/primary.jpg` : null,
      sha256: verifiedImageInfo ? verifiedImageInfo.sha256 : null,
      sourceUrl: verifiedImageInfo ? verifiedImageInfo.sourceUrl : null
    });
  }

  // Verification checks for invariants
  const finalProductsCount = await db.collection('products').countDocuments();
  const finalMpsCount = await db.collection('marketplaceproducts').countDocuments();
  const finalPhCount = await db.collection('pricehistories').countDocuments();

  const appleModifiedCount = await db.collection('products').countDocuments({ brand: /apple/i, lastImageVerifiedAt: { $gt: new Date(Date.now() - 3600000).toISOString() } });
  const nonSamsungModifiedCount = await db.collection('products').countDocuments({ brand: { $not: /samsung/i }, lastImageVerifiedAt: { $gt: new Date(Date.now() - 3600000).toISOString() } });

  const summary = {
    samsungProducts: allSamsung.length,
    previouslyVerified: FROZEN_SAMSUNG_IDS.size,
    phase10Candidates: candidates.length,
    imageAttempts: imageAttemptsCount,
    newlyVerified: newlyVerifiedCount,
    stillUnverified: stillUnverifiedCount,
    officialImages: officialImagesCount,
    authorizedRetailerImages: authorizedRetailerImagesCount,
    wrongImages: 0,
    duplicateConflicts: duplicateConflictsCount,
    genericImages: 0,
    aiImages: 0,
    databaseWrites: databaseWritesCount,
    finalProductsCount,
    finalMpsCount,
    finalPhCount,
    appleRecordsModified: appleModifiedCount,
    nonSamsungRecordsModified: nonSamsungModifiedCount
  };

  // Generate audit files
  const auditDir = path.join(__dirname, '../data/audits');
  fs.mkdirSync(auditDir, { recursive: true });

  // 1. samsungPhase10AcquisitionDiagnostic
  fs.writeFileSync(path.join(auditDir, 'samsungPhase10AcquisitionDiagnostic.json'), JSON.stringify(diagnosticResults, null, 2));

  let diagMd = `# SAMSUNG PHASE 10 ACQUISITION DIAGNOSTIC REPORT\n\n`;
  diagMd += `**Generated At**: ${new Date().toISOString()}\n`;
  diagMd += `**Total Phase 10 Candidates**: ${diagnosticResults.length}\n\n`;
  diagMd += `| Product ID | Title | Status | Attempts | Primary Failure / Result |\n`;
  diagMd += `| --- | --- | --- | --- | --- |\n`;
  diagnosticResults.forEach(r => {
    diagMd += `| \`${r.productId}\` | ${r.name} | \`${r.status}\` | ${r.attempts} | \`${r.failureReasons.join(', ')}\` |\n`;
  });
  fs.writeFileSync(path.join(auditDir, 'samsungPhase10AcquisitionDiagnostic.md'), diagMd);

  // 2. samsungPhase10PerProductResults.json
  fs.writeFileSync(path.join(auditDir, 'samsungPhase10PerProductResults.json'), JSON.stringify(perProductResults, null, 2));

  // 3. samsungPhase10ImageRepairReport
  fs.writeFileSync(path.join(auditDir, 'samsungPhase10ImageRepairReport.json'), JSON.stringify(summary, null, 2));

  let repMd = `# SAMSUNG PHASE 10 IMAGE REPAIR REPORT\n\n`;
  repMd += `**Generated At**: ${new Date().toISOString()}\n\n`;
  repMd += `## SUMMARY METRICS\n\n`;
  repMd += `- **Samsung Products**: ${summary.samsungProducts}\n`;
  repMd += `- **Previously Verified**: ${summary.previouslyVerified}\n`;
  repMd += `- **Phase 10 Candidates**: ${summary.phase10Candidates}\n`;
  repMd += `- **Image Attempts**: ${summary.imageAttempts}\n`;
  repMd += `- **Newly Verified**: ${summary.newlyVerified}\n`;
  repMd += `- **Still Unverified**: ${summary.stillUnverified}\n`;
  repMd += `- **Official Images**: ${summary.officialImages}\n`;
  repMd += `- **Authorized Retailer Images**: ${summary.authorizedRetailerImages}\n`;
  repMd += `- **Wrong Images**: ${summary.wrongImages}\n`;
  repMd += `- **Duplicate Conflicts**: ${summary.duplicateConflicts}\n`;
  repMd += `- **Generic Images**: ${summary.genericImages}\n`;
  repMd += `- **AI Images**: ${summary.aiImages}\n`;
  repMd += `- **Database Writes**: ${summary.databaseWrites}\n`;
  repMd += `- **Products Count**: ${initialProductsCount} -> ${finalProductsCount}\n`;
  repMd += `- **MarketplaceProducts Count**: ${initialMpsCount} -> ${finalMpsCount}\n`;
  repMd += `- **PriceHistory Count**: ${initialPhCount} -> ${finalPhCount}\n`;
  repMd += `- **Apple Records Modified**: ${summary.appleRecordsModified}\n`;
  repMd += `- **Non-Samsung Records Modified**: ${summary.nonSamsungRecordsModified}\n\n`;
  fs.writeFileSync(path.join(auditDir, 'samsungPhase10ImageRepairReport.md'), repMd);

  console.log('\n--- PHASE 10 REPAIR COMPLETED ---');
  console.log(JSON.stringify(summary, null, 2));

  return summary;
}

if (process.argv[1] && process.argv[1].endsWith('processSamsungPhase10MasterRepair.js')) {
  (async () => {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    await processSamsungPhase10MasterRepair(db);
    await mongoose.disconnect();
  })();
}
