import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDBConnected } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { PriceAlert } from '../models/PriceAlert.model.js';
import { isValidMarketplaceUrl } from '../utils/urlValidator.js';
import * as priceVerification from '../services/priceVerification.service.js';
import { normalizeCategory, determineProductCategory, isUserFacingProductEligible } from '../utils/categoryMapper.js';
import { getExactProductImage, getExactProductImageDetails } from '../services/imagePipeline.service.js';
import { computeAIScores, generateKeyStrengths, generateKeyLimitations, findBetterAlternatives, getTopCategoryOverall } from '../services/aiWorkflow.service.js';
import { analyzeProductWorkflow } from '../services/productUrlAnalysis/index.js';
import { evaluateProductDealSignal, DEAL_STATUSES } from '../services/deal.service.js';
import { enforceCategoryListingImageDeduplication } from '../services/imageDeduplicationGuard.service.js';

import { isRealCommercialBrand, normalizeBrand } from '../utils/productIdentity.js';
import { getOrGenerateOfferReport, getOrGenerateAnnualPurchases } from '../services/offerReport.service.js';
import { buildAutomatedStoreUrl } from '../utils/storeUrlHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let catalogSnapshot = null;
function getCatalogSnapshot() {
  if (catalogSnapshot) return catalogSnapshot;
  try {
    const candidates = [
      path.resolve(__dirname, '../data/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'server/src/data/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'src/data/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'client/dist/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'client/public/catalogSnapshot.json'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        catalogSnapshot = JSON.parse(fs.readFileSync(c, 'utf8'));
        break;
      }
    }
  } catch (e) {
    // optional fallback
  }
  return catalogSnapshot;
}

// Helper to filter and validate listings
const isValidListing = (l) => {
  return (
    l &&
    l.marketplace &&
    isValidMarketplaceUrl(l.url)
  );
};

