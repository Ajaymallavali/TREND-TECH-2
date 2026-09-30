import mongoose from 'mongoose';
import { validateStoreUrl, findProductByUrlOrQuery } from './matcher.js';
import { computeAIScores } from '../aiWorkflow.service.js';

export async function analyzeProductWorkflow({ query, url, reelUrl, description }) {
  const Product = mongoose.model('Product');
  const MarketplaceProduct = mongoose.model('MarketplaceProduct');
  const PriceHistory = mongoose.model('PriceHistory');
  
  let validationResult = { isValid: true };
  if (url) {
    validationResult = validateStoreUrl(url);
  }

  if (url && !validationResult.isValid) {
    return {
      status: 'INVALID_URL',
      error: validationResult.reason,
      coverage: { checked: [], unavailable: [] },
      marketplaces: [],
      product: null
    };
  }

  const product = await findProductByUrlOrQuery(url, query);
  
  if (!product) {
    return {
      status: 'PRODUCT_NOT_FOUND',
      error: 'Product identity could not be matched against verified catalog.',
      coverage: { checked: [], unavailable: [] },
      marketplaces: [],
      product: null
    };
  }

  // We have a canonical product
  const mps = await MarketplaceProduct.find({ product: product._id }).populate('marketplace').lean();
  
  const marketplaces = [];
  let bestDeal = null;
  let lowestVerifiedPrice = Infinity;
  
  const coverage = { checked: [], unavailable: [] };
  const allMarketplaceNames = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Croma', 'Reliance Digital'];

  for (const mp of mps) {
    // Determine marketplace name
    let mpName = 'Unknown';
    if (mp.marketplace && mp.marketplace.name) {
      mpName = mp.marketplace.name;
    } else if (mp.marketplace) {
      mpName = String(mp.marketplace);
    }
    
    // Track coverage
    if (!coverage.checked.includes(mpName)) {
      coverage.checked.push(mpName);
    }

    // Skip unverified or synthetic
    if (mp.sourceStatus === 'SYNTHETIC' || mp.sourceStatus === 'BROKEN' || mp.sourceStatus === 'WRONG_PRODUCT') {
      continue;
    }

    // Validate Redirect URL
    const urlCheck = validateStoreUrl(mp.url);
    if (!urlCheck.isValid) {
      continue; // Skip invalid open-redirects
    }

    const price = mp.currentPrice || null;
    const mrp = mp.originalPrice || null;
    
    let discount = null;
    let savings = null;
    
    if (price && mrp && mrp > price) {
      discount = Math.round(((mrp - price) / mrp) * 100);
      savings = mrp - price;
    }

    const offer = {
      _id: mp._id,
      marketplace: mpName,
      logoUrl: mp.marketplace && mp.marketplace.logoUrl ? mp.marketplace.logoUrl : null,
      price: price,
      mrp: mrp,
      discountPercentage: discount,
      savings: savings,
      availability: mp.isAvailable ? 'Available' : 'Unavailable',
      seller: mp.seller || 'Unknown',
      lastChecked: mp.lastUpdated || new Date(),
      url: mp.url,
      matchStatus: mp.sourceStatus === 'LIVE_VERIFIED' ? 'EXACT_MATCH' : 'UNVERIFIED',
      isVerified: mp.sourceStatus === 'LIVE_VERIFIED'
    };

    if (offer.isVerified && offer.price && offer.price < lowestVerifiedPrice && offer.availability === 'Available') {
      lowestVerifiedPrice = offer.price;
      bestDeal = offer;
    }

    marketplaces.push(offer);
  }

  // Populate unavailable coverage
  allMarketplaceNames.forEach(m => {
    if (!coverage.checked.includes(m)) {
      coverage.unavailable.push(m);
    }
  });

  const priceHistoryDocs = await PriceHistory.find({ 
    marketplaceProduct: { $in: mps.map(m => m._id) }
  }).sort({ timestamp: 1 }).lean();

  let sourceMarketplace = null;
  let sourcePrice = null;
  
  if (url) {
    try {
      const parsedInputUrl = new URL(url);
      const host = parsedInputUrl.hostname.toLowerCase();
      let detectedName = 'Unknown Store';
      if (host.includes('amazon')) detectedName = 'Amazon';
      if (host.includes('flipkart')) detectedName = 'Flipkart';
      if (host.includes('myntra')) detectedName = 'Myntra';
      if (host.includes('ajio')) detectedName = 'Ajio';
      if (host.includes('nykaa')) detectedName = 'Nykaa';
      if (host.includes('croma')) detectedName = 'Croma';
      
      sourceMarketplace = detectedName;

      const exactMpMatch = marketplaces.find(m => {
        try {
          const mUrl = new URL(m.url);
          return mUrl.pathname === parsedInputUrl.pathname;
        } catch(e) { return false; }
      });
      
      if (exactMpMatch && exactMpMatch.isVerified && exactMpMatch.price) {
        sourcePrice = exactMpMatch.price;
        sourceMarketplace = exactMpMatch.marketplace;
      }
    } catch (e) {
      // ignore parsing errors here
    }
  }

  const aiScores = computeAIScores(product, marketplaces, lowestVerifiedPrice === Infinity ? null : lowestVerifiedPrice);
  
  // Basic AI Verdict logic
  let verdict = `This ${product.category || 'device'} provides a strong overall package based on verified specifications.`;
  if (lowestVerifiedPrice !== Infinity) {
    if (sourceMarketplace && sourcePrice && bestDeal && sourceMarketplace !== bestDeal.marketplace && sourcePrice > lowestVerifiedPrice) {
      const diff = sourcePrice - lowestVerifiedPrice;
      verdict = `${bestDeal.marketplace} currently has the lowest verified price among the available verified offers, at ₹${lowestVerifiedPrice.toLocaleString('en-IN')}. ${sourceMarketplace} is ₹${sourcePrice.toLocaleString('en-IN')}, so the ${bestDeal.marketplace} offer is ₹${diff.toLocaleString('en-IN')} cheaper.`;
    } else if (sourceMarketplace && sourcePrice && bestDeal && sourceMarketplace === bestDeal.marketplace && sourcePrice === lowestVerifiedPrice) {
      verdict = `The provided ${sourceMarketplace} offer is currently the best verified deal at ₹${lowestVerifiedPrice.toLocaleString('en-IN')}.`;
    } else {
      verdict = `Among the verified offers analyzed, the ${product.name} offers excellent value at ₹${lowestVerifiedPrice.toLocaleString('en-IN')}, balancing its core specs with solid marketplace availability.`;
    }
  }
  
  const pros = [];
  const specsObj = product.specs ? (product.specs instanceof Map ? Object.fromEntries(product.specs) : product.specs) : {};
  for (const [key, val] of Object.entries(specsObj)) {
    if (typeof val === 'string' && val.trim() && pros.length < 4) {
      pros.push(`✓ ${key}: ${val}`);
    }
  }
  if (lowestVerifiedPrice !== Infinity) {
    pros.push(`✓ Verified marketplace availability starting at ₹${lowestVerifiedPrice.toLocaleString('en-IN')}`);
  }

  const watchOutFor = [];
  if (lowestVerifiedPrice !== Infinity && lowestVerifiedPrice > 80000) {
    watchOutFor.push(`⚠ Premium Segment Price Point (₹${lowestVerifiedPrice.toLocaleString('en-IN')})`);
  }
  if (marketplaces.filter(m => m.isVerified).length === 1) {
    watchOutFor.push(`⚠ Limited marketplace availability (only 1 verified store)`);
  }
  if (watchOutFor.length === 0) {
    watchOutFor.push(`Not enough verified evidence to identify a specific concern.`);
  }

  let bestFor = ['Everyday Use', 'Performance'];
  if (aiScores.performance > 90) bestFor = ['Power Users', 'Gaming', 'Performance'];

  return {
    status: 'SUCCESS',
    sourceInfo: {
      url: url || null,
      marketplace: sourceMarketplace,
      price: sourcePrice,
    },
    product: {
      _id: product._id,
      brand: product.brand,
      name: product.name,
      model: product.model,
      category: product.category,
      variant: product.specs && product.specs.Storage ? product.specs.Storage : 'Standard',
      specifications: specsObj,
    },
    identity: {
      matchConfidence: product.identityStatus === 'IDENTITY_VERIFIED' ? 'EXACT' : 'AMBIGUOUS',
      status: product.identityStatus
    },
    image: {
      url: product.image,
      status: product.imageStatus || (product.image ? 'VERIFIED_EXACT' : 'PENDING')
    },
    specs: specsObj,
    research: {
      verdict,
      bestFor,
      pros,
      watchOutFor
    },
    marketplaces: marketplaces,
    bestDeal: bestDeal,
    priceHistory: priceHistoryDocs,
    coverage: coverage,
    verification: {
      checkedAt: new Date()
    },
    analysis: aiScores
  };
}
