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
  AUDIO: 'headphones',
  SMARTWATCH: 'smartwatch',
  MONITOR: 'monitor',
  TABLET: 'tablet',
  CAMERA: 'camera',
  GAMING: 'gaming',
  AIR_CONDITIONER: 'air-conditioner',
  WASHING_MACHINE: 'washing-machine',
  REFRIGERATOR: 'refrigerator',
  ACCESSORY: 'accessories',
  ACCESSORIES: 'accessories',
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
  audio: CANONICAL_CATEGORIES.HEADPHONES,

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

  const isLaptopAccessory =
    name.includes('stand') ||
    name.includes('bag') ||
    name.includes('backpack') ||
    name.includes('sleeve') ||
    name.includes('case') ||
    name.includes('cover') ||
    name.includes('cooler') ||
    name.includes('mount') ||
    name.includes('skin');

  // 1. Smartwatch & Fitness Band (Evaluated before OLED/AMOLED display checks!)
  if (
    name.startsWith('smartwatch') ||
    name.includes('smartwatch') ||
    name.includes('amazfit') ||
    name.includes('forerunner') ||
    name.includes('fenix') ||
    name.includes('fitness band') ||
    (name.includes('watch') && !name.includes('stopwatch') && !name.includes('watching')) ||
    categoryRaw === 'smartwatch' ||
    categoryRaw === 'smartwatches' ||
    categoryRaw === 'watches'
  ) {
    return CANONICAL_CATEGORIES.SMARTWATCH;
  }

  // 2. Laptop / Desktop / All-in-One PC (Evaluated before TV/Monitor/Gaming hardware to protect OLED & Gaming laptops)
  if (
    !isLaptopAccessory &&
    (name.startsWith('laptop') ||
      name.startsWith('desktop') ||
      name.includes('macbook') ||
      name.includes('laptop') ||
      name.includes('notebook') ||
      name.includes('thinkpad') ||
      name.includes('ideapad') ||
      name.includes('zenbook') ||
      name.includes('vivobook') ||
      name.includes('swift go') ||
      name.includes('pavilion') ||
      name.includes('spectre') ||
      name.includes('envy') ||
      name.includes('inspiron') ||
      name.includes('latitude') ||
      name.includes('xps') ||
      name.includes('vostro') ||
      name.includes('chromebook') ||
      name.includes('imac') ||
      name.includes('mac mini') ||
      name.includes('mac studio') ||
      name.includes('mac pro') ||
      name.includes('blade 16') ||
      name.includes('blade 14') ||
      name.includes('blade 18') ||
      name.includes('zephyrus') ||
      name.includes('strix scar') ||
      name.includes('predator helios') ||
      name.includes('galaxy book') ||
      name.includes('surface laptop') ||
      name.includes('loq') ||
      name.includes('legion pro') ||
      name.includes('victus') ||
      (name.includes('omen') && !name.includes('women')) ||
      categoryRaw === 'laptop' ||
      categoryRaw === 'laptops')
  ) {
    return CANONICAL_CATEGORIES.LAPTOP;
  }

  // 3. Monitor / Computer Displays (Evaluated before TV to protect OLED gaming monitors)
  if (
    !isLaptopAccessory &&
    !name.includes('marshall') &&
    (name.startsWith('monitor') ||
      name.includes('monitor') ||
      name.includes('ultragear') ||
      name.includes('ultrasharp') ||
      name.includes('proart') ||
      name.includes('agon') ||
      name.includes('studio display') ||
      name.includes('odyssey') ||
      name.includes('rog swift') ||
      name.includes('designvue') ||
      name.includes('zowie') ||
      name.includes('coloredge') ||
      (name.includes('alienware') && (name.includes('aw') || name.includes('hz') || name.includes('oled') || name.includes('curved'))) ||
      categoryRaw === 'monitor' ||
      categoryRaw === 'monitors')
  ) {
    return CANONICAL_CATEGORIES.MONITOR;
  }

  // 4. Audio / Headphones / Earbuds
  if (
    name.startsWith('audio') ||
    name.includes('earphone') ||
    name.includes('headphone') ||
    name.includes('soundbar') ||
    name.includes('speaker') ||
    name.includes('microphone') ||
    name.includes('amplifier') ||
    name.includes('sennheiser') ||
    name.includes('marshall') ||
    name.includes('audio-technica') ||
    name.includes('airpods') ||
    name.includes('earbud') ||
    name.includes('buds') ||
    name.includes('tws') ||
    name.includes('wh-1000xm') ||
    name.includes('wf-1000xm') ||
    name.includes('space q45') ||
    categoryRaw === 'audio' ||
    categoryRaw === 'headphones' ||
    categoryRaw === 'earbuds'
  ) {
    if (name.includes('airpods') || name.includes('earbud') || name.includes('buds') || name.includes('tws') || name.includes('wf-1000xm')) {
      return CANONICAL_CATEGORIES.EARBUDS;
    }
    return CANONICAL_CATEGORIES.HEADPHONES;
  }

  // 5. Cameras & Webcams
  if (
    name.startsWith('camera') ||
    name.startsWith('cameras') ||
    name.includes('camera') ||
    name.includes('webcam') ||
    name.includes('eos r') ||
    name.includes('canon eos') ||
    name.includes('nikon z') ||
    name.includes('sony alpha') ||
    name.includes('gopro') ||
    name.includes('powershot') ||
    name.includes('lumix') ||
    name.includes('insta360') ||
    name.includes('dslr') ||
    categoryRaw === 'camera'
  ) {
    return CANONICAL_CATEGORIES.CAMERA;
  }

  // 6. Tablet / iPad (Evaluated before smartphone so OnePlus Pad, Realme Pad, etc. remain tablets)
  if (
    name.includes('ipad') ||
    name.includes('tablet') ||
    name.includes('tab s') ||
    name.includes('tab a') ||
    name.includes('pad go') ||
    name.includes('pad 6') ||
    name.includes('pad 5') ||
    name.includes('pad 2') ||
    name.includes('pad 9') ||
    name.includes('xiaomi pad') ||
    name.includes('redmi pad') ||
    name.includes('matepad') ||
    categoryRaw === 'tablet'
  ) {
    return CANONICAL_CATEGORIES.TABLET;
  }

  // 7. Washing Machine
  if (
    name.startsWith('washing machines') ||
    name.includes('washing machine') ||
    name.includes('front load') ||
    name.includes('top load') ||
    categoryRaw === 'washing-machine'
  ) {
    return CANONICAL_CATEGORIES.WASHING_MACHINE;
  }

  // 8. Refrigerator
  if (
    name.startsWith('refrigerator') ||
    name.includes('refrigerator') ||
    name.includes('fridge') ||
    categoryRaw === 'refrigerator'
  ) {
    return CANONICAL_CATEGORIES.REFRIGERATOR;
  }

  // 9. Air Conditioner
  if (
    name.startsWith('air conditioner') ||
    name.includes('air conditioner') ||
    name.includes('split ac') ||
    name.includes('window ac') ||
    (brand.includes('air conditioner') && !name.includes('phone')) ||
    categoryRaw === 'air-conditioner'
  ) {
    return CANONICAL_CATEGORIES.AIR_CONDITIONER;
  }

  // 10. Television (Only reaches genuine TVs now)
  if (
    name.startsWith('television') ||
    name.startsWith('tv ') ||
    name.includes('tv') ||
    name.includes('television') ||
    name.includes('bravia') ||
    name.includes('oled') ||
    name.includes('qled') ||
    name.includes('crystal uhd') ||
    name.includes('nanocell') ||
    categoryRaw === 'television'
  ) {
    return CANONICAL_CATEGORIES.TELEVISION;
  }

  // 11. Computer Accessories & PC Components & Gaming Consoles
  if (
    name.startsWith('computer accessories') ||
    name.includes('keyboard') ||
    name.includes('mouse') ||
    name.includes('mechanical') ||
    name.includes('membrane') ||
    name.includes('gpu') ||
    name.includes('graphics') ||
    name.includes('rtx') ||
    name.includes('gtx') ||
    name.includes('radeon') ||
    name.includes('intel') ||
    name.includes('amd') ||
    name.includes('nvidia') ||
    name.includes('gigabyte') ||
    name.includes('msi') ||
    name.includes('zotac') ||
    name.includes('corsair') ||
    name.includes('printer') ||
    name.includes('scanner') ||
    name.includes('docking') ||
    name.includes('usb hub') ||
    name.includes('router') ||
    name.includes('seagate') ||
    name.includes('sandisk') ||
    name.includes('kingston') ||
    name.includes('tp-link') ||
    name.includes('netgear') ||
    name.startsWith('gaming') ||
    name.startsWith('consoles') ||
    name.includes('playstation') ||
    name.includes('xbox') ||
    name.includes('nintendo') ||
    name.includes('rog ally') ||
    categoryRaw === 'gaming' ||
    categoryRaw === 'gaming consoles'
  ) {
    return CANONICAL_CATEGORIES.GAMING;
  }

  // 12. Shoes & Sneakers
  if (
    name.startsWith('footwear') ||
    name.includes('shoe') ||
    name.includes('sneaker') ||
    name.includes('footwear') ||
    name.includes('boot') ||
    name.includes('heel') ||
    name.includes('flat') ||
    name.includes('loafer') ||
    name.includes('sandal') ||
    name.includes('slide') ||
    name.includes('flip-flop') ||
    categoryRaw === 'shoes'
  ) {
    return CANONICAL_CATEGORIES.SHOES;
  }

  // 13. Bags & Luggage
  if (
    name.startsWith('bags') ||
    name.includes('bag') ||
    name.includes('backpack') ||
    name.includes('luggage') ||
    name.includes('suitcase') ||
    name.includes('handbag') ||
    name.includes('tote') ||
    name.includes('wallet') ||
    categoryRaw === 'bags'
  ) {
    return CANONICAL_CATEGORIES.BAGS;
  }

  // 14. Beauty & Personal Care
  if (
    name.startsWith('beauty') ||
    name.includes('lipstick') ||
    name.includes('foundation') ||
    name.includes('serum') ||
    name.includes('cream') ||
    name.includes('shampoo') ||
    name.includes('conditioner') ||
    name.includes('sunscreen') ||
    name.includes('moisturizer') ||
    name.includes('cleanser') ||
    name.includes('eyeliner') ||
    name.includes('mascara') ||
    name.includes('primer') ||
    name.includes('hair') ||
    name.includes('makeup') ||
    categoryRaw === 'beauty-personal-care' ||
    categoryRaw.includes('beauty')
  ) {
    return CANONICAL_CATEGORIES.BEAUTY_PERSONAL_CARE;
  }

  // 15. Kids & Apparel
  if (name.includes('kids') || name.includes('boys') || name.includes('girls')) {
    return name.includes('girls') ? CANONICAL_CATEGORIES.WOMENS_CLOTHING : CANONICAL_CATEGORIES.MENS_CLOTHING;
  }

  // 16. Men's Clothing
  if (
    name.startsWith('men ') ||
    name.includes('sherwani') ||
    name.includes('nehru jacket') ||
    name.includes('bandhgala') ||
    name.includes('dhoti') ||
    name.includes('chinos') ||
    name.includes('formal shirt') ||
    name.includes('oxford shirt') ||
    name.includes('polo t-shirt') ||
    name.includes('henley') ||
    name.includes('waistcoat') ||
    categoryRaw === 'men fashion' ||
    categoryRaw === 'mens-clothing'
  ) {
    return CANONICAL_CATEGORIES.MENS_CLOTHING;
  }

  // 17. Women's Clothing
  if (
    name.startsWith('women ') ||
    name.startsWith('dresses') ||
    name.startsWith('ethnic') ||
    name.includes('saree') ||
    name.includes('lehenga') ||
    name.includes('kurti') ||
    name.includes('anarkali') ||
    name.includes('palazzo') ||
    name.includes('sharara') ||
    name.includes('gharara') ||
    name.includes('dupatta') ||
    name.includes('dress') ||
    name.includes('skirt') ||
    name.includes('blouse') ||
    name.includes('crop top') ||
    categoryRaw === 'women fashion' ||
    categoryRaw === 'womens-clothing'
  ) {
    return CANONICAL_CATEGORIES.WOMENS_CLOTHING;
  }

  // 18. General Apparel
  if (
    name.startsWith('tops') ||
    name.startsWith('bottoms') ||
    name.startsWith('outerwear') ||
    name.startsWith('activewear') ||
    name.startsWith('apparel')
  ) {
    return name.includes('women') || name.includes('dress') || name.includes('skirt') || name.includes('top')
      ? CANONICAL_CATEGORIES.WOMENS_CLOTHING
      : CANONICAL_CATEGORIES.MENS_CLOTHING;
  }

  // 19. Accessories & Sports
  if (
    name.startsWith('sports') ||
    name.startsWith('accessories') ||
    name.includes('case') ||
    name.includes('cover') ||
    name.includes('screen protector') ||
    name.includes('tempered glass') ||
    name.includes('mat') ||
    name.includes('sunglasses') ||
    name.includes('tie') ||
    name.includes('cufflinks') ||
    categoryRaw === 'accessories' ||
    categoryRaw === 'accessory' ||
    categoryRaw === 'fashion accessories' ||
    categoryRaw.includes('sports')
  ) {
    return CANONICAL_CATEGORIES.ACCESSORIES;
  }

  // 20. Smartphone - Strict Check: ONLY Genuine Mobile Phones
  if (
    name.includes('iphone') ||
    name.includes('galaxy s') ||
    name.includes('galaxy a') ||
    name.includes('galaxy z') ||
    name.includes('galaxy m') ||
    name.includes('galaxy f') ||
    name.includes('pixel') ||
    name.includes('oneplus') ||
    name.includes('xiaomi') ||
    name.includes('redmi') ||
    name.includes('poco') ||
    name.includes('realme') ||
    name.includes('vivo') ||
    name.includes('oppo') ||
    name.includes('motorola') ||
    name.includes('nothing phone') ||
    name.includes('iqoo') ||
    name.includes('nokia') ||
    name.includes('smartphone') ||
    name.includes('foldable phone')
  ) {
    return CANONICAL_CATEGORIES.SMARTPHONE;
  }

  // Fallback to normalized product.category if defined and matches known canonical category (and not smartphone)
  const normalizedRaw = normalizeCategory(categoryRaw);
  if (normalizedRaw && normalizedRaw !== CANONICAL_CATEGORIES.SMARTPHONE) {
    return normalizedRaw;
  }

  return CANONICAL_CATEGORIES.ACCESSORIES;
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
