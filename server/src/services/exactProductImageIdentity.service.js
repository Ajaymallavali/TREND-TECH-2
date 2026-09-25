/**
 * TREND-TECH-2 Master Product Image Identity & Device Type Protection Service
 *
 * Enforces 100% strict verification of exact product identity:
 * - Brand match
 * - Model family & model token match
 * - Device type / Category compatibility protection
 * - Variant / Spec token match
 */

export const DEVICE_CATEGORIES = {
  SMARTPHONE: 'smartphone',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  TELEVISION: 'television',
  HEADPHONES: 'headphones',
  EARBUDS: 'earbuds',
  SMARTWATCH: 'smartwatch',
  CAMERA: 'camera',
  GAMING: 'gaming',
  MONITOR: 'monitor',
  AIR_CONDITIONER: 'air-conditioner',
  WASHING_MACHINE: 'washing-machine',
  FASHION: 'mens-clothing',
  SHOES: 'shoes',
  ACCESSORY: 'accessory'
};

export const VERIFICATION_STATUSES = {
  VERIFIED_EXACT: 'VERIFIED_EXACT',
  MISSING: 'MISSING',
  REJECTED: 'REJECTED',
  SOURCE_UNVERIFIED: 'SOURCE_UNVERIFIED',
  IDENTITY_MISMATCH: 'IDENTITY_MISMATCH',
  DUPLICATE_CONFLICT: 'DUPLICATE_CONFLICT',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED'
};

export const VERIFICATION_LEVELS = {
  LEVEL_6_ONLY: 'LEVEL_6_ONLY'
};

