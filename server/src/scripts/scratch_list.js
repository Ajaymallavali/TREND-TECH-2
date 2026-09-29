import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const p = await Product.find({ brand: { $in: ['Samsung', 'Apple'] }, category: 'smartphone' }).lean();
  console.log(p.map(x => x._id + ' : ' + (x.name || x.title)).join('\n'));
  process.exit(0);
}
run();
