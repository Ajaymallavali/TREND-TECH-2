import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore Emulator Migration Validation', () => {
  const auditDir = path.join(process.cwd(), '../audit');
  const reportPath = path.join(auditDir, 'firestoreDataIntegrityReport.json');
  
  let report;

  it('should have the data integrity report available', () => {
    expect(fs.existsSync(reportPath)).toBe(true);
    report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report).toBeDefined();
  });

  it('should have identical document counts between MongoDB and Firestore', () => {
    for (const [collName, stats] of Object.entries(report.collections)) {
      expect(stats.mongoCount).toBe(stats.firestoreCount);
      expect(stats.extraDocuments).toBe(0);
      expect(stats.missingDocuments).toBe(0);
    }
  });

  it('should have 100% hash match for all migrated documents', () => {
    for (const [collName, stats] of Object.entries(report.collections)) {
      expect(stats.documentsFailed).toBe(0);
      expect(stats.hashMismatches).toBe(0);
      expect(stats.documentsPassed).toBe(stats.mongoCount);
    }
  });

  it('should have exactly 867 products', () => {
    expect(report.collections['products'].mongoCount).toBe(867);
  });

  it('should have exactly 1181 marketplace products', () => {
    expect(report.collections['marketplaceproducts'].mongoCount).toBe(1181);
  });

  it('should have exactly 559 price histories', () => {
    expect(report.collections['pricehistories'].mongoCount).toBe(559);
  });
});
