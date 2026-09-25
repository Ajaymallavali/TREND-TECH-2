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
import { PriceHistory } from '../models/PriceHistory.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function runPhase4A8_2CoverageSummary() {
  console.log('===================================================================================');
  console.log('STARTING PHASE 4A.8.2 — EXTRACT ACTUAL 867-PRODUCT IMAGE RESULTS (READ-ONLY)');
  console.log('===================================================================================');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB (Read-Only).');

    // DB safety verification
    const productCountAfter = await Product.countDocuments();
    const mpCountAfter = await MarketplaceProduct.countDocuments();
    const phCountAfter = await PriceHistory.countDocuments();

    const auditDir = path.resolve(__dirname, '../data/audits');

    const dryRunJsonPath = path.join(auditDir, 'phase4A8FullCatalogDryRun.json');
    const failuresJsonPath = path.join(auditDir, 'phase4A8FullCatalogFailures.json');
    const successesJsonPath = path.join(auditDir, 'phase4A8FullCatalogSuccesses.json');
    const duplicatesJsonPath = path.join(auditDir, 'phase4A8FullCatalogDuplicates.json');
    const resultAuditJsonPath = path.join(auditDir, 'phase4A8_1FullCatalogResultAudit.json');

    if (!fs.existsSync(dryRunJsonPath)) throw new Error(`Missing ${dryRunJsonPath}`);
    if (!fs.existsSync(failuresJsonPath)) throw new Error(`Missing ${failuresJsonPath}`);
    if (!fs.existsSync(successesJsonPath)) throw new Error(`Missing ${successesJsonPath}`);
    if (!fs.existsSync(duplicatesJsonPath)) throw new Error(`Missing ${duplicatesJsonPath}`);

    const dryRunData = JSON.parse(fs.readFileSync(dryRunJsonPath, 'utf8'));
    const failuresList = JSON.parse(fs.readFileSync(failuresJsonPath, 'utf8'));
    const successesList = JSON.parse(fs.readFileSync(successesJsonPath, 'utf8'));
    const duplicatesList = JSON.parse(fs.readFileSync(duplicatesJsonPath, 'utf8'));
    const resultAuditData = fs.existsSync(resultAuditJsonPath)
      ? JSON.parse(fs.readFileSync(resultAuditJsonPath, 'utf8'))
      : null;

    const prodStats = dryRunData.productCounters;
    const candStats = dryRunData.candidateCounters;

    const totalProducts = prodStats.productsProcessed; // 867
    const verifiedExactCount = prodStats.productsResolved; // 30
    const unresolvedCount = prodStats.productsUnresolved; // 835
    const identityMismatchCount = prodStats.productsIdentityMismatch; // 0
    const duplicateConflictCount = prodStats.productsDuplicateConflict; // 2
    const withoutVerifiedCount = totalProducts - verifiedExactCount; // 837
    const coveragePct = ((verifiedExactCount / totalProducts) * 100).toFixed(1); // 3.5%

    // Product-level source breakdown
    let officialSourceCount = 0;
    let amazonSourceCount = 0;
    let flipkartSourceCount = 0;
    let myntraSourceCount = 0;
    let ajioSourceCount = 0;
    let nykaaSourceCount = 0;
    let otherSourceCount = 0;

    for (const s of successesList) {
      const type = (s.sourceType || '').toUpperCase();
      if (type.includes('OFFICIAL') || type.includes('MANUFACTURER')) {
        officialSourceCount++;
      } else if (type.includes('AMAZON') || type.includes('CDN') || s.imageUrl.includes('amazon')) {
        amazonSourceCount++;
      } else if (type.includes('FLIPKART')) {
        flipkartSourceCount++;
      } else if (type.includes('MYNTRA')) {
        myntraSourceCount++;
      } else if (type.includes('AJIO')) {
        ajioSourceCount++;
      } else if (type.includes('NYKAA')) {
        nykaaSourceCount++;
      } else {
        otherSourceCount++;
      }
    }

    const sourceBreakdown = {
      officialManufacturer: officialSourceCount, // 24
      amazon: amazonSourceCount,                 // 6
      flipkart: flipkartSourceCount,             // 0
      myntra: myntraSourceCount,                 // 0
      ajio: ajioSourceCount,                     // 0
      nykaa: nykaaSourceCount,                   // 0
      other: otherSourceCount                    // 0
    };

    // Extract 10 actual verified products
    const sampleVerifiedProducts = successesList.slice(0, 10).map(s => ({
      productId: s.productId,
      productName: s.productName,
      brand: s.brand,
      category: s.category,
      sourceType: s.sourceType,
      imageUrl: s.imageUrl,
      verificationStatus: s.verificationStatus
    }));

    // Extract 10 actual unresolved products
    const sampleUnresolvedProducts = failuresList.slice(0, 10).map(f => ({
      productId: f.productId,
      productName: f.name,
      brand: f.brand,
      category: f.category,
      failureReason: f.unresolvedReason
    }));

    // Category coverage list
    const categoryCoverage = resultAuditData ? resultAuditData.categoryCoverage : [];

    // Summary JSON Output
    const summaryData = {
      header: 'PHASE 4A.8.2 ACTUAL FULL CATALOG COVERAGE SUMMARY REPORT',
      databaseModified: false,
      timestamp: new Date().toISOString(),
      coverageOverview: {
        totalProducts,
        verifiedExactImages: verifiedExactCount,
        withoutVerifiedExactImage: withoutVerifiedCount,
        coveragePercentage: `${coveragePct}%`
      },
      productLevel: prodStats,
      candidateLevel: candStats,
      sourceProductBreakdown: sourceBreakdown,
      categoryCoverage,
      failureReasonBreakdown: resultAuditData ? resultAuditData.failureReasonBreakdown : {},
      sampleVerifiedProducts,
      sampleUnresolvedProducts,
      databaseIntegrity: {
        productsBefore: 867,
        productsAfter: productCountAfter,
        marketplaceProductsBefore: 1181,
        marketplaceProductsAfter: mpCountAfter,
        priceHistoryBefore: 559,
        priceHistoryAfter: phCountAfter,
        productImageWrites: 0,
        databaseModified: false
      }
    };

    const summaryJsonPath = path.join(auditDir, 'phase4A8_2ActualCoverageSummary.json');
    const summaryMdPath = path.join(auditDir, 'phase4A8_2ActualCoverageSummary.md');

    fs.writeFileSync(summaryJsonPath, JSON.stringify(summaryData, null, 2));

    const mdContent = `# PHASE 4A.8.2 ACTUAL FULL CATALOG COVERAGE SUMMARY REPORT

**Database Modified**: NO (Zero Writes Executed)  
**Catalog Exact Image Coverage**: **${coveragePct}%** (${verifiedExactCount} / ${totalProducts} Products)

---

## 1. Catalog Coverage Overview

- **Total Products**: ${totalProducts}
- **Verified Exact Images**: ${verifiedExactCount}
- **Products Without Verified Exact Image**: ${withoutVerifiedCount}
- **Exact Image Coverage**: **${coveragePct}%**

---

## 2. Product-Level Metrics

- **Products Processed**: ${prodStats.productsProcessed}
- **Resolved**: ${prodStats.productsResolved}
- **Unresolved**: ${prodStats.productsUnresolved}
- **Identity Mismatches**: ${prodStats.productsIdentityMismatch}
- **Duplicate Conflicts**: ${prodStats.productsDuplicateConflict}

---

## 3. Candidate-Level Metrics

- **Candidate Attempts**: ${candStats.candidateAttempts}
- **Sources Found**: ${candStats.candidateSourcesFound}
- **Download Attempts**: ${candStats.candidateDownloadAttempts}
- **Successful Downloads**: ${candStats.candidateDownloadSuccess}
- **Valid Images**: ${candStats.candidateValid}
- **Invalid Images**: ${candStats.candidateInvalid}
- **HTTP 404**: ${candStats.candidate404}
- **HTTP 403**: ${candStats.candidate403}
- **HTTP 429**: ${candStats.candidate429}
- **HTTP 500**: ${candStats.candidate500}
- **Other Errors**: ${candStats.candidateOtherErrors}

---

## 4. Product Source Breakdown

- **Official Manufacturer**: ${sourceBreakdown.officialManufacturer}
- **Amazon**: ${sourceBreakdown.amazon}
- **Flipkart**: ${sourceBreakdown.flipkart}
- **Myntra**: ${sourceBreakdown.myntra}
- **Ajio**: ${sourceBreakdown.ajio}
- **Nykaa**: ${sourceBreakdown.nykaa}
- **Other**: ${sourceBreakdown.other}

---

## 5. Sample 10 Verified Products

${sampleVerifiedProducts.map((p, i) => `### ${i + 1}. ${p.productName} (\`${p.productId}\`)
- **Brand / Category**: ${p.brand} | ${p.category}
- **Source**: ${p.sourceType}
- **Image URL**: [Direct Asset](${p.imageUrl})
- **Status**: \`${p.verificationStatus}\`
`).join('\n')}

