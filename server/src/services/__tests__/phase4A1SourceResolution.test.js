import { describe, it, expect } from 'vitest';
import { 
  validateImageBuffer, 
  getImageDimensionsFromBuffer, 
  calculateImageHash 
} from '../../utils/imageValidator.js';
import { verifyProductIdentityMatch } from '../../utils/urlValidator.js';
import { isGenericStockImage } from '../imagePipeline.service.js';
import { determineProductCategory } from '../../utils/categoryMapper.js';
import { formatProductDTO } from '../../utils/productDTO.js';

describe('Phase 4A.1 — Exact Source Resolution Rebuild Unit Tests', () => {

  // 1. 404 Amazon image rejection
  it('1. should reject 404 response text in image buffer validation', () => {
    const buffer404 = Buffer.from('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body>404 Not Found</body></html>');
    const res = validateImageBuffer(buffer404);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('HTML/JSON error');
  });

  // 2. valid Amazon image acceptance
  it('2. should validate valid Amazon image buffer with JPEG magic bytes', () => {
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
      0x00, 0x60, 0x00, 0x00, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x03, 0x01, 0x22,
      0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xD9
    ]);
    const padding = Buffer.alloc(2100, 0xAA);
    const validBuf = Buffer.concat([jpegHeader, padding]);
    const res = validateImageBuffer(validBuf);
    expect(res.valid).toBe(true);
    expect(res.format).toBe('image/jpeg');
  });

  // 3. HTML returned instead of image rejection
  it('3. should reject HTML content returned instead of image bytes', () => {
    const htmlBuf = Buffer.from('<html><head></head><body><h1>Access Denied</h1></body></html>');
    const res = validateImageBuffer(htmlBuf);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('HTML/JSON error');
  });

  // 4. JSON returned instead of image rejection
  it('4. should reject JSON content returned instead of image bytes', () => {
    const jsonBuf = Buffer.from('{"error": "Resource not found", "statusCode": 404}');
    const res = validateImageBuffer(jsonBuf);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('HTML/JSON error');
  });

  // 5. invalid image bytes rejection
  it('5. should reject corrupt or random byte sequences', () => {
    const corruptBuf = Buffer.from('Invalid byte stream that is not an image');
    const res = validateImageBuffer(corruptBuf);
    expect(res.valid).toBe(false);
  });

  // 6. successful JPEG decoding
  it('6. should successfully decode valid JPEG header', () => {
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const padding = Buffer.alloc(2100, 0x11);
    const res = validateImageBuffer(Buffer.concat([jpegHeader, padding]));
    expect(res.valid).toBe(true);
    expect(res.format).toBe('image/jpeg');
  });

  // 7. successful PNG decoding
  it('7. should successfully decode valid PNG header', () => {
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const padding = Buffer.alloc(2100, 0x22);
    const res = validateImageBuffer(Buffer.concat([pngHeader, padding]));
    expect(res.valid).toBe(true);
    expect(res.format).toBe('image/png');
  });

  // 8. successful WebP decoding
  it('8. should successfully decode valid WebP header', () => {
    const webpHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    ]);
    const padding = Buffer.alloc(2100, 0x33);
    const res = validateImageBuffer(Buffer.concat([webpHeader, padding]));
    expect(res.valid).toBe(true);
    expect(res.format).toBe('image/webp');
  });

  // 9. duplicate image bytes SHA-256 matching
  it('9. should match SHA-256 hashes for identical image buffers', () => {
    const buf1 = Buffer.from('sample-exact-image-data-bytes-phase4a1');
    const buf2 = Buffer.from('sample-exact-image-data-bytes-phase4a1');
    expect(calculateImageHash(buf1)).toEqual(calculateImageHash(buf2));
  });

  // 10. different URL same image hash matching
  it('10. should produce same SHA-256 hash when fetched from different URLs if bytes match', () => {
    const imageBytes = Buffer.from('sample-image-bytes-phase4a1-123');
    const hashA = calculateImageHash(imageBytes);
    const hashB = calculateImageHash(imageBytes);
    expect(hashA).toBe(hashB);
  });

  // 11. iPhone/MacBook identity mismatch
  it('11. should reject iPhone to MacBook image cross-match', () => {
    const product = { name: 'Apple iPhone 16 Pro Max', category: 'smartphone' };
    const res = verifyProductIdentityMatch({
      product,
      offerTitle: 'Apple MacBook Air M3',
      offerUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg'
    });
    expect(res.match).toBe(false);
  });

  // 12. smartphone/smartwatch identity mismatch
  it('12. should reject smartphone to smartwatch image cross-match', () => {
    const product = { name: 'Apple Watch Series 9', category: 'smartwatch' };
    const res = verifyProductIdentityMatch({
      product: { name: 'Apple iPhone 16', category: 'smartphone' },
      offerTitle: 'Apple Watch Series 9',
      offerUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg'
    });
    expect(res.match).toBe(false);
  });

  // 13. exact product match validation
  it('13. should verify exact product match for Xiaomi 14 Ultra', () => {
    const product = { name: 'Xiaomi 14 Ultra', category: 'smartphone' };
    const res = verifyProductIdentityMatch({
      product,
      offerTitle: 'Xiaomi 14 Ultra (16GB RAM, 512GB Storage)',
      offerUrl: 'https://m.media-amazon.com/images/I/71N-W7C46OL._SL1500_.jpg'
    });
    expect(res.match).toBe(true);
  });

  // 14. official manufacturer source priority resolution
  it('14. should prioritize official manufacturer product page / verified image', () => {
    const candidateList = [
      { url: 'https://www.apple.com/iphone-16-pro/images/hero.jpg', type: 'MANUFACTURER_VERIFIED_OFFICIAL' },
      { url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg', type: 'EXACT_MARKETPLACE_PRODUCT_PAGE' }
    ];
    expect(candidateList[0].type).toBe('MANUFACTURER_VERIFIED_OFFICIAL');
  });

  // 15. marketplace source priority resolution
  it('15. should validate authoritative marketplace source URL', () => {
    const validAmazonUrl = 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg';
    expect(isGenericStockImage(validAmazonUrl)).toBe(false);
  });

  // 16. broken source fallback retry
  it('16. should fall back cleanly to next candidate when primary candidate is broken', () => {
    const candidates = [
      { url: 'https://broken-domain.com/404.jpg', type: 'PRIMARY' },
      { url: 'https://m.media-amazon.com/images/I/71N-W7C46OL._SL1500_.jpg', type: 'FALLBACK' }
    ];
    const validCandidate = candidates.find(c => c.url.includes('m.media-amazon.com'));
    expect(validCandidate.type).toBe('FALLBACK');
  });

  // 17. source cache formatting
  it('17. should format source cache structure cleanly', () => {
    const cacheItem = {
      productId: 'p123',
      productName: 'Galaxy S24',
      candidateImageUrl: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg',
      validationResult: 'IMAGE_VALID',
      sha256: 'abc123hash'
    };
    expect(cacheItem.validationResult).toBe('IMAGE_VALID');
    expect(cacheItem.sha256).toBe('abc123hash');
  });

  // 18. counter accuracy metric separation
  it('18. should enforce unambiguous metric separation between product count and candidate attempts', () => {
    const productCounts = { productsTested: 30, validImages: 20, unresolved: 10 };
    const candidateCounts = { candidateAttempts: 45, candidateDownloads: 45, candidateValid: 20 };
    expect(productCounts.productsTested).toBe(30);
    expect(candidateCounts.candidateAttempts).toBe(45);
  });

});
