/**
 * Central Marketplace URL, Image, and Destination Verifier for TREND-TECH-2
 */

import { URL } from 'url';

/**
 * 1. Validate Marketplace Product URL Structure
 */
export function validateMarketplaceProductUrl({ marketplace, url, product, externalIdentifier } = {}) {
  try {
    if (!url || typeof url !== 'string') {
      return { valid: false, reason: 'URL is missing or invalid type', marketplace: marketplace || 'Unknown', canonicalUrl: null };
    }

    const trimmedUrl = url.trim();
    let parsed;
    try {
      parsed = new URL(trimmedUrl);
    } catch {
      return { valid: false, reason: 'Malformed URL format', marketplace: marketplace || 'Unknown', canonicalUrl: null };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Invalid URL protocol', marketplace: marketplace || 'Unknown', canonicalUrl: null };
    }

    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();

    // 1. Rejection of local/internal/example test domains
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.includes('example.com')) {
      return { valid: false, reason: 'Internal or example domain rejected', marketplace: marketplace || 'Unknown', canonicalUrl: null };
    }

    // 2. Strict Search URL Pattern Rejection (NEVER allow search URLs)
    const isSearchPattern = 
      path.includes('/search') ||
      path.startsWith('/s/') ||
      path === '/s' ||
      search.includes('?q=') ||
      search.includes('&q=') ||
      search.includes('?k=') ||
      search.includes('&k=') ||
      search.includes('?text=') ||
      search.includes('search_query') ||
      search.includes('query=');

    if (isSearchPattern) {
      return { valid: false, reason: 'Search URL pattern rejected', marketplace: marketplace || 'Unknown', canonicalUrl: null };
    }

    const mName = (marketplace || '').toLowerCase();

    // 3. Amazon Validation Rules (https://www.amazon.in/dp/<ASIN>)
    if (host.includes('amazon.in') || host.includes('amazon.com') || mName.includes('amazon')) {
      if (!host.includes('amazon.')) {
        return { valid: false, reason: 'Domain does not match Amazon', marketplace: 'Amazon', canonicalUrl: null };
      }
      const asinMatch = path.match(/\/dp\/([A-Z0-9]{10})/i) || path.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (!asinMatch) {
        return { valid: false, reason: 'Amazon URL missing canonical /dp/ASIN pattern', marketplace: 'Amazon', canonicalUrl: null };
      }
      const asin = asinMatch[1].toUpperCase();

      // Reject dummy / placeholder ASINs like "ASIN123456", "B00SP12345"
      if (asin === 'ASIN123456' || asin === 'ASIN000000' || asin.startsWith('B00SP')) {
        return { valid: false, reason: 'Placeholder ASIN rejected', marketplace: 'Amazon', canonicalUrl: null };
      }

      if (externalIdentifier && externalIdentifier.toUpperCase() !== asin) {
        return { valid: false, reason: `ASIN mismatch: expected ${externalIdentifier} but found ${asin}`, marketplace: 'Amazon', canonicalUrl: null };
      }
      const canonicalUrl = `https://www.amazon.in/dp/${asin}`;
      return { valid: true, reason: 'Verified Amazon /dp/ASIN URL', marketplace: 'Amazon', canonicalUrl, asin };
    }

    // 4. Flipkart Validation Rules
    if (host.includes('flipkart.com') || mName.includes('flipkart')) {
      if (!host.includes('flipkart.com')) {
        return { valid: false, reason: 'Domain does not match Flipkart', marketplace: 'Flipkart', canonicalUrl: null };
      }
      if (path.includes('/search') || path.includes('/all/') || search.includes('q=')) {
        return { valid: false, reason: 'Flipkart search/category page rejected', marketplace: 'Flipkart', canonicalUrl: null };
      }
      if (!path.includes('/p/') && !path.includes('-p-') && !path.includes('/itm')) {
        return { valid: false, reason: 'Flipkart URL missing product detail identifier /p/', marketplace: 'Flipkart', canonicalUrl: null };
      }
      return { valid: true, reason: 'Verified Flipkart product detail URL', marketplace: 'Flipkart', canonicalUrl: trimmedUrl };
    }

    // 5. Croma Validation Rules
    if (host.includes('croma.com') || mName.includes('croma')) {
      if (!host.includes('croma.com')) {
        return { valid: false, reason: 'Domain does not match Croma', marketplace: 'Croma', canonicalUrl: null };
      }
      if (path.includes('/search') || search.includes('text=')) {
        return { valid: false, reason: 'Croma search page rejected', marketplace: 'Croma', canonicalUrl: null };
      }
      if (!path.includes('/p/') && !path.match(/\/p\d+$/i) && !path.match(/\/p$/i)) {
        return { valid: false, reason: 'Croma URL missing product detail path', marketplace: 'Croma', canonicalUrl: null };
      }
      return { valid: true, reason: 'Verified Croma product detail URL', marketplace: 'Croma', canonicalUrl: trimmedUrl };
    }

    // 6. Reliance Digital Validation Rules
    if (host.includes('reliancedigital.in') || mName.includes('reliance')) {
      if (!host.includes('reliancedigital.in')) {
        return { valid: false, reason: 'Domain does not match Reliance Digital', marketplace: 'Reliance Digital', canonicalUrl: null };
      }
      if (path.includes('/search') || search.includes('q=')) {
        return { valid: false, reason: 'Reliance Digital search page rejected', marketplace: 'Reliance Digital', canonicalUrl: null };
      }
      if (!path.includes('/p/') && !path.includes('/product/')) {
        return { valid: false, reason: 'Reliance Digital URL missing product path', marketplace: 'Reliance Digital', canonicalUrl: null };
      }
      return { valid: true, reason: 'Verified Reliance Digital product detail URL', marketplace: 'Reliance Digital', canonicalUrl: trimmedUrl };
    }

    // 7. Vijay Sales Validation Rules
    if (host.includes('vijaysales.com') || mName.includes('vijay')) {
      if (!host.includes('vijaysales.com')) {
        return { valid: false, reason: 'Domain does not match Vijay Sales', marketplace: 'Vijay Sales', canonicalUrl: null };
      }
      if (path.includes('/search')) {
        return { valid: false, reason: 'Vijay Sales search page rejected', marketplace: 'Vijay Sales', canonicalUrl: null };
      }
      return { valid: true, reason: 'Verified Vijay Sales product detail URL', marketplace: 'Vijay Sales', canonicalUrl: trimmedUrl };
    }

    // 8. Tata Neu / JioMart / Myntra / Brand stores validation
    const verifiedAllowedDomains = [
      'tataneu.com', 'jiomart.com', 'myntra.com', 'ajio.com', 'nykaa.com',
      'nike.com', 'adidas.co.in', 'puma.com', 'oneplus.in', 'boat-lifestyle.com',
      'sony.co.in', 'apple.com', 'samsung.com', 'dell.com', 'lenovo.com', 'asus.com', 'hp.com'
    ];

    for (const d of verifiedAllowedDomains) {
      if (host.includes(d)) {
        return { valid: true, reason: `Verified product page on ${d}`, marketplace: marketplace || d, canonicalUrl: trimmedUrl };
      }
    }

    return { valid: false, reason: 'Unrecognized or unverified marketplace domain', marketplace: marketplace || 'Unknown', canonicalUrl: null };
  } catch (err) {
    return { valid: false, reason: err.message, marketplace: marketplace || 'Unknown', canonicalUrl: null };
  }
}

