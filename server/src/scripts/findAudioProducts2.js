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
        { name: { $regex: 'Audio', $options: 'i' } },
        { category: { $regex: 'Audio', $options: 'i' } },
        { tags: { $regex: 'Audio', $options: 'i' } }
      ],
      $and: [
        { 
          $or: [
            { name: { $regex: kw, $options: 'i' } },
            { brand: { $regex: kw, $options: 'i' } },
            { description: { $regex: kw, $options: 'i' } }
          ]
        },
        { brand: 'UNKNOWN' } // The user said the brand is UNKNOWN
      ]
    }).limit(2).toArray();
    
    // Fallback if brand isn't exactly 'UNKNOWN' but contains it, or name contains it
    if (products.length === 0) {
      const fallback = await Product.find({
        $and: [
          { 
            $or: [
              { name: { $regex: kw, $options: 'i' } },
              { description: { $regex: kw, $options: 'i' } }
            ]
          },
          { name: { $regex: 'UNKNOWN', $options: 'i' } }
        ]
      }).limit(2).toArray();
      results[kw] = fallback;
    } else {
      results[kw] = products;
    }
  }

  // Also just dump a few audio products that have UNKNOWN in name
  const unknowns = await Product.find({ name: { $regex: 'UNKNOWN Audio', $options: 'i' } }).toArray();
  results['UNKNOWN_AUDIO'] = unknowns;

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}
run();
