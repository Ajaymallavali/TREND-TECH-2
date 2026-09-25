# Phase 2 Runtime Data Flow Documentation — TREND-TECH-2

## 1. Exact Runtime Data Flow Trace for `/category/smartphone`

1. **User Navigation**: Browser navigates to `http://localhost:5173/category/smartphone`.
2. **React Component**: `client/src/pages/CategoryPage.jsx` renders and executes `useQuery({ queryKey: ['category-products', 'smartphone', brandParam, sortBy, budgetFilter] })`.
3. **Frontend API Service**: `CategoryPage.jsx` executes `apiClient.get('/products', { params: { category: 'smartphone', sortBy: 'price_asc' } })`.
4. **HTTP Request**: `GET http://localhost:5001/api/products?category=smartphone&sortBy=price_asc`.
5. **Backend Express Route**: `server/src/routes/product.routes.js` routes `GET /` to `product.controller.js -> getProducts`.
6. **Backend Controller**: `getProducts` normalizes `category` to `targetCanonicalCategory = 'smartphone'`.
7. **MongoDB Query**: Executes `Product.find(filter)` and filters in-memory using `isUserFacingProductEligible(p)` and `determineProductCategory(p) === 'smartphone'`.
8. **Brand Summary Aggregation**: Computes `brandSummary` ONLY across category-eligible products (`determineProductCategory(p) === 'smartphone'`), eliminating global non-smartphone categories (Beauty, Kids, Sports & Fitness) from the sidebar.
9. **Marketplace Listings Population**: Populates listings via `MarketplaceProduct.find({ product: p._id }).populate('marketplace')`.
10. **DTO Serialization**: Maps each product to standard `formatProductDTO` returning `data`, `brandSummary`, and `totalCount`.
11. **Frontend Rendering**: `CategoryPage.jsx` renders `brandSummary` chips and maps `data` to `ProductCard` components.
12. **ProductCard & ProductImage**: `ProductCard` uses `product.image` directly with `ProductImage.jsx` rendering exact verified CDN photography or fallback badge. `View Deal` uses direct `offer.url` in new tab.

---

## 2. Diagnostics & Root Cause Evidence

- **Cause of Global Brand Chips (Beauty, Kids, Sports & Fitness)**: Legacy database records contained string taxonomy names in the `brand` field (e.g., `brand: "Beauty & Personal Care"`). Fixed by validating brand strings and grouping only category-matched products.
- **Cause of MacBook Image on iPhone 16e**: Pattern matching in `VERIFIED_CDN_MAPPINGS` evaluated broad model patterns before checking stored `product.image`. Fixed by checking stored non-stock product image first.
- **Cause of Missing Offers**: `getProducts` controller previously omitted `offers` array. Fixed by including formatted `offers` array in standard product DTO serializer.