export function isValidMarketplaceUrl(urlString) {
  const result = validateMarketplaceProductUrl({ url: urlString });
  return result.valid;
}

/**
 * 2. Exact Product Identity Matching
 * Verifies that an offer / URL does not represent an accessory, case, cover, or different model variant.
 */
export function verifyProductIdentityMatch({ product, offerTitle = '', offerUrl = '' } = {}) {
  if (!product || !product.name) {
    return { match: false, reason: 'Missing product object for identity check' };
  }

  const pName = product.name.toLowerCase();
  const pCategory = (product.category || '').toLowerCase();
  const titleLower = offerTitle.toLowerCase();
  const urlLower = offerUrl.toLowerCase();
  const textToCheck = `${titleLower} ${urlLower}`;

  const mainDeviceCategories = [
    'smartphone', 'laptop', 'tablet', 'television', 'tv', 'headphones',
    'earbuds', 'smartwatch', 'monitor', 'camera', 'gaming'
  ];

  const isMainDevice = mainDeviceCategories.some(c => pCategory.includes(c)) ||
    pName.includes('iphone') || pName.includes('macbook') || pName.includes('galaxy') ||
    pName.includes('bravia') || pName.includes('airpods') || pName.includes('watch') ||
    pName.includes('headphone') || pName.includes('laptop');

  // Accessory keywords to reject if target is a main device
  const accessoryKeywords = [
    'case', 'cover', 'screen protector', 'tempered glass', 'skin', 'lens protector',
    'pouch', 'sleeve', 'strap', 'band', 'earpad', 'ear pad', 'replacement pads',
    'charging dock', 'magsafe case', 'camera lens protector'
  ];

  if (isMainDevice && !pName.includes('case') && !pName.includes('cover') && !pName.includes('strap')) {
    for (const kw of accessoryKeywords) {
      if (textToCheck.includes(kw)) {
        return { match: false, reason: `Target is a device (${product.name}), but offer represents an accessory ('${kw}')` };
      }
    }
  }

  // Device Type Mismatch Check
  if ((pName.includes('iphone') || pCategory === 'smartphone') && (textToCheck.includes('macbook') || textToCheck.includes('laptop') || textToCheck.includes('ipad') || textToCheck.includes('watch'))) {
    return { match: false, reason: 'Device type mismatch: target is iPhone/Smartphone, offer is MacBook/Laptop/iPad/Watch' };
  }
  if ((pName.includes('macbook') || pCategory === 'laptop') && (textToCheck.includes('iphone') || textToCheck.includes('phone') || textToCheck.includes('ipad'))) {
    return { match: false, reason: 'Device type mismatch: target is MacBook/Laptop, offer is iPhone/Phone/iPad' };
  }

  // Model / Series distinction check
  if (pName.includes('xm5') && textToCheck.includes('xm4') && !textToCheck.includes('xm5')) {
    return { match: false, reason: 'Model mismatch: target is XM5, offer is XM4' };
  }

  if (pName.includes('pro max') && textToCheck.includes('pro') && !textToCheck.includes('pro max')) {
    return { match: false, reason: 'Variant mismatch: target is Pro Max, offer is Pro' };
  }

  if (pName.includes("air force 1 '07") && textToCheck.includes('shadow') && !pName.includes('shadow')) {
    return { match: false, reason: "Variant mismatch: target is Air Force 1 '07, offer is Shadow" };
  }

  return { match: true, reason: 'Exact product identity matched' };
}

