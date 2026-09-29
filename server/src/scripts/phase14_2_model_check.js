import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const docs = await Product.find({ brand: /samsung/i, imageStatus: { $ne: 'VERIFIED_EXACT' } }).lean();
  docs.forEach(d => console.log(d._id, d.name, d.model || d.modelNumber || d.sku || d.model_code));
  process.exit(0);
}
run();
