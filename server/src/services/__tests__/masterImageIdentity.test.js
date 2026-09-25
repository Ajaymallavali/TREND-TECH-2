import { describe, it, expect } from 'vitest';
import { 
  verifyExactProductImageIdentity, 
  checkDeviceTypeCompatibility, 
  extractModelTokens, 
  extractVariantTokens 
} from '../exactProductImageIdentity.service.js';

describe('Step 19 — Master Product Image Identity Automated Tests', () => {

  // 1. Dell Inspiron 15 3520 must NOT receive MacBook image
  it('1. should reject MacBook image for Dell Inspiron 15 3520', () => {
    const product = { name: 'Dell Inspiron 15 3520', brand: 'Dell', category: 'laptop' };
    const candidate = { offerTitle: 'Apple MacBook Air M3 13-inch', category: 'laptop', imageUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
    expect(res.reason).toContain('Brand mismatch');
  });

  // 2. Television Bravia must NOT receive Sony headphone image
  it('2. should reject Sony headphone image for Television Bravia', () => {
    const product = { name: 'Television Bravia', brand: 'Sony', category: 'television' };
    const candidate = { offerTitle: 'Sony WH-1000XM5 Wireless Headphones', category: 'headphones', imageUrl: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
    expect(res.reason.toLowerCase()).toContain('television');
  });

  // 3. Apple MacBook Air M3 must NOT receive Sony headphone image
  it('3. should reject Sony headphone image for Apple MacBook Air M3', () => {
    const product = { name: 'Apple MacBook Air M3', brand: 'Apple', category: 'laptop' };
    const candidate = { offerTitle: 'Sony WH-1000XM5 Headphones', category: 'headphones', imageUrl: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
  });

  // 4. Apple iPad Air must NOT receive iPhone image
  it('4. should reject iPhone image for Apple iPad Air', () => {
    const product = { name: 'Apple iPad Air', brand: 'Apple', category: 'tablet' };
    const candidate = { offerTitle: 'Apple iPhone 16 Pro Max', category: 'smartphone', imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
  });

  // 5. Apple iPad Pro must NOT receive iPhone image
  it('5. should reject iPhone image for Apple iPad Pro', () => {
    const product = { name: 'Apple iPad Pro', brand: 'Apple', category: 'tablet' };
    const candidate = { offerTitle: 'Apple iPhone 17 Pro Max', category: 'smartphone', imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
  });

  // 6. Sony WH-1000XM5 must NOT receive television image
  it('6. should reject television image for Sony WH-1000XM5', () => {
    const product = { name: 'Sony WH-1000XM5', brand: 'Sony', category: 'headphones' };
    const candidate = { offerTitle: 'Sony Bravia 55 inch 4K TV', category: 'television', imageUrl: 'https://m.media-amazon.com/images/I/81M+xWk89rL._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
  });

  // 7. Xiaomi 14 Ultra must NOT receive Xiaomi 14 image
  it('7. should reject Xiaomi 14 image for Xiaomi 14 Ultra', () => {
    const product = { name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', category: 'smartphone' };
    const candidate = { offerTitle: 'Xiaomi 14 5G 256GB', category: 'smartphone', imageUrl: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' };

    const res = verifyExactProductImageIdentity({ product, candidate });
    expect(res.match).toBe(false);
    expect(res.reason).toContain('Variant mismatch');
  });

  // 8. Smartphone category must NOT match Laptop category
  it('8. should enforce hard category incompatibility between smartphone and laptop', () => {
    const check = checkDeviceTypeCompatibility('smartphone', 'laptop');
    expect(check.compatible).toBe(false);
  });

  // 9. Smartphone category must NOT match Tablet category
  it('9. should enforce hard category incompatibility between smartphone and tablet', () => {
    const check = checkDeviceTypeCompatibility('smartphone', 'tablet');
    expect(check.compatible).toBe(false);
  });

  // 10. Extract model & variant tokens
  it('10. should correctly extract model and variant tokens from product names', () => {
    const tokens = extractModelTokens('Samsung Galaxy S24 Ultra 5G');
    expect(tokens).toContain('s24');
    expect(tokens).toContain('ultra');

    const variants = extractVariantTokens('Apple iPhone 17 Pro Max');
    expect(variants).toContain('pro max');
  });

});