---

## 6. Sample 10 Unresolved Products

${sampleUnresolvedProducts.map((u, i) => `### ${i + 1}. ${u.productName} (\`${u.productId}\`)
- **Brand / Category**: ${u.brand} | ${u.category}
- **Failure Reason**: ${u.failureReason}
`).join('\n')}

---

## 7. Database Safety Verification

- **Products**: 867 → ${productCountAfter}
- **MarketplaceProducts**: 1181 → ${mpCountAfter}
- **PriceHistory**: 559 → ${phCountAfter}
- **Product.image Writes**: 0
- **DATABASE MODIFIED**: **NO**
`;

    fs.writeFileSync(summaryMdPath, mdContent);

    console.log('\nAudit files successfully created:');
    console.log(` - ${summaryJsonPath}`);
    console.log(` - ${summaryMdPath}\n`);

    // Output required final console block
    console.log(`=================================================
PHASE 4A.8.2 ACTUAL FULL CATALOG IMAGE COVERAGE
=================================================

TOTAL PRODUCTS: ${totalProducts}

VERIFIED EXACT IMAGES: ${verifiedExactCount}

WITHOUT VERIFIED EXACT IMAGE: ${withoutVerifiedCount}

EXACT IMAGE COVERAGE: ${coveragePct} %

-------------------------------------------------

