const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const MP = mongoose.connection.db.collection('marketplaceproducts');
  const count = await MP.countDocuments({ sourceStatus: 'LIVE_VERIFIED' });
  console.log(`Count LIVE_VERIFIED: ${count}`);
  const mps = await MP.find({ sourceStatus: 'LIVE_VERIFIED' }).limit(5).toArray();
  for (let mp of mps) {
    const P = mongoose.connection.db.collection('products');
    const p = await P.findOne({ _id: mp.product });
    console.log(mp.url, p.name);
  }
  process.exit(0);
}
run();
