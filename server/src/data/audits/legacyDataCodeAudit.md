# TREND-TECH-2 — Legacy Data & Code Audit Report

## Inventory of Legacy Data Scripts & Catalogs
### server/src/scripts/seedVerifiedCatalog.js
- **Purpose**: Seeds static initial verified products data
- **Type**: LEGACY
- **Safe to Run**: NO
- **Reason**: Contains static JSON product records without live SerpAPI ASIN provenance.

### server/src/data/verifiedCatalog.data.js
- **Purpose**: Static verified product catalog definitions
- **Type**: LEGACY
- **Safe to Run**: NO
- **Reason**: Contains static catalog mappings with synthetic ASIN patterns.

### server/src/data/masterCatalogData.js
- **Purpose**: Full synthetic 867-product fallback data array
- **Type**: LEGACY
- **Safe to Run**: NO
- **Reason**: Legacy synthetic product catalog used in initial seeders.

### server/src/services/imagePipeline.service.js
- **Purpose**: Legacy image fallback resolver
- **Type**: LEGACY
- **Safe to Run**: NO
- **Reason**: Contains static image mappings that could override product images if enabled.