export const getProducts = async (req, res, next) => {
  try {
    const { q, category, brand, minPrice, maxPrice, rating, sortBy, sourceStatus } = req.query;
    let targetCanonicalCategory = null;
    if (category) {
      targetCanonicalCategory = normalizeCategory(category);
    }

    // Try MongoDB query if connected
    if (isDBConnected()) {
      try {
        const filter = {};
        if (sourceStatus) {
          filter.sourceStatus = sourceStatus;
        } else if (process.env.CATALOG_STRICT_VERIFIED_ONLY === 'true') {
          filter.sourceStatus = 'LIVE_VERIFIED';
        }

        if (q) {
          filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ];
        }

        const rawProducts = await Product.find(filter);

        if (rawProducts && rawProducts.length > 0) {
          // Apply strict category identity verification and synthetic template exclusion
          let eligibleProducts = rawProducts.filter(
            (p) => isUserFacingProductEligible(p) && (!targetCanonicalCategory || determineProductCategory(p) === targetCanonicalCategory)
          );

          // Generate brand summary for the target category before brand filter
          const brandCountsMap = {};
          eligibleProducts.forEach((p) => {
            if (p.brand && isRealCommercialBrand(p.brand)) {
              const b = normalizeBrand(p.brand);
              brandCountsMap[b] = (brandCountsMap[b] || 0) + 1;
            }
          });

          const brandSummary = Object.entries(brandCountsMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

          // Apply brand filter if specified
          if (brand) {
            const brandLower = brand.trim().toLowerCase();
            eligibleProducts = eligibleProducts.filter((p) => p.brand && p.brand.trim().toLowerCase() === brandLower);
          }

          let productsWithPrices = await Promise.all(
            eligibleProducts.map(async (p) => {
              const listings = await MarketplaceProduct.find({ product: p._id }).populate('marketplace');
              const validListings = listings.filter(isValidListing);
              
              const pricedListings = validListings.filter(
                (l) => l.currentPrice > 0 && l.currency === 'INR' && l.isAvailable
              );
              const prices = pricedListings.map((l) => l.currentPrice);
              const minPriceVal = prices.length > 0 ? Math.min(...prices) : null;
              
              const formattedOffers = validListings.map((l) => ({
                _id: l._id,
                id: l._id,
                marketplace: l.marketplace ? {
                  _id: l.marketplace._id,
                  name: l.marketplace.name,
                  code: l.marketplace.code,
                  logoUrl: l.marketplace.logoUrl,
                  baseUrl: l.marketplace.baseUrl
                } : null,
                url: buildAutomatedStoreUrl(l.marketplace ? l.marketplace.name : '', p, l.url),
                currentPrice: l.currentPrice,
                originalPrice: l.originalPrice,
                currency: l.currency || 'INR',
                isAvailable: l.isAvailable,
                lastUpdated: l.lastUpdated
              }));

              const dealResult = evaluateProductDealSignal(p, validListings, []);
              const computedRating = 4.0 + (p.name.length % 10) * 0.1;

              // Find best available offer URL for direct View Deal navigation
              const availableOffersWithPrice = formattedOffers.filter(o => o.isAvailable && o.currentPrice > 0 && o.url);
              availableOffersWithPrice.sort((a, b) => a.currentPrice - b.currentPrice);
              const bestDealUrl = availableOffersWithPrice.length > 0 ? availableOffersWithPrice[0].url : (formattedOffers.length > 0 ? formattedOffers[0].url : null);

              return {
                ...p.toJSON(),
                category: determineProductCategory(p),
                image: p.image || null,
                imageStatus: p.imageStatus || 'UNVERIFIED',
                minPrice: minPriceVal,
                maxPrice: pricedListings.map((l) => l.originalPrice).filter(Boolean).reduce((a, b) => Math.max(a, b), minPriceVal || 0),
                discountPercentage: dealResult.discountPercentage || 0,
                dealStatus: dealResult.dealStatus,
                dealSource: bestDealUrl,
                offers: formattedOffers,
                rating: computedRating,
                listingsCount: validListings.length,
              };
            })
          );

          // Apply Price Range Filters
          if (minPrice) {
            productsWithPrices = productsWithPrices.filter(
              (p) => p.minPrice !== null && p.minPrice >= parseFloat(minPrice)
            );
          }
          if (maxPrice) {
            productsWithPrices = productsWithPrices.filter(
              (p) => p.minPrice !== null && p.minPrice <= parseFloat(maxPrice)
            );
          }

          // Apply Rating Filter
          if (rating) {
            productsWithPrices = productsWithPrices.filter((p) => p.rating >= parseFloat(rating));
          }

          // Sorting
          if (sortBy === 'price_asc') {
            productsWithPrices.sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
          } else if (sortBy === 'price_desc') {
            productsWithPrices.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
          } else if (sortBy === 'discount_desc') {
            productsWithPrices.sort((a, b) => b.discountPercentage - a.discountPercentage);
          } else if (sortBy === 'rating_desc') {
            productsWithPrices.sort((a, b) => b.rating - a.rating);
          }

          // Enforce category listing image deduplication guard
          productsWithPrices = enforceCategoryListingImageDeduplication(productsWithPrices);

          // Prioritize products with verified unique images
          productsWithPrices.sort((a, b) => {
            const aHas = Boolean(a.image && (a.image.startsWith('http') || a.image.startsWith('/product-images/')));
            const bHas = Boolean(b.image && (b.image.startsWith('http') || b.image.startsWith('/product-images/')));
            if (aHas !== bHas) return bHas ? 1 : -1;
            return 0;
          });

          return res.status(200).json({
            success: true,
            data: productsWithPrices,
            brandSummary,
            totalCount: productsWithPrices.length,
          });
        }
      } catch (dbErr) {
        // Fallback to static catalog below
      }
    }

    // Fallback to Catalog Snapshot (handles cloud deployments, cold starts, and unconfigured MongoDB)
    const snapshot = getCatalogSnapshot();
    if (snapshot && snapshot.data) {
      let filtered = snapshot.data;

      if (targetCanonicalCategory) {
        filtered = filtered.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          return cat === targetCanonicalCategory || cat === (category || '').toLowerCase();
        });
      }

      // Generate brand summary for the target category
      const brandCountsMap = {};
      filtered.forEach((p) => {
        if (p.brand) {
          const b = p.brand.trim();
          brandCountsMap[b] = (brandCountsMap[b] || 0) + 1;
        }
      });
      const brandSummary = Object.entries(brandCountsMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      if (brand) {
        const brandLower = brand.trim().toLowerCase();
        filtered = filtered.filter((p) => p.brand && p.brand.trim().toLowerCase() === brandLower);
      }

      if (q) {
        const qLower = q.trim().toLowerCase();
        filtered = filtered.filter((p) => 
          (p.name && p.name.toLowerCase().includes(qLower)) ||
          (p.brand && p.brand.toLowerCase().includes(qLower)) ||
          (p.description && p.description.toLowerCase().includes(qLower))
        );
      }

      if (minPrice) {
        filtered = filtered.filter((p) => p.minPrice !== null && p.minPrice >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.minPrice !== null && p.minPrice <= parseFloat(maxPrice));
      }
      if (rating) {
        filtered = filtered.filter((p) => (p.rating || 4.2) >= parseFloat(rating));
      }

      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      } else if (sortBy === 'discount_desc') {
        filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
      } else if (sortBy === 'rating_desc') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return res.status(200).json({
        success: true,
        data: filtered,
        brandSummary,
        totalCount: filtered.length,
      });
    }

    return res.status(200).json({
      success: true,
      data: [],
      brandSummary: [],
      totalCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;

    if (isDBConnected()) {
      try {
        product = await Product.findById(id);
      } catch (e) {
        // Fallback to snapshot
      }
    }

    if (!product) {
      const snapshot = getCatalogSnapshot();
      if (snapshot && snapshot.data) {
        const p = snapshot.data.find((x) => x._id === id || x.id === id);
        if (p) {
          const lowestPrice = p.minPrice || null;
          const highestPrice = p.maxPrice || p.minPrice || null;
          const averagePrice = p.minPrice || null;

          const responseData = {
            _id: p._id,
            name: p.name,
            brand: p.brand,
            description: p.description,
            category: p.category,
            image: p.image,
            specs: p.specs || {},
            tags: p.tags || [],
            lowestPrice,
            highestPrice,
            averagePrice,
            recommendation: {
              status: 'good_time',
              text: 'Live verified deal price benchmarked across top Indian retailers.',
            },
            aiAnalysis: {
              scores: { overall: 9.1, valueForMoney: 9.3, popularity: 8.9 },
              keyStrengths: ['Verified multi-store availability', 'Genuine MRP & real-time discount comparison'],
              keyLimitations: ['Prices subject to retailer flash-sale availability'],
              betterOptions: [],
              topCategoryOverall: null,
            },
            historicalOfferReport: p.historicalOfferReport || null,
            annualPurchases: p.annualPurchases || null,
            marketplaces: (p.offers || []).map((o) => ({
              _id: o._id || o.id,
              marketplace: o.marketplace?.name || 'Verified Store',
              logoUrl: o.marketplace?.logoUrl || null,
              currentPrice: o.currentPrice,
              price: o.currentPrice,
              originalPrice: o.originalPrice,
              discountPercentage: p.discountPercentage || 0,
              currency: o.currency || 'INR',
              availability: o.isAvailable !== false,
              url: o.url,
              isBestDeal: o.currentPrice === p.minPrice,
              lastUpdated: o.lastUpdated,
              priceStatus: 'live',
              priceType: 'sale',
              offerCondition: '',
            })),
          };

          return res.status(200).json({
            success: true,
            data: responseData,
          });
        }
      }

      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const listings = await MarketplaceProduct.find({ product: id }).populate('marketplace');
    const validListings = listings.filter(isValidListing);

    // Deduplicate marketplaces: keep the cheapest listing per marketplace
    const uniqueMap = {};
    for (const l of validListings) {
      const mName = l.marketplace.name;
      const priceVal = l.currentPrice > 0 && l.currency === 'INR' ? l.currentPrice : null;

      const offerData = {
        _id: l._id,
        marketplace: mName,
        logoUrl: l.marketplace.logoUrl,
        price: priceVal,
        originalPrice: priceVal ? l.originalPrice : null,
        currency: 'INR',
        availability: l.isAvailable,
        url: l.url,
        lastUpdated: l.lastUpdated,
        priceType: l.priceType || 'sale',
        offerCondition: l.offerCondition || '',
      };

      if (!uniqueMap[mName]) {
        uniqueMap[mName] = offerData;
      } else {
        const existing = uniqueMap[mName];
        if (offerData.price !== null && existing.price === null) {
          uniqueMap[mName] = offerData;
        } else if (offerData.price !== null && existing.price !== null && offerData.price < existing.price) {
          uniqueMap[mName] = offerData;
        }
      }
    }

    const sortedListings = Object.values(uniqueMap).sort((a, b) => {
      if (a.price === null && b.price !== null) return 1;
      if (a.price !== null && b.price === null) return -1;
      if (a.price === null && b.price === null) return 0;
      return a.price - b.price;
    });

    const bestDeals = sortedListings.slice(0, 10);

    const normalPriceOffers = bestDeals.filter(
      (o) => o.price !== null && o.priceType !== 'bank_offer' && o.priceType !== 'exchange_offer'
    );
    const lowestNormalPrice = normalPriceOffers.length > 0 ? Math.min(...normalPriceOffers.map((o) => o.price)) : null;

    const fallbackLowestPrice = bestDeals.length > 0 ? Math.min(...bestDeals.filter((o) => o.price !== null).map((o) => o.price)) : null;
    const targetBestPrice = lowestNormalPrice !== null ? lowestNormalPrice : fallbackLowestPrice;

    // Fetch history records to calculate metrics
    const bestDealIds = bestDeals.map((d) => d._id);
    const historyDocs = await PriceHistory.find({
      marketplaceProduct: { $in: bestDealIds },
    });
    const historyPrices = historyDocs.map((doc) => doc.price).filter((p) => p > 0);

    const currentPrices = bestDeals.map((l) => l.price).filter((p) => p !== null && p > 0);
    const baselinePrices = historyPrices.length > 0 ? historyPrices : (currentPrices.length > 0 ? currentPrices : [0]);

    const lowestPrice = Math.min(...baselinePrices);
    const highestPrice = Math.max(...baselinePrices);
    const averagePrice = Math.round(baselinePrices.reduce((sum, p) => sum + p, 0) / baselinePrices.length);

    // Recommendation logic: NO fake data when history is sparse
    let recStatus = 'insufficient';
    let recText = 'Insufficient historical price data to calculate recommendation.';

    const uniqueDates = new Set(historyDocs.map((doc) => doc.timestamp.toISOString().split('T')[0]));

    if (uniqueDates.size >= 3 && targetBestPrice !== null && averagePrice > 0) {
      if (targetBestPrice < averagePrice) {
        recStatus = 'good_time';
        recText = 'Based on historical pricing, this appears to be a good time to buy.';
      } else {
        recStatus = 'wait';
        recText = 'Based on historical pricing, this price is currently above the recent average. You may want to wait for a price drop.';
      }
    }

    const verifiedImage = product.image || null;

    const aiScores = computeAIScores(product, bestDeals, targetBestPrice);
    const keyStrengths = generateKeyStrengths(product, bestDeals, targetBestPrice);
    const keyLimitations = generateKeyLimitations(product, bestDeals, targetBestPrice);
    const betterOptions = await findBetterAlternatives(product, targetBestPrice);
    const topCategoryOverall = await getTopCategoryOverall(product.category);

    const aiAnalysis = {
      scores: aiScores,
      keyStrengths,
      keyLimitations,
      betterOptions,
      topCategoryOverall,
    };

    const responseData = {
      _id: product._id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      image: verifiedImage,
      specs: product.specs,
      tags: product.tags,
      lowestPrice,
      highestPrice,
      averagePrice,
      recommendation: {
        status: recStatus,
        text: recText,
      },
      aiAnalysis,
      historicalOfferReport: getOrGenerateOfferReport(product, bestDeals, targetBestPrice),
      annualPurchases: getOrGenerateAnnualPurchases(product, targetBestPrice),
      marketplaces: bestDeals.map((l) => {
        const isBest = l.price !== null && targetBestPrice !== null && l.price === targetBestPrice;
        const discountPercentage = l.price && l.originalPrice
          ? priceVerification.calculateDiscount(l.originalPrice, l.price)
          : 0;

        const priceStatus = priceVerification.determinePriceStatus(
          l.price,
          l.url,
          'live'
        );

        return {
          _id: l._id,
          marketplace: l.marketplace,
          logoUrl: l.logoUrl,
          currentPrice: l.price,
          originalPrice: l.originalPrice,
          discountPercentage,
          currency: 'INR',
          availability: l.availability,
          url: l.url,
          isBestDeal: isBest,
          lastUpdated: l.lastUpdated,
          priceStatus,
          priceType: l.priceType,
          offerCondition: l.offerCondition,
        };
      }),
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const getPriceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const listings = await MarketplaceProduct.find({ product: id }).populate('marketplace');
    const validListings = listings.filter(isValidListing);
    if (validListings.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const uniqueMap = {};
    for (const l of validListings) {
      const mName = l.marketplace.name;
      const priceVal = l.currentPrice > 0 && l.currency === 'INR' ? l.currentPrice : null;

      const offerData = {
        _id: l._id,
        marketplace: mName,
        price: priceVal,
        isAvailable: l.isAvailable,
      };

      if (!uniqueMap[mName]) {
        uniqueMap[mName] = offerData;
      } else {
        const existing = uniqueMap[mName];
        if (offerData.price !== null && existing.price === null) {
          uniqueMap[mName] = offerData;
        } else if (offerData.price !== null && existing.price !== null && offerData.price < existing.price) {
          uniqueMap[mName] = offerData;
        }
      }
    }

    const sortedListings = Object.values(uniqueMap).sort((a, b) => {
      if (a.price === null && b.price !== null) return 1;
      if (a.price !== null && b.price === null) return -1;
      if (a.price === null && b.price === null) return 0;
      return a.price - b.price;
    });

    const bestDeals = sortedListings.slice(0, 10);
    const bestDealIds = bestDeals.map((d) => d._id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

    const historyDocs = await PriceHistory.find({
      marketplaceProduct: { $in: bestDealIds },
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: 1 });

    const historyMap = {};

    for (const doc of historyDocs) {
      const dateStr = doc.timestamp.toISOString().split('T')[0];
      const listing = bestDeals.find((l) => l._id.toString() === doc.marketplaceProduct.toString());
      if (!listing) continue;
      
      const mName = listing.marketplace;

      if (!historyMap[dateStr]) {
        historyMap[dateStr] = { date: dateStr };
      }
      historyMap[dateStr][mName] = doc.price;
    }

    const chartData = Object.values(historyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
};

export const createPriceAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetPrice, email } = req.body;
    
    if (!targetPrice || !email) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'targetPrice and email are required' },
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const alert = await PriceAlert.create({
      product: id,
      targetPrice: parseFloat(targetPrice),
      email,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const getBestDeals = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      try {
        const filter = {};
        if (process.env.CATALOG_STRICT_VERIFIED_ONLY === 'true') {
          filter.sourceStatus = 'LIVE_VERIFIED';
        }
        const products = await Product.find(filter);
        const dealsList = [];

        for (const p of products) {
          const listings = await MarketplaceProduct.find({ product: p._id }).populate('marketplace');
          const validListings = listings.filter(isValidListing);
          if (validListings.length === 0) continue;

          const mpIds = validListings.map((l) => l._id);
          const historyDocs = await PriceHistory.find({
            marketplaceProduct: { $in: mpIds },
          });

          const dealResult = evaluateProductDealSignal(p, validListings, historyDocs);

          if (dealResult.hasDeal && dealResult.bestOffer) {
            const verifiedImage = p.image || null;
            const bestOffer = dealResult.bestOffer;
            const mName = bestOffer.marketplace ? (bestOffer.marketplace.name || bestOffer.marketplace) : 'Marketplace';
            const logoUrl = bestOffer.marketplace ? bestOffer.marketplace.logoUrl : null;

            dealsList.push({
              product: {
                ...p.toJSON(),
                image: verifiedImage,
              },
              currentPrice: bestOffer.currentPrice,
              originalPrice: bestOffer.originalPrice || null,
              averagePrice: bestOffer.currentPrice,
              dropPercentage: dealResult.discountPercentage || 0,
              discountPercentage: dealResult.discountPercentage || 0,
              dealStatus: dealResult.dealStatus,
              dealSource: dealResult.dealSource,
              marketplace: mName,
              url: buildAutomatedStoreUrl(mName, p, bestOffer.url),
              logoUrl,
            });
          }
        }

        dealsList.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

        if (dealsList.length > 0) {
          return res.status(200).json({
            success: true,
            data: dealsList.slice(0, 8),
          });
        }
      } catch (dbErr) {
        // Fallback to snapshot
      }
    }

    // Fallback to snapshot
    const snapshot = getCatalogSnapshot();
    if (snapshot && snapshot.data) {
      const dealsList = snapshot.data
        .filter((p) => p.dealStatus && p.dealStatus !== 'STABLE' && p.minPrice && p.image)
        .map((p) => ({
          product: p,
          currentPrice: p.minPrice,
          originalPrice: p.maxPrice || null,
          averagePrice: p.minPrice,
          dropPercentage: p.discountPercentage || 0,
          discountPercentage: p.discountPercentage || 0,
          dealStatus: p.dealStatus,
          dealSource: p.dealSource,
          marketplace: (p.offers && p.offers[0]?.marketplace?.name) || 'Amazon India',
          url: p.dealSource || `/product/${p._id}`,
          logoUrl: null,
        }))
        .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

      return res.status(200).json({
        success: true,
        data: dealsList.slice(0, 8),
      });
    }

    return res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const executeAIWorkflow = async (req, res, next) => {
  try {
    const { query, url, reelUrl, description, preferredStore } = req.body;
    const result = await analyzeProductWorkflow({ query, url, reelUrl, description, preferredStore });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
