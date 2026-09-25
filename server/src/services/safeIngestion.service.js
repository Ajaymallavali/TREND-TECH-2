import { isAccessory, isSamePhysicalProduct } from './productMatching.service.js';
import {
  classifyProductImage,
  normalizeImageUrl,
  isValidProductImage,
  IMAGE_VALIDATION_STATES
} from './imagePipeline.service.js';
import { logger } from '../config/logger.js';

export function extractAmazonAsin(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

export function buildCanonicalAmazonUrl(asin) {
  if (!asin || asin.length !== 10) return null;
  return `https://www.amazon.in/dp/${asin}`;
}

export function validatePrice(price) {
  if (price === null || price === undefined || typeof price !== 'number' || isNaN(price)) {
    return false;
  }
  return price > 0;
}

/**
 * Core Safe Ingestion Evaluator (DRY RUN SAFETY & PHASE 3A STRICT IMAGE VALIDATION GUARANTEED)
 */
export function evaluateCandidateIngestion(targetProduct, candidateData, options = {}) {
  const isDryRun = options.dryRun !== false; // Default DRY RUN is true

  const auditRecord = {
    timestamp: new Date().toISOString(),
    targetName: targetProduct.name,
    targetCategory: targetProduct.category,
    candidateTitle: candidateData.name || candidateData.title || 'Unknown',
    candidateMarketplace: candidateData.marketplace || 'Unknown',
    matchScore: 0,
    matchStatus: 'REJECTED',
    rejectionReason: null,
    asin: null,
    canonicalUrl: null,
    imageStatus: IMAGE_VALIDATION_STATES.IMAGE_UNVERIFIED,
    imageUrl: candidateData.image || null,
    price: candidateData.currentPrice || candidateData.price || null,
    priceStatus: 'INVALID',
    action: 'NO_ACTION'
  };

  // 1. Accessory Rejection
  const candidateTitle = candidateData.name || candidateData.title || '';
  if (isAccessory(candidateTitle) && targetProduct.category !== 'accessories') {
    auditRecord.rejectionReason = 'ACCESSORY_REJECTED';
    return auditRecord;
  }

  // 2. Variant Matching (Storage / RAM)
  const targetSpecs = targetProduct.specs || {};
  const candidateSpecs = candidateData.specs || candidateData.specifications || {};

  const targetStorage = (targetSpecs.Storage || targetSpecs.storage || '').toLowerCase().trim();
  const candidateStorage = (candidateSpecs.Storage || candidateSpecs.storage || '').toLowerCase().trim();
  if (targetStorage && candidateStorage && targetStorage !== candidateStorage) {
    auditRecord.rejectionReason = 'VARIANT_MISMATCH';
    auditRecord.matchScore = 50;
    return auditRecord;
  }

  // 3. Exact Product Matching
  const isMatch = isSamePhysicalProduct(targetProduct, candidateData);
  if (!isMatch) {
    auditRecord.rejectionReason = 'PRODUCT_MISMATCH';
    return auditRecord;
  }
  auditRecord.matchScore = 100;

  // 4. Amazon ASIN & URL Validation
  const rawUrl = candidateData.url || candidateData.link || '';
  const isAmazon = auditRecord.candidateMarketplace.toLowerCase().includes('amazon') || rawUrl.toLowerCase().includes('amazon');

  let hasVerifiedAsin = false;
  if (isAmazon) {
    const asin = extractAmazonAsin(rawUrl);
    if (!asin) {
      auditRecord.rejectionReason = 'ASIN_UNVERIFIED';
      return auditRecord;
    }
    auditRecord.asin = asin;
    auditRecord.canonicalUrl = buildCanonicalAmazonUrl(asin);
    hasVerifiedAsin = true;
  } else {
    if (!rawUrl || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
      auditRecord.rejectionReason = 'URL_UNVERIFIED';
      return auditRecord;
    }
    auditRecord.canonicalUrl = rawUrl;
  }

  // 5. Price Validation
  const priceVal = candidateData.currentPrice || candidateData.price;
  if (!validatePrice(priceVal)) {
    auditRecord.rejectionReason = 'PRICE_UNVERIFIED';
    return auditRecord;
  }
  auditRecord.priceStatus = 'VALID';
  auditRecord.price = priceVal;

  // 6. Strict Phase 3A Image Validation
  const candidateImg = candidateData.image || null;
  const imageState = classifyProductImage(candidateImg, {
    hasVerifiedAsin,
    isVerifiedDirectOffer: true,
    isDuplicateAcrossDistinctProducts: options.isDuplicateAcrossDistinctProducts || false
  });

  auditRecord.imageStatus = imageState;

  // PHASE 3A MANDATORY RULE: If imageStatus !== VERIFIED_EXACT -> Reject import!
  if (imageState !== IMAGE_VALIDATION_STATES.VERIFIED_EXACT) {
    auditRecord.matchStatus = 'REJECTED';
    auditRecord.rejectionReason = `IMAGE_UNVERIFIED (${imageState})`;
    auditRecord.action = 'NO_ACTION';
    return auditRecord;
  }

  // Passed all validations!
  auditRecord.matchStatus = 'ACCEPTED';
  auditRecord.action = isDryRun ? 'WOULD_CREATE_OR_UPDATE' : 'COMMIT_UPDATE';

  return auditRecord;
}
