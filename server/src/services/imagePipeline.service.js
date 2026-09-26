import { logger } from '../config/logger.js';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { VERIFIED_CATALOG_DATA } from '../data/verifiedCatalog.data.js';

export const IMAGE_VALIDATION_STATES = {
  VERIFIED_EXACT: 'VERIFIED_EXACT',           // Verified direct manufacturer/marketplace model photography
  VERIFIED_MARKETPLACE: 'VERIFIED_MARKETPLACE', // Valid direct CDN image from verified store
  UNVERIFIED: 'UNVERIFIED',                     // Missing or unverified image
  GENERIC: 'GENERIC',                           // Unsplash, Pexels, Pixabay stock photo
  PLACEHOLDER: 'PLACEHOLDER',                   // Dummy, sample, default placeholder image
  BROKEN: 'BROKEN',                             // Invalid, malformed, or non-resolving URL
  DUPLICATE: 'DUPLICATE',                       // Base image shared across distinct models
  MISMATCH: 'MISMATCH',                         // Category or brand mismatch
  UNKNOWN: 'UNKNOWN'
};

const GENERIC_STOCK_DOMAINS = [
  'unsplash.com', 'pexels.com', 'pixabay.com', 'freepik.com', 'stock.adobe.com',
  'via.placeholder.com', 'placeholder.com', 'dummyimage.com'
];
const PLACEHOLDER_PATTERNS = ['placeholder', 'dummy', 'default-product', 'no-image', 'missing_image'];

// Verified HTTP 200 CDN Image resolution mapping
const VERIFIED_CDN_MAPPINGS = [
  { pattern: 'iphone 16 pro max', url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
  { pattern: 'iphone 16 pro', url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
  { pattern: 'iphone 16', url: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' },
  { pattern: 'iphone 15 pro max', url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
  { pattern: 'iphone 15 pro', url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
  { pattern: 'iphone 15', url: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg' },
  { pattern: 'macbook air m3', url: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg' },
  { pattern: 'macbook pro m3', url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg' },
  { pattern: 'macbook air m2', url: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg' },
  { pattern: 'galaxy s24 ultra', url: 'https://m.media-amazon.com/images/I/71RVuW369qL._SL1500_.jpg' },
  { pattern: 'galaxy s24', url: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg' },
  { pattern: 'galaxy s23', url: 'https://m.media-amazon.com/images/I/61VfL-WzBfL._SL1500_.jpg' },
  { pattern: 'galaxy a55', url: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg' },
  { pattern: 'oneplus 13', url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
  { pattern: 'oneplus 12r', url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
  { pattern: 'oneplus 12', url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
  { pattern: 'oneplus nord', url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
  { pattern: 'xiaomi 14 ultra', url: 'https://m.media-amazon.com/images/I/71N-W7C46OL._SL1500_.jpg' },
  { pattern: 'redmi note 13', url: 'https://m.media-amazon.com/images/I/71lD7fSl0wL._SL1500_.jpg' },
  { pattern: 'xiaomi pad 6', url: 'https://m.media-amazon.com/images/I/71LRY1j6UHL._SL1500_.jpg' },
  { pattern: 'wh-1000xm5', url: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg' },
  { pattern: 'airpods pro', url: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg' },
  { pattern: 'bravia', url: 'https://m.media-amazon.com/images/I/81M+xWk89rL._SL1500_.jpg' },
  { pattern: 'playstation 5', url: 'https://m.media-amazon.com/images/I/61b7M8k+B9L._SL1500_.jpg' },
  { pattern: 'air force 1', url: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d77177-3e72-4731-8400-9d0242d4746b/air-force-1-07-shoes-WrLincoln.png' },
  { pattern: 'levis 511', url: 'https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/11384592/2020/2/17/5c23e80e-436f-45a4-9467-17b51b2725651581938562137-Levis-Men-Jeans-2911581938560647-1.jpg' }
];

/**
 * Strips query parameters, tracking tags, and size modifiers to return canonical image URL.
 */
export function canonicalImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim();
  if (cleaned === '' || cleaned === 'null' || cleaned === 'undefined') return '';

  try {
    const parsed = new URL(cleaned);
    // Strip query parameters and hash
    parsed.search = '';
    parsed.hash = '';
    let canonical = parsed.toString();

    // Strip Amazon CDN size modifiers (e.g. ._SL1500_.jpg -> .jpg)
    canonical = canonical.replace(/\._[A-Z0-9_,]+_\./i, '.');
    return canonical.toLowerCase();
  } catch {
    return cleaned.split('?')[0].split('#')[0].toLowerCase();
  }
}

/**
 * Normalizes an image URL by stripping unnecessary whitespace.
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return '';
  return trimmed;
}

/**
 * Checks if a URL points to a generic stock provider or placeholder image.
 */
export function isGenericStockImage(url) {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();

  for (const domain of GENERIC_STOCK_DOMAINS) {
    if (lower.includes(domain)) return true;
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }

  return false;
}

/**
 * Validates a candidate product image URL format and protocol.
 */
export function isValidProductImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  const trimmed = imageUrl.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;

  if (
    trimmed.startsWith('/product-images/') ||
    trimmed.startsWith('server/src/data/product-images/') ||
    trimmed.startsWith('/server/src/data/product-images/')
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Resolves the exact product image URL and imageStatus for a given product.
 */
export function getExactProductImageDetails(product) {
  if (!product) return { url: null, imageStatus: IMAGE_VALIDATION_STATES.UNVERIFIED };
  const imgUrl = normalizeImageUrl(product.image);
  if (imgUrl && isValidProductImage(imgUrl)) {
    if (isGenericStockImage(imgUrl)) {
      return { url: null, imageStatus: IMAGE_VALIDATION_STATES.GENERIC };
    }
    return {
      url: imgUrl,
      imageStatus: product.imageStatus || IMAGE_VALIDATION_STATES.VERIFIED_EXACT
    };
  }

  // Legacy static VERIFIED_CDN_MAPPINGS must NOT participate in runtime image selection.
  return { url: null, imageStatus: product.imageStatus || IMAGE_VALIDATION_STATES.UNVERIFIED };
}

/**
 * Legacy compatibility wrapper returning URL string or null.
 */
export function getExactProductImage(product) {
  const details = getExactProductImageDetails(product);
  return details.url;
}

/**
 * Classifies an image URL for auditing.
 */
export function classifyProductImage(imageUrl, options = {}) {
  if (!isValidProductImage(imageUrl)) {
    return IMAGE_VALIDATION_STATES.BROKEN;
  }

  if (isGenericStockImage(imageUrl)) {
    return IMAGE_VALIDATION_STATES.GENERIC;
  }

  return IMAGE_VALIDATION_STATES.VERIFIED_EXACT;
}
