import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const apple = await Product.findOne({ brand: 'Apple', imageHash: { $exists: true }, recoveryBatch: { $ne: 3 } });
  console.log(apple.name, apple.imageStatus, apple.imageHash, apple.identityStatus);
  process.exit(0);
}
run();
