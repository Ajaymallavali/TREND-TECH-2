import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Product as MongoProduct } from '../models/Product.model.js';
import { MarketplaceProduct as MongoMP } from '../models/MarketplaceProduct.model.js';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createFirestoreModel } from '../database/firestore/FirestoreAdapter.js';
import '../models/Marketplace.model.js';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trend-tech';

if (getApps().length === 0) {
  const { applicationDefault } = require('firebase-admin/app');
  initializeApp({
    credential: applicationDefault(),
    projectId: 'trend-tech-2-c174c'
  });
});
}

const FirestoreProduct = createFirestoreModel('products');
const FirestoreMP = createFirestoreModel('marketplaceProducts');

async function runParity() {
  await mongoose.connect(MONGO_URI);
  
  const report = {
    totalQueriesTested: 0,
    queriesPassed: 0,
    queriesFailed: 0,
    performance: {
      mongo: [],
      firestore: []
    }
  };

  async function testQuery(name, mongoFn, firestoreFn) {
    report.totalQueriesTested++;
    
    const mStart = performance.now();
    const mRes = await mongoFn();
    const mTime = performance.now() - mStart;
    
    const fStart = performance.now();
    const fRes = await firestoreFn();
    const fTime = performance.now() - fStart;
    
    report.performance.mongo.push({ name, timeMs: mTime });
    report.performance.firestore.push({ name, timeMs: fTime });
    
    const mCount = Array.isArray(mRes) ? mRes.length : (mRes ? 1 : 0);
    const fCount = Array.isArray(fRes) ? fRes.length : (fRes ? 1 : 0);
    
    if (mCount === fCount) {
      report.queriesPassed++;
    } else {
      report.queriesFailed++;
      console.error(`Parity mismatch in ${name}. Mongo: ${mCount}, Firestore: ${fCount}`);
    }
  }

  console.log('Testing Product Search...');
  await testQuery('Search Samsung Smartphones', 
    () => MongoProduct.find({ brand: 'Samsung', category: 'smartphone' }).lean(),
    () => FirestoreProduct.find({ brand: 'Samsung', category: 'smartphone' }).lean()
  );

  console.log('Testing exact Product ID lookup...');
  const sampleProduct = await MongoProduct.findOne({}).lean();
  const idStr = sampleProduct._id.toString();
  await testQuery('Find Product by ID',
    () => MongoProduct.findById(idStr).lean(),
    () => FirestoreProduct.findById(idStr).lean()
  );

  console.log('Testing populated MarketplaceProducts lookup...');
  await testQuery('Find MP by Product ID with Populate',
    () => MongoMP.find({ product: idStr }).populate('marketplace').lean(),
    () => FirestoreMP.find({ product: idStr }).populate('marketplace').lean()
  );

  console.log('Testing Apple Search...');
  await testQuery('Search Apple',
    () => MongoProduct.find({ brand: 'Apple' }).lean(),
    () => FirestoreProduct.find({ brand: 'Apple' }).lean()
  );

  const outDir = path.join(process.cwd(), 'audit');
  fs.writeFileSync(path.join(outDir, 'firestoreRepositoryParity.json'), JSON.stringify(report, null, 2));

  let md = `# Firestore Repository Parity Report\n\n`;
  md += `- **Total Queries Tested:** ${report.totalQueriesTested}\n`;
  md += `- **Queries Passed Parity:** ${report.queriesPassed}\n`;
  md += `- **Queries Failed Parity:** ${report.queriesFailed}\n\n`;
  md += `## Performance Measurements (Local Emulator vs Local Mongo)\n`;
  md += `| Query | MongoDB Time (ms) | Firestore Emulator Time (ms) |\n`;
  md += `|-------|-------------------|------------------------------|\n`;
  
  for (let i = 0; i < report.performance.mongo.length; i++) {
    md += `| ${report.performance.mongo[i].name} | ${report.performance.mongo[i].timeMs.toFixed(2)} | ${report.performance.firestore[i].timeMs.toFixed(2)} |\n`;
  }
  
  md += `\n*Note: Firestore performance currently reflects in-memory emulator without index pre-optimization.*`;
  
  fs.writeFileSync(path.join(outDir, 'firestoreRepositoryParity.md'), md);
  
  console.log('Parity check complete!');
  mongoose.disconnect();
}

runParity().catch(console.error);
