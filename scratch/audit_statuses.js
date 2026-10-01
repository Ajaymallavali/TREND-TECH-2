import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trend-tech';

async function audit() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({}).toArray();
  const mps = await db.collection('marketplaceproducts').find({}).toArray();

  const idStatuses = new Set();
  const imgStatuses = new Set();
  const srcStatuses = new Set();
  const dealStatuses = new Set();
  const mpSrcStatuses = new Set();

  products.forEach(p => {
    idStatuses.add(p.identityStatus);
    imgStatuses.add(p.imageStatus);
    srcStatuses.add(p.sourceStatus);
    dealStatuses.add(p.dealStatus);
  });

  mps.forEach(mp => {
    mpSrcStatuses.add(mp.sourceStatus);
  });

  console.log('Product identityStatus:', Array.from(idStatuses));
  console.log('Product imageStatus:', Array.from(imgStatuses));
  console.log('Product sourceStatus:', Array.from(srcStatuses));
  console.log('Product dealStatus:', Array.from(dealStatuses));
  console.log('MP sourceStatus:', Array.from(mpSrcStatuses));

  mongoose.disconnect();
}
audit().catch(console.error);