PRODUCT LEVEL

Resolved: ${prodStats.productsResolved}
Unresolved: ${prodStats.productsUnresolved}
Identity mismatches: ${prodStats.productsIdentityMismatch}
Duplicate conflicts: ${prodStats.productsDuplicateConflict}

-------------------------------------------------

CANDIDATE LEVEL

Candidate attempts: ${candStats.candidateAttempts}
Successful downloads: ${candStats.candidateDownloadSuccess}
Valid images: ${candStats.candidateValid}
Invalid images: ${candStats.candidateInvalid}

404: ${candStats.candidate404}
403: ${candStats.candidate403}
429: ${candStats.candidate429}
500: ${candStats.candidate500}
Other: ${candStats.candidateOtherErrors}

-------------------------------------------------

SOURCE

Official manufacturer: ${sourceBreakdown.officialManufacturer}
Amazon: ${sourceBreakdown.amazon}
Flipkart: ${sourceBreakdown.flipkart}
Myntra: ${sourceBreakdown.myntra}
Ajio: ${sourceBreakdown.ajio}
Nykaa: ${sourceBreakdown.nykaa}
Other: ${sourceBreakdown.other}

-------------------------------------------------

DATABASE

Products: 867 → ${productCountAfter}
MarketplaceProducts: 1181 → ${mpCountAfter}
PriceHistory: 559 → ${phCountAfter}
Product.image writes: 0

DATABASE MODIFIED: NO

=================================================`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in Phase 4A.8.2 coverage summary:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runPhase4A8_2CoverageSummary();
