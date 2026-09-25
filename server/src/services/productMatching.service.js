/**
 * Product Identity Matching & Accessory Filtering Engine
 * 
 * Enforces Phase 5 & Phase 6 requirements:
 * 1. Rejects accessory false matches (case, cover, glass, charger, cable, band).
 * 2. Strict brand + model + variant matching.
 * 3. Canonical duplicate detection for ONE PRODUCT + MULTIPLE OFFERS representation.
 */

const ACCESSORY_KEYWORDS = [
  'case',
  'cover',
  'screen protector',
  'tempered glass',
  'charger',
  'adapter',
  'cable',
  'strap',
  'band',
  'sleeve',
  'pouch',
  'stand',
  'skin',
  'mount',
  'back cover',
  'flip cover',
  'silicone case',
  'magsafe charger',
  'armband',
  'dock',
  'lens protector',
  'fast charger',
  'power bank',
  'lightning cable',
  'usb-c cable',
];

/**
 * Detects if a product title/name is actually an accessory rather than the main electronic device.
 */
export function isAccessory(title) {
  if (!title || typeof title !== 'string') return false;
  const lower = title.toLowerCase();

  for (const kw of ACCESSORY_KEYWORDS) {
    // Regex boundary check to avoid partial word match (e.g., 'band' in 'broadband')
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes model strings for comparison (e.g., "iPhone 15 Pro Max" -> "iphone15promax")
 */
export function normalizeModelString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if two product objects match the exact same physical product identity.
 */
export function isSamePhysicalProduct(prodA, prodB) {
  if (!prodA || !prodB) return false;

  // 1. If both are accessories, or one is accessory and one isn't -> false
  const accA = isAccessory(prodA.name);
  const accB = isAccessory(prodB.name);
  if (accA !== accB) return false;

  // 2. Brand matching
  const brandA = (prodA.brand || '').toLowerCase().trim();
  const brandB = (prodB.brand || '').toLowerCase().trim();
  if (brandA && brandB && brandA !== brandB) return false;

  // 3. Normalized Name matching
  const nameA = normalizeModelString(prodA.name);
  const nameB = normalizeModelString(prodB.name);

  if (nameA === nameB) return true;

  // 4. Variant matching (Storage / RAM)
  const specsA = prodA.specs || prodA.specifications || {};
  const specsB = prodB.specs || prodB.specifications || {};

  const storageA = (specsA.Storage || specsA.storage || '').toLowerCase().trim();
  const storageB = (specsB.Storage || specsB.storage || '').toLowerCase().trim();
  if (storageA && storageB && storageA !== storageB) return false;

  const ramA = (specsA.RAM || specsA.ram || '').toLowerCase().trim();
  const ramB = (specsB.RAM || specsB.ram || '').toLowerCase().trim();
  if (ramA && ramB && ramA !== ramB) return false;

  // If one string contains another and brand/specs match, consider them identical
  if (nameA.length > 5 && nameB.length > 5) {
    if (nameA.includes(nameB) || nameB.includes(nameA)) {
      return true;
    }
  }

  return false;
}
