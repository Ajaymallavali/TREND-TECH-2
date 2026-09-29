import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const ids = [
    '6aa06057af8879d815dcab5d',
    '6aa06057af8879d815dcade2',
    '6aa06057af8879d815dcafe0',
    '6aa06057af8879d815dcafef'
  ];
  for (const id of ids) {
    await Product.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { verificationStatus: 'UNVERIFIED', imageStatus: 'UNVERIFIED' } }
    );
    const pPath = path.join(process.cwd(), 'src/data/product-images/samsung', id);
    if (fs.existsSync(pPath)) fs.rmSync(pPath, { recursive: true, force: true });
  }
  console.log('Reverted 4 products');
  process.exit(0);
}
run();
