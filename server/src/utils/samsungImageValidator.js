export const GENERIC_ASSET_PATTERNS = [
  'app_ico.png',
  'favicon',
  'icon',
  'logo',
  'samsung-logo',
  'care-image',
  'support',
  'placeholder',
  'default',
  'no-image',
  'generic',
  'ui-asset',
  'nav-',
  'footer-',
  'header-'
];

export function isGenericAsset(urlOrFilename) {
  if (!urlOrFilename) return true;
  const lower = urlOrFilename.toLowerCase();
  for (const pattern of GENERIC_ASSET_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}

export function isWrongModel(dbModel, imageUrl, providedEvidence = {}) {
  // If the image URL contains a model string that contradicts the DB model,
  // we must be careful. Often Samsung URLs have exact models or variants.
  
  if (!imageUrl) return true;
  
  const lowerUrl = imageUrl.toLowerCase();
  const baseDbModel = dbModel.split('-')[1] || dbModel; // SM-R400N -> R400N
  
  // Custom checks based on known failures:
  // e.g. Buds FE: DB model SM-R400N vs URL sm-r420
  if (dbModel === 'SM-R400N' && lowerUrl.includes('r420')) {
    return true; // Cross-model mismatch!
  }
  
  return false;
}
