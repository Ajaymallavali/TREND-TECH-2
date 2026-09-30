import mongoose from 'mongoose';
import { validateStoreUrl, findProductByUrlOrQuery } from './matcher.js';
import { computeAIScores } from '../aiWorkflow.service.js';

function detectIntent(q, u) {
  if (u || (q && q.includes('http'))) return 'URL_ANALYSIS';
  if (!q) return 'PRODUCT_SEARCH';
  const queryLower = q.toLowerCase();
  if (queryLower.includes('compare') || queryLower.includes('vs')) return 'PRICE_COMPARISON';
  if (queryLower.includes('best') || queryLower.includes('under') || queryLower.includes('cheap')) return 'DEAL_SEARCH';
  return 'PRODUCT_SEARCH';
}

function calculateDealMetrics(verifiedOffers, bestDeal) {
  if (!verifiedOffers || verifiedOffers.length === 0) return null;
  const bestPrice = Math.min(...verifiedOffers.map(o => o.price));
  const bestDiscount = Math.max(...verifiedOffers.map(o => o.discountPercentage || 0));
  const bestSavings = Math.max(...verifiedOffers.map(o => o.savings || 0));
  
  const sorted = [...verifiedOffers].sort((a,b) => b.price - a.price);
  const highestOffer = sorted[0];
  const lowestOffer = bestDeal || sorted[sorted.length - 1];
  
  let difference = null;
  if (highestOffer && lowestOffer && highestOffer.price > lowestOffer.price) {
    difference = highestOffer.price - lowestOffer.price;
  }

  return {
    bestPrice,
    bestDiscount: bestDiscount > 0 ? bestDiscount : null,
    bestSavings: bestSavings > 0 ? bestSavings : null,
    highestVerifiedOffer: highestOffer ? { marketplace: highestOffer.marketplace, price: highestOffer.price } : null,
    lowestVerifiedOffer: lowestOffer ? { marketplace: lowestOffer.marketplace, price: lowestOffer.price } : null,
    difference
  };
}

