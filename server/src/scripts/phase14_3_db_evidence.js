import mongoose from 'mongoose';

const targetIds = [
  '6aa06056af8879d815dca656',
  '6aa06057af8879d815dcab3f',
  '6aa06057af8879d815dcab4e',
  '6aa06057af8879d815dcab6c',
  '6aa06057af8879d815dcac7a',
  '6aa06057af8879d815dcade2',
  '6aa06057af8879d815dcafe0',
  '6aa06057af8879d815dcaffe',
  '6aa06058af8879d815dcb1fc'
];

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));

  for (const id of targetIds) {
    const p = await Product.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
    const mps = await MarketplaceProduct.find({ product: new mongoose.Types.ObjectId(id) }).lean();
    
    console.log(`--- ${p.name} ---`);
    console.log(`Product SKU: ${p.sku}, ExtID: ${p.externalProductId}`);
    
    for (const m of mps) {
       console.log(`  MPS URL: ${m.url}`);
       console.log(`  MPS SKU: ${m.sku}, ExtID: ${m.externalProductId}`);
    }
  }
  process.exit(0);
}
run();
