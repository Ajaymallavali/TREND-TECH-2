import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const pList = await Product.find({ identityStatus: { $exists: false } })
    .sort({ brand: 1, category: 1, name: 1, _id: 1 })
    .limit(25)
    .lean();
  console.log(JSON.stringify(pList.map(p => ({ id: p._id.toString(), brand: p.brand, name: p.name })), null, 2));
  process.exit(0);
}
run();
