import { logger } from '../config/logger.js';

/**
 * AI Service for query understanding, product normalization, matching, and ranking.
 * Supports calling external Google Gemini API if GEMINI_API_KEY is available,
 * otherwise falls back to highly intelligent rule-based parsing.
 */

export async function understandQuery(query) {
  logger.info({ query }, 'AI understanding query');
  
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Parse this user search query for electronics: "${query}" into a JSON object with keys: category, brand, budget, currency (default INR), ram, gpu, storage, useCase. Respond ONLY with the raw JSON object, no markdown formatting, no backticks.`,
                  },
                ],
              },
            ],
          }),
        }
      );
      
      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const interpreted = JSON.parse(cleaned);
      return interpreted;
    } catch (err) {
      logger.warn({ err }, 'Gemini query understanding failed. Falling back to rule-based parser.');
    }
  }

  // Robust Rule-based Fallback Parser
  const interpreted = {
    category: null,
    brand: null,
    budget: null,
    currency: 'INR',
    ram: null,
    gpu: null,
    storage: null,
    useCase: null,
  };

  const qLower = query.toLowerCase();

  // 1. Detect Category
  if (qLower.includes('phone') || qLower.includes('iphone') || qLower.includes('mobile') || qLower.includes('galaxy s')) {
    interpreted.category = 'smartphone';
  } else if (qLower.includes('laptop') || qLower.includes('macbook') || qLower.includes('notebook')) {
    interpreted.category = 'laptop';
  } else if (qLower.includes('headphone') || qLower.includes('earbud') || qLower.includes('earphone') || qLower.includes('soundbar')) {
    interpreted.category = 'headphones';
  } else if (qLower.includes('tv') || qLower.includes('television')) {
    interpreted.category = 'television';
  }

  // 2. Detect Brand
  if (qLower.includes('apple') || qLower.includes('iphone') || qLower.includes('macbook') || qLower.includes('ipad')) {
    interpreted.brand = 'Apple';
  } else if (qLower.includes('samsung') || qLower.includes('galaxy')) {
    interpreted.brand = 'Samsung';
  } else if (qLower.includes('sony')) {
    interpreted.brand = 'Sony';
  } else if (qLower.includes('oneplus')) {
    interpreted.brand = 'OnePlus';
  } else if (qLower.includes('asus')) {
    interpreted.brand = 'Asus';
  } else if (qLower.includes('lenovo')) {
    interpreted.brand = 'Lenovo';
  } else if (qLower.includes('hp')) {
    interpreted.brand = 'HP';
  } else if (qLower.includes('lg')) {
    interpreted.brand = 'LG';
  }

  // 3. Detect Budget (e.g. under 1 lakh, under 70000, under 50,000, under ₹80000)
  const budgetMatch = qLower.match(/(?:under|below|max|maximum)\s*(?:rs\.?|₹|inr)?\s*([0-9,]+)\s*(lakh|lakhs)?/i);
  if (budgetMatch) {
    let budgetVal = parseFloat(budgetMatch[1].replace(/,/g, ''));
    if (budgetMatch[2]) {
      budgetVal = budgetVal * 100000; // e.g. 1 lakh = 100000
    }
    interpreted.budget = budgetVal;
  } else if (qLower.includes('1 lakh')) {
    interpreted.budget = 100000;
  }

  // 4. Specs: RAM
  const ramMatch = qLower.match(/([0-9]+)\s*gb\s*ram/);
  if (ramMatch) {
    interpreted.ram = `${ramMatch[1]}GB`;
  }

  // 5. Specs: GPU
  if (qLower.includes('rtx')) {
    const rtxMatch = qLower.match(/rtx\s*([0-9]+)/);
    interpreted.gpu = rtxMatch ? `RTX ${rtxMatch[1]}` : 'RTX';
  }

  // 6. Specs: Storage
  const storageMatch = qLower.match(/([0-9]+)\s*(gb|tb)\s*(ssd|storage)/);
  if (storageMatch) {
    interpreted.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()}`;
  }

  // 7. Specs: Use Case
  if (qLower.includes('gaming')) {
    interpreted.useCase = 'gaming';
  } else if (qLower.includes('programming') || qLower.includes('coding')) {
    interpreted.useCase = 'programming';
  }

  return interpreted;
}

