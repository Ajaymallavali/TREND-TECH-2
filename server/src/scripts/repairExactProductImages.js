import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
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
import { 
  verifyProductIdentityMatch, 
  validateExactProductImage 
} from '../utils/urlValidator.js';
import { determineProductCategory } from '../utils/categoryMapper.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';
const DRY_RUN = true;

async function runExactProductImageRepair() {
  console.log('====================================================');
  console.log('STARTING PHASE 3 EXACT PRODUCT IMAGE REPAIR (DRY RUN)');
  console.log(`DRY RUN MODE: ${DRY_RUN} (Zero MongoDB Writes)`);
  console.log('====================================================');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB read-only.');

    const products = await Product.find({}).lean();
    const marketplaceProducts = await MarketplaceProduct.find({}).lean();

    console.log(`Total Products scanned: ${products.length}`);
    console.log(`Total Marketplace Products scanned: ${marketplaceProducts.length}`);

    // Map marketplace products by productId for fast lookup
    const mpByProduct = {};
    for (const mp of marketplaceProducts) {
      if (mp.productId) {
        const pid = mp.productId.toString();
        if (!mpByProduct[pid]) mpByProduct[pid] = [];
        mpByProduct[pid].push(mp);
      }
    }

    const auditStats = {
      PRODUCTS_SCANNED: products.length,
      CURRENT_VERIFIED_EXACT_IMAGES: 0,
      CURRENT_MISSING_IMAGES: 0,
      CURRENT_GENERIC_IMAGES: 0,
      CURRENT_WRONG_PRODUCT_IMAGES: 0,
      CURRENT_DUPLICATE_IMAGE_CONFLICTS: 0,
      EXACT_IMAGES_FOUND: 0,
      IMAGES_REPAIRABLE: 0,
      IMAGES_REJECTED: 0,
      IMAGES_STILL_MISSING: 0,
      IMAGE_IDENTITY_CONFLICTS: 0
    };

    const imageIdentityIndex = {};
    const imageUrlCounts = {};
    const imageToProducts = {};
    const repairResults = [];

    // First pass: Analyze existing images and detect conflicts/duplicates
    for (const prod of products) {
      const img = prod.image;
      if (img && isValidProductImage(img) && !isGenericStockImage(img)) {
        const canonical = canonicalImageUrl(img);
        imageUrlCounts[canonical] = (imageUrlCounts[canonical] || 0) + 1;
        if (!imageToProducts[canonical]) imageToProducts[canonical] = [];
        imageToProducts[canonical].push(prod);
      }
    }

    // Second pass: Detailed audit and dry-run repair resolution
    for (const prod of products) {
      const pid = prod._id.toString();
      const rawImage = prod.image;
      const category = determineProductCategory(prod);
      const isStock = isGenericStockImage(rawImage);
      const isValid = isValidProductImage(rawImage);

      let imageStatus = 'MISSING';
      let wrongProductReason = null;
      let isDuplicateConflict = false;

      // Check current image status
      if (!rawImage || !isValid) {
        imageStatus = 'MISSING';
        auditStats.CURRENT_MISSING_IMAGES++;
      } else if (isStock) {
        imageStatus = 'GENERIC';
        auditStats.CURRENT_GENERIC_IMAGES++;
      } else {
        // Verify identity match (e.g. iPhone 16e displaying MacBook image)
        const identityCheck = verifyProductIdentityMatch({
          product: prod,
          offerTitle: prod.name,
          offerUrl: rawImage
        });

        const canonical = canonicalImageUrl(rawImage);
        if (imageUrlCounts[canonical] > 1) {
          // Check if products sharing image are distinct non-variant models
          const sharingProds = imageToProducts[canonical];
          const isDistinctModels = sharingProds.some(other => {
            if (other._id.toString() === pid) return false;
            const catOther = determineProductCategory(other);
            if (catOther !== category) return true;
            // Check if model names are fundamentally different
            const n1 = prod.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
            const n2 = other.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
            return !n1.includes(n2) && !n2.includes(n1);
          });

          if (isDistinctModels) {
            isDuplicateConflict = true;
          }
        }

        if (!identityCheck.match) {
          imageStatus = 'WRONG_PRODUCT';
          wrongProductReason = identityCheck.reason;
          auditStats.CURRENT_WRONG_PRODUCT_IMAGES++;
        } else if (isDuplicateConflict) {
          imageStatus = 'DUPLICATE_CONFLICT';
          auditStats.CURRENT_DUPLICATE_IMAGE_CONFLICTS++;
        } else {
          imageStatus = 'VERIFIED_EXACT';
          auditStats.CURRENT_VERIFIED_EXACT_IMAGES++;
        }
      }

      // Repair logic (Dry-run resolution)
      let repairedImage = null;
      let repairStatus = 'REJECTED';
      let repairAction = 'NONE';

      if (imageStatus === 'VERIFIED_EXACT') {
        repairedImage = rawImage;
        repairStatus = 'RETAINED';
        auditStats.EXACT_IMAGES_FOUND++;
      } else {
        // Attempt 1: Check Marketplace Products associated with this Product for a valid CDN image
        const listings = mpByProduct[pid] || [];
        for (const listing of listings) {
          if (listing.image && isValidProductImage(listing.image) && !isGenericStockImage(listing.image)) {
            const listCheck = verifyProductIdentityMatch({
              product: prod,
              offerTitle: listing.title || prod.name,
              offerUrl: listing.image
            });
            if (listCheck.match) {
              repairedImage = listing.image;
              repairStatus = 'REPAIRABLE';
              repairAction = 'COPIED_FROM_VERIFIED_MARKETPLACE_LISTING';
              break;
            }
          }
        }

        // Attempt 2: Pipeline exact CDN mapping check
        if (!repairedImage) {
          const details = getExactProductImageDetails({ name: prod.name, image: null });
          if (details.url && details.imageStatus === 'VERIFIED_EXACT') {
            const mapCheck = verifyProductIdentityMatch({
              product: prod,
              offerTitle: prod.name,
              offerUrl: details.url
            });
            if (mapCheck.match) {
              repairedImage = details.url;
              repairStatus = 'REPAIRABLE';
              repairAction = 'RESOLVED_FROM_VERIFIED_CDN_INDEX';
            }
          }
        }

        if (repairedImage && repairStatus === 'REPAIRABLE') {
          auditStats.IMAGES_REPAIRABLE++;
          auditStats.EXACT_IMAGES_FOUND++;
        } else {
          auditStats.IMAGES_REJECTED++;
          auditStats.IMAGES_STILL_MISSING++;
          if (isDuplicateConflict || imageStatus === 'WRONG_PRODUCT') {
            auditStats.IMAGE_IDENTITY_CONFLICTS++;
          }
        }
      }

      // Build identity index mapping
      if (repairedImage) {
        imageIdentityIndex[pid] = {
          productId: pid,
          name: prod.name,
          category,
          asin: prod.asin || null,
          imageUrl: repairedImage,
          canonicalUrl: canonicalImageUrl(repairedImage),
          status: repairStatus
        };
      }

      repairResults.push({
        id: pid,
        name: prod.name,
        category,
        originalImage: rawImage,
        initialStatus: imageStatus,
        wrongProductReason,
        repairedImage,
        repairStatus,
        repairAction
      });
    }

    // Write audit outputs
    const auditDir = path.resolve(__dirname, '../data/audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const reportJsonPath = path.join(auditDir, 'exactProductImageRepairReport.json');
    const reportMdPath = path.join(auditDir, 'exactProductImageRepairReport.md');
    const indexJsonPath = path.join(auditDir, 'imageIdentityIndex.json');

    const reportData = {
      timestamp: new Date().toISOString(),
      dryRun: DRY_RUN,
      stats: auditStats,
      repairResults
    };

    fs.writeFileSync(reportJsonPath, JSON.stringify(reportData, null, 2));
    fs.writeFileSync(indexJsonPath, JSON.stringify(imageIdentityIndex, null, 2));

    const markdownContent = `# PHASE 3 EXACT PRODUCT IMAGE REPAIR REPORT

**Date**: ${new Date().toISOString()}
**Mode**: DRY-RUN ONLY (${DRY_RUN ? 'Zero Writes' : 'Live Writes'})

## Summary Statistics

- **PRODUCTS SCANNED**: ${auditStats.PRODUCTS_SCANNED}
- **CURRENT VERIFIED EXACT IMAGES**: ${auditStats.CURRENT_VERIFIED_EXACT_IMAGES}
- **CURRENT MISSING IMAGES**: ${auditStats.CURRENT_MISSING_IMAGES}
- **CURRENT GENERIC IMAGES**: ${auditStats.CURRENT_GENERIC_IMAGES}
- **CURRENT WRONG-PRODUCT IMAGES**: ${auditStats.CURRENT_WRONG_PRODUCT_IMAGES}
- **CURRENT DUPLICATE IMAGE CONFLICTS**: ${auditStats.CURRENT_DUPLICATE_IMAGE_CONFLICTS}

## Repair Resolution Breakdown

- **EXACT IMAGES FOUND**: ${auditStats.EXACT_IMAGES_FOUND}
- **IMAGES REPAIRABLE**: ${auditStats.IMAGES_REPAIRABLE}
- **IMAGES REJECTED**: ${auditStats.IMAGES_REJECTED}
- **IMAGES STILL MISSING**: ${auditStats.IMAGES_STILL_MISSING}
- **IMAGE IDENTITY CONFLICTS**: ${auditStats.IMAGE_IDENTITY_CONFLICTS}

## Key Identity Rules Enforced

1. **Stock Image Elimination**: Unsplash, Pexels, Pixabay, and generic placeholder URLs marked as \`GENERIC\` and excluded from rendering.
2. **Device Type Identity Matching**: Prevents smartphones (e.g., Apple iPhone 16e) from receiving laptop/MacBook or smartwatch images.
3. **Variant Protection**: Strictly isolates model variants (e.g. Pro vs Pro Max, XM5 vs XM4).
4. **Duplicate Image Conflict Detection**: Cross-model image sharing flag \`DUPLICATE_CONFLICT\` isolates non-variant model image collisions.
`;

    fs.writeFileSync(reportMdPath, markdownContent);

    console.log('\nAudit and Dry-Run Report successfully written:');
    console.log(` - ${reportJsonPath}`);
    console.log(` - ${reportMdPath}`);
    console.log(` - ${indexJsonPath}`);

    console.log('\nSummary Stats:');
    console.log(JSON.stringify(auditStats, null, 2));

  } catch (err) {
    console.error('Error running Phase 3 repair audit script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

runExactProductImageRepair();
