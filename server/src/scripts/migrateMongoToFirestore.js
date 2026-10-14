import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const isDryRun = process.argv.includes('--dry-run');

// Initialize with Application Default Credentials for production
initializeApp({
  credential: applicationDefault(),
  projectId: 'trend-tech-2-c174c'
});

const firestore = getFirestore();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trend-tech';

function cleanMongoDocument(doc) {
  const cleaned = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') {
      cleaned.legacyMongoId = value.toString();
      continue;
    }
    if (key === '__v') continue;

    if (value instanceof mongoose.Types.ObjectId) {
      cleaned[key] = value.toString();
    } else if (value instanceof Date) {
      cleaned[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(v => 
        (v instanceof mongoose.Types.ObjectId) ? v.toString() : 
        (v && typeof v === 'object' && !(v instanceof Date)) ? cleanMongoDocument(v) : v
      );
    } else if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof mongoose.Types.ObjectId)) {
      cleaned[key] = cleanMongoDocument(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function migrateCollection(db, collectionName, firestoreCollectionName, metrics) {
  const items = await db.collection(collectionName).find({}).toArray();
  
  metrics[collectionName] = {
    found: items.length,
    migrated: 0,
    failed: 0,
    skipped: 0
  };

  if (items.length === 0) return;

  const BATCH_SIZE = 400;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = items.slice(i, i + BATCH_SIZE);

    for (const doc of chunk) {
      try {
        const docId = doc._id.toString();
        const cleanedData = cleanMongoDocument(doc);
        
        if (!isDryRun) {
          const docRef = firestore.collection(firestoreCollectionName).doc(docId);
          batch.set(docRef, cleanedData);
        }
        
        metrics[collectionName].migrated++;
      } catch (err) {
        console.error(`Error processing doc ${doc._id} in ${collectionName}:`, err);
        metrics[collectionName].failed++;
      }
    }

    if (!isDryRun) {
      await batch.commit();
    }
  }
}

async function runMigration() {
  console.log(`Starting ${isDryRun ? 'DRY RUN ' : ''}Migration...`);
  
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  
  const metrics = {};
  
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
    console.log(`Migrating ${mongoName} -> ${firestoreName}...`);
    await migrateCollection(db, mongoName, firestoreName, metrics);
  }

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const prefix = isDryRun ? 'firestoreMigrationDryRun' : 'firestoreMigrationReal';
  
  fs.writeFileSync(path.join(outDir, `${prefix}.json`), JSON.stringify(metrics, null, 2));

  let md = `# Firestore Migration ${isDryRun ? 'Dry Run' : 'Result'}\n\n`;
  for (const [coll, stats] of Object.entries(metrics)) {
    md += `## ${coll}\n`;
    md += `- Found in Mongo: ${stats.found}\n`;
    md += `- ${isDryRun ? 'Simulated ' : ''}Migrated: ${stats.migrated}\n`;
    md += `- Failed: ${stats.failed}\n\n`;
  }

  fs.writeFileSync(path.join(outDir, `${prefix}.md`), md);
  
  console.log(`Migration ${isDryRun ? 'Dry Run ' : ''}complete.`);
  mongoose.disconnect();
}

runMigration().catch(console.error);
