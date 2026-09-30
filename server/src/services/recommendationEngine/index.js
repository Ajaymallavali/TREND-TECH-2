import mongoose from 'mongoose';
import { parseShoppingQuery } from './parser.js';

export async function generateRecommendations(query) {
  const Product = mongoose.model('Product');
  const MarketplaceProduct = mongoose.model('MarketplaceProduct');

  const parsed = parseShoppingQuery(query);
  
  if (parsed.intent !== 'NATURAL_LANGUAGE_SHOPPING' && parsed.intent !== 'PRODUCT_COMPARISON') {
    return null; 
  }

  // 1. Comparison Flow
  if (parsed.intent === 'PRODUCT_COMPARISON' && parsed.compareSubjects && parsed.compareSubjects.length === 2) {
    const products = [];
    for (const subject of parsed.compareSubjects) {
      const parts = subject.split(' ').map(p => `(?=.*${p})`).join('');
      const p = await Product.findOne({ name: new RegExp(parts, 'i') }).lean();
      if (p) products.push(p);
    }
    
    if (products.length === 2) {
      const pIds = products.map(p => p._id);
      const mps = await MarketplaceProduct.find({ product: { $in: pIds }, isAvailable: true }).populate('marketplace').lean();
      
      const comparison = products.map(p => {
        const pMps = mps.filter(m => m.product.toString() === p._id.toString() && m.currentPrice > 0);
        let deal = null;
        if (pMps.length > 0) {
          const bestOffer = pMps.sort((a,b) => a.currentPrice - b.currentPrice)[0];
          deal = {
            price: bestOffer.currentPrice,
            mrp: bestOffer.originalPrice,
            marketplace: bestOffer.marketplace ? bestOffer.marketplace.name : 'Unknown',
            url: bestOffer.url
          };
        }
        return { product: p, deal };
      });
      
      return {
        status: 'COMPARISON_SUCCESS',
        request: {
          original: query,
          intent: parsed.intent,
          subjects: parsed.compareSubjects
        },
        comparison
      };
    }
  }

  // 2. Shopping Flow
  const filter = {};
  if (parsed.category) {
    filter.category = new RegExp(parsed.category, 'i');
  }

  const products = await Product.find(filter).lean();
  
  const productIds = products.map(p => p._id);
  const mps = await MarketplaceProduct.find({ 
    product: { $in: productIds },
    isAvailable: true,
    sourceStatus: { $nin: ['BROKEN', 'SYNTHETIC', 'WRONG_PRODUCT'] }
  }).populate('marketplace').lean();

  const mpsByProduct = {};
  mps.forEach(mp => {
    if (!mpsByProduct[mp.product]) mpsByProduct[mp.product] = [];
    mpsByProduct[mp.product].push(mp);
  });

  const candidates = [];

  for (const p of products) {
    const pMps = mpsByProduct[p._id] || [];
    const verifiedOffers = pMps.filter(m => m.currentPrice > 0 && m.currency === 'INR');
    
    if (verifiedOffers.length === 0) continue;

    const bestOffer = verifiedOffers.sort((a,b) => a.currentPrice - b.currentPrice)[0];
    const bestPrice = bestOffer.currentPrice;
    const bestMrp = bestOffer.originalPrice;
    
    let discount = null;
    let savings = null;
    if (bestMrp && bestMrp > bestPrice) {
      savings = bestMrp - bestPrice;
      discount = Math.round((savings / bestMrp) * 100);
    }

    if (parsed.budget) {
      if (parsed.budget.maxPrice && bestPrice > parsed.budget.maxPrice) continue;
      if (parsed.budget.minPrice && bestPrice < parsed.budget.minPrice) continue;
    }

    let score = 100;
    const reqMatches = [];
    
    if (parsed.budget && parsed.budget.maxPrice) {
      const headroom = parsed.budget.maxPrice - bestPrice;
      score += (headroom / parsed.budget.maxPrice) * 20;
    }

    const pStr = `${p.name} ${p.description} ${p.tags ? p.tags.join(' ') : ''} ${JSON.stringify(p.specs || {})}`.toLowerCase();
    
    for (const req of parsed.requirements) {
      const reqL = req.toLowerCase();
      if (pStr.includes(reqL)) {
        score += 15;
        reqMatches.push(req);
      } else {
        score -= 5;
      }
    }

    if (p.identityStatus === 'IDENTITY_VERIFIED') {
      score += 10;
    }

    candidates.push({
      product: {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        category: p.category,
        image: p.image,
        identityStatus: p.identityStatus,
        variant: p.variant
      },
      deal: {
        price: bestPrice,
        mrp: bestMrp,
        discountPercentage: discount,
        savings: savings,
        marketplace: bestOffer.marketplace ? bestOffer.marketplace.name : 'Unknown',
        url: bestOffer.url,
        isVerified: bestOffer.sourceStatus === 'LIVE_VERIFIED'
      },
      score,
      reqMatches
    });
  }

  candidates.sort((a,b) => b.score - a.score);
  const recommendations = candidates.slice(0, 5);

  if (recommendations.length === 0) {
     return {
       status: 'RECOMMENDATION_SUCCESS',
       request: { original: query, intent: parsed.intent, budget: parsed.budget, category: parsed.category, requirements: parsed.requirements },
       recommendations: [],
       message: 'No products matched your exact budget and requirements.'
     };
  }

  return {
    status: 'RECOMMENDATION_SUCCESS',
    request: {
      original: query,
      intent: parsed.intent,
      budget: parsed.budget,
      category: parsed.category,
      requirements: parsed.requirements
    },
    recommendations: recommendations.map((r, index) => ({
      rank: index + 1,
      product: r.product,
      deal: r.deal,
      score: r.score,
      requirementMatch: r.reqMatches,
      explanation: `Matches your requested budget${parsed.category ? ` and ${parsed.category} category` : ''}. ${r.reqMatches.length > 0 ? `Satisfies requirements: ${r.reqMatches.join(', ')}.` : ''}`
    }))
  };
}
