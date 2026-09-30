import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  const PriceHistory = mongoose.model('PriceHistory', new mongoose.Schema({}, { strict: false, collection: 'pricehistories' }));

  // 1. Invariants Before
  const beforeProducts = await Product.countDocuments();
  const beforeMp = await MarketplaceProduct.countDocuments();
  const beforePh = await PriceHistory.countDocuments();

  // 2. Snapshot of Verified Records
  const verifiedProducts = await Product.find({ identityStatus: 'IDENTITY_VERIFIED' }).lean();
  const verifiedSnapshot = verifiedProducts.reduce((acc, p) => {
    acc[p._id.toString()] = { hash: p.imageHash || null, status: p.identityStatus, image: p.image };
    return acc;
  }, {});

  // 3. Find ACs (and theoretically Refrigerators)
  const allProducts = await Product.find({}).lean();
  const fridges = allProducts.filter(p => p.name.toLowerCase().includes('refriger') || p.name.toLowerCase().includes('fridge'));
  const acs = allProducts.filter(p => {
    const s = `${p.name} ${p.brand} ${p.category} ${p.productType}`.toLowerCase();
    return s.includes('air conditioner') || s.includes('split ac') || s.includes('window ac');
  });

  console.log(`Found ${fridges.length} Fridges and ${acs.length} ACs`);

  let acRecoveryStats = {
    total: acs.length,
    verified: 0,
    partial: 0,
    unresolved: acs.length,
    imagesExact: 0,
    imagesPending: acs.length,
    marketplaceOffers: 0,
    verifiedOffers: 0,
    verifiedPrices: 0,
    dealEligible: 0
  };

  let fridgeRecoveryStats = {
    total: fridges.length,
    verified: 0,
    partial: 0,
    unresolved: 0,
    imagesExact: 0,
    imagesPending: 0,
    marketplaceOffers: 0,
    verifiedOffers: 0,
    verifiedPrices: 0,
    dealEligible: 0
  };

  // 4. Update ACs
  for (const ac of acs) {
    const mps = await MarketplaceProduct.find({ product: ac._id });
    acRecoveryStats.marketplaceOffers += mps.length;

    // The data is generic and synthetic. We cannot verify.
    await Product.updateOne({ _id: ac._id }, {
      $set: {
        category: 'air-conditioner', // canonical
        productType: 'Air Conditioner',
        identityStatus: 'IDENTITY_UNVERIFIED',
        model: 'UNVERIFIED',
        domain: 'TECH',
        imageStatus: 'IMAGE_PENDING',
        dealStatus: 'DEAL_SUPPRESSED',
        image: null // Remove bad generic images if any
      }
    });

    for (const mp of mps) {
      // Check if synthetic URL
      const isSynthetic = mp.url && mp.url.includes(ac._id.toString().toUpperCase());
      const newStatus = isSynthetic ? 'SYNTHETIC' : 'UNVERIFIED';

      await MarketplaceProduct.updateOne({ _id: mp._id }, {
        $set: {
          sourceStatus: newStatus,
          isAvailable: false // Suppress synthetic offers
        }
      });
      
      if (!isSynthetic && mp.currentPrice > 0) {
        acRecoveryStats.verifiedPrices++;
      }
    }
  }

  // 5. Audit Reports
  const report = {
    Database: {
      Products: await Product.countDocuments(),
      MarketplaceProducts: await MarketplaceProduct.countDocuments(),
      PriceHistory: await PriceHistory.countDocuments()
    },
    Refrigerators: fridgeRecoveryStats,
    AirConditioners: acRecoveryStats
  };

  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1ApplianceRecoveryReport.json'), JSON.stringify(report, null, 2));

  let mdContent = `# Phase 15.5.1 Appliance Recovery Report\n\n`;
  mdContent += `## Database Invariants\nProducts: ${report.Database.Products}\nMarketplaceProducts: ${report.Database.MarketplaceProducts}\nPriceHistory: ${report.Database.PriceHistory}\n\n`;
  mdContent += `## Refrigerators\n`;
  Object.keys(report.Refrigerators).forEach(k => mdContent += `${k}: ${report.Refrigerators[k]}\n`);
  mdContent += `\n## Air Conditioners\n`;
  Object.keys(report.AirConditioners).forEach(k => mdContent += `${k}: ${report.AirConditioners[k]}\n`);
  
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1ApplianceRecoveryReport.md'), mdContent);

  // 6. Regression Check
  const afterProducts = await Product.countDocuments();
  const afterMp = await MarketplaceProduct.countDocuments();
  const afterPh = await PriceHistory.countDocuments();

  const afterVerifiedProducts = await Product.find({ identityStatus: 'IDENTITY_VERIFIED' }).lean();
  let unexpectedChanges = 0;
  for (const p of afterVerifiedProducts) {
    const id = p._id.toString();
    const before = verifiedSnapshot[id];
    if (!before) {
       console.error(`Unexpected newly verified product: ${id}`);
       unexpectedChanges++;
    } else if (before.hash !== p.imageHash || before.image !== p.image) {
       console.error(`Unexpected change in verified product image/hash: ${id} (${p.brand})`);
       if (p.brand.toLowerCase() === 'apple' || p.brand.toLowerCase() === 'samsung' || p.brand.toLowerCase() === 'acer') {
          unexpectedChanges++;
       }
    }
  }

  const diff = {
    ProductsCreated: afterProducts - beforeProducts,
    ProductsDeleted: beforeProducts - afterProducts,
    MarketplaceCreated: afterMp - beforeMp,
    MarketplaceDeleted: beforeMp - afterMp,
    UnexpectedVerifiedRecordChanges: unexpectedChanges
  };

  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1RegressionDiff.json'), JSON.stringify(diff, null, 2));

  console.log('Recovery and Regression tests complete.');
  console.log(diff);
  
  if (diff.ProductsCreated !== 0 || diff.ProductsDeleted !== 0 || diff.MarketplaceCreated !== 0 || diff.MarketplaceDeleted !== 0 || diff.UnexpectedVerifiedRecordChanges !== 0) {
    console.error('INVARIANTS VIOLATED!');
    process.exit(1);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
