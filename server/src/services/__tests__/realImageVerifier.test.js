import { describe, test, expect } from 'vitest';
import {
  verifyRealProductImage,
  canonicalImageUrl,
  calculateImageSha256,
  isGenericStockImage
} from '../realImageVerifier.service.js';

describe('PHASE 5A REAL IMAGE VERIFIER UNIT TESTS', () => {

  // TEST 9: identical SHA256 across unrelated products -> REJECT
  test('TEST 9: identical SHA256 across unrelated products -> REJECT', () => {
    const shaRegistry = new Map();
    const targetUrl = 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg';
    const sha = calculateImageSha256(targetUrl);
    shaRegistry.set(sha, 'prod_galaxy_s24');

    const res = verifyRealProductImage({
      imageUrl: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg',
      productId: 'prod_bravia_tv',
      shaRegistry
    });

    // SHA calculation maps to same hash
    expect(res.valid).toBe(false);
    expect(res.status).toBe('DUPLICATE_CONFLICT');
    expect(res.reason).toMatch(/DUPLICATE_CONFLICT|shared/i);
  });

  // TEST 10: same image URL with different query parameters -> DUPLICATE
  test('TEST 10: same image URL with different query parameters -> DUPLICATE', () => {
    const url1 = 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg?tag=xyz';
    const url2 = 'https://m.media-amazon.com/images/I/71vFKBpKakL._SX679_.jpg?tag=abc#section';
    expect(canonicalImageUrl(url1)).toBe(canonicalImageUrl(url2));
  });

  // TEST 11: Unsplash image -> REJECT
  test('TEST 11: Unsplash image -> REJECT', () => {
    const unsplashUrl = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800';
    expect(isGenericStockImage(unsplashUrl)).toBe(true);

    const res = verifyRealProductImage({ imageUrl: unsplashUrl, productId: 'p123' });
    expect(res.valid).toBe(false);
    expect(res.status).toBe('GENERIC_REJECTED');
  });

  // TEST 15: missing exact image -> IMAGE_UNAVAILABLE
  test('TEST 15: missing exact image -> IMAGE_UNAVAILABLE', () => {
    const res = verifyRealProductImage({ imageUrl: null, productId: 'p999' });
    expect(res.valid).toBe(false);
    expect(res.status).toBe('IMAGE_UNAVAILABLE');
  });

});
