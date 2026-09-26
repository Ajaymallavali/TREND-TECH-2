import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { normalizeSamsungIdentity } from '../../scripts/processSamsungPhase8Repair.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

describe('Samsung Phase 8 — Identity Enrichment & Image Recovery Verification', () => {
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

  it('1. Deterministic Identity Normalization for Samsung Models', () => {
    const fold = normalizeSamsungIdentity('Samsung Galaxy Z Fold 6', 'smartphone');
    expect(fold.family).toBe('Galaxy Z Fold');
    expect(fold.model).toBe('Galaxy Z Fold 6');
    expect(fold.modelNumber).toBe('SM-F956B');

    const s24u = normalizeSamsungIdentity('Samsung Galaxy S24 Ultra', 'smartphone');
    expect(s24u.family).toBe('Galaxy S');
    expect(s24u.model).toBe('Galaxy S24 Ultra');
    expect(s24u.modelNumber).toBe('SM-S928B');

    const tv = normalizeSamsungIdentity('Samsung 65" Neo QLED 8K (QN900D)', 'television');
    expect(tv.family).toBe('Neo QLED 8K');
    expect(tv.model).toBe('QN900D');
    expect(tv.modelNumber).toBe('QA65QN900DKXXL');

    const g9 = normalizeSamsungIdentity('Samsung Odyssey OLED G9 49"', 'monitor');
    expect(g9.family).toBe('Odyssey OLED');
    expect(g9.model).toBe('OLED G9 (G95SC)');
    expect(g9.modelNumber).toBe('LS49CG954SWXXL');
  });

  it('2. Exact Model Mismatch Rejection Guard', () => {
    const s24Ultra = normalizeSamsungIdentity('Samsung Galaxy S24 Ultra', 'smartphone');
    const s24Base = normalizeSamsungIdentity('Samsung Galaxy S24', 'smartphone');
    expect(s24Ultra.model).not.toBe(s24Base.model);
    expect(s24Ultra.modelNumber).not.toBe(s24Base.modelNumber);
  });

  it('3. Apple Isolation Protection', async () => {
    const db = mongoose.connection.db;
    const appleProducts = await db.collection('products').find({ brand: /apple/i }).toArray();
    expect(appleProducts.length).toBe(40);

    const verifiedApple = appleProducts.filter(p => p.imageStatus === 'VERIFIED_EXACT');
    expect(verifiedApple.length).toBe(32);
  });

  it('4. Non-Samsung Catalog Invariant Guard', async () => {
    const db = mongoose.connection.db;
    const totalProducts = await db.collection('products').countDocuments();
    const totalMps = await db.collection('marketplaceproducts').countDocuments();
    const totalPh = await db.collection('pricehistories').countDocuments();

    expect(totalProducts).toBe(867);
    expect(totalMps).toBe(1181);
    expect(totalPh).toBe(559);
  });

  it('5. Samsung Verified Local Assets & Provenance Integrity', async () => {
    const db = mongoose.connection.db;
    const verifiedSamsung = await db.collection('products').find({
      brand: /samsung/i,
      imageStatus: 'VERIFIED_EXACT'
    }).toArray();

    expect(verifiedSamsung.length).toBe(6);

    for (const p of verifiedSamsung) {
      const imgPath = path.join(__dirname, `../../data/product-images/samsung/${p._id.toString()}/primary.jpg`);
      const metaPath = path.join(__dirname, `../../data/product-images/samsung/${p._id.toString()}/metadata.json`);
      expect(fs.existsSync(imgPath)).toBe(true);
      expect(fs.existsSync(metaPath)).toBe(true);
    }
  });
});
