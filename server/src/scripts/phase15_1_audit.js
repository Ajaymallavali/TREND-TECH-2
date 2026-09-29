import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Helpers ---

const TECH_CATS = [
  'smartphone', 'laptop', 'tablet', 'television', 'monitor', 
  'headphones', 'earphones', 'audio', 'camera', 'gaming', 
  'smartwatch', 'charger', 'accessories', 'appliance', 
  'feature phone', 'foldable phone', 'tv', 'mobile'
];
const TREND_CATS = [
  'men fashion', 'women fashion', 'kids fashion', 'dress', 
  'shirt', 't-shirt', 'jeans', 'trouser', 'shoes', 'sandal', 
  'watch', 'beauty', 'personal care', 'fashion'
];

function getDomain(category) {
  if (!category) return 'UNKNOWN';
  const c = category.toLowerCase();
  
  if (TECH_CATS.some(t => c === t || c.includes(t))) return 'TECH';
  if (TREND_CATS.some(t => c === t || c.includes(t))) return 'TREND';
  
  return 'UNKNOWN';
}

const PSEUDO_BRANDS = ['smartphone', 'laptop', 'feature phone', 'foldable phone', 'tablet', 'television', 'monitor', 'headphones', 'camera', 'smartwatch'];

function isPseudoBrand(brand) {
  if (!brand) return true;
  return PSEUDO_BRANDS.includes(brand.toLowerCase());
}

function checkMarketplaceStatus(url) {
  if (!url) return 'MISSING';
  
  if (url.match(/B00[A-Z0-9]*$/) && url.split('/').pop().length < 10) return 'LEGACY_SYNTHETIC';
  if (url.match(/B00TV|B00SP|B00AU|B00MN|B00TB/)) return 'LEGACY_SYNTHETIC';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('amazon.in') || lowerUrl.includes('amazon.com')) {
    if (lowerUrl.includes('/dp/') || lowerUrl.includes('/gp/product/')) return 'LIVE_VERIFIED';
    return 'BROKEN_URL';
  }
  
  if (lowerUrl.includes('flipkart.com')) {
    if (lowerUrl.includes('/p/') || lowerUrl.includes('pid=')) return 'LIVE_VERIFIED';
    return 'BROKEN_URL';
  }
  
  if (lowerUrl.includes('myntra.com') || lowerUrl.includes('ajio.com') || lowerUrl.includes('nykaa.com')) {
    if (lowerUrl.includes('/buy') || lowerUrl.length > 30) return 'LIVE_VERIFIED';
    return 'BROKEN_URL';
  }
  
  return 'LIVE_UNVERIFIED';
}

