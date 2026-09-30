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

describe('Samsung Phase 12 — Real Official Image Acquisition & Invariant Verification', () => {
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

  it('1. Phase 12 Diagnostic & Repair Audit Reports Exist and are Valid', () => {
    const diagJson = path.join(__dirname, '../../data/audits/samsungPhase12AcquisitionDiagnostic.json');
    const diagMd = path.join(__dirname, '../../data/audits/samsungPhase12AcquisitionDiagnostic.md');
    const perProdJson = path.join(__dirname, '../../data/audits/samsungPhase12PerProductResults.json');
    const imgIdxJson = path.join(__dirname, '../../data/audits/samsungPhase12ImageIdentityIndex.json');
    const repJson = path.join(__dirname, '../../data/audits/samsungPhase12ImageRepairReport.json');
    const repMd = path.join(__dirname, '../../data/audits/samsungPhase12ImageRepairReport.md');

    expect(fs.existsSync(diagJson)).toBe(true);
    expect(fs.existsSync(diagMd)).toBe(true);
    expect(fs.existsSync(perProdJson)).toBe(true);
    expect(fs.existsSync(imgIdxJson)).toBe(true);
    expect(fs.existsSync(repJson)).toBe(true);
    expect(fs.existsSync(repMd)).toBe(true);

    const diagData = JSON.parse(fs.readFileSync(diagJson, 'utf-8'));
    expect(diagData.length).toBe(17);

    const repData = JSON.parse(fs.readFileSync(repJson, 'utf-8'));
    expect(repData.samsungProducts).toBe(30);
    expect(repData.previouslyVerified).toBe(13);
    expect(repData.phase12Candidates).toBe(17);
    expect(repData.productsAttempted).toBe(17);
    expect(repData.newlyVerified).toBe(5);
    expect(repData.stillUnverified).toBe(12);
    expect(repData.databaseWrites).toBe(5);
  });

  it('2. Apple Isolation & Verified Samsung Count Maintained', async () => {
    const db = mongoose.connection.db;
    const appleProducts = await db.collection('products').find({ brand: /apple/i }).toArray();
    expect(appleProducts.length).toBe(40);

    const verifiedApple = appleProducts.filter(p => p.imageStatus === 'VERIFIED_EXACT');
    expect(verifiedApple.length).toBe(32);

    const verifiedSamsung = await db.collection('products').find({
      brand: /samsung/i,
      imageStatus: 'VERIFIED_EXACT'
    }).toArray();
    expect(verifiedSamsung.length).toBeGreaterThanOrEqual(18); // 13 previously verified + 5 newly verified in Phase 12 (now 22 after Phase 13)
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

  it('4. Newly Verified Samsung Local Assets Exist on Filesystem', async () => {
    const db = mongoose.connection.db;
    const newlyVerifiedIds = [
      '6aa06056af8879d815dca5c5', // Galaxy S25+
      '6aa06057af8879d815dcae78', // Galaxy Watch 6 Classic
      '6aa06058af8879d815dcb12a', // Galaxy Tab S10+
      '6aa06058af8879d815dcb148'  // Galaxy Tab A9+
    ];

    for (const id of newlyVerifiedIds) {
      const prod = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
      expect(prod).not.toBeNull();
      expect(prod.imageStatus).toBe('VERIFIED_EXACT');
      expect(prod.image).toMatch(/cloudinary\.com|product-images/);

      const imgPath = path.join(__dirname, `../../data/product-images/samsung/${id}/primary.jpg`);
      const metaPath = path.join(__dirname, `../../data/product-images/samsung/${id}/metadata.json`);

      expect(fs.existsSync(imgPath)).toBe(true);
      expect(fs.existsSync(metaPath)).toBe(true);
    }
  });
});
