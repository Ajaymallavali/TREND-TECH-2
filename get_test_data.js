const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.connection.db.collection('products');
  const MP = mongoose.connection.db.collection('marketplaceproducts');
  
  const allProducts = await Product.find({ identityStatus: 'IDENTITY_VERIFIED' }).toArray();
  for (const p of allProducts) {
    const mps = await MP.find({ product: p._id, sourceStatus: 'LIVE_VERIFIED' }).toArray();
    if (mps.length >= 2) {
      console.log('---', p.name, '---');
      for (const mp of mps) {
        console.log(mp.url);
      }
      break;
    }
  }
  process.exit(0);
}
run();
