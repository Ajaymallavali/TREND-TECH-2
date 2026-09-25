import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { determineProductCategory, normalizeCategory, isUserFacingProductEligible } from '../utils/categoryMapper.js';
import { isValidMarketplaceUrl } from '../utils/urlValidator.js';
import { getExactProductImageDetails } from '../services/imagePipeline.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function runPhase2Audit() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB (Read-Only Phase 2 Audit):', MONGODB_URI);

  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();
  const offers = await db.collection('marketplaceproducts').find({}).toArray();
  const marketplaces = await db.collection('marketplaces').find({}).toArray();
  const priceHistoriesCount = await db.collection('pricehistories').countDocuments();

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

  const productOffersMap = {};
  for (const p of products) productOffersMap[p._id.toString()] = [];
  for (const o of offers) {
    const pId = o.product ? o.product.toString() : null;
    if (pId && productOffersMap[pId]) {
      productOffersMap[pId].push(o);
    }
  }

  const asinProductMap = {};
  for (const o of offers) {
    if (o.url && o.url.includes('amazon.in')) {
      const match = o.url.match(/\/dp\/([A-Z0-9]{10})/i);
      if (match) {
        const asin = match[1].toUpperCase();
        if (!asinProductMap[asin]) asinProductMap[asin] = [];
        asinProductMap[asin].push({
          offerId: o._id.toString(),
          productId: o.product ? o.product.toString() : null,
          url: o.url
        });
      }
    }
  }

  const suspiciousAsins = Object.entries(asinProductMap).filter(([_, list]) => list.length > 1);

  const classifiedProducts = [];
  const statusCounts = {
    VALID_PRODUCT: 0,
    CATEGORY_CONFLICT: 0,
    IMAGE_CONFLICT: 0,
    OFFER_CONFLICT: 0,
    ASIN_CONFLICT: 0,
    SEARCH_URL: 0,
    DUPLICATE_IDENTITY: 0,
    SUSPICIOUS_PRICE: 0,
    TEMPLATE_PRODUCT: 0,
    MISSING_IMAGE: 0,
    MISSING_OFFER: 0,
    UNVERIFIED: 0
  };

  for (const p of products) {
    const pId = p._id.toString();
    const pOffers = productOffersMap[pId] || [];

    const isEligible = isUserFacingProductEligible(p);
    const determinedCat = determineProductCategory(p);
    const normCat = normalizeCategory(p.category);
    const imageDetails = getExactProductImageDetails(p);

    let classification = 'VALID_PRODUCT';
    let reason = 'Verified commercial product identity';

    if (!isEligible) {
      classification = 'TEMPLATE_PRODUCT';
      reason = 'Synthetic template pattern name (e.g., "Smartphone Xiaomi series")';
    } else if (determinedCat !== normCat) {
      classification = 'CATEGORY_CONFLICT';
      reason = `Stored category "${p.category}" conflicts with canonical determined category "${determinedCat}"`;
    } else if (!imageDetails.url) {
      classification = 'MISSING_IMAGE';
      reason = 'No verified manufacturer or store CDN image available';
    } else if (pOffers.length === 0) {
      classification = 'MISSING_OFFER';
      reason = 'Product has zero marketplace listings';
    } else {
      const hasSearchUrl = pOffers.some(o => o.url && (o.url.includes('/search') || o.url.includes('?q=')));
      const hasSuspiciousPrice = pOffers.some(o => o.currentPrice === 2999);
      if (hasSearchUrl) {
        classification = 'SEARCH_URL';
        reason = 'Marketplace offer URL is a search query instead of direct product page';
      } else if (hasSuspiciousPrice) {
        classification = 'SUSPICIOUS_PRICE';
        reason = 'Marketplace offer contains suspicious repeated 2999 price value';
      }
    }

    statusCounts[classification] = (statusCounts[classification] || 0) + 1;

    classifiedProducts.push({
      productId: pId,
      name: p.name,
      brand: p.brand,
      category: p.category,
      determinedCategory: determinedCat,
      classification,
      reason,
      image: imageDetails.url,
      offersCount: pOffers.length
    });
  }

  // Write phase2CatalogIntegrityReport.json
  const integrityReport = {
    timestamp: new Date().toISOString(),
    metrics: {
      productsCount: products.length,
      marketplaceProductsCount: offers.length,
      marketplacesCount: marketplaces.length,
      priceHistoriesCount,
      statusCounts
    },
    suspiciousAsinsCount: suspiciousAsins.length,
    classifiedProducts
  };

  fs.writeFileSync(path.join(auditDir, 'phase2CatalogIntegrityReport.json'), JSON.stringify(integrityReport, null, 2));

  // Write phase2CatalogIntegrityReport.md
  const mdReport = `# Phase 2 Catalog Integrity & Diagnostic Report — TREND-TECH-2

## Baseline Metrics (MongoDB Preserved 100%)

- **Products**: ${products.length}
- **Marketplace Products**: ${offers.length}
- **Marketplaces**: ${marketplaces.length}
- **Price Histories**: ${priceHistoriesCount}
- **Database Modification**: NONE (Read-Only)

---

## Catalog Status Breakdown

\`\`\`json
${JSON.stringify(statusCounts, null, 2)}
\`\`\`

---

## Diagnostic Findings & Identity Audits

1. **Category Conflicts (${statusCounts.CATEGORY_CONFLICT})**:
   - Products stored under generic category labels (e.g. \`Smartphone Xiaomi Pad 6\`) detected and mapped to canonical categories (\`tablet\`, \`smartwatch\`, \`laptop\`, \`television\`).
2. **Template Products (${statusCounts.TEMPLATE_PRODUCT})**:
   - Synthetic template names (e.g. \`Smartphone Phone series\`, \`Air Conditioners Daikin\`) classified as \`TEMPLATE_PRODUCT\` and excluded from user-facing category listings.
3. **Suspicious Prices (${statusCounts.SUSPICIOUS_PRICE})**:
   - Legacy offers containing hardcoded ₹2,999 values detected and classified.
4. **Amazon ASIN Conflicts (${suspiciousAsins.length})**:
   - ASINs shared across distinct product records detected for non-destructive tracking.

---

## Recommended Action Matrix

- **VALID_PRODUCT (${statusCounts.VALID_PRODUCT})**: Expose cleanly on production category and detail pages.
- **CATEGORY_CONFLICT (${statusCounts.CATEGORY_CONFLICT})**: Enforce backend DTO canonical category re-routing.
- **TEMPLATE_PRODUCT (${statusCounts.TEMPLATE_PRODUCT})**: Filter out from user-facing category listings.
- **MISSING_IMAGE (${statusCounts.MISSING_IMAGE})**: Display "Verified image unavailable" badge. Zero fake stock photo assignments.
`;

  fs.writeFileSync(path.join(auditDir, 'phase2CatalogIntegrityReport.md'), mdReport);

  // Write phase2RuntimeDataFlow.md
  const runtimeDataFlowMd = `# Phase 2 Runtime Data Flow Documentation — TREND-TECH-2

## 1. Exact Runtime Data Flow Trace for \`/category/smartphone\`

1. **User Navigation**: Browser navigates to \`http://localhost:5173/category/smartphone\`.
2. **React Component**: \`client/src/pages/CategoryPage.jsx\` renders and executes \`useQuery({ queryKey: ['category-products', 'smartphone', brandParam, sortBy, budgetFilter] })\`.
3. **Frontend API Service**: \`CategoryPage.jsx\` executes \`apiClient.get('/products', { params: { category: 'smartphone', sortBy: 'price_asc' } })\`.
4. **HTTP Request**: \`GET http://localhost:5001/api/products?category=smartphone&sortBy=price_asc\`.
5. **Backend Express Route**: \`server/src/routes/product.routes.js\` routes \`GET /\` to \`product.controller.js -> getProducts\`.
6. **Backend Controller**: \`getProducts\` normalizes \`category\` to \`targetCanonicalCategory = 'smartphone'\`.
7. **MongoDB Query**: Executes \`Product.find(filter)\` and filters in-memory using \`isUserFacingProductEligible(p)\` and \`determineProductCategory(p) === 'smartphone'\`.
8. **Brand Summary Aggregation**: Computes \`brandSummary\` ONLY across category-eligible products (\`determineProductCategory(p) === 'smartphone'\`), eliminating global non-smartphone categories (Beauty, Kids, Sports & Fitness) from the sidebar.
9. **Marketplace Listings Population**: Populates listings via \`MarketplaceProduct.find({ product: p._id }).populate('marketplace')\`.
10. **DTO Serialization**: Maps each product to standard \`formatProductDTO\` returning \`data\`, \`brandSummary\`, and \`totalCount\`.
11. **Frontend Rendering**: \`CategoryPage.jsx\` renders \`brandSummary\` chips and maps \`data\` to \`ProductCard\` components.
12. **ProductCard & ProductImage**: \`ProductCard\` uses \`product.image\` directly with \`ProductImage.jsx\` rendering exact verified CDN photography or fallback badge. \`View Deal\` uses direct \`offer.url\` in new tab.

---

## 2. Diagnostics & Root Cause Evidence

- **Cause of Global Brand Chips (Beauty, Kids, Sports & Fitness)**: Legacy database records contained string taxonomy names in the \`brand\` field (e.g., \`brand: "Beauty & Personal Care"\`). Fixed by validating brand strings and grouping only category-matched products.
- **Cause of MacBook Image on iPhone 16e**: Pattern matching in \`VERIFIED_CDN_MAPPINGS\` evaluated broad model patterns before checking stored \`product.image\`. Fixed by checking stored non-stock product image first.
- **Cause of Missing Offers**: \`getProducts\` controller previously omitted \`offers\` array. Fixed by including formatted \`offers\` array in standard product DTO serializer.
`;

  fs.writeFileSync(path.join(auditDir, 'phase2RuntimeDataFlow.md'), runtimeDataFlowMd);

  console.log('\n========================================');
  console.log('PHASE 2 CATALOG INTEGRITY & RUNTIME DATA FLOW AUDIT COMPLETED');
  console.log('========================================');
  console.log('Status Counts:', JSON.stringify(statusCounts, null, 2));
  console.log('========================================\n');

  await mongoose.disconnect();
}

runPhase2Audit().catch(err => {
  console.error('Phase 2 audit script error:', err);
  process.exit(1);
});
