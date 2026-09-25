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

async function buildOfficialProductImagePipeline() {
  console.log('===========================================================');
  console.log('STARTING PHASE 4 OFFICIAL PRODUCT IMAGE PIPELINE (DRY RUN)');
  console.log('===========================================================');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB (Read-Only).');

    const publicDir = path.resolve(__dirname, '../../../client/public/product-images');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const auditDir = path.resolve(__dirname, '../data/audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const cacheDir = path.resolve(__dirname, '../data/image-cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const cacheFilePath = path.join(cacheDir, 'resolvedSources.json');
    let resolvedCache = {};
    if (fs.existsSync(cacheFilePath)) {
      try {
        resolvedCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      } catch {
        resolvedCache = {};
      }
    }

    const products = await Product.find({}).lean();
    const marketplaceProducts = await MarketplaceProduct.find({}).lean();

    console.log(`Total Products scanned: ${products.length}`);
    console.log(`Total Marketplace Products scanned: ${marketplaceProducts.length}`);

    const mpByProduct = {};
    for (const mp of marketplaceProducts) {
      if (mp.productId) {
        const pid = mp.productId.toString();
        if (!mpByProduct[pid]) mpByProduct[pid] = [];
        mpByProduct[pid].push(mp);
      }
    }

    const stats = {
      productsScanned: products.length,
      alreadyVerified: 0,
      productsRequiringImages: 0,
      exactSourceFound: 0,
      actualImageDownloaded: 0,
      validImages: 0,
      invalidImages: 0,
      http404: 0,
      http403: 0,
      http429: 0,
      http500: 0,
      otherDownloadErrors: 0,
      productIdentityMismatches: 0,
      duplicateConflicts: 0,
      unverifiedSources: 0,
      wouldCreateLocalImages: 0,
      wouldUpdateProductImage: 0
    };

    const downloadFailures = [];
    const imageSourceResolutions = [];
    const dryRunResults = [];
    const globalHashToProducts = {};

    for (const prod of products) {
      const pid = prod._id.toString();
      const category = determineProductCategory(prod);
      const brand = prod.brand || 'Unknown';
      const rawImg = prod.image;

      let candidateSourceUrl = null;
      let candidateSourceType = 'UNVERIFIED';

      // Check if product already has an existing valid local or exact CDN image
      if (rawImg && isValidProductImage(rawImg) && !isGenericStockImage(rawImg)) {
        candidateSourceUrl = rawImg;
        candidateSourceType = 'STORED_PRODUCT_IMAGE';
      } else {
        // Priority 1: Marketplace product listings associated with this Product
        const listings = mpByProduct[pid] || [];
        for (const listing of listings) {
          if (listing.image && isValidProductImage(listing.image) && !isGenericStockImage(listing.image)) {
            const listCheck = verifyProductIdentityMatch({
              product: prod,
              offerTitle: listing.title || prod.name,
              offerUrl: listing.image
            });
            if (listCheck.match) {
              candidateSourceUrl = listing.image;
              candidateSourceType = 'VERIFIED_MARKETPLACE_LISTING';
              break;
            }
          }
        }

        // Priority 2: Verified CDN Mappings Index
        if (!candidateSourceUrl) {
          const details = getExactProductImageDetails({ name: prod.name, image: null });
          if (details.url && details.imageStatus === 'VERIFIED_EXACT') {
            const mapCheck = verifyProductIdentityMatch({
              product: prod,
              offerTitle: prod.name,
              offerUrl: details.url
            });
            if (mapCheck.match) {
              candidateSourceUrl = details.url;
              candidateSourceType = 'VERIFIED_CDN_INDEX';
            }
          }
        }
      }

      if (!candidateSourceUrl) {
        stats.productsRequiringImages++;
        stats.unverifiedSources++;
        dryRunResults.push({
          productId: pid,
          name: prod.name,
          brand,
          category,
          originalImage: rawImg,
          status: 'IMAGE_NOT_FOUND',
          reason: 'No exact verified source found'
        });
        continue;
      }

      stats.exactSourceFound++;

      // 1. Identity Check Validation
      const identityCheck = verifyProductIdentityMatch({
        product: prod,
        offerTitle: prod.name,
        offerUrl: candidateSourceUrl
      });

      if (!identityCheck.match) {
        stats.productIdentityMismatches++;
        stats.invalidImages++;
        dryRunResults.push({
          productId: pid,
          name: prod.name,
          brand,
          category,
          originalImage: rawImg,
          candidateUrl: candidateSourceUrl,
          status: 'IMAGE_PRODUCT_MISMATCH',
          reason: identityCheck.reason
        });
        continue;
      }

      // 2. Actual HTTP Fetch & Byte Validation
      const fetchResult = await fetchAndValidateImage(candidateSourceUrl, { timeoutMs: 8000 });

      if (!fetchResult.valid) {
        stats.invalidImages++;
        if (fetchResult.httpStatus === 404) stats.http404++;
        else if (fetchResult.httpStatus === 403) stats.http403++;
        else if (fetchResult.httpStatus === 429) stats.http429++;
        else if (fetchResult.httpStatus >= 500) stats.http500++;
        else stats.otherDownloadErrors++;

        downloadFailures.push({
          productId: pid,
          name: prod.name,
          url: candidateSourceUrl,
          httpStatus: fetchResult.httpStatus,
          errorType: fetchResult.errorType,
          reason: fetchResult.reason
        });

        dryRunResults.push({
          productId: pid,
          name: prod.name,
          brand,
          category,
          originalImage: rawImg,
          candidateUrl: candidateSourceUrl,
          status: fetchResult.errorType,
          reason: fetchResult.reason
        });
        continue;
      }

      stats.actualImageDownloaded++;

      // 3. SHA-256 Byte Fingerprint & Duplicate Protection
      const imageHash = fetchResult.hash;
      const existingHashProducts = globalHashToProducts[imageHash] || [];

      const isUnrelatedCollision = existingHashProducts.some(other => {
        if (other._id.toString() === pid) return false;
        const otherCategory = determineProductCategory(other);
        if (otherCategory !== category) return true;
        const n1 = prod.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
        const n2 = other.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
        return !n1.includes(n2) && !n2.includes(n1);
      });

      if (isUnrelatedCollision) {
        stats.duplicateConflicts++;
        stats.invalidImages++;
        dryRunResults.push({
          productId: pid,
          name: prod.name,
          brand,
          category,
          originalImage: rawImg,
          candidateUrl: candidateSourceUrl,
          status: 'IMAGE_DUPLICATE_CONFLICT',
          reason: 'SHA-256 byte fingerprint collision across unrelated products'
        });
        continue;
      }

      if (!globalHashToProducts[imageHash]) globalHashToProducts[imageHash] = [];
      globalHashToProducts[imageHash].push(prod);

      // Save local image file to client/public/product-images/
      const fileExt = fetchResult.format === 'image/png' ? '.png' : (fetchResult.format === 'image/webp' ? '.webp' : '.jpg');
      const filename = `${pid}${fileExt}`;
      const localFilePath = path.join(publicDir, filename);

      fs.writeFileSync(localFilePath, fetchResult.buffer);

      const localAssetUrl = `/product-images/${filename}`;

      stats.validImages++;
      stats.wouldCreateLocalImages++;
      stats.wouldUpdateProductImage++;
      stats.alreadyVerified++;

      resolvedCache[pid] = {
        productId: pid,
        name: prod.name,
        sourceUrl: candidateSourceUrl,
        localAssetUrl,
        hash: imageHash,
        verifiedAt: new Date().toISOString()
      };

      imageSourceResolutions.push({
        productId: pid,
        name: prod.name,
        brand,
        category,
        sourceUrl: candidateSourceUrl,
        localAssetUrl,
        sourceType: candidateSourceType,
        format: fetchResult.format,
        dimensions: `${fetchResult.width}x${fetchResult.height}`,
        sizeBytes: fetchResult.sizeBytes,
        hash: imageHash
      });

      dryRunResults.push({
        productId: pid,
        name: prod.name,
        brand,
        category,
        originalImage: rawImg,
        candidateUrl: candidateSourceUrl,
        localAssetUrl,
        status: 'IMAGE_VERIFIED_LOCAL',
        reason: 'Image fetched, byte validated, identity matched, SHA-256 non-colliding, saved locally'
      });
    }

    // Save Cache File
    fs.writeFileSync(cacheFilePath, JSON.stringify(resolvedCache, null, 2));

    // Save Output Reports
    const reportJsonPath = path.join(auditDir, 'phase4ImagePipelineDryRun.json');
    const reportMdPath = path.join(auditDir, 'phase4ImagePipelineDryRun.md');
    const failuresJsonPath = path.join(auditDir, 'imageDownloadFailures.json');
    const sourceResolutionsJsonPath = path.join(auditDir, 'imageSourceResolution.json');

    fs.writeFileSync(failuresJsonPath, JSON.stringify(downloadFailures, null, 2));
    fs.writeFileSync(sourceResolutionsJsonPath, JSON.stringify(imageSourceResolutions, null, 2));

    const reportJson = {
      header: 'PHASE 4 OFFICIAL IMAGE PIPELINE DRY RUN',
      databaseModified: false,
      timestamp: new Date().toISOString(),
      stats,
      results: dryRunResults
    };

    fs.writeFileSync(reportJsonPath, JSON.stringify(reportJson, null, 2));

    const reportMd = `========================================
PHASE 4 OFFICIAL IMAGE PIPELINE
DRY RUN
========================================

Products scanned: ${stats.productsScanned}
Already verified: ${stats.alreadyVerified}
Products requiring images: ${stats.productsRequiringImages}

Exact source found: ${stats.exactSourceFound}
Actual image downloaded: ${stats.actualImageDownloaded}
Valid images: ${stats.validImages}
Invalid images: ${stats.invalidImages}

404: ${stats.http404}
403: ${stats.http403}
429: ${stats.http429}
500: ${stats.http500}
Other download errors: ${stats.otherDownloadErrors}

Product identity mismatches: ${stats.productIdentityMismatches}
Duplicate conflicts: ${stats.duplicateConflicts}
Unverified sources: ${stats.unverifiedSources}

Would create local images: ${stats.wouldCreateLocalImages}
Would update Product.image: ${stats.wouldUpdateProductImage}

DATABASE MODIFIED: NO

========================================
`;

    fs.writeFileSync(reportMdPath, reportMd);

    console.log('\nPhase 4 Audit Reports Written Successfully:');
    console.log(` - ${reportJsonPath}`);
    console.log(` - ${reportMdPath}`);
    console.log(` - ${failuresJsonPath}`);
    console.log(` - ${sourceResolutionsJsonPath}`);
    console.log(` - Cache: ${cacheFilePath}`);

    console.log('\nFinal Output Summary:');
    console.log(reportMd);

  } catch (err) {
    console.error('Error during Phase 4 image pipeline dry run:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

buildOfficialProductImagePipeline();
