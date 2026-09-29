import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  await Product.updateMany({ _id: { $in: ['6aa06056af8879d815dca934', '6aa06056af8879d815dca943', '6aa06056af8879d815dca970', '6aa06057af8879d815dcad10', '6aa06057af8879d815dcad1f', '6aa06057af8879d815dcad2e'] } }, {
    $unset: { imageStatus: '' }
  });
  
  const verifiedApple = await Product.countDocuments({ brand: 'Apple', imageStatus: 'VERIFIED_EXACT' });
  console.log('Count after unset:', verifiedApple);
  process.exit(0);
}
run();
