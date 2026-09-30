import { describe, it, expect } from 'vitest';
import { parseShoppingQuery } from '../recommendationEngine/parser.js';

describe('AI Shopping Parser', () => {
  it('extracts budget under X', () => {
    const res = parseShoppingQuery('best gaming laptop under 100000');
    expect(res.intent).toBe('NATURAL_LANGUAGE_SHOPPING');
    expect(res.budget.maxPrice).toBe(100000);
    expect(res.category).toBe('Laptops');
    expect(res.requirements).toContain('gaming');
  });

  it('extracts budget in K', () => {
    const res = parseShoppingQuery('phone under 30k with good camera');
    expect(res.intent).toBe('NATURAL_LANGUAGE_SHOPPING');
    expect(res.budget.maxPrice).toBe(30000);
    expect(res.category).toBe('Mobiles');
    expect(res.requirements).toContain('camera');
  });

  it('extracts specific requirements like RAM and Storage', () => {
    const res = parseShoppingQuery('laptop 16gb ram 512gb storage');
    expect(res.requirements).toContain('16GB RAM');
    expect(res.requirements).toContain('512GB Storage');
    expect(res.category).toBe('Laptops');
  });

  it('detects product comparison', () => {
    const res = parseShoppingQuery('compare Galaxy S25 Ultra vs iPhone 17 Pro');
    expect(res.intent).toBe('PRODUCT_COMPARISON');
    expect(res.compareSubjects).toContain('galaxy s25 ultra');
    expect(res.compareSubjects).toContain('iphone 17 pro');
  });
});
