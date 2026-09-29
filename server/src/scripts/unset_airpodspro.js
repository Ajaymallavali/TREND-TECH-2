import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  await Product.updateOne({ _id: '6aa06057af8879d815dcad1f' }, { $unset: { imageStatus: '' } });
  const verifiedApple = await Product.countDocuments({ brand: 'Apple', imageStatus: 'VERIFIED_EXACT' });
  console.log('Count:', verifiedApple);
  process.exit(0);
}
run();
