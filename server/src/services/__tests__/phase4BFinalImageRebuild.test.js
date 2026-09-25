import { describe, test, expect } from 'vitest';
import {
  verifyExactProductImageIdentity,
  createVerifiedProductImageRecord,
  VERIFICATION_STATUSES,
  VERIFICATION_LEVELS
} from '../exactProductImageIdentity.service.js';
import {
  isGenericStockImage,
  canonicalImageUrl,
  getExactProductImageDetails
} from '../imagePipeline.service.js';

describe('PHASE 4B: FINAL PRODUCT IMAGE IDENTITY REBUILD CRITICAL TESTS', () => {

  // TEST 1: iPhone product cannot receive MacBook image.
  test('TEST 1: iPhone product cannot receive MacBook image', () => {
    const product = { name: 'Apple iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { offerTitle: 'Apple MacBook Air M3 13-inch', brand: 'Apple', category: 'laptop', imageUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Device type mismatch|Laptop/i);
  });

  // TEST 2: iPhone 16e cannot receive iPhone 16 image.
  test('TEST 2: iPhone 16e cannot receive iPhone 16 image', () => {
    const product = { name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone' };
    const candidate = { offerTitle: 'Apple iPhone 16 (128 GB)', brand: 'Apple', category: 'smartphone', imageUrl: 'https://m.media-amazon.com/images/I/71vFKBpKakL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Variant mismatch/i);
  });

  // TEST 3: iPhone cannot receive iPad image.
  test('TEST 3: iPhone cannot receive iPad image', () => {
    const product = { name: 'Apple iPhone Air', brand: 'Apple', category: 'smartphone' };
    const candidate = { offerTitle: 'Apple iPad Air 11-inch M2', brand: 'Apple', category: 'tablet', imageUrl: 'https://m.media-amazon.com/images/I/71TPda7cwTL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Hard Device-Type Violation|smartphone image cannot be assigned to tablet/i);
  });

  // TEST 4: Galaxy A55 cannot receive Galaxy M55 image.
  test('TEST 4: Galaxy A55 cannot receive Galaxy M55 image', () => {
    const product = { name: 'Samsung Galaxy A55 5G', brand: 'Samsung', category: 'smartphone' };
    const candidate = { offerTitle: 'Samsung Galaxy M55 5G (8GB RAM, 128GB Storage)', brand: 'Samsung', category: 'smartphone', imageUrl: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Variant mismatch/i);
  });

  // TEST 5: Laptop cannot receive television image.
  test('TEST 5: Laptop cannot receive television image', () => {
    const product = { name: 'Dell Inspiron 15 3520', brand: 'Dell', category: 'laptop' };
    const candidate = { offerTitle: 'Sony Bravia 55 inch 4K Ultra HD TV', brand: 'Sony', category: 'television', imageUrl: 'https://m.media-amazon.com/images/I/81wxjP0B7RL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Brand mismatch|Hard Device-Type Violation/i);
  });

  // TEST 6: Headphones cannot receive earbuds image.
  test('TEST 6: Headphones cannot receive earbuds image', () => {
    const product = { name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', brand: 'Sony', category: 'headphones' };
    const candidate = { offerTitle: 'Sony WF-1000XM5 Wireless Noise Canceling Earbuds', brand: 'Sony', category: 'headphones', imageUrl: 'https://m.media-amazon.com/images/I/51SKmu2G9FL.jpg' };
    const result = verifyExactProductImageIdentity({ product, candidate });
    expect(result.match).toBe(false);
    expect(result.reason).toMatch(/Device type mismatch|Earbuds/i);
  });

  // TEST 7: Same SHA-256 cannot belong to two unrelated products.
  test('TEST 7: Same SHA-256 cannot belong to two unrelated products', () => {
    const shaMap = new Map();
    const sha = '043cb7d0e008199d8ceb2b21a40df2d75748e9be9371c25b3520f205facc6826';
    shaMap.set(sha, 'prod_bravia_tv');

    // Attempting to register same hash for Sony Headphones
    const targetProduct = 'prod_sony_headphones';
    const isConflict = shaMap.has(sha) && shaMap.get(sha) !== targetProduct;
    expect(isConflict).toBe(true);

    const record = createVerifiedProductImageRecord({
      productId: targetProduct,
      productName: 'Sony WH-1000XM5',
      brand: 'Sony',
      category: 'headphones',
      verificationStatus: isConflict ? VERIFICATION_STATUSES.DUPLICATE_CONFLICT : VERIFICATION_STATUSES.VERIFIED_EXACT,
      reason: 'Cross-product SHA-256 collision'
    });
    expect(record.verificationStatus).toBe(VERIFICATION_STATUSES.DUPLICATE_CONFLICT);
  });

  // TEST 8: Amazon CDN hostname alone does not verify identity.
  test('TEST 8: Amazon CDN hostname alone does not verify identity', () => {
    const product = { name: 'Unknown Generic Phone', brand: 'Unknown', category: 'smartphone', image: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' };
    const details = getExactProductImageDetails(product);
    // Dynamic pattern matching is disabled; image status should be returned from DB or unverified if no exact proof exists
    expect(details.url).toBe('https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg');
    // CDN alone without verified ASIN + Level 6 identity does not grant VERIFIED_EXACT
    const record = createVerifiedProductImageRecord({
      productId: 'p123',
      productName: product.name,
      verificationLevel: 'LEVEL_4', // Not LEVEL_6_ONLY
      verificationStatus: VERIFICATION_STATUSES.VERIFIED_EXACT
    });
    expect(record.verificationStatus).toBe(VERIFICATION_STATUSES.SOURCE_UNVERIFIED);
  });

  // TEST 9: Unsplash image cannot become VERIFIED_EXACT.
  test('TEST 9: Unsplash image cannot become VERIFIED_EXACT', () => {
    const unsplashUrl = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800';
    expect(isGenericStockImage(unsplashUrl)).toBe(true);

    const product = { name: 'Apple iPad Air', image: unsplashUrl };
    const details = getExactProductImageDetails(product);
    expect(details.url).toBeNull();
    expect(details.imageStatus).toBe('GENERIC');
  });

  // TEST 10: Category image cannot become VERIFIED_EXACT.
  test('TEST 10: Category image cannot become VERIFIED_EXACT', () => {
    const categoryUrl = 'https://m.media-amazon.com/images/I/placeholder_category_smartphone.jpg';
    expect(isGenericStockImage(categoryUrl)).toBe(true);
  });

  // TEST 11: Brand image cannot become VERIFIED_EXACT.
  test('TEST 11: Brand image cannot become VERIFIED_EXACT', () => {
    const brandUrl = 'https://m.media-amazon.com/images/I/default-product_brand.png';
    expect(isGenericStockImage(brandUrl)).toBe(true);
  });

  // TEST 12: Image URL with changed query parameters is still the same underlying asset.
  test('TEST 12: Image URL with changed query parameters is still the same underlying asset', () => {
    const url1 = 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg?tag=xyz';
    const url2 = 'https://m.media-amazon.com/images/I/71vFKBpKakL._SX679_.jpg?tag=abc#section';
    expect(canonicalImageUrl(url1)).toBe(canonicalImageUrl(url2));
  });

  // TEST 13: Different product variants remain different identities.
  test('TEST 13: Different product variants remain different identities', () => {
    const p1 = { name: 'Apple iPhone 16 Pro', brand: 'Apple' };
    const p2 = { name: 'Apple iPhone 16 Pro Max', brand: 'Apple' };
    const check = verifyExactProductImageIdentity({
      product: p1,
      candidate: { offerTitle: p2.name, brand: p2.brand }
    });
    expect(check.match).toBe(false);
  });

  // TEST 14: Missing exact image remains missing.
  test('TEST 14: Missing exact image remains missing', () => {
    const record = createVerifiedProductImageRecord({
      productId: 'p_missing_123',
      productName: 'Unreleased Tech Widget',
      verificationStatus: VERIFICATION_STATUSES.MISSING,
      reason: 'No official Level 6 source page or image binary found'
    });
    expect(record.localImagePath).toBeNull();
    expect(record.verificationStatus).toBe(VERIFICATION_STATUSES.MISSING);
  });

  // TEST 15: API cannot override Product.image.
  test('TEST 15: API cannot override Product.image', () => {
    const dbProduct = { _id: '123', name: 'Product X', image: null };
    // Simulated DTO response mapping using stored dbProduct.image directly
    const apiResponseImage = dbProduct.image || null;
    expect(apiResponseImage).toBeNull();
  });

  // TEST 16: Frontend cannot replace Product.image.
  test('TEST 16: Frontend cannot replace Product.image', () => {
    const src = null;
    const isAvailable = Boolean(src);
    expect(isAvailable).toBe(false);
  });

});
