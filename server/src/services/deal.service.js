import { isValidMarketplaceUrl } from '../utils/urlValidator.js';

export const DEAL_STATUSES = {
  CURRENT_DISCOUNT: 'CURRENT_DISCOUNT',
  PRICE_DROP: 'PRICE_DROP',
  HISTORICAL_PRICE_DROP: 'HISTORICAL_PRICE_DROP', // alias for PRICE_DROP
  LOWEST_OBSERVED: 'LOWEST_OBSERVED',
  STABLE: 'STABLE',
  PRICE_INCREASE: 'PRICE_INCREASE',
  INSUFFICIENT_HISTORY: 'INSUFFICIENT_HISTORY',
  NO_VERIFIED_DEAL: 'NO_VERIFIED_DEAL',
};

/**
 * Evaluates real marketplace deal signals for a product based strictly on observed data.
 * Zero synthetic multipliers or fabricated historical prices.
 */
export function evaluateProductDealSignal(product, listings = [], historyDocs = []) {
  const validListings = listings.filter((l) => {
    return (
      l &&
      l.currentPrice > 0 &&
      l.currency === 'INR' &&
      l.isAvailable &&
      l.url &&
      isValidMarketplaceUrl(l.url)
    );
  });

  if (validListings.length === 0) {
    return {
      dealStatus: DEAL_STATUSES.NO_VERIFIED_DEAL,
      discountPercentage: null,
      priceDropAmount: null,
      dealSource: null,
      bestOffer: null,
      hasDeal: false,
    };
  }

  // Sort listings by currentPrice ascending
  const sortedListings = [...validListings].sort((a, b) => a.currentPrice - b.currentPrice);
  const bestOffer = sortedListings[0];
  const lowestCurrentPrice = bestOffer.currentPrice;

  // 1. Evaluate Listed Discount (originalPrice > currentPrice)
  let maxListedDiscount = null;
  let listedDiscountOffer = null;

  for (const listing of validListings) {
    if (listing.originalPrice && listing.originalPrice > listing.currentPrice) {
      const disc = Math.round(((listing.originalPrice - listing.currentPrice) / listing.originalPrice) * 100);
      if (disc > 0 && (maxListedDiscount === null || disc > maxListedDiscount)) {
        maxListedDiscount = disc;
        listedDiscountOffer = listing;
      }
    }
  }

  // 2. Evaluate Genuine PriceHistory Observations
  const validHistory = historyDocs.filter((h) => h && typeof h.price === 'number' && h.price > 0);
  const hasSufficientHistory = validHistory.length >= 2;

  let priceDropAmount = null;
  let historicalDropPct = null;
  let isLowestObserved = false;
  let isPriceIncreased = false;

  if (hasSufficientHistory) {
    const sortedHistory = [...validHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const historyPrices = sortedHistory.map((h) => h.price);
    const olderPrice = sortedHistory[0].price;
    const minObservedPrice = Math.min(...historyPrices);

    if (lowestCurrentPrice <= minObservedPrice && lowestCurrentPrice < olderPrice) {
      isLowestObserved = true;
    }

    if (olderPrice > lowestCurrentPrice) {
      priceDropAmount = olderPrice - lowestCurrentPrice;
      historicalDropPct = Math.round((priceDropAmount / olderPrice) * 100);
    } else if (lowestCurrentPrice > olderPrice) {
      isPriceIncreased = true;
    }
  }

  // Determine primary deal status
  if (historicalDropPct !== null && historicalDropPct > 0) {
    return {
      dealStatus: isLowestObserved ? DEAL_STATUSES.LOWEST_OBSERVED : DEAL_STATUSES.PRICE_DROP,
      discountPercentage: historicalDropPct,
      priceDropAmount,
      dealSource: 'PRICE_HISTORY',
      bestOffer,
      hasDeal: true,
    };
  }

  if (maxListedDiscount !== null && maxListedDiscount > 0) {
    return {
      dealStatus: DEAL_STATUSES.CURRENT_DISCOUNT,
      discountPercentage: maxListedDiscount,
      priceDropAmount: (listedDiscountOffer || bestOffer).originalPrice - (listedDiscountOffer || bestOffer).currentPrice,
      dealSource: 'MARKETPLACE_LIST_PRICE',
      bestOffer: listedDiscountOffer || bestOffer,
      hasDeal: true,
    };
  }

  if (hasSufficientHistory) {
    if (isPriceIncreased) {
      return {
        dealStatus: DEAL_STATUSES.PRICE_INCREASE,
        discountPercentage: null,
        priceDropAmount: null,
        dealSource: 'PRICE_HISTORY',
        bestOffer,
        hasDeal: false,
      };
    }

    return {
      dealStatus: DEAL_STATUSES.STABLE,
      discountPercentage: null,
      priceDropAmount: null,
      dealSource: 'PRICE_HISTORY',
      bestOffer,
      hasDeal: false,
    };
  }

  return {
    dealStatus: DEAL_STATUSES.INSUFFICIENT_HISTORY,
    discountPercentage: null,
    priceDropAmount: null,
    dealSource: null,
    bestOffer,
    hasDeal: false,
  };
}

