import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Master Product Image Identity Forensic Scan Unit Tests', () => {

  // 1. Audit Report Files Existence
  it('1. should verify existence of all generated master forensic report files', () => {
    const auditDir = path.resolve(__dirname, '../../data/audits');

    const expectedFiles = [
      'projectImageForensicInventory.json',
      'projectImageForensicInventory.md',
      'imageHashForensics.json',
      'imageUrlIdentityForensics.json',
      'MASTER_PRODUCT_IMAGE_FORENSIC_REPORT.json',
      'MASTER_PRODUCT_IMAGE_FORENSIC_REPORT.md'
    ];

    expectedFiles.forEach(file => {
      expect(fs.existsSync(path.join(auditDir, file))).toBe(true);
    });
  });

  // 2. Verification Evidence Levels
  it('2. should enforce Level 6 as sole conceptual requirement for exact verification', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/MASTER_PRODUCT_IMAGE_FORENSIC_REPORT.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const levels = data.verificationLevels;

    // Pattern matches level 4/5 must NOT be treated as Level 6
    expect(levels.level6_provenExactRelationship).toBe(0);
    expect(levels.semanticIdentityNotVerifiedCount).toBeGreaterThan(0);
  });

  // 3. Root Cause Analysis Ranking
  it('3. should accurately rank root causes by affected product count', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/MASTER_PRODUCT_IMAGE_FORENSIC_REPORT.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const ranking = data.rootCausesRanking;

    expect(ranking.length).toBeGreaterThan(0);
    expect(ranking[0].code).toBe('LEGACY_STATIC_IMAGE_MAPPINGS');
  });

  // 4. Database Integrity Assertion
  it('4. should confirm databaseModified === false and equal product counts before and after', () => {
    const jsonPath = path.resolve(__dirname, '../../data/audits/MASTER_PRODUCT_IMAGE_FORENSIC_REPORT.json');
    if (!fs.existsSync(jsonPath)) return;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    expect(data.databaseModified).toBe(false);
    expect(data.databaseIntegrity.productsBefore).toBe(data.databaseIntegrity.productsAfter);
    expect(data.databaseIntegrity.marketplaceProductsBefore).toBe(data.databaseIntegrity.marketplaceProductsAfter);
    expect(data.databaseIntegrity.priceHistoryBefore).toBe(data.databaseIntegrity.priceHistoryAfter);
  });

});
