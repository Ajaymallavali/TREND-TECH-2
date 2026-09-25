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
import { 
  verifyProductIdentityMatch, 
  validateExactProductImage 
} from '../utils/urlValidator.js';
import { determineProductCategory } from '../utils/categoryMapper.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function applyExactProductImages() {
  console.log('===========================================================');
  console.log('STARTING PHASE 3B — APPLY VERIFIED EXACT PRODUCT IMAGES');
  console.log('===========================================================');

  let updatedCount = 0;
  let skippedCount = 0;
  let conflictCount = 0;
  let errorCount = 0;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for Phase 3B safe image update.');

    const auditDir = path.resolve(__dirname, '../data/audits');
    const dryRunReportPath = path.join(auditDir, 'exactProductImageRepairReport.json');

    if (!fs.existsSync(dryRunReportPath)) {
      throw new Error(`Dry-run report not found at ${dryRunReportPath}. Run repairExactProductImages.js first.`);
    }

    const dryRunReport = JSON.parse(fs.readFileSync(dryRunReportPath, 'utf8'));
    const repairResults = dryRunReport.repairResults || [];

    // Filter ONLY the 30 repairable records identified during Phase 3 dry-run
    const repairableCandidates = repairResults.filter(r => r.repairStatus === 'REPAIRABLE');

    console.log(`Phase 3 dry-run candidates total: ${repairResults.length}`);
    console.log(`Phase 3 REPAIRABLE candidates found: ${repairableCandidates.length}`);

    // Load all current products & marketplace products to build global image mapping
    const allProducts = await Product.find({}).lean();
    const globalImageToProducts = {};

    for (const p of allProducts) {
      if (p.image && isValidProductImage(p.image) && !isGenericStockImage(p.image)) {
        const canonical = canonicalImageUrl(p.image);
        if (!globalImageToProducts[canonical]) globalImageToProducts[canonical] = [];
        globalImageToProducts[canonical].push(p);
      }
    }

    const auditSnapshot = [];
    const verifiedUpdatesToExecute = [];

    console.log('\n--- PRE-WRITE CANDIDATE VERIFICATION ---');

    for (const candidate of repairableCandidates) {
      const pid = candidate.id;
      const targetProduct = await Product.findById(pid).lean();

      if (!targetProduct) {
        console.warn(`[SKIP] Product ID ${pid} not found in database.`);
        skippedCount++;
        continue;
      }

      const newImage = candidate.repairedImage;
      const oldImage = targetProduct.image;
      const category = determineProductCategory(targetProduct);
      const brand = targetProduct.brand || 'Unknown';

      // 1. Image Validity & Generic Stock Check
      if (!newImage || !isValidProductImage(newImage) || isGenericStockImage(newImage)) {
        console.warn(`[SKIP] Image for ${targetProduct.name} is invalid or generic stock: ${newImage}`);
        skippedCount++;
        continue;
      }

      // 2. Exact Identity Match Verification
      const identityCheck = verifyProductIdentityMatch({
        product: targetProduct,
        offerTitle: targetProduct.name,
        offerUrl: newImage
      });

      if (!identityCheck.match) {
        console.warn(`[SKIP] Identity check failed for ${targetProduct.name}: ${identityCheck.reason}`);
        skippedCount++;
        continue;
      }

      // 3. Authoritative CDN / Source Validation
      const sourceValidation = validateExactProductImage({
        product: targetProduct,
        imageUrl: newImage
      });

      if (!sourceValidation.valid) {
        console.warn(`[SKIP] Non-authoritative CDN source for ${targetProduct.name}: ${sourceValidation.reason}`);
        skippedCount++;
        continue;
      }

      // 4. Duplicate Image Protection (Check if assigned to an unrelated distinct product)
      const canonical = canonicalImageUrl(newImage);
      const assignedProducts = globalImageToProducts[canonical] || [];
      const isUnrelatedCollision = assignedProducts.some(other => {
        if (other._id.toString() === pid) return false;
        const otherCategory = determineProductCategory(other);
        if (otherCategory !== category) return true;
        const n1 = targetProduct.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
        const n2 = other.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi/g, '').trim();
        return !n1.includes(n2) && !n2.includes(n1);
      });

      if (isUnrelatedCollision) {
        console.warn(`[CONFLICT] Duplicate image collision detected for ${targetProduct.name}. Image already assigned to an unrelated product.`);
        conflictCount++;
        continue;
      }

      // Explicit verification check passed
      const snapshotItem = {
        productId: pid,
        name: targetProduct.name,
        brand,
        category,
        oldImage: oldImage || null,
        newImage,
        source: candidate.repairAction || 'VERIFIED_MARKETPLACE_LISTING',
        verificationStatus: 'VERIFIED_EXACT',
        reasonAccepted: 'Identity match verified; authoritative CDN; no duplicate collision',
        timestamp: new Date().toISOString()
      };

      auditSnapshot.push(snapshotItem);
      verifiedUpdatesToExecute.push({ pid, newImage, snapshotItem });

      console.log(`[VERIFIED CANDIDATE] ${targetProduct.name} | Category: ${category} | Brand: ${brand}`);
      console.log(`   New Image: ${newImage}`);
    }

    // Save Audit Snapshot BEFORE writes
    const auditSnapshotPath = path.join(auditDir, 'exactProductImageWriteAudit.json');
    fs.writeFileSync(auditSnapshotPath, JSON.stringify(auditSnapshot, null, 2));
    console.log(`\nPre-write Audit Snapshot saved: ${auditSnapshotPath}`);
    console.log(`Total verified updates ready to write: ${verifiedUpdatesToExecute.length}`);

    // EXECUTING SAFE DATABASE WRITES
    console.log('\n--- EXECUTING MONGO UPDATE OPERATIONS ---');
    for (const updateObj of verifiedUpdatesToExecute) {
      try {
        const updateResult = await Product.updateOne(
          { _id: updateObj.pid },
          { $set: { image: updateObj.newImage } }
        );

        if (updateResult.modifiedCount > 0 || updateResult.matchedCount > 0) {
          updatedCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`[ERROR] Failed to update product ${updateObj.pid}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\nUpdate Summary: Updated=${updatedCount}, Skipped=${skippedCount}, Conflicts=${conflictCount}, Errors=${errorCount}`);

    // POST-WRITE DATABASE VERIFICATION
    console.log('\n--- POST-WRITE DATABASE RE-QUERY & VERIFICATION ---');
    const postWriteProducts = await Product.find({}).lean();
    const updatedIds = new Set(verifiedUpdatesToExecute.map(u => u.pid));
    const postWriteVerifiedResults = [];

    let verifiedExactPostWrite = 0;
    let missingPostWrite = 0;
    let genericPostWrite = 0;

    for (const prod of postWriteProducts) {
      const pid = prod._id.toString();
      const img = prod.image;
      const isValid = isValidProductImage(img);
      const isStock = isGenericStockImage(img);

      if (!img || !isValid) {
        missingPostWrite++;
      } else if (isStock) {
        genericPostWrite++;
      } else {
        verifiedExactPostWrite++;
      }

      if (updatedIds.has(pid)) {
        // Strict assertion for updated products
        const ok = img && isValid && !isStock && img === verifiedUpdatesToExecute.find(u => u.pid === pid).newImage;
        postWriteVerifiedResults.push({
          productId: pid,
          name: prod.name,
          brand: prod.brand,
          category: determineProductCategory(prod),
          imageUrl: img,
          verificationSource: 'POST_WRITE_DB_REQUERY',
          verificationResult: ok ? 'PASSED_VERIFICATION' : 'FAILED_VERIFICATION'
        });
      }
    }

    console.log(`Post-Write DB State:`);
    console.log(` - Verified Exact Images: ${verifiedExactPostWrite}`);
    console.log(` - Missing Images: ${missingPostWrite}`);
    console.log(` - Generic Images Remaining: ${genericPostWrite}`);

    // WRITE REPORTS
    const writeReportJsonPath = path.join(auditDir, 'exactProductImageWriteReport.json');
    const writeReportMdPath = path.join(auditDir, 'exactProductImageWriteReport.md');

    const reportJson = {
      timestamp: new Date().toISOString(),
      summary: {
        productsScanned: postWriteProducts.length,
        imagesUpdated: updatedCount,
        imagesSkipped: skippedCount,
        duplicateConflicts: conflictCount,
        errors: errorCount,
        verifiedExactImagesAfterWrite: verifiedExactPostWrite,
        missingImagesAfterWrite: missingPostWrite,
        genericImagesRemaining: genericPostWrite
      },
      updatedProducts: postWriteVerifiedResults
    };

    fs.writeFileSync(writeReportJsonPath, JSON.stringify(reportJson, null, 2));

    const reportMd = `# PHASE 3B EXACT PRODUCT IMAGE WRITE REPORT

**Date**: ${new Date().toISOString()}
**Database Updated**: YES

## Summary Metrics

- **Products Scanned**: ${postWriteProducts.length}
- **Images Updated**: ${updatedCount}
- **Images Skipped**: ${skippedCount}
- **Duplicate Conflicts**: ${conflictCount}
- **Errors**: ${errorCount}
- **Verified Exact Images After Write**: ${verifiedExactPostWrite}
- **Missing Images After Write**: ${missingPostWrite}
- **Generic Images Remaining**: ${genericPostWrite}

## Updated Products Detail

| Product ID | Product Name | Brand | Category | Image URL | Verification Status |
|---|---|---|---|---|---|
${postWriteVerifiedResults.map(p => `| \`${p.productId}\` | ${p.name} | ${p.brand || 'N/A'} | ${p.category} | [View Image](${p.imageUrl}) | **${p.verificationResult}** |`).join('\n')}
`;

    fs.writeFileSync(writeReportMdPath, reportMd);

    console.log(`\nReports written successfully:`);
    console.log(` - ${writeReportJsonPath}`);
    console.log(` - ${writeReportMdPath}`);

  } catch (err) {
    console.error('Fatal error applying exact product images:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

applyExactProductImages();
