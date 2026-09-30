import { describe, it, expect } from 'vitest';
import { validateStoreUrl } from '../productUrlAnalysis/matcher.js';

describe('URL Intelligence Engine', () => {
  it('identifies exact product page on Amazon', () => {
    const res = validateStoreUrl('https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB/ref=sr_1_1');
    expect(res.isValid).toBe(true);
    expect(res.urlType).toBe('EXACT PRODUCT PAGE');
    expect(res.identifiers.productId).toBe('B08N5W4NNB');
    expect(res.url).toBe('https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB/ref=sr_1_1');
  });

  it('rejects search pages', () => {
    const res = validateStoreUrl('https://www.amazon.in/s?k=macbook+pro');
    expect(res.isValid).toBe(false);
    expect(res.reason).toContain('PRODUCT SEARCH PAGE');
  });

  it('strips tracking parameters but keeps product identifiers', () => {
    const res = validateStoreUrl('https://www.flipkart.com/apple-macbook-air-m1-2020-m1-8-gb-256-gb-mac-os-big-sur-mgn63hn-a/p/itmfc87c85631062?pid=COMFXEKMTXGQGXYZ&lid=LSTCOMFXEKMTXGQGXYZ&tracker=test');
    expect(res.isValid).toBe(true);
    expect(res.identifiers.productId).toBe('COMFXEKMTXGQGXYZ');
    expect(res.identifiers.variantId).toBe('LSTCOMFXEKMTXGQGXYZ');
    expect(res.url).not.toContain('tracker');
    expect(res.url).toContain('pid=COMFXEKMTXGQGXYZ');
  });

  it('blocks invalid security URLs', () => {
    const res = validateStoreUrl('javascript:alert(1)');
    expect(res.isValid).toBe(false);
  });
});
