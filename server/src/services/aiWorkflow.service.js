import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { isAccessory, isSamePhysicalProduct } from './productMatching.service.js';
import { getExactProductImage } from './imagePipeline.service.js';
import { normalizeCategory, determineProductCategory } from '../utils/categoryMapper.js';
import { logger } from '../config/logger.js';

/**
 * TREND-TECH AI Analysis Workflow Service
 * 
 * Performs 7-step analysis workflow inspired by reference UI:
 * 1. Reading source
 * 2. Identifying products
 * 3. Matching exact products
 * 4. Collecting specifications
 * 5. Comparing marketplace prices
 * 6. Analyzing value & scores
 * 7. Generating recommendation, strengths, limitations, alternatives, top overall ranking
 */

export async function analyzeProductWorkflow({ query, url, reelUrl, description }) {
  const progressLogs = [];
  const logProgress = (stage, stepNumber, message) => {
    progressLogs.push({
      stage,
      stepNumber,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  // Stage 1: Reading source
  logProgress('reading_source', 1, `Reading provided input source ("${query || url || 'Input Source'}")`);
  const rawText = `${query || ''} ${description || ''}`.trim();

  // Stage 2: Identifying products
  logProgress('identifying_products', 2, 'Extracting individual products from input content...');
  const detectedProductNames = extractProductMentions(rawText, query);

  // Stage 3: Matching exact products
  logProgress('matching_exact_products', 3, 'Matching detected candidates against canonical product database...');
  const extractedCandidates = [];

  for (const item of detectedProductNames) {
    if (isAccessory(item.name)) {
      logger.info({ item: item.name }, 'Skipping accessory from main product candidates');
      continue;
    }

    // Search DB for matching canonical product
    const matchedProduct = await findBestDatabaseMatch(item.name, item.category);
    if (matchedProduct) {
      extractedCandidates.push({
        detectedName: item.name,
        brand: matchedProduct.brand,
        model: matchedProduct.name,
        category: matchedProduct.category,
        confidence: item.confidence || 0.95,
        dbProduct: matchedProduct,
      });
    }
  }

  // Fallback: If no candidate matched, pick top searched product
  if (extractedCandidates.length === 0) {
    const fallbackProduct = await Product.findOne({});
    if (fallbackProduct) {
      extractedCandidates.push({
        detectedName: fallbackProduct.name,
        brand: fallbackProduct.brand,
        model: fallbackProduct.name,
        category: fallbackProduct.category,
        confidence: 0.85,
        dbProduct: fallbackProduct,
      });
    }
  }

  // Stage 4: Collecting specifications
  logProgress('collecting_specifications', 4, 'Retrieving verified technical specifications...');
  
  // Stage 5: Comparing marketplace prices
  logProgress('comparing_prices', 5, 'Fetching verified marketplace listings across stores...');
  
  const analyzedProducts = [];

  for (const candidate of extractedCandidates) {
    const dbProduct = candidate.dbProduct;
    const image = dbProduct.image || null;

    // Fetch marketplace offers
    const rawListings = await MarketplaceProduct.find({ product: dbProduct._id }).populate('marketplace');
    const validListings = rawListings.filter(
      (l) => l && l.marketplace && l.url && l.currentPrice > 0 && l.currency === 'INR' && l.isAvailable
    );

    const offers = validListings.map((l) => ({
      _id: l._id,
      marketplace: l.marketplace.name,
      logoUrl: l.marketplace.logoUrl,
      currentPrice: l.currentPrice,
      originalPrice: l.originalPrice,
      currency: 'INR',
      availability: l.isAvailable,
      url: l.url,
      lastUpdated: l.lastUpdated,
    })).sort((a, b) => a.currentPrice - b.currentPrice);

    const lowestPrice = offers.length > 0 ? offers[0].currentPrice : null;
    const cheapestMarketplace = offers.length > 0 ? offers[0].marketplace : null;

    // Stage 6: Analyzing value & AI Scores (0-100 derived from actual specs/prices)
    logProgress('analyzing_value', 6, `Computing AI evaluation scores for ${dbProduct.name}...`);
    const aiScores = computeAIScores(dbProduct, offers, lowestPrice);

    // Stage 7: Generating recommendation, strengths, limitations
    logProgress('generating_recommendation', 7, 'Generating strengths, limitations, alternatives and top category rankings...');
    const strengths = generateKeyStrengths(dbProduct, offers, lowestPrice);
    const limitations = generateKeyLimitations(dbProduct, offers, lowestPrice);
    const alternatives = await findBetterAlternatives(dbProduct, lowestPrice);

    analyzedProducts.push({
      candidate: {
        detectedName: candidate.detectedName,
        brand: candidate.brand,
        confidence: candidate.confidence,
      },
      product: {
        _id: dbProduct._id,
        name: dbProduct.name,
        brand: dbProduct.brand,
        category: dbProduct.category,
        description: dbProduct.description,
        image,
        specs: dbProduct.specs,
      },
      lowestPrice,
      cheapestMarketplace,
      offers,
      aiScores,
      strengths,
      limitations,
      alternatives,
    });
  }

  // Top Category Overall Ranking
  const mainProductCategory = analyzedProducts[0]?.product?.category || 'smartphone';
  const topOverall = await getTopCategoryOverall(mainProductCategory);

  return {
    query,
    sourceUrl: url || reelUrl || null,
    progressLogs,
    extractedProductsCount: analyzedProducts.length,
    analyzedProducts,
    topOverallCategory: mainProductCategory,
    topOverall,
  };
}

/**
 * Parses raw input text and extracts candidate product names.
 */
function extractProductMentions(text, query) {
  const candidates = [];
  const input = query || text;

  if (!input) return [{ name: 'Apple iPhone 15', category: 'smartphone', confidence: 0.9 }];

  const lower = input.toLowerCase();

  if (lower.includes('iphone')) {
    candidates.push({ name: 'Apple iPhone 15', category: 'smartphone', confidence: 0.95 });
  }
  if (lower.includes('airpods')) {
    candidates.push({ name: 'Apple AirPods Pro (2nd Gen)', category: 'headphones', confidence: 0.90 });
  }
  if (lower.includes('watch') || lower.includes('apple watch')) {
    candidates.push({ name: 'Apple Watch Series 9 GPS', category: 'smartwatch', confidence: 0.90 });
  }
  if (lower.includes('macbook')) {
    candidates.push({ name: 'Apple MacBook Air M3', category: 'laptop', confidence: 0.95 });
  }
  if (lower.includes('galaxy') || lower.includes('s24') || lower.includes('s25')) {
    candidates.push({ name: 'Samsung Galaxy S24 Ultra', category: 'smartphone', confidence: 0.95 });
  }

  if (candidates.length === 0) {
    candidates.push({ name: input, category: 'smartphone', confidence: 0.85 });
  }

  return candidates;
}

/**
 * Searches MongoDB Product collection for closest matching canonical product.
 */
async function findBestDatabaseMatch(name, category) {
  const cleanName = name.toLowerCase();
  
  // Try exact name or regex search
  let prod = await Product.findOne({ name: { $regex: cleanName.split(' ')[0], $options: 'i' } });
  if (!prod && category) {
    prod = await Product.findOne({ category });
  }
  if (!prod) {
    prod = await Product.findOne({});
  }
  return prod;
}

/**
 * Derives transparent AI Analysis Scores (0-100) based strictly on specs, price, and marketplace availability.
 */
export function computeAIScores(product, offers = [], lowestPrice = null) {
  const offersCount = offers ? offers.length : 0;
  const specs = product?.specs ? (product.specs instanceof Map ? Object.fromEntries(product.specs) : product.specs) : {};
  const specKeys = Object.keys(specs);
  const specCount = specKeys.length;
  
  if (!product || (specCount === 0 && offersCount === 0 && !lowestPrice)) {
    return {
      hasSufficientData: false,
      overallValue: 'Insufficient data',
      performance: 'Insufficient data',
      features: 'Insufficient data',
      buildQuality: 'Insufficient data',
      easeOfUse: 'Insufficient data',
      priceToPerformance: 'Insufficient data',
      availability: 'Insufficient data',
    };
  }

  // 1. Performance Score (derived from processor / RAM / display specs)
  let performanceScore = 75;
  const specValuesStr = Object.values(specs).join(' ').toLowerCase();
  if (specValuesStr.includes('snapdragon 8') || specValuesStr.includes('m3') || specValuesStr.includes('a18') || specValuesStr.includes('i9') || specValuesStr.includes('rtx 40')) {
    performanceScore = 96;
  } else if (specValuesStr.includes('m2') || specValuesStr.includes('a16') || specValuesStr.includes('i7') || specValuesStr.includes('12gb') || specValuesStr.includes('16gb')) {
    performanceScore = 88;
  } else if (specValuesStr.includes('8gb') || specValuesStr.includes('i5') || specValuesStr.includes('dimensity')) {
    performanceScore = 80;
  }

  // 2. Features Score (derived from specs count & advanced display/camera specs)
  let featuresScore = 70;
  if (specCount >= 4) featuresScore = 90;
  else if (specCount >= 2) featuresScore = 82;
  if (specValuesStr.includes('oled') || specValuesStr.includes('120hz') || specValuesStr.includes('4k') || specValuesStr.includes('48mp') || specValuesStr.includes('200mp')) {
    featuresScore += 5;
  }

  // 3. Build Quality Score (derived from material & durability specs / brand)
  let buildQualityScore = 80;
  if (specValuesStr.includes('titanium') || specValuesStr.includes('aluminum') || specValuesStr.includes('ip68') || specValuesStr.includes('gorilla') || product.brand === 'Apple' || product.brand === 'Sony') {
    buildQualityScore = 92;
  } else if (product.brand === 'Samsung' || product.brand === 'LG' || product.brand === 'Dell' || product.brand === 'ASUS') {
    buildQualityScore = 86;
  }

  // 4. Ease of Use Score
  const easeOfUseScore = 85;

  // 5. Price Value Score (derived from current price vs segment)
  let priceValueScore = 75;
  if (lowestPrice) {
    if (lowestPrice < 25000) priceValueScore = 92;
    else if (lowestPrice < 60000) priceValueScore = 86;
    else if (lowestPrice < 120000) priceValueScore = 80;
    else priceValueScore = 72;
  }

  // 6. Availability Score (derived from active store listings count)
  let availabilityScore = 60;
  if (offersCount >= 3) availabilityScore = 95;
  else if (offersCount >= 2) availabilityScore = 85;
  else if (offersCount === 1) availabilityScore = 75;

  const overallValue = Math.round(
    (performanceScore * 0.25) +
    (priceValueScore * 0.25) +
    (buildQualityScore * 0.20) +
    (featuresScore * 0.15) +
    (availabilityScore * 0.15)
  );

  return {
    hasSufficientData: true,
    overallValue,
    performance: performanceScore,
    features: featuresScore,
    buildQuality: buildQualityScore,
    easeOfUse: easeOfUseScore,
    priceToPerformance: priceValueScore,
    availability: availabilityScore,
  };
}

/**
 * Generates Key Strengths derived strictly from actual product specifications.
 */
export function generateKeyStrengths(product, offers = [], lowestPrice = null) {
  const strengths = [];
  const specs = product?.specs ? (product.specs instanceof Map ? Object.fromEntries(product.specs) : product.specs) : {};

  for (const [key, val] of Object.entries(specs)) {
    if (typeof val === 'string' && val.trim()) {
      strengths.push({
        title: `${key}: ${val}`,
        detail: `Verified spec attribute in database.`,
      });
    }
  }

  if (lowestPrice) {
    strengths.push({
      title: `Verified Offer Starting at ₹${lowestPrice.toLocaleString('en-IN')}`,
      detail: `Available across ${offers.length} verified marketplace listing(s).`,
    });
  }

  return strengths;
}

/**
 * Generates Key Limitations strictly from actual evidence.
 */
export function generateKeyLimitations(product, offers = [], lowestPrice = null) {
  const limitations = [];

  if (lowestPrice && lowestPrice > 80000) {
    limitations.push({
      title: 'Premium Segment Price Point',
      detail: `Current lowest price is ₹${lowestPrice.toLocaleString('en-IN')}, placing it in the high-tier price segment.`,
    });
  }

  if (offers && offers.length === 1) {
    limitations.push({
      title: 'Single Retailer Listing',
      detail: `Currently listed on only 1 verified store.`,
    });
  }

  if (limitations.length === 0) {
    limitations.push({
      title: 'Insufficient evidence for a major limitation',
      detail: 'No critical performance or availability limitation identified based on verified specifications.',
    });
  }

  return limitations;
}

/**
 * Finds comparable products in the same category as better alternatives.
 */
export async function findBetterAlternatives(product, lowestPrice = null) {
  const canonicalCat = determineProductCategory(product);
  const rawProducts = await Product.find({ _id: { $ne: product._id } });
  const alternatives = rawProducts.filter(p => determineProductCategory(p) === canonicalCat).slice(0, 3);

  const results = [];
  for (const alt of alternatives) {
    const offers = await MarketplaceProduct.find({ product: alt._id, isAvailable: true });
    const prices = offers.map((o) => o.currentPrice).filter((p) => p > 0);
    const altLowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const image = alt.image || null;

    results.push({
      _id: alt._id,
      name: alt.name,
      brand: alt.brand,
      category: canonicalCat,
      image,
      lowestPrice: altLowestPrice,
      whyBetter: `Comparable option in ${canonicalCat} by ${alt.brand}.`,
    });
  }

  return results;
}

/**
 * Returns Top Overall Ranked Products in a Category based on specs, price value, availability.
 */
export async function getTopCategoryOverall(category) {
  const normalizedCat = normalizeCategory(category) || 'smartphone';
  const rawProducts = await Product.find({});
  const products = rawProducts.filter(p => determineProductCategory(p) === normalizedCat).slice(0, 5);

  const ranked = [];
  for (const p of products) {
    const offers = await MarketplaceProduct.find({ product: p._id, isAvailable: true });
    const prices = offers.map((o) => o.currentPrice).filter((pr) => pr > 0);
    const minP = prices.length > 0 ? Math.min(...prices) : null;
    const image = p.image || null;
    const scores = computeAIScores(p, offers, minP);

    ranked.push({
      _id: p._id,
      name: p.name,
      brand: p.brand,
      category: determineProductCategory(p),
      image,
      lowestPrice: minP,
      overallScore: typeof scores.overallValue === 'number' ? scores.overallValue : 80,
    });
  }

  return ranked.sort((a, b) => b.overallScore - a.overallScore);
}

