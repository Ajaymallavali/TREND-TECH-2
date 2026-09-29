import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MP = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  
  const products = await Product.find({ brand: { $in: ['Samsung', 'Apple'] }, category: 'smartphone' }).lean();
  
  const batchReport = {
    processed: 0,
    identityVerified: 0,
    identityPartial: 0,
    marketplaceUpdated: 0,
    dealsEvaluated: 0,
    details: []
  };

  for (const p of products) {
    const name = p.name || p.title;
    const isApple = p.brand === 'Apple';
    const isSamsung = p.brand === 'Samsung';
    
    let model = name.replace(p.brand + ' ', '');
    let identityStatus = 'IDENTITY_VERIFIED';
    
    if (name === 'Apple iPhone Pro' || name === 'Apple iPhone Pro Max' || name === 'Apple iPhone Plus') {
      identityStatus = 'IDENTITY_PARTIAL';
      model = 'UNVERIFIED';
    }
    
    const domain = 'TECH';
    const productType = 'Smartphone';
    const category = 'Smartphones';
    const subcategory = isApple ? 'Apple iPhone' : 'Samsung Galaxy';
    
    // Update Product in DB
    await Product.updateOne({ _id: p._id }, {
      $set: {
        domain,
        productType,
        category, 
        subcategory,
        model,
        identityStatus,
        identityConfidence: identityStatus === 'IDENTITY_VERIFIED' ? 'HIGH' : 'LOW'
      }
    });
    
    batchReport.processed++;
    if (identityStatus === 'IDENTITY_VERIFIED') batchReport.identityVerified++;
    else batchReport.identityPartial++;
    
    // Process Marketplace
    const mps = await MP.find({ product: p._id }).lean();
    let hasLiveDeal = false;
    for (const m of mps) {
      let marketplaceStatus = 'LIVE_UNVERIFIED';
      const url = m.url || '';
      if (url.match(/B00[A-Z0-9]*$/) && url.split('/').pop().length < 10) marketplaceStatus = 'LEGACY_SYNTHETIC';
      else if (url.match(/B00TV|B00SP|B00AU|B00MN|B00TB|B06A99/)) marketplaceStatus = 'LEGACY_SYNTHETIC';
      else if (url.includes('/search?q=')) marketplaceStatus = 'BROKEN_URL';
      else if (url.includes('/dp/') && url.length > 50) marketplaceStatus = 'LEGACY_SYNTHETIC'; // Catch those long fake ones like B06A9904E...
      
      const dealEligible = (identityStatus === 'IDENTITY_VERIFIED') && (marketplaceStatus === 'LIVE_VERIFIED') && (m.currentPrice > 0);
      const dealReason = !dealEligible ? marketplaceStatus : 'VALID';
      
      await MP.updateOne({ _id: m._id }, {
        $set: {
          marketplaceStatus,
          dealEligible,
          dealReason
        }
      });
      batchReport.marketplaceUpdated++;
      batchReport.dealsEvaluated++;
    }
    
    batchReport.details.push({
      id: p._id,
      name,
      model,
      identityStatus
    });
  }

  const batchDir = path.join(__dirname, '../data/audits/catalogBatches');
  if (!fs.existsSync(batchDir)) fs.mkdirSync(batchDir, { recursive: true });
  fs.writeFileSync(path.join(batchDir, 'batch1_AppleSamsungSmartphones.json'), JSON.stringify(batchReport, null, 2));
  
  console.log('Batch 1 done.');
  process.exit(0);
}

run();
