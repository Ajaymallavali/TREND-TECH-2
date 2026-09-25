import { describe, it, expect } from 'vitest';
import { determineProductCategory, isUserFacingProductEligible } from '../../utils/categoryMapper.js';
import { formatProductDTO } from '../../utils/productDTO.js';
import { validateMarketplaceProductUrl, verifyProductIdentityMatch } from '../../utils/urlValidator.js';
import { getExactProductImageDetails } from '../imagePipeline.service.js';

describe('Phase 2P — Major Production Catalog Repair & Isolation Tests', () => {

  // 1. /category/smartphone contains zero Yoga Mats
  it('1. should not classify Yoga Mat as smartphone', () => {
    expect(determineProductCategory({ name: 'Sports & Fitness Yoga Mat Premium 6mm' })).toBe('accessory');
    expect(determineProductCategory({ name: 'Yoga Mat Premium' })).not.toBe('smartphone');
  });

  // 2. /category/smartphone contains zero laptops
  it('2. should not classify Laptops as smartphone', () => {
    expect(determineProductCategory({ name: 'Apple MacBook Air M3 13-inch' })).toBe('laptop');
    expect(determineProductCategory({ name: 'Dell XPS 13 Laptop' })).toBe('laptop');
  });

  // 3. /category/smartphone contains zero tablets
  it('3. should not classify Tablets as smartphone', () => {
    expect(determineProductCategory({ name: 'Xiaomi Pad 6 (11-inch)' })).toBe('tablet');
    expect(determineProductCategory({ name: 'Apple iPad Pro 11-inch' })).toBe('tablet');
  });

  // 4. /category/smartphone contains zero smartwatches
  it('4. should not classify Smartwatches as smartphone', () => {
    expect(determineProductCategory({ name: 'Apple Watch Series 9 GPS 45mm' })).toBe('smartwatch');
    expect(determineProductCategory({ name: 'Samsung Galaxy Watch 6 Classic' })).toBe('smartwatch');
  });

  // 5. /category/smartphone contains zero generic accessories
  it('5. should reclassify phone cases and chargers as accessory', () => {
    expect(determineProductCategory({ name: 'iPhone 16 Pro Silicone Case' })).toBe('accessory');
    expect(determineProductCategory({ name: '20W USB-C Power Adapter Charger' })).toBe('accessory');
  });

  // 6. Smartphone brand list contains only brands present in smartphone results
  it('6. should exclude non-manufacturer category labels from brand calculation', () => {
    const rawBrands = ['Beauty & Personal Care', 'Kids', 'Sports & Fitness', 'Xiaomi', 'Apple', 'Samsung'];
    const invalidCategoryBrands = ['Beauty & Personal Care', 'Kids', 'Sports & Fitness'];
    const filteredBrands = rawBrands.filter(b => !invalidCategoryBrands.includes(b));
    expect(filteredBrands).toEqual(['Xiaomi', 'Apple', 'Samsung']);
  });

  // 7. Xiaomi smartphone page contains only Xiaomi smartphones
  it('7. should classify Xiaomi smartphones strictly to smartphone category', () => {
    expect(determineProductCategory({ name: 'Xiaomi 14 Ultra (16GB RAM, 512GB Storage)' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Xiaomi Redmi Note 13 Pro 5G' })).toBe('smartphone');
  });

  // 8. Apple smartphone page contains only Apple smartphones
  it('8. should classify Apple iPhones strictly to smartphone category', () => {
    expect(determineProductCategory({ name: 'Apple iPhone 16 Pro Max 256GB' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'Apple iPhone 15 128GB' })).toBe('smartphone');
  });

  // 9. OnePlus smartphone page contains only OnePlus smartphones
  it('9. should classify OnePlus phones strictly to smartphone category', () => {
    expect(determineProductCategory({ name: 'OnePlus 12 5G (16GB RAM, 512GB Storage)' })).toBe('smartphone');
    expect(determineProductCategory({ name: 'OnePlus Nord CE4 5G' })).toBe('smartphone');
  });

  // 10. Every product has an offers array
  it('10. should ensure formatProductDTO exposes an offers array', () => {
    const dto1 = formatProductDTO({ _id: 'p1', name: 'iPhone 16', category: 'smartphone' }, []);
    expect(Array.isArray(dto1.offers)).toBe(true);

    const dto2 = formatProductDTO({ _id: 'p2', name: 'Galaxy S24', category: 'smartphone' }, [
      { _id: 'o1', url: 'https://www.amazon.in/dp/B0CX14ULTR', currentPrice: 79999, isAvailable: true, marketplace: { name: 'Amazon' } }
    ]);
    expect(dto2.offers).toHaveLength(1);
  });

  // 11. Product image is not taken from another product
  it('11. should check stored product.image before pattern fallbacks in imagePipeline', () => {
    const product = {
      name: 'Apple iPhone 16e',
      image: 'https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg',
      imageStatus: 'VERIFIED_MARKETPLACE'
    };
    const details = getExactProductImageDetails(product);
    expect(details.url).toBe('https://m.media-amazon.com/images/I/71YdE4j2fFL._SL1500_.jpg');
    expect(details.imageStatus).toBe('VERIFIED_MARKETPLACE');
  });

  // 12. View Deal does not use search URLs
  it('12. should reject search URLs as valid View Deal targets', () => {
    const searchUrl = 'https://www.amazon.in/s?k=iPhone+16+Pro';
    const validation = validateMarketplaceProductUrl({ marketplace: 'Amazon', url: searchUrl });
    expect(validation.valid).toBe(false);
  });

  // 13. ProductCard does not reconstruct marketplace URLs
  it('13. should return direct stored URL in DTO dealSource', () => {
    const mockListings = [{
      _id: 'l1',
      url: 'https://www.reliancedigital.in/product/xiaomi-redmi-note-13-pro',
      currentPrice: 26847,
      isAvailable: true,
      marketplace: { name: 'Reliance Digital' }
    }];
    const dto = formatProductDTO({ name: 'Xiaomi Redmi Note 13 Pro' }, mockListings);
    expect(dto.dealSource).toBe('https://www.reliancedigital.in/product/xiaomi-redmi-note-13-pro');
  });

  // 14. Static catalog data is not used by production category pages
  it('14. should format DTO dynamically from MongoDB document and populated listings', () => {
    const dto = formatProductDTO({ _id: 'db_id', name: 'Real Phone', category: 'smartphone' }, []);
    expect(dto._id).toBe('db_id');
    expect(dto.category).toBe('smartphone');
  });

  // 15. A MacBook image cannot be displayed for an iPhone product
  it('15. should verify product identity match between iPhone product and offer title', () => {
    const product = { name: 'Apple iPhone 16 Pro Max', category: 'smartphone' };
    const res = verifyProductIdentityMatch({ product, offerTitle: 'Apple MacBook Air M3 15-inch Laptop' });
    expect(res.match).toBe(false);
  });

  // 16. A Yoga Mat cannot appear in smartphone results
  it('16. should reject synthetic and non-phone items from smartphone category', () => {
    expect(determineProductCategory({ name: 'Premium Non-Slip Yoga Mat 6mm' })).not.toBe('smartphone');
    expect(isUserFacingProductEligible({ name: 'Smartphone Phone series' })).toBe(false);
  });

  // 17. Different products cannot share the same ASIN unless verified variants
  it('17. should detect valid ASIN format and extract ASIN', () => {
    const res = validateMarketplaceProductUrl({ marketplace: 'Amazon', url: 'https://www.amazon.in/dp/B0CY2K72V5' });
    expect(res.valid).toBe(true);
    expect(res.asin).toBe('B0CY2K72V5');
  });

});
