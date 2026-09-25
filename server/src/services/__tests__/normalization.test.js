import { describe, it, expect } from 'vitest';
import * as priceVerification from '../priceVerification.service.js';
import * as aiService from '../ai.service.js';
import { extractPriceAndCurrency } from '../webSearch.service.js';

describe('Price Verification Service', () => {
  it('verifyPrice returns true for valid positive numbers', () => {
    expect(priceVerification.verifyPrice(79999)).toBe(true);
    expect(priceVerification.verifyPrice(0.01)).toBe(true);
    expect(priceVerification.verifyPrice(0)).toBe(false);
    expect(priceVerification.verifyPrice(-100)).toBe(false);
    expect(priceVerification.verifyPrice('79999')).toBe(false);
  });

  it('verifyCurrency validates only INR', () => {
    expect(priceVerification.verifyCurrency('INR')).toBe(true);
    expect(priceVerification.verifyCurrency('USD')).toBe(false);
  });

  it('calculateDiscount computes correct percentage', () => {
    expect(priceVerification.calculateDiscount(100, 80)).toBe(20);
    expect(priceVerification.calculateDiscount(134900, 119900)).toBe(11);
    expect(priceVerification.calculateDiscount(80, 100)).toBe(0);
    expect(priceVerification.calculateDiscount(null, 80)).toBe(0);
  });

  it('determinePriceStatus returns status matching the source context', () => {
    expect(priceVerification.determinePriceStatus(79999, 'http://amazon.in', 'verified')).toBe('verified');
    expect(priceVerification.determinePriceStatus(79999, 'http://amazon.in', 'mock')).toBe('demo');
    expect(priceVerification.determinePriceStatus(0, 'http://amazon.in', 'verified')).toBe('unavailable');
  });
});

describe('AI Product Matching & Normalization', () => {
  it('normalizeProduct formats the raw input correctly', () => {
    const raw = { name: 'Apple iPhone 15', brand: 'Apple', specifications: { RAM: '8GB' } };
    const normalized = aiService.normalizeProduct(raw);
    expect(normalized.name).toBe('Apple iPhone 15');
    expect(normalized.category).toBe('electronics');
    expect(normalized.specifications.RAM).toBe('8GB');
  });

  it('matchProducts correctly matches same specs products', () => {
    const prodA = {
      brand: 'Apple',
      name: 'Apple iPhone 15 Pro 128GB',
      specifications: { Storage: '128GB', RAM: '8GB' }
    };
    const prodB = {
      brand: 'Apple',
      name: 'iPhone 15 Pro',
      specifications: { Storage: '128GB', RAM: '8GB' }
    };
    expect(aiService.matchProducts(prodA, prodB)).toBe(true);
  });

  it('matchProducts prevents merging different storage configurations', () => {
    const prodA = {
      brand: 'Apple',
      name: 'Apple iPhone 15 Pro 128GB',
      specifications: { Storage: '128GB' }
    };
    const prodB = {
      brand: 'Apple',
      name: 'Apple iPhone 15 Pro 256GB',
      specifications: { Storage: '256GB' }
    };
    expect(aiService.matchProducts(prodA, prodB)).toBe(false);
  });

  it('matchProducts prevents merging different brands', () => {
    const prodA = { brand: 'Apple', name: 'iPhone 15', specifications: {} };
    const prodB = { brand: 'Samsung', name: 'Galaxy S24', specifications: {} };
    expect(aiService.matchProducts(prodA, prodB)).toBe(false);
  });
});

describe('Web Search Snippet Parser', () => {
  it('extractPriceAndCurrency extracts INR formats successfully', () => {
    expect(extractPriceAndCurrency('Buy now for ₹89,999 on Amazon')).toEqual({ price: 89999, currency: 'INR' });
    expect(extractPriceAndCurrency('Rs 12,500 includes taxes')).toEqual({ price: 12500, currency: 'INR' });
    expect(extractPriceAndCurrency('Laptops under 1.25 lakhs')).toEqual({ price: 125000, currency: 'INR' });
    expect(extractPriceAndCurrency('EMI ₹4,999/month')).toBeNull(); // filters out installments
  });
});
