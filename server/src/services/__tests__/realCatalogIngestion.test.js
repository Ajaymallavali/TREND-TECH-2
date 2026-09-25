import { describe, test, expect } from 'vitest';
import { createCanonicalProductProvenanceRecord } from '../realCatalogIngestion.service.js';

describe('PHASE 5A REAL CATALOG INGESTION SERVICE UNIT TESTS', () => {

  // TEST 12: generated ASIN -> REJECT
  test('TEST 12: generated ASIN -> REJECT', () => {
    const target = { id: 'p123', name: 'iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { asin: 'B06A9904E369652590E0AADBEA', title: 'iPhone 16 Pro', brand: 'Apple', link_clean: 'https://amazon.in/dp/B06A9904E3' };
    const res = createCanonicalProductProvenanceRecord({ targetProduct: target, apiCandidate: candidate });
    expect(res.valid).toBe(false);
    expect(res.rejectionReason).toMatch(/synthetic/i);
  });

  // TEST 13: generated Amazon URL -> REJECT
  test('TEST 13: generated Amazon URL -> REJECT', () => {
    const target = { id: 'p123', name: 'iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { asin: 'B0CHX12345', title: 'iPhone 16 Pro', brand: 'Apple', link_clean: 'https://amazon.in/s?k=iPhone+16+Pro' };
    const res = createCanonicalProductProvenanceRecord({ targetProduct: target, apiCandidate: candidate });
    expect(res.valid).toBe(false);
    expect(res.rejectionReason).toMatch(/Search URL or generated synthetic link/i);
  });

  // TEST 14: search URL -> REJECT
  test('TEST 14: search URL -> REJECT', () => {
    const target = { id: 'p123', name: 'iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { asin: 'B0CHX12345', title: 'iPhone 16 Pro', brand: 'Apple', link_clean: 'https://www.amazon.in/s?k=iPhone+16+Pro' };
    const res = createCanonicalProductProvenanceRecord({ targetProduct: target, apiCandidate: candidate });
    expect(res.valid).toBe(false);
    expect(res.rejectionReason).toMatch(/Search URL/i);
  });

  // TEST 16: missing live price -> PRICE_UNAVAILABLE
  test('TEST 16: missing live price -> PRICE_UNAVAILABLE', () => {
    const target = { id: 'p123', name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone' };
    const candidate = {
      asin: 'B0CHX54321',
      title: 'Apple iPhone 16e (128 GB)',
      brand: 'Apple',
      category: 'smartphone',
      link_clean: 'https://www.amazon.in/dp/B0CHX54321',
      imageUrl: 'https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg',
      price: null
    };
    const res = createCanonicalProductProvenanceRecord({ targetProduct: target, apiCandidate: candidate });
    expect(res.valid).toBe(true);
    expect(res.provenance.currentPrice).toBeNull();
  });

});
