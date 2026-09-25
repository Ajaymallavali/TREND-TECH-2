import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { 
  getExactProductImageDetails, 
  isGenericStockImage, 
  isValidProductImage, 
  canonicalImageUrl 
} from '../services/imagePipeline.service.js';
import { verifyProductIdentityMatch } from '../utils/urlValidator.js';
import { determineProductCategory } from '../utils/categoryMapper.js';
import { fetchAndValidateImage, calculateImageHash } from '../utils/imageValidator.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function runPhase4ASourceResolution() {
  console.log('=================================================================');
  console.log('STARTING PHASE 4A — SOURCE RESOLUTION + DOWNLOAD FIX (DRY RUN)');
  console.log('=================================================================');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB (Read-Only).');

    const auditDir = path.resolve(__dirname, '../data/audits');
    if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

    const cacheDir = path.resolve(__dirname, '../data/image-cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const cacheFilePath = path.join(cacheDir, 'phase4ASourceCache.json');
    let sourceCache = {};
    if (fs.existsSync(cacheFilePath)) {
      try {
        sourceCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      } catch {
        sourceCache = {};
      }
    }

    const products = await Product.find({}).lean();
    const marketplaceProducts = await MarketplaceProduct.find({}).lean();

    console.log(`Total Products in catalog: ${products.length}`);
    console.log(`Total Marketplace Products: ${marketplaceProducts.length}`);

    // Build fast lookup by product ID
    const mpByProduct = {};
    for (const mp of marketplaceProducts) {
      if (mp.productId) {
        const pid = mp.productId.toString();
        if (!mpByProduct[pid]) mpByProduct[pid] = [];
        mpByProduct[pid].push(mp);
      }
    }

    // Pre-build index of REAL_VERIFIED_CATALOG for fallback manufacturer/verified images
    const verifiedCatalogMap = {};
    for (const item of REAL_VERIFIED_CATALOG) {
      const key = item.name.toLowerCase().trim();
      verifiedCatalogMap[key] = item;
    }

    // Multi-pass hash index to distinguish variant model sharing from unrelated collision
    const globalHashIndex = {};
    const duplicateAnalysisList = [];

    const stats = {
      totalProductsProcessed: products.length,
      candidateAttemptsTotal: 0,
      verifiedSourcesFound: 0,
      downloadAttemptsTotal: 0,
      successfulDownloads: 0,
      validImages: 0,
      invalidImages: 0,
      http404: 0,
      http403: 0,
      http429: 0,
      http500: 0,
      otherErrors: 0,
      identityMismatches: 0,
      duplicateConflicts: 0,
      unresolvedProducts: 0
    };

    const productFinalStates = [];
    const successfulCandidatesList = [];

    // Process Catalog Products in deterministic batches
    const BATCH_SIZE = 20;
    console.log(`Processing ${products.length} products in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      for (const prod of batch) {
        const pid = prod._id.toString();
        const category = determineProductCategory(prod);
        const brand = prod.brand || 'Unknown';
        const pNameLower = prod.name.toLowerCase().trim();

        // Check if cached result exists and image was successfully validated
        if (sourceCache[pid] && sourceCache[pid].validationResult === 'IMAGE_VALID') {
          stats.alreadyVerifiedCount = (stats.alreadyVerifiedCount || 0) + 1;
        }

        // Build priority candidate source list for fallback resolution
        const candidateSources = [];

        // Candidate 1: Real verified catalog match
        const exactCatalogItem = verifiedCatalogMap[pNameLower];
        if (exactCatalogItem && exactCatalogItem.image) {
          candidateSources.push({
            url: exactCatalogItem.image,
            type: 'REAL_VERIFIED_CATALOG_DIRECT',
            pageUrl: exactCatalogItem.offers?.[0]?.url || 'https://www.apple.com'
          });
        }

        // Candidate 2: Marketplace product listing images associated with Product
        const listings = mpByProduct[pid] || [];
        for (const listing of listings) {
          if (listing.image && isValidProductImage(listing.image) && !isGenericStockImage(listing.image)) {
            candidateSources.push({
              url: listing.image,
              type: 'VERIFIED_MARKETPLACE_LISTING',
              pageUrl: listing.url
            });
          }
        }

        // Candidate 3: Verified CDN Mapping Index
        const cdnDetails = getExactProductImageDetails({ name: prod.name, image: null });
        if (cdnDetails.url && cdnDetails.imageStatus === 'VERIFIED_EXACT') {
          candidateSources.push({
            url: cdnDetails.url,
            type: 'VERIFIED_CDN_INDEX',
            pageUrl: 'https://m.media-amazon.com'
          });
        }

        // Candidate 4: Existing Product.image field if valid
        if (prod.image && isValidProductImage(prod.image) && !isGenericStockImage(prod.image)) {
          candidateSources.push({
            url: prod.image,
            type: 'STORED_PRODUCT_IMAGE',
            pageUrl: prod.image
          });
        }

        let productResolved = false;
        let primaryState = 'UNRESOLVED';
        let resolvedDetails = null;

        for (const candidate of candidateSources) {
          stats.candidateAttemptsTotal++;

          // 1. Identity Check
          const identityCheck = verifyProductIdentityMatch({
            product: prod,
            offerTitle: prod.name,
            offerUrl: candidate.url
          });

          if (!identityCheck.match) {
            stats.identityMismatches++;
            stats.invalidImages++;
            primaryState = 'IDENTITY_MISMATCH';
            continue;
          }

          // 2. HTTP Fetch & Byte Validation
          stats.downloadAttemptsTotal++;
          const fetchRes = await fetchAndValidateImage(candidate.url, { timeoutMs: 8000 });

          if (!fetchRes.valid) {
            stats.invalidImages++;
            if (fetchRes.httpStatus === 404) {
              stats.http404++;
              primaryState = 'SOURCE_404';
            } else if (fetchRes.httpStatus === 403) {
              stats.http403++;
              primaryState = 'SOURCE_403';
            } else if (fetchRes.httpStatus === 429) {
              stats.http429++;
              primaryState = 'SOURCE_429';
            } else if (fetchRes.httpStatus >= 500) {
              stats.http500++;
              primaryState = 'SOURCE_500';
            } else {
              stats.otherErrors++;
              primaryState = 'IMAGE_INVALID';
            }
            // HTTP failed -> try next fallback candidate!
            continue;
          }

          stats.successfulDownloads++;
          stats.verifiedSourcesFound++;

          // 3. SHA-256 Byte Fingerprint & Variant / Duplicate Protection
          const imageHash = fetchRes.hash;
          const existingProdsWithHash = globalHashIndex[imageHash] || [];

          let isDuplicateCollision = false;
          for (const otherProd of existingProdsWithHash) {
            if (otherProd._id.toString() === pid) continue;
            const otherCategory = determineProductCategory(otherProd);

            if (otherCategory !== category) {
              isDuplicateCollision = true;
              duplicateAnalysisList.push({
                productId1: pid,
                productName1: prod.name,
                productId2: otherProd._id.toString(),
                productName2: otherProd.name,
                hash: imageHash,
                classification: 'REJECT_DIFFERENT_CATEGORY_COLLISION',
                reason: `Category mismatch (${category} vs ${otherCategory})`
              });
              break;
            } else {
              const n1 = prod.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi|bravia|sony/g, '').trim();
              const n2 = otherProd.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi|bravia|sony/g, '').trim();
              const isVariant = n1.includes(n2) || n2.includes(n1) ||
                (category === 'television' && prod.name.toLowerCase().includes('bravia') && otherProd.name.toLowerCase().includes('bravia'));

              if (!isVariant) {
                isDuplicateCollision = true;
                duplicateAnalysisList.push({
                  productId1: pid,
                  productName1: prod.name,
                  productId2: otherProd._id.toString(),
                  productName2: otherProd.name,
                  hash: imageHash,
                  classification: 'REJECT_UNRELATED_MODEL_COLLISION',
                  reason: `Distinct non-variant models sharing identical image bytes`
                });
                break;
              } else {
                duplicateAnalysisList.push({
                  productId1: pid,
                  productName1: prod.name,
                  productId2: otherProd._id.toString(),
                  productName2: otherProd.name,
                  hash: imageHash,
                  classification: 'ALLOW_EXACT_VARIANT_SHARING',
                  reason: `Verified same model variant sharing base asset`
                });
              }
            }
          }

          if (isDuplicateCollision) {
            stats.duplicateConflicts++;
            stats.invalidImages++;
            primaryState = 'DUPLICATE_CONFLICT';
            continue;
          }

          if (!globalHashIndex[imageHash]) globalHashIndex[imageHash] = [];
          globalHashIndex[imageHash].push(prod);

          // SUCCESSFUL IMAGE RESOLUTION
          productResolved = true;
          primaryState = 'IMAGE_VALID';
          stats.validImages++;

          resolvedDetails = {
            productId: pid,
            productName: prod.name,
            brand,
            category,
            sourceType: candidate.type,
            productPageUrl: candidate.pageUrl,
            imageUrl: candidate.url,
            httpStatus: fetchRes.httpStatus,
            contentType: fetchRes.format,
            imageDimensions: `${fetchRes.width}x${fetchRes.height}`,
            fileSize: fetchRes.sizeBytes,
            sha256: imageHash,
            verificationStatus: 'IMAGE_VALID'
          };

          // Cache verified resolution
          sourceCache[pid] = {
            productId: pid,
            productName: prod.name,
            sourceUrl: candidate.url,
            sourceType: candidate.type,
            candidateImageUrl: candidate.url,
            httpStatus: fetchRes.httpStatus,
            validationResult: 'IMAGE_VALID',
            sha256: imageHash,
            timestamp: new Date().toISOString()
          };

          successfulCandidatesList.push(resolvedDetails);
          break; // Stop after resolving candidate for this product
        }

        if (!productResolved) {
          stats.unresolvedProducts++;
        }

        productFinalStates.push({
          productId: pid,
          name: prod.name,
          category,
          primaryState,
          resolvedDetails
        });
      }
    }

    // Save Source Cache
    fs.writeFileSync(cacheFilePath, JSON.stringify(sourceCache, null, 2));

    // Write Phase 4A Audit Output Files
    const resolutionJsonPath = path.join(auditDir, 'phase4AImageResolution.json');
    const resolutionMdPath = path.join(auditDir, 'phase4AImageResolution.md');
    const duplicateAnalysisJsonPath = path.join(auditDir, 'phase4ADuplicateAnalysis.json');

    fs.writeFileSync(duplicateAnalysisJsonPath, JSON.stringify(duplicateAnalysisList, null, 2));

    const resolutionJson = {
      header: 'PHASE 4A SOURCE RESOLUTION AND IMAGE DOWNLOAD AUDIT',
      databaseModified: false,
      timestamp: new Date().toISOString(),
      summaryStats: stats,
      successfulCandidates: successfulCandidatesList
    };

    fs.writeFileSync(resolutionJsonPath, JSON.stringify(resolutionJson, null, 2));

    const resolutionMd = `# PHASE 4A SOURCE RESOLUTION AND IMAGE DOWNLOAD AUDIT

**Database Modified**: NO (Zero Writes Executed)
**Execution Mode**: Dry Run Batch Processing

## 1. Primary Product State Counts

- **Total Products Processed**: ${stats.totalProductsProcessed}
- **Valid Images Resolved**: ${stats.validImages}
- **Invalid Images**: ${stats.invalidImages}
- **HTTP 404 (Not Found)**: ${stats.http404}
- **HTTP 403 (Forbidden)**: ${stats.http403}
- **HTTP 429 (Rate Limited)**: ${stats.http429}
- **HTTP 500 (Server Error)**: ${stats.http500}
- **Other Errors**: ${stats.otherErrors}
- **Identity Mismatches**: ${stats.identityMismatches}
- **Duplicate Conflicts**: ${stats.duplicateConflicts}
- **Unresolved Products**: ${stats.unresolvedProducts}

## 2. Candidate Attempt Metric Breakdown

- **Candidate Attempts Total**: ${stats.candidateAttemptsTotal}
- **Verified Sources Found**: ${stats.verifiedSourcesFound}
- **Download Attempts Total**: ${stats.downloadAttemptsTotal}
- **Successful Downloads**: ${stats.successfulDownloads}

## 3. Successful Candidate Resolutions (${successfulCandidatesList.length})

| Product ID | Product Name | Brand | Category | Source Type | Image URL | Dimensions | Size | Verification |
|---|---|---|---|---|---|---|---|---|
${successfulCandidatesList.map(c => `| \`${c.productId}\` | ${c.productName} | ${c.brand} | ${c.category} | ${c.sourceType} | [View Image](${c.imageUrl}) | ${c.imageDimensions} | ${Math.round(c.fileSize / 1024)} KB | **${c.verificationStatus}** |`).join('\n')}
`;

    fs.writeFileSync(resolutionMdPath, resolutionMd);

    console.log('\nPhase 4A Audit Reports Written:');
    console.log(` - ${resolutionJsonPath}`);
    console.log(` - ${resolutionMdPath}`);
    console.log(` - ${duplicateAnalysisJsonPath}`);
    console.log(` - Cache: ${cacheFilePath}`);

    console.log('\nSummary Stats:');
    console.log(JSON.stringify(stats, null, 2));

  } catch (err) {
    console.error('Error during Phase 4A source resolution:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runPhase4ASourceResolution();
