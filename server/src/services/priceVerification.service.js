import { isValidMarketplaceUrl } from '../utils/urlValidator.js';

const INDIAN_MARKETPLACES = [
  'Amazon India',
  'Flipkart',
  'Croma',
  'Reliance Digital',
  'Vijay Sales',
  'Tata Neu',
  'JioMart',
  'Samsung India',
  'Apple India',
  'OnePlus India',
  'boAt',
  'Sony India',
  'ASUS India',
  'Lenovo India',
  'HP India',
  'Dell India',
];

export function verifyPrice(price) {
  return typeof price === 'number' && price > 0;
}

export function verifyCurrency(currency) {
  return currency === 'INR';
}

export function verifyMarketplace(marketplaceName) {
  if (!marketplaceName) return false;
  return INDIAN_MARKETPLACES.some(
    (m) => m.toLowerCase() === marketplaceName.toLowerCase()
  );
}

export function verifyUrl(url) {
  return isValidMarketplaceUrl(url);
}

export function calculateDiscount(originalPrice, currentPrice) {
  if (originalPrice && currentPrice && originalPrice > currentPrice) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  return 0;
}

export function determinePriceStatus(price, url, source) {
  if (!price || price <= 0) {
    return 'unavailable';
  }

  // Explicitly return status based on source indicators
  if (source === 'verified' || source === 'direct') {
    return 'verified';
  }
  if (source === 'demo' || source === 'mock' || source === 'seed') {
    return 'demo';
  }
  if (source === 'search_result') {
    return 'search_result';
  }

  // Default to search result status for search engine snippets
  return 'search_result';
}
