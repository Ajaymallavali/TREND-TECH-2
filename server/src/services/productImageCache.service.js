import { logger } from '../config/logger.js';

// In-memory deterministic product image cache keyed strictly by Product ID or SKU
const imageCacheStore = new Map();

/**
 * Generates a stable, deterministic cache key from product identity.
 */
export function getProductCacheKey(productId) {
  if (!productId) return null;
  const keyStr = typeof productId === 'object' && productId._id ? productId._id.toString() : String(productId).trim();
  if (!keyStr || keyStr === 'undefined' || keyStr === 'null') return null;
  return `prod_img:${keyStr}`;
}

/**
 * Stores a verified product image record in cache.
 */
export function cacheProductImage(productId, record) {
  const cacheKey = getProductCacheKey(productId);
  if (!cacheKey) return null;

  const entry = {
    productId: String(productId),
    externalId: record.externalId || record.asin || null,
    imageUrl: record.imageUrl || null,
    imageHash: record.imageHash || null,
    source: record.source || 'VERIFIED_LIVE_API',
    verified: Boolean(record.verified !== false && record.imageUrl),
    retrievedAt: record.retrievedAt || new Date().toISOString()
  };

  imageCacheStore.set(cacheKey, entry);
  return entry;
}

/**
 * Retrieves a cached product image record by Product ID.
 */
export function getCachedProductImage(productId) {
  const cacheKey = getProductCacheKey(productId);
  if (!cacheKey) return null;

  const entry = imageCacheStore.get(cacheKey);
  if (!entry) return null;

  // Verify entry belongs to identical product ID
  if (String(entry.productId) !== String(productId)) {
    logger.warn({ cacheKey, expectedId: productId, actualId: entry.productId }, 'Image cache key mismatch discarded');
    imageCacheStore.delete(cacheKey);
    return null;
  }

  return entry;
}

/**
 * Invalidates cache entry for a specific product ID.
 */
export function invalidateProductImageCache(productId) {
  const cacheKey = getProductCacheKey(productId);
  if (cacheKey) {
    imageCacheStore.delete(cacheKey);
  }
}

/**
 * Clears entire image cache (for testing and reset).
 */
export function clearProductImageCache() {
  imageCacheStore.clear();
}
