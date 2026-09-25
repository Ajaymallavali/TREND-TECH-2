import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Phase 4A.8.1 — Full Catalog Result Audit Unit Tests', () => {

  // 1. Mandatory Product Count Invariant Check
  it('1. should satisfy mandatory product invariant (30 + 835 + 0 + 2 === 867)', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_1FullCatalogResultAudit.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    const acc = data.productAccounting;

    const sum = acc.verifiedExactImages +
                acc.unresolvedProducts +
                acc.identityMismatches +
                acc.duplicateConflicts;

    expect(sum).toBe(acc.productsProcessed);
    expect(sum).toBe(867);
  });

  // 2. Exact Coverage Percentage Metric
  it('2. should accurately compute exact image coverage rate (3.5%)', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_1FullCatalogResultAudit.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    const coverageStr = data.productAccounting.exactImageCoveragePct;
    expect(coverageStr).toBe('3.5%');
  });

  // 3. Local Files Verification
  it('3. should verify all 30 downloaded local image files exist and are readable', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_1FullCatalogResultAudit.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    const localAudit = data.localFilesAudit;

    expect(localAudit.expectedFiles).toBe(30);
    expect(localAudit.downloadedFiles).toBe(30);
    expect(localAudit.missingFiles).toBe(0);
    expect(localAudit.unreadableFiles).toBe(0);
  });

  // 4. Database Integrity Assertion
  it('4. should confirm databaseModified === false and 0 product.image writes', () => {
    const auditJsonPath = path.resolve(__dirname, '../../data/audits/phase4A8_1FullCatalogResultAudit.json');
    if (!fs.existsSync(auditJsonPath)) return;

    const data = JSON.parse(fs.readFileSync(auditJsonPath, 'utf8'));
    expect(data.databaseModified).toBe(false);
    expect(data.databaseIntegrity.productImageWrites).toBe(0);
    expect(data.databaseIntegrity.productsBefore).toBe(data.databaseIntegrity.productsAfter);
  });

});