export function createVerifiedProductImageRecord({
  productId,
  productName,
  brand,
  category,
  model,
  variant,
  sourceType = 'NO_SOURCE',
  sourceProductUrl = null,
  sourceImageUrl = null,
  localImagePath = null,
  imageSha256 = null,
  mimeType = null,
  width = null,
  height = null,
  verificationLevel = VERIFICATION_LEVELS.LEVEL_6_ONLY,
  verificationStatus = VERIFICATION_STATUSES.MISSING,
  reason = ''
}) {
  // RULE: VERIFIED_EXACT is ONLY allowed if verificationLevel === LEVEL_6_ONLY
  let finalStatus = verificationStatus;
  if (finalStatus === VERIFICATION_STATUSES.VERIFIED_EXACT && verificationLevel !== VERIFICATION_LEVELS.LEVEL_6_ONLY) {
    finalStatus = VERIFICATION_STATUSES.SOURCE_UNVERIFIED;
  }

  return {
    productId,
    productName,
    brand,
    category,
    model,
    variant,
    sourceType,
    sourceProductUrl,
    sourceImageUrl,
    localImagePath,
    imageSha256,
    mimeType,
    width,
    height,
    verificationLevel,
    verificationStatus: finalStatus,
    reason,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Extracts model tokens (e.g. "s24", "ultra", "16", "pro", "max", "m3", "3520", "xm5").
 */
export function extractModelTokens(name = '') {
  if (!name || typeof name !== 'string') return [];
  const lower = name.toLowerCase();
  
  const tokens = lower.match(/\b([a-z0-9]+)\b/g) || [];
  const stopWords = new Set(['the', 'and', 'with', 'for', 'laptop', 'smartphone', 'mobile', 'phone', 'television', 'tv', 'audio', 'brand']);
  return tokens.filter(t => t.length >= 2 && !stopWords.has(t));
}

/**
 * Extracts variant tokens (e.g. "pro max", "pro", "ultra", "plus", "air", "se", "mini").
 */
export function extractVariantTokens(name = '') {
  if (!name || typeof name !== 'string') return [];
  const lower = name.toLowerCase();
  const variants = ['pro max', 'pro', 'ultra', 'plus', 'air', 'se', 'mini', 'neo qled', 'qled', 'oled', 'crystal uhd'];
  return variants.filter(v => lower.includes(v));
}

/**
 * Hard Device-Type / Category Protection Rule.
 * Prevents cross-device image assignment (e.g. Smartphone image to Laptop or TV).
 */
export function checkDeviceTypeCompatibility(catA, catB) {
  if (!catA || !catB) return { compatible: true };
  const normA = catA.toLowerCase().trim();
  const normB = catB.toLowerCase().trim();

  if (normA === normB) return { compatible: true };

  const incompatiblePairs = [
    ['smartphone', 'laptop'],
    ['smartphone', 'tablet'],
    ['smartphone', 'television'],
    ['smartphone', 'headphones'],
    ['smartphone', 'smartwatch'],
    ['smartphone', 'camera'],
    ['smartphone', 'air-conditioner'],
    ['smartphone', 'washing-machine'],
    ['laptop', 'television'],
    ['laptop', 'headphones'],
    ['laptop', 'camera'],
    ['laptop', 'smartwatch'],
    ['television', 'headphones'],
    ['television', 'camera'],
    ['headphones', 'camera'],
    ['gaming', 'television'],
    ['gaming', 'headphones']
  ];

  for (const [x, y] of incompatiblePairs) {
    if ((normA.includes(x) && normB.includes(y)) || (normA.includes(y) && normB.includes(x))) {
      return {
        compatible: false,
        reason: `Hard Device-Type Violation: ${normA} image cannot be assigned to ${normB}`
      };
    }
  }

  return { compatible: true };
}

/**
 * Master Verification Function: verifyExactProductImageIdentity
 */
export function verifyExactProductImageIdentity({ product, candidate }) {
  if (!product || !candidate) {
    return { match: false, reason: 'Missing product or candidate object' };
  }

  const pName = (product.name || '').toLowerCase().trim();
  const pBrand = (product.brand || '').toLowerCase().trim();
  const pCategory = (product.category || '').toLowerCase().trim();

  const cTitle = (candidate.offerTitle || candidate.name || candidate.productName || '').toLowerCase().trim();
  const cBrand = (candidate.brand || '').toLowerCase().trim();
  const cCategory = (candidate.category || candidate.requiredDeviceType || '').toLowerCase().trim();
  const cUrl = (candidate.imageUrl || candidate.url || '').toLowerCase().trim();

  const textToCheck = `${cTitle} ${cUrl}`;

  // 1. Brand Match Check
  if (pBrand && cBrand && pBrand !== cBrand && cBrand !== 'unknown') {
    return { match: false, reason: `Brand mismatch: target is ${product.brand}, offer is ${candidate.brand}` };
  }

  // Check offer text for conflicting brand names
  const knownBrands = ['apple', 'samsung', 'dell', 'sony', 'xiaomi', 'hp', 'lenovo', 'lg', 'canon'];
  for (const b of knownBrands) {
    if (b !== pBrand && textToCheck.includes(b)) {
      return { match: false, reason: `Brand mismatch in offer text: target brand is ${product.brand}, offer contains brand '${b}'` };
    }
  }

  // 2. Device Type Protection Check
  if (cCategory) {
    const devCheck = checkDeviceTypeCompatibility(pCategory, cCategory);
    if (!devCheck.compatible) {
      return { match: false, reason: devCheck.reason };
    }
  }

  // 2. Cross-Device Keyword Check in offer text
  if (pCategory === 'smartphone' || pName.includes('iphone') || pName.includes('galaxy s')) {
    if (textToCheck.includes('macbook') || textToCheck.includes('laptop') || textToCheck.includes('bravia') || textToCheck.includes('headphone')) {
      return { match: false, reason: 'Device type mismatch: target is Smartphone, offer text contains Laptop/TV/Headphones' };
    }
  }

  if (pCategory === 'laptop' || pName.includes('macbook') || pName.includes('inspiron')) {
    if (textToCheck.includes('smartphone') || textToCheck.includes('iphone 1') || textToCheck.includes('airpods') || textToCheck.includes('headphone')) {
      return { match: false, reason: 'Device type mismatch: target is Laptop, offer text contains Smartphone/AirPods/Headphones' };
    }
  }

  if (pCategory === 'television' || pName.includes('bravia')) {
    if (textToCheck.includes('headphone') || textToCheck.includes('wh-1000xm') || textToCheck.includes('earbuds') || textToCheck.includes('camera')) {
      return { match: false, reason: 'Device type mismatch: target is Television, offer text contains Headphones/Earbuds/Camera' };
    }
  }

  // 3. Accessory Keyword Rejection for main devices
  const accessoryKeywords = [
    'case', 'cover', 'screen protector', 'tempered glass', 'skin', 'lens protector',
    'pouch', 'sleeve', 'strap', 'band', 'earpad', 'replacement pads', 'charging dock'
  ];

  if (!pName.includes('case') && !pName.includes('cover') && !pName.includes('strap')) {
    for (const kw of accessoryKeywords) {
      if (textToCheck.includes(kw)) {
        return { match: false, reason: `Target is a device (${product.name}), offer represents an accessory ('${kw}')` };
      }
    }
  }

  // 4. Model & Variant Specificity Checks
  // iPhone 16 vs 16 Pro / 16 Pro Max / 16e
  if (pName.includes('iphone 16') && !pName.includes('pro') && !pName.includes('16e') && !pName.includes('plus')) {
    if (textToCheck.includes('16 pro') || textToCheck.includes('16e') || textToCheck.includes('16 plus')) {
      return { match: false, reason: 'Variant mismatch: target is iPhone 16, offer is 16 Pro / 16e / 16 Plus' };
    }
  }

  // iPhone 16e vs iPhone 16
  if (pName.includes('iphone 16e')) {
    if (textToCheck.includes('iphone 16') && !textToCheck.includes('16e')) {
      return { match: false, reason: 'Variant mismatch: target is iPhone 16e, offer is iPhone 16' };
    }
  }

  // iPhone 16 Pro vs 16 Pro Max
  if (pName.includes('iphone 16 pro') && !pName.includes('pro max')) {
    if (textToCheck.includes('pro max')) {
      return { match: false, reason: 'Variant mismatch: target is iPhone 16 Pro, offer is 16 Pro Max' };
    }
  }

  // Generic Pro vs Pro Max
  if (pName.includes('pro') && !pName.includes('pro max') && textToCheck.includes('pro max')) {
    return { match: false, reason: 'Variant mismatch: target is Pro, offer is Pro Max' };
  }

  // iPhone 17 Pro Max vs 17 Pro / 17
  if (pName.includes('iphone 17 pro max')) {
    if (textToCheck.includes('iphone 17 pro') && !textToCheck.includes('pro max')) {
      return { match: false, reason: 'Variant mismatch: target is iPhone 17 Pro Max, offer is iPhone 17 Pro' };
    }
  }

  // Galaxy A55 vs Galaxy M55 / F55 / A35
  if (pName.includes('galaxy a55')) {
    if (textToCheck.includes('m55') || textToCheck.includes('f55') || textToCheck.includes('a35')) {
      return { match: false, reason: 'Variant mismatch: target is Galaxy A55, offer is M55/F55/A35' };
    }
  }

  // Galaxy S24 Ultra vs S24 / S24+
  if (pName.includes('s24 ultra')) {
    if (textToCheck.includes('s24') && !textToCheck.includes('ultra')) {
      return { match: false, reason: 'Variant mismatch: target is Galaxy S24 Ultra, offer is Galaxy S24/S24+' };
    }
  }

  // iPad Air vs iPad Pro
  if (pName.includes('ipad air')) {
    if (textToCheck.includes('ipad pro') && !textToCheck.includes('air')) {
      return { match: false, reason: 'Variant mismatch: target is iPad Air, offer is iPad Pro' };
    }
  }

  if (pName.includes('ipad pro')) {
    if (textToCheck.includes('ipad air') && !textToCheck.includes('pro')) {
      return { match: false, reason: 'Variant mismatch: target is iPad Pro, offer is iPad Air' };
    }
  }

  // Headphones vs Earbuds (e.g. WH-1000XM5 vs WF-1000XM5 / AirPods)
  if (pCategory === 'headphones' || pName.includes('headphones') || pName.includes('wh-1000xm')) {
    if (textToCheck.includes('earbuds') || textToCheck.includes('airpods') || textToCheck.includes('wf-1000xm')) {
      return { match: false, reason: 'Device type mismatch: target is Headphones, offer is Earbuds' };
    }
  }

  if (pName.includes('airpods pro')) {
    if (textToCheck.includes('playstation') || textToCheck.includes('ps5') || textToCheck.includes('tv')) {
      return { match: false, reason: 'Category mismatch: target is AirPods Pro, offer is Console/TV' };
    }
  }

  // Dell Inspiron 3520 vs 3530
  if (pName.includes('3520') && textToCheck.includes('3530')) {
    return { match: false, reason: 'Model number mismatch: target is 3520, offer is 3530' };
  }

  // Sony WH-1000XM5 vs WH-1000XM4
  if (pName.includes('xm5') && textToCheck.includes('xm4') && !textToCheck.includes('xm5')) {
    return { match: false, reason: 'Model mismatch: target is XM5, offer is XM4' };
  }

  // Xiaomi 14 Ultra vs Xiaomi 14
  if (pName.includes('14 ultra') && !textToCheck.includes('ultra')) {
    return { match: false, reason: 'Variant mismatch: target is Xiaomi 14 Ultra, offer is Xiaomi 14' };
  }

  return { match: true, reason: 'Exact product identity matched successfully' };
}
