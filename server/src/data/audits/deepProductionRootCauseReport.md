# Deep Production Root-Cause Audit Report — TREND-TECH-2

## 1. Database Baseline (Read-Only Verification)

- **Products Count**: 867
- **MarketplaceProducts Count**: 1181
- **Marketplaces Count**: 7
- **PriceHistories Count**: 559
- **Database Modification**: NONE (Read-Only)

---

## 2. Product Image Status Distribution

```json
{
  "IMAGE_AMAZON_CDN": 36,
  "IMAGE_NULL": 590,
  "IMAGE_UNSPLASH": 241
}
```

---

## 3. Image Failure Layer Trace

1. **Database Layer**: 590 products have `image: null`; 241 have stock Unsplash URLs.
2. **Backend API Layer**: Image details pipeline flags Unsplash URLs as stock (`GENERIC`) and returns `image: null` for safety.
3. **API Serialization Layer**: `offers` array and high-resolution CDN images populated when verified mapping exists.
4. **Frontend Layer**: `ProductImage.jsx` renders neutral fallback badge ("Verified image unavailable") when `image` prop is `null`.

---

## 4. Browser Network Image HTTP Status Distribution

```json
{
  "200": 3,
  "404": 9,
  "invalid": 3
}
```

---

## 5. Category & Brand Integrity Audit

- **Smartphones Analyzed**: 483
- **Category Mismatches Detected**: 99
- **Xiaomi Non-Phone Products in Smartphone Category**: 0

---

## 6. Offer & ASIN Integrity Audit

- **Total Marketplace Offers**: 1181
- **Offers with Search / Fallback URLs**: 305
- **Amazon ASIN Listings Identified**: 626
- **Repeated ASINs**: 2

---

## 7. Root Cause Confirmation & Repair Order

ROOT_CAUSE_CONFIRMED:
1. Category mapping rules previously allowed tablets and accessories to inherit parent brand names and get stored or mapped as smartphones.
2. Unsplash image URLs in raw database records are correctly rejected by the image pipeline as non-exact photography, resulting in null image fields unless a verified manufacturer/store CDN image mapping is present.
3. API controller endpoints historically omitted populated `offers` arrays in multi-product list queries.

REPAIR_ORDER:
1. Standardize backend DTO serialization to populate offers and canonical category across all endpoints.
2. Enforce strict device classification in categoryMapper.js to isolate tablets, smartwatches, and laptops from smartphone routes.
3. Provide direct store offer URLs for View Deal navigation without search fallbacks.
4. Audit image pipeline CDN mappings to ensure 100% verified photography for real catalog models.
5. Preserve database baseline counts without dropping or reseeding records.

DATABASE_MODIFIED:
NO
