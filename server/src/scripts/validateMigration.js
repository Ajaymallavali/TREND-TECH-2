import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'demo-trend-tech';

initializeApp({
  projectId: 'demo-trend-tech'
});

const firestore = getFirestore();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trend-tech';

function normalizeForHash(obj) {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();
  if (obj instanceof Date) return obj.getTime();
  if (obj instanceof Timestamp) return obj.toDate().getTime();
  if (Array.isArray(obj)) return obj.map(normalizeForHash);
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    const sorted = {};
    for (const k of keys) {
      if (k === '__v' || k === 'legacyMongoId' || k === '_id') continue; 
      sorted[k] = normalizeForHash(obj[k]);
    }
    return sorted;
  }
  return obj;
}

function calculateHash(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(normalizeForHash(obj))).digest('hex');
}

async function validateCollection(db, mongoName, firestoreName, report) {
  const mongoDocs = await db.collection(mongoName).find({}).toArray();
  const firestoreSnapshot = await firestore.collection(firestoreName).get();
  
  const fsMap = new Map();
  firestoreSnapshot.docs.forEach(d => fsMap.set(d.id, d.data()));

  const stats = {
    documentsChecked: mongoDocs.length,
    documentsPassed: 0,
    documentsFailed: 0,
    missingDocuments: 0,
    fieldMismatches: 0,
    hashMismatches: 0
  };

  for (const mDoc of mongoDocs) {
    const id = mDoc._id.toString();
    const fDoc = fsMap.get(id);

    if (!fDoc) {
      stats.missingDocuments++;
      stats.documentsFailed++;
      report.missing.push({ collection: mongoName, id });
      continue;
    }

    const mHash = calculateHash(mDoc);
    const fHash = calculateHash(fDoc);

    if (mHash === fHash) {
      stats.documentsPassed++;
    } else {
      stats.hashMismatches++;
      stats.documentsFailed++;
      report.mismatches.push({ 
        collection: mongoName, 
        id, 
        mHash, 
        fHash,
        mongoObj: normalizeForHash(mDoc),
        firestoreObj: normalizeForHash(fDoc)
      });
    }
  }

  const extraDocs = firestoreSnapshot.size - mongoDocs.length;

  report.collections[mongoName] = {
    mongoCount: mongoDocs.length,
    firestoreCount: firestoreSnapshot.size,
    ...stats,
    extraDocuments: extraDocs > 0 ? extraDocs : 0
  };
}

async function runValidation() {
  console.log('Starting Migration Validation...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const report = {
    collections: {},
    mismatches: [],
    missing: []
  };

  const collectionsToMigrate = {
    'products': 'products',
    'marketplaceproducts': 'marketplaceProducts',
    'pricehistories': 'priceHistory',
    'marketplaces': 'marketplaces',
    'categories': 'categories',
    'deals': 'deals',
    'users': 'users'
  };

  for (const [mongoName, firestoreName] of Object.entries(collectionsToMigrate)) {
    console.log(`Validating ${mongoName}...`);
    await validateCollection(db, mongoName, firestoreName, report);
  }

  const outDir = path.join(process.cwd(), 'audit');
  fs.writeFileSync(path.join(outDir, 'firestoreEmulatorMigrationValidation.json'), JSON.stringify(report, null, 2));

  let md = `# Firestore Emulator Migration Validation\n\n`;
  let overallPassed = true;

  for (const [coll, stats] of Object.entries(report.collections)) {
    md += `## Collection: ${coll}\n`;
    md += `- Mongo Count: ${stats.mongoCount}\n`;
    md += `- Firestore Count: ${stats.firestoreCount}\n`;
    md += `- Documents Passed Hash Check: ${stats.documentsPassed}\n`;
    md += `- Documents Failed: ${stats.documentsFailed}\n`;
    md += `- Missing Documents: ${stats.missingDocuments}\n`;
    md += `- Extra Documents: ${stats.extraDocuments}\n\n`;

    if (stats.documentsFailed > 0 || stats.missingDocuments > 0 || stats.extraDocuments > 0) {
      overallPassed = false;
    }
  }

  md += `## Data Integrity Report\n`;
  if (overallPassed) {
    md += `**All documents successfully verified! Hashes match exactly.**\n`;
  } else {
    md += `**FAILED:** There are data mismatches.\n`;
    md += `Mismatches: ${report.mismatches.length}\n`;
    md += `Missing: ${report.missing.length}\n`;
  }

  fs.writeFileSync(path.join(outDir, 'firestoreEmulatorMigrationValidation.md'), md);
  fs.writeFileSync(path.join(outDir, 'firestoreDataIntegrityReport.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, 'firestoreDataIntegrityReport.md'), md);

  console.log('Validation complete.');
  mongoose.disconnect();
}

runValidation().catch(console.error);
