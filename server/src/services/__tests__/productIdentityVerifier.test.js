import { describe, test, expect } from 'vitest';
import {
  verifyProductIdentity,
  verifyCategoryCompatibility,
  isAccessoryItem
} from '../productIdentityVerifier.service.js';

describe('PHASE 5A PRODUCT IDENTITY VERIFIER UNIT TESTS', () => {

  // TEST 1: iPhone target + MacBook candidate -> REJECT
  test('TEST 1: iPhone target + MacBook candidate -> REJECT', () => {
    const target = { name: 'Apple iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Apple MacBook Air M3', brand: 'Apple', category: 'laptop' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Category mismatch|Laptop/i);
  });

  // TEST 2: iPhone target + iPhone case -> REJECT
  test('TEST 2: iPhone target + iPhone case -> REJECT', () => {
    const target = { name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Apple iPhone 16e Silicone Case with MagSafe', brand: 'Apple', category: 'accessory' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/accessory/i);
  });

  // TEST 3: iPhone target + iPhone wrong generation -> REJECT
  test('TEST 3: iPhone target + iPhone wrong generation -> REJECT', () => {
    const target = { name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Apple iPhone 16 128GB', brand: 'Apple', category: 'smartphone' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Variant mismatch/i);
  });

  // TEST 4: iPhone target + iPhone correct model -> ACCEPT
  test('TEST 4: iPhone target + iPhone correct model -> ACCEPT', () => {
    const target = { name: 'Apple iPhone 16e', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Apple iPhone 16e (128 GB) - White', brand: 'Apple', category: 'smartphone' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(true);
  });

  // TEST 5: iPad target + iPhone image -> REJECT
  test('TEST 5: iPad target + iPhone candidate -> REJECT', () => {
    const target = { name: 'Apple iPad Air 11-inch M2', brand: 'Apple', category: 'tablet' };
    const candidate = { title: 'Apple iPhone 16 Pro Max', brand: 'Apple', category: 'smartphone' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Category mismatch/i);
  });

  // TEST 6: Sony TV + Sony headphones image -> REJECT
  test('TEST 6: Sony TV + Sony headphones -> REJECT', () => {
    const target = { name: 'Sony 55 inch Bravia 4K TV', brand: 'Sony', category: 'television' };
    const candidate = { title: 'Sony WH-1000XM5 Wireless Headphones', brand: 'Sony', category: 'headphones' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Category mismatch|Model\/Category mismatch/i);
  });

  // TEST 7: Samsung phone + Samsung tablet -> REJECT
  test('TEST 7: Samsung phone + Samsung tablet -> REJECT', () => {
    const target = { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'smartphone' };
    const candidate = { title: 'Samsung Galaxy Tab S9 11-inch', brand: 'Samsung', category: 'tablet' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Category mismatch/i);
  });

  // TEST 8: Dell laptop + Dell XPS when target is Inspiron 15 -> REJECT
  test('TEST 8: Dell Inspiron + Dell XPS -> REJECT', () => {
    const target = { name: 'Dell Inspiron 15 3520', brand: 'Dell', category: 'laptop' };
    const candidate = { title: 'Dell XPS 15 9530', brand: 'Dell', category: 'laptop' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Model number mismatch/i);
  });

  // TEST 17: Amazon Product API ASIN mismatch -> REJECT
  test('TEST 17: Amazon Product API ASIN mismatch -> REJECT', () => {
    const target = { name: 'OnePlus 13', brand: 'OnePlus', category: 'smartphone', asin: 'B08XYZ1234' };
    const candidate = { title: 'OnePlus 13 5G', brand: 'OnePlus', category: 'smartphone', asin: 'B08ABC9999' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/ASIN mismatch/i);
  });

  // TEST 18: Amazon Product API title mismatch -> REJECT
  test('TEST 18: Amazon Product API title mismatch -> REJECT', () => {
    const target = { name: 'Sony WH-1000XM5', brand: 'Sony', category: 'headphones' };
    const candidate = { title: 'Sony WH-1000XM4 Wireless Headphones', brand: 'Sony', category: 'headphones' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Model\/Category mismatch/i);
  });

  // TEST 19: Amazon Product API brand mismatch -> REJECT
  test('TEST 19: Amazon Product API brand mismatch -> REJECT', () => {
    const target = { name: 'Apple iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'smartphone' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Brand mismatch/i);
  });

  // TEST 20: variant mismatch -> REJECT
  test('TEST 20: variant mismatch -> REJECT', () => {
    const target = { name: 'Apple iPhone 16 Pro Max', brand: 'Apple', category: 'smartphone' };
    const candidate = { title: 'Apple iPhone 16 Pro', brand: 'Apple', category: 'smartphone' };
    const res = verifyProductIdentity({ target, candidate });
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/Variant mismatch/i);
  });

});