// --- Main Audit ---

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
    productIdentity: { verified: 0, partial: 0, unverified: 0, conflicted: 0, synthetic: 0 },
    image: { exact: 0, regional: 0, unverified: 0, wrongModel: 0, generic: 0, duplicate: 0 },
    domains: { TECH: 0, TREND: 0, UNKNOWN: 0 },
    categories: {},
    brandAnomalies: [],
    verifiedBrands: new Set(),
    proposedCorrections: [],
    marketplace: {
      Amazon: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 },
      Flipkart: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 },
      Myntra: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 },
      Ajio: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 },
      Nykaa: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 },
      OTHER: { total: 0, liveVerified: 0, unverified: 0, synthetic: 0, broken: 0, missing: 0 }
    },
    deals: {
      eligibleOffers: 0,
      eligibleProducts: 0,
      suppressedOffers: 0,
      suppressionReasons: {}
    },
    comparison: {
      eligibleProducts: 0,
      compatibleGroups: new Set()
    },
    recommendations: {
      eligibleProducts: 0,
      suppressedProducts: 0
    },
    redirects: {
      valid: 0,
      invalid: 0,
      synthetic: 0,
      broken: 0
    }
  };

  const products = await Product.find({}).lean();
  const mps = await MP.find({}).lean();
  
  const mpsByProduct = {};
  mps.forEach(m => {
    const pid = m.product ? m.product.toString() : 'NONE';
    if (!mpsByProduct[pid]) mpsByProduct[pid] = [];
    mpsByProduct[pid].push(m);
  });
  
  let eligibleProductsSet = new Set();
  let comparisonProductsSet = new Set();

  for (const p of products) {
    const pId = p._id.toString();
    
    // Domain & Category
    const dom = getDomain(p.category);
    audit.domains[dom]++;
    
    const cat = p.category || 'Missing';
    if (!audit.categories[cat]) audit.categories[cat] = 0;
    audit.categories[cat]++;
    
    // Brand Normalization
    let isBrandAnomaly = false;
    if (isPseudoBrand(p.brand)) {
      isBrandAnomaly = true;
      audit.brandAnomalies.push({ id: pId, brand: p.brand });
      audit.proposedCorrections.push({ id: pId, field: 'brand', current: p.brand, proposed: 'UNKNOWN' });
    } else if (p.brand) {
      audit.verifiedBrands.add(p.brand);
    }
    
    // Identity
    let idStatus = 'IDENTITY_UNVERIFIED';
    if (p.title && p.title.match(/Product \d+/)) {
      idStatus = 'IDENTITY_SYNTHETIC';
      audit.productIdentity.synthetic++;
    } else if (!isBrandAnomaly && p.brand && p.model) {
      idStatus = 'IDENTITY_VERIFIED';
      audit.productIdentity.verified++;
    } else if (!isBrandAnomaly && p.brand && p.title) {
      idStatus = 'IDENTITY_PARTIAL';
      audit.productIdentity.partial++;
    } else {
      audit.productIdentity.unverified++;
    }
    
    // Image
    let imgStatus = p.imageStatus || p.verificationStatus;
    if (imgStatus === 'VERIFIED_EXACT') audit.image.exact++;
    else if (imgStatus === 'VERIFIED_REGIONAL_VARIANT') audit.image.regional++;
    else audit.image.unverified++;
    
    // Process Offers (MPs) for this product
    const productMps = mpsByProduct[pId] || [];
    let hasValidDeal = false;
    
    for (const m of productMps) {
      let platform = 'OTHER';
      const urlLower = (m.url || '').toLowerCase();
      if (urlLower.includes('amazon')) platform = 'Amazon';
      else if (urlLower.includes('flipkart')) platform = 'Flipkart';
      else if (urlLower.includes('myntra')) platform = 'Myntra';
      else if (urlLower.includes('ajio')) platform = 'Ajio';
      else if (urlLower.includes('nykaa')) platform = 'Nykaa';
      
      const mpStatus = checkMarketplaceStatus(m.url);
      audit.marketplace[platform].total++;
      
      let offerDealEligible = false;
      let suppressReason = 'NONE';
      
      if (mpStatus === 'LIVE_VERIFIED') {
        audit.marketplace[platform].liveVerified++;
        audit.redirects.valid++;
        
        // Price state check
        if (m.currentPrice && m.currentPrice > 0) {
           // Identity state check
           if (idStatus === 'IDENTITY_VERIFIED' || idStatus === 'IDENTITY_PARTIAL') {
             offerDealEligible = true;
             audit.deals.eligibleOffers++;
             hasValidDeal = true;
           } else {
             suppressReason = 'UNVERIFIED_PRODUCT_IDENTITY';
           }
        } else {
           suppressReason = 'MISSING_PRICE';
        }
      } else {
        audit.redirects.invalid++;
        if (mpStatus === 'LEGACY_SYNTHETIC') {
          audit.marketplace[platform].synthetic++;
          audit.redirects.synthetic++;
          suppressReason = 'LEGACY_SYNTHETIC_URL';
        } else if (mpStatus === 'BROKEN_URL') {
          audit.marketplace[platform].broken++;
          audit.redirects.broken++;
          suppressReason = 'BROKEN_URL';
        } else if (mpStatus === 'MISSING') {
          audit.marketplace[platform].missing++;
          suppressReason = 'MISSING_URL';
        } else {
          audit.marketplace[platform].unverified++;
          suppressReason = 'LIVE_UNVERIFIED';
        }
      }
      
      if (!offerDealEligible) {
        audit.deals.suppressedOffers++;
        audit.deals.suppressionReasons[suppressReason] = (audit.deals.suppressionReasons[suppressReason] || 0) + 1;
      }
    }
    
    if (hasValidDeal) {
      eligibleProductsSet.add(pId);
      audit.comparison.compatibleGroups.add(cat);
      comparisonProductsSet.add(pId);
    } else {
      audit.recommendations.suppressedProducts++;
    }
  }
  
  audit.deals.eligibleProducts = eligibleProductsSet.size;
  audit.comparison.eligibleProducts = comparisonProductsSet.size;
  audit.recommendations.eligibleProducts = eligibleProductsSet.size;
  audit.verifiedBrands = Array.from(audit.verifiedBrands);
  audit.comparison.compatibleGroups = Array.from(audit.comparison.compatibleGroups);

  fs.writeFileSync(path.join(__dirname, '../data/audits/phase15_1GovernanceCorrection.json'), JSON.stringify(audit, null, 2));
  console.log('Done');
  process.exit(0);
}

run();
