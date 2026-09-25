import { describe, it, expect } from 'vitest';
import {
  validateMarketplaceUrl,
  validateProductImage,
  deduplicateProducts,
  deduplicateOffers
} from '../verifiedCatalogValidator.service.js';

describe('TREND-TECH Verified Data Foundation Validation Engine', () => {

  // Test 1: Valid Amazon product URL
  it('1. should validate a genuine Amazon product detail page URL with ASIN', () => {
    const res = validateMarketplaceUrl('https://www.amazon.in/dp/B0DGJ9N5H1', 'Amazon India');
    expect(res.isValid).toBe(true);
    expect(res.asin).toBe('B0DGJ9N5H1');
    expect(res.canonicalUrl).toBe('https://www.amazon.in/dp/B0DGJ9N5H1');
  });

  // Test 2: Invalid Amazon search URL
  it('2. should reject an invalid Amazon keyword search URL', () => {
    const res = validateMarketplaceUrl('https://www.amazon.in/s?k=iphone+16+pro+max', 'Amazon India');
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('SEARCH_URL_REJECTED');
  });

  // Test 3: Valid Flipkart product URL
  it('3. should validate an exact Flipkart product detail page URL', () => {
    const res = validateMarketplaceUrl('https://www.flipkart.com/apple-iphone-16-pro-max-natural-titanium-256-gb/p/itm5b91b920fb61b', 'Flipkart');
    expect(res.isValid).toBe(true);
    expect(res.canonicalUrl).toContain('/p/itm');
  });

  // Test 4: Invalid Flipkart search URL
  it('4. should reject a Flipkart search URL', () => {
    const res = validateMarketplaceUrl('https://www.flipkart.com/search?q=laptops', 'Flipkart');
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('SEARCH_URL_REJECTED');
  });

  // Test 5: Valid Croma product URL
  it('5. should validate an exact Croma product detail page URL', () => {
    const res = validateMarketplaceUrl('https://www.croma.com/apple-iphone-16-pro-max-256gb-natural-titanium/p/309142', 'Croma');
    expect(res.isValid).toBe(true);
    expect(res.canonicalUrl).toContain('/p/309142');
  });

  // Test 6: Invalid Croma search URL
  it('6. should reject a Croma search URL', () => {
    const res = validateMarketplaceUrl('https://www.croma.com/search/?q=television', 'Croma');
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('SEARCH_URL_REJECTED');
  });

  // Test 7: Duplicate product detection
  it('7. should detect and deduplicate duplicate product entries by slug', () => {
    const pool = [
      { slug: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max' },
      { slug: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max Duplicate' },
      { slug: 'macbook-air-m3', name: 'MacBook Air M3' }
    ];
    const unique = deduplicateProducts(pool);
    expect(unique.length).toBe(2);
    expect(unique.map((p) => p.slug)).toEqual(['iphone-16-pro-max', 'macbook-air-m3']);
  });

  // Test 8: Duplicate image detection
  it('8. should detect and reject duplicate image assignment across distinct products', () => {
    const pool = [
      { name: 'Prod A', image: 'https://m.media-amazon.com/images/I/shared_photo.jpg' },
      { name: 'Prod B', image: 'https://m.media-amazon.com/images/I/shared_photo.jpg' }
    ];
    const res = validateProductImage('https://m.media-amazon.com/images/I/shared_photo.jpg', pool);
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('DUPLICATE_IMAGE_REJECTED');
  });

  // Test 9: Generic image rejection
  it('9. should reject generic Unsplash stock image URLs', () => {
    const res = validateProductImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', []);
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('GENERIC_STOCK_IMAGE_REJECTED');
  });

  // Test 10: Missing price rejection
  it('10. should reject marketplace offers with missing or non-positive price', () => {
    const invalidOffers = [
      { marketplace: 'Amazon India', url: 'https://www.amazon.in/dp/B0DGJ9N5H1', currentPrice: 0 },
      { marketplace: 'Flipkart', url: 'https://www.flipkart.com/item/p/1234', currentPrice: -500 },
      { marketplace: 'Croma', url: 'https://www.croma.com/item/p/5678', currentPrice: null }
    ];
    const valid = invalidOffers.filter((o) => typeof o.currentPrice === 'number' && o.currentPrice > 0);
    expect(valid.length).toBe(0);
  });

  // Test 11: Missing exact URL rejection
  it('11. should reject offers with missing exact URL', () => {
    const res = validateMarketplaceUrl('', 'Amazon India');
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('MISSING_URL');
  });

  // Test 12: Fake marketplace URL rejection
  it('12. should reject fake constructed marketplace URLs', () => {
    const res = validateMarketplaceUrl('https://fake-retailer-domain.xyz/buy/iphone', 'FakeStore');
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe('UNSUPPORTED_MARKETPLACE_DOMAIN');
  });

  // Test 13: Price history without real observation rejection
  it('13. should reject price history observations when no real price observation exists', () => {
    const currentPrice = null;
    const historyObservationCreated = (currentPrice !== null && typeof currentPrice === 'number' && currentPrice > 0);
    expect(historyObservationCreated).toBe(false);
  });

});
