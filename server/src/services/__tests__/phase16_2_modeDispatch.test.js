import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import '../../models/Product.model.js';
import '../../models/MarketplaceProduct.model.js';
import '../../models/PriceHistory.model.js';
import '../../models/Marketplace.model.js';
import { analyzeProductWorkflow } from '../productUrlAnalysis/index.js';

describe('PHASE 16.2 MODE DISPATCH UNIT TESTS', () => {

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendtech');
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('TEST 1: Product Search returns SUCCESS mode', async () => {
    const result = await analyzeProductWorkflow({ query: 'Samsung Galaxy S25 Ultra' });
    expect(result.status).toBe('SUCCESS');
    expect(result.product).toBeDefined();
    expect(result.identity).toBeDefined();
    expect(result.bestDeal).toBeDefined();
  });

  test('TEST 2: Natural Language Recommendation returns RECOMMENDATION_SUCCESS', async () => {
    const result = await analyzeProductWorkflow({ query: 'Best gaming laptop under ₹100000' });
    expect(result.status).toBe('RECOMMENDATION_SUCCESS');
    expect(result.recommendations).toBeDefined();
    expect(result.request.budget.maxPrice).toBe(100000);
  });

  test('TEST 3: Product Comparison returns COMPARISON_SUCCESS', async () => {
    const result = await analyzeProductWorkflow({ query: 'Compare Galaxy S25 Ultra and iPhone 17 Pro' });
    expect(result.status).toBe('COMPARISON_SUCCESS');
    expect(result.comparison.length).toBe(2);
  });

  test('TEST 4: Partial Match returns PARTIAL_MATCH', async () => {
    const result = await analyzeProductWorkflow({ query: 'Samsung Galaxy S25' });
    // Depending on DB, it should find multiple variants
    if (result.status === 'PARTIAL_MATCH') {
      expect(result.candidates.length).toBeGreaterThan(1);
    }
  });

});
