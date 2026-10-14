import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const mongoDb = mongoose.connection.db;

  console.log('Removing dummy images from MongoDB...');
  const resMongo = await mongoDb.collection('products').updateMany(
    { imageStatus: 'SYNTHETIC_VERIFIED' },
    { $set: { image: null, imageStatus: 'UNVERIFIED' } }
  );
  console.log(`Reverted ${resMongo.modifiedCount} products in MongoDB to null.`);

  console.log('Connecting to Firebase Firestore...');
  initializeApp({ credential: applicationDefault(), projectId: 'trend-tech-2-c174c' });
  const firestoreDb = getFirestore();

  console.log('Removing dummy images from Firestore...');
  const firestoreSnap = await firestoreDb.collection('products').where('imageStatus', '==', 'SYNTHETIC_VERIFIED').get();
  
  let count = 0;
  const batchSize = 400;
  let batch = firestoreDb.batch();
  let batchOps = 0;

  for (const doc of firestoreSnap.docs) {
    batch.update(doc.ref, { image: null, imageStatus: 'UNVERIFIED' });
    batchOps++;
    count++;
    if (batchOps >= batchSize) {
      await batch.commit();
      batch = firestoreDb.batch();
      batchOps = 0;
    }
  }
  if (batchOps > 0) {
    await batch.commit();
  }
  console.log(`Reverted ${count} products in Firestore to null.`);

  await mongoose.disconnect();
  console.log('Finished removing all dummy images!');
}

run().catch(console.error);
