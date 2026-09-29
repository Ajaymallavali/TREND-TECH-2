import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MP = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  const p = await Product.find({ brand: { $in: ['Samsung', 'Apple'] }, category: 'smartphone' }).lean();
  const mps = await MP.find({ product: { $in: p.map(x => x._id) } }).lean();
  console.log('MPs found:', mps.length);
  console.log('URLs:', mps.map(x => x.url));
  process.exit(0);
}
run();