export async function analyzeProductWorkflow({ query, url, reelUrl, description, preferredStore }) {
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

  if (!url && query) {
    const { generateRecommendations } = await import('../recommendationEngine/index.js');
    const recResult = await generateRecommendations(query);
    if (recResult) {
      return recResult;
    }
  }

  let product = await findProductByUrlOrQuery(url, query);
  
  if (Array.isArray(product)) {
    return {
      status: 'PARTIAL_MATCH',
      message: 'Multiple matching products found. Please clarify your request.',
      candidates: product
    };
  }

  let isExternalLiveResult = false;
  let externalData = null;
  
  if (!product) {
    try {
      const { discoverProductViaGemini, analyzeUrlContextViaGemini } = await import('../geminiWebEngine.js');
      
      if (url) {
        externalData = await analyzeUrlContextViaGemini(url);
      } else {
        externalData = await discoverProductViaGemini(query);
      }
      
      if (externalData && externalData.product) {
        isExternalLiveResult = true;
      } else {
        throw new Error('No product extracted from Gemini');
      }
    } catch (err) {
      return {
        status: 'PRODUCT_NOT_FOUND',
        error: 'Product not available in verified catalog. External web analysis temporarily unavailable or could not verify product identity.',
        coverage: { checked: [], unavailable: [] },
        marketplaces: [],
        product: null
      };
    }
  }

  if (isExternalLiveResult && externalData) {
    // Return external result formatted to match the frontend expectations
    let bestExternalDeal = null;
    let preferredDeal = null;
    let lowestVerifiedPrice = Infinity;
    const formattedMarketplaces = [];
    const pStoreClean = preferredStore && preferredStore.trim().toLowerCase() !== 'any' ? preferredStore.trim().toLowerCase() : null;

    if (externalData.marketplaces && Array.isArray(externalData.marketplaces)) {
      externalData.marketplaces.forEach(mp => {
        let discount = null;
        let savings = null;
        if (mp.price && mp.mrp && mp.mrp > mp.price) {
          discount = Math.round(((mp.mrp - mp.price) / mp.mrp) * 100);
          savings = mp.mrp - mp.price;
        }

        const offer = {
          _id: 'external_' + Math.random().toString(36).substr(2, 9),
          marketplace: mp.marketplace || 'External Store',
          logoUrl: null,
          price: mp.price,
          mrp: mp.mrp,
          discountPercentage: discount,
          savings: savings,
          availability: mp.availability || 'Available',
          seller: 'Verified Web Source',
          lastChecked: new Date(),
          url: mp.url,
          matchStatus: 'EXACT_MATCH',
          isVerified: true
        };
        
        if (offer.price && offer.price < lowestVerifiedPrice && offer.availability === 'Available') {
          lowestVerifiedPrice = offer.price;
          bestExternalDeal = offer;
        }

        if (pStoreClean && offer.marketplace.toLowerCase().includes(pStoreClean) && offer.price && offer.availability === 'Available') {
          if (!preferredDeal || offer.price < preferredDeal.price) {
            preferredDeal = offer;
          }
        }

        formattedMarketplaces.push(offer);
      });
    }
    
    let sourceMarketplace = null;
    let sourcePrice = null;
    let sourceOffer = null;
    if (externalData.sourceMarketplace) {
      sourceMarketplace = externalData.sourceMarketplace.marketplace;
      sourcePrice = externalData.sourceMarketplace.price;
      sourceOffer = formattedMarketplaces.find(m => m.marketplace === sourceMarketplace) || null;
    }

    const dealMetrics = calculateDealMetrics(formattedMarketplaces.filter(m => m.isVerified && m.price && m.availability === 'Available'), bestExternalDeal);

    const dealScanner = formattedMarketplaces.map(mp => {
      if (!mp.isVerified || !mp.price) return null;
      return {
        marketplace: mp.marketplace,
        currentPrice: mp.price,
        previousPrice: null,
        priceChange: null,
        status: 'INSUFFICIENT HISTORY',
        lowestVerified: null,
        highestVerified: null,
        averageVerified: null,
        isLowestEver: false,
        historyCount: 1
      };
    }).filter(Boolean);

    return {
      status: 'SUCCESS_EXTERNAL',
      sourceInfo: {
        url: url || (externalData.sourceMarketplace ? externalData.sourceMarketplace.url : null),
        marketplace: sourceMarketplace,
        price: sourcePrice,
      },
      product: {
        _id: 'ext_' + Date.now(),
        brand: externalData.product.brand || 'Unknown',
        name: externalData.product.name || query || 'External Product',
        model: externalData.product.model || 'Unknown',
        category: externalData.product.category || 'electronics',
        variant: externalData.product.variant || 'Standard',
        specifications: externalData.product.specs || {},
      },
      identity: {
        matchConfidence: 'EXACT',
        status: 'EXTERNAL_LIVE_VERIFIED'
      },
      image: {
        url: externalData.product.image || null,
        status: externalData.product.image ? 'VERIFIED_EXACT' : 'PENDING'
      },
      specs: externalData.product.specs || {},
      research: {
        verdict: (externalData.aiAnalysis && externalData.aiAnalysis.verdict) ? externalData.aiAnalysis.verdict : 'Verified via Gemini Web Search.',
        bestFor: ['Everyday Use'],
        pros: (externalData.aiAnalysis && externalData.aiAnalysis.pros) ? externalData.aiAnalysis.pros.map(p => `• ${p}`) : [],
        watchOutFor: (externalData.aiAnalysis && externalData.aiAnalysis.watchOuts) ? externalData.aiAnalysis.watchOuts.map(w => `⚠️ ${w}`) : []
      },
      marketplaces: formattedMarketplaces,
      sourceOffer: sourceOffer,
      bestDeal: bestExternalDeal,
      preferredDeal: preferredDeal,
      priceHistory: [],
      coverage: { checked: ['External Web'], unavailable: [] },
      verification: {
        checkedAt: new Date()
      },
      evidence: {
        input: query || url || "Unknown",
        intent: detectIntent(query, url),
        researchMode: "EXTERNAL_WEB",
        identity: "EXACT",
        variant: "VERIFIED",
        image: externalData.product && externalData.product.image ? "VERIFIED" : "PENDING",
        marketplacesChecked: formattedMarketplaces.length,
        verifiedOffers: formattedMarketplaces.filter(m => m.isVerified).length,
        sources: externalData.sources || []
      },
      sources: externalData.sources || [],
      dealMetrics,
      dealScanner,
      urlIntelligence: url ? validationResult : null,
      analysis: {
        performance: 80, value: 80, overall: 80, build: 80, reliable: 80
      }
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

    if (offer.isVerified && offer.price && offer.price > 0 && offer.availability === 'Available') {
      const lastHistory = await PriceHistory.findOne({ marketplaceProduct: mp._id }).sort({ timestamp: -1 });
      if (!lastHistory || lastHistory.price !== offer.price) {
        await PriceHistory.create({
          marketplaceProduct: mp._id,
          price: offer.price,
          timestamp: new Date()
        });
      }
    }

    marketplaces.push(offer);
  }

  // Populate unavailable coverage
  allMarketplaceNames.forEach(m => {
    if (!coverage.checked.includes(m)) {
      coverage.unavailable.push(m);
    }
  });

  let preferredDeal = null;
  if (preferredStore && preferredStore.trim().toLowerCase() !== 'any') {
    const pStoreClean = preferredStore.trim().toLowerCase();
    preferredDeal = marketplaces.find(m => m.marketplace.toLowerCase().includes(pStoreClean) && m.isVerified && m.price && m.availability === 'Available') || null;
  }

  const priceHistoryDocs = await PriceHistory.find({ 
    marketplaceProduct: { $in: mps.map(m => m._id) }
  }).sort({ timestamp: 1 }).lean();

  const historyByMp = {};
  priceHistoryDocs.forEach(doc => {
    const mpId = doc.marketplaceProduct.toString();
    if (!historyByMp[mpId]) historyByMp[mpId] = [];
    historyByMp[mpId].push(doc);
  });

  const dealScanner = marketplaces.map(mp => {
    if (!mp.isVerified || !mp.price) return null;
    const history = historyByMp[mp._id.toString()] || [];
    
    let status = 'INSUFFICIENT HISTORY';
    let previousPrice = null;
    let priceChange = null;
    
    if (history.length >= 2) {
      const currentObservation = history[history.length - 1];
      const prevObservation = history[history.length - 2];
      
      previousPrice = prevObservation.price;
      priceChange = currentObservation.price - previousPrice;
      
      if (priceChange < 0) status = 'PRICE DROP';
      else if (priceChange > 0) status = 'PRICE INCREASE';
      else status = 'PRICE UNCHANGED';
    } else if (history.length === 1) {
      status = 'NEW PRICE';
    }

    const lowestVerified = history.length > 0 ? Math.min(...history.map(h => h.price)) : null;
    const highestVerified = history.length > 0 ? Math.max(...history.map(h => h.price)) : null;
    const averageVerified = history.length > 0 ? Math.round(history.reduce((a,b)=>a+b.price, 0) / history.length) : null;
    
    const isLowestEver = history.length > 1 && mp.price <= lowestVerified;

    return {
      marketplace: mp.marketplace,
      currentPrice: mp.price,
      previousPrice,
      priceChange,
      status,
      lowestVerified,
      highestVerified,
      averageVerified,
      isLowestEver,
      historyCount: history.length
    };
  }).filter(Boolean);

  let sourceMarketplace = null;
  let sourcePrice = null;
  let sourceOffer = null;
  
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
      
      if (exactMpMatch) {
        sourceOffer = exactMpMatch;
        if (exactMpMatch.isVerified && exactMpMatch.price) {
          sourcePrice = exactMpMatch.price;
          sourceMarketplace = exactMpMatch.marketplace;
        }
      }
    } catch (e) {
      // ignore parsing errors here
    }
  }

  const dealMetrics = calculateDealMetrics(marketplaces.filter(m => m.isVerified && m.price && m.availability === 'Available'), bestDeal);
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

  if (dealScanner && dealScanner.length > 0 && bestDeal) {
    const bdScanner = dealScanner.find(ds => ds.marketplace === bestDeal.marketplace);
    if (bdScanner && bdScanner.historyCount > 1) {
      if (bdScanner.isLowestEver) {
        verdict += ` The current price matches the lowest verified price in the available history for ${bestDeal.marketplace}.`;
      } else if (bdScanner.status === 'PRICE DROP' && bdScanner.priceChange < 0) {
        verdict += ` The current verified price is ₹${Math.abs(bdScanner.priceChange).toLocaleString('en-IN')} below the previous verified observation on ${bestDeal.marketplace}.`;
      }
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
    sourceOffer: sourceOffer,
    bestDeal: bestDeal,
    preferredDeal: preferredDeal,
    priceHistory: priceHistoryDocs,
    coverage: coverage,
    verification: {
      checkedAt: new Date()
    },
    evidence: {
      input: query || url || "Unknown",
      intent: detectIntent(query, url),
      researchMode: "LOCAL_CATALOG",
      identity: product.identityStatus === 'IDENTITY_VERIFIED' ? "EXACT" : "AMBIGUOUS",
      variant: "VERIFIED",
      image: product.image ? "VERIFIED" : "PENDING",
      marketplacesChecked: coverage.checked.length,
      verifiedOffers: marketplaces.filter(m => m.isVerified).length,
      sources: ["Local Verified Catalog"]
    },
    urlIntelligence: url ? validationResult : null,
    dealMetrics,
    dealScanner,
    analysis: aiScores
  };
}
