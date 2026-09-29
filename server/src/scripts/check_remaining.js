import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const pending = await Product.find({ recoveryBatch: { $exists: false } }).lean();
  
  const brandCounts = {};
  pending.forEach(p => {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });
  
  console.log('Remaining brands:', Object.entries(brandCounts).sort((a, b) => b[1] - a[1]));
  process.exit(0);
}
run();
