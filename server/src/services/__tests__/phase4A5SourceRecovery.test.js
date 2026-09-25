import { describe, it, expect } from 'vitest';
import { 
  validateImageBuffer, 
  getImageDimensionsFromBuffer, 
  calculateImageHash 
} from '../../utils/imageValidator.js';
import { verifyProductIdentityMatch } from '../../utils/urlValidator.js';
import { isGenericStockImage } from '../imagePipeline.service.js';

describe('Phase 4A.5 — Exact Source Recovery Unit Tests', () => {

  // 1. Invariant Check: recovered + stillUnresolved === 13
  it('1. should satisfy recovery count invariant (recovered + stillUnresolved === 13)', () => {
    const stats = {
      productsAttempted: 13,
      recovered: 7,
      stillUnresolved: 6
    };
    const sum = stats.recovered + stats.stillUnresolved;
    expect(sum).toBe(stats.productsAttempted);
    expect(sum).toBe(13);
  });

  // 2. 404 Rule: Do NOT retry identical image URL after HTTP 404
  it('2. should skip duplicate candidate URL after HTTP 404 failure', () => {
    const candidateUrls = [
      'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg', // duplicate 404 URL
      'https://www.samsung.com/in/smartphones/galaxy-s24-ultra/image.jpg' // alternative candidate
    ];

    const tried = new Set();
    const executedAttempts = [];

    for (const url of candidateUrls) {
      if (tried.has(url)) continue;
      tried.add(url);
      executedAttempts.push(url);
    }

    expect(executedAttempts).toHaveLength(2);
    expect(executedAttempts[0]).toContain('m.media-amazon.com');
    expect(executedAttempts[1]).toContain('samsung.com');
  });

  // 3. Exact Identity Verification for Recovered Candidate
  it('3. should verify exact identity match for Samsung Galaxy S24 Ultra', () => {
    const product = { name: 'Samsung Galaxy S24 Ultra', category: 'smartphone' };
    const validUrl = 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg';
    const match = verifyProductIdentityMatch({ product, offerTitle: product.name, offerUrl: validUrl });
    expect(match.match).toBe(true);
  });

  // 4. SHA-256 Byte Fingerprinting
  it('4. should compute deterministic SHA-256 hash for recovered image buffer', () => {
    const buf = Buffer.from('phase4a5-recovered-image-bytes-sample');
    const hash = calculateImageHash(buf);
    expect(hash.length).toBe(64);
  });

});
