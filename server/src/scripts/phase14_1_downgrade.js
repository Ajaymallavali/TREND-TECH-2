import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const targetId = '6aa06057af8879d815dcafe0';
  await Product.updateOne(
    { _id: new mongoose.Types.ObjectId(targetId) },
    { $set: { verificationStatus: 'UNVERIFIED', imageStatus: 'UNVERIFIED' } }
  );

  const imgPath = path.join(process.cwd(), `src/data/product-images/samsung/${targetId}/primary.jpg`);
  const metaPath = path.join(process.cwd(), `src/data/product-images/samsung/${targetId}/metadata.json`);
  
  if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
  
  console.log(`Downgraded product ${targetId}`);
  process.exit(0);
}
run();
