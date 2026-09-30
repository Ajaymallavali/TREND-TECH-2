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

  const products = await Product.find({}).lean();
  const mps = await MarketplaceProduct.find({}).lean();
  
  // Base Invariants
  const invariants = {
    products: products.length,
    marketplaceProducts: mps.length,
    priceHistory: await PriceHistory.countDocuments()
  };

  const isFridge = (p) => {
    const s = `${p.name} ${p.brand} ${p.category} ${p.productType} ${p.subcategory} ${p.description}`.toLowerCase();
    return s.includes('refrigerator') || s.includes('fridge');
  };

  const isAC = (p) => {
    const s = `${p.name} ${p.brand} ${p.category} ${p.productType} ${p.subcategory} ${p.description}`.toLowerCase();
    return s.includes('air conditioner') || s.includes('split ac') || s.includes('window ac') || s.includes('inverter ac') || s.includes('air conditioning') || (s.includes(' ac ') && !s.includes('acer') && !s.includes('mac'));
  };

  const inventory = [];
  const mismatches = [];
  
  const stats = {
    refrigerators: { total: 0, verified: 0, partial: 0, unresolved: 0, imagesExact: 0, imagesPending: 0, marketplaceOffers: 0, verifiedOffers: 0, verifiedPrices: 0 },
    acs: { total: 0, verified: 0, partial: 0, unresolved: 0, imagesExact: 0, imagesPending: 0, marketplaceOffers: 0, verifiedOffers: 0, verifiedPrices: 0 },
    otherAppliances: { total: 0 }
  };

  for (const p of products) {
    const fridge = isFridge(p);
    const ac = isAC(p);
    
    if (fridge || ac) {
      const type = fridge ? 'REFRIGERATOR' : 'AC';
      const typeStats = fridge ? stats.refrigerators : stats.acs;
      
      const productMps = mps.filter(mp => String(mp.product) === String(p._id));
      
      const record = {
        productId: String(p._id),
        name: p.name,
        brand: p.brand,
        category: p.category,
        productType: p.productType,
        model: p.model || null,
        domain: p.domain,
        identityStatus: p.identityStatus || 'IDENTITY_UNRESOLVED',
        imageStatus: p.imageStatus || 'IMAGE_PENDING',
        imagePath: p.image,
        marketplaceCount: productMps.length,
        existingMarketplaceURLs: productMps.map(mp => mp.url),
        priceStatus: productMps.some(mp => mp.currentPrice > 0) ? 'AVAILABLE' : 'UNAVAILABLE',
        applianceType: type
      };
      
      inventory.push(record);
      
      // Update stats
      typeStats.total++;
      if (p.identityStatus === 'IDENTITY_VERIFIED') typeStats.verified++;
      else if (p.identityStatus === 'IDENTITY_PARTIAL') typeStats.partial++;
      else typeStats.unresolved++;
      
      if (p.imageStatus === 'VERIFIED_EXACT') typeStats.imagesExact++;
      else typeStats.imagesPending++;
      
      typeStats.marketplaceOffers += productMps.length;
      productMps.forEach(mp => {
        if (mp.sourceStatus === 'LIVE_VERIFIED') typeStats.verifiedOffers++;
        if (mp.currentPrice > 0) typeStats.verifiedPrices++;
      });
      
      // Mismatch logic
      const targetCategory = fridge ? 'refrigerator' : 'air-conditioner';
      if ((p.category || '').toLowerCase() !== targetCategory) {
        mismatches.push({
          productId: String(p._id),
          currentCategory: p.category,
          currentProductType: p.productType,
          currentName: p.name,
          currentBrand: p.brand,
          candidateCanonicalCategory: targetCategory,
          evidence: fridge ? 'Contains refrigerator/fridge keywords' : 'Contains AC keywords',
          confidence: 'HIGH'
        });
      }
    } else {
      // Very basic "other appliances" check based on some known categories or keywords (e.g. washing machine)
      const s = `${p.category} ${p.productType}`.toLowerCase();
      if (s.includes('appliance') || s.includes('washing') || s.includes('microwave') || s.includes('oven')) {
        stats.otherAppliances.total++;
      }
    }
  }

  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1ApplianceInventory.json'), JSON.stringify(inventory, null, 2));
  
  let mdContent = `# Phase 15.5.1 Appliance Inventory\n\n`;
  mdContent += `## Refrigerators\n`;
  mdContent += `Total: ${stats.refrigerators.total}\nVerified: ${stats.refrigerators.verified}\nUnresolved: ${stats.refrigerators.unresolved}\nExact Images: ${stats.refrigerators.imagesExact}\nPending Images: ${stats.refrigerators.imagesPending}\nMarketplace Offers: ${stats.refrigerators.marketplaceOffers}\n\n`;
  mdContent += `## Air Conditioners\n`;
  mdContent += `Total: ${stats.acs.total}\nVerified: ${stats.acs.verified}\nUnresolved: ${stats.acs.unresolved}\nExact Images: ${stats.acs.imagesExact}\nPending Images: ${stats.acs.imagesPending}\nMarketplace Offers: ${stats.acs.marketplaceOffers}\n\n`;
  
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1ApplianceInventory.md'), mdContent);
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1CategoryMismatchReport.json'), JSON.stringify(mismatches, null, 2));
  
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_1Invariants_Before.json'), JSON.stringify(invariants, null, 2));

  console.log('Inventory complete. Found:', inventory.length, 'appliances.');
  console.log('Mismatches:', mismatches.length);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
