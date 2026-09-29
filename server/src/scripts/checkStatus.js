import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const docs = await Product.find({
    brand: /samsung/i
  }, 'name verificationStatus imageStatus sourceStatus');
  console.log(docs);
  process.exit(0);
}
run();
