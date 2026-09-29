import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const res = await Product.updateMany(
    { _id: { $in: ['6aa06056af8879d815dca656', '6aa06057af8879d815dcab5d', '6aa06057af8879d815dcade2'] } },
    { $set: { imageStatus: 'UNVERIFIED', verificationStatus: 'UNVERIFIED' } }
  );
  console.log(res);
  process.exit(0);
}
run();