export function normalizeProduct(product) {
  // Return consistent schema format
  return {
    name: product.name,
    brand: product.brand,
    model: product.model || product.name,
    category: product.category || 'electronics',
    image: product.image || '',
    specifications: product.specifications || {},
  };
}

export function matchProducts(prodA, prodB) {
  // Strictly compare key properties: Brand + Model + Variant (Storage/RAM) to avoid false merges
  if (prodA.brand.toLowerCase() !== prodB.brand.toLowerCase()) return false;
  
  // Extract variant specs like RAM or storage
  const ramA = prodA.specifications?.RAM || prodA.specifications?.ram || '';
  const ramB = prodB.specifications?.RAM || prodB.specifications?.ram || '';
  const storageA = prodA.specifications?.Storage || prodA.specifications?.storage || '';
  const storageB = prodB.specifications?.Storage || prodB.specifications?.storage || '';

  if (ramA && ramB && ramA.toLowerCase() !== ramB.toLowerCase()) return false;
  if (storageA && storageB && storageA.toLowerCase() !== storageB.toLowerCase()) return false;

  // Compare name clean matching
  const nameA = prodA.name.toLowerCase();
  const nameB = prodB.name.toLowerCase();

  // If one contains the other, they are likely matches (given same brand/ram/storage)
  return nameA.includes(nameB) || nameB.includes(nameA);
}

export function rankProducts(offers, interpretedQuery) {
  // Sort and score lists
  if (!offers || offers.length === 0) return [];

  const maxPrice = Math.max(...offers.map((o) => o.price));
  const minPrice = Math.min(...offers.map((o) => o.price));

  return offers.map((offer) => {
    // 1. Price Score: Lower is better (0.0 to 1.0)
    const priceScore = maxPrice === minPrice ? 1.0 : 1.0 - (offer.price - minPrice) / (maxPrice - minPrice);

    // 2. Relevance Score: Check if it fits the budget/specs
    let relevanceScore = 1.0;
    if (interpretedQuery?.budget && offer.price > interpretedQuery.budget) {
      relevanceScore -= 0.5; // budget penalty
    }

    // 3. Availability Score: 1.0 if true
    const availabilityScore = offer.availability ? 1.0 : 0.0;

    // 4. Rating Score (only use if verified and present)
    const ratingScore = (offer.rating !== undefined && offer.rating !== null) ? (offer.rating / 5) : null;

    // 5. Seller Score (only use if verified and present)
    const sellerScore = (offer.sellerScore !== undefined && offer.sellerScore !== null) ? offer.sellerScore : null;

    // Calculate score with dynamic weights depending on what's available
    let totalWeight = 0.40 + 0.25 + 0.15; // base weights for price (40%), relevance (25%), availability (15%)
    let weightedSum = priceScore * 0.40 + relevanceScore * 0.25 + availabilityScore * 0.15;

    if (ratingScore !== null) {
      weightedSum += ratingScore * 0.10;
      totalWeight += 0.10;
    }
    if (sellerScore !== null) {
      weightedSum += sellerScore * 0.10;
      totalWeight += 0.10;
    }

    const score = weightedSum / totalWeight;

    // Build explanation why this deal is ranked/configured
    let explanationList = [];
    if (offer.price === minPrice && offer.availability) {
      explanationList.push('Lowest verified price');
    }
    if (offer.availability) {
      explanationList.push('In stock');
    }
    if (interpretedQuery?.budget && offer.price <= interpretedQuery.budget) {
      explanationList.push('Fits within budget specifications');
    }
    if (ratingScore !== null && offer.rating >= 4) {
      explanationList.push(`Highly rated (${offer.rating}★)`);
    }
    if (offer.seller) {
      explanationList.push(`Seller: ${offer.seller}`);
    }

    const explanation = explanationList.length > 0 
      ? explanationList.slice(0, 3).join(', ') 
      : 'Good deal based on availability';

    return {
      ...offer,
      score,
      explanation,
    };
  });
}
