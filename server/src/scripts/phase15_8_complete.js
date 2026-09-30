import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.connection.db.collection('products');
  const MP = mongoose.connection.db.collection('marketplaceproducts');

  const pCountBefore = await Product.countDocuments();
  const mpCountBefore = await MP.countDocuments();

  const items = await Product.find({ 
    identityStatus: { $ne: 'IDENTITY_VERIFIED' }, 
    identityStatus: { $ne: 'IDENTITY_PARTIAL' },
    brand: { $nin: ['Apple', 'Samsung', 'Acer'] } 
  }).toArray();

  const stats = {
    IDENTITY: { EXACT: 0, REGIONAL: 0, PARTIAL: 0, UNRESOLVED: 0, CONFLICTED: 0 },
    IMAGES: { EXACT: 0, REGIONAL: 0, PENDING: 0, WRONG: 0, GENERIC: 0, DUPLICATE: 0 },
    MARKETPLACE: { VERIFIED: 0, UNVERIFIED: 0, BROKEN: 0, WRONG_PRODUCT: 0, SYNTHETIC: 0 },
    PRICES: { VERIFIED: 0, UNAVAILABLE: 0, FABRICATED: 0 },
    DEALS: { ELIGIBLE: 0, SUPPRESSED: 0 }
  };

  const knownBrands = ['Sony', 'Nikon', 'Fujifilm', 'GoPro', 'Insta360', 'Kodak', 'Leica', 'Olympus', 'Panasonic', 'DJI', 'Canon', 'Dell', 'HP', 'Lenovo', 'LG', 'Daikin', 'Whirlpool', 'Bosch', 'Haier', 'Voltas', 'Blue Star', 'Godrej', 'Panasonic', 'Hitachi', 'Oppo', 'Vivo', 'Xiaomi', 'OnePlus', 'Realme', 'Motorola', 'Asus', 'ASUS'];

  for (const p of items) {
    let resolvedBrand = 'UNKNOWN';
    let resolvedModel = 'UNRESOLVED';
    let identityStatus = 'IDENTITY_UNRESOLVED';
    
    // Heuristic: Check if name starts with a known brand
    let foundBrand = knownBrands.find(b => p.name.toLowerCase().startsWith(b.toLowerCase()));
    
    if (foundBrand && p.name.length > foundBrand.length + 2 && !p.name.toLowerCase().includes('cameras') && !p.name.toLowerCase().includes('accessories')) {
       resolvedBrand = foundBrand;
       resolvedModel = p.name.substring(foundBrand.length).trim();
       identityStatus = 'IDENTITY_PARTIAL';
       stats.IDENTITY.PARTIAL++;
    } else {
       stats.IDENTITY.UNRESOLVED++;
    }

    await Product.updateOne({ _id: p._id }, {
      $set: {
        brand: resolvedBrand,
        model: resolvedModel,
        identityStatus: identityStatus,
        imageStatus: 'IMAGE_PENDING',
        updatedAt: new Date()
      }
    });
    stats.IMAGES.PENDING++;

    const mps = await MP.find({ product: p._id }).toArray();
    for (const mp of mps) {
      await MP.updateOne({ _id: mp._id }, {
        $set: {
          sourceStatus: 'SYNTHETIC',
          isAvailable: false,
          updatedAt: new Date()
        }
      });
      stats.MARKETPLACE.SYNTHETIC++;
      stats.PRICES.UNAVAILABLE++;
      stats.DEALS.SUPPRESSED++;
    }
  }

  const pCountAfter = await Product.countDocuments();
  const mpCountAfter = await MP.countDocuments();

  if (pCountBefore !== pCountAfter || mpCountBefore !== mpCountAfter) {
    console.error('FATAL INVARIANT MISMATCH');
    process.exit(1);
  }

  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  const batchId = 'FinalRecovery';
  fs.writeFileSync(path.join(auditsDir, `phase15_8_${batchId}_CatalogRecovery.json`), JSON.stringify({ stats, itemsProcessed: items.length }, null, 2));

  console.log(`Successfully processed ${items.length} products.`);
  process.exit(0);
}

run().catch(console.error);
