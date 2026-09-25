import { cacheClient } from '../config/redis.js';
import { logger } from '../config/logger.js';
import * as aiService from './ai.service.js';
import * as webSearchService from './webSearch.service.js';
import * as priceVerification from './priceVerification.service.js';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

const CACHE_TTL_SECONDS = 300;

export async function performAISearch(query) {
  // India-First Cache Key format
  const cacheKey = `search:IN:INR:${Buffer.from(query).toString('base64')}`;

  // 1. Check Cache
  try {
    const cached = await cacheClient.get(cacheKey);
    if (cached) {
      logger.info({ query }, 'Cache hit for India-First AI search');
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to query Redis cache');
  }

  const startTime = Date.now();

  // 2. AI Query Understanding
  let interpretedQuery;
  try {
    interpretedQuery = await aiService.understandQuery(query);
  } catch (err) {
    logger.error({ err }, 'AI Query understanding failed');
    interpretedQuery = {};
  }

  // Force India-First defaults
  interpretedQuery.country = 'India';
  interpretedQuery.currency = 'INR';

  // 3. Real-Time Web Search
  let searchResults = [];
  try {
    searchResults = await webSearchService.searchProducts(query, interpretedQuery);
  } catch (err) {
    logger.error({ err }, 'Real-time search provider failed');
  }

  if (searchResults.length === 0) {
    return {
      query,
      interpretedQuery,
      results: [],
      totalResults: 0,
      sources: [],
      realTime: true,
      message: 'No verified Indian prices are currently available.',
    };
  }

  const processedResults = [];
  const allSources = new Set();

  for (const group of searchResults) {
    const normalizedProduct = aiService.normalizeProduct(group.product);

    // Save/update product in MongoDB
    let dbProduct = await Product.findOne({
      name: normalizedProduct.name,
      brand: normalizedProduct.brand,
    });

    if (!dbProduct) {
      dbProduct = await Product.create({
        name: normalizedProduct.name,
        brand: normalizedProduct.brand,
        description: group.product.description || '',
        category: normalizedProduct.category,
        image: normalizedProduct.image,
        specs: normalizedProduct.specifications,
        tags: [normalizedProduct.brand.toLowerCase()],
      });
    } else {
      const currentSpecs = dbProduct.specs ? (typeof dbProduct.specs.toJSON === 'function' ? dbProduct.specs.toJSON() : dbProduct.specs) : {};
      dbProduct.specs = { ...currentSpecs, ...normalizedProduct.specifications };
      if (normalizedProduct.image) dbProduct.image = normalizedProduct.image;
      await dbProduct.save();
    }

    // Process & rank offers
    const rankedOffers = aiService.rankProducts(group.offers, interpretedQuery);

    // Filter, validate and deduplicate by marketplace name
    const uniqueOffersMap = {};
    for (const offer of rankedOffers) {
      if (!priceVerification.verifyUrl(offer.url)) continue;

      const mName = offer.marketplace;
      const isPriceValid = priceVerification.verifyPrice(offer.price) && priceVerification.verifyCurrency(offer.currency);
      
      const priceStatus = priceVerification.determinePriceStatus(
        offer.price,
        offer.url,
        offer.priceStatus || 'live'
      );

      const discountPercentage = isPriceValid
        ? priceVerification.calculateDiscount(offer.originalPrice, offer.price)
        : 0;

      const offerData = {
        marketplace: mName,
        logoUrl: offer.logoUrl || null,
        price: isPriceValid ? offer.price : null,
        originalPrice: isPriceValid ? offer.originalPrice : null,
        discountPercentage: discountPercentage,
        currency: 'INR',
        availability: offer.availability,
        url: offer.url,
        seller: offer.seller || '',
        priceStatus: priceStatus,
        isBestDeal: false,
        priceType: offer.priceType || (isPriceValid ? 'sale' : 'unknown'),
        offerCondition: offer.offerCondition || '',
      };

      if (!uniqueOffersMap[mName]) {
        uniqueOffersMap[mName] = offerData;
      } else {
        const existing = uniqueOffersMap[mName];
        if (offerData.price !== null && existing.price === null) {
          uniqueOffersMap[mName] = offerData;
        } else if (offerData.price !== null && existing.price !== null && offerData.price < existing.price) {
          uniqueOffersMap[mName] = offerData;
        }
      }
    }

    // Sort: verified prices first ascending, null prices at the end
    const sortedOffers = Object.values(uniqueOffersMap).sort((a, b) => {
      if (a.price === null && b.price !== null) return 1;
      if (a.price !== null && b.price === null) return -1;
      if (a.price === null && b.price === null) return 0;
      return a.price - b.price;
    });

    const topOffers = sortedOffers.slice(0, 10);

    // Best Deal Logic: Cheaper verified normal price gets isBestDeal: true
    const normalPriceOffers = topOffers.filter(
      (o) => o.price !== null && o.priceType !== 'bank_offer' && o.priceType !== 'exchange_offer'
    );
    const lowestNormalPrice = normalPriceOffers.length > 0 ? Math.min(...normalPriceOffers.map((o) => o.price)) : null;

    const fallbackLowestPrice = topOffers.length > 0 ? Math.min(...topOffers.filter((o) => o.price !== null).map((o) => o.price)) : null;
    const targetBestPrice = lowestNormalPrice !== null ? lowestNormalPrice : fallbackLowestPrice;

    for (const offer of topOffers) {
      if (offer.price !== null && targetBestPrice !== null && offer.price === targetBestPrice) {
        offer.isBestDeal = true;
      }
    }

    // Write to MongoDB cache and PriceHistory for valid offers
    for (const offer of topOffers) {
      allSources.add(offer.marketplace);

      let dbMarketplace = await Marketplace.findOne({
        name: { $regex: new RegExp(`^${offer.marketplace}$`, 'i') },
      });
      if (!dbMarketplace) {
        dbMarketplace = await Marketplace.create({
          name: offer.marketplace,
          code: offer.marketplace.toLowerCase().replace(/[^a-z0-9]/g, ''),
          logoUrl: offer.logoUrl || null,
          baseUrl: new URL(offer.url).origin,
        });
      }

      let dbMP = await MarketplaceProduct.findOne({
        product: dbProduct._id,
        marketplace: dbMarketplace._id,
      });

      if (dbMP) {
        if (offer.price !== null) {
          dbMP.currentPrice = offer.price;
          dbMP.originalPrice = offer.originalPrice || null;
        }
        dbMP.isAvailable = offer.availability;
        dbMP.url = offer.url;
        dbMP.lastUpdated = new Date();
        await dbMP.save();
      } else {
        dbMP = await MarketplaceProduct.create({
          product: dbProduct._id,
          marketplace: dbMarketplace._id,
          url: offer.url,
          currentPrice: offer.price || 0,
          originalPrice: offer.originalPrice || null,
          currency: 'INR',
          isAvailable: offer.availability,
          lastUpdated: new Date(),
        });
      }

      if (offer.price !== null) {
        await PriceHistory.create({
          marketplaceProduct: dbMP._id,
          price: offer.price,
          timestamp: new Date(),
        });
      }
    }

    const bestOffer = topOffers.find((o) => o.isBestDeal);
    const bestPrice = bestOffer
      ? {
          amount: bestOffer.price,
          currency: 'INR',
          marketplace: bestOffer.marketplace,
          url: bestOffer.url,
        }
      : null;

    processedResults.push({
      product: {
        _id: dbProduct._id,
        ...normalizedProduct,
        description: dbProduct.description,
      },
      bestPrice,
      offers: topOffers,
      sourceCount: topOffers.length,
      lastUpdated: new Date().toISOString(),
      realTime: true,
      dealExplanation: bestOffer ? bestOffer.explanation : '',
    });
  }

  const searchDuration = Date.now() - startTime;
  logger.info(
    {
      query,
      resultsCount: processedResults.length,
      sourcesCount: allSources.size,
      durationMs: searchDuration,
    },
    'AI Search pipeline completed'
  );

  const response = {
    query,
    interpretedQuery,
    results: processedResults,
    totalResults: processedResults.length,
    sources: Array.from(allSources),
    realTime: true,
  };

  try {
    await cacheClient.set(cacheKey, JSON.stringify(response), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    logger.warn({ err }, 'Failed to cache search results to Redis');
  }

  return response;
}
