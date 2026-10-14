import mongoose from 'mongoose';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const updates = [
  {
    id: '6a98d181a6bfd56d867752df',
    name: 'Apple iPhone 16 Pro Max Silicone Case with MagSafe',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1791985005/trend-tech/products/6a98d181a6bfd56d867752df_apple_iphone_16_pro_max_silicone_case.jpg'
  },
  {
    id: '6a9904e369652590e0aadbea',
    name: 'Apple iPhone 17 Pro Max',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1790711542/trend-tech/products/6aa06056af8879d815dca4f4_primary.jpg'
  },
  {
    id: '6a9904e369652590e0aadbec',
    name: 'Apple iPhone 17 Pro',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1790711547/trend-tech/products/6aa06056af8879d815dca509_primary.jpg'
  },
  {
    id: '6a9904e369652590e0aadbee',
    name: 'Apple iPhone 17',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1790711552/trend-tech/products/6aa06056af8879d815dca51e_primary.jpg'
  },
  {
    id: '6a9904e369652590e0aadc72',
    name: 'Apple MacBook Air M3 (13-inch)',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1790711623/trend-tech/products/6aa06056af8879d815dca934_primary.jpg'
  },
  {
    id: '6aa06057af8879d815dcad1f',
    name: 'Apple AirPods Pro 2',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1791739322/trend-tech/products/6a9904e369652590e0aaddc0_primary.png'
  },
  {
    id: '6a9904e369652590e0aadd36',
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm',
    image: 'https://res.cloudinary.com/ffjt1wkl/image/upload/v1790711727/trend-tech/products/6aa06057af8879d815dcae2d_primary.jpg'
  }
];

async function applyUpdates() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const mongoDb = mongoose.connection.db;

  console.log('Connecting to Firebase Firestore...');
  const app = initializeApp({
    credential: applicationDefault(),
    projectId: 'trend-tech-2-c174c'
  }, 'dealFixApp');
  const firestore = getFirestore(app);

  for (const item of updates) {
    console.log(`Updating ${item.name} (${item.id})...`);
    
    // Update MongoDB
    await mongoDb.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(item.id) },
      {
        $set: {
          image: item.image,
          imageStatus: 'VERIFIED',
          imageUpdatedAt: new Date()
        }
      }
    );

    // Update Firestore
    await firestore.collection('products').doc(item.id).set({
      image: item.image,
      imageStatus: 'VERIFIED',
      imageUpdatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(` -> Successfully updated in Mongo and Firestore: ${item.image}`);
  }

  console.log('\nAll deal products successfully updated!');
  process.exit(0);
}

applyUpdates().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
