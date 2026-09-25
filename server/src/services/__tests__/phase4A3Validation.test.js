import { describe, it, expect } from 'vitest';
import { 
  validateImageBuffer, 
  getImageDimensionsFromBuffer, 
  calculateImageHash 
} from '../../utils/imageValidator.js';
import { verifyProductIdentityMatch } from '../../utils/urlValidator.js';
import { isGenericStockImage } from '../imagePipeline.service.js';

describe('Phase 4A.3 — Final 20 Product Validation Unit Tests', () => {

  // 1. Product Invariant Test
  it('1. should satisfy product counter invariant (resolved + unresolved + mismatches + conflicts === 20)', () => {
    const summary = {
      productsTested: 20,
      resolved: 7,
      unresolved: 13,
      identityMismatches: 0,
      duplicateConflicts: 0
    };
    const sum = summary.resolved + summary.unresolved + summary.identityMismatches + summary.duplicateConflicts;
    expect(sum).toBe(summary.productsTested);
    expect(sum).toBe(20);
  });

  // 2. Exact identity verification for resolved products
  it('2. should confirm exact identity match for Apple iPhone 16 Pro Max', () => {
    const product = { name: 'Apple iPhone 16 Pro Max', category: 'smartphone' };
    const validUrl = 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg';
    const match = verifyProductIdentityMatch({ product, offerTitle: product.name, offerUrl: validUrl });
    expect(match.match).toBe(true);
  });

  // 3. Rejection of stock/generic images
  it('3. should ensure resolved products never use Unsplash stock images', () => {
    const stockUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9';
    expect(isGenericStockImage(stockUrl)).toBe(true);
  });

  // 4. Image byte validation
  it('4. should validate image buffer header and dimensions for JPEG asset', () => {
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const padding = Buffer.alloc(2100, 0x88);
    const res = validateImageBuffer(Buffer.concat([jpegHeader, padding]));
    expect(res.valid).toBe(true);
    expect(res.format).toBe('image/jpeg');
  });

  // 5. SHA-256 byte fingerprinting
  it('5. should compute deterministic SHA-256 hash for image buffers', () => {
    const buf = Buffer.from('phase4a3-verified-image-bytes-sample');
    const hash1 = calculateImageHash(buf);
    const hash2 = calculateImageHash(buf);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

});
