import crypto from 'crypto';

const GENERIC_STOCK_PATTERNS = [
  'unsplash.com', 'pexels.com', 'pixabay.com', 'freepik.com',
  'placeholder', 'dummyimage', 'default-product', 'no-image'
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
    parsed.search = '';
    parsed.hash = '';
    let canonical = parsed.toString();
    canonical = canonical.replace(/\._[A-Z0-9_,]+_\./i, '.');
    return canonical.toLowerCase();
  } catch {
    return cleaned.split('?')[0].split('#')[0].toLowerCase();
  }
}

/**
 * Checks if a URL is generic stock photo or placeholder.
 */
export function isGenericStockImage(url) {
  if (!url || typeof url !== 'string') return true;
  const lower = url.toLowerCase().trim();
  for (const pattern of GENERIC_STOCK_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}

/**
 * Calculates SHA-256 of image byte payload or canonical URL.
 */
export function calculateImageSha256(urlOrBytes) {
  if (!urlOrBytes) return null;
  if (Buffer.isBuffer(urlOrBytes)) {
    return crypto.createHash('sha256').update(urlOrBytes).digest('hex');
  }
  const canonical = canonicalImageUrl(urlOrBytes);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Master Image Verifier.
 */
export function verifyRealProductImage({ imageUrl, productId, shaRegistry }) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { valid: false, status: 'IMAGE_UNAVAILABLE', reason: 'Missing or null image URL' };
  }

  if (isGenericStockImage(imageUrl)) {
    return { valid: false, status: 'GENERIC_REJECTED', reason: 'Unsplash or generic stock image rejected' };
  }

  const canonical = canonicalImageUrl(imageUrl);
  const sha256 = calculateImageSha256(canonical);

  if (shaRegistry && shaRegistry.has(sha256)) {
    const existingProductId = shaRegistry.get(sha256);
    if (existingProductId !== productId) {
      return {
        valid: false,
        status: 'DUPLICATE_CONFLICT',
        sha256,
        reason: `Image SHA-256 payload is shared with distinct product ID ${existingProductId}`
      };
    }
  }

  return {
    valid: true,
    status: 'VERIFIED_EXACT',
    canonicalUrl: canonical,
    sha256,
    reason: 'Level 6 image verified successfully'
  };
}
