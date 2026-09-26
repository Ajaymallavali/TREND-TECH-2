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

describe('Samsung Phase 11 — Remaining Image Recovery & Invariant Verification', () => {
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

  it('1. Phase 11 Audit Files Exist and are Valid', () => {
    const invJson = path.join(__dirname, '../../data/audits/samsungPhase11MasterInventory.json');
    const invMd = path.join(__dirname, '../../data/audits/samsungPhase11MasterInventory.md');
    const idJson = path.join(__dirname, '../../data/audits/samsungPhase11IdentityAudit.json');
    const imgIdxJson = path.join(__dirname, '../../data/audits/samsungPhase11ImageIdentityIndex.json');
    const repJson = path.join(__dirname, '../../data/audits/samsungPhase11ImageRepairReport.json');
    const repMd = path.join(__dirname, '../../data/audits/samsungPhase11ImageRepairReport.md');

    expect(fs.existsSync(invJson)).toBe(true);
    expect(fs.existsSync(invMd)).toBe(true);
    expect(fs.existsSync(idJson)).toBe(true);
    expect(fs.existsSync(imgIdxJson)).toBe(true);
    expect(fs.existsSync(repJson)).toBe(true);
    expect(fs.existsSync(repMd)).toBe(true);

    const invData = JSON.parse(fs.readFileSync(invJson, 'utf-8'));
    expect(invData.length).toBe(17);

    const repData = JSON.parse(fs.readFileSync(repJson, 'utf-8'));
    expect(repData.samsungProducts).toBe(30);
    expect(repData.previouslyVerified).toBe(13);
    expect(repData.phase11Candidates).toBe(17);
    expect(repData.databaseWrites).toBe(0);
  });

  it('2. Apple Isolation & Frozen 13 Samsung Products Maintained', async () => {
    const db = mongoose.connection.db;
    const appleProducts = await db.collection('products').find({ brand: /apple/i }).toArray();
    expect(appleProducts.length).toBe(40);

    const verifiedApple = appleProducts.filter(p => p.imageStatus === 'VERIFIED_EXACT');
    expect(verifiedApple.length).toBe(32);

    const verifiedSamsung = await db.collection('products').find({
      brand: /samsung/i,
      imageStatus: 'VERIFIED_EXACT'
    }).toArray();
    expect(verifiedSamsung.length).toBe(13);
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
