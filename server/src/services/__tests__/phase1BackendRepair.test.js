import { describe, it, expect } from 'vitest';
import { determineProductCategory, isUserFacingProductEligible } from '../../utils/categoryMapper.js';
import { formatProductDTO } from '../../utils/productDTO.js';
import { validateMarketplaceProductUrl } from '../../utils/urlValidator.js';
import { getExactProductImageDetails } from '../imagePipeline.service.js';

describe('Phase 1H — Backend Source-of-Truth & Isolation Tests', () => {

  // 1. Smartphone category isolation
  it('1. should isolate smartphones to canonical smartphone category', () => {
    expect(determineProductCategory({ name: 'Apple iPhone 16 Pro Max' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Samsung Galaxy S24 Ultra' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Google Pixel 9 Pro' })).toBe('smartphone');
  });

  // 2. Smartphone + Xiaomi brand isolation
  it('2. should classify Xiaomi smartphones as smartphone category', () => {
    expect(determineProductCategory({ name: 'Xiaomi 14 Ultra (16GB RAM, 512GB Storage)' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Xiaomi Redmi Note 13 Pro' })).toBe('smartphone');
  });

  // 3. Smartphone + Samsung brand isolation
  it('3. should classify Samsung smartphones as smartphone category', () => {
    expect(determineProductCategory({ name: 'Samsung Galaxy Z Fold 6' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Samsung Galaxy A55 5G' })).toBe('smartphone');
  });

  // 4. Smartphone + OnePlus brand isolation
  it('4. should classify OnePlus smartphones as smartphone category', () => {
    expect(determineProductCategory({ name: 'OnePlus 12 5G' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'OnePlus Nord CE4 5G' })).toBe('smartphone');
  });

  // 5. Tablet does not enter smartphone
  it('5. should classify tablets as tablet and NOT smartphone', () => {
    expect(determineProductCategory({ name: 'Xiaomi Pad 6' })).toBe('tablet');
    expect(determineProductCategory({ name: 'Apple iPad Air M2' })).toBe('tablet');
    expect(determineProductCategory({ name: 'Samsung Galaxy Tab S9' })).toBe('tablet');
  });

  // 6. Smartwatch does not enter smartphone
  it('6. should classify smartwatches as smartwatch and NOT smartphone', () => {
    expect(determineProductCategory({ name: 'Apple Watch Series 9' })).toBe('smartwatch');
    expect(determineProductCategory({ name: 'Samsung Galaxy Watch 6' })).toBe('smartwatch');
  });

  // 7. Laptop does not enter smartphone
  it('7. should classify laptops as laptop and NOT smartphone', () => {
    expect(determineProductCategory({ name: 'Apple MacBook Air M3' })).toBe('laptop');
    expect(determineProductCategory({ name: 'Dell XPS 15 Laptop' })).toBe('laptop');
  });

  // 8. Accessories do not enter smartphone
  it('8. should reject or reclassify accessories away from main smartphone category', () => {
    expect(determineProductCategory({ name: 'iPhone 16 Pro Silicone Case' })).toBe('accessory');
    expect(determineProductCategory({ name: 'Samsung Galaxy S24 Ultra Cover' })).toBe('accessory');
  });

  // 9. Offers are included in product-list API response DTO
  it('9. should format product DTO with offers array populated from listings', () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Xiaomi 14 Ultra',
      brand: 'Xiaomi',
      category: 'smartphone'
    };
    const mockListings = [
      {
        _id: 'off1',
        marketplace: { _id: 'mp1', name: 'Amazon India', code: 'amazon_in', baseUrl: 'https://www.amazon.in' },
        url: 'https://www.amazon.in/dp/B0CY2K72V5',
        currentPrice: 99999,
        isAvailable: true
      }
    ];

    const dto = formatProductDTO(mockProduct, mockListings);
    expect(dto.offers).toHaveLength(1);
    expect(dto.offers[0].url).toBe('https://www.amazon.in/dp/B0CY2K72V5');
    expect(dto.minPrice).toBe(99999);
  });

  // 10. Empty offers are returned as []
  it('10. should return empty offers array [] when product has zero valid listings', () => {
    const mockProduct = {
      _id: 'prod456',
      name: 'Unlisted Phone',
      brand: 'BrandX',
      category: 'smartphone'
    };
    const dto = formatProductDTO(mockProduct, []);
    expect(dto.offers).toEqual([]);
    expect(dto.minPrice).toBeNull();
  });

  // 11. API does not fabricate marketplace URLs
  it('11. should reject fabricated search URLs in marketplace validator', () => {
    const searchUrl = 'https://www.amazon.in/s?k=Xiaomi+14';
    const validation = validateMarketplaceProductUrl({ marketplace: 'Amazon', url: searchUrl });
    expect(validation.valid).toBe(false);
  });

  // 12. API does not fabricate product images
  it('12. should return image: null when no verified CDN image exists and stock photo is present', () => {
    const stockProduct = {
      name: 'Generic Phone Model XYZ',
      image: 'https://images.unsplash.com/photo-1511707171634'
    };
    const imgDetails = getExactProductImageDetails(stockProduct);
    expect(imgDetails.url).toBeNull();
    expect(imgDetails.imageStatus).toBe('GENERIC');
  });

});
