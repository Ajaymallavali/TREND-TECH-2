/**
 * Canonical Category Normalization Layer for TREND-TECH
 * 
 * Maps any frontend parameter, search query term, or external API category name
 * to the exact canonical category used in the Product collection.
 */

export const CANONICAL_CATEGORIES = {
  SMARTPHONE: 'smartphone',
  LAPTOP: 'laptop',
  TELEVISION: 'television',
  HEADPHONES: 'headphones',
  EARBUDS: 'earbuds',
  AUDIO: 'audio',
  SMARTWATCH: 'smartwatch',
  MONITOR: 'monitor',
  TABLET: 'tablet',
  CAMERA: 'camera',
  GAMING: 'gaming',
  AIR_CONDITIONER: 'air-conditioner',
  WASHING_MACHINE: 'washing-machine',
  REFRIGERATOR: 'refrigerator',
  ACCESSORY: 'accessory',
  HOME_APPLIANCES: 'home-appliances',
  MENS_CLOTHING: 'mens-clothing',
  WOMENS_CLOTHING: 'womens-clothing',
  SHOES: 'shoes',
  BAGS: 'bags',
  BEAUTY_PERSONAL_CARE: 'beauty-personal-care',
  FASHION_ACCESSORIES: 'fashion-accessories',
};

const CATEGORY_ALIAS_MAP = {
  // Smartphone aliases
  smartphone: CANONICAL_CATEGORIES.SMARTPHONE,
  smartphones: CANONICAL_CATEGORIES.SMARTPHONE,
  mobile: CANONICAL_CATEGORIES.SMARTPHONE,
  mobiles: CANONICAL_CATEGORIES.SMARTPHONE,
  phone: CANONICAL_CATEGORIES.SMARTPHONE,
  phones: CANONICAL_CATEGORIES.SMARTPHONE,

  // Laptop aliases
  laptop: CANONICAL_CATEGORIES.LAPTOP,
  laptops: CANONICAL_CATEGORIES.LAPTOP,
  notebook: CANONICAL_CATEGORIES.LAPTOP,

  // Television aliases
  television: CANONICAL_CATEGORIES.TELEVISION,
  televisions: CANONICAL_CATEGORIES.TELEVISION,
  tv: CANONICAL_CATEGORIES.TELEVISION,
  tvs: CANONICAL_CATEGORIES.TELEVISION,

  // Audio / Headphones / Earbuds
  headphones: CANONICAL_CATEGORIES.HEADPHONES,
  headphone: CANONICAL_CATEGORIES.HEADPHONES,
  earbuds: CANONICAL_CATEGORIES.EARBUDS,
  earbud: CANONICAL_CATEGORIES.EARBUDS,
  audio: CANONICAL_CATEGORIES.AUDIO,

  // Smartwatch aliases
  smartwatch: CANONICAL_CATEGORIES.SMARTWATCH,
  smartwatches: CANONICAL_CATEGORIES.SMARTWATCH,
  watch: CANONICAL_CATEGORIES.SMARTWATCH,

  // Monitor aliases
  monitor: CANONICAL_CATEGORIES.MONITOR,
  monitors: CANONICAL_CATEGORIES.MONITOR,

  // Tablet aliases
  tablet: CANONICAL_CATEGORIES.TABLET,
  tablets: CANONICAL_CATEGORIES.TABLET,
  ipad: CANONICAL_CATEGORIES.TABLET,

  // Camera aliases
  camera: CANONICAL_CATEGORIES.CAMERA,
  cameras: CANONICAL_CATEGORIES.CAMERA,

  // Gaming aliases
  gaming: CANONICAL_CATEGORIES.GAMING,

  // Home Appliances
  'air-conditioner': CANONICAL_CATEGORIES.AIR_CONDITIONER,
  ac: CANONICAL_CATEGORIES.AIR_CONDITIONER,
  'washing-machine': CANONICAL_CATEGORIES.WASHING_MACHINE,
  refrigerator: CANONICAL_CATEGORIES.REFRIGERATOR,
  'home-appliances': CANONICAL_CATEGORIES.HOME_APPLIANCES,

  // Accessories
  accessory: CANONICAL_CATEGORIES.ACCESSORY,
  accessories: CANONICAL_CATEGORIES.ACCESSORY,

  // Fashion categories
  'mens-clothing': CANONICAL_CATEGORIES.MENS_CLOTHING,
  clothing: CANONICAL_CATEGORIES.MENS_CLOTHING,
  men: CANONICAL_CATEGORIES.MENS_CLOTHING,
  'womens-clothing': CANONICAL_CATEGORIES.WOMENS_CLOTHING,
  women: CANONICAL_CATEGORIES.WOMENS_CLOTHING,
  shoes: CANONICAL_CATEGORIES.SHOES,
  footwear: CANONICAL_CATEGORIES.SHOES,
  sneakers: CANONICAL_CATEGORIES.SHOES,
  bags: CANONICAL_CATEGORIES.BAGS,
  luggage: CANONICAL_CATEGORIES.BAGS,
  'beauty-personal-care': CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE,
  beauty: CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE,
  skincare: CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE,
  'fashion-accessories': CANONICAL_CATEGORIES.FASHION_ACCESSORIES,
};

