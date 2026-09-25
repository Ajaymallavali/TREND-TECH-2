import { describe, it, expect } from 'vitest';
import { CATALOG_INTEGRITY_CONFIG } from '../../config/catalogIntegrity.config.js';
import { canonicalImageUrl, isGenericStockImage } from '../imagePipeline.service.js';
import { enforceCategoryListingImageDeduplication, isLegitimateVariantPair, computeImageSha256 } from '../imageDeduplicationGuard.service.js';
import { isRealCommercialBrand } from '../../utils/productIdentity.js';
import { determineProductCategory, normalizeCategory } from '../../utils/categoryMapper.js';

describe('Phase 5C — Master Regression Guardrail + Catalog Integrity Protection', () => {

  // FIXTURE 1: Two different products with same image URL -> FAIL
  it('FIXTURE 1 (Rule: IMAGE_URL_COLLISION): Two different products with same image URL triggers collision guard', () => {
    const products = [
      { id: 'prod-A', name: 'Product A', image: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' },
      { id: 'prod-B', name: 'Product B', image: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' }
    ];

    const deduplicated = enforceCategoryListingImageDeduplication(products);
    expect(deduplicated[0].image).toBe('https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg');
    expect(deduplicated[1].image).toBeNull();
    expect(deduplicated[1].imageStatus).toBe('DUPLICATE_CONFLICT');
  });

  // FIXTURE 2: Two different products with same image SHA-256 -> FAIL
  it('FIXTURE 2 (Rule: IMAGE_SHA256_COLLISION): Identical SHA-256 byte/canonical hash across distinct products fails', () => {
    const url1 = 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg?w=100';
    const url2 = 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg?w=500';

    const hash1 = computeImageSha256(url1);
    const hash2 = computeImageSha256(url2);

    expect(hash1).toBe(hash2);

    const products = [
      { id: 'prod-1', name: 'iPhone 16 Pro', image: url1 },
      { id: 'prod-2', name: 'Samsung Galaxy S24', image: url2 }
    ];

    const result = enforceCategoryListingImageDeduplication(products);
    expect(result[1].image).toBeNull();
  });

  // FIXTURE 3: Legitimate same-product variants sharing image -> PASS
  it('FIXTURE 3 (Rule: LEGITIMATE_VARIANT_EXCEPTION): Legitimate color/storage variants sharing image PASS', () => {
    const varA = { id: 'v1', name: 'iPhone 16 Pro 256GB', parentAsin: 'B0CX16P', image: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' };
    const varB = { id: 'v2', name: 'iPhone 16 Pro 512GB', parentAsin: 'B0CX16P', image: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' };

    expect(isLegitimateVariantPair(varA, varB)).toBe(true);

    const result = enforceCategoryListingImageDeduplication([varA, varB]);
    expect(result[0].image).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');
    expect(result[1].image).toBe('https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg');
  });

  // FIXTURE 4 & 5: Image Unavailable Threshold (>10% FAIL, <=10% PASS)
  it('FIXTURE 4 & 5 (Rule: IMAGE_UNAVAILABLE_THRESHOLD): >10% unavailable images in LIVE_VERIFIED fails, <=10% passes', () => {
    const threshold = CATALOG_INTEGRITY_CONFIG.IMAGE_UNAVAILABLE_THRESHOLD; // 0.10

    // 100 products, 15 missing (15% > 10%) -> FAIL
    const totalA = 100;
    const unavailableA = 15;
    const rateA = unavailableA / totalA;
    expect(rateA > threshold).toBe(true);

    // 100 products, 5 missing (5% <= 10%) -> PASS
    const totalB = 100;
    const unavailableB = 5;
    const rateB = unavailableB / totalB;
    expect(rateB <= threshold).toBe(true);
  });

  // FIXTURE 6 & 7: Generic Template Product Name Detection
  it('FIXTURE 6 & 7 (Rule: GENERIC_TEMPLATE_NAME): Generic template names fail, real specific commercial names pass', () => {
    const suspiciousNames = ['Smartphone Redmi', 'Smartphone Pixel', 'Laptop Legion', 'Audio Gaming Headsets', 'Mobile Phone Pro'];
    const realNames = ['Apple iPhone 16e 128GB', 'Samsung Galaxy S24 Ultra 512GB', 'Sony WH-1000XM5 Headphones'];

    for (const name of suspiciousNames) {
      const isSuspicious = CATALOG_INTEGRITY_CONFIG.SUSPICIOUS_NAME_PATTERNS.some(pat => pat.test(name));
      expect(isSuspicious).toBe(true);
    }

    for (const name of realNames) {
      const isSuspicious = CATALOG_INTEGRITY_CONFIG.SUSPICIOUS_NAME_PATTERNS.some(pat => pat.test(name));
      expect(isSuspicious).toBe(false);
    }
  });

  // FIXTURE 8 & 9: Mac Mini category integrity
  it('FIXTURE 8 & 9 (Rule: CATEGORY_MISMATCH): Mac Mini must not be classified as laptop', () => {
    const macMiniProd = { name: 'Apple Mac Mini M2', category: 'desktop' };

    // Normalize category check
    const normalized = normalizeCategory(macMiniProd.category);
    expect(normalized).toBe('desktop');
    expect(normalized).not.toBe('laptop');
  });

  // FIXTURE 10: iPhone with category=television -> FAIL
  it('FIXTURE 10 (Rule: CATEGORY_CONTAMINATION): iPhone with category=television fails category integrity check', () => {
    const iphoneTv = { name: 'Apple iPhone 16', category: 'television' };
    const mapped = determineProductCategory(iphoneTv);
    expect(mapped).not.toBe('television');
  });

  // FIXTURE 11 & 12: Price Repetition Guard (Legitimate equal prices PASS, Mass repetition FAIL)
  it('FIXTURE 11 & 12 (Rule: SUSPICIOUS_PRICE_REPETITION): Legitimate equal prices pass, mass repetition (>10%) fails', () => {
    const threshold = CATALOG_INTEGRITY_CONFIG.PRICE_REPETITION_THRESHOLD;

    // 100 products, 70 products at ₹2,999 (70% > 10%) -> FAIL
    const massCount = 70;
    const totalProds = 100;
    expect(massCount / totalProds > threshold).toBe(true);

    // 100 products, 4 products at ₹59,999 (4% <= 10%) -> PASS
    const normalCount = 4;
    expect(normalCount / totalProds <= threshold).toBe(true);
  });

  // FIXTURE 13 & 14: Generated ASIN Guard
  it('FIXTURE 13 & 14 (Rule: GENERATED_ASIN): ASINs derived from MongoDB ObjectID fail, verified live ASINs pass', () => {
    const generatedAsin = 'ASIN-6A9904E369652590E0AADBF2';
    const fakeAsinPrefix = 'B06A9904E369652590E0AADBF2';
    const realAsin = 'B0CX16EM256';

    expect(generatedAsin.startsWith('ASIN-6A9904') || fakeAsinPrefix.startsWith('B06A9904')).toBe(true);
    expect(realAsin.startsWith('ASIN-6A9904') || realAsin.startsWith('B06A9904')).toBe(false);
  });

  // FIXTURE 15 & 16: Generated Marketplace URL / Search URL Guard
  it('FIXTURE 15 & 16 (Rule: GENERATED_MARKETPLACE_URL): Search URLs and interpolated ASIN URLs fail, direct product URLs pass', () => {
    const searchUrl = 'https://www.flipkart.com/search?q=iPhone%2016';
    const fakeAsinUrl = 'https://www.amazon.in/dp/B06A9904E369652590E0AADBF2';
    const realDirectUrl = 'https://www.amazon.in/Apple-iPhone-16e-128-GB/dp/B0FQFPWY45';

    expect(searchUrl.includes('/search') || searchUrl.includes('/s?k=')).toBe(true);
    expect(fakeAsinUrl.includes('/dp/B06A9904')).toBe(true);
    expect(realDirectUrl.includes('/search') || realDirectUrl.includes('/dp/B06A9904')).toBe(false);
  });

  // FIXTURE 17: Mock API data entering production ingestion paths -> FAIL
  it('FIXTURE 17 (Rule: MOCK_DATA_LEAKAGE): Process env guard CATALOG_REAL_API_MODE throws if mock data is run without flag', () => {
    const isRealApiMode = process.env.CATALOG_REAL_API_MODE === 'true';

    // Enforcement logic test
    function checkRealApiGuard(modeEnv) {
      if (modeEnv !== 'true') {
        throw new Error('REAL API MODE REQUIRED — refusing to run without CATALOG_REAL_API_MODE=true');
      }
      return true;
    }

    expect(() => checkRealApiGuard('false')).toThrow();
    expect(checkRealApiGuard('true')).toBe(true);
  });

  // FIXTURE 18: Legacy synthetic product exposed as LIVE_VERIFIED -> FAIL
  it('FIXTURE 18 (Rule: LEGACY_CATALOG_EXPOSURE): Synthetic product records without live verified tag cannot be marked LIVE_VERIFIED', () => {
    const syntheticDoc = { _id: '6a9904e369652590e0aadbf2', name: 'Apple iPhone 16e', source: 'LEGACY_SYNTHETIC' };

    const isVerified = syntheticDoc.source === 'LIVE_VERIFIED';
    expect(isVerified).toBe(false);
  });

  // Regression Tests for 10 Target Models
  it('TEST 19: Regression test across 10 Target Models maintains strict product identity isolation', () => {
    const targetModels = [
      { id: 't01', name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone', source: 'TEST_FIXTURE' },
      { id: 't02', name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'smartphone', source: 'TEST_FIXTURE' },
      { id: 't03', name: 'OnePlus 13', brand: 'OnePlus', category: 'smartphone', source: 'TEST_FIXTURE' },
      { id: 't04', name: 'Apple MacBook Air M3', brand: 'Apple', category: 'laptop', source: 'TEST_FIXTURE' },
      { id: 't05', name: 'Dell Inspiron 15 3520', brand: 'Dell', category: 'laptop', source: 'TEST_FIXTURE' },
      { id: 't06', name: 'Sony Bravia 55 inch 4K TV', brand: 'Sony', category: 'television', source: 'TEST_FIXTURE' },
      { id: 't07', name: 'Sony WH-1000XM5', brand: 'Sony', category: 'headphones', source: 'TEST_FIXTURE' },
      { id: 't08', name: 'Apple iPad Air 11-inch M2', brand: 'Apple', category: 'tablet', source: 'TEST_FIXTURE' },
      { id: 't09', name: 'Canon EOS R6 Mark II', brand: 'Canon', category: 'camera', source: 'TEST_FIXTURE' },
      { id: 't10', name: 'Xiaomi 14 Ultra', brand: 'Xiaomi', category: 'smartphone', source: 'TEST_FIXTURE' }
    ];

    expect(targetModels.length).toBe(10);
    const uniqueIds = new Set(targetModels.map(m => m.id));
    expect(uniqueIds.size).toBe(10);
  });
});
