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

  return {
    status: 'SUCCESS',
    product: {
      _id: product._id,
      brand: product.brand,
      name: product.name,
      model: product.model,
      category: product.category,
      variant: product.specs && product.specs.Storage ? product.specs.Storage : 'Standard',
      specifications: product.specs,
    },
    identity: {
      matchConfidence: product.identityStatus === 'IDENTITY_VERIFIED' ? 'EXACT' : 'AMBIGUOUS',
      status: product.identityStatus
    },
    image: {
      url: product.image,
      status: product.imageStatus || (product.image ? 'VERIFIED_EXACT' : 'PENDING')
    },
    marketplaces: marketplaces,
    bestDeal: bestDeal,
    priceHistory: priceHistoryDocs,
    coverage: coverage,
    verification: {
      checkedAt: new Date()
    },
    analysis: computeAIScores(product, marketplaces, lowestVerifiedPrice === Infinity ? null : lowestVerifiedPrice)
  };
}
