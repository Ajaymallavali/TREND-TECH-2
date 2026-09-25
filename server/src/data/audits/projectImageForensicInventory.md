# PROJECT IMAGE FORENSIC INVENTORY

### server/src/models/Product.model.js
- **Role**: Product Schema Definition
- **Description**: Defines Product model including image, imageStatus, imageSourceUrl, imageSource, imageVerifiedAt

### server/src/models/MarketplaceProduct.model.js
- **Role**: Marketplace Product Schema
- **Description**: Defines listing url, currentPrice, image, productId

### server/src/utils/productDTO.js
- **Role**: API DTO Formatting
- **Description**: Formats Product for API responses

### server/src/controllers/product.controller.js
- **Role**: Product API Controller
- **Description**: Handles product list, details, search, deals endpoints

### server/src/services/imagePipeline.service.js
- **Role**: Legacy Image Pipeline Service
- **Description**: Contains getExactProductImageDetails, VERIFIED_CDN_MAPPINGS, isGenericStockImage

### server/src/services/exactProductImageIdentity.service.js
- **Role**: Exact Image Identity Service
- **Description**: Verifies exact brand, model, and device type compatibility

### server/src/utils/urlValidator.js
- **Role**: URL & Identity Validator
- **Description**: Validates marketplace URLs and product identity matching

### server/src/utils/imageValidator.js
- **Role**: Image Byte Validator
- **Description**: Validates image magic bytes, dimensions, SHA-256 hash

### server/src/utils/categoryMapper.js
- **Role**: Category Mapper
- **Description**: Maps product category strings to canonical categories

### server/src/data/realVerifiedCatalog.js
- **Role**: Real Verified Catalog Data
- **Description**: Static seed data array containing initial product records and images

### client/src/components/ProductImage.jsx
- **Role**: Frontend Image Renderer
- **Description**: Renders product.image or ImageOff placeholder if missing/error
