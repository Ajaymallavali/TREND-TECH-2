import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 4A.8 — Full Catalog Dry Run Unit Tests', () => {

  // 1. Mandatory Product Invariant Check
  it('1. should satisfy mandatory product invariant (resolved + unresolved + identityMismatch + duplicate === 867)', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8FullCatalogDryRun.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    const counters = data.productCounters;

    const sum = counters.productsResolved +
                counters.productsUnresolved +
                counters.productsIdentityMismatch +
                counters.productsDuplicateConflict;

    expect(sum).toBe(counters.productsProcessed);
    expect(sum).toBe(867);
  });

  // 2. Database Safety Assertion
  it('2. should enforce databaseModified === false and equal product counts before/after', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8FullCatalogDryRun.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    expect(data.databaseModified).toBe(false);
    expect(data.databaseIntegrity.productsBefore).toBe(data.databaseIntegrity.productsAfter);
    expect(data.databaseIntegrity.marketplaceProductsBefore).toBe(data.databaseIntegrity.marketplaceProductsAfter);
    expect(data.databaseIntegrity.priceHistoryBefore).toBe(data.databaseIntegrity.priceHistoryAfter);
  });

  // 3. Output Audit Files Existence Check
  it('3. should generate all 6 required Phase 4A.8 audit files', () => {
    const auditDir = path.resolve(__dirname, '../../data/audits');

    const expectedFiles = [
      'phase4A8FullCatalogDryRun.json',
      'phase4A8FullCatalogDryRun.md',
      'phase4A8FullCatalogFailures.json',
      'phase4A8FullCatalogSuccesses.json',
      'phase4A8FullCatalogDuplicates.json',
      'phase4A8FullCatalogMetrics.json'
    ];

    expectedFiles.forEach(file => {
      expect(fs.existsSync(path.join(auditDir, file))).toBe(true);
    });
  });

});
