import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  const products = await mongoose.connection.collection('products').find({ image: { $ne: null } }).limit(5).toArray();
  console.log(products.map(p => p.image));
  process.exit(0);
}
run();
