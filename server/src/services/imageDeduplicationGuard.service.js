import crypto from 'crypto';
import { logger } from '../config/logger.js';
import { canonicalImageUrl } from './imagePipeline.service.js';

/**
 * Computes a SHA-256 hash string for an image URL string or byte Buffer.
 */
export function computeImageSha256(input) {
  if (!input) return null;
  const hash = crypto.createHash('sha256');
  if (Buffer.isBuffer(input)) {
    hash.update(input);
  } else if (typeof input === 'string') {
    const canonical = canonicalImageUrl(input);
    if (!canonical) return null;
    hash.update(canonical);
  } else {
    return null;
  }
  return hash.digest('hex');
}

/**
 * Determines whether two product objects are legitimate same-product physical variants
 * (e.g., color or storage variants of the same ASIN/model).
 */
export function isLegitimateVariantPair(productA, productB) {
  if (!productA || !productB) return false;

  const idA = productA._id ? String(productA._id) : String(productA.id || '');
  const idB = productB._id ? String(productB._id) : String(productB.id || '');

  if (idA && idA === idB) return true;

  // Explicit variant relation checks
  if (productA.parentAsin && productB.parentAsin && productA.parentAsin === productB.parentAsin) {
    return true;
  }
  if (productA.asin && productB.asin && productA.asin === productB.asin) {
    return true;
  }
  if (productA.variantOf && String(productA.variantOf) === idB) {
    return true;
  }
  if (productB.variantOf && String(productB.variantOf) === idA) {
    return true;
  }

  return false;
}

/**
 * Enforces image uniqueness across a listing of products.
 * If two distinct non-variant products resolve to the same canonical URL or image hash,
 * flags the collision, logs a warning, and sets the secondary product's image to null.
 */
export function enforceCategoryListingImageDeduplication(products = []) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const seenImages = new Map(); // canonicalHash -> { product, originalUrl }
  const collisionsFound = [];

  const deduplicatedProducts = products.map((prod) => {
    // Clone product object if necessary to avoid mutating freeze state
    const p = typeof prod.toObject === 'function' ? prod.toObject() : { ...prod };

    if (!p.image || typeof p.image !== 'string') {
      return p;
    }

    const canonical = canonicalImageUrl(p.image);
    if (!canonical) {
      p.image = null;
      p.imageStatus = 'UNVERIFIED';
      return p;
    }

    const sha256 = computeImageSha256(canonical);
    const hashKey = sha256 || canonical;

    if (seenImages.has(hashKey)) {
      const existing = seenImages.get(hashKey);

      // Check if legitimate variant exception applies
      if (isLegitimateVariantPair(existing.product, p)) {
        return p; // Allowed legitimate variant
      }

      // COLLISION DETECTED across distinct physical products!
      const prodIdA = existing.product._id || existing.product.id;
      const prodIdB = p._id || p.id;

      logger.warn(
        {
          productIdA: prodIdA,
          productNameA: existing.product.name,
          productIdB: prodIdB,
          productNameB: p.name,
          canonicalUrl: canonical,
          hash: hashKey
        },
        '🚨 CROSS-PRODUCT IMAGE COLLISION DETECTED — stripping duplicate image'
      );

      collisionsFound.push({
        productIdA: prodIdA,
        productIdB: prodIdB,
        url: canonical
      });

      // Strip image from secondary colliding product in listing view
      p.image = null;
      p.imageStatus = 'DUPLICATE_CONFLICT';
      p.imageVerificationReason = `Collision detected with product ID ${prodIdA}`;
      return p;
    }

    seenImages.set(hashKey, { product: p, originalUrl: p.image });
    return p;
  });

  return deduplicatedProducts;
}
