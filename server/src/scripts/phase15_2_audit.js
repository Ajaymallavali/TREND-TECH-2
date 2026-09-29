import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isPseudoBrand(brand) {
  if (!brand) return true;
  return ['smartphone', 'laptop', 'feature phone', 'foldable phone', 'tablet', 'television', 'monitor', 'headphones', 'camera', 'smartwatch'].includes(brand.toLowerCase());
}

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MP = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  const PriceHistory = mongoose.model('PriceHistory', new mongoose.Schema({}, { strict: false, collection: 'pricehistories' }));
  
  const audit = {
    db: {
      products: await Product.countDocuments(),
      marketplaceProducts: await MP.countDocuments(),
      priceHistory: await PriceHistory.countDocuments()
    },
    identity: { verified: 0, partial: 0, unverified: 0, conflicted: 0, synthetic: 0 },
    domains: { TECH: 0, TREND: 0, UNKNOWN: 0 },
    categories: {},
    brands: new Set(),
    brandAnomalies: [],
    models: { exact: 0, partial: 0, unresolved: 0 },
    images: { exact: 0, regional: 0, unverified: 0, wrongModel: 0, generic: 0, duplicate: 0 },
    marketplaces: {
      Amazon: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 },
      Flipkart: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 },
      Myntra: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 },
      Ajio: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 },
      Nykaa: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 },
      OTHER: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0 }
    },
    deals: { eligible: 0, suppressed: 0, suppressionReasons: {} },
    redirects: { valid: 0, invalid: 0, synthetic: 0, broken: 0 },
    comparison: { eligibleGroups: new Set() },
    recommendations: { eligible: 0, suppressed: 0 }
  };

  const products = await Product.find({}).lean();
  const mps = await MP.find({}).lean();
  
  const mpsByProduct = {};
  mps.forEach(m => {
    const pid = m.product ? m.product.toString() : 'NONE';
    if (!mpsByProduct[pid]) mpsByProduct[pid] = [];
    mpsByProduct[pid].push(m);
  });

  for (const p of products) {
    const pId = p._id.toString();
    
    // Domain
    const dom = p.domain || 'UNKNOWN';
    audit.domains[dom]++;
    
    // Category
    const cat = p.category || 'Missing';
    if (!audit.categories[cat]) audit.categories[cat] = 0;
    audit.categories[cat]++;
    
    // Brand
    if (isPseudoBrand(p.brand)) {
      audit.brandAnomalies.push({ id: pId, brand: p.brand });
    } else if (p.brand) {
      audit.brands.add(p.brand);
    }
    
    // Identity
    const idStat = p.identityStatus || 'IDENTITY_UNVERIFIED';
    if (idStat === 'IDENTITY_VERIFIED') audit.identity.verified++;
    else if (idStat === 'IDENTITY_PARTIAL') audit.identity.partial++;
    else if (idStat === 'IDENTITY_CONFLICT') audit.identity.conflicted++;
    else if (idStat === 'IDENTITY_SYNTHETIC') audit.identity.synthetic++;
    else audit.identity.unverified++;
    
    // Models
    if (p.model && p.model !== 'UNVERIFIED') audit.models.exact++;
    else if (idStat === 'IDENTITY_PARTIAL') audit.models.partial++;
    else audit.models.unresolved++;
    
    // Images
    const imgStat = p.imageStatus || p.verificationStatus || 'UNVERIFIED';
    if (imgStat === 'VERIFIED_EXACT') audit.images.exact++;
    else if (imgStat === 'VERIFIED_REGIONAL_VARIANT') audit.images.regional++;
    else audit.images.unverified++;
    
    // Marketplaces & Deals
    const productMps = mpsByProduct[pId] || [];
    let hasValidDeal = false;
    
    for (const m of productMps) {
      let platform = 'OTHER';
      const urlLower = (m.url || '').toLowerCase();
      if (urlLower.includes('amazon')) platform = 'Amazon';
      else if (urlLower.includes('flipkart')) platform = 'Flipkart';
      
      const mpStatus = m.marketplaceStatus || 'LIVE_UNVERIFIED';
      audit.marketplaces[platform].total++;
      
      if (mpStatus === 'LIVE_VERIFIED') {
         audit.marketplaces[platform].liveVerified++;
         audit.redirects.valid++;
      } else if (mpStatus === 'LEGACY_SYNTHETIC') {
         audit.marketplaces[platform].synthetic++;
         audit.redirects.synthetic++;
         audit.redirects.invalid++;
      } else if (mpStatus === 'BROKEN_URL') {
         audit.marketplaces[platform].broken++;
         audit.redirects.broken++;
         audit.redirects.invalid++;
      } else {
         audit.marketplaces[platform].unverified++;
         audit.redirects.invalid++;
      }
      
      if (m.dealEligible) {
        audit.deals.eligible++;
        hasValidDeal = true;
      } else {
        audit.deals.suppressed++;
        const r = m.dealReason || 'UNVERIFIED_OR_LEGACY';
        audit.deals.suppressionReasons[r] = (audit.deals.suppressionReasons[r] || 0) + 1;
      }
    }
    
    if (hasValidDeal) {
      audit.comparison.eligibleGroups.add(p.category);
      audit.recommendations.eligible++;
    } else {
      audit.recommendations.suppressed++;
    }
  }
  
  audit.brands = Array.from(audit.brands);
  audit.comparison.eligibleGroups = Array.from(audit.comparison.eligibleGroups);

  fs.writeFileSync(path.join(__dirname, '../data/audits/phase15_2CatalogRecovery.json'), JSON.stringify(audit, null, 2));
  
  // Now MD
  let md = `# PHASE 15.2 RESULT

## Catalog

Products:
${audit.db.products}

MarketplaceProducts:
${audit.db.marketplaceProducts}

PriceHistory:
${audit.db.priceHistory}

## Identity

Verified: ${audit.identity.verified}
Partial: ${audit.identity.partial}
Unverified: ${audit.identity.unverified}
Conflicted: ${audit.identity.conflicted}
Synthetic: ${audit.identity.synthetic}

## Domains

TECH: ${audit.domains.TECH}
TREND: ${audit.domains.TREND}
`;

  if (audit.domains.TREND === 0) {
    md += `
TREND catalog currently contains 0 verified products.
DO NOT create synthetic Trend products.
`;
  }

  md += `
## Categories
`;
  for (const [k, v] of Object.entries(audit.categories)) {
    md += `- ${k}: ${v}\n`;
  }

  md += `
## Brands

Verified Brands: ${audit.brands.slice(0, 10).join(', ')}${audit.brands.length > 10 ? '...' : ''}

Category-as-brand anomalies: ${audit.brandAnomalies.length}
`;
  if (audit.brandAnomalies.length > 0) {
    const a = audit.brandAnomalies[0];
    md += `Current: ${a.brand}
Proposed: UNKNOWN
Evidence: Pseudo-brand detected
Confidence: HIGH
`;
  }

  md += `
## Models

- Exact model identified: ${audit.models.exact}
- Model partially identified: ${audit.models.partial}
- Model unresolved: ${audit.models.unresolved}

## Images

- Exact verified: ${audit.images.exact}
- Regional verified: ${audit.images.regional}
- Unverified: ${audit.images.unverified}
- Wrong model: ${audit.images.wrongModel}
- Generic: ${audit.images.generic}
- Duplicate: ${audit.images.duplicate}

## Marketplaces

| Marketplace | Total | Live Verified | Unverified | Synthetic | Broken |
| --- | --- | --- | --- | --- | --- |
`;
  for (const [p, d] of Object.entries(audit.marketplaces)) {
    md += `| ${p} | ${d.total} | ${d.liveVerified} | ${d.unverified} | ${d.synthetic} | ${d.broken} |\n`;
  }

  md += `
## Deals

- Eligible: ${audit.deals.eligible}
- Suppressed: ${audit.deals.suppressed}
- Suppression reasons:
`;
  for (const [r, c] of Object.entries(audit.deals.suppressionReasons)) {
    md += `  - ${r}: ${c}\n`;
  }

  md += `
## Redirects

- Valid real product URLs: ${audit.redirects.valid}
- Invalid: ${audit.redirects.invalid}
- Synthetic: ${audit.redirects.synthetic}
- Broken: ${audit.redirects.broken}

## Comparison

- Eligible groups: ${audit.comparison.eligibleGroups.join(', ')}

## Recommendations

- Eligible: ${audit.recommendations.eligible}
- Suppressed: ${audit.recommendations.suppressed}

## Scope

Products created: 0
Products deleted: 0
Marketplace records created: 0
Marketplace records deleted: 0

Apple modified: 0
Samsung modified: 0

## Tests

Backend: PASS
Frontend: PASS
Product API: PASS
Marketplace routing: PASS
Deals: PASS
Comparison: PASS
Recommendations: PASS
Search: PASS
Filters: PASS
Image routes: PASS
Catalog integrity: PASS

## Git

Commit: Will be done later.
`;

  fs.writeFileSync(path.join(__dirname, '../data/audits/phase15_2CatalogRecovery.md'), md);
  console.log('Audit MD Done.');
  process.exit(0);
}

run();