export function normalizeCategory(input) {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().toLowerCase();
  return CATEGORY_ALIAS_MAP[cleaned] || cleaned;
}

/**
 * Determines the canonical category of a product strictly based on its identity
 * (name, brand, description, tags, specs).
 */
export function determineProductCategory(product) {
  if (!product) return null;
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const categoryRaw = (product.category || '').toLowerCase();

  // 0. Phone Accessories / Chargers / Cases / Covers / Screen Protectors / Sports Mat
  if (
    name.includes(' case') ||
    name.includes('cover') ||
    name.includes('screen protector') ||
    name.includes('tempered glass') ||
    name.includes('charging cable') ||
    name.includes('charger') ||
    name.includes('power bank') ||
    name.includes('adapter') ||
    name.includes('yoga mat') ||
    name.includes('mat ') ||
    name.includes('treadmill') ||
    name.includes('dumbbells') ||
    categoryRaw === 'accessory' ||
    categoryRaw === 'accessories' ||
    categoryRaw === 'phone-accessory' ||
    categoryRaw.includes('sports')
  ) {
    return CANONICAL_CATEGORIES.ACCESSORY;
  }

  // 1. Desktop / Mac Mini / iMac -> LAPTOP / COMPUTERS
  if (
    name.includes('desktop') ||
    name.includes('imac') ||
    name.includes('mac mini') ||
    name.includes('mac studio') ||
    name.includes('mac pro') ||
    (name.includes('pc') && brand.includes('desktop'))
  ) {
    return CANONICAL_CATEGORIES.LAPTOP;
  }

  // 2. Laptop / Notebook / MacBook
  if (
    name.includes('macbook') ||
    name.includes('laptop') ||
    name.includes('notebook') ||
    name.includes('thinkpad') ||
    name.includes('ideapad') ||
    name.includes('zenbook') ||
    name.includes('pavilion') ||
    name.includes('vivobook') ||
    name.includes('spectre') ||
    name.includes('chromebook')
  ) {
    return CANONICAL_CATEGORIES.LAPTOP;
  }

  // 3. Tablet (CHECK BEFORE BRAND KEYWORDS)
  if (
    name.includes('ipad') ||
    name.includes('tablet') ||
    name.includes('pad 6') ||
    name.includes('pad 5') ||
    name.includes('pad max') ||
    name.includes('xiaomi pad') ||
    name.includes('redmi pad') ||
    name.includes('realme pad') ||
    name.includes('galaxy tab') ||
    name.includes('lenovo tab') ||
    name.includes('surface pro') ||
    name.includes('matepad')
  ) {
    return CANONICAL_CATEGORIES.TABLET;
  }

  // 4. Air Conditioner
  if (
    name.includes('air conditioner') ||
    name.includes('split ac') ||
    name.includes('window ac') ||
    (brand.includes('air conditioner') && !name.includes('phone'))
  ) {
    return CANONICAL_CATEGORIES.AIR_CONDITIONER;
  }

  // 5. Washing Machine
  if (name.includes('washing machine') || name.includes('front load') || name.includes('top load')) {
    return CANONICAL_CATEGORIES.WASHING_MACHINE;
  }

  // 6. Refrigerator
  if (name.includes('refrigerator') || name.includes('fridge')) {
    return CANONICAL_CATEGORIES.REFRIGERATOR;
  }

  // 7. Television
  if (
    name.includes('tv') ||
    name.includes('television') ||
    name.includes('bravia') ||
    name.includes('oled') ||
    name.includes('qled')
  ) {
    return CANONICAL_CATEGORIES.TELEVISION;
  }

  // 8. Camera
  if (
    name.includes('camera') ||
    name.includes('eos r') ||
    name.includes('canon eos') ||
    name.includes('nikon z') ||
    name.includes('sony alpha') ||
    name.includes('gopro') ||
    name.includes('powershot')
  ) {
    return CANONICAL_CATEGORIES.CAMERA;
  }

  // 9. Headphones
  if (
    name.includes('headphone') ||
    name.includes('wh-1000xm') ||
    name.includes('airpods max') ||
    (categoryRaw === 'headphones' && !name.includes('bud'))
  ) {
    return CANONICAL_CATEGORIES.HEADPHONES;
  }

  // 10. Earbuds
  if (
    name.includes('earbud') ||
    name.includes('airpods') ||
    name.includes('buds') ||
    name.includes('tws')
  ) {
    return CANONICAL_CATEGORIES.EARBUDS;
  }

  // 11. Smartwatch
  if (
    name.includes('watch') ||
    name.includes('smartwatch') ||
    name.includes('fitness band')
  ) {
    return CANONICAL_CATEGORIES.SMARTWATCH;
  }

  // 12. Monitor
  if (name.includes('monitor') || name.includes('display')) {
    return CANONICAL_CATEGORIES.MONITOR;
  }

  // 13. Shoes & Sneakers
  if (
    name.includes('shoe') ||
    name.includes('sneaker') ||
    name.includes('footwear') ||
    name.includes('air force 1') ||
    name.includes('jordan')
  ) {
    return CANONICAL_CATEGORIES.SHOES;
  }

  // 14. Clothing / Kurta / Apparel
  if (
    name.includes('kurta') ||
    name.includes('jeans') ||
    name.includes('t-shirt') ||
    name.includes('shirt') ||
    name.includes('dress') ||
    categoryRaw.includes('clothing') ||
    categoryRaw.includes('fashion')
  ) {
    return name.includes('women') ? CANONICAL_CATEGORIES.WOMENS_CLOTHING : CANONICAL_CATEGORIES.MENS_CLOTHING;
  }

  // 15. Beauty / Personal Care
  if (
    name.includes('mascara') ||
    name.includes('shampoo') ||
    name.includes('face wash') ||
    name.includes('lipstick') ||
    name.includes('serum') ||
    categoryRaw.includes('beauty')
  ) {
    return CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE;
  }

  // 16. Bags / Luggage
  if (name.includes('bag') || name.includes('backpack') || name.includes('luggage')) {
    return CANONICAL_CATEGORIES.BAGS;
  }

  // 17. Smartphone - specific model or keyword check
  if (
    name.includes('iphone') ||
    name.includes('galaxy s') ||
    name.includes('galaxy a') ||
    name.includes('galaxy z') ||
    name.includes('pixel') ||
    name.includes('oneplus') ||
    name.includes('xiaomi 14') ||
    name.includes('xiaomi 15') ||
    name.includes('redmi note') ||
    name.includes('redmi 13') ||
    name.includes('redmi 12') ||
    name.includes('realme') ||
    name.includes('vivo') ||
    name.includes('oppo') ||
    name.includes('motorola') ||
    name.includes('nothing phone') ||
    name.includes('nokia') ||
    name.includes('iqoo') ||
    name.includes('poco') ||
    name.includes('smartphone') ||
    name.includes('mobile')
  ) {
    return CANONICAL_CATEGORIES.SMARTPHONE;
  }

  // Fallback to normalized product.category if defined and matches known canonical category
  const normalizedRaw = normalizeCategory(categoryRaw);
  if (normalizedRaw) return normalizedRaw;

  return CANONICAL_CATEGORIES.SMARTPHONE;
}

