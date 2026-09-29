import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const allSamsung = await Product.find({ brand: 'Samsung' }, 'name verificationStatus sourceStatus imageSource imageUrl');
  console.log('Total Samsung:', allSamsung.length);
  const verified = allSamsung.filter(p => p.verificationStatus === 'VERIFIED_EXACT' || p.sourceStatus === 'LIVE_VERIFIED');
  console.log('Verified Samsung:', verified.length);
  console.log('Sample:', verified.slice(0, 3));
  process.exit(0);
}
run();
