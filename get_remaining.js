const mongoose = require('mongoose');
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const P = mongoose.connection.db.collection('products');
  const count = await P.countDocuments({ 
    identityStatus: { $ne: 'IDENTITY_VERIFIED' }, 
    brand: { $nin: ['Apple', 'Samsung', 'Acer'] } 
  });
  console.log('Remaining:', count);
  process.exit(0);
}
run();
