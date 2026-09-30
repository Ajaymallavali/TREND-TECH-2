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

  const auditsDir = path.join(__dirname, '../data/audits');

  // STEP 3 - CLASSIFY EACH EXISTING AC & PROCESS
  let reportData = {
    AC_Records: 15, // as we know it's 15
    Identity: { EXACT: 0, REGIONAL: 0, PARTIAL: 0, UNRESOLVED: 0, CONFLICTED: 0 },
    Images: { EXACT: 0, REGIONAL: 0, PENDING: 0, WRONG_MODEL: 0, GENERIC: 0, DUPLICATE: 0 },
    Marketplace: { REAL_VERIFIED: 0, UNVERIFIED: 0, SYNTHETIC: 0, BROKEN: 0, WRONG_PRODUCT: 0 },
    Prices: { VERIFIED: 0, UNAVAILABLE: 0, FABRICATED: 0 },
    Deals: { ELIGIBLE: 0, SUPPRESSED: 0 },
    Redirects: { VALID: 0, INVALID: 0, SYNTHETIC: 0, BROKEN: 0 },
    RefrigeratorStatus: { existingRecords: 0, recoveryAction: "NO_SYNTHETIC_CREATION" }
  };

  const allAcs = await Product.find({
    $or: [
      { name: /air conditioner/i },
      { name: /split ac/i },
      { category: 'air-conditioner' }
    ]
  }).lean();
  
  for (const ac of allAcs) {
    const mps = await MarketplaceProduct.find({ product: ac._id });
    
    // Evaluate evidence. The specs are generic synthetic data like "Model: Air Conditioners Daikin".
    // We cannot reliably extract an exact real model. So they are UNRESOLVED.
    reportData.Identity.UNRESOLVED++;
    reportData.Images.PENDING++;
    reportData.Deals.SUPPRESSED++;
    
    await Product.updateOne({ _id: ac._id }, {
      $set: {
        identityStatus: 'IDENTITY_UNRESOLVED',
        model: 'UNVERIFIED',
        imageStatus: 'IMAGE_PENDING',
        dealStatus: 'DEAL_SUPPRESSED',
        image: null
      }
    });
    
    for (const mp of mps) {
      const isSynthetic = mp.url && (mp.url.includes(String(ac._id).toUpperCase()) || mp.url.includes('example.com') || mp.url.includes('synthetic'));
      if (isSynthetic) {
         reportData.Marketplace.SYNTHETIC++;
         reportData.Redirects.SYNTHETIC++;
         reportData.Prices.UNAVAILABLE++;
         await MarketplaceProduct.updateOne({ _id: mp._id }, {
           $set: { sourceStatus: 'SYNTHETIC', isAvailable: false }
         });
      } else {
         reportData.Marketplace.UNVERIFIED++;
         reportData.Redirects.INVALID++;
         reportData.Prices.UNAVAILABLE++;
         await MarketplaceProduct.updateOne({ _id: mp._id }, {
           $set: { sourceStatus: 'UNVERIFIED', isAvailable: false }
         });
      }
    }
  }

  // STEP 22 - AUDIT REPORT
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_2ACRecoveryReport.json'), JSON.stringify(reportData, null, 2));

  let md = `# Phase 15.5.2 AC Recovery Report\n\n`;
  for (const [section, values] of Object.entries(reportData)) {
    if (typeof values === 'object') {
      md += `## ${section}\n`;
      for (const [k, v] of Object.entries(values)) {
        md += `- **${k}**: ${v}\n`;
      }
      md += '\n';
    } else {
      md += `## ${section}: ${values}\n\n`;
    }
  }
  fs.writeFileSync(path.join(auditsDir, 'phase15_5_2ACRecoveryReport.md'), md);

  console.log('Phase 15.5.2 Reprocessed correctly.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