export function getCategoryList() {
  return [
    { id: CANONICAL_CATEGORIES.SMARTPHONE, name: 'Smartphones' },
    { id: CANONICAL_CATEGORIES.LAPTOP, name: 'Laptops' },
    { id: CANONICAL_CATEGORIES.TELEVISION, name: 'TVs' },
    { id: CANONICAL_CATEGORIES.HEADPHONES, name: 'Headphones' },
    { id: CANONICAL_CATEGORIES.EARBUDS, name: 'Earbuds' },
    { id: CANONICAL_CATEGORIES.AUDIO, name: 'Audio' },
    { id: CANONICAL_CATEGORIES.SMARTWATCH, name: 'Smartwatches' },
    { id: CANONICAL_CATEGORIES.MONITOR, name: 'Monitors' },
    { id: CANONICAL_CATEGORIES.TABLET, name: 'Tablets' },
    { id: CANONICAL_CATEGORIES.CAMERA, name: 'Cameras' },
    { id: CANONICAL_CATEGORIES.GAMING, name: 'Gaming' },
    { id: CANONICAL_CATEGORIES.AIR_CONDITIONER, name: 'Air Conditioners' },
    { id: CANONICAL_CATEGORIES.WASHING_MACHINE, name: 'Washing Machines' },
    { id: CANONICAL_CATEGORIES.REFRIGERATOR, name: 'Refrigerators' },
    { id: CANONICAL_CATEGORIES.SHOES, name: 'Shoes' },
    { id: CANONICAL_CATEGORIES.MENS_CLOTHING, name: "Men's Fashion" },
    { id: CANONICAL_CATEGORIES.WOMENS_CLOTHING, name: "Women's Fashion" },
    { id: CANONICAL_CATEGORIES.BAGS, name: 'Bags & Luggage' },
    { id: CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE, name: 'Beauty & Personal Care' },
  ];
}

