import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const p = await Product.find({ _id: { $in: [
    new mongoose.Types.ObjectId('6aa06056af8879d815dca656'),
    new mongoose.Types.ObjectId('6aa06057af8879d815dcab4e')
  ]}}).lean();
  console.log(p.map(x => ({ id: x._id, status: x.imageStatus })));
  process.exit(0);
}
run();
