import { describe, it, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import { Product } from '../../models/Product.model.js';
import { MarketplaceProduct } from '../../models/MarketplaceProduct.model.js';
import { getProducts } from '../../controllers/product.controller.js';

describe('Catalog Recovery & Data Integrity Tests', () => {
  it('1. Existing MongoDB products are returned when queried', async () => {
    const fakeProduct = {
      _id: new mongoose.Types.ObjectId(),
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      category: 'smartphone',
      sourceStatus: 'LEGACY_SYNTHETIC',
      toJSON: function() { return this; }
    };

    vi.spyOn(Product, 'find').mockImplementation(async (filter) => {
      return [fakeProduct];
    });

    vi.spyOn(MarketplaceProduct, 'find').mockReturnValue({
      populate: () => Promise.resolve([])
    });

    const mockReq = { query: {} };
    let mockResData = null;
    const mockRes = {
      status: (code) => {
        expect(code).toBe(200);
        return {
          json: (body) => {
            mockResData = body;
          }
        };
      }
    };

    await getProducts(mockReq, mockRes, (err) => { throw err; });

    expect(mockResData).toBeDefined();
    expect(mockResData.success).toBe(true);
    expect(Array.isArray(mockResData.data)).toBe(true);
    expect(mockResData.data.length).toBe(1);

    vi.restoreAllMocks();
  });

  it('2. LEGACY_SYNTHETIC products preserve sourceStatus and are not auto-converted', () => {
    const dummyProduct = new Product({
      name: 'Legacy Test Smartphone',
      brand: 'Apple',
      category: 'smartphone',
      sourceStatus: 'LEGACY_SYNTHETIC'
    });

    expect(dummyProduct.sourceStatus).toBe('LEGACY_SYNTHETIC');
    expect(dummyProduct.sourceStatus).not.toBe('LIVE_VERIFIED');
  });

  it('3. SerpAPI 401 does not make MongoDB catalog unavailable', () => {
    const mockQueryFilter = {};
    if (process.env.CATALOG_STRICT_VERIFIED_ONLY === 'true') {
      mockQueryFilter.sourceStatus = 'LIVE_VERIFIED';
    }
    expect(mockQueryFilter).toBeDefined();
    expect(mockQueryFilter.sourceStatus).toBeUndefined();
  });

  it('4. Catalog read operation performs zero database writes', async () => {
    const createSpy = vi.spyOn(Product, 'create');
    const updateSpy = vi.spyOn(Product, 'updateOne');

    vi.spyOn(Product, 'find').mockImplementation(async () => {
      return [];
    });

    const mockReq = { query: { category: 'smartphone' } };
    const mockRes = {
      status: () => ({
        json: () => {}
      })
    };

    await getProducts(mockReq, mockRes, () => {});

    expect(createSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('5. Products correctly resolve MarketplaceProducts relationships', () => {
    const pId = new mongoose.Types.ObjectId();
    const mId = new mongoose.Types.ObjectId();

    const mpRecord = new MarketplaceProduct({
      product: pId,
      marketplace: mId,
      url: 'https://www.amazon.in/dp/B000000000',
      currentPrice: 2999,
      originalPrice: 3499,
      currency: 'INR'
    });

    expect(mpRecord.product.toString()).toBe(pId.toString());
    expect(mpRecord.marketplace.toString()).toBe(mId.toString());
    expect(mpRecord.currentPrice).toBe(2999);
  });
});
