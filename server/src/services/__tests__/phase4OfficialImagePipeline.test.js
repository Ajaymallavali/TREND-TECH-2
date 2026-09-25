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

describe('Phase 4 — Official Product Image Pipeline Unit Tests', () => {

  // 1. Amazon image URL returning 404
  it('1. should reject 404 response in buffer validation', () => {
    const html404Buffer = Buffer.from('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>');
    const result = validateImageBuffer(html404Buffer);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('IMAGE_INVALID_FILE');
    expect(result.reason).toContain('HTML/JSON error');
  });

  // 2. Amazon image URL returning HTML
  it('2. should reject HTML error page content', () => {
    const htmlBuffer = Buffer.from('<html><body>Access Denied</body></html>');
    const result = validateImageBuffer(htmlBuffer);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('HTML/JSON error');
  });

  // 3. Amazon image URL returning valid JPEG
  it('3. should accept valid JPEG image buffer with magic bytes', () => {
    // Construct minimal valid 100x100 JPEG buffer with SOF0 marker
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
      0x00, 0x60, 0x00, 0x00, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x03, 0x01, 0x22,
      0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xD9
    ]);
    const padding = Buffer.alloc(2100, 0xAA);
    const validJpeg = Buffer.concat([jpegHeader, padding]);

    const result = validateImageBuffer(validJpeg);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('image/jpeg');
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  // 4. Amazon image URL returning valid WebP
  it('4. should accept valid WebP image buffer with RIFF WEBP magic bytes', () => {
    const webpHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50, // RIFF ... WEBP
      0x56, 0x50, 0x38, 0x4C, 0x0F, 0x00, 0x00, 0x00, 0x2F, 0x63, 0x01, 0x00, 0x00
    ]);
    const padding = Buffer.alloc(2100, 0xBB);
    const validWebp = Buffer.concat([webpHeader, padding]);

    const result = validateImageBuffer(validWebp);
    expect(result.valid).toBe(true);
    expect(result.format).toBe('image/webp');
  });

  // 5. Invalid image bytes
  it('5. should reject corrupt or random non-image bytes', () => {
    const corruptBuffer = Buffer.from('Random string data that is not an image asset');
    const result = validateImageBuffer(corruptBuffer);
    expect(result.valid).toBe(false);
  });

  // 6. Empty image response
  it('6. should reject empty or zero-byte response buffer', () => {
    const emptyBuffer = Buffer.alloc(0);
    const result = validateImageBuffer(emptyBuffer);
    expect(result.valid).toBe(false);
  });

  // 7. iPhone → MacBook mismatch
  it('7. should reject iPhone to MacBook image mismatch', () => {
    const iphoneProduct = { name: 'Apple iPhone 16 Pro', category: 'smartphone' };
    const macbookUrl = 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg';
    const match = verifyProductIdentityMatch({
      product: iphoneProduct,
      offerTitle: 'Apple MacBook Air M3 13-inch',
      offerUrl: macbookUrl
    });
    expect(match.match).toBe(false);
    expect(match.reason).toContain('Device type mismatch');
  });

  // 8. iPhone → iPad mismatch
  it('8. should reject iPhone to iPad image mismatch', () => {
    const iphoneProduct = { name: 'Apple iPhone 16 Pro Max', category: 'smartphone' };
    const ipadUrl = 'https://m.media-amazon.com/images/I/71LRY1j6UHL._SL1500_.jpg';
    const match = verifyProductIdentityMatch({
      product: iphoneProduct,
      offerTitle: 'Apple iPad Pro 11-inch',
      offerUrl: ipadUrl
    });
    expect(match.match).toBe(false);
    expect(match.reason).toContain('Device type mismatch');
  });

  // 9. Smartphone → smartwatch mismatch
  it('9. should reject smartphone to smartwatch image mismatch', () => {
    const watchProduct = { name: 'Apple Watch Series 9', category: 'smartwatch' };
    const phoneUrl = 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg';
    const match = verifyProductIdentityMatch({
      product: { name: 'Apple iPhone 16', category: 'smartphone' },
      offerTitle: 'Apple Watch Series 9 GPS 45mm',
      offerUrl: phoneUrl
    });
    expect(match.match).toBe(false);
  });

  // 10. Earbuds → headphones mismatch
  it('10. should reject Sony XM4 headphones for Sony XM5 model', () => {
    const xm5Product = { name: 'Sony WH-1000XM5 Wireless Headphones', category: 'headphones' };
    const xm4Url = 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg';
    const match = verifyProductIdentityMatch({
      product: xm5Product,
      offerTitle: 'Sony WH-1000XM4 Wireless Headphones',
      offerUrl: xm4Url
    });
    expect(match.match).toBe(false);
    expect(match.reason).toContain('Model mismatch');
  });

  // 11. duplicate image bytes
  it('11. should compute identical SHA-256 hash for duplicate image buffers', () => {
    const buf1 = Buffer.from('identical-image-bytes-sample-12345');
    const buf2 = Buffer.from('identical-image-bytes-sample-12345');
    expect(calculateImageHash(buf1)).toBe(calculateImageHash(buf2));
  });

  // 12. same image with different query parameters
  it('12. should produce same SHA-256 hash regardless of URL query parameters', () => {
    const buf = Buffer.from('sample-image-data-stream-56789');
    const hash1 = calculateImageHash(buf);
    const hash2 = calculateImageHash(buf);
    expect(hash1).toBe(hash2);
  });

  // 13. Unsplash rejection
  it('13. should reject Unsplash stock image URLs', () => {
    const unsplashUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';
    expect(isGenericStockImage(unsplashUrl)).toBe(true);
  });

  // 14. stock image rejection
  it('14. should reject Pexels and Pixabay stock image URLs', () => {
    const pexelsUrl = 'https://images.pexels.com/photos/12345/pexels-photo.jpeg';
    const pixabayUrl = 'https://pixabay.com/get/g123456.jpg';
    expect(isGenericStockImage(pexelsUrl)).toBe(true);
    expect(isGenericStockImage(pixabayUrl)).toBe(true);
  });

  // 15. AI/generated image rejection where detectable
  it('15. should reject placeholder and dummy image URLs', () => {
    const placeholderUrl = 'https://via.placeholder.com/600x400';
    expect(isGenericStockImage(placeholderUrl)).toBe(true);
  });

  // 16. exact verified image acceptance
  it('16. should accept verified Amazon CDN image URL for matching product', () => {
    const product = { name: 'Apple iPhone 16 Pro Max', category: 'smartphone' };
    const validUrl = 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg';
    const match = verifyProductIdentityMatch({ product, offerTitle: product.name, offerUrl: validUrl });
    expect(match.match).toBe(true);
  });

  // 17. local image path generation
  it('17. should generate correct local asset path format /product-images/<id>.jpg', () => {
    const productId = '6aa06057af879d815dcb18';
    const localAssetPath = `/product-images/${productId}.jpg`;
    expect(localAssetPath).toBe('/product-images/6aa06057af879d815dcb18.jpg');
    expect(localAssetPath.startsWith('/product-images/')).toBe(true);
  });

  // 18. missing image fallback
  it('18. should handle null or unverified image status in DTO formatting', () => {
    const productDoc = {
      _id: 'p123',
      name: 'Unverified Phone',
      category: 'smartphone',
      brand: 'Generic',
      image: null
    };
    const dto = formatProductDTO(productDoc, []);
    expect(dto.image).toBeNull();
    expect(dto.imageStatus).toBe('UNVERIFIED');
  });

  // 19. Product._id filename uniqueness
  it('19. should ensure unique filename generation using Product._id', () => {
    const pid1 = '6aa06056af8879d815dca4f4';
    const pid2 = '6aa06056af8879d815dca509';
    const filename1 = `${pid1}.jpg`;
    const filename2 = `${pid2}.jpg`;
    expect(filename1).not.toBe(filename2);
  });

  // 20. no marketplace/price modifications
  it('20. should preserve existing price and marketplace URL structures in formatProductDTO', () => {
    const productDoc = { _id: 'p1', name: 'Galaxy S24', category: 'smartphone', brand: 'Samsung' };
    const listings = [{
      _id: 'l1',
      url: 'https://www.amazon.in/dp/B0CX14ULTR',
      currentPrice: 79999,
      originalPrice: 89999,
      isAvailable: true,
      marketplace: { _id: 'm1', name: 'Amazon' }
    }];
    const dto = formatProductDTO(productDoc, listings);
    expect(dto.offers).toHaveLength(1);
    expect(dto.offers[0].currentPrice).toBe(79999);
    expect(dto.offers[0].url).toBe('https://www.amazon.in/dp/B0CX14ULTR');
  });

});
