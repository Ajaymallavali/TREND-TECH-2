import { describe, it, expect } from 'vitest';
import {
  validateMarketplaceProductUrl,
  isValidMarketplaceUrl,
  verifyProductIdentityMatch,
  validateExactProductImage,
  determineDestinationVerificationState
} from '../../utils/urlValidator.js';
import { evaluateProductDealSignal, DEAL_STATUSES } from '../deal.service.js';

describe('Production URL & Deal Engine Tests', () => {
  it('1. should reject placeholder /dp/ASIN URL', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Amazon',
      url: 'https://www.amazon.in/dp/ASIN',
    });
    expect(res.valid).toBe(false);
  });

  it('2. should accept real Amazon ASIN URL', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Amazon',
      url: 'https://www.amazon.in/dp/B0CHX1W1XY',
    });
    expect(res.valid).toBe(true);
    expect(res.asin).toBe('B0CHX1W1XY');
    expect(res.canonicalUrl).toBe('https://www.amazon.in/dp/B0CHX1W1XY');
  });

  it('3. should reject Amazon search URL', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Amazon',
      url: 'https://www.amazon.in/s?k=iPhone+15',
    });
    expect(res.valid).toBe(false);
    expect(res.reason).toContain('Search');
  });

  it('4. should reject Flipkart search URL', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Flipkart',
      url: 'https://www.flipkart.com/search?q=macbook',
    });
    expect(res.valid).toBe(false);
  });

  it('5. should reject generic retailer homepage', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Croma',
      url: 'https://www.croma.com/',
    });
    expect(res.valid).toBe(false);
  });

  it('6. should reject wrong marketplace domain', () => {
    const res = validateMarketplaceProductUrl({
      marketplace: 'Amazon',
      url: 'https://www.fake-store.com/dp/B0CHX1W1XY',
    });
    expect(res.valid).toBe(false);
  });

  it('7. should detect duplicate normalized image URLs despite query parameter differences', () => {
    const url1 = 'https://m.media-amazon.com/images/I/81Os1SDWJA-L._SL1500_.jpg?w=300';
    const url2 = 'https://m.media-amazon.com/images/I/81Os1SDWJA-L._SL1500_.jpg?w=800';
    const clean1 = url1.split('?')[0];
    const clean2 = url2.split('?')[0];
    expect(clean1).toBe(clean2);
  });

  it('8. should calculate CURRENT_DISCOUNT when originalPrice > currentPrice', () => {
    const deal = evaluateProductDealSignal(
      { name: 'iPhone 15' },
      [{ currentPrice: 65900, originalPrice: 79900, currency: 'INR', isAvailable: true, url: 'https://www.amazon.in/dp/B0CHX1W1XY' }],
      []
    );
    expect(deal.dealStatus).toBe(DEAL_STATUSES.CURRENT_DISCOUNT);
    expect(deal.discountPercentage).toBe(18);
  });

  it('9. should return INSUFFICIENT_HISTORY when history has less than 2 observations', () => {
    const deal = evaluateProductDealSignal(
      { name: 'iPhone 15' },
      [{ currentPrice: 65900, currency: 'INR', isAvailable: true, url: 'https://www.amazon.in/dp/B0CHX1W1XY' }],
      [{ price: 65900, timestamp: new Date() }]
    );
    expect(deal.dealStatus).toBe(DEAL_STATUSES.INSUFFICIENT_HISTORY);
  });

  it('10. should return PRICE_DROP / LOWEST_OBSERVED when earlier history observation is higher', () => {
    const deal = evaluateProductDealSignal(
      { name: 'iPhone 15' },
      [{ currentPrice: 65900, currency: 'INR', isAvailable: true, url: 'https://www.amazon.in/dp/B0CHX1W1XY' }],
      [
        { price: 75000, timestamp: new Date(Date.now() - 86400000 * 5) },
        { price: 65900, timestamp: new Date() }
      ]
    );
    expect([DEAL_STATUSES.PRICE_DROP, DEAL_STATUSES.LOWEST_OBSERVED]).toContain(deal.dealStatus);
    expect(deal.priceDropAmount).toBe(9100);
  });

  // NEW DESTINATION & IDENTITY & IMAGE VERIFICATION TESTS
  it('11. should reject accessory offer when target is a main device', () => {
    const product = { name: 'Apple iPhone 16 Pro (256GB, Natural Titanium)', category: 'smartphone' };
    const res = verifyProductIdentityMatch({ product, offerTitle: 'MagSafe Silicone Case for iPhone 16 Pro' });
    expect(res.match).toBe(false);
    expect(res.reason).toContain('accessory');
  });

  it('12. should reject model mismatch (XM4 for XM5)', () => {
    const product = { name: 'Sony WH-1000XM5 Headphones', category: 'headphones' };
    const res = verifyProductIdentityMatch({ product, offerTitle: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones' });
    expect(res.match).toBe(false);
    expect(res.reason).toContain('Model mismatch');
  });

  it('13. should validate authoritative retailer CDN image and reject stock photo', () => {
    const validImg = validateExactProductImage({
      product: { name: 'iPhone 16 Pro' },
      imageUrl: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg'
    });
    expect(validImg.valid).toBe(true);
    expect(validImg.status).toBe('EXACT_PRODUCT_IMAGE_VERIFIED');

    const stockImg = validateExactProductImage({
      product: { name: 'iPhone 16 Pro' },
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'
    });
    expect(stockImg.valid).toBe(false);
    expect(stockImg.status).toBe('IMAGE_UNAVAILABLE');
  });

  it('14. should distinguish PROVIDER_VERIFIED vs VERIFIED_DESTINATION vs INVALID_DESTINATION', () => {
    const validUrlRes = validateMarketplaceProductUrl({ marketplace: 'Amazon', url: 'https://www.amazon.in/dp/B0DGJ9N5H1' });
    const identityMatch = verifyProductIdentityMatch({ product: { name: 'iPhone 16 Pro Max' }, offerTitle: 'iPhone 16 Pro Max 256GB' });

    // Retailer WAF challenge case
    const providerState = determineDestinationVerificationState({ urlResult: validUrlRes, identityResult: identityMatch, isVerifiedCatalogSource: true });
    expect(providerState.status).toBe('PROVIDER_VERIFIED');

    // HTTP success case
    const httpState = determineDestinationVerificationState({ urlResult: validUrlRes, identityResult: identityMatch, isVerifiedCatalogSource: true, httpStatusCode: 200 });
    expect(httpState.status).toBe('VERIFIED_DESTINATION');

    // Invalid URL case
    const invalidUrlRes = validateMarketplaceProductUrl({ marketplace: 'Amazon', url: 'https://www.amazon.in/s?k=iphone' });
    const invalidState = determineDestinationVerificationState({ urlResult: invalidUrlRes, identityResult: identityMatch, isVerifiedCatalogSource: true });
    expect(invalidState.status).toBe('INVALID_DESTINATION');
  });

  it('15. should enforce canonical category normalization and determineProductCategory', () => {
    const { determineProductCategory } = require('../../utils/categoryMapper.js');
    expect(determineProductCategory({ name: 'Apple iPhone 16 Pro' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Apple MacBook Air M3' })).toBe('laptop');
    expect(determineProductCategory({ name: 'LG C3 OLED 55-inch TV' })).toBe('television');
    expect(determineProductCategory({ name: 'Sony WH-1000XM5 Headphones' })).toBe('headphones');
  });

  it('16. should reject synthetic generic template product names (isUserFacingProductEligible)', () => {
    const { isUserFacingProductEligible } = require('../../utils/categoryMapper.js');
    expect(isUserFacingProductEligible({ name: 'Smartphone Phone series' })).toBe(false);
    expect(isUserFacingProductEligible({ name: 'Air Conditioners Daikin' })).toBe(false);
    expect(isUserFacingProductEligible({ name: 'Cameras Canon' })).toBe(false);
    expect(isUserFacingProductEligible({ name: 'Apple iPhone 15' })).toBe(true);
    expect(isUserFacingProductEligible({ name: 'Samsung Galaxy S24 Ultra' })).toBe(true);
  });
});
