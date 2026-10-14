import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const FALLBACK_MAP = {
  smartphone_apple: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
  smartphone_samsung: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
  smartphone_xiaomi: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  television: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
  accessories: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80',
  fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
};

function assignImage(name = '', brand = '', category = '') {
  const text = `${brand} ${name} ${category}`.toLowerCase();
  if (text.includes('iphone') || (text.includes('apple') && !text.includes('macbook') && !text.includes('watch') && !text.includes('airpods'))) {
    return FALLBACK_MAP.smartphone_apple;
  }
  if (text.includes('samsung') || text.includes('galaxy')) {
    if (text.includes('tv') || text.includes('television')) return FALLBACK_MAP.television;
    if (text.includes('watch')) return FALLBACK_MAP.smartwatch;
    return FALLBACK_MAP.smartphone_samsung;
  }
  if (text.includes('xiaomi') || text.includes('redmi') || text.includes('oneplus') || text.includes('phone') || text.includes('smartphone')) {
    return FALLBACK_MAP.smartphone_xiaomi;
  }
  if (text.includes('laptop') || text.includes('macbook') || text.includes('dell') || text.includes('hp') || text.includes('lenovo')) {
    return FALLBACK_MAP.laptop;
  }
  if (text.includes('audio') || text.includes('airpods') || text.includes('headphone') || text.includes('speaker') || text.includes('earbuds') || text.includes('boat')) {
    return FALLBACK_MAP.audio;
  }
  if (text.includes('watch')) return FALLBACK_MAP.smartwatch;
  if (text.includes('tv') || text.includes('television')) return FALLBACK_MAP.television;
  if (text.includes('ipad') || text.includes('tablet')) return FALLBACK_MAP.tablet;
  if (text.includes('shoe') || text.includes('sneaker') || text.includes('footwear')) return FALLBACK_MAP.footwear;
  if (text.includes('clothing') || text.includes('dress') || text.includes('shirt') || text.includes('pant') || text.includes('fashion')) return FALLBACK_MAP.fashion;
  if (text.includes('case') || text.includes('cover') || text.includes('cable') || text.includes('charger')) return FALLBACK_MAP.accessories;
  return FALLBACK_MAP.default;
}

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const mongoDb = mongoose.connection.db;

  console.log('Connecting to Firebase Firestore...');
  initializeApp({ credential: applicationDefault(), projectId: 'trend-tech-2-c174c' });
  const firestoreDb = getFirestore();

  console.log('Updating MongoDB products with missing images...');
  const mongoProducts = await mongoDb.collection('products').find({
    $or: [{ image: null }, { image: '' }, { image: { $exists: false } }]
  }).toArray();

  let mongoCount = 0;
  for (const p of mongoProducts) {
    const assignedUrl = assignImage(p.name, p.brand, p.category);
    await mongoDb.collection('products').updateOne(
      { _id: p._id },
      { $set: { image: assignedUrl, imageStatus: 'SYNTHETIC_VERIFIED' } }
    );
    mongoCount++;
  }
  console.log(`Updated ${mongoCount} products in MongoDB.`);

  console.log('Updating Firestore products with missing images...');
  const firestoreSnap = await firestoreDb.collection('products').get();
  let firestoreCount = 0;
  const batchSize = 400;
  let batch = firestoreDb.batch();
  let batchOps = 0;

  for (const doc of firestoreSnap.docs) {
    const data = doc.data();
    if (!data.image || !data.image.startsWith('http') || data.image.includes('placeholder')) {
      const assignedUrl = assignImage(data.name, data.brand, data.category);
      batch.update(doc.ref, { image: assignedUrl, imageStatus: 'SYNTHETIC_VERIFIED' });
      batchOps++;
      firestoreCount++;

      if (batchOps >= batchSize) {
        await batch.commit();
        batch = firestoreDb.batch();
        batchOps = 0;
      }
    }
  }
  if (batchOps > 0) {
    await batch.commit();
  }
  console.log(`Updated ${firestoreCount} products in Firestore.`);

  await mongoose.disconnect();
  console.log('Finished permanent backfill successfully!');
}

run().catch(console.error);
