import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/trend-tech';

async function run() {
  await mongoose.connect(MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));

  const products = await Product.find({
    identityStatus: { $ne: 'IDENTITY_VERIFIED' }
  })
  .sort({ brand: 1, category: 1, name: 1, _id: 1 })
  .limit(25)
  .lean();

  console.log(JSON.stringify(products.map(p => ({
    _id: p._id.toString(),
    brand: p.brand,
    name: p.name,
    category: p.category,
    image: p.image
  })), null, 2));
  
  process.exit(0);
}

run().catch(console.error);
