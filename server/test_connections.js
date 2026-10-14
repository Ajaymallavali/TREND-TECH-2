import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

dotenv.config();

console.log('Testing Cloudinary with .env credentials...');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  try {
    const res = await cloudinary.api.ping();
    console.log('Cloudinary ping success with .env secret:', res);
  } catch (err) {
    console.log('Cloudinary ping failed with .env secret:', err.message);
    console.log('Trying with alternate secret from user prompt history: YjWeeF7BB71h_CZuop9IiEm8pM8');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: 'YjWeeF7BB71h_CZuop9IiEm8pM8'
    });
    try {
      const res2 = await cloudinary.api.ping();
      console.log('Cloudinary ping success with alternate secret:', res2);
    } catch (err2) {
      console.log('Cloudinary ping failed with alternate secret too:', err2.message);
    }
  }

  // Test MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { Product } = await import('./src/models/Product.model.js');
    const count = await Product.countDocuments();
    console.log(`MongoDB connected! Total products: ${count}`);
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB error:', err.message);
  }

  // Test Firestore
  try {
    if (getApps().length === 0) {
      process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
      process.env.GCLOUD_PROJECT = 'demo-trend-tech';
      initializeApp({ projectId: 'demo-trend-tech' });
    }
    const db = getFirestore();
    const snap = await db.collection('products').get();
    console.log(`Firestore collection 'products' doc count: ${snap.size}`);
  } catch (err) {
    console.log('Firestore error:', err.message);
  }
}

run();
