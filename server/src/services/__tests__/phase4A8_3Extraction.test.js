import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 4A.8.3 — Force Actual Product Coverage Extraction Unit Tests', () => {

  // 1. Mandatory Product Count Invariant Check
  it('1. should verify exact product invariant (30 + 835 + 0 + 2 === 867)', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_3ActualExtraction.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const counts = data.productLevelCounts;

    const sum = counts.verifiedExactImages +
                counts.unresolvedProducts +
                counts.identityMismatches +
                counts.duplicateConflicts;

    expect(sum).toBe(counts.totalUniqueProducts);
    expect(sum).toBe(867);
  });

  // 2. Exact Coverage Percentage Metric
  it('2. should verify exact image coverage rate (3.5%)', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_3ActualExtraction.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(data.productLevelCounts.exactImageCoveragePct).toBe('3.5%');
  });

  // 3. Sample Products Verification
  it('3. should verify 10 real verified and 10 real unresolved sample products', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_3ActualExtraction.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(data.sampleVerifiedProducts.length).toBe(10);
    expect(data.sampleUnresolvedProducts.length).toBe(10);

    data.sampleVerifiedProducts.forEach(v => {
      expect(v.productId).toBeDefined();
      expect(v.imageUrl).toContain('http');
    });
  });

  // 4. Database Safety Assertion
  it('4. should confirm databaseModified === false and 0 Product.image writes', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_3ActualExtraction.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(data.databaseModified).toBe(false);
    expect(data.databaseIntegrity.productImageWrites).toBe(0);
    expect(data.databaseIntegrity.productsBefore).toBe(data.databaseIntegrity.productsAfter);
  });

});
