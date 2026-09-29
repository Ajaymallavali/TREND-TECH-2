import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const p = await Product.find({}).sort({ brand: 1, category: 1, name: 1, _id: 1 }).limit(25).lean();
  console.log(JSON.stringify(p.map(x => ({ id: x._id, brand: x.brand, cat: x.category, name: x.name || x.title })), null, 2));
  process.exit(0);
}
run();
