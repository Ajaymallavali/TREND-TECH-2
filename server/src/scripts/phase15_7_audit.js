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
  const PH = mongoose.connection.db.collection('pricehistories');

  const counts = {
    Products: await Product.countDocuments(),
    MarketplaceProducts: await MP.countDocuments(),
    PriceHistory: await PH.countDocuments()
  };

  const report = {
    verifiedCanonicalProducts: 0,
    productsWith0VerifiedOffers: 0,
    productsWith1VerifiedOffer: 0,
    productsWith2PlusVerifiedOffers: 0,
    marketplaces: {
      Amazon: { existing: 0, verified: 0, unverified: 0, broken: 0 },
      Flipkart: { existing: 0, verified: 0, unverified: 0, broken: 0 },
      Myntra: { existing: 0, verified: 0, unverified: 0, broken: 0 },
      Ajio: { existing: 0, verified: 0, unverified: 0, broken: 0 },
      Nykaa: { existing: 0, verified: 0, unverified: 0, broken: 0 },
      OTHER: { existing: 0, verified: 0, unverified: 0, broken: 0 }
    }
  };

  const allProducts = await Product.find({}).toArray();
  for (const p of allProducts) {
    const isVerified = p.identityStatus === 'IDENTITY_VERIFIED';
    if (isVerified) report.verifiedCanonicalProducts++;

    const mps = await MP.find({ product: p._id }).toArray();
    let verifiedCount = 0;

    for (const mp of mps) {
      let mpName = 'OTHER';
      const urlLower = mp.url ? mp.url.toLowerCase() : '';
      if (urlLower.includes('amazon')) mpName = 'Amazon';
      else if (urlLower.includes('flipkart')) mpName = 'Flipkart';
      else if (urlLower.includes('myntra')) mpName = 'Myntra';
      else if (urlLower.includes('ajio')) mpName = 'Ajio';
      else if (urlLower.includes('nykaa')) mpName = 'Nykaa';

      report.marketplaces[mpName].existing++;

      if (mp.sourceStatus === 'LIVE_VERIFIED') {
        report.marketplaces[mpName].verified++;
        verifiedCount++;
      } else if (mp.sourceStatus === 'BROKEN') {
        report.marketplaces[mpName].broken++;
      } else {
        report.marketplaces[mpName].unverified++;
      }
    }

    if (isVerified) {
      if (verifiedCount === 0) report.productsWith0VerifiedOffers++;
      else if (verifiedCount === 1) report.productsWith1VerifiedOffer++;
      else report.productsWith2PlusVerifiedOffers++;
    }
  }

  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  fs.writeFileSync(path.join(auditsDir, 'phase15_7MarketplaceOfferVerification.json'), JSON.stringify({ counts, report }, null, 2));

  let md = `# Phase 15.7 Marketplace Offer Verification Report\n\n`;
  md += `## Database Baseline\n- Products: ${counts.Products}\n- MarketplaceProducts: ${counts.MarketplaceProducts}\n- PriceHistory: ${counts.PriceHistory}\n\n`;
  md += `## Coverage\n- Verified Canonical Products: ${report.verifiedCanonicalProducts}\n`;
  md += `- Products With 0 Verified Offers: ${report.productsWith0VerifiedOffers}\n`;
  md += `- Products With 1 Verified Offer: ${report.productsWith1VerifiedOffer}\n`;
  md += `- Products With 2+ Verified Offers: ${report.productsWith2PlusVerifiedOffers}\n\n`;

  for (const [k, v] of Object.entries(report.marketplaces)) {
    md += `## ${k}\n- Existing: ${v.existing}\n- Verified: ${v.verified}\n- Unverified: ${v.unverified}\n- Broken: ${v.broken}\n\n`;
  }

  fs.writeFileSync(path.join(auditsDir, 'phase15_7MarketplaceOfferVerification.md'), md);

  console.log(JSON.stringify({ counts, report }, null, 2));
  process.exit(0);
}

run().catch(console.error);
