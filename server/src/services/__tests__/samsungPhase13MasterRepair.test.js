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

describe('Samsung Phase 13 — Deep Official Image Acquisition & Invariant Verification', () => {
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

  it('1. Phase 13 Diagnostic & Repair Audit Reports Exist and are Valid', () => {
    const queueJson = path.join(__dirname, '../../data/audits/samsungPhase13CandidateQueue.json');
    const diagJson = path.join(__dirname, '../../data/audits/samsungPhase13AcquisitionDiagnostic.json');
    const diagMd = path.join(__dirname, '../../data/audits/samsungPhase13AcquisitionDiagnostic.md');
    const perProdJson = path.join(__dirname, '../../data/audits/samsungPhase13PerProductResults.json');
    const imgIdxJson = path.join(__dirname, '../../data/audits/samsungPhase13ImageIdentityIndex.json');
    const repJson = path.join(__dirname, '../../data/audits/samsungPhase13ImageRepairReport.json');
    const repMd = path.join(__dirname, '../../data/audits/samsungPhase13ImageRepairReport.md');

    expect(fs.existsSync(queueJson)).toBe(true);
    expect(fs.existsSync(diagJson)).toBe(true);
    expect(fs.existsSync(diagMd)).toBe(true);
    expect(fs.existsSync(perProdJson)).toBe(true);
    expect(fs.existsSync(imgIdxJson)).toBe(true);
    expect(fs.existsSync(repJson)).toBe(true);
    expect(fs.existsSync(repMd)).toBe(true);

    const queueData = JSON.parse(fs.readFileSync(queueJson, 'utf-8'));
    expect(queueData.length).toBe(12);

    const diagData = JSON.parse(fs.readFileSync(diagJson, 'utf-8'));
    expect(diagData.length).toBe(12);

    const repData = JSON.parse(fs.readFileSync(repJson, 'utf-8'));
    expect(repData.samsungProducts).toBe(30);
    expect(repData.previouslyVerified).toBe(18);
    expect(repData.phase13Candidates).toBe(12);
    expect(repData.productsAttempted).toBe(12);
    expect(repData.newlyVerified).toBe(4);
    expect(repData.stillUnverified).toBe(8);
    expect(repData.databaseWrites).toBe(4);
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
    expect(verifiedSamsung.length).toBe(21);
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
      '6aa06057af8879d815dcae5a', // Galaxy Watch Ultra
      '6aa06057af8879d815dcae69'  // Galaxy Watch 7
    ];

    for (const id of newlyVerifiedIds) {
      const prod = await db.collection('products').findOne({ _id: new mongoose.Types.ObjectId(id) });
      expect(prod).not.toBeNull();
      expect(prod.imageStatus).toBe('VERIFIED_EXACT');
      expect(prod.image).toBe(`/product-images/samsung/${id}/primary.jpg`);

      const imgPath = path.join(__dirname, `../../data/product-images/samsung/${id}/primary.jpg`);
      const metaPath = path.join(__dirname, `../../data/product-images/samsung/${id}/metadata.json`);

      expect(fs.existsSync(imgPath)).toBe(true);
      expect(fs.existsSync(metaPath)).toBe(true);

      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      expect(meta.productId).toBe(id);
      expect(meta.verificationStatus).toBe('VERIFIED_EXACT');
      expect(meta.sha256).toBeDefined();
    }
  });
});