/**
 * Evaluates whether a product is a real, commercially identifiable product
 * (excluding generic synthetic template names like "Smartphone Phone series" or "Air Conditioners Daikin").
 */
export function isUserFacingProductEligible(product) {
  if (!product || !product.name) return false;
  const name = product.name.trim();
  const nameLower = name.toLowerCase();

  // Synthetic template pattern rejection (Part 4 specification)
  const syntheticTemplates = [
    'smartphone phone series',
    'smartphone phone (a)',
    'smartphone cmf phone',
    'smartphone neo',
    'smartphone z series',
    'cameras canon',
    'cameras nikon',
    'cameras sony',
    'desktop pcs',
    'desktop mini pcs',
    'desktop all-in-one pcs'
  ];

  if (syntheticTemplates.some(t => nameLower === t)) {
    return false;
  }

  // Generic prefix template checks
  if (nameLower.startsWith('smartphone phone') || nameLower.startsWith('cameras ')) {
    return false;
  }

  // Accessory rejection when target category is main device (Part 10 specification)
  const canonicalCat = determineProductCategory(product);
  const mainDeviceCategories = [
    CANONICAL_CATEGORIES.SMARTPHONE,
    CANONICAL_CATEGORIES.LAPTOP,
    CANONICAL_CATEGORIES.TELEVISION,
    CANONICAL_CATEGORIES.CAMERA,
    CANONICAL_CATEGORIES.AIR_CONDITIONER,
    CANONICAL_CATEGORIES.WASHING_MACHINE,
    CANONICAL_CATEGORIES.REFRIGERATOR
  ];

  if (mainDeviceCategories.includes(canonicalCat)) {
    const accessoryKeywords = [
      'case',
      'cover',
      'screen protector',
      'tempered glass',
      'keyboard skin',
      'charging cable',
      'charger adapter',
      'mount',
      'stand',
      'pouch',
      'sleeve'
    ];
    if (accessoryKeywords.some((kw) => nameLower.includes(kw))) {
      return false;
    }
  }

  return true;
}
