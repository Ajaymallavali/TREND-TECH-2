import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

describe('Samsung Phase 10 — Image Acquisition & Repair Invariants', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('1. Phase 10 Diagnostic & Audit Reports Exist and are Valid', () => {
    const diagJson = path.join(__dirname, '../../data/audits/samsungPhase10AcquisitionDiagnostic.json');
    const diagMd = path.join(__dirname, '../../data/audits/samsungPhase10AcquisitionDiagnostic.md');
    const perProdJson = path.join(__dirname, '../../data/audits/samsungPhase10PerProductResults.json');
    const repJson = path.join(__dirname, '../../data/audits/samsungPhase10ImageRepairReport.json');
    const repMd = path.join(__dirname, '../../data/audits/samsungPhase10ImageRepairReport.md');

    expect(fs.existsSync(diagJson)).toBe(true);
    expect(fs.existsSync(diagMd)).toBe(true);
    expect(fs.existsSync(perProdJson)).toBe(true);
    expect(fs.existsSync(repJson)).toBe(true);
    expect(fs.existsSync(repMd)).toBe(true);

    const diagData = JSON.parse(fs.readFileSync(diagJson, 'utf-8'));
    expect(diagData.length).toBe(24);

    const repData = JSON.parse(fs.readFileSync(repJson, 'utf-8'));
    expect(repData.samsungProducts).toBe(30);
    expect(repData.previouslyVerified).toBe(6);
    expect(repData.phase10Candidates).toBe(24);
    expect(repData.newlyVerified).toBe(7);
    expect(repData.stillUnverified).toBe(17);
    expect(repData.databaseWrites).toBe(7);
  });

  it('2. Apple Isolation & Non-Samsung Protection Maintained', async () => {
    const db = mongoose.connection.db;
    const appleProducts = await db.collection('products').find({ brand: /apple/i }).toArray();
    expect(appleProducts.length).toBe(40);

    const verifiedApple = appleProducts.filter(p => p.imageStatus === 'VERIFIED_EXACT');
    expect(verifiedApple.length).toBe(32);

    const verifiedSamsung = await db.collection('products').find({
      brand: /samsung/i,
      imageStatus: 'VERIFIED_EXACT'
    }).toArray();
    expect(verifiedSamsung.length).toBe(13); // 6 previously verified + 7 newly verified in Phase 10
  });

  it('3. Catalog Invariants Strictly Maintained', async () => {
    const db = mongoose.connection.db;
    const totalProducts = await db.collection('products').countDocuments();
    const totalMps = await db.collection('marketplaceproducts').countDocuments();
    const totalPh = await db.collection('pricehistories').countDocuments();

    expect(totalProducts).toBe(867);
    expect(totalMps).toBe(1181);
    expect(totalPh).toBe(559);
  });
});
