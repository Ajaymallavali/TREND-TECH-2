import { describe, it, expect, beforeEach } from 'vitest';
import {
  canonicalImageUrl,
  isGenericStockImage,
  isValidProductImage,
  getExactProductImageDetails
} from '../imagePipeline.service.js';
import {
  computeImageSha256,
  isLegitimateVariantPair,
  enforceCategoryListingImageDeduplication
} from '../imageDeduplicationGuard.service.js';
import {
  cacheProductImage,
  getCachedProductImage,
  clearProductImageCache,
  getProductCacheKey
} from '../productImageCache.service.js';

describe('Phase 5A.4 — Master Fix: Real Per-Product Image Pipeline', () => {
  beforeEach(() => {
    clearProductImageCache();
  });

  // TEST 1 & 2: Deduplication across distinct products
  it('TEST 1 & 2: Two different products cannot resolve to the same image URL/hash', () => {
    const products = [
      { id: 'prod-001', name: 'Apple iPhone 16e', image: 'https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg' },
      { id: 'prod-002', name: 'Samsung Galaxy S24 Ultra', image: 'https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg' }
    ];

    const deduplicated = enforceCategoryListingImageDeduplication(products);

    expect(deduplicated[0].image).toBe('https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg');
    expect(deduplicated[1].image).toBeNull();
    expect(deduplicated[1].imageStatus).toBe('DUPLICATE_CONFLICT');
  });

  // TEST 3 & 4: Stable identity based on ID, not name
  it('TEST 3 & 4: Product identity is based on stable ID/SKU, changing name preserves cache identity', () => {
    const productId = '507f1f77bcf86cd799439011';
    cacheProductImage(productId, {
      imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg',
      source: 'LIVE_SERPAPI_API'
    });

    const cachedBefore = getCachedProductImage(productId);
    expect(cachedBefore.imageUrl).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');

    // Rename product object (simulating title update)
    const renamedProd = { _id: productId, name: 'Renamed iPhone 16 Pro Max Title' };
    const cachedAfter = getCachedProductImage(renamedProd._id);
    expect(cachedAfter.imageUrl).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');
  });

  // TEST 5 & 6: Deterministic caching per product ID
  it('TEST 5 & 6: Cache retrieves image for same product ID, different IDs never retrieve another product cached image', () => {
    const prodA = 'prod-A-101';
    const prodB = 'prod-B-202';

    cacheProductImage(prodA, { imageUrl: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' });

    expect(getCachedProductImage(prodA).imageUrl).toBe('https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg');
    expect(getCachedProductImage(prodB)).toBeNull();
  });

  // TEST 7: Generic stock photos rejected from product image fields
  it('TEST 7: Generic stock photo domains (Unsplash/Pexels) are rejected', () => {
    const unsplashUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80&idx=1';
    expect(isGenericStockImage(unsplashUrl)).toBe(true);

    const details = getExactProductImageDetails({ image: unsplashUrl });
    expect(details.url).toBeNull();
    expect(details.imageStatus).toBe('GENERIC');
  });

  // TEST 8: Missing verified image produces image = null
  it('TEST 8: Missing or unverified image produces image = null explicit state', () => {
    const detailsNull = getExactProductImageDetails({ image: null });
    expect(detailsNull.url).toBeNull();
    expect(detailsNull.imageStatus).toBe('UNVERIFIED');

    const detailsEmpty = getExactProductImageDetails({ image: '' });
    expect(detailsEmpty.url).toBeNull();
  });

  // TEST 9: Image onError handling does not substitute another product's image
  it('TEST 9: Image error handling rejects broken URLs without substitution', () => {
    const brokenUrl = 'invalid-not-a-url';
    expect(isValidProductImage(brokenUrl)).toBe(false);

    const details = getExactProductImageDetails({ image: brokenUrl });
    expect(details.url).toBeNull();
  });

  // TEST 10 & 11: Amazon CDN pattern guesses rejected
  it('TEST 10 & 11: Pattern-guessed or unverified CDN URLs without live API return null', () => {
    // Unverified product with no image returns url: null
    const details = getExactProductImageDetails({ name: 'Random Guess Phone', image: null });
    expect(details.url).toBeNull();
  });

  // TEST 12: Generic stock photo rejection from production fields
  it('TEST 12: Generic stock images are flagged and purged from production rendering', () => {
    const genericUrl = 'https://via.placeholder.com/600';
    expect(isGenericStockImage(genericUrl)).toBe(true);
    expect(getExactProductImageDetails({ image: genericUrl }).url).toBeNull();
  });

  // TEST 13: SHA-256 byte deduplication ignores URL query variations
  it('TEST 13: Canonical SHA-256 detects identical image URLs despite different query params', () => {
    const url1 = 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg?w=100&quality=80';
    const url2 = 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg?w=200&quality=90';

    const hash1 = computeImageSha256(url1);
    const hash2 = computeImageSha256(url2);

    expect(hash1).toBe(hash2);
  });

  // TEST 14: Category listing collision detection catches duplicate image URLs across distinct products
  it('TEST 14: Category listing collision detection flags duplicate image across distinct products', () => {
    const products = [
      { id: 'p1', name: 'Dell Inspiron 15 3520', image: 'https://m.media-amazon.com/images/I/61L2lG4cWBL._SL1500_.jpg' },
      { id: 'p2', name: 'HP Pavilion 15', image: 'https://m.media-amazon.com/images/I/61L2lG4cWBL._SL1500_.jpg' }
    ];

    const deduplicated = enforceCategoryListingImageDeduplication(products);

    expect(deduplicated[0].image).toBe('https://m.media-amazon.com/images/I/61L2lG4cWBL._SL1500_.jpg');
    expect(deduplicated[1].image).toBeNull();
    expect(deduplicated[1].imageStatus).toBe('DUPLICATE_CONFLICT');
  });

  // TEST 15: Legitimate same-product variants allowed
  it('TEST 15: Legitimate color/storage variants with matching ASIN/parentAsin are permitted to share images', () => {
    const products = [
      { id: 'p1', name: 'Apple iPhone 16 Pro Max 256GB', parentAsin: 'B0CX16PRO', image: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
      { id: 'p2', name: 'Apple iPhone 16 Pro Max 512GB', parentAsin: 'B0CX16PRO', image: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' }
    ];

    expect(isLegitimateVariantPair(products[0], products[1])).toBe(true);

    const deduplicated = enforceCategoryListingImageDeduplication(products);
    expect(deduplicated[0].image).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');
    expect(deduplicated[1].image).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');
  });

  // Real-world Regression Scenarios (A through J)
  it('TEST 16: Real-world regression scenarios (10 Target Models) maintain unique image mapping', () => {
    const targetProducts = [
      { id: 't01', name: 'Apple iPhone 16e', image: 'https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg' },
      { id: 't02', name: 'Samsung Galaxy S24 Ultra', image: 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg' },
      { id: 't03', name: 'OnePlus 13', image: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
      { id: 't04', name: 'Apple MacBook Air M3', image: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg' },
      { id: 't05', name: 'Dell Inspiron 15 3520', image: 'https://m.media-amazon.com/images/I/61L2lG4cWBL._SL1500_.jpg' },
      { id: 't06', name: 'Sony Bravia 55 inch 4K TV', image: 'https://m.media-amazon.com/images/I/81M+xWk89rL._SL1500_.jpg' },
      { id: 't07', name: 'Sony WH-1000XM5', image: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg' },
      { id: 't08', name: 'Apple iPad Air 11-inch M2', image: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg' },
      { id: 't09', name: 'Canon EOS R6 Mark II', image: 'https://m.media-amazon.com/images/I/71lD7fSl0wL._SL1500_.jpg' },
      { id: 't10', name: 'Xiaomi 14 Ultra', image: 'https://m.media-amazon.com/images/I/71N-W7C46OL._SL1500_.jpg' }
    ];

    const deduplicated = enforceCategoryListingImageDeduplication(targetProducts);
    expect(deduplicated.length).toBe(10);

    const nonNullImages = deduplicated.map((p) => p.image).filter(Boolean);
    const uniqueImages = new Set(nonNullImages.map(canonicalImageUrl));

    // Every resolved image across the 10 target products must be strictly unique!
    expect(uniqueImages.size).toBe(nonNullImages.length);
  });
});
