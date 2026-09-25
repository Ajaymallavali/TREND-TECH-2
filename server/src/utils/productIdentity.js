import { determineProductCategory, normalizeCategory } from './categoryMapper.js';

const NON_BRAND_TAXONOMY_LABELS = new Set([
  'smartphone', 'smartphones', 'feature phone', 'foldable phone', 'laptop', 'laptops', 'desktop',
  'television', 'televisions', 'smartwatch & wearables', 'air conditioners', 'washing machines',
  'audio', 'consoles', 'gaming', 'cameras', 'computer accessories', 'tops',
  'bottoms', 'footwear', 'accessories', 'dresses', 'outerwear', 'activewear',
  'ethnic', 'kids', 'boys', 'girls', 'men', 'women', 'apparel', 'sports & fitness',
  'bags & travel', 'beauty & personal care', 'home appliances', 'fashion accessories'
]);

export function isRealCommercialBrand(brand) {
  if (!brand || typeof brand !== 'string') return false;
  const cleaned = brand.trim().toLowerCase();
  if (cleaned === '' || NON_BRAND_TAXONOMY_LABELS.has(cleaned)) return false;
  return true;
}

/**
 * Normalizes brand string to canonical lowercase title case.
 */
export function normalizeBrand(brand) {
  if (!brand || typeof brand !== 'string') return '';
  const trimmed = brand.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower === 'realme' || lower === 'real me') return 'Realme';
  if (lower === 'poco') return 'Poco';
  if (lower === 'iqoo') return 'iQOO';
  if (lower === 'oppo') return 'Oppo';
  if (lower === 'vivo') return 'Vivo';
  if (lower === 'oneplus' || lower === 'one plus') return 'OnePlus';
  if (lower === 'apple') return 'Apple';
  if (lower === 'samsung') return 'Samsung';
  if (lower === 'xiaomi' || lower === 'mi' || lower === 'redmi') return 'Xiaomi';
  if (lower === 'google') return 'Google';
  if (lower === 'motorola' || lower === 'moto') return 'Motorola';
  if (lower === 'nothing') return 'Nothing';
  if (lower === 'sony') return 'Sony';
  if (lower === 'lg') return 'LG';
  if (lower === 'daikin') return 'Daikin';
  if (lower === 'voltas') return 'Voltas';
  if (lower === 'blue star' || lower === 'bluestar') return 'Blue Star';
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Extracts storage/RAM/variant info from product name or specs map.
 */
export function extractVariantDetails(name, specs = {}) {
  const nameStr = name || '';
  const specsMap = specs instanceof Map ? Object.fromEntries(specs) : (specs || {});

  const storageMatch = nameStr.match(/(\d+\s*(?:GB|TB))\s*(?:storage|rom)?/i) || [null, specsMap.Storage || specsMap.storage];
  const ramMatch = nameStr.match(/(\d+\s*GB)\s*(?:RAM)/i) || [null, specsMap.RAM || specsMap.ram];
  const colorMatch = nameStr.match(/(black|white|blue|green|titanium|gold|silver|grey|gray|purple|red|yellow|natural)/i);

  return {
    storage: storageMatch ? storageMatch[1] : null,
    ram: ramMatch ? ramMatch[1] : null,
    color: colorMatch ? colorMatch[1] : null,
  };
}

/**
 * Builds canonical identity descriptor object for a Product document.
 */
export function getCanonicalProductIdentity(product) {
  if (!product) return null;

  const brand = normalizeBrand(product.brand);
  const category = determineProductCategory(product);
  const variant = extractVariantDetails(product.name, product.specs);

  return {
    productId: product._id ? product._id.toString() : null,
    name: product.name,
    brand,
    category,
    variant,
    image: product.image || null,
  };
}
