import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const p = await mongoose.connection.db.collection('products').find({ name: /Air Conditioners/ }).toArray();
  const pIds = p.map(x => String(x._id)); // handle string vs ObjectId
  const pIdsObj = p.map(x => x._id);
  const mp = await mongoose.connection.db.collection('marketplaceproducts').find({ 
    $or: [{ product: { $in: pIds } }, { product: { $in: pIdsObj } }] 
  }).toArray();
  
  for (const x of mp) {
     const prod = p.find(prod => String(prod._id) === String(x.product));
     console.log(prod.name, '->', x.url);
  }
  process.exit(0);
}
run();
