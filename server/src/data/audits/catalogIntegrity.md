# TREND-TECH-2 CATALOG INTEGRITY VALIDATION REPORT

**Timestamp**: 2026-09-22T20:10:42.499Z  
**Database**: Products (867), MarketplaceProducts (1181), PriceHistory (559)  
**Catalog Status**: LEGACY CATALOG QUARANTINED (0 Real Ingested Products)

---

## 1. Catalog Metric Overview

- **Total Products**: 867
- **LIVE_VERIFIED Products**: 0
- **LEGACY_SYNTHETIC Products**: 867
- **UNKNOWN Products**: 0

---

## 2. Forensic Anomaly Counts

- **Template Names**: 117
- **Template Descriptions**: 753
- **Category Mismatches**: 0
- **Suspicious Price Repetitions**: 615 (e.g. ₹2,999 hardcoded legacy offer)
- **Missing Prices**: 0
- **Missing Images**: 589
- **Duplicate Image URLs**: 222
- **Duplicate Image SHA-256 Hashes**: 222
- **Generated ASINs**: 625
- **Generated Amazon URLs**: 876
- **Search URLs**: 305
- **Duplicate ASINs**: 0
- **Broken Marketplace Relations**: 0

---

## 3. Database Safety Confirmation

- **Products**: 867 → 867
- **MarketplaceProducts**: 1181 → 1181
- **PriceHistory**: 559 → 559
- **DATABASE MODIFIED**: NO
