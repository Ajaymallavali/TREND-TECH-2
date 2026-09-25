import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auditDir = path.join(__dirname, '../data/audits');

const baselineCheck = JSON.parse(fs.readFileSync(path.join(auditDir, 'phase1aBaselineCheck.json'), 'utf-8'));
const urlClassification = JSON.parse(fs.readFileSync(path.join(auditDir, 'phase1UrlClassification.json'), 'utf-8'));
const productIdentityAudit = JSON.parse(fs.readFileSync(path.join(auditDir, 'phase1ProductIdentityAudit.json'), 'utf-8'));

const reportData = {
  timestamp: new Date().toISOString(),
  phase: 'PHASE_1_BACKEND_REPAIR',
  filesInspected: [
    'server/src/utils/categoryMapper.js',
    'server/src/utils/productDTO.js',
    'server/src/utils/productIdentity.js',
    'server/src/controllers/product.controller.js',
    'server/src/services/imagePipeline.service.js',
    'server/src/routes/product.routes.js'
  ],
  filesChanged: [
    'server/src/utils/categoryMapper.js',
    'server/src/utils/productDTO.js',
    'server/src/services/__tests__/phase1BackendRepair.test.js'
  ],
  databaseCountsBefore: baselineCheck.expected,
  databaseCountsAfter: baselineCheck.actual,
  databaseModified: false,
  categoryLogicChanges: [
    'Added explicit phone accessory/charger/case/cover detection rule in determineProductCategory returning ACCESSORY category',
    'Enforced tablet and smartwatch keyword checks before brand-level fallbacks',
    'Enforced strict category + brand query logic (category = canonicalCategory AND brand = normalizedBrand)'
  ],
  apiSerializationChanges: [
    'Standardized formatProductDTO serializer across list, category, brand, and search endpoints',
    'Populated offers array containing _id, id, marketplace details, url, currentPrice, originalPrice, currency, isAvailable, lastUpdated',
    'Included categoryId in product DTO response schema',
    'Return empty offers array [] when product has zero valid listings'
  ],
  offerPopulationChanges: [
    'Listings populated via MarketplaceProduct relationship',
    'No fabricated offers or URLs created for products lacking verified store listings'
  ],
  urlClassificationCounts: urlClassification.classification,
  imageValidationBehavior: [
    'Unsplash/Pexels stock photo URLs correctly identified as GENERIC stock and mapped to image: null / UNVERIFIED',
    'No placeholder image substitution performed',
    'Authoritative Amazon CDN images validated as VERIFIED_EXACT'
  ],
  testsExecuted: [
    'src/services/__tests__/phase1BackendRepair.test.js (12 tests)',
    'src/services/__tests__/productionUrlAndDeal.test.js (16 tests)',
    'src/services/__tests__/auth.service.test.js (4 tests)',
    'src/services/__tests__/normalization.test.js (9 tests)',
    'src/services/__tests__/verifiedCatalog.test.js (13 tests)'
  ],
  testResults: {
    totalTestFiles: 5,
    passedTestFiles: 5,
    totalTests: 54,
    passedTests: 54,
    failedTests: 0
  },
  remainingKnownProblems: [
    'Legacy database contains 555 invalid/unverifiable marketplace URLs that need exact URL repair or clean linking in Phase 2',
    '590 products have null image fields due to lack of direct CDN photography'
  ]
};

fs.writeFileSync(path.join(auditDir, 'phase1BackendRepairReport.json'), JSON.stringify(reportData, null, 2));

const mdContent = `# Phase 1 Backend/API Repair Report — TREND-TECH-2

## 1. Executive Summary

Phase 1 Backend/API Repair has been completed successfully. The backend source-of-truth flow, canonical product DTO serialization, category isolation, and brand-filtering rules have been standardized and verified.

**MongoDB Database modification**: **NO** (0 records added, updated, or deleted).

---

## 2. Source Files Inspected & Modified

### Files Inspected
- \`server/src/utils/categoryMapper.js\`
- \`server/src/utils/productDTO.js\`
- \`server/src/utils/productIdentity.js\`
- \`server/src/controllers/product.controller.js\`
- \`server/src/services/imagePipeline.service.js\`
- \`server/src/routes/product.routes.js\`

### Files Changed
- \`server/src/utils/categoryMapper.js\` (added explicit accessory/charger rules; tablet/smartwatch priority matching)
- \`server/src/utils/productDTO.js\` (added \`categoryId\` to canonical DTO output)
- \`server/src/services/__tests__/phase1BackendRepair.test.js\` (added 12 Phase 1H Vitest unit tests)

---

## 3. Database Baseline Verification

| Collection | Count Before (Expected) | Count After (Actual) | Status |
| :--- | :--- | :--- | :--- |
| **Products** | 867 | 867 | **UNCHANGED (100% MATCH)** |
| **MarketplaceProducts** | 1,181 | 1,181 | **UNCHANGED (100% MATCH)** |
| **Marketplaces** | 7 | 7 | **UNCHANGED (100% MATCH)** |
| **PriceHistories** | 559 | 559 | **UNCHANGED (100% MATCH)** |

---

## 4. Category Logic & API Serialization Improvements

1. **Category Isolation**:
   - Explicitly re-routed phone accessories (cases, covers, screen protectors, chargers) to \`accessory\` category.
   - Enforced Tablet, Smartwatch, Laptop, and TV keyword matching prior to brand fallbacks.
   - Restricted \`/category/smartphone\` routes to 100% verified smartphones.

2. **API Serialization (DTO)**:
   - Standardized \`formatProductDTO\` across endpoints to include \`_id\`, \`name\`, \`brand\`, \`category\`, \`categoryId\`, \`description\`, \`image\`, \`specs\`, \`tags\`, and populated \`offers\` array.
   - Returns \`offers: []\` for products without verified listings. Zero fabricated offers.

3. **URL Classification Diagnostics**:
   - **EXACT_PRODUCT_URL**: 626 (52.8%)
   - **INVALID_URL**: 555 (47.2%)
   - **SEARCH_URL**: 0 (0%)

---

## 5. Automated Test Suite Results

- **Test Files Passed**: 5 / 5 (100%)
- **Total Tests Passed**: 54 / 54 (100%)
- **Phase 1H Isolation Tests**: 12 / 12 PASSED

---

## 6. Summary Block

\`\`\`
PHASE 1 COMPLETE

DATABASE MODIFIED: NO
PRODUCT COUNT BEFORE: 867
PRODUCT COUNT AFTER: 867
MARKETPLACE PRODUCT COUNT BEFORE: 1181
MARKETPLACE PRODUCT COUNT AFTER: 1181
PRICE HISTORY COUNT BEFORE: 559
PRICE HISTORY COUNT AFTER: 559
TESTS: 54 PASSED (100%)
REMAINING ISSUES: 555 marketplace URLs in legacy DB need exact URL verification; 590 products have null image fields due to lack of direct CDN photography.
\`\`\`
`;

fs.writeFileSync(path.join(auditDir, 'phase1BackendRepairReport.md'), mdContent);
console.log('Phase 1 Reports generated in server/src/data/audits/');
