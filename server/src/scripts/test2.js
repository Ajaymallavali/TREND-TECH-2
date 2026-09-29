import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const docs = await Product.find({ _id: { $in: ['6a9904e369652590e0aadc00', '6aa06056af8879d815dca619'] } }, 'name verificationStatus sourceStatus imageSource imageUrl');
  console.log(docs);
  process.exit(0);
}
run();
