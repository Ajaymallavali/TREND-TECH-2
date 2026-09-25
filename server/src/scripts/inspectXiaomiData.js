import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function inspect() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const db = mongoose.connection.db;

  const targetNames = [
    'Xiaomi 15 Pro',
    'Xiaomi 14 Ultra',
    'Xiaomi 14',
    'Xiaomi Redmi Note 13 Pro+ 5G',
    'Xiaomi Redmi Note 13 5G',
    'Xiaomi Pad 6 Max 14'
  ];

  const productsCollection = db.collection('products');
  const marketplaceProductsCollection = db.collection('marketplaceproducts');
  const marketplacesCollection = db.collection('marketplaces');

  console.log('\n========================================');
  console.log('1. TARGET PRODUCT INSPECTION');
  console.log('========================================\n');

  for (const name of targetNames) {
    const product = await productsCollection.findOne({ name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } });
    if (!product) {
      console.log(`[PRODUCT NOT FOUND IN DB]: "${name}"`);
      continue;
    }

    console.log(`----------------------------------------`);
    console.log(`PRODUCT: ${product.name}`);
    console.log(`  _id: ${product._id}`);
    console.log(`  name: ${product.name}`);
    console.log(`  brand: ${product.brand}`);
    console.log(`  category: ${product.category}`);
    console.log(`  categoryId: ${product.categoryId}`);
    console.log(`  image: ${product.image}`);
    console.log(`  slug: ${product.slug}`);
    console.log(`  description: ${product.description ? product.description.substring(0, 80) + '...' : null}`);
    
    if (!product.image) {
      console.log(`  IMAGE_STATUS: DATABASE_IMAGE_MISSING`);
    } else {
      console.log(`  IMAGE_STATUS: DATABASE_IMAGE_PRESENT (${product.image})`);
    }

    const offers = await marketplaceProductsCollection.find({ product: product._id }).toArray();
    console.log(`  OFFERS COUNT: ${offers.length}`);
    if (offers.length === 0) {
      console.log(`  OFFER_STATUS: OFFER_MISSING`);
    } else {
      for (const offer of offers) {
        console.log(`  - Offer _id: ${offer._id}`);
        console.log(`    marketplace (ref ID): ${offer.marketplace}`);
        console.log(`    url: ${offer.url}`);
        console.log(`    currentPrice: ${offer.currentPrice}`);
        console.log(`    originalPrice: ${offer.originalPrice}`);
        console.log(`    currency: ${offer.currency}`);
        console.log(`    isAvailable: ${offer.isAvailable}`);
        console.log(`    lastUpdated: ${offer.lastUpdated}`);

        if (offer.marketplace) {
          const mp = await marketplacesCollection.findOne({ _id: offer.marketplace });
          if (mp) {
            console.log(`    Marketplace Document -> name: "${mp.name}", code: "${mp.code}", baseUrl: "${mp.baseUrl}", isActive: ${mp.isActive}`);
          } else {
            console.log(`    Marketplace Document -> NOT FOUND for ID ${offer.marketplace}`);
          }
        }
      }
    }
  }

  console.log('\n========================================');
  console.log('2. ALL XIAOMI BRAND PRODUCTS IN DB');
  console.log('========================================\n');
  const xiaomiProducts = await productsCollection.find({ 
    $or: [
      { brand: { $regex: /^xiaomi$/i } },
      { name: { $regex: /xiaomi/i } }
    ] 
  }).toArray();

  console.log(`Total Xiaomi products in DB: ${xiaomiProducts.length}\n`);
  for (const p of xiaomiProducts) {
    const offers = await marketplaceProductsCollection.find({ product: p._id }).toArray();
    console.log(`- [${p._id}] "${p.name}"`);
    console.log(`  brand: "${p.brand}" | category: "${p.category}" | image: ${p.image ? `PRESENT (${p.image})` : 'MISSING'}`);
    console.log(`  offers count: ${offers.length}`);
    for (const o of offers) {
      console.log(`    price: ${o.currentPrice} | available: ${o.isAvailable} | url: ${o.url}`);
    }
  }

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
