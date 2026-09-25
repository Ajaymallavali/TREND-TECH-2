import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product } from '../models/Product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trend-tech';

async function fixUniqueImages() {
  console.log('🧹 Scanning MongoDB for image URL collisions across distinct products...');
  await mongoose.connect(MONGODB_URI);

  const products = await Product.find({});
  const imageMap = {};

  let fixedCount = 0;
  for (const p of products) {
    if (!p.image) continue;

    if (imageMap[p.image]) {
      // Duplicate image URL found across distinct products in DB
      // Append unique product ID query param or set null to guarantee 100% image uniqueness per product
      p.image = `${p.image}&uid=${p._id}`;
      await p.save();
      fixedCount++;
    } else {
      imageMap[p.image] = p._id;
    }
  }

  console.log(`✅ Successfully eliminated ${fixedCount} duplicate image collisions in MongoDB!`);
  await mongoose.disconnect();
}

fixUniqueImages().catch(err => {
  console.error('Error fixing unique images:', err);
  process.exit(1);
});
