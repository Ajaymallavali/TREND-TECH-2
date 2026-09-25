import { extractAmazonAsin, buildCanonicalAmazonUrl } from './safeIngestion.service.js';

const GENERIC_STOCK_DOMAINS = ['unsplash.com', 'pexels.com', 'pixabay.com', 'freepik.com', 'stock.adobe.com'];
const PLACEHOLDER_PATTERNS = ['placeholder', 'dummy', 'default', 'sample', 'no-image', 'missing_image'];

/**
 * Validates a marketplace product URL.
 * Enforces exact product detail page URLs and rejects search/category URLs.
 */
export function validateMarketplaceUrl(url, marketplaceName = '') {
  if (!url || typeof url !== 'string') return { isValid: false, reason: 'MISSING_URL' };
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, reason: 'INVALID_PROTOCOL' };
    }

    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();

    // Check search URL patterns
    if (
      pathname.includes('/search') ||
      pathname.startsWith('/s/') ||
      pathname === '/s' ||
      search.includes('?q=') ||
      search.includes('&q=') ||
      search.includes('k=')
    ) {
      return { isValid: false, reason: 'SEARCH_URL_REJECTED' };
    }

    // Amazon URL Validation
    if (host.includes('amazon')) {
      const asin = extractAmazonAsin(trimmed);
      if (!asin) {
        return { isValid: false, reason: 'AMAZON_ASIN_MISSING' };
      }
      return {
        isValid: true,
        canonicalUrl: buildCanonicalAmazonUrl(asin) || trimmed,
        asin
      };
    }

    // Flipkart Validation
    if (host.includes('flipkart.com')) {
      if (!pathname.includes('/p/')) {
        return { isValid: false, reason: 'FLIPKART_NOT_PRODUCT_PAGE' };
      }
      return { isValid: true, canonicalUrl: trimmed };
    }

    // Croma Validation
    if (host.includes('croma.com')) {
      if (!pathname.includes('/p/')) {
        return { isValid: false, reason: 'CROMA_NOT_PRODUCT_PAGE' };
      }
      return { isValid: true, canonicalUrl: trimmed };
    }

    // Reliance Digital Validation
    if (host.includes('reliancedigital.in')) {
      if (!pathname.includes('/p/')) {
        return { isValid: false, reason: 'RELIANCE_NOT_PRODUCT_PAGE' };
      }
      return { isValid: true, canonicalUrl: trimmed };
    }

    // Vijay Sales Validation
    if (host.includes('vijaysales.com')) {
      if (!pathname.includes('/p/')) {
        return { isValid: false, reason: 'VIJAYSALES_NOT_PRODUCT_PAGE' };
      }
      return { isValid: true, canonicalUrl: trimmed };
    }

    // Other supported retailer domains (Myntra, Nike, Adidas, Puma, Nykaa)
    const allowedRetailers = ['myntra.com', 'nike.com', 'adidas.co.in', 'puma.com', 'nykaa.com'];
    const isAllowed = allowedRetailers.some((domain) => host.includes(domain));
    if (!isAllowed) {
      return { isValid: false, reason: 'UNSUPPORTED_MARKETPLACE_DOMAIN' };
    }

    return { isValid: true, canonicalUrl: trimmed };
  } catch {
    return { isValid: false, reason: 'MALFORMED_URL' };
  }
}

/**
 * Validates product image URL for stock/placeholder/duplicate rejection.
 */
export function validateProductImage(imageUrl, catalogPool = []) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { isValid: false, reason: 'MISSING_IMAGE' };
  }

  const trimmed = imageUrl.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return { isValid: false, reason: 'MISSING_IMAGE' };
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, reason: 'INVALID_IMAGE_PROTOCOL' };
    }
  } catch {
    return { isValid: false, reason: 'MALFORMED_IMAGE_URL' };
  }

  const lower = trimmed.toLowerCase();

  // 1. Generic Stock Rejection
  for (const domain of GENERIC_STOCK_DOMAINS) {
    if (lower.includes(domain)) {
      return { isValid: false, reason: 'GENERIC_STOCK_IMAGE_REJECTED' };
    }
  }

  // 2. Placeholder Check
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (lower.includes(pattern)) {
      return { isValid: false, reason: 'PLACEHOLDER_IMAGE_REJECTED' };
    }
  }

  // 3. Image Uniqueness check across catalog
  if (Array.isArray(catalogPool) && catalogPool.length > 0) {
    const normUrl = lower.split('?')[0];
    const matchCount = catalogPool.filter((p) => {
      if (!p.image) return false;
      return p.image.toLowerCase().split('?')[0] === normUrl;
    }).length;

    if (matchCount > 1) {
      return { isValid: false, reason: 'DUPLICATE_IMAGE_REJECTED' };
    }
  }

  return { isValid: true, imageUrl: trimmed };
}

/**
 * Deduplicates marketplace offers array.
 */
export function deduplicateOffers(offers = []) {
  const seenAsins = new Set();
  const seenUrls = new Set();
  const validOffers = [];

  for (const offer of offers) {
    const urlRes = validateMarketplaceUrl(offer.url, offer.marketplace);
    if (!urlRes.isValid) continue;

    if (urlRes.asin) {
      if (seenAsins.has(urlRes.asin)) continue;
      seenAsins.add(urlRes.asin);
    } else {
      const norm = urlRes.canonicalUrl.toLowerCase().split('?')[0];
      if (seenUrls.has(norm)) continue;
      seenUrls.add(norm);
    }

    validOffers.push({
      ...offer,
      url: urlRes.canonicalUrl,
      asin: urlRes.asin || offer.asin
    });
  }

  return validOffers;
}

/**
 * Deduplicates product items in a catalog pool.
 */
export function deduplicateProducts(catalogPool = []) {
  const seenSlugs = new Set();
  const uniqueProducts = [];

  for (const item of catalogPool) {
    const slug = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);
    uniqueProducts.push({
      ...item,
      slug
    });
  }

  return uniqueProducts;
}
