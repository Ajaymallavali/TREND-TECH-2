# MASTER FORENSIC FILE INVENTORY REPORT

- **File**: `server/src/data/masterCatalogData.js`
  - **Entities**: Product, MarketplaceProduct, PriceHistory
  - **Role**: Static Master Catalog Data
  - **Type**: `STATIC_SEED_SOURCE`

- **File**: `server/src/data/realVerifiedCatalog.js`
  - **Entities**: Product, MarketplaceProduct
  - **Role**: Ingestion Reference Dataset
  - **Type**: `STATIC_REFERENCE_SOURCE`

- **File**: `server/src/scripts/seedAllProducts.js`
  - **Entities**: Product, MarketplaceProduct, PriceHistory
  - **Role**: Legacy Master Seeder Script
  - **Type**: `SYNTHETIC_SEEDER_SCRIPT`

- **File**: `server/src/scripts/seedProfessionalCatalog.js`
  - **Entities**: Product, MarketplaceProduct
  - **Role**: SerpAPI Product Seeder Script
  - **Type**: `SERPAPI_SEEDER_SCRIPT`

- **File**: `server/src/services/realCatalogIngestion.service.js`
  - **Entities**: Product, MarketplaceProduct
  - **Role**: Catalog Ingestion Service
  - **Type**: `INGESTION_SERVICE`

- **File**: `server/src/services/imagePipeline.service.js`
  - **Entities**: Product.image
  - **Role**: Image Resolution Service
  - **Type**: `IMAGE_SERVICE`

- **File**: `server/src/controllers/product.controller.js`
  - **Entities**: Product, MarketplaceProduct
  - **Role**: API Controller
  - **Type**: `API_CONTROLLER`

- **File**: `client/src/components/ProductImage.jsx`
  - **Entities**: Product.image
  - **Role**: Frontend Image Component
  - **Type**: `FRONTEND_COMPONENT`

