import mongoose from 'mongoose';

function classifyProduct(p) {
  const name = (p.name || '').trim();
  const nameLower = name.toLowerCase();
  const curCat = (p.category || '').trim().toLowerCase();
  let brand = (p.brand || '').trim();

  // 1. Audio / Headphones / Earbuds
  if (
    nameLower.startsWith('audio') ||
    nameLower.includes('earphone') ||
    nameLower.includes('headphone') ||
    nameLower.includes('soundbar') ||
    nameLower.includes('speaker') ||
    nameLower.includes('microphone') ||
    nameLower.includes('amplifier') ||
    nameLower.includes('sennheiser') ||
    nameLower.includes('marshall') ||
    nameLower.includes('audio-technica') ||
    nameLower.includes('airpods') ||
    nameLower.includes('earbud') ||
    nameLower.includes('buds') ||
    nameLower.includes('tws') ||
    nameLower.includes('wh-1000xm') ||
    nameLower.includes('space q45') ||
    curCat === 'audio' ||
    curCat === 'headphones' ||
    curCat === 'earbuds'
  ) {
    const isEarbud = nameLower.includes('airpods') || nameLower.includes('earbud') || nameLower.includes('buds') || nameLower.includes('tws');
    const cat = isEarbud ? 'earbuds' : 'headphones';

    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('sennheiser')) brand = 'Sennheiser';
      else if (nameLower.includes('marshall')) brand = 'Marshall';
      else if (nameLower.includes('audio-technica')) brand = 'Audio-Technica';
      else if (nameLower.includes('oneplus')) brand = 'OnePlus';
      else if (nameLower.includes('realme')) brand = 'Realme';
      else if (nameLower.includes('sony')) brand = 'Sony';
      else if (nameLower.includes('jbl')) brand = 'JBL';
      else if (nameLower.includes('bose')) brand = 'Bose';
      else if (nameLower.includes('boat')) brand = 'boAt';
      else if (nameLower.includes('noise')) brand = 'Noise';
      else if (nameLower.includes('apple')) brand = 'Apple';
      else brand = 'Audio';
    }
    return { category: cat, brand };
  }

  // 2. Computer Accessories & PC Components (Keyboards, Mice, Processors, GPUs, Storage, Printers, etc.) -> 'gaming'
  if (
    nameLower.startsWith('computer accessories') ||
    nameLower.includes('keyboard') ||
    nameLower.includes('mouse') ||
    nameLower.includes('mechanical') ||
    nameLower.includes('membrane') ||
    nameLower.includes('gpu') ||
    nameLower.includes('graphics') ||
    nameLower.includes('rtx') ||
    nameLower.includes('gtx') ||
    nameLower.includes('radeon') ||
    nameLower.includes('intel') ||
    nameLower.includes('amd') ||
    nameLower.includes('nvidia') ||
    nameLower.includes('gigabyte') ||
    nameLower.includes('msi') ||
    nameLower.includes('zotac') ||
    nameLower.includes('corsair') ||
    nameLower.includes('printer') ||
    nameLower.includes('scanner') ||
    nameLower.includes('docking') ||
    nameLower.includes('usb hub') ||
    nameLower.includes('router') ||
    nameLower.includes('webcam') ||
    nameLower.includes('seagate') ||
    nameLower.includes('sandisk') ||
    nameLower.includes('kingston') ||
    nameLower.includes('tp-link') ||
    nameLower.includes('netgear') ||
    nameLower.startsWith('gaming') ||
    nameLower.startsWith('consoles') ||
    nameLower.includes('playstation') ||
    nameLower.includes('xbox') ||
    nameLower.includes('nintendo') ||
    nameLower.includes('rog ally') ||
    curCat === 'gaming' ||
    curCat === 'gaming consoles'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('intel')) brand = 'Intel';
      else if (nameLower.includes('amd')) brand = 'AMD';
      else if (nameLower.includes('nvidia')) brand = 'NVIDIA';
      else if (nameLower.includes('corsair')) brand = 'Corsair';
      else if (nameLower.includes('gigabyte')) brand = 'Gigabyte';
      else if (nameLower.includes('msi')) brand = 'MSI';
      else if (nameLower.includes('zotac')) brand = 'Zotac';
      else if (nameLower.includes('asus') || nameLower.includes('rog')) brand = 'Asus';
      else if (nameLower.includes('playstation') || nameLower.includes('sony')) brand = 'Sony';
      else if (nameLower.includes('xbox') || nameLower.includes('microsoft')) brand = 'Microsoft';
      else if (nameLower.includes('nintendo')) brand = 'Nintendo';
      else if (nameLower.includes('logitech')) brand = 'Logitech';
      else if (nameLower.includes('razer')) brand = 'Razer';
      else if (nameLower.includes('seagate')) brand = 'Seagate';
      else if (nameLower.includes('sandisk')) brand = 'SanDisk';
      else if (nameLower.includes('kingston')) brand = 'Kingston';
      else if (nameLower.includes('tp-link')) brand = 'TP-Link';
      else if (nameLower.includes('netgear')) brand = 'Netgear';
      else brand = 'Gaming Gear';
    }
    return { category: 'gaming', brand };
  }

  // 3. Washing Machines -> 'washing-machine'
  if (
    nameLower.startsWith('washing machines') ||
    nameLower.includes('washing machine') ||
    nameLower.includes('front load') ||
    nameLower.includes('top load') ||
    curCat === 'washing-machine'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('lg')) brand = 'LG';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('whirlpool')) brand = 'Whirlpool';
      else if (nameLower.includes('ifb')) brand = 'IFB';
      else if (nameLower.includes('bosch')) brand = 'Bosch';
      else if (nameLower.includes('haier')) brand = 'Haier';
      else if (nameLower.includes('panasonic')) brand = 'Panasonic';
      else if (nameLower.includes('godrej')) brand = 'Godrej';
      else if (nameLower.includes('voltas')) brand = 'Voltas Beko';
      else if (nameLower.includes('siemens')) brand = 'Siemens';
      else brand = 'Home Appliances';
    }
    return { category: 'washing-machine', brand };
  }

  // 4. Refrigerators -> 'refrigerator'
  if (
    nameLower.startsWith('refrigerator') ||
    nameLower.includes('refrigerator') ||
    nameLower.includes('fridge') ||
    curCat === 'refrigerator'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('lg')) brand = 'LG';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('whirlpool')) brand = 'Whirlpool';
      else if (nameLower.includes('haier')) brand = 'Haier';
      else if (nameLower.includes('godrej')) brand = 'Godrej';
      else brand = 'Home Appliances';
    }
    return { category: 'refrigerator', brand };
  }

  // 5. Air Conditioners -> 'air-conditioner'
  if (
    nameLower.startsWith('air conditioner') ||
    nameLower.includes('air conditioner') ||
    nameLower.includes('split ac') ||
    nameLower.includes('window ac') ||
    curCat === 'air-conditioner'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('daikin')) brand = 'Daikin';
      else if (nameLower.includes('lg')) brand = 'LG';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('voltas')) brand = 'Voltas';
      else if (nameLower.includes('blue star')) brand = 'Blue Star';
      else if (nameLower.includes('panasonic')) brand = 'Panasonic';
      else if (nameLower.includes('carrier')) brand = 'Carrier';
      else if (nameLower.includes('hitachi')) brand = 'Hitachi';
      else if (nameLower.includes('lloyd')) brand = 'Lloyd';
      else if (nameLower.includes('whirlpool')) brand = 'Whirlpool';
      else brand = 'Home Appliances';
    }
    return { category: 'air-conditioner', brand };
  }

  // 6. Televisions -> 'television'
  if (
    nameLower.startsWith('television') ||
    nameLower.includes('television') ||
    nameLower.includes('tv') ||
    nameLower.includes('bravia') ||
    nameLower.includes('oled') ||
    nameLower.includes('qled') ||
    nameLower.includes('crystal uhd') ||
    nameLower.includes('nanocell') ||
    curCat === 'television'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('sony')) brand = 'Sony';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('lg')) brand = 'LG';
      else if (nameLower.includes('oneplus')) brand = 'OnePlus';
      else if (nameLower.includes('redmi') || nameLower.includes('xiaomi')) brand = 'Xiaomi';
      else if (nameLower.includes('tcl')) brand = 'TCL';
      else if (nameLower.includes('vu')) brand = 'Vu';
      else brand = 'Smart TVs';
    }
    return { category: 'television', brand };
  }

  // 7. Monitors -> 'monitor'
  if (
    nameLower.startsWith('monitor') ||
    nameLower.includes('monitor') ||
    nameLower.includes('ultragear') ||
    nameLower.includes('ultrasharp') ||
    nameLower.includes('proart') ||
    nameLower.includes('agon') ||
    nameLower.includes('studio display') ||
    curCat === 'monitor' ||
    curCat === 'monitors'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('dell')) brand = 'Dell';
      else if (nameLower.includes('lg')) brand = 'LG';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('asus')) brand = 'Asus';
      else if (nameLower.includes('benq')) brand = 'BenQ';
      else if (nameLower.includes('acer')) brand = 'Acer';
      else if (nameLower.includes('apple')) brand = 'Apple';
      else brand = 'Monitors';
    }
    return { category: 'monitor', brand };
  }

  // 8. Laptops & Desktops -> 'laptop'
  if (
    nameLower.startsWith('desktop') ||
    nameLower.includes('macbook') ||
    nameLower.includes('laptop') ||
    nameLower.includes('notebook') ||
    nameLower.includes('thinkpad') ||
    nameLower.includes('ideapad') ||
    nameLower.includes('zenbook') ||
    nameLower.includes('vivobook') ||
    nameLower.includes('pavilion') ||
    nameLower.includes('spectre') ||
    nameLower.includes('envy') ||
    nameLower.includes('inspiron') ||
    nameLower.includes('latitude') ||
    nameLower.includes('xps') ||
    nameLower.includes('vostro') ||
    nameLower.includes('chromebook') ||
    nameLower.includes('imac') ||
    nameLower.includes('mac mini') ||
    nameLower.includes('mac studio') ||
    nameLower.includes('mac pro') ||
    curCat === 'laptop' ||
    curCat === 'laptops'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('apple') || nameLower.includes('mac')) brand = 'Apple';
      else if (nameLower.includes('dell') || nameLower.includes('xps') || nameLower.includes('inspiron')) brand = 'Dell';
      else if (nameLower.includes('hp') || nameLower.includes('pavilion') || nameLower.includes('spectre') || nameLower.includes('envy')) brand = 'HP';
      else if (nameLower.includes('lenovo') || nameLower.includes('thinkpad') || nameLower.includes('ideapad')) brand = 'Lenovo';
      else if (nameLower.includes('asus') || nameLower.includes('zenbook') || nameLower.includes('vivobook')) brand = 'Asus';
      else if (nameLower.includes('acer')) brand = 'Acer';
      else brand = 'Laptops';
    }
    return { category: 'laptop', brand };
  }

  // 9. Tablets & iPads -> 'tablet'
  if (
    nameLower.includes('ipad') ||
    nameLower.includes('tablet') ||
    nameLower.includes('tab s') ||
    nameLower.includes('tab a') ||
    nameLower.includes('pad go') ||
    nameLower.includes('pad 6') ||
    nameLower.includes('pad 5') ||
    nameLower.includes('xiaomi pad') ||
    nameLower.includes('redmi pad') ||
    nameLower.includes('matepad') ||
    curCat === 'tablet'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('apple') || nameLower.includes('ipad')) brand = 'Apple';
      else if (nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('xiaomi') || nameLower.includes('redmi')) brand = 'Xiaomi';
      else if (nameLower.includes('oneplus')) brand = 'OnePlus';
      else if (nameLower.includes('lenovo')) brand = 'Lenovo';
      else brand = 'Tablets';
    }
    return { category: 'tablet', brand };
  }

  // 10. Smartwatches & Fitness Bands -> 'smartwatch'
  if (
    nameLower.startsWith('smartwatch') ||
    nameLower.includes('watch') ||
    nameLower.includes('smartwatch') ||
    nameLower.includes('amazfit') ||
    nameLower.includes('forerunner') ||
    nameLower.includes('fenix') ||
    nameLower.includes('fitness band') ||
    curCat === 'smartwatch' ||
    curCat === 'smartwatches' ||
    curCat === 'watches'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('apple')) brand = 'Apple';
      else if (nameLower.includes('samsung') || nameLower.includes('galaxy watch')) brand = 'Samsung';
      else if (nameLower.includes('pixel watch') || nameLower.includes('google')) brand = 'Google';
      else if (nameLower.includes('oneplus')) brand = 'OnePlus';
      else if (nameLower.includes('garmin') || nameLower.includes('forerunner') || nameLower.includes('fenix')) brand = 'Garmin';
      else if (nameLower.includes('amazfit')) brand = 'Amazfit';
      else if (nameLower.includes('noise')) brand = 'Noise';
      else if (nameLower.includes('boat')) brand = 'boAt';
      else if (nameLower.includes('fire-boltt')) brand = 'Fire-Boltt';
      else brand = 'Smartwatches';
    }
    return { category: 'smartwatch', brand };
  }

  // 11. Cameras -> 'camera'
  if (
    nameLower.startsWith('camera') ||
    nameLower.includes('camera') ||
    nameLower.includes('gopro') ||
    nameLower.includes('dslr') ||
    nameLower.includes('eos') ||
    nameLower.includes('nikon') ||
    nameLower.includes('lumix') ||
    nameLower.includes('insta360') ||
    curCat === 'camera'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('canon')) brand = 'Canon';
      else if (nameLower.includes('nikon')) brand = 'Nikon';
      else if (nameLower.includes('sony')) brand = 'Sony';
      else if (nameLower.includes('fujifilm')) brand = 'Fujifilm';
      else if (nameLower.includes('gopro')) brand = 'GoPro';
      else if (nameLower.includes('dji')) brand = 'DJI';
      else if (nameLower.includes('insta360')) brand = 'Insta360';
      else brand = 'Cameras';
    }
    return { category: 'camera', brand };
  }

  // 12. Shoes & Sneakers -> 'shoes'
  if (
    nameLower.startsWith('footwear') ||
    nameLower.includes('shoe') ||
    nameLower.includes('sneaker') ||
    nameLower.includes('boot') ||
    nameLower.includes('heel') ||
    nameLower.includes('flat') ||
    nameLower.includes('loafer') ||
    nameLower.includes('sandal') ||
    nameLower.includes('slide') ||
    nameLower.includes('flip-flop') ||
    curCat === 'shoes'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('nike')) brand = 'Nike';
      else if (nameLower.includes('adidas')) brand = 'Adidas';
      else if (nameLower.includes('puma')) brand = 'Puma';
      else if (nameLower.includes('skechers')) brand = 'Skechers';
      else if (nameLower.includes('woodland')) brand = 'Woodland';
      else if (nameLower.includes('bata')) brand = 'Bata';
      else brand = 'Footwear';
    }
    return { category: 'shoes', brand };
  }

  // 13. Bags & Luggage -> 'bags'
  if (
    nameLower.startsWith('bags') ||
    nameLower.includes('bag') ||
    nameLower.includes('backpack') ||
    nameLower.includes('luggage') ||
    nameLower.includes('suitcase') ||
    nameLower.includes('handbag') ||
    nameLower.includes('tote') ||
    nameLower.includes('wallet') ||
    curCat === 'bags'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('samsonite')) brand = 'Samsonite';
      else if (nameLower.includes('american tourister')) brand = 'American Tourister';
      else if (nameLower.includes('wildcraft')) brand = 'Wildcraft';
      else if (nameLower.includes('skybags')) brand = 'Skybags';
      else brand = 'Bags & Luggage';
    }
    return { category: 'bags', brand };
  }

  // 14. Beauty & Personal Care -> 'beauty-personal-care'
  if (
    nameLower.startsWith('beauty') ||
    nameLower.includes('lipstick') ||
    nameLower.includes('foundation') ||
    nameLower.includes('serum') ||
    nameLower.includes('cream') ||
    nameLower.includes('shampoo') ||
    nameLower.includes('conditioner') ||
    nameLower.includes('sunscreen') ||
    nameLower.includes('moisturizer') ||
    nameLower.includes('cleanser') ||
    nameLower.includes('eyeliner') ||
    nameLower.includes('mascara') ||
    nameLower.includes('primer') ||
    nameLower.includes('hair') ||
    nameLower.includes('makeup') ||
    curCat === 'beauty-personal-care'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes("l'oréal") || nameLower.includes('loreal')) brand = "L'Oréal";
      else if (nameLower.includes('maybelline')) brand = 'Maybelline';
      else if (nameLower.includes('lakmé') || nameLower.includes('lakme')) brand = 'Lakmé';
      else if (nameLower.includes('mac')) brand = 'MAC';
      else if (nameLower.includes('nykaa')) brand = 'Nykaa';
      else if (nameLower.includes('minimalist')) brand = 'Minimalist';
      else if (nameLower.includes('mamaearth')) brand = 'Mamaearth';
      else if (nameLower.includes('cetaphil')) brand = 'Cetaphil';
      else if (nameLower.includes('neutrogena')) brand = 'Neutrogena';
      else if (nameLower.includes('nivea')) brand = 'Nivea';
      else if (nameLower.includes('dove')) brand = 'Dove';
      else if (nameLower.includes('dyson')) brand = 'Dyson';
      else if (nameLower.includes('philips')) brand = 'Philips';
      else brand = 'Beauty & Care';
    }
    return { category: 'beauty-personal-care', brand };
  }

  // 15. Kids & Apparel -> Clothing
  if (nameLower.includes('kids') || nameLower.includes('boys') || nameLower.includes('girls')) {
    const cat = nameLower.includes('girls') ? 'womens-clothing' : 'mens-clothing';
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('mothercare')) brand = 'Mothercare';
      else if (nameLower.includes('firstcry')) brand = 'FirstCry';
      else if (nameLower.includes('hopscotch')) brand = 'Hopscotch';
      else if (nameLower.includes('allen solly')) brand = 'Allen Solly';
      else if (nameLower.includes('benetton')) brand = 'Benetton';
      else if (nameLower.includes('gini & jony')) brand = 'Gini & Jony';
      else if (nameLower.includes('pepe')) brand = 'Pepe Jeans';
      else if (nameLower.includes('max')) brand = 'Max';
      else if (nameLower.includes('pantaloons')) brand = 'Pantaloons';
      else if (nameLower.includes('chicco')) brand = 'Chicco';
      else if (nameLower.includes('adidas')) brand = 'Adidas';
      else if (nameLower.includes('nike')) brand = 'Nike';
      else if (nameLower.includes('puma')) brand = 'Puma';
      else if (nameLower.includes('skechers')) brand = 'Skechers';
      else if (nameLower.includes('gap')) brand = 'GAP';
      else brand = 'Kids Apparel';
    }
    return { category: cat, brand };
  }

  // 16. Men's Clothing -> 'mens-clothing'
  if (
    nameLower.startsWith('men ') ||
    nameLower.includes('sherwani') ||
    nameLower.includes('nehru jacket') ||
    nameLower.includes('bandhgala') ||
    nameLower.includes('dhoti') ||
    nameLower.includes('chinos') ||
    nameLower.includes('formal shirt') ||
    nameLower.includes('oxford shirt') ||
    nameLower.includes('polo t-shirt') ||
    nameLower.includes('henley') ||
    nameLower.includes('waistcoat') ||
    curCat === 'men fashion' ||
    curCat === 'mens-clothing'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('manyavar')) brand = 'Manyavar';
      else if (nameLower.includes('allen solly')) brand = 'Allen Solly';
      else if (nameLower.includes('peter england')) brand = 'Peter England';
      else if (nameLower.includes('van heusen')) brand = 'Van Heusen';
      else if (nameLower.includes('levis') || nameLower.includes("levi's")) brand = "Levi's";
      else brand = "Men's Fashion";
    }
    return { category: 'mens-clothing', brand };
  }

  // 17. Women's Clothing -> 'womens-clothing'
  if (
    nameLower.startsWith('women ') ||
    nameLower.startsWith('dresses') ||
    nameLower.startsWith('ethnic') ||
    nameLower.includes('saree') ||
    nameLower.includes('lehenga') ||
    nameLower.includes('kurti') ||
    nameLower.includes('anarkali') ||
    nameLower.includes('palazzo') ||
    nameLower.includes('sharara') ||
    nameLower.includes('gharara') ||
    nameLower.includes('dupatta') ||
    nameLower.includes('dress') ||
    nameLower.includes('skirt') ||
    nameLower.includes('blouse') ||
    nameLower.includes('crop top') ||
    nameLower.includes('camisole') ||
    nameLower.includes('tank top') ||
    curCat === 'women fashion' ||
    curCat === 'womens-clothing'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('biba')) brand = 'Biba';
      else if (nameLower.includes('w')) brand = 'W for Woman';
      else if (nameLower.includes('aurelia')) brand = 'Aurelia';
      else if (nameLower.includes('fabindia')) brand = 'FabIndia';
      else if (nameLower.includes('soch')) brand = 'Soch';
      else if (nameLower.includes('global desi')) brand = 'Global Desi';
      else brand = "Women's Fashion";
    }
    return { category: 'womens-clothing', brand };
  }

  // 18. General Apparel -> Mens or Womens
  if (
    nameLower.startsWith('tops') ||
    nameLower.startsWith('bottoms') ||
    nameLower.startsWith('outerwear') ||
    nameLower.startsWith('activewear') ||
    nameLower.startsWith('apparel')
  ) {
    const cat = nameLower.includes('women') || nameLower.includes('dress') || nameLower.includes('skirt') || nameLower.includes('top')
      ? 'womens-clothing'
      : 'mens-clothing';
    if (!brand || brand === 'UNKNOWN') {
      brand = 'Fashion';
    }
    return { category: cat, brand };
  }

  // 19. Accessories & Sports Fitness -> 'accessories'
  if (
    nameLower.startsWith('sports') ||
    nameLower.startsWith('accessories') ||
    nameLower.includes('mat') ||
    nameLower.includes('sunglasses') ||
    nameLower.includes('tie') ||
    nameLower.includes('cufflinks') ||
    nameLower.includes('case') ||
    nameLower.includes('cover') ||
    curCat === 'accessories' ||
    curCat === 'accessory' ||
    curCat === 'fashion accessories'
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('decathlon')) brand = 'Decathlon';
      else if (nameLower.includes('yonex')) brand = 'Yonex';
      else if (nameLower.includes('wilson')) brand = 'Wilson';
      else brand = 'Accessories';
    }
    return { category: 'accessories', brand };
  }

  // 20. Smartphones (Real Phones ONLY)
  if (
    nameLower.includes('iphone') ||
    nameLower.includes('galaxy s') ||
    nameLower.includes('galaxy a') ||
    nameLower.includes('galaxy z') ||
    nameLower.includes('galaxy m') ||
    nameLower.includes('galaxy f') ||
    nameLower.includes('pixel') ||
    nameLower.includes('oneplus') ||
    nameLower.includes('xiaomi') ||
    nameLower.includes('redmi') ||
    nameLower.includes('poco') ||
    nameLower.includes('realme') ||
    nameLower.includes('vivo') ||
    nameLower.includes('oppo') ||
    nameLower.includes('motorola') ||
    nameLower.includes('nothing phone') ||
    nameLower.includes('iqoo') ||
    nameLower.includes('nokia') ||
    nameLower.includes('smartphone') ||
    nameLower.includes('foldable phone')
  ) {
    if (!brand || brand === 'UNKNOWN') {
      if (nameLower.includes('iphone') || nameLower.includes('apple')) brand = 'Apple';
      else if (nameLower.includes('galaxy') || nameLower.includes('samsung')) brand = 'Samsung';
      else if (nameLower.includes('pixel') || nameLower.includes('google')) brand = 'Google';
      else if (nameLower.includes('oneplus')) brand = 'OnePlus';
      else if (nameLower.includes('xiaomi') || nameLower.includes('redmi') || nameLower.includes('poco')) brand = 'Xiaomi';
      else if (nameLower.includes('realme') || nameLower.includes('narzo')) brand = 'Realme';
      else if (nameLower.includes('vivo') || nameLower.includes('smartphone x') || nameLower.includes('smartphone v') || nameLower.includes('smartphone y') || nameLower.includes('smartphone t')) brand = 'Vivo';
      else if (nameLower.includes('oppo') || nameLower.includes('find n') || nameLower.includes('find x') || nameLower.includes('reno')) brand = 'Oppo';
      else if (nameLower.includes('motorola') || nameLower.includes('razr') || nameLower.includes('moto')) brand = 'Motorola';
      else if (nameLower.includes('nothing')) brand = 'Nothing';
      else if (nameLower.includes('iqoo') || nameLower.includes('neo') || nameLower.includes('z series')) brand = 'iQOO';
      else if (nameLower.includes('nokia')) brand = 'Nokia';
      else brand = 'Smartphones';
    }
    return { category: 'smartphone', brand };
  }

  return { category: curCat || 'accessories', brand: brand || 'Tech' };
}

async function runDirectMigration() {
  console.log('🚀 Connecting to MongoDB native driver...');
  const conn = await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const collection = conn.connection.collection('products');

  const products = await collection.find({}).toArray();
  console.log(`Found ${products.length} products to reclassify.`);

  let updatedCount = 0;
  const categoryStats = {};

  for (const p of products) {
    const { category, brand } = classifyProduct(p);
    categoryStats[category] = (categoryStats[category] || 0) + 1;

    const needsUpdate = p.category !== category || (p.brand === 'UNKNOWN' && brand !== 'UNKNOWN');

    if (needsUpdate) {
      await collection.updateOne(
        { _id: p._id },
        {
          $set: {
            category,
            brand,
          }
        }
      );
      updatedCount++;
    }
  }

  console.log(`\n✅ Direct Migration Finished Successfully!`);
  console.log(`- Total Products in Database: ${products.length} (ZERO deleted)`);
  console.log(`- Products Reassigned & Realignment Updated: ${updatedCount}`);
  console.log('\nFinal Category Distribution:');
  console.table(categoryStats);

  process.exit(0);
}

runDirectMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
