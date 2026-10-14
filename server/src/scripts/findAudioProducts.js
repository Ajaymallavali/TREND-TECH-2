import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  const Product = mongoose.connection.collection('products');
  
  const keywords = ['Bose', 'Apple', 'Boult', 'Anker', 'Amplifier'];
  const results = {};

  for (const kw of keywords) {
    const products = await Product.find({
      $or: [
        { name: { $regex: kw, $options: 'i' } },
        { brand: { $regex: kw, $options: 'i' } }
      ],
      // We might want to filter by missing images, but let's just grab the most relevant ones first
      $or: [
        { image: null },
        { image: "" },
        { image: { $exists: false } },
        // Or just get them regardless of image status to fulfill the user request
      ]
    }).limit(3).toArray();
    
    results[kw] = products;
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}
run();
