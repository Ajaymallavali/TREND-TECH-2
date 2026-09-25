# TREND-TECH-2 — MASTER FORENSIC DIAGNOSTIC PASS REPORT

**Timestamp**: 2026-09-23T01:33:30+05:30  
**Audit Scope**: Read-Only Forensic Diagnostic of Product, Image, Price, Marketplace, and Category Pipelines  
**Database Writes**: 0 (Zero DB Modifications Executed)  
**Codebase Edits**: 0 (Zero Production Code Files Changed)  

---

## Metric & Source Summary Table

| Pipeline Dimension | Classification | Primary Source |
| :--- | :--- | :--- |
| **Product Data** | **SYNTHETIC** | MongoDB `Product` collection (867 records seeded from legacy `masterCatalogData.js` & `seedAllProducts.js`) |
| **Image Data** | **SYNTHETIC / REUSED** | Unsplash stock photo `photo-1511707171634-5f897ff02aa9` with `&idx=N` query params & heuristic Amazon CDN URLs |
| **Price Data** | **SYNTHETIC** | MongoDB `MarketplaceProduct` collection (457 out of 1181 records hardcoded to `currentPrice: 2999`) |
| **Marketplace URL Data** | **SYNTHETIC / GENERATED** | Synthetic ASIN URLs (`/dp/B06A9904...`) & generic store search URLs (`/search?q=...`) |
| **Category Data** | **SYNTHETIC TAXONOMY** | Hardcoded category mapping strings (`smartphone`, `laptop`, `accessories`) |

---

## 1. PRODUCT DATA SOURCE AUDIT

- **MongoDB Collections**:
  - `Product`: **867** records
  - `MarketplaceProduct`: **1181** records
  - `Marketplace`: **7** records
  - `PriceHistory`: **559** records
- **Origin**: Seeded via `server/src/scripts/seedAllProducts.js` and `server/src/scripts/seedMasterProductCatalog.js` from `server/src/data/masterCatalogData.js`.
- **Runtime Usage**: Active at runtime (`GET /api/products` and `GET /api/products/:id` read from MongoDB directly).
- **Frontend Usage**: Displayed across `HomePage.jsx`, `CategoryPage.jsx`, `ProductDetailPage.jsx`, `ComparePage.jsx`, `DashboardPage.jsx`.

---

## 2. PRODUCT IDENTITY AUDIT

- **Current Identifiers**: Products currently rely primarily on MongoDB `_id` (`ObjectId`). `masterCatalogData.js` uses string IDs like `sp-1`, `sp-2`.
- **Synthetic ASIN Generation Root Cause**:
  - In `server/src/scripts/seedAllProducts.js` (line 185):
    ```javascript
    url = `https://www.amazon.in/dp/B0${product._id.toString().toUpperCase()}`
    ```
  - This constructed fake Amazon ASINs by prepending `"B0"` to hex MongoDB ObjectIDs (e.g. `B06A9904E369652590E0AADBF2`), producing invalid marketplace URLs.

---

## 3. PRODUCT NAME & DESCRIPTION AUDIT

- **Names**: Authentic commercial titles (`Apple iPhone 15 Pro`, `Samsung Galaxy S24 Ultra`).
- **Descriptions**: Template-generated strings (e.g. `"Official commercial {category} model {name} powered by flagship mobile silicon..."`).
- **Specs**: Repetitive synthetic spec objects inserted during catalog seeding.

---

## 4. PRICE PIPELINE AUDIT (Root Cause of ₹2,999 Bug)

- **Source**: Directly stored inside MongoDB `MarketplaceProduct.currentPrice`.
- **Empirical Finding**:
  - **457 out of 1,181 `MarketplaceProduct` documents** store `currentPrice: 2999` and `originalPrice: 3449`.
- **Data Flow & Calculation**:
  1. `getProducts` in `server/src/controllers/product.controller.js` fetches all marketplace offers for a product.
  2. Calculates `minPrice` using `Math.min(...prices)`.
  3. Because 457 records possess a legacy synthetic offer of `2999`, `Math.min(2999, 153900)` returns **`2999`**.
  4. Result: Premium products like `Apple iPhone 16e`, `Samsung Galaxy Z Fold 6`, and `Samsung Galaxy A55 5G` render **₹2,999** on the frontend.

---

## 5. MARKETPLACE URL AUDIT

- **Direct URLs vs Search URLs**:
  - 305 URLs are generic store search queries (`https://www.flipkart.com/search?q=...` or `https://www.croma.com/search?q=...`).
  - 876 URLs were generated using the fake ASIN template `https://www.amazon.in/dp/B0<OBJECTID>`.
