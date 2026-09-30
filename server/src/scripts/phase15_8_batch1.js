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
    brand: { $nin: ['Apple', 'Samsung', 'Acer'] } 
  }).sort({ domain: 1, category: 1, brand: 1, productType: 1, name: 1, _id: 1 }).limit(25).toArray();

  const auditLog = [];
  const stats = {
    IDENTITY: { EXACT: 0, REGIONAL: 0, PARTIAL: 0, UNRESOLVED: 0, CONFLICTED: 0 },
    IMAGES: { EXACT: 0, REGIONAL: 0, PENDING: 0, WRONG: 0, GENERIC: 0, DUPLICATE: 0 },
    MARKETPLACE: { VERIFIED: 0, UNVERIFIED: 0, BROKEN: 0, WRONG_PRODUCT: 0, SYNTHETIC: 0 },
    PRICES: { VERIFIED: 0, UNAVAILABLE: 0, FABRICATED: 0 },
    DEALS: { ELIGIBLE: 0, SUPPRESSED: 0 }
  };

  for (const p of items) {
    let resolvedBrand = 'UNKNOWN';
    let resolvedModel = 'UNRESOLVED';
    let identityStatus = 'IDENTITY_UNRESOLVED';
    let reason = 'Generic category placeholder without specific model evidence';

    // Heuristics for the 5 actual models
    if (p.name.includes('Canon EOS R5 Mark II')) { resolvedBrand = 'Canon'; resolvedModel = 'EOS R5 Mark II'; identityStatus = 'IDENTITY_PARTIAL'; reason = 'Model identifiable but missing exact official image and valid URL'; }
    else if (p.name.includes('Canon EOS R50')) { resolvedBrand = 'Canon'; resolvedModel = 'EOS R50'; identityStatus = 'IDENTITY_PARTIAL'; reason = 'Model identifiable but missing exact official image and valid URL'; }
    else if (p.name.includes('Canon EOS R6 Mark II')) { resolvedBrand = 'Canon'; resolvedModel = 'EOS R6 Mark II'; identityStatus = 'IDENTITY_PARTIAL'; reason = 'Model identifiable but missing exact official image and valid URL'; }
    else if (p.name.includes('Canon EOS R8')) { resolvedBrand = 'Canon'; resolvedModel = 'EOS R8'; identityStatus = 'IDENTITY_PARTIAL'; reason = 'Model identifiable but missing exact official image and valid URL'; }
    else if (p.name.includes('DJI Osmo Action 4')) { resolvedBrand = 'DJI'; resolvedModel = 'Osmo Action 4'; identityStatus = 'IDENTITY_PARTIAL'; reason = 'Model identifiable but missing exact official image and valid URL'; }
    else {
      // It's a generic synthetic category
      stats.IDENTITY.UNRESOLVED++;
    }

    if (identityStatus === 'IDENTITY_PARTIAL') stats.IDENTITY.PARTIAL++;

    // Update Product Record safely
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

    // Process Marketplaces
    const mps = await MP.find({ product: p._id }).toArray();
    for (const mp of mps) {
      // Mark as SYNTHETIC since these are B00CMx or B06... hex strings, or search pages
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

    auditLog.push({
      ProductID: p._id.toString(),
      Brand: resolvedBrand,
      Category: p.category,
      ProductType: p.productType,
      OriginalName: p.name,
      ResolvedModel: resolvedModel,
      IdentityStatus: identityStatus,
      OfficialSource: 'Missing',
      ImageSource: 'Pending',
      ImageSHA256: 'N/A',
      ImageDimensions: 'N/A',
      ImageVerification: 'PENDING',
      Marketplace: 'Various',
      MarketplaceURL: mps.map(m=>m.url).join(', '),
      MarketplaceVerification: 'SYNTHETIC',
      Price: 'UNAVAILABLE',
      MRP: 'UNAVAILABLE',
      Discount: 'UNAVAILABLE',
      Savings: 'UNAVAILABLE',
      FinalStatus: identityStatus,
      Reason: reason
    });
  }

  const pCountAfter = await Product.countDocuments();
  const mpCountAfter = await MP.countDocuments();

  if (pCountBefore !== pCountAfter || mpCountBefore !== mpCountAfter) {
    console.error('FATAL INVARIANT MISMATCH');
    process.exit(1);
  }

  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  const batchId = 'Batch1';
  fs.writeFileSync(path.join(auditsDir, `phase15_8_${batchId}_CatalogRecovery.json`), JSON.stringify({ stats, auditLog }, null, 2));

  let md = `# Phase 15.8 Catalog Recovery - ${batchId}\n\n`;
  for (const log of auditLog) {
    md += `### ${log.ProductID}\n`;
    for (const [k, v] of Object.entries(log)) {
      if (k !== 'ProductID') md += `- **${k}**: ${v}\n`;
    }
    md += '\n';
  }
  fs.writeFileSync(path.join(auditsDir, `phase15_8_${batchId}_CatalogRecovery.md`), md);

  console.log('Batch processed successfully');
  process.exit(0);
}

run().catch(console.error);
