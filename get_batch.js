const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const P = mongoose.connection.db.collection('products');
  const MP = mongoose.connection.db.collection('marketplaceproducts');
  const items = await P.find({ 
    identityStatus: { $ne: 'IDENTITY_VERIFIED' }, 
    brand: { $nin: ['Apple', 'Samsung', 'Acer'] } 
  }).sort({ domain: 1, category: 1, brand: 1, productType: 1, name: 1, _id: 1 }).limit(25).toArray();
  
  for (const i of items) {
    const mps = await MP.find({ product: i._id }).toArray();
    console.log(i.name, '|', i.image, '| URLs:', mps.map(m=>m.url).join(', '));
  }
  process.exit(0);
}
run();