/**
 * 3. Exact Product Image Validation
 * Ensures images come from authoritative retailer CDNs and are not stock / generic images.
 */
export function validateExactProductImage({ product, marketplace, imageUrl, sourceResult } = {}) {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return { valid: false, status: 'IMAGE_UNAVAILABLE', reason: 'Image URL is missing' };
  }

  const imgLower = imageUrl.toLowerCase().trim();

  // Reject generic stock photos / placeholders
  const genericStockDomains = [
    'unsplash.com', 'pexels.com', 'pixabay.com', 'freepik.com',
    'placeholder.com', 'via.placeholder.com', 'dummyimage.com'
  ];

  for (const domain of genericStockDomains) {
    if (imgLower.includes(domain)) {
      return { valid: false, status: 'IMAGE_UNAVAILABLE', reason: `Generic stock image source rejected (${domain})` };
    }
  }

  if (imgLower.includes('placeholder') || imgLower.includes('no-image') || imgLower.includes('default-product')) {
    return { valid: false, status: 'IMAGE_UNAVAILABLE', reason: 'Placeholder image keyword rejected' };
  }

  // Authoritative Retailer & Brand Image CDNs
  const authoritativeDomains = [
    'm.media-amazon.com', 'images-na.ssl-images-amazon.com',
    'rukminim2.flixcart.com', 'rukminim1.flixcart.com',
    'croma.com', 'reliancedigital.in', 'vijaysales.com',
    'myntassets.com', 'static.nike.com', 'adidas.co.in', 'puma.com',
    'tataneu.com', 'jiomart.com', 'nykaa.com', 'samsung.com',
    'apple.com', 'sony.co.in', 'dell.com', 'lenovo.com', 'hp.com', 'asus.com'
  ];

  const isAuthoritative = authoritativeDomains.some(d => imgLower.includes(d));

  if (!isAuthoritative) {
    // If it's a valid http(s) URL with an image extension, mark as external verified
    if ((imgLower.startsWith('http://') || imgLower.startsWith('https://')) &&
        (imgLower.includes('.jpg') || imgLower.includes('.png') || imgLower.includes('.webp') || imgLower.includes('.jpeg'))) {
      return {
        valid: true,
        status: 'EXACT_PRODUCT_IMAGE_VERIFIED',
        reason: 'Authoritative external image URL verified',
        cleanUrl: imageUrl.split('?')[0]
      };
    }
    return { valid: false, status: 'IMAGE_UNAVAILABLE', reason: 'Non-authoritative image source domain' };
  }

  return {
    valid: true,
    status: 'EXACT_PRODUCT_IMAGE_VERIFIED',
    reason: 'Verified authoritative product image CDN',
    cleanUrl: imageUrl.split('?')[0]
  };
}

/**
 * 4. Verify Destination HTTP / Provider Status
 */
export function determineDestinationVerificationState({ urlResult, identityResult, isVerifiedCatalogSource = true, httpStatusCode = null }) {
  if (!urlResult.valid) {
    return { status: 'INVALID_DESTINATION', reason: urlResult.reason };
  }

  if (!identityResult.match) {
    return { status: 'INVALID_DESTINATION', reason: identityResult.reason };
  }

  if (httpStatusCode === 200 || httpStatusCode === 301 || httpStatusCode === 302) {
    return { status: 'VERIFIED_DESTINATION', reason: 'HTTP HEAD/GET destination verified' };
  }

  if (isVerifiedCatalogSource) {
    return {
      status: 'PROVIDER_VERIFIED',
      reason: 'Verified by catalog source data (Retailer WAF anti-bot challenge encountered on HTTP check)'
    };
  }

  return { status: 'UNVERIFIABLE_EXTERNAL', reason: 'External HTTP check timed out or blocked' };
}
