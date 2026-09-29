import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const unverifiedProducts = await Product.find({ brand: /samsung/i, imageStatus: { $ne: 'VERIFIED_EXACT' } }).lean();

  const data = unverifiedProducts.map(p => ({
    productId: p._id.toString(),
    title: p.name,
    model: p.model,
    category: p.category,
    sku: p.sku || 'N/A',
    imageStatus: p.imageStatus || 'UNVERIFIED',
    sourceStatus: p.sourceStatus || 'UNKNOWN',
    sourceProvider: p.sourceProvider || 'UNKNOWN',
    externalProductId: p.externalProductId || 'UNKNOWN',
    imageSourceProvider: p.imageSourceProvider || 'UNKNOWN',
    imageSourceProductId: p.imageSourceProductId || 'UNKNOWN'
  }));
  
  console.log(JSON.stringify(data, null, 2));

  process.exit(0);
}
run();
