import mongoose from 'mongoose';

async function auditAll() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const all = await Product.find({});
  console.log('Total products in database:', all.length);

  const catMap = {};
  for (const p of all) {
    catMap[p.category] = (catMap[p.category] || 0) + 1;
  }
  console.log('Stored categories breakdown:');
  console.table(catMap);

  // Check how many products have category 'smartphone' or 'Smartphones'
  const smartphonesInDb = all.filter(p => (p.category || '').toLowerCase() === 'smartphone' || (p.category || '').toLowerCase() === 'smartphones');
  console.log('Products marked as smartphone in DB:', smartphonesInDb.length);

  // Let's examine products marked as smartphone that are clearly NOT smartphones
  const nonSmartphonesInSmartphoneCat = [];
  for (const p of smartphonesInDb) {
    const name = (p.name || '').toLowerCase();
    // What kinds of names exist?
    nonSmartphonesInSmartphoneCat.push({
      id: p._id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      image: p.image ? p.image.substring(0, 40) : null
    });
  }

  console.log('\nFirst 40 products in smartphone category:');
  console.table(nonSmartphonesInSmartphoneCat.slice(0, 40));

  process.exit(0);
}

auditAll().catch(console.error);
