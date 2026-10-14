import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkUnknown() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Product } = await import('./src/models/Product.model.js');
  
  const unknownProducts = await Product.find({ brand: 'UNKNOWN' }).lean();
  console.log(`UNKNOWN Brand Products count: ${unknownProducts.length}`);
  console.log('Sample 20 UNKNOWN products:');
  unknownProducts.slice(0, 20).forEach(p => console.log(`  "${p.name}" (cat: ${p.category})`));

  const allBrands = await Product.distinct('brand');
  console.log('Distinct brands:', allBrands);

  await mongoose.disconnect();
}

checkUnknown().catch(console.error);
