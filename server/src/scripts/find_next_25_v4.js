import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  // Find products that haven't been processed by recovery (batch 3 or earlier)
  // and aren't already fully verified from phase 4 (which had imageHash, etc.)
  const pending = await Product.find({ 
    recoveryBatch: { $exists: false },
    imageHash: { $exists: false }
  })
    .sort({ brand: 1, category: 1, name: 1, _id: 1 })
    .limit(25)
    .lean();
    
  console.log(JSON.stringify(pending.map(p => ({ id: p._id, brand: p.brand, name: p.name })), null, 2));
  process.exit(0);
}
run();
