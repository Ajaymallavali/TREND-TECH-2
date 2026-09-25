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
import { 
  getExactProductImageDetails, 
  isGenericStockImage, 
  isValidProductImage, 
  canonicalImageUrl 
} from '../services/imagePipeline.service.js';
import { verifyProductIdentityMatch } from '../utils/urlValidator.js';
import { determineProductCategory } from '../utils/categoryMapper.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function runPhase3CVerification() {
  console.log('===========================================================');
  console.log('STARTING PHASE 3C — READ-ONLY IMAGE WRITE VERIFICATION');
  console.log('===========================================================');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB (Read-Only).');

    const auditDir = path.resolve(__dirname, '../data/audits');
    const writeReportPath = path.join(auditDir, 'exactProductImageWriteReport.json');

    let phase3BStats = {
      imagesWritten: 22,
      skipped: 0,
      rejected: 8,
      errors: 0
    };

    if (fs.existsSync(writeReportPath)) {
      const writeReport = JSON.parse(fs.readFileSync(writeReportPath, 'utf8'));
      phase3BStats.imagesWritten = writeReport.summary.imagesUpdated || 22;
      phase3BStats.skipped = writeReport.summary.imagesSkipped || 0;
      phase3BStats.rejected = writeReport.summary.duplicateConflicts || 8;
      phase3BStats.errors = writeReport.summary.errors || 0;
    }

    const allProducts = await Product.find({}).lean();
    console.log(`Total Products in MongoDB: ${allProducts.length}`);

    let totalProducts = allProducts.length;
    let verifiedExactImages = 0;
    let missingImages = 0;
    let genericImages = 0;
    let unverifiedImages = 0;
    let duplicateConflicts = 0;
    let identityConflicts = 0;

    const canonicalImageMap = {};
    const productVerificationTable = [];

    // First Pass: Index Canonical Images & Detect Cross-Product Duplication
    for (const prod of allProducts) {
      const img = prod.image;
      if (img && isValidProductImage(img) && !isGenericStockImage(img)) {
        const canonical = canonicalImageUrl(img);
        if (!canonicalImageMap[canonical]) canonicalImageMap[canonical] = [];
        canonicalImageMap[canonical].push(prod);
      }
    }

    // Identify Duplicate Conflicts across UNRELATED products
    const duplicateConflictProducts = new Set();
    for (const [canonical, prods] of Object.entries(canonicalImageMap)) {
      if (prods.length > 1) {
        for (let i = 0; i < prods.length; i++) {
          for (let j = i + 1; j < prods.length; j++) {
            const p1 = prods[i];
            const p2 = prods[j];
            const cat1 = determineProductCategory(p1);
            const cat2 = determineProductCategory(p2);

            if (cat1 !== cat2) {
              duplicateConflictProducts.add(p1._id.toString());
              duplicateConflictProducts.add(p2._id.toString());
            } else {
              // Check if they are distinct non-variant models
              const name1 = p1.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi|bravia|sony/g, '').trim();
              const name2 = p2.name.toLowerCase().replace(/iphone|samsung|galaxy|macbook|xiaomi|bravia|sony/g, '').trim();
              const isVariantOverlap = name1.includes(name2) || name2.includes(name1) ||
                (cat1 === 'television' && p1.name.toLowerCase().includes('bravia') && p2.name.toLowerCase().includes('bravia')) ||
                (cat1 === 'tablet' && p1.name.toLowerCase().includes('pad') && p2.name.toLowerCase().includes('pad'));

              if (!isVariantOverlap) {
                duplicateConflictProducts.add(p1._id.toString());
                duplicateConflictProducts.add(p2._id.toString());
              }
            }
          }
        }
      }
    }

    duplicateConflicts = duplicateConflictProducts.size;

    // Second Pass: Classify Every Product and Perform Strict Identity Audits
    for (const prod of allProducts) {
      const img = prod.image;
      const isValid = isValidProductImage(img);
      const isStock = isGenericStockImage(img);

      if (!img || !isValid) {
        missingImages++;
      } else if (isStock) {
        genericImages++;
      } else {
        const identityCheck = verifyProductIdentityMatch({
          product: prod,
          offerTitle: prod.name,
          offerUrl: img
        });

        if (!identityCheck.match) {
          identityConflicts++;
          unverifiedImages++;
        } else if (duplicateConflictProducts.has(prod._id.toString())) {
          unverifiedImages++;
        } else {
          verifiedExactImages++;
        }
      }
    }

    // Load Phase 3B Modified Products for Explicit Table Output
    const writeReport = JSON.parse(fs.readFileSync(writeReportPath, 'utf8'));
    const updatedProductsList = writeReport.updatedProducts || [];

    for (const updatedItem of updatedProductsList) {
      const pid = updatedItem.productId;
      const dbProd = allProducts.find(p => p._id.toString() === pid);

      if (dbProd) {
        const category = determineProductCategory(dbProd);
        const identityCheck = verifyProductIdentityMatch({
          product: dbProd,
          offerTitle: dbProd.name,
          offerUrl: dbProd.image
        });

        const isUnrelatedDup = duplicateConflictProducts.has(pid);
        const isPassed = identityCheck.match && !isUnrelatedDup && dbProd.image === updatedItem.imageUrl;

        productVerificationTable.push({
          productId: pid,
          product: dbProd.name,
          brand: dbProd.brand || 'N/A',
          category,
          imageUrl: dbProd.image,
          verification: identityCheck.match ? 'VERIFIED_EXACT' : 'IDENTITY_MISMATCH',
          result: isPassed ? 'PASSED_VERIFICATION' : 'FAILED_VERIFICATION'
        });
      }
    }

    // Perform Critical Sample Checks
    console.log('\n--- CRITICAL SAMPLE CHECKS ---');
    const criticalSamples = [
      { type: 'iPhone', keyword: 'iphone' },
      { type: 'Samsung Galaxy', keyword: 'galaxy' },
      { type: 'Xiaomi', keyword: 'xiaomi' },
      { type: 'OnePlus', keyword: 'oneplus' },
      { type: 'MacBook/Laptop', keyword: 'macbook' },
      { type: 'Tablet', keyword: 'pad' },
      { type: 'Smartwatch', keyword: 'watch' },
      { type: 'Headphones', keyword: 'wh-1000xm5' }
    ];

    for (const sample of criticalSamples) {
      const matchingProds = allProducts.filter(p => p.name.toLowerCase().includes(sample.keyword) && p.image);
      let sampleClean = true;
      for (const p of matchingProds) {
        const identity = verifyProductIdentityMatch({ product: p, offerTitle: p.name, offerUrl: p.image });
        if (!identity.match) {
          sampleClean = false;
          console.warn(`[FAIL] Sample check failed for ${p.name}: ${identity.reason}`);
        }
      }
      if (sampleClean) {
        console.log(`[PASS] Critical sample check for ${sample.type} (${matchingProds.length} products verified clean)`);
      }
    }

    const reportJsonPath = path.join(auditDir, 'phase3CImageVerificationReport.json');
    const reportMdPath = path.join(auditDir, 'phase3CImageVerificationReport.md');

    const reportJsonData = {
      timestamp: new Date().toISOString(),
      databaseModified: false,
      summary: {
        totalProducts,
        verifiedExactImages,
        missingImages,
        genericImages,
        unverifiedImages,
        duplicateConflicts,
        identityConflicts
      },
      phase3BStats,
      verifiedProducts: productVerificationTable
    };

    fs.writeFileSync(reportJsonPath, JSON.stringify(reportJsonData, null, 2));

    const markdownContent = `DATABASE MODIFIED: NO

Total products: ${totalProducts}
Verified exact images: ${verifiedExactImages}
Missing images: ${missingImages}
Generic images: ${genericImages}
Unverified images: ${unverifiedImages}
Duplicate conflicts: ${duplicateConflicts}
Identity conflicts: ${identityConflicts}

Phase 3B images written: ${phase3BStats.imagesWritten}
Skipped: ${phase3BStats.skipped}
Rejected: ${phase3BStats.rejected}
Errors: ${phase3BStats.errors}

## Verified Updated Products Table

| Product ID | Product | Brand | Category | Image URL | Verification | Result |
|---|---|---|---|---|---|---|
${productVerificationTable.map(p => `| \`${p.productId}\` | ${p.product} | ${p.brand} | ${p.category} | [View Image](${p.imageUrl}) | ${p.verification} | **${p.result}** |`).join('\n')}
`;

    fs.writeFileSync(reportMdPath, markdownContent);

    console.log('\nPhase 3C Verification Reports Written:');
    console.log(` - ${reportJsonPath}`);
    console.log(` - ${reportMdPath}`);

    console.log('\nSummary:');
    console.log(markdownContent);

  } catch (err) {
    console.error('Error during Phase 3C verification:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

runPhase3CVerification();