- **Real Verified Direct URLs**: `0` (Zero direct product API verified URLs present in legacy data).

---

## 6. IMAGE SOURCE & FALLBACK ANALYSIS (Root Cause of Same Image Bug)

- **Root Cause**:
  - In `masterCatalogData.js` and `seed.js`, hundreds of products share the exact same Unsplash photo URL (`https://images.unsplash.com/photo-1511707171634-5f897ff02aa9`) with arbitrary query parameters like `&idx=1`, `&idx=2` appended.
  - Web servers ignore `idx` parameters on static image assets; thus, the browser renders the exact same photo for every product.
- **Image Fallback Pipeline**:
  1. `Product.image` field is fetched from MongoDB.
  2. Passed to `ProductImage.jsx`.
  3. If `src` is `null` or if `<img>` triggers `onError`, `ProductImage.jsx` displays the placeholder: `"Verified image unavailable / Product identity preserved"`.

---

## 7. AMAZON CDN IMAGE AUDIT

- Images utilizing `m.media-amazon.com/images/I/...` in legacy data came from static heuristic mappings (`VERIFIED_CDN_MAPPINGS`) or generic string matching.
- **Provenance**: None of the 867 legacy products have direct Level-6 official API provenance.

---

## 8. SERPAPI PIPELINE AUDIT

- **Environment Loading**: Fixed in Phase 5A.3.2 (`dotenv` loads `.env` and `server/.env` dynamically).
- **Key Status**: `SERPAPI_API_KEY_PRESENT: YES`, Length: `13`.
- **Current Blocker**: The configured key is `YOUR_REAL_KEY` (a placeholder string). Live SerpAPI HTTP calls return `HTTP 401 Unauthorized` (`Invalid API key`).

---

## 9. FRONTEND DATA FLOW

```text
CategoryPage.jsx
  │
  ├──> GET /api/products?category=smartphone
  │       │
  │       └──> product.controller.js (getProducts)
  │               │
  │               └──> Product.find({ category: 'smartphone' })
  │                       │
  │                       └──> MongoDB (Returns 867 synthetic legacy records)
  │
  ├──> minPrice = Math.min(...prices)  ==> returns 2999 for items with legacy 2999 offer
  │
  └──> ProductImage.jsx (renders product.image or fallback placeholder)
```

---

## 10. ROOT-CAUSE SUMMARY

The browser displays synthetic products, repeated ₹2,999 prices, wrong/repeated images, and legacy marketplace URLs because:
1. **API Controller**: `product.controller.js` queries the legacy MongoDB collection directly without filtering for `source = live_verified`.
2. **Hardcoded Seed Prices**: `MarketplaceProduct` contains 457 documents hardcoded to `currentPrice: 2999`, which forces `minPrice` to select ₹2,999.
3. **Reused Seed Images**: `masterCatalogData.js` assigned the same Unsplash URL (`photo-1511707171634-5f897ff02aa9`) to hundreds of products.
4. **Unauthenticated Live API**: SerpAPI API key is set to placeholder `YOUR_REAL_KEY`, preventing live catalog ingestion from replacing synthetic data.

---

## 11. RECOMMENDED FIX ORDER

1. Configure valid live SerpAPI API key in `server/.env`.
2. Add catalog filter `source = 'live_verified'` in `product.controller.js` to isolate synthetic legacy records.
3. Establish unique SKU/ASIN product identity schema.
4. Run live SerpAPI pilot ingestion for 20 target products.
5. Populate exact Level-6 official manufacturer/API images and purge Unsplash URLs.
6. Enforce runtime image deduplication guard on category listings.
7. Replace synthetic 2999 prices with verified live offer prices.
8. Connect frontend exclusively to live-verified product endpoints.
