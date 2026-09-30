import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const products = await mongoose.connection.db.collection('products').find({}).toArray();
  const appliances = products.filter(p => {
    const s = `${p.name} ${p.category} ${p.productType}`.toLowerCase();
    return s.includes('appliance') || s.includes('refrigerat') || s.includes('fridge') || s.includes('ac');
  }).map(p => `${p.name} | ${p.category} | ${p.productType}`);
  console.log('Appliance-like products:', appliances);
  process.exit(0);
}
run();
