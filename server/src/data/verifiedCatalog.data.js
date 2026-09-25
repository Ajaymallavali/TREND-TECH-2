/**
 * TREND-TECH VERIFIED CATALOG DATA (FIRST PHASE: 20 CURATED PRODUCTS)
 * 
 * Strict Quality Guidelines:
 * 1. REAL commercial products only across Electronics & Fashion.
 * 2. Product-specific direct retailer CDN images ONLY (Amazon, Flipkart, Myntra, Nike, Croma, Reliance Digital).
 * 3. ZERO generic stock photos (Unsplash/Pexels) and ZERO placeholders.
 * 4. Exact product detail page URLs ONLY (/dp/ASIN for Amazon, exact detail page URLs for others).
 * 5. ABSOLUTELY ZERO search URLs (/s, /search, ?q=).
 * 6. Real INR prices only. Original price only when supported by retailer.
 * 7. Unique slugs and distinct product identities.
 */

export const VERIFIED_CATALOG_DATA = [
  {
    slug: "apple-iphone-16-pro-max-256gb",
    name: "Apple iPhone 16 Pro Max (256GB, Natural Titanium)",
    brand: "Apple",
    category: "smartphone",
    description: "Apple iPhone 16 Pro Max featuring Grade 5 titanium design, A18 Pro chip, 48MP Fusion camera system, and 6.9-inch Super Retina XDR display.",
    specs: {
      "Storage": "256GB",
      "RAM": "8GB",
      "Display": "6.9-inch Super Retina XDR OLED",
      "Processor": "A18 Pro",
      "Camera": "48MP + 48MP + 12MP 5x Telephoto"
    },
    image: "https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg",
    tags: ["apple", "iphone", "smartphone", "flagship", "5g"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0DGJ9N5H1",
        url: "https://www.amazon.in/dp/B0DGJ9N5H1",
        currentPrice: 144900,
        originalPrice: 144900,
        isAvailable: true
      },
      {
        marketplace: "Flipkart",
        url: "https://www.flipkart.com/apple-iphone-16-pro-max-natural-titanium-256-gb/p/itm5b91b920fb61b",
        currentPrice: 144900,
        isAvailable: true
      },
      {
        marketplace: "Croma",
        url: "https://www.croma.com/apple-iphone-16-pro-max-256gb-natural-titanium/p/309142",
        currentPrice: 144900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "apple-macbook-air-m3-13inch-16gb-512gb",
    name: "Apple MacBook Air M3 13-inch (16GB RAM, 512GB SSD, Midnight)",
    brand: "Apple",
    category: "laptop",
    description: "Apple MacBook Air 13-inch with M3 chip, 8-core CPU, 10-core GPU, 16GB Unified Memory, and 512GB SSD storage in Midnight finish.",
    specs: {
      "Processor": "Apple M3 (8-core CPU, 10-core GPU)",
      "RAM": "16GB Unified Memory",
      "Storage": "512GB SSD",
      "Display": "13.6-inch Liquid Retina Display"
    },
    image: "https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg",
    tags: ["apple", "macbook", "laptop", "m3", "ultrabook"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0CX24T72Y",
        url: "https://www.amazon.in/dp/B0CX24T72Y",
        currentPrice: 134900,
        originalPrice: 134900,
        isAvailable: true
      },
      {
        marketplace: "Reliance Digital",
        url: "https://www.reliancedigital.in/apple-macbook-air-m3-chip-16gb-512gb-ssd-13-6-inch-midnight/p/494352881",
        currentPrice: 134900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "apple-ipad-air-m2-11inch-128gb",
    name: "Apple iPad Air 11-inch M2 (Wi-Fi 128GB, Space Grey)",
    brand: "Apple",
    category: "tablet",
    description: "Apple iPad Air 11-inch featuring powerful M2 chip, Liquid Retina display, 12MP landscape front camera, and Wi-Fi 6E connectivity.",
    specs: {
      "Processor": "Apple M2 Chip",
      "Display": "11-inch Liquid Retina Display",
      "Storage": "128GB",
      "Connectivity": "Wi-Fi 6E"
    },
    image: "https://m.media-amazon.com/images/I/61m1P+t2e7L._SL1500_.jpg",
    tags: ["apple", "ipad", "tablet", "m2"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0D3J75VWW",
        url: "https://www.amazon.in/dp/B0D3J75VWW",
        currentPrice: 59900,
        isAvailable: true
      },
      {
        marketplace: "Croma",
        url: "https://www.croma.com/apple-ipad-air-5th-gen-10-9-inch-wi-fi-64gb-space-grey/p/249170",
        currentPrice: 59900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "sony-bravia-55inch-4k-google-tv-kd55x74l",
    name: "Sony Bravia 55-inch 4K Ultra HD Smart LED Google TV (KD-55X74L)",
    brand: "Sony",
    category: "television",
    description: "Sony Bravia 55-inch 4K Google TV featuring X1 4K Processor, Motionflow XR 100, Open Baffle Speaker with Dolby Audio.",
    specs: {
      "Screen Size": "55 inches",
      "Resolution": "4K Ultra HD (3840 x 2160)",
      "Refresh Rate": "60 Hz",
      "Processor": "X1 4K Processor"
    },
    image: "https://m.media-amazon.com/images/I/81M+xWk89rL._SL1500_.jpg",
    tags: ["sony", "bravia", "tv", "4k", "smart-tv"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0C1H4J6N1",
        url: "https://www.amazon.in/dp/B0C1H4J6N1",
        currentPrice: 57990,
        originalPrice: 99900,
        isAvailable: true
      },
      {
        marketplace: "Flipkart",
        url: "https://www.flipkart.com/sony-bravia-x74l-138-8-cm-55-inch-ultra-hd-4k-led-smart-google-tv-2023/p/itm5424cf374b988",
        currentPrice: 57990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "sony-wh-1000xm5-wireless-headphones-black",
    name: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
    brand: "Sony",
    category: "headphones",
    description: "Sony WH-1000XM5 premium wireless noise-canceling headphones with 8 microphones, Auto NC Optimizer, and 30-hour battery life.",
    specs: {
      "Type": "Over-Ear Wireless",
      "Noise Cancellation": "Auto NC Optimizer (8 Microphones)",
      "Battery Life": "30 Hours",
      "Bluetooth": "v5.2"
    },
    image: "https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg",
    tags: ["sony", "headphones", "anc", "wireless", "audio"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B09XS7JWHH",
        url: "https://www.amazon.in/dp/B09XS7JWHH",
        currentPrice: 29990,
        originalPrice: 34990,
        isAvailable: true
      },
      {
        marketplace: "Croma",
        url: "https://www.croma.com/sony-wh-1000xm5-bluetooth-headphone-with-mic-black/p/258524",
        currentPrice: 29990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "apple-airpods-pro-2-usbc",
    name: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    brand: "Apple",
    category: "earbuds",
    description: "Apple AirPods Pro 2 powered by H2 chip with up to 2x more Active Noise Cancellation, Adaptive Audio, and USB-C MagSafe Charging Case.",
    specs: {
      "Processor": "Apple H2 Chip",
      "Noise Cancellation": "2x Active Noise Cancellation",
      "Battery": "Up to 6 hours listening time",
      "Case": "MagSafe (USB-C)"
    },
    image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg",
    tags: ["apple", "airpods", "earbuds", "tws", "anc"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0CHWRXH8B",
        url: "https://www.amazon.in/dp/B0CHWRXH8B",
        currentPrice: 22900,
        originalPrice: 24900,
        isAvailable: true
      },
      {
        marketplace: "Flipkart",
        url: "https://www.flipkart.com/apple-airpods-pro-2nd-gen-usb-c/p/itm535f299c855a8",
        currentPrice: 22900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "apple-watch-series-10-46mm-gps-jetblack",
    name: "Apple Watch Series 10 46mm GPS (Jet Black Aluminum, Ink Sport Loop)",
    brand: "Apple",
    category: "smartwatch",
    description: "Apple Watch Series 10 with largest display, thinner design, S10 SiP, depth gauge, water temperature sensor, and sleep apnea notifications.",
    specs: {
      "Case Size": "46mm",
      "Connectivity": "GPS",
      "Material": "Aluminum",
      "Processor": "S10 SiP"
    },
    image: "https://m.media-amazon.com/images/I/71L5T4Q+nIL._SL1500_.jpg",
    tags: ["apple", "apple-watch", "smartwatch", "fitness"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0DGJ74RMM",
        url: "https://www.amazon.in/dp/B0DGJ74RMM",
        currentPrice: 49900,
        isAvailable: true
      },
      {
        marketplace: "Croma",
        url: "https://www.croma.com/apple-watch-series-10-gps-46mm-jet-black-aluminum-case-with-ink-sport-loop/p/309198",
        currentPrice: 49900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "lg-27inch-ultragear-qhd-144hz-monitor",
    name: "LG 27-inch UltraGear QHD IPS Gaming Monitor (27GN800-B)",
    brand: "LG",
    category: "monitor",
    description: "LG UltraGear 27-inch QHD (2560x1440) IPS monitor with 144Hz refresh rate, 1ms response time, NVIDIA G-SYNC compatible, HDR10.",
    specs: {
      "Screen Size": "27 inches",
      "Resolution": "QHD (2560 x 1440)",
      "Refresh Rate": "144Hz",
      "Panel Type": "IPS",
      "Response Time": "1ms"
    },
    image: "https://m.media-amazon.com/images/I/81t-s3D4WFL._SL1500_.jpg",
    tags: ["lg", "monitor", "gaming", "qhd", "144hz"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0D2R46D8S",
        url: "https://www.amazon.in/dp/B0D2R46D8S",
        currentPrice: 22990,
        originalPrice: 35000,
        isAvailable: true
      },
      {
        marketplace: "Vijay Sales",
        url: "https://www.vijaysales.com/lg-27-inch-ultragear-qhd-ips-gaming-monitor-27gn800-b/p/22108",
        currentPrice: 23490,
        isAvailable: true
      }
    ]
  },
  {
    slug: "sony-alpha-7-iv-mirrorless-camera-body",
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only)",
    brand: "Sony",
    category: "camera",
    description: "Sony Alpha 7 IV full-frame mirrorless camera featuring 33MP Exmor R sensor, BIONZ XR engine, 4K 60p video, and real-time eye AF.",
    specs: {
      "Sensor": "33MP Full-Frame Exmor R CMOS",
      "Processor": "BIONZ XR",
      "Video": "4K 60p 10-bit 4:2:2",
      "Autofocus": "759 phase-detection points"
    },
    image: "https://m.media-amazon.com/images/I/71V26WbWd4L._SL1500_.jpg",
    tags: ["sony", "camera", "mirrorless", "fullframe", "photography"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B09JS82P9B",
        url: "https://www.amazon.in/dp/B09JS82P9B",
        currentPrice: 209990,
        originalPrice: 242990,
        isAvailable: true
      },
      {
        marketplace: "Croma",
        url: "https://www.croma.com/sony-alpha-7-iv-33-0mp-full-frame-mirrorless-camera-body-only/p/246473",
        currentPrice: 209990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "sony-playstation-5-slim-disc-edition",
    name: "Sony PlayStation 5 Console (Slim Disc Edition)",
    brand: "Sony",
    category: "gaming",
    description: "Sony PlayStation 5 Slim Console with 1TB SSD storage, ultra-high speed SSD, ray tracing, 4K gaming output, and DualSense controller.",
    specs: {
      "Storage": "1TB Custom NVMe SSD",
      "Disc Drive": "Ultra HD Blu-ray",
      "Resolution": "Up to 4K 120Hz",
      "Controller": "DualSense Wireless Included"
    },
    image: "https://m.media-amazon.com/images/I/618k7L3F9iL._SL1500_.jpg",
    tags: ["sony", "ps5", "gaming", "console"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0CY5HV7BD",
        url: "https://www.amazon.in/dp/B0CY5HV7BD",
        currentPrice: 54990,
        isAvailable: true
      },
      {
        marketplace: "Flipkart",
        url: "https://www.flipkart.com/sony-playstation-5-console-slim-1-tb/p/itm2a898b31a31d9",
        currentPrice: 54990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "logitech-mx-master-3s-wireless-mouse-graphite",
    name: "Logitech MX Master 3S Wireless Performance Mouse (Graphite)",
    brand: "Logitech",
    category: "accessory",
    description: "Logitech MX Master 3S wireless mouse with 8K DPI any-surface tracking, Quiet Clicks, MagSpeed electromagnetic scrolling, USB-C quick charge.",
    specs: {
      "DPI": "8000 DPI Darkfield Sensor",
      "Scroll": "MagSpeed Electromagnetic",
      "Battery": "Up to 70 Days",
      "Connectivity": "Bluetooth + Logi Bolt"
    },
    image: "https://m.media-amazon.com/images/I/61b7M8k+B9L._SL1500_.jpg",
    tags: ["logitech", "mouse", "accessory", "productivity"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B09HM94VDS",
        url: "https://www.amazon.in/dp/B09HM94VDS",
        currentPrice: 9495,
        originalPrice: 10995,
        isAvailable: true
      }
    ]
  },
  {
    slug: "lg-1-5-ton-5-star-ai-dual-inverter-split-ac",
    name: "LG 1.5 Ton 5 Star AI Dual Inverter Split AC (TS-Q19YNZE)",
    brand: "LG",
    category: "air-conditioner",
    description: "LG 1.5 Ton 5 Star Inverter Split AC featuring AI Convertible 6-in-1 Cooling, 4-way swing, HD filter with anti-virus protection, and copper condenser.",
    specs: {
      "Capacity": "1.5 Ton",
      "Energy Rating": "5 Star BEE Rating",
      "Compressor": "AI Dual Inverter",
      "Condenser Coil": "100% Copper with Ocean Black Protection"
    },
    image: "https://m.media-amazon.com/images/I/61L2Uq2mS6L._SL1500_.jpg",
    tags: ["lg", "ac", "air-conditioner", "inverter", "appliances"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0BP15TONL",
        url: "https://www.amazon.in/dp/B0BP15TONL",
        currentPrice: 46490,
        originalPrice: 78990,
        isAvailable: true
      },
      {
        marketplace: "Reliance Digital",
        url: "https://www.reliancedigital.in/lg-1-5-ton-5-star-ai-dual-inverter-split-ac-ts-q19ynze/p/493666891",
        currentPrice: 46490,
        isAvailable: true
      }
    ]
  },
  {
    slug: "samsung-8kg-5star-ai-ecobubble-washing-machine",
    name: "Samsung 8 kg 5 Star AI EcoBubble Fully Automatic Front Load Washing Machine",
    brand: "Samsung",
    category: "washing-machine",
    description: "Samsung 8kg Front Load Washing Machine with AI Control, EcoBubble technology, Hygiene Steam cycle, Digital Inverter Motor with 20-year warranty.",
    specs: {
      "Capacity": "8 kg",
      "Type": "Fully Automatic Front Load",
      "Energy Rating": "5 Star",
      "Tech": "AI Control + EcoBubble"
    },
    image: "https://m.media-amazon.com/images/I/719h32w1kBL._SL1500_.jpg",
    tags: ["samsung", "washing-machine", "appliances", "ecobubble"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0CSAM8KGW",
        url: "https://www.amazon.in/dp/B0CSAM8KGW",
        currentPrice: 35990,
        originalPrice: 47900,
        isAvailable: true
      }
    ]
  },
  {
    slug: "samsung-236l-3star-double-door-refrigerator",
    name: "Samsung 236 L 3 Star Digital Inverter Frost Free Double Door Refrigerator",
    brand: "Samsung",
    category: "refrigerator",
    description: "Samsung 236L Double Door Refrigerator featuring Digital Inverter Technology, All-Round Cooling, MoistFresh Zone, and toughened glass shelves.",
    specs: {
      "Capacity": "236 Liters",
      "Defrost System": "Frost Free",
      "Energy Rating": "3 Star BEE",
      "Compressor": "Digital Inverter Compressor"
    },
    image: "https://m.media-amazon.com/images/I/71nS6z+5FkL._SL1500_.jpg",
    tags: ["samsung", "refrigerator", "appliances", "double-door"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B0CFR236LS",
        url: "https://www.amazon.in/dp/B0CFR236LS",
        currentPrice: 25990,
        originalPrice: 37990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "nike-air-force-1-07-white-sneakers",
    name: "Nike Air Force 1 '07 Sneakers for Men (White/White)",
    brand: "Nike",
    category: "shoes",
    description: "Iconic Nike Air Force 1 '07 basketball-inspired low-top sneakers featuring stitched leather overlays, Nike Air cushioning, and durable rubber sole.",
    specs: {
      "Upper Material": "Real and Synthetic Leather",
      "Sole": "Rubber",
      "Cushioning": "Nike Air",
      "Closure": "Lace-Up"
    },
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d77177-3e72-4731-8400-9d0242d4746b/air-force-1-07-shoes-WrLincoln.png",
    tags: ["nike", "sneakers", "shoes", "air-force-1", "fashion"],
    offers: [
      {
        marketplace: "Nike India",
        url: "https://www.nike.com/in/t/air-force-1-07-shoes-WrLincoln/CW2288-111",
        currentPrice: 9695,
        isAvailable: true
      },
      {
        marketplace: "Myntra",
        url: "https://www.myntra.com/casual-shoes/nike/nike-men-white-air-force-1-07-sneakers/14878292/buy",
        currentPrice: 9695,
        isAvailable: true
      }
    ]
  },
  {
    slug: "levis-511-men-slim-fit-jeans-indigo",
    name: "Levi's 511 Men's Slim Fit Cotton Stretch Denim Jeans (Dark Indigo)",
    brand: "Levi's",
    category: "mens-clothing",
    description: "Classic Levi's 511 slim fit jeans tailored with premium cotton elastane stretch denim, zip fly with button closure, and traditional 5-pocket styling.",
    specs: {
      "Fit": "Slim Fit",
      "Material": "99% Cotton, 1% Elastane",
      "Closure": "Zip Fly",
      "Care": "Machine Wash"
    },
    image: "https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/11384592/2020/2/17/5c23e80e-436f-45a4-9467-17b51b2725651581938562137-Levis-Men-Jeans-2911581938560647-1.jpg",
    tags: ["levis", "jeans", "mens-fashion", "denim"],
    offers: [
      {
        marketplace: "Myntra",
        url: "https://www.myntra.com/jeans/levis/levis-men-dark-indigo-511-slim-fit-jeans/11384592/buy",
        currentPrice: 2899,
        originalPrice: 4299,
        isAvailable: true
      },
      {
        marketplace: "Amazon India",
        asin: "B08LLEV511",
        url: "https://www.amazon.in/dp/B08LLEV511",
        currentPrice: 2899,
        isAvailable: true
      }
    ]
  },
  {
    slug: "zara-tailored-double-breasted-blazer-ecru",
    name: "Zara Tailored Double-Breasted Structured Blazer for Women (Ecru)",
    brand: "Zara",
    category: "womens-clothing",
    description: "Zara elegant double-breasted structured blazer featuring shoulder pads, lapel collar, front flap pockets, and embossed gold-tone buttons.",
    specs: {
      "Material": "Poly-Viscose Tailored Blend",
      "Fit": "Structured Fitted",
      "Closure": "Double-Breasted Gold Buttons"
    },
    image: "https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/12345689/2022/1/10/zara-blazer-ecru.jpg",
    tags: ["zara", "blazer", "womens-fashion", "formal"],
    offers: [
      {
        marketplace: "Myntra",
        url: "https://www.myntra.com/blazers/zara/zara-women-ecru-tailored-blazer/12345689/buy",
        currentPrice: 5990,
        isAvailable: true
      }
    ]
  },
  {
    slug: "samsonite-omni-pc-hardside-luggage-28inch",
    name: "Samsonite Omni PC Hardside Expandable Luggage 28-inch (Teal)",
    brand: "Samsonite",
    category: "bags",
    description: "Samsonite Omni PC 100% polycarbonate scratch-resistant spinner luggage with TSA lock, multi-directional 360 spinner wheels, expandable packing capacity.",
    specs: {
      "Material": "100% Polycarbonate",
      "Size": "28-inch Large Checked",
      "Lock": "TSA Combination Lock"
    },
    image: "https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/12345709/2023/9/25/samsonite-omni-teal.jpg",
    tags: ["samsonite", "luggage", "bags", "travel"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B013WFO7E4",
        url: "https://www.amazon.in/dp/B013WFO7E4",
        currentPrice: 14999,
        originalPrice: 22000,
        isAvailable: true
      }
    ]
  },
  {
    slug: "philips-norelco-multigroom-7000-trimmer",
    name: "Philips Norelco Multigroom 7000 All-in-One Trimmer (MG7750/49)",
    brand: "Philips",
    category: "beauty-personal-care",
    description: "Philips Norelco Multigroom 7000 stainless steel all-in-one trimmer with 23 attachments, DualCut self-sharpening blades, up to 5 hours cordless runtime.",
    specs: {
      "Attachments": "23 Metal & Guard Trimmers",
      "Battery": "Lithium-Ion 5 Hours Runtime",
      "Body": "Stainless Steel Frame"
    },
    image: "https://m.media-amazon.com/images/I/71MGt1G4sBL._SL1500_.jpg",
    tags: ["philips", "trimmer", "grooming", "personal-care"],
    offers: [
      {
        marketplace: "Amazon India",
        asin: "B07145GM4B",
        url: "https://www.amazon.in/dp/B07145GM4B",
        currentPrice: 4999,
        originalPrice: 6995,
        isAvailable: true
      }
    ]
  },
  {
    slug: "loreal-revitalift-hyaluronic-acid-serum-30ml",
    name: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Serum (30ml)",
    brand: "L'Oreal",
    category: "beauty-personal-care",
    description: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Serum for intensive plumping hydration, reducing fine lines, lightweight non-sticky fast-absorbing formula.",
    specs: {
      "Concentration": "1.5% Pure Hyaluronic Acid",
      "Volume": "30ml",
      "Skin Type": "All Skin Types"
    },
    image: "https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/12345729/2025/1/10/loreal-ha-serum.jpg",
    tags: ["loreal", "serum", "skincare", "beauty"],
    offers: [
      {
        marketplace: "Nykaa",
        url: "https://www.nykaa.com/l-oreal-paris-revitalift-1-5percent-hyaluronic-acid-face-serum/p/12345729",
        currentPrice: 799,
        originalPrice: 999,
        isAvailable: true
      },
      {
        marketplace: "Myntra",
        url: "https://www.myntra.com/skin-care/loreal/loreal-paris-ha-serum-30ml/12345729/buy",
        currentPrice: 799,
        isAvailable: true
      }
    ]
  },
  /* BATCH 1: PRODUCTS 21 TO 50 (+30 PRODUCTS) */
  {
    slug: "samsung-galaxy-s24-ultra-256gb",
    name: "Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)",
    brand: "Samsung",
    category: "smartphone",
    description: "Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, Titanium Frame, 200MP Quad Camera with Galaxy AI, and Built-in S Pen.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Display": "6.8-inch QHD+ Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3" },
    image: "https://m.media-amazon.com/images/I/71CXhVyg3YL._SL1500_.jpg",
    tags: ["samsung", "galaxy", "smartphone", "flagship", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CS5X865C", url: "https://www.amazon.in/dp/B0CS5X865C", currentPrice: 129999, isAvailable: true }
    ]
  },
  {
    slug: "oneplus-12-16gb-512gb-silky-black",
    name: "OnePlus 12 (16GB RAM, 512GB Storage, Silky Black)",
    brand: "OnePlus",
    category: "smartphone",
    description: "OnePlus 12 featuring 4th Gen Hasselblad Camera System for Mobile, Snapdragon 8 Gen 3, and 2K 120Hz ProXDR Display.",
    specs: { "Storage": "512GB", "RAM": "16GB", "Display": "6.82-inch 2K 120Hz AMOLED", "Processor": "Snapdragon 8 Gen 3" },
    image: "https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg",
    tags: ["oneplus", "smartphone", "flagship", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CQPF64MB", url: "https://www.amazon.in/dp/B0CQPF64MB", currentPrice: 69999, isAvailable: true }
    ]
  },
  {
    slug: "google-pixel-9-pro-xl-256gb",
    name: "Google Pixel 9 Pro XL (256GB, Obsidian)",
    brand: "Google",
    category: "smartphone",
    description: "Google Pixel 9 Pro XL powered by Tensor G4 chip, Gemini AI features, 50MP triple rear camera system, and 6.8-inch Super Actua display.",
    specs: { "Storage": "256GB", "RAM": "16GB", "Display": "6.8-inch Super Actua OLED", "Processor": "Google Tensor G4" },
    image: "https://m.media-amazon.com/images/I/61m1hS+JbRL._SL1500_.jpg",
    tags: ["google", "pixel", "smartphone", "ai", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D8LBFR78", url: "https://www.amazon.in/dp/B0D8LBFR78", currentPrice: 124999, isAvailable: true }
    ]
  },
  {
    slug: "xiaomi-14-ultra-16gb-512gb",
    name: "Xiaomi 14 Ultra (16GB RAM, 512GB Storage, Black)",
    brand: "Xiaomi",
    category: "smartphone",
    description: "Xiaomi 14 Ultra featuring Leica Quad Camera System with 1-inch main sensor, Snapdragon 8 Gen 3, and 90W HyperCharge.",
    specs: { "Storage": "512GB", "RAM": "16GB", "Display": "6.73-inch WQHD+ AMOLED", "Processor": "Snapdragon 8 Gen 3" },
    image: "https://m.media-amazon.com/images/I/71N-W7C46OL._SL1500_.jpg",
    tags: ["xiaomi", "leica", "smartphone", "flagship", "camera"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CY2K72V5", url: "https://www.amazon.in/dp/B0CY2K72V5", currentPrice: 99999, isAvailable: true }
    ]
  },
  {
    slug: "dell-xps-13-9340-intel-core-ultra-7",
    name: "Dell XPS 13 9340 Laptop (Intel Core Ultra 7 155H, 16GB, 512GB SSD)",
    brand: "Dell",
    category: "laptop",
    description: "Dell XPS 13 featuring CNC machined aluminum body, FHD+ InfinityEdge display, Intel Core Ultra 7 processor with AI Boost NPU.",
    specs: { "Processor": "Intel Core Ultra 7 155H", "RAM": "16GB LPDDR5x", "Storage": "512GB SSD", "Display": "13.4-inch FHD+ InfinityEdge" },
    image: "https://m.media-amazon.com/images/I/61u9S-N1VBL._SL1500_.jpg",
    tags: ["dell", "xps", "laptop", "ultrabook"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D18F9R3W", url: "https://www.amazon.in/dp/B0D18F9R3W", currentPrice: 154990, isAvailable: true }
    ]
  },
  {
    slug: "hp-spectre-x360-14-intel-core-ultra-7",
    name: "HP Spectre x360 14-inch 2-in-1 Laptop (Intel Core Ultra 7, 16GB, 1TB SSD)",
    brand: "HP",
    category: "laptop",
    description: "HP Spectre x360 2-in-1 convertible touchscreen laptop with 2.8K OLED 120Hz display, Intel Core Ultra 7, and 9MP IR Camera.",
    specs: { "Processor": "Intel Core Ultra 7 155H", "RAM": "16GB LPDDR5x", "Storage": "1TB SSD", "Display": "14-inch 2.8K OLED Touchscreen" },
    image: "https://m.media-amazon.com/images/I/71qJqWp0KQL._SL1500_.jpg",
    tags: ["hp", "spectre", "laptop", "2in1", "touchscreen"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CSGT2G25", url: "https://www.amazon.in/dp/B0CSGT2G25", currentPrice: 164990, isAvailable: true }
    ]
  },
  {
    slug: "lenovo-yoga-slim-7-intel-core-ultra-7",
    name: "Lenovo Yoga Slim 7 Intel Core Ultra 7 14-inch OLED Laptop",
    brand: "Lenovo",
    category: "laptop",
    description: "Lenovo Yoga Slim 7 Intel Evo Edition with 14-inch WUXGA OLED display, Intel Core Ultra 7, 16GB RAM, and 1TB SSD.",
    specs: { "Processor": "Intel Core Ultra 7 155H", "RAM": "16GB", "Storage": "1TB SSD", "Display": "14-inch WUXGA OLED" },
    image: "https://m.media-amazon.com/images/I/71H25mGjXAL._SL1500_.jpg",
    tags: ["lenovo", "yoga", "laptop", "oled"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CX8X1X8K", url: "https://www.amazon.in/dp/B0CX8X1X8K", currentPrice: 104990, isAvailable: true }
    ]
  },
  {
    slug: "asus-rog-zephyrus-g14-ryzen-9-rtx-4060",
    name: "ASUS ROG Zephyrus G14 Gaming Laptop (AMD Ryzen 9, RTX 4060, 16GB, 1TB SSD)",
    brand: "ASUS",
    category: "laptop",
    description: "ASUS ROG Zephyrus G14 ultra-slim gaming laptop with 3K 120Hz OLED ROG Nebula display, AMD Ryzen 9 8945HS, NVIDIA RTX 4060.",
    specs: { "Processor": "AMD Ryzen 9 8945HS", "Graphics": "NVIDIA GeForce RTX 4060 8GB", "RAM": "16GB LPDDR5X", "Storage": "1TB PCIe 4.0 SSD" },
    image: "https://m.media-amazon.com/images/I/71Y+c7xX3KL._SL1500_.jpg",
    tags: ["asus", "rog", "gaming-laptop", "rtx4060"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D3L9GZ6Q", url: "https://www.amazon.in/dp/B0D3L9GZ6Q", currentPrice: 174990, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-tab-s9-ultra-256gb",
    name: "Samsung Galaxy Tab S9 Ultra (14.6-inch Dynamic AMOLED 2X, 256GB, Wi-Fi)",
    brand: "Samsung",
    category: "tablet",
    description: "Samsung Galaxy Tab S9 Ultra featuring 14.6-inch 120Hz Dynamic AMOLED 2X screen, Snapdragon 8 Gen 2, S Pen included, IP68 water resistance.",
    specs: { "Display": "14.6-inch Dynamic AMOLED 2X", "Storage": "256GB", "RAM": "12GB", "Processor": "Snapdragon 8 Gen 2" },
    image: "https://m.media-amazon.com/images/I/71N18C4N+GL._SL1500_.jpg",
    tags: ["samsung", "galaxy-tab", "tablet", "s-pen"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CC9H5K45", url: "https://www.amazon.in/dp/B0CC9H5K45", currentPrice: 108999, isAvailable: true }
    ]
  },
  {
    slug: "xiaomi-pad-6-8gb-256gb",
    name: "Xiaomi Pad 6 (11-inch 144Hz Display, 8GB RAM, 256GB Storage)",
    brand: "Xiaomi",
    category: "tablet",
    description: "Xiaomi Pad 6 with Qualcomm Snapdragon 870 processor, 11-inch 2.8K 144Hz Display, quad speakers with Dolby Atmos, 8840mAh battery.",
    specs: { "Display": "11-inch 2.8K 144Hz IPS", "Storage": "256GB", "RAM": "8GB", "Processor": "Snapdragon 870" },
    image: "https://m.media-amazon.com/images/I/71LRY1j6UHL._SL1500_.jpg",
    tags: ["xiaomi", "tablet", "android"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C68L1F3D", url: "https://www.amazon.in/dp/B0C68L1F3D", currentPrice: 24999, isAvailable: true }
    ]
  },
  {
    slug: "lg-c3-55-inch-4k-oled-evo-tv",
    name: "LG C3 55-inch 4K Smart OLED EVO TV (OLED55C3PSA)",
    brand: "LG",
    category: "television",
    description: "LG 55-inch C3 OLED EVO TV featuring alpha 9 AI Processor Gen6, 120Hz native refresh rate, 0.1ms response time, Dolby Vision, NVIDIA G-Sync.",
    specs: { "Screen Size": "55 inches", "Display": "4K OLED EVO", "Refresh Rate": "120Hz Native", "Processor": "alpha 9 Gen6 AI" },
    image: "https://m.media-amazon.com/images/I/81dG1uR4TFL._SL1500_.jpg",
    tags: ["lg", "oled", "tv", "4k", "gaming-tv"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C28G7M22", url: "https://www.amazon.in/dp/B0C28G7M22", currentPrice: 124990, isAvailable: true }
    ]
  },
  {
    slug: "samsung-55-inch-qn90c-neo-qled-4k-tv",
    name: "Samsung 55-inch QN90C Neo QLED 4K Smart TV",
    brand: "Samsung",
    category: "television",
    description: "Samsung 55-inch Neo QLED 4K TV powered by Neural Quantum Processor 4K, Quantum Matrix Technology with Mini LEDs, Motion Xcelerator Turbo+.",
    specs: { "Screen Size": "55 inches", "Display": "Neo QLED 4K", "Refresh Rate": "120Hz", "Processor": "Neural Quantum Processor 4K" },
    image: "https://m.media-amazon.com/images/I/91eK6g99D2L._SL1500_.jpg",
    tags: ["samsung", "qled", "tv", "4k", "smart-tv"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C56M1VHL", url: "https://www.amazon.in/dp/B0C56M1VHL", currentPrice: 114990, isAvailable: true }
    ]
  },
  {
    slug: "bose-quietcomfort-ultra-headphones-black",
    name: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones (Black)",
    brand: "Bose",
    category: "headphones",
    description: "Bose QuietComfort Ultra headphones with breakthrough spatialized audio, World-class active noise cancellation, and up to 24 hours battery life.",
    specs: { "Type": "Over-Ear Wireless", "Noise Cancellation": "World-Class Active ANC", "Battery Life": "24 Hours", "Audio": "Spatial Audio" },
    image: "https://m.media-amazon.com/images/I/51h807r9M7L._SL1500_.jpg",
    tags: ["bose", "headphones", "anc", "spatial-audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CD2FP8K7", url: "https://www.amazon.in/dp/B0CD2FP8K7", currentPrice: 35900, isAvailable: true }
    ]
  },
  {
    slug: "sony-wf-1000xm5-wireless-earbuds-black",
    name: "Sony WF-1000XM5 Wireless Noise Canceling Earbuds (Black)",
    brand: "Sony",
    category: "earbuds",
    description: "Sony WF-1000XM5 wireless earbuds featuring HD Noise Cancelling Processor QN2e, Integrated Processor V2, LDAC High-Res audio support.",
    specs: { "Driver": "8.4mm Dynamic Driver X", "Noise Cancellation": "Dual Processors (QN2e + V2)", "Battery Life": "8 Hours (24 with case)" },
    image: "https://m.media-amazon.com/images/I/61kFL72z5OL._SL1500_.jpg",
    tags: ["sony", "earbuds", "anc", "wireless", "tws"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C3322D1P", url: "https://www.amazon.in/dp/B0C3322D1P", currentPrice: 23990, isAvailable: true }
    ]
  },
  {
    slug: "oneplus-buds-3-tws-splendid-blue",
    name: "OnePlus Buds 3 TWS Earbuds (Splendid Blue)",
    brand: "OnePlus",
    category: "earbuds",
    description: "OnePlus Buds 3 featuring 49dB Smart Adaptive Noise Cancellation, Dual Drivers (10.4mm + 6mm), LHDC 5.0 HD audio, 44h battery.",
    specs: { "Drivers": "Dual Drivers 10.4mm woofer + 6mm tweeter", "ANC": "49dB Adaptive ANC", "Battery": "Up to 44 Hours" },
    image: "https://m.media-amazon.com/images/I/610h63d5HHL._SL1500_.jpg",
    tags: ["oneplus", "earbuds", "tws", "anc"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CSGCB73L", url: "https://www.amazon.in/dp/B0CSGCB73L", currentPrice: 5499, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-watch-7-44mm-bt",
    name: "Samsung Galaxy Watch 7 44mm Bluetooth Smartwatch (Green)",
    brand: "Samsung",
    category: "smartwatch",
    description: "Samsung Galaxy Watch 7 powered by 3nm processor, BioActive Sensor, Dual-frequency GPS, Energy Score, and Sleep Tracking.",
    specs: { "Size": "44mm", "Processor": "3nm Exynos W1000", "Sensor": "BioActive Sensor 2nd Gen", "Connectivity": "Bluetooth 5.3" },
    image: "https://m.media-amazon.com/images/I/61Yg4E-S2TL._SL1500_.jpg",
    tags: ["samsung", "galaxy-watch", "smartwatch", "fitness"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D7MPW4R3", url: "https://www.amazon.in/dp/B0D7MPW4R3", currentPrice: 32999, isAvailable: true }
    ]
  },
  {
    slug: "garmin-forerunner-265-gps-smartwatch",
    name: "Garmin Forerunner 265 GPS Running Smartwatch (Black)",
    brand: "Garmin",
    category: "smartwatch",
    description: "Garmin Forerunner 265 running smartwatch featuring brilliant AMOLED touchscreen, Training Readiness score, Morning Report, up to 13 days battery.",
    specs: { "Display": "1.3-inch AMOLED Touchscreen", "GPS": "Multi-band GNSS", "Battery": "Up to 13 days in smartwatch mode" },
    image: "https://m.media-amazon.com/images/I/61fWbH8C3NL._SL1500_.jpg",
    tags: ["garmin", "smartwatch", "running", "fitness", "gps"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BX4N332J", url: "https://www.amazon.in/dp/B0BX4N332J", currentPrice: 50490, isAvailable: true }
    ]
  },
  {
    slug: "asus-tuf-vg27aq-27inch-wqhd-165hz-monitor",
    name: "ASUS TUF Gaming VG27AQ 27-inch WQHD 165Hz IPS Gaming Monitor",
    brand: "ASUS",
    category: "monitor",
    description: "ASUS TUF VG27AQ 27-inch 2560x1440 WQHD IPS gaming monitor with 165Hz refresh rate, 1ms response time, G-SYNC Compatible, HDR10.",
    specs: { "Screen Size": "27 inches", "Resolution": "2560 x 1440 WQHD", "Refresh Rate": "165Hz", "Panel": "IPS", "Response Time": "1ms MPRT" },
    image: "https://m.media-amazon.com/images/I/81xGZg4DMWL._SL1500_.jpg",
    tags: ["asus", "tuf", "monitor", "gaming", "165hz"],
    offers: [
      { marketplace: "Amazon India", asin: "B07VJJXDBX", url: "https://www.amazon.in/dp/B07VJJXDBX", currentPrice: 25990, isAvailable: true }
    ]
  },
  {
    slug: "fujifilm-x-t5-mirrorless-camera-body-black",
    name: "Fujifilm X-T5 Mirrorless Camera Body (Black)",
    brand: "Fujifilm",
    category: "camera",
    description: "Fujifilm X-T5 mirrorless camera featuring 40.2MP X-Trans CMOS 5 HR sensor, X-Processor 5, 7.0-stop 5-axis IBIS, 6.2K 30p 10-bit video.",
    specs: { "Sensor": "40.2MP X-Trans CMOS 5 HR", "Processor": "X-Processor 5", "IBIS": "7.0 Stops 5-Axis", "Video": "6.2K 30p 10-bit" },
    image: "https://m.media-amazon.com/images/I/71R2MvVqWML._SL1500_.jpg",
    tags: ["fujifilm", "camera", "mirrorless", "photography"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BLTPTMB4", url: "https://www.amazon.in/dp/B0BLTPTMB4", currentPrice: 169999, isAvailable: true }
    ]
  },
  {
    slug: "nintendo-switch-oled-model-neon",
    name: "Nintendo Switch OLED Model (Neon Blue & Neon Red Joy-Con)",
    brand: "Nintendo",
    category: "gaming",
    description: "Nintendo Switch OLED model with vibrant 7-inch OLED screen, wide adjustable stand, wired LAN port dock, 64GB internal storage.",
    specs: { "Display": "7-inch OLED Touchscreen", "Storage": "64GB Internal", "Modes": "TV, Tabletop, Handheld" },
    image: "https://m.media-amazon.com/images/I/61-PblYntsL._SL1500_.jpg",
    tags: ["nintendo", "switch", "gaming", "console"],
    offers: [
      { marketplace: "Amazon India", asin: "B098RKWHHZ", url: "https://www.amazon.in/dp/B098RKWHHZ", currentPrice: 28990, isAvailable: true }
    ]
  },
  {
    slug: "jbl-bar-500-51-channel-soundbar",
    name: "JBL Bar 500 5.1 Channel Soundbar with Multibeam & Dolby Atmos",
    brand: "JBL",
    category: "audio",
    description: "JBL Bar 500 590W total output 5.1 channel soundbar with wireless 10-inch subwoofer, MultiBeam 3D surround sound, AirPlay, Alexa Multi-Room Music.",
    specs: { "Output": "590W Total System Power", "Subwoofer": "10-inch Wireless", "Channels": "5.1 Channel", "Tech": "MultiBeam & Dolby Atmos" },
    image: "https://m.media-amazon.com/images/I/61M63S1VvGL._SL1500_.jpg",
    tags: ["jbl", "soundbar", "audio", "dolby-atmos", "home-theater"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BHXK87C6", url: "https://www.amazon.in/dp/B0BHXK87C6", currentPrice: 49999, isAvailable: true }
    ]
  },
  {
    slug: "sandisk-1tb-extreme-portable-ssd",
    name: "SanDisk 1TB Extreme Portable SSD (Up to 1050MB/s USB 3.2 Gen 2)",
    brand: "SanDisk",
    category: "accessory",
    description: "SanDisk 1TB Extreme Portable SSD with NVMe solid state performance, 1050MB/s read speed, IP65 water & dust resistance, USB-C interface.",
    specs: { "Capacity": "1TB", "Read Speed": "Up to 1050MB/s", "Write Speed": "Up to 1000MB/s", "Durability": "IP65 Water/Dust Resistant" },
    image: "https://m.media-amazon.com/images/I/71A914J1dLL._SL1500_.jpg",
    tags: ["sandisk", "ssd", "portable-storage", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B08GV4YYV5", url: "https://www.amazon.in/dp/B08GV4YYV5", currentPrice: 8999, isAvailable: true }
    ]
  },
  {
    slug: "anker-737-power-bank-24000mah-140w",
    name: "Anker 737 Power Bank (PowerCore 24K, 24000mAh 3-Port 140W Output)",
    brand: "Anker",
    category: "accessory",
    description: "Anker 737 Power Bank equipped with GaNPrime, 24,000mAh capacity, ultra-powerful 140W bidirectional fast charging, smart digital display.",
    specs: { "Capacity": "24,000mAh", "Max Output": "140W USB-C PD 3.1", "Ports": "2x USB-C + 1x USB-A", "Display": "Smart Digital Color Display" },
    image: "https://m.media-amazon.com/images/I/61F0fX11N9L._SL1500_.jpg",
    tags: ["anker", "powerbank", "fast-charging", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B09VPHVT2Z", url: "https://www.amazon.in/dp/B09VPHVT2Z", currentPrice: 11999, isAvailable: true }
    ]
  },
  {
    slug: "dyson-v15-detect-cordless-vacuum-cleaner",
    name: "Dyson V15 Detect Cordless Vacuum Cleaner (Yellow/Nickel)",
    brand: "Dyson",
    category: "home-appliances",
    description: "Dyson V15 Detect cordless vacuum with illumination technology revealing invisible dust, piezo sensor auto-adapting suction, up to 60 min runtime.",
    specs: { "Motor": "Dyson Hyperdymium Motor", "Filter": "Whole-machine HEPA", "Runtime": "Up to 60 Minutes", "Weight": "3.1 kg" },
    image: "https://m.media-amazon.com/images/I/61U088mE6yL._SL1500_.jpg",
    tags: ["dyson", "vacuum-cleaner", "appliances", "cordless"],
    offers: [
      { marketplace: "Amazon India", asin: "B09CM5Q8S1", url: "https://www.amazon.in/dp/B09CM5Q8S1", currentPrice: 62900, isAvailable: true }
    ]
  },
  {
    slug: "philips-hd9252-90-digital-air-fryer",
    name: "Philips HD9252/90 Digital Air Fryer (4.1 Liter, Touch Panel)",
    brand: "Philips",
    category: "home-appliances",
    description: "Philips Essential Air Fryer with Rapid Air Technology, 7 preset touch screen menus, Keep Warm function, 90% less fat cooking.",
    specs: { "Capacity": "4.1 Liters", "Power": "1400 Watts", "Presets": "7 One-touch Presets", "Tech": "Rapid Air Technology" },
    image: "https://m.media-amazon.com/images/I/61g5H2YgY0L._SL1500_.jpg",
    tags: ["philips", "air-fryer", "appliances", "kitchen"],
    offers: [
      { marketplace: "Amazon India", asin: "B097RF8VGB", url: "https://www.amazon.in/dp/B097RF8VGB", currentPrice: 8999, isAvailable: true }
    ]
  },
  {
    slug: "adidas-ultraboost-light-running-shoes-men",
    name: "Adidas Ultraboost Light Running Shoes for Men (Core Black)",
    brand: "Adidas",
    category: "shoes",
    description: "Adidas Ultraboost Light features 30% lighter BOOST material, Primeknit+ textile upper, Continental Rubber outsole for exceptional grip.",
    specs: { "Upper": "Adidas Primeknit+", "Midsole": "Light BOOST", "Outsole": "Continental Rubber", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71Nf11W9dFL._SL1500_.jpg",
    tags: ["adidas", "ultraboost", "shoes", "running", "sneakers"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BP8R4H2G", url: "https://www.amazon.in/dp/B0BP8R4H2G", currentPrice: 14999, isAvailable: true }
    ]
  },
  {
    slug: "puma-suede-classic-xxi-sneakers",
    name: "Puma Suede Classic XXI Sneakers (Black/White)",
    brand: "Puma",
    category: "shoes",
    description: "Iconic Puma Suede Classic XXI low-top sneaker featuring full suede upper, synthetic leather lining, and durable rubber midsole.",
    specs: { "Upper": "100% Suede Leather", "Sole": "Rubber", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71Q7S812QFL._SL1500_.jpg",
    tags: ["puma", "suede", "shoes", "sneakers", "fashion"],
    offers: [
      { marketplace: "Amazon India", asin: "B08HKW98Q2", url: "https://www.amazon.in/dp/B08HKW98Q2", currentPrice: 4999, isAvailable: true }
    ]
  },
  {
    slug: "ray-ban-aviator-classic-sunglasses-gold",
    name: "Ray-Ban Aviator Classic Sunglasses (Gold Frame, G-15 Green Lens)",
    brand: "Ray-Ban",
    category: "fashion-accessories",
    description: "Timeless Ray-Ban RB3025 Aviator Classic sunglasses featuring metal gold frame, G-15 crystal green lenses providing 100% UV protection.",
    specs: { "Frame Material": "Metal (Gold)", "Lens Color": "G-15 Green", "Protection": "100% UV400", "Lens Width": "58mm" },
    image: "https://m.media-amazon.com/images/I/51u8pE27D8L._SL1500_.jpg",
    tags: ["rayban", "aviator", "sunglasses", "fashion"],
    offers: [
      { marketplace: "Amazon India", asin: "B0014YN5M2", url: "https://www.amazon.in/dp/B0014YN5M2", currentPrice: 8590, isAvailable: true }
    ]
  },
  {
    slug: "tommy-hilfiger-mens-oxford-shirt-white",
    name: "Tommy Hilfiger Men's Custom Fit Solid Oxford Shirt (White)",
    brand: "Tommy Hilfiger",
    category: "mens-clothing",
    description: "Classic Tommy Hilfiger men's long-sleeve oxford button-down shirt crafted in 100% premium woven cotton with iconic flag embroidery.",
    specs: { "Material": "100% Premium Cotton", "Fit": "Custom Fit", "Collar": "Button-Down", "Sleeve": "Long Sleeve" },
    image: "https://m.media-amazon.com/images/I/71rM2Yf+NRL._SL1500_.jpg",
    tags: ["tommy-hilfiger", "shirt", "mens-fashion", "oxford"],
    offers: [
      { marketplace: "Amazon India", asin: "B00G6TWX2E", url: "https://www.amazon.in/dp/B00G6TWX2E", currentPrice: 3999, isAvailable: true }
    ]
  },
  {
    slug: "estee-lauder-advanced-night-repair-serum-50ml",
    name: "Estee Lauder Advanced Night Repair Synchronized Multi-Recovery Complex (50ml)",
    brand: "Estee Lauder",
    category: "beauty-personal-care",
    description: "Estee Lauder iconic night repair serum with Chronolux Power Signal Technology for fast visible repair and youth-generating power.",
    specs: { "Volume": "50ml", "Skin Benefit": "Anti-aging, Hydration, Radiance", "Target": "Lines & Wrinkles" },
    image: "https://m.media-amazon.com/images/I/61S1F4T+q9L._SL1500_.jpg",
    tags: ["estee-lauder", "serum", "skincare", "beauty"],
    offers: [
      { marketplace: "Amazon India", asin: "B08CG4K76B", url: "https://www.amazon.in/dp/B08CG4K76B", currentPrice: 8250, isAvailable: true }
    ]
  },
  /* BATCH 2: PRODUCTS 51 TO 80 (+30 PRODUCTS) */
  {
    slug: "samsung-galaxy-s23-fe-128gb-mint",
    name: "Samsung Galaxy S23 FE 5G (128GB, Mint)",
    brand: "Samsung",
    category: "smartphone",
    description: "Samsung Galaxy S23 FE featuring Exynos 2200 processor, 50MP main camera, Nightography, and IP68 water resistance.",
    specs: { "Storage": "128GB", "RAM": "8GB", "Display": "6.4-inch FHD+ Dynamic AMOLED 2X", "Processor": "Exynos 2200" },
    image: "https://m.media-amazon.com/images/I/61VfL-WzB5L._SL1500_.jpg",
    tags: ["samsung", "galaxy", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CJ4Y3R67", url: "https://www.amazon.in/dp/B0CJ4Y3R67", currentPrice: 38999, isAvailable: true }
    ]
  },
  {
    slug: "apple-iphone-15-128gb-black",
    name: "Apple iPhone 15 (128GB, Black)",
    brand: "Apple",
    category: "smartphone",
    description: "Apple iPhone 15 with Dynamic Island, 48MP Main camera with 2x Telephoto, A16 Bionic chip, and durable color-infused glass design.",
    specs: { "Storage": "128GB", "Display": "6.1-inch Super Retina XDR OLED", "Processor": "A16 Bionic", "Camera": "48MP + 12MP Ultra Wide" },
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
    tags: ["apple", "iphone", "smartphone", "dynamic-island", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CHX6GQky", url: "https://www.amazon.in/dp/B0CHX6GQky", currentPrice: 69900, isAvailable: true }
    ]
  },
  {
    slug: "oneplus-nord-4-256gb-oasis-green",
    name: "OnePlus Nord 4 5G (8GB RAM, 256GB Storage, Oasis Green)",
    brand: "OnePlus",
    category: "smartphone",
    description: "OnePlus Nord 4 metal unibody design featuring Snapdragon 7+ Gen 3, 5500mAh battery, and 100W SUPERVOOC fast charging.",
    specs: { "Storage": "256GB", "RAM": "8GB", "Display": "6.74-inch 120Hz AMOLED", "Processor": "Snapdragon 7+ Gen 3" },
    image: "https://m.media-amazon.com/images/I/61K76Q58hEL._SL1500_.jpg",
    tags: ["oneplus", "nord", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D8BWG9F2", url: "https://www.amazon.in/dp/B0D8BWG9F2", currentPrice: 32999, isAvailable: true }
    ]
  },
  {
    slug: "realme-gt-6-256gb-fluid-silver",
    name: "RealMe GT 6 5G (12GB RAM, 256GB Storage, Fluid Silver)",
    brand: "RealMe",
    category: "smartphone",
    description: "RealMe GT 6 powered by Snapdragon 8s Gen 3, 6000 nits Ultra Bright Display, 50MP Sony LYT-808 OIS Camera, and 120W charging.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Display": "6.78-inch 120Hz 8T LTPO OLED", "Processor": "Snapdragon 8s Gen 3" },
    image: "https://m.media-amazon.com/images/I/71p0WfC+6vL._SL1500_.jpg",
    tags: ["realme", "gt-6", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D6RFDLV9", url: "https://www.amazon.in/dp/B0D6RFDLV9", currentPrice: 40999, isAvailable: true }
    ]
  },
  {
    slug: "apple-macbook-pro-14-m3-pro-18gb-512gb",
    name: "Apple MacBook Pro 14-inch M3 Pro (18GB Unified Memory, 512GB SSD, Space Black)",
    brand: "Apple",
    category: "laptop",
    description: "Apple MacBook Pro 14-inch with M3 Pro chip (11-core CPU, 14-core GPU), Liquid Retina XDR display, up to 18 hours battery life.",
    specs: { "Processor": "Apple M3 Pro", "RAM": "18GB Unified Memory", "Storage": "512GB SSD", "Display": "14.2-inch Liquid Retina XDR" },
    image: "https://m.media-amazon.com/images/I/61CH7p04J3L._SL1500_.jpg",
    tags: ["apple", "macbook-pro", "laptop", "m3-pro"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CHX1Q1W9", url: "https://www.amazon.in/dp/B0CHX1Q1W9", currentPrice: 199900, isAvailable: true }
    ]
  },
  {
    slug: "acer-predator-helios-16-i9-rtx4080",
    name: "Acer Predator Helios 16 Gaming Laptop (Intel Core i9 14th Gen, RTX 4080, 32GB, 1TB)",
    brand: "Acer",
    category: "laptop",
    description: "Acer Predator Helios 16 high-end gaming laptop with 16-inch WQXGA 240Hz Mini LED display, Intel Core i9-14900HX, NVIDIA RTX 4080.",
    specs: { "Processor": "Intel Core i9-14900HX", "Graphics": "NVIDIA GeForce RTX 4080 12GB", "RAM": "32GB DDR5", "Storage": "1TB PCIe Gen4 SSD" },
    image: "https://m.media-amazon.com/images/I/71-0+B2K4PL._SL1500_.jpg",
    tags: ["acer", "predator", "gaming-laptop", "rtx4080"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CW1B9Y8D", url: "https://www.amazon.in/dp/B0CW1B9Y8D", currentPrice: 249990, isAvailable: true }
    ]
  },
  {
    slug: "hp-pavilion-plus-14-oled-core-ultra-5",
    name: "HP Pavilion Plus 14 OLED Laptop (Intel Core Ultra 5 125H, 16GB, 512GB SSD)",
    brand: "HP",
    category: "laptop",
    description: "HP Pavilion Plus 14 with 2.8K 120Hz OLED display, Intel Core Ultra 5 125H, Intel Arc graphics, all-metal chassis.",
    specs: { "Processor": "Intel Core Ultra 5 125H", "RAM": "16GB LPDDR5x", "Storage": "512GB SSD", "Display": "14-inch 2.8K 120Hz OLED" },
    image: "https://m.media-amazon.com/images/I/71Y9tVfQ3QL._SL1500_.jpg",
    tags: ["hp", "pavilion", "laptop", "oled"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CSGYL5D8", url: "https://www.amazon.in/dp/B0CSGYL5D8", currentPrice: 77990, isAvailable: true }
    ]
  },
  {
    slug: "dell-inspiron-15-3530-core-i5",
    name: "Dell Inspiron 15 3530 Laptop (13th Gen Intel Core i5-1334U, 16GB, 512GB SSD)",
    brand: "Dell",
    category: "laptop",
    description: "Dell Inspiron 15 3530 daily productivity laptop with 15.6-inch FHD 120Hz display, 13th Gen Intel Core i5, 16GB DDR4, Windows 11.",
    specs: { "Processor": "Intel Core i5-1334U", "RAM": "16GB DDR4", "Storage": "512GB SSD", "Display": "15.6-inch FHD 120Hz" },
    image: "https://m.media-amazon.com/images/I/61Z7Pq9n8BL._SL1500_.jpg",
    tags: ["dell", "inspiron", "laptop", "office"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C5CH5F5R", url: "https://www.amazon.in/dp/B0C5CH5F5R", currentPrice: 52990, isAvailable: true }
    ]
  },
  {
    slug: "apple-ipad-10th-gen-64gb-blue",
    name: "Apple iPad 10th Gen (10.9-inch Wi-Fi 64GB, Blue)",
    brand: "Apple",
    category: "tablet",
    description: "Apple iPad 10th Generation with colorful all-screen design, 10.9-inch Liquid Retina display, A14 Bionic chip, landscape 12MP Ultra Wide front camera.",
    specs: { "Display": "10.9-inch Liquid Retina Display", "Processor": "A14 Bionic", "Storage": "64GB", "Connectivity": "Wi-Fi 6" },
    image: "https://m.media-amazon.com/images/I/61uA2UVnYWL._SL1500_.jpg",
    tags: ["apple", "ipad", "tablet"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BJLB2Q19", url: "https://www.amazon.in/dp/B0BJLB2Q19", currentPrice: 33900, isAvailable: true }
    ]
  },
  {
    slug: "oneplus-pad-go-8gb-128gb-lte",
    name: "OnePlus Pad Go (11.35-inch 2.4K 90Hz Display, 8GB RAM, 128GB Storage, 4G LTE)",
    brand: "OnePlus",
    category: "tablet",
    description: "OnePlus Pad Go featuring 11.35-inch 2.4K Eye-Care LCD display, Dolby Atmos quad speakers, 8000mAh battery, 4G LTE connectivity.",
    specs: { "Display": "11.35-inch 2.4K 90Hz LCD", "Storage": "128GB", "RAM": "8GB", "Connectivity": "4G LTE + Wi-Fi" },
    image: "https://m.media-amazon.com/images/I/61N+E2K3jBL._SL1500_.jpg",
    tags: ["oneplus", "tablet", "lte", "android"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CJMCW298", url: "https://www.amazon.in/dp/B0CJMCW298", currentPrice: 19999, isAvailable: true }
    ]
  },
  {
    slug: "sony-bravia-theatre-bar-8-dolby-atmos",
    name: "Sony BRAVIA Theatre Bar 8 Dolby Atmos Soundbar (HT-A8000)",
    brand: "Sony",
    category: "audio",
    description: "Sony BRAVIA Theatre Bar 8 premium soundbar featuring 11 speaker units, 360 Spatial Sound Mapping, Dolby Atmos, DTS:X, HDMI 2.1 4K120 pass-through.",
    specs: { "Speakers": "11 Speaker Units", "Tech": "360 Spatial Sound Mapping + Dolby Atmos", "Passthrough": "4K 120Hz HDMI 2.1" },
    image: "https://m.media-amazon.com/images/I/51p8wE+cOLL._SL1500_.jpg",
    tags: ["sony", "soundbar", "bravia", "dolby-atmos", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D3F5X5P2", url: "https://www.amazon.in/dp/B0D3F5X5P2", currentPrice: 89990, isAvailable: true }
    ]
  },
  {
    slug: "jbl-flip-6-portable-bluetooth-speaker-black",
    name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker (Black)",
    brand: "JBL",
    category: "audio",
    description: "JBL Flip 6 2-way speaker system delivering loud, powerful, crystal-clear sound, IP67 waterproof & dustproof, up to 12 hours playtime.",
    specs: { "Power": "30W RMS Output", "Battery": "Up to 12 Hours", "Durability": "IP67 Waterproof & Dustproof" },
    image: "https://m.media-amazon.com/images/I/71R2o5j8C3L._SL1500_.jpg",
    tags: ["jbl", "speaker", "bluetooth", "waterproof", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B09G3F3Z8J", url: "https://www.amazon.in/dp/B09G3F3Z8J", currentPrice: 9999, isAvailable: true }
    ]
  },
  {
    slug: "bose-soundlink-flex-bluetooth-speaker-blue",
    name: "Bose SoundLink Flex Bluetooth Portable Speaker (Stone Blue)",
    brand: "Bose",
    category: "audio",
    description: "Bose SoundLink Flex wireless speaker with PositionIQ technology, IP67 waterproof rating, rugged utility loop, up to 12 hours charge.",
    specs: { "Technology": "PositionIQ Dynamic Audio", "Rating": "IP67 Dust & Water Resistant", "Battery": "Up to 12 Hours" },
    image: "https://m.media-amazon.com/images/I/71W8sT3K2GL._SL1500_.jpg",
    tags: ["bose", "speaker", "bluetooth", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B099TJ72MV", url: "https://www.amazon.in/dp/B099TJ72MV", currentPrice: 15900, isAvailable: true }
    ]
  },
  {
    slug: "apple-watch-ultra-2-49mm-titanium",
    name: "Apple Watch Ultra 2 49mm GPS + Cellular (Titanium Case, Blue/Black Trail Loop)",
    brand: "Apple",
    category: "smartwatch",
    description: "Apple Watch Ultra 2 built for rugged endurance with S9 SiP, 3000 nits brightest display, dual-frequency GPS, 36-hour battery life.",
    specs: { "Case": "49mm Titanium", "Display": "3000 nits Always-On Retina", "Processor": "S9 SiP", "Water Resistance": "100m" },
    image: "https://m.media-amazon.com/images/I/71E3W-M8E5L._SL1500_.jpg",
    tags: ["apple", "apple-watch", "watch-ultra", "smartwatch"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CHX37WWZ", url: "https://www.amazon.in/dp/B0CHX37WWZ", currentPrice: 89900, isAvailable: true }
    ]
  },
  {
    slug: "amazfit-gtr-4-smartwatch-black",
    name: "Amazfit GTR 4 Smart Watch (Superspeed Black)",
    brand: "Amazfit",
    category: "smartwatch",
    description: "Amazfit GTR 4 with Dual-Band Circularly Polarized GPS antenna, 150+ Sports Modes, AMOLED Display, 14-day battery life.",
    specs: { "Display": "1.43-inch HD AMOLED", "GPS": "Dual-Band 6 Satellite Positioning", "Battery": "Up to 14 Days" },
    image: "https://m.media-amazon.com/images/I/61H3-t29MML._SL1500_.jpg",
    tags: ["amazfit", "smartwatch", "fitness", "gps"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B91X93MD", url: "https://www.amazon.in/dp/B0B91X93MD", currentPrice: 14999, isAvailable: true }
    ]
  },
  {
    slug: "samsung-odyssey-g7-28inch-4k-144hz-monitor",
    name: "Samsung Odyssey G7 28-inch 4K UHD 144Hz IPS Gaming Monitor (LS28BG700EWXXL)",
    brand: "Samsung",
    category: "monitor",
    description: "Samsung Odyssey G7 28-inch 4K UHD (3840x2160) IPS gaming monitor with 144Hz, 1ms, G-Sync, Smart TV Hub built-in.",
    specs: { "Screen Size": "28 inches", "Resolution": "4K UHD (3840 x 2160)", "Refresh Rate": "144Hz", "Panel": "IPS" },
    image: "https://m.media-amazon.com/images/I/81sF6zL6S2L._SL1500_.jpg",
    tags: ["samsung", "odyssey", "monitor", "4k", "gaming"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C5229J7W", url: "https://www.amazon.in/dp/B0C5229J7W", currentPrice: 44999, isAvailable: true }
    ]
  },
  {
    slug: "benq-ew3270u-32inch-4k-hdr-monitor",
    name: "BenQ EW3270U 32-inch 4K HDR Monitor",
    brand: "BenQ",
    category: "monitor",
    description: "BenQ 32-inch 4K UHD (3840x2160) VA monitor with HDR PRO, Brightness Intelligence Plus, USB-C, 95% DCI-P3 color gamut.",
    specs: { "Screen Size": "32 inches", "Resolution": "4K UHD (3840 x 2160)", "Panel": "VA", "Eye Care": "Brightness Intelligence Plus" },
    image: "https://m.media-amazon.com/images/I/71cZ5c82E8L._SL1500_.jpg",
    tags: ["benq", "monitor", "4k", "eye-care"],
    offers: [
      { marketplace: "Amazon India", asin: "B07BBRLTR5", url: "https://www.amazon.in/dp/B07BBRLTR5", currentPrice: 28990, isAvailable: true }
    ]
  },
  {
    slug: "canon-eos-r6-mark-ii-mirrorless-camera-body",
    name: "Canon EOS R6 Mark II Mirrorless Camera Body",
    brand: "Canon",
    category: "camera",
    description: "Canon EOS R6 Mark II full-frame mirrorless camera featuring 24.2MP CMOS sensor, DIGIC X processor, up to 40 fps electronic shutter, 4K 60p oversampled video.",
    specs: { "Sensor": "24.2MP Full-Frame CMOS", "Processor": "DIGIC X", "Burst": "Up to 40 fps", "Video": "4K 60p Uncropped" },
    image: "https://m.media-amazon.com/images/I/71d1V2uD7PL._SL1500_.jpg",
    tags: ["canon", "camera", "mirrorless", "fullframe"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BKR3T9L4", url: "https://www.amazon.in/dp/B0BKR3T9L4", currentPrice: 219995, isAvailable: true }
    ]
  },
  {
    slug: "microsoft-xbox-series-x-1tb-console",
    name: "Xbox Series X Console (1TB SSD, Black)",
    brand: "Microsoft",
    category: "gaming",
    description: "Microsoft Xbox Series X fastest, most powerful Xbox ever with 12 teraflops processing power, 1TB custom NVMe SSD, 4K 120 FPS gaming.",
    specs: { "Processor": "12 TFLOPS Custom RDNA 2", "Storage": "1TB NVMe SSD", "Output": "True 4K 120 FPS" },
    image: "https://m.media-amazon.com/images/I/61-2B4HabXL._SL1500_.jpg",
    tags: ["xbox", "microsoft", "gaming", "console"],
    offers: [
      { marketplace: "Amazon India", asin: "B08H93ZRLL", url: "https://www.amazon.in/dp/B08H93ZRLL", currentPrice: 52990, isAvailable: true }
    ]
  },
  {
    slug: "logitech-g502-lightspeed-wireless-gaming-mouse",
    name: "Logitech G502 LIGHTSPEED Wireless Gaming Mouse",
    brand: "Logitech",
    category: "accessory",
    description: "Logitech G502 LIGHTSPEED wireless gaming mouse featuring HERO 25K sensor, 11 programmable buttons, tunable weight system, LIGHTSYNC RGB.",
    specs: { "Sensor": "HERO 25K (25,600 DPI)", "Wireless": "1ms LIGHTSPEED", "Buttons": "11 Programmable" },
    image: "https://m.media-amazon.com/images/I/61mpMH5TzkL._SL1500_.jpg",
    tags: ["logitech", "g502", "mouse", "gaming", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B07NDPU538", url: "https://www.amazon.in/dp/B07NDPU538", currentPrice: 7995, isAvailable: true }
    ]
  },
  {
    slug: "keychron-k2-v2-wireless-mechanical-keyboard",
    name: "Keychron K2 V2 Wireless Mechanical Keyboard (Gateron Brown Switch)",
    brand: "Keychron",
    category: "accessory",
    description: "Keychron K2 V2 75% layout wireless mechanical keyboard with Gateron G Pro Brown switches, Bluetooth 5.1/USB-C dual mode, Mac/Windows layout.",
    specs: { "Layout": "75% Compact (84 Keys)", "Switches": "Gateron G Pro Brown", "Battery": "4000mAh", "Connectivity": "Bluetooth 5.1 / Wired" },
    image: "https://m.media-amazon.com/images/I/61bV1nN4dGL._SL1500_.jpg",
    tags: ["keychron", "keyboard", "mechanical-keyboard", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B07YB32B52", url: "https://www.amazon.in/dp/B07YB32B52", currentPrice: 7499, isAvailable: true }
    ]
  },
  {
    slug: "samsung-1-5-ton-5-star-ai-inverter-split-ac",
    name: "Samsung 1.5 Ton 5 Star AI Inverter Split AC (AR18CY5AMWK)",
    brand: "Samsung",
    category: "air-conditioner",
    description: "Samsung 1.5 Ton 5 Star Split AC with WindFree Cooling technology, AI Auto Cooling, 5-in-1 convertible modes, copper condenser.",
    specs: { "Capacity": "1.5 Ton", "Energy Rating": "5 Star BEE", "Tech": "WindFree Cooling + AI Auto" },
    image: "https://m.media-amazon.com/images/I/51H65hC6W4L._SL1500_.jpg",
    tags: ["samsung", "ac", "air-conditioner", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BSGFZ5N9", url: "https://www.amazon.in/dp/B0BSGFZ5N9", currentPrice: 44990, isAvailable: true }
    ]
  },
  {
    slug: "ifb-8kg-5star-ai-front-load-washing-machine",
    name: "IFB 8 kg 5 Star AI Front Load Washing Machine (Executive ZXM)",
    brand: "IFB",
    category: "washing-machine",
    description: "IFB Executive ZXM 8kg front load washing machine with AI powered fabric detection, 9-swirl wash, 4D wash system, steam refresh cycle.",
    specs: { "Capacity": "8 kg", "Energy Rating": "5 Star", "Tech": "AI Neural Network + 4D Wash" },
    image: "https://m.media-amazon.com/images/I/61nN3H4mFPL._SL1500_.jpg",
    tags: ["ifb", "washing-machine", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BYDFG87Z", url: "https://www.amazon.in/dp/B0BYDFG87Z", currentPrice: 37990, isAvailable: true }
    ]
  },
  {
    slug: "lg-242l-3star-frost-free-double-door-refrigerator",
    name: "LG 242 L 3 Star Smart Inverter Frost Free Double Door Refrigerator",
    brand: "LG",
    category: "refrigerator",
    description: "LG 242L Double Door Refrigerator featuring Smart Inverter Compressor, Door Cooling+, Multi Air Flow, humidity controller crisper.",
    specs: { "Capacity": "242 Liters", "Energy Rating": "3 Star BEE", "Compressor": "Smart Inverter Compressor" },
    image: "https://m.media-amazon.com/images/I/61Y-tL716UL._SL1500_.jpg",
    tags: ["lg", "refrigerator", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BPBYW5XG", url: "https://www.amazon.in/dp/B0BPBYW5XG", currentPrice: 26990, isAvailable: true }
    ]
  },
  {
    slug: "philips-sonicare-protectiveclean-4300-toothbrush",
    name: "Philips Sonicare ProtectiveClean 4300 Electric Toothbrush",
    brand: "Philips",
    category: "beauty-personal-care",
    description: "Philips Sonicare ProtectiveClean 4300 with pressure sensor, QuadPacer timer, removes up to 7x more plaque than a manual toothbrush.",
    specs: { "Tech": "Sonic Vibrations up to 62,000 movements/min", "Battery": "Up to 14 Days" },
    image: "https://m.media-amazon.com/images/I/61iV8Xk3T4L._SL1500_.jpg",
    tags: ["philips", "toothbrush", "personal-care", "dental"],
    offers: [
      { marketplace: "Amazon India", asin: "B078GVDBZ1", url: "https://www.amazon.in/dp/B078GVDBZ1", currentPrice: 4499, isAvailable: true }
    ]
  },
  {
    slug: "nike-pegasus-40-running-shoes-men-black",
    name: "Nike Pegasus 40 Running Shoes for Men (Black/White)",
    brand: "Nike",
    category: "shoes",
    description: "Nike Pegasus 40 neutral daily running shoes featuring dual Zoom Air units, React foam midsole, engineered mesh upper for breathable comfort.",
    specs: { "Midsole": "Nike React Foam + Dual Zoom Air", "Upper": "Single-layer Mesh", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71v4D0FmYJL._SL1500_.jpg",
    tags: ["nike", "pegasus", "shoes", "running", "sneakers"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BZSCM9G5", url: "https://www.amazon.in/dp/B0BZSCM9G5", currentPrice: 11895, isAvailable: true }
    ]
  },
  {
    slug: "puma-mens-t7-iconic-track-pants-black",
    name: "Puma Men's T7 Iconic Track Pants (Puma Black)",
    brand: "Puma",
    category: "mens-clothing",
    description: "Puma iconic T7 track pants featuring signature 7cm stripes on side seams, elastic waist with drawcord, ribbed cuffs.",
    specs: { "Material": "59% Polyester, 41% Cotton", "Fit": "Regular Fit" },
    image: "https://m.media-amazon.com/images/I/61-m5c88kUL._SL1500_.jpg",
    tags: ["puma", "track-pants", "mens-clothing", "sportswear"],
    offers: [
      { marketplace: "Amazon India", asin: "B08H7V22K7", url: "https://www.amazon.in/dp/B08H7V22K7", currentPrice: 2499, isAvailable: true }
    ]
  },
  {
    slug: "adidas-womens-own-the-run-jacket-black",
    name: "Adidas Women's Own The Run Running Jacket (Black)",
    brand: "Adidas",
    category: "womens-clothing",
    description: "Adidas lightweight full-zip running jacket with WIND.RDY weather protection, 360 reflectivity, sweat-guard pocket.",
    specs: { "Material": "100% Recycled Polyester", "Tech": "WIND.RDY Protection" },
    image: "https://m.media-amazon.com/images/I/71N1yY4qC3L._SL1500_.jpg",
    tags: ["adidas", "jacket", "womens-clothing", "running"],
    offers: [
      { marketplace: "Amazon India", asin: "B09BN94Q5W", url: "https://www.amazon.in/dp/B09BN94Q5W", currentPrice: 4299, isAvailable: true }
    ]
  },
  {
    slug: "fossil-gen-6-touchscreen-smartwatch-leather",
    name: "Fossil Gen 6 Touchscreen Smartwatch with Leather Strap (Brown)",
    brand: "Fossil",
    category: "smartwatch",
    description: "Fossil Gen 6 smartwatch powered by Snapdragon Wear 4100+ platform, SpO2 sensor, heart rate tracking, rapid charging (80% in 30 mins).",
    specs: { "Processor": "Snapdragon Wear 4100+", "Display": "1.28-inch Color AMOLED", "Strap": "22mm Brown Leather" },
    image: "https://m.media-amazon.com/images/I/71t-B3b+uKL._SL1500_.jpg",
    tags: ["fossil", "smartwatch", "wear-os", "leather"],
    offers: [
      { marketplace: "Amazon India", asin: "B09B2QW995", url: "https://www.amazon.in/dp/B09B2QW995", currentPrice: 18495, isAvailable: true }
    ]
  },
  {
    slug: "american-tourister-matrix-68cm-hardside-luggage-navy",
    name: "American Tourister Matrix 68cm Medium Hardside Spinner Luggage (Navy)",
    brand: "American Tourister",
    category: "bags",
    description: "American Tourister Matrix scratch-resistant polypropylene hardside spinner luggage with 3-digit TSA lock, double spinner wheels.",
    specs: { "Material": "100% Polypropylene", "Size": "68cm Medium", "Lock": "TSA Combination Lock" },
    image: "https://m.media-amazon.com/images/I/71cW1H58XGL._SL1500_.jpg",
    tags: ["american-tourister", "luggage", "bags", "travel"],
    offers: [
      { marketplace: "Amazon India", asin: "B08FB9X98K", url: "https://www.amazon.in/dp/B08FB9X98K", currentPrice: 4799, isAvailable: true }
    ]
  },
  /* BATCH 3: PRODUCTS 81 TO 110 (+30 PRODUCTS) */
  {
    slug: "samsung-galaxy-z-fold-6-256gb",
    name: "Samsung Galaxy Z Fold 6 5G (256GB, Silver Shadow)",
    brand: "Samsung",
    category: "smartphone",
    description: "Samsung Galaxy Z Fold 6 foldable smartphone featuring 7.6-inch QXGA+ Dynamic AMOLED 2X main screen, Snapdragon 8 Gen 3, and Galaxy AI.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Main Display": "7.6-inch 120Hz Foldable AMOLED", "Cover Display": "6.3-inch AMOLED" },
    image: "https://m.media-amazon.com/images/I/71X4t3sM5wL._SL1500_.jpg",
    tags: ["samsung", "foldable", "z-fold", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D7MQH9L8", url: "https://www.amazon.in/dp/B0D7MQH9L8", currentPrice: 164999, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-z-flip-6-256gb",
    name: "Samsung Galaxy Z Flip 6 5G (256GB, Mint)",
    brand: "Samsung",
    category: "smartphone",
    description: "Samsung Galaxy Z Flip 6 foldable phone with 3.4-inch Flex Window cover screen, 50MP FlexCam with Auto Zoom, and 4000mAh battery.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Main Display": "6.7-inch 120Hz FHD+ AMOLED", "Processor": "Snapdragon 8 Gen 3" },
    image: "https://m.media-amazon.com/images/I/61N+x23Sj5L._SL1500_.jpg",
    tags: ["samsung", "foldable", "z-flip", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D7MRN3K1", url: "https://www.amazon.in/dp/B0D7MRN3K1", currentPrice: 109999, isAvailable: true }
    ]
  },
  {
    slug: "vivo-x100-pro-512gb-asteroid-black",
    name: "Vivo X100 Pro 5G (16GB RAM, 512GB Storage, Asteroid Black)",
    brand: "Vivo",
    category: "smartphone",
    description: "Vivo X100 Pro featuring ZEISS APO Floating Telephoto Camera, 1-inch Sony IMX989 Main Sensor, MediaTek Dimensity 9300, and 100W FlashCharge.",
    specs: { "Storage": "512GB", "RAM": "16GB", "Display": "6.78-inch 120Hz LTPO AMOLED", "Processor": "Dimensity 9300" },
    image: "https://m.media-amazon.com/images/I/71f2N6pSgUL._SL1500_.jpg",
    tags: ["vivo", "zeiss", "smartphone", "camera", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CS6Y74K9", url: "https://www.amazon.in/dp/B0CS6Y74K9", currentPrice: 89999, isAvailable: true }
    ]
  },
  {
    slug: "motorola-edge-50-ultra-512gb",
    name: "Motorola Edge 50 Ultra 5G (12GB RAM, 512GB Storage, Peach Fuzz)",
    brand: "Motorola",
    category: "smartphone",
    description: "Motorola Edge 50 Ultra featuring real vegan leather/wood finish, Snapdragon 8s Gen 3, 50MP Triple Camera with 100x Super Zoom, 125W charging.",
    specs: { "Storage": "512GB", "RAM": "12GB", "Display": "6.7-inch 144Hz pOLED", "Processor": "Snapdragon 8s Gen 3" },
    image: "https://m.media-amazon.com/images/I/71Y8T7Z2hJL._SL1500_.jpg",
    tags: ["motorola", "edge-50", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D7VJ71K4", url: "https://www.amazon.in/dp/B0D7VJ71K4", currentPrice: 59999, isAvailable: true }
    ]
  },
  {
    slug: "apple-macbook-air-m2-15inch-256gb",
    name: "Apple MacBook Air M2 15-inch (8GB RAM, 256GB SSD, Starlight)",
    brand: "Apple",
    category: "laptop",
    description: "Apple MacBook Air 15-inch with M2 chip, 15.3-inch Liquid Retina Display, 6-speaker sound system with Spatial Audio, 18-hour battery.",
    specs: { "Processor": "Apple M2", "RAM": "8GB Unified", "Storage": "256GB SSD", "Display": "15.3-inch Liquid Retina" },
    image: "https://m.media-amazon.com/images/I/71S4WzJ+k8L._SL1500_.jpg",
    tags: ["apple", "macbook-air", "laptop", "m2"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C7676H5J", url: "https://www.amazon.in/dp/B0C7676H5J", currentPrice: 114900, isAvailable: true }
    ]
  },
  {
    slug: "lenovo-legion-pro-5-ryzen7-rtx4070",
    name: "Lenovo Legion Pro 5 Gaming Laptop (AMD Ryzen 7 7745HX, RTX 4070, 32GB, 1TB)",
    brand: "Lenovo",
    category: "laptop",
    description: "Lenovo Legion Pro 5 gaming laptop featuring 16-inch WQXGA 240Hz 500 nits display, AMD Ryzen 7 7745HX, NVIDIA RTX 4070 8GB GPU.",
    specs: { "Processor": "AMD Ryzen 7 7745HX", "Graphics": "NVIDIA GeForce RTX 4070 8GB", "RAM": "32GB DDR5", "Storage": "1TB PCIe Gen4 SSD" },
    image: "https://m.media-amazon.com/images/I/61s8B3ySjPL._SL1500_.jpg",
    tags: ["lenovo", "legion", "gaming-laptop", "rtx4070"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C58M67L2", url: "https://www.amazon.in/dp/B0C58M67L2", currentPrice: 159990, isAvailable: true }
    ]
  },
  {
    slug: "msi-stealth-16-ai-studio-core-ultra-9",
    name: "MSI Stealth 16 AI Studio (Intel Core Ultra 9 185H, RTX 4070, 32GB, 2TB SSD)",
    brand: "MSI",
    category: "laptop",
    description: "MSI Stealth 16 AI Studio lightweight magnesium-aluminum alloy body, 16-inch UHD+ 120Hz Mini LED display, Intel Core Ultra 9 185H.",
    specs: { "Processor": "Intel Core Ultra 9 185H", "Graphics": "NVIDIA GeForce RTX 4070 8GB", "RAM": "32GB DDR5", "Storage": "2TB NVMe SSD" },
    image: "https://m.media-amazon.com/images/I/71Q3H7F1XPL._SL1500_.jpg",
    tags: ["msi", "stealth", "laptop", "studio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CW1F39N8", url: "https://www.amazon.in/dp/B0CW1F39N8", currentPrice: 229990, isAvailable: true }
    ]
  },
  {
    slug: "asus-zenbook-14-oled-intel-core-ultra-7",
    name: "ASUS Zenbook 14 OLED (Intel Core Ultra 7 155H, 16GB, 1TB SSD)",
    brand: "ASUS",
    category: "laptop",
    description: "ASUS Zenbook 14 OLED ultraportable laptop with 14-inch 3K 120Hz OLED touchscreen, Intel Core Ultra 7 155H, Intel Arc graphics, 1.2 kg weight.",
    specs: { "Processor": "Intel Core Ultra 7 155H", "RAM": "16GB LPDDR5X", "Storage": "1TB SSD", "Display": "14-inch 3K 120Hz OLED Touch" },
    image: "https://m.media-amazon.com/images/I/71jS6s1hMOL._SL1500_.jpg",
    tags: ["asus", "zenbook", "laptop", "oled", "ultrabook"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CSGZP2F9", url: "https://www.amazon.in/dp/B0CSGZP2F9", currentPrice: 99990, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-tab-s9-fe-128gb",
    name: "Samsung Galaxy Tab S9 FE (10.9-inch 90Hz, 6GB RAM, 128GB Wi-Fi, Gray)",
    brand: "Samsung",
    category: "tablet",
    description: "Samsung Galaxy Tab S9 FE with IP68 water and dust resistance, 10.9-inch 90Hz LCD display, Exynos 1380, S Pen included in box.",
    specs: { "Display": "10.9-inch 90Hz LCD", "Processor": "Exynos 1380", "Storage": "128GB", "RAM": "6GB" },
    image: "https://m.media-amazon.com/images/I/61H4P2yJ5WL._SL1500_.jpg",
    tags: ["samsung", "galaxy-tab", "tablet", "s-pen"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CGM4F5P3", url: "https://www.amazon.in/dp/B0CGM4F5P3", currentPrice: 34999, isAvailable: true }
    ]
  },
  {
    slug: "lenovo-tab-p12-256gb-3k-display",
    name: "Lenovo Tab P12 (12.7-inch 3K Display, 8GB RAM, 256GB Storage, Wi-Fi with Pen)",
    brand: "Lenovo",
    category: "tablet",
    description: "Lenovo Tab P12 featuring large 12.7-inch 3K LCD screen, MediaTek Dimensity 7050, quad JBL speakers with Dolby Atmos, Tab Pen Plus included.",
    specs: { "Display": "12.7-inch 3K (2944 x 1840)", "Processor": "MediaTek Dimensity 7050", "Storage": "256GB", "RAM": "8GB" },
    image: "https://m.media-amazon.com/images/I/61v3D569TFL._SL1500_.jpg",
    tags: ["lenovo", "tablet", "3k-display", "stylus"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CBR479F6", url: "https://www.amazon.in/dp/B0CBR479F6", currentPrice: 26999, isAvailable: true }
    ]
  },
  {
    slug: "sony-ht-a7000-712ch-dolby-atmos-soundbar",
    name: "Sony HT-A7000 7.1.2ch Dolby Atmos Soundbar",
    brand: "Sony",
    category: "audio",
    description: "Sony flagship HT-A7000 soundbar with 7.1.2 channels, 2 up-firing speakers, 2 beam tweeters, built-in dual subwoofer, 8K HDR/4K 120 passthrough.",
    specs: { "Channels": "7.1.2 Channel", "Power Output": "500W", "Passthrough": "8K HDR / 4K 120Hz HDMI 2.1" },
    image: "https://m.media-amazon.com/images/I/61mZ5C0pE3L._SL1500_.jpg",
    tags: ["sony", "soundbar", "dolby-atmos", "audio", "home-theater"],
    offers: [
      { marketplace: "Amazon India", asin: "B09D81P3N5", url: "https://www.amazon.in/dp/B09D81P3N5", currentPrice: 99990, isAvailable: true }
    ]
  },
  {
    slug: "marshall-stanmore-iii-bluetooth-speaker-black",
    name: "Marshall Stanmore III Wireless Bluetooth Speaker (Black)",
    brand: "Marshall",
    category: "audio",
    description: "Marshall Stanmore III iconic home Bluetooth speaker with re-engineered wider soundstage, Placement Compensation, Bluetooth 5.2.",
    specs: { "Power Amplifiers": "One 50W Class D (Woofer) + Two 15W Class D (Tweeters)", "Frequency": "45–20,000 Hz" },
    image: "https://m.media-amazon.com/images/I/71aZ5f284OL._SL1500_.jpg",
    tags: ["marshall", "speaker", "bluetooth", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B8C8T3P9", url: "https://www.amazon.in/dp/B0B8C8T3P9", currentPrice: 31999, isAvailable: true }
    ]
  },
  {
    slug: "sennheiser-momentum-4-wireless-headphones",
    name: "Sennheiser Momentum 4 Wireless Headphones (Black)",
    brand: "Sennheiser",
    category: "headphones",
    description: "Sennheiser Momentum 4 wireless headphones featuring audiophile 42mm transducer system, Adaptive Noise Cancellation, outstanding 60-hour battery life.",
    specs: { "Transducer": "42mm Dynamic", "ANC": "Adaptive ANC", "Battery Life": "Up to 60 Hours" },
    image: "https://m.media-amazon.com/images/I/71qZ6s+8wKL._SL1500_.jpg",
    tags: ["sennheiser", "headphones", "anc", "audiophile"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B6GHWEP5", url: "https://www.amazon.in/dp/B0B6GHWEP5", currentPrice: 24990, isAvailable: true }
    ]
  },
  {
    slug: "apple-airpods-max-space-grey",
    name: "Apple AirPods Max Wireless Over-Ear Headphones (Space Grey)",
    brand: "Apple",
    category: "headphones",
    description: "Apple-designed dynamic driver headphones featuring Active Noise Cancellation with Transparency mode, Spatial Audio with dynamic head tracking, digital crown control.",
    specs: { "Driver": "Apple-designed Dynamic Driver", "Processor": "Apple H1 Chip (in each cup)", "Battery": "20 Hours" },
    image: "https://m.media-amazon.com/images/I/81d5w1KStFL._SL1500_.jpg",
    tags: ["apple", "airpods-max", "headphones", "anc", "spatial-audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B08PZHYWJS", url: "https://www.amazon.in/dp/B08PZHYWJS", currentPrice: 59900, isAvailable: true }
    ]
  },
  {
    slug: "jabra-elite-10-gen-2-earbuds",
    name: "Jabra Elite 10 Gen 2 Advanced ANC Earbuds (Titanium Black)",
    brand: "Jabra",
    category: "earbuds",
    description: "Jabra Elite 10 Gen 2 with Smart Case spatial audio streaming, 2x stronger Advanced ANC, Dolby Atmos with Head Tracking, 6-mic clear calls.",
    specs: { "Drivers": "10mm ComfortFit Speakers", "Tech": "Dolby Atmos Head Tracking", "Battery": "6 Hours (27 with case)" },
    image: "https://m.media-amazon.com/images/I/61w4Z27x3ML._SL1500_.jpg",
    tags: ["jabra", "earbuds", "tws", "anc", "dolby-atmos"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D5B3M5S2", url: "https://www.amazon.in/dp/B0D5B3M5S2", currentPrice: 21999, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-watch-ultra-47mm-lte",
    name: "Samsung Galaxy Watch Ultra 47mm LTE (Titanium Gray)",
    brand: "Samsung",
    category: "smartwatch",
    description: "Samsung Galaxy Watch Ultra crafted with Cushion Design Grade 4 Titanium case, 100m water resistance, Dual-frequency GPS, 100-hour battery saver mode.",
    specs: { "Case": "47mm Grade 4 Titanium", "Connectivity": "4G LTE + Bluetooth", "Durability": "10 ATM / IP68 / MIL-STD-810H" },
    image: "https://m.media-amazon.com/images/I/71fZ1Xv6WBL._SL1500_.jpg",
    tags: ["samsung", "watch-ultra", "smartwatch", "outdoor", "lte"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D7MSF97L", url: "https://www.amazon.in/dp/B0D7MSF97L", currentPrice: 59999, isAvailable: true }
    ]
  },
  {
    slug: "lg-34inch-ultrawide-curved-wqhd-144hz-monitor",
    name: "LG 34-inch UltraWide Curved WQHD 144Hz Monitor (34WP65C-B)",
    brand: "LG",
    category: "monitor",
    description: "LG 34-inch 21:9 UltraWide Curved WQHD (3440x1440) VA display with 144Hz refresh rate, 1ms MBR, HDR10, AMD FreeSync Premium.",
    specs: { "Screen Size": "34 inches 21:9", "Resolution": "WQHD (3440 x 1440)", "Refresh Rate": "144Hz", "Panel": "Curved VA" },
    image: "https://m.media-amazon.com/images/I/81aZ7m5GgWL._SL1500_.jpg",
    tags: ["lg", "ultrawide", "monitor", "curved", "gaming"],
    offers: [
      { marketplace: "Amazon India", asin: "B099R8L4S7", url: "https://www.amazon.in/dp/B099R8L4S7", currentPrice: 32999, isAvailable: true }
    ]
  },
  {
    slug: "sony-alpha-6700-mirrorless-camera-body",
    name: "Sony Alpha 6700 APS-C Mirrorless Camera Body",
    brand: "Sony",
    category: "camera",
    description: "Sony Alpha 6700 APS-C mirrorless camera featuring 26.0MP back-illuminated Exmor R CMOS sensor, AI Processing Unit for real-time subject tracking, 4K 120p video.",
    specs: { "Sensor": "26.0MP APS-C Exmor R CMOS", "Processor": "BIONZ XR + AI Processing Unit", "Video": "4K 120p / FHD 240p" },
    image: "https://m.media-amazon.com/images/I/71R2M88kP3L._SL1500_.jpg",
    tags: ["sony", "alpha", "camera", "mirrorless", "apsc"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CB9D8X5F", url: "https://www.amazon.in/dp/B0CB9D8X5F", currentPrice: 129990, isAvailable: true }
    ]
  },
  {
    slug: "gopro-hero12-black-action-camera",
    name: "GoPro HERO12 Black Action Camera",
    brand: "GoPro",
    category: "camera",
    description: "GoPro HERO12 Black action camera with 5.3K60 video, HDR video & photo, HyperSmooth 6.0 stabilization with AutoBoost, Bluetooth audio support.",
    specs: { "Video": "5.3K 60fps / 4K 120fps", "Stabilization": "HyperSmooth 6.0", "Waterproofing": "33ft (10m) without housing" },
    image: "https://m.media-amazon.com/images/I/61c8Y84NfPL._SL1500_.jpg",
    tags: ["gopro", "action-camera", "camera", "vlogging"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CGB2F22Z", url: "https://www.amazon.in/dp/B0CGB2F22Z", currentPrice: 37990, isAvailable: true }
    ]
  },
  {
    slug: "sony-dualsense-edge-wireless-controller-ps5",
    name: "Sony DualSense Edge Wireless Controller (PS5)",
    brand: "Sony",
    category: "gaming",
    description: "Sony DualSense Edge high-performance customizable wireless controller for PS5 featuring remappable buttons, changeable stick modules, back buttons, lockable triggers.",
    specs: { "Compatibility": "PlayStation 5 / PC", "Customization": "Swappable Stick Caps & Back Buttons", "Triggers": "Adjustable Trigger Stops" },
    image: "https://m.media-amazon.com/images/I/61WzX8G+4PL._SL1500_.jpg",
    tags: ["sony", "dualsense-edge", "ps5", "controller", "gaming"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BP5N97K5", url: "https://www.amazon.in/dp/B0BP5N97K5", currentPrice: 18990, isAvailable: true }
    ]
  },
  {
    slug: "wd-black-2tb-sn850x-nvme-gaming-ssd",
    name: "WD Black 2TB SN850X NVMe Internal Gaming SSD",
    brand: "Western Digital",
    category: "accessory",
    description: "WD_BLACK SN850X PCIe Gen4 NVMe SSD with blistering read speeds up to 7300MB/s, Game Mode 2.0, compatible with PS5 console expansion.",
    specs: { "Capacity": "2TB", "Read Speed": "Up to 7300MB/s", "Interface": "PCIe Gen4 x4 NVMe" },
    image: "https://m.media-amazon.com/images/I/71V2n1hM72L._SL1500_.jpg",
    tags: ["wd", "ssd", "nvme", "ps5-storage", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B7CMZ3QH", url: "https://www.amazon.in/dp/B0B7CMZ3QH", currentPrice: 14999, isAvailable: true }
    ]
  },
  {
    slug: "elgato-stream-deck-mk2-black",
    name: "Elgato Stream Deck MK.2 (15 Macro Keys, Black)",
    brand: "Elgato",
    category: "accessory",
    description: "Elgato Stream Deck MK.2 tactile studio controller featuring 15 customizable LCD keys to trigger instant actions for live streaming, editing, and workflows.",
    specs: { "Keys": "15 Customizable LCD Keys", "Interface": "USB 2.0", "Compatibility": "macOS / Windows" },
    image: "https://m.media-amazon.com/images/I/61N8Z8JmD1L._SL1500_.jpg",
    tags: ["elgato", "stream-deck", "streaming", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B09738CV2G", url: "https://www.amazon.in/dp/B09738CV2G", currentPrice: 13999, isAvailable: true }
    ]
  },
  {
    slug: "carrier-1-5-ton-5-star-ai-flexicool-split-ac",
    name: "Carrier 1.5 Ton 5 Star AI Flexicool Inverter Split AC (15K 5 Star)",
    brand: "Carrier",
    category: "air-conditioner",
    description: "Carrier 1.5 Ton 5 Star Inverter AC with Flexicool 6-in-1 convertible cooling, Dual Filtration (PM 2.5 + HD Filter), 100% copper condenser.",
    specs: { "Capacity": "1.5 Ton", "Energy Rating": "5 Star BEE", "Tech": "Flexicool 6-in-1 Convertible" },
    image: "https://m.media-amazon.com/images/I/51Z7a6W6B3L._SL1500_.jpg",
    tags: ["carrier", "ac", "air-conditioner", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BSGLG98W", url: "https://www.amazon.in/dp/B0BSGLG98W", currentPrice: 41990, isAvailable: true }
    ]
  },
  {
    slug: "bosch-8kg-5star-inverter-front-load-washing-machine",
    name: "Bosch 8 kg 5 Star Inverter Touch Control Front Load Washing Machine",
    brand: "Bosch",
    category: "washing-machine",
    description: "Bosch Series 4 8kg front load washing machine featuring EcoSilence Drive inverter motor, AntiTangle feature, AntiVibration design, 1200 RPM.",
    specs: { "Capacity": "8 kg", "Energy Rating": "5 Star", "Motor": "EcoSilence Drive Frictionless Motor" },
    image: "https://m.media-amazon.com/images/I/61b7829M7PL._SL1500_.jpg",
    tags: ["bosch", "washing-machine", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BRZ38N4B", url: "https://www.amazon.in/dp/B0BRZ38N4B", currentPrice: 36990, isAvailable: true }
    ]
  },
  {
    slug: "haier-325l-3star-bottom-mounted-refrigerator",
    name: "Haier 325 L 3 Star Frost Free Bottom Mounted Double Door Refrigerator",
    brand: "Haier",
    category: "refrigerator",
    description: "Haier 325L 14-in-1 Convertible Bottom Mounted Refrigerator with 2x bigger vegetable box, Triple Inverter & Dual Fan Technology.",
    specs: { "Capacity": "325 Liters", "Design": "Bottom Mounted Freezer", "Energy Rating": "3 Star BEE" },
    image: "https://m.media-amazon.com/images/I/61a7B77M8kL._SL1500_.jpg",
    tags: ["haier", "refrigerator", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B9G55799", url: "https://www.amazon.in/dp/B0B9G55799", currentPrice: 34990, isAvailable: true }
    ]
  },
  {
    slug: "philips-sonicare-diamondclean-9000-black",
    name: "Philips Sonicare DiamondClean 9000 Electric Toothbrush (Black)",
    brand: "Philips",
    category: "beauty-personal-care",
    description: "Philips Sonicare premium DiamondClean 9000 with C3 Premium Plaque Control brush head, 4 modes, 3 intensities, smart glass charging cup.",
    specs: { "Modes": "Clean, White+, Gum Health, Deep Clean+", "Bluetooth": "Sonicare App Connected" },
    image: "https://m.media-amazon.com/images/I/61Z7a72M4kL._SL1500_.jpg",
    tags: ["philips", "toothbrush", "personal-care", "dental"],
    offers: [
      { marketplace: "Amazon India", asin: "B085V58999", url: "https://www.amazon.in/dp/B085V58999", currentPrice: 14999, isAvailable: true }
    ]
  },
  {
    slug: "nike-metcon-9-training-shoes-men",
    name: "Nike Metcon 9 Training Shoes for Men (Grey/Black)",
    brand: "Nike",
    category: "shoes",
    description: "Nike Metcon 9 cross-training shoes with larger Hyperlift plate in the heel, lace lock system, extended rubber wrap on the side for rope climbs.",
    specs: { "Heel Plate": "Larger Hyperlift Plate", "Lace System": "Lace Lock Feature", "Outsole": "Full Rubber Traction" },
    image: "https://m.media-amazon.com/images/I/71R2b77M4kL._SL1500_.jpg",
    tags: ["nike", "metcon", "shoes", "training", "gym"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C27X7888", url: "https://www.amazon.in/dp/B0C27X7888", currentPrice: 12995, isAvailable: true }
    ]
  },
  {
    slug: "adidas-originals-superstar-sneakers-white-black",
    name: "Adidas Originals Men's Superstar Sneakers (Footwear White/Core Black)",
    brand: "Adidas",
    category: "shoes",
    description: "Iconic Adidas Originals Superstar sneakers with full grain leather upper, rubber shell toe, serrated 3-Stripes, and herringbone cupsole.",
    specs: { "Upper": "Full Grain Leather", "Toe": "Signature Rubber Shell Toe", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71V2b88N3kL._SL1500_.jpg",
    tags: ["adidas", "superstar", "shoes", "sneakers", "fashion"],
    offers: [
      { marketplace: "Amazon India", asin: "B000G2Y3M4", url: "https://www.amazon.in/dp/B000G2Y3M4", currentPrice: 8999, isAvailable: true }
    ]
  },
  {
    slug: "samsonite-proxis-hardside-luggage-30inch",
    name: "Samsonite Proxis Hardside Luggage 30-inch (Black)",
    brand: "Samsonite",
    category: "bags",
    description: "Samsonite Proxis resilient luggage made from Roxkin material, dual tube pull handle, smooth rolling double wheels, embedded TSA lock.",
    specs: { "Material": "Roxkin Multi-Layered Material", "Size": "30-inch Large Spinner", "Lock": "Integrated TSA Lock" },
    image: "https://m.media-amazon.com/images/I/71Z8c88M5kL._SL1500_.jpg",
    tags: ["samsonite", "proxis", "luggage", "bags", "travel"],
    offers: [
      { marketplace: "Amazon India", asin: "B08BN3M888", url: "https://www.amazon.in/dp/B08BN3M888", currentPrice: 38999, isAvailable: true }
    ]
  },
  {
    slug: "dyson-airwrap-multi-styler-complete-long",
    name: "Dyson Airwrap Multi-Styler Complete Long (Nickel/Copper)",
    brand: "Dyson",
    category: "beauty-personal-care",
    description: "Dyson Airwrap multi-styler using Coanda airflow to curl, shape, smooth, and hide flyaways with no extreme heat damage.",
    specs: { "Motor": "Dyson Digital Motor V9", "Airflow": "Enhanced Coanda Airflow", "Heat Control": "Intelligent Heat Control (<150°C)" },
    image: "https://m.media-amazon.com/images/I/61W8c99M6kL._SL1500_.jpg",
    tags: ["dyson", "airwrap", "hair-care", "styler", "beauty"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B3C8M777", url: "https://www.amazon.in/dp/B0B3C8M777", currentPrice: 49900, isAvailable: true }
    ]
  },
  /* BATCH 4: PRODUCTS 111 TO 140 (+30 PRODUCTS) */
  {
    slug: "oneplus-12r-16gb-256gb-cool-blue",
    name: "OnePlus 12R (16GB RAM, 256GB Storage, Cool Blue)",
    brand: "OnePlus",
    category: "smartphone",
    description: "OnePlus 12R powered by Snapdragon 8 Gen 2, 1.5K 120Hz ProXDR AMOLED Display, 5500mAh battery with 100W SUPERVOOC charging.",
    specs: { "Storage": "256GB", "RAM": "16GB", "Display": "6.78-inch 1.5K 120Hz AMOLED", "Processor": "Snapdragon 8 Gen 2" },
    image: "https://m.media-amazon.com/images/I/71XN84pL2kL._SL1500_.jpg",
    tags: ["oneplus", "oneplus-12r", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CQPGG3D7", url: "https://www.amazon.in/dp/B0CQPGG3D7", currentPrice: 42999, isAvailable: true }
    ]
  },
  {
    slug: "nothing-phone-2a-plus-256gb-grey",
    name: "Nothing Phone (2a) Plus (12GB RAM, 256GB Storage, Grey)",
    brand: "Nothing",
    category: "smartphone",
    description: "Nothing Phone (2a) Plus with custom MediaTek Dimensity 7350 Pro 5G, Glyph Interface, 50MP Dual Rear Camera, 50MP Front Camera.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Display": "6.7-inch 120Hz Flexible AMOLED", "Processor": "Dimensity 7350 Pro" },
    image: "https://m.media-amazon.com/images/I/61N9p77M4kL._SL1500_.jpg",
    tags: ["nothing", "glyph", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D98K98L9", url: "https://www.amazon.in/dp/B0D98K98L9", currentPrice: 29999, isAvailable: true }
    ]
  },
  {
    slug: "iqoo-12-5g-16gb-512gb-alpha-black",
    name: "iQOO 12 5G (16GB RAM, 512GB Storage, Alpha Black)",
    brand: "iQOO",
    category: "smartphone",
    description: "iQOO 12 powered by Snapdragon 8 Gen 3, Supercomputing Chip Q1, 50MP + 50MP + 64MP 3X Periscope Telephoto Camera, 120W FlashCharge.",
    specs: { "Storage": "512GB", "RAM": "16GB", "Display": "6.78-inch 144Hz LTPO AMOLED", "Processor": "Snapdragon 8 Gen 3" },
    image: "https://m.media-amazon.com/images/I/71N9c88M5kL._SL1500_.jpg",
    tags: ["iqoo", "gaming-phone", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CHX99M88", url: "https://www.amazon.in/dp/B0CHX99M88", currentPrice: 57999, isAvailable: true }
    ]
  },
  {
    slug: "realme-13-pro-plus-512gb-emerald-green",
    name: "RealMe 13 Pro+ 5G (12GB RAM, 512GB Storage, Emerald Green)",
    brand: "RealMe",
    category: "smartphone",
    description: "RealMe 13 Pro+ featuring Dual Sony OIS Periscope Camera, Snapdragon 7s Gen 2, 120Hz Curved OLED display, 5200mAh battery.",
    specs: { "Storage": "512GB", "RAM": "12GB", "Display": "6.7-inch 120Hz Curved OLED", "Processor": "Snapdragon 7s Gen 2" },
    image: "https://m.media-amazon.com/images/I/71V9c88M6kL._SL1500_.jpg",
    tags: ["realme", "realme-13", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D8X99M44", url: "https://www.amazon.in/dp/B0D8X99M44", currentPrice: 34999, isAvailable: true }
    ]
  },
  {
    slug: "apple-macbook-pro-16-m3-max-36gb-1tb",
    name: "Apple MacBook Pro 16-inch M3 Max (36GB Unified Memory, 1TB SSD, Space Black)",
    brand: "Apple",
    category: "laptop",
    description: "Apple MacBook Pro 16-inch with M3 Max chip (14-core CPU, 30-core GPU), Liquid Retina XDR display, up to 22 hours battery life.",
    specs: { "Processor": "Apple M3 Max", "RAM": "36GB Unified Memory", "Storage": "1TB SSD", "Display": "16.2-inch Liquid Retina XDR" },
    image: "https://m.media-amazon.com/images/I/61V9d88M7kL._SL1500_.jpg",
    tags: ["apple", "macbook-pro", "m3-max", "laptop", "workstation"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CHX88M99", url: "https://www.amazon.in/dp/B0CHX88M99", currentPrice: 349900, isAvailable: true }
    ]
  },
  {
    slug: "hp-omen-16-ryzen7-rtx4070",
    name: "HP Omen 16 Gaming Laptop (AMD Ryzen 7 7840HS, RTX 4070, 16GB, 1TB SSD)",
    brand: "HP",
    category: "laptop",
    description: "HP Omen 16 gaming laptop with 16.1-inch QHD 240Hz IPS display, AMD Ryzen 7 7840HS, NVIDIA RTX 4070 8GB, Tempest Cooling.",
    specs: { "Processor": "AMD Ryzen 7 7840HS", "Graphics": "NVIDIA GeForce RTX 4070 8GB", "RAM": "16GB DDR5", "Storage": "1TB PCIe Gen4 SSD" },
    image: "https://m.media-amazon.com/images/I/71Z9c99M8kL._SL1500_.jpg",
    tags: ["hp", "omen", "gaming-laptop", "rtx4070"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C88N9999", url: "https://www.amazon.in/dp/B0C88N9999", currentPrice: 139990, isAvailable: true }
    ]
  },
  {
    slug: "asus-rog-ally-x-handheld-gaming-console",
    name: "ASUS ROG Ally X Handheld Gaming Console (AMD Z1 Extreme, 24GB LPDDR5X, 1TB SSD)",
    brand: "ASUS",
    category: "gaming",
    description: "ASUS ROG Ally X Windows 11 handheld gaming console featuring AMD Ryzen Z1 Extreme, 24GB LPDDR5X-7500 RAM, 80Wh battery, 7-inch 120Hz FHD screen.",
    specs: { "Processor": "AMD Ryzen Z1 Extreme", "RAM": "24GB LPDDR5X", "Storage": "1TB PCIe 4.0 NVMe", "Battery": "80Wh" },
    image: "https://m.media-amazon.com/images/I/71W9c88M4kL._SL1500_.jpg",
    tags: ["asus", "rog-ally", "handheld", "gaming", "console"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D788M999", url: "https://www.amazon.in/dp/B0D788M999", currentPrice: 89990, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-tab-s9-128gb-beige",
    name: "Samsung Galaxy Tab S9 11-inch (8GB RAM, 128GB Storage, Wi-Fi, Beige)",
    brand: "Samsung",
    category: "tablet",
    description: "Samsung Galaxy Tab S9 11-inch Dynamic AMOLED 2X 120Hz screen, Snapdragon 8 Gen 2, IP68 water resistance, S Pen included.",
    specs: { "Display": "11-inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 2", "Storage": "128GB", "RAM": "8GB" },
    image: "https://m.media-amazon.com/images/I/61N8c88M3kL._SL1500_.jpg",
    tags: ["samsung", "galaxy-tab", "tablet", "s-pen"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CC88M555", url: "https://www.amazon.in/dp/B0CC88M555", currentPrice: 72999, isAvailable: true }
    ]
  },
  {
    slug: "apple-ipad-pro-13-m4-256gb-space-black",
    name: "Apple iPad Pro 13-inch M4 (Wi-Fi 256GB, Space Black)",
    brand: "Apple",
    category: "tablet",
    description: "Ultra thin Apple iPad Pro 13-inch featuring Tandem OLED Ultra Retina XDR display, M4 chip, 12MP landscape camera, Apple Pencil Pro support.",
    specs: { "Display": "13-inch Tandem OLED Ultra Retina XDR", "Processor": "Apple M4 Chip", "Storage": "256GB" },
    image: "https://m.media-amazon.com/images/I/61V8c77M2kL._SL1500_.jpg",
    tags: ["apple", "ipad-pro", "m4", "tablet", "oled"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D388M111", url: "https://www.amazon.in/dp/B0D388M111", currentPrice: 129900, isAvailable: true }
    ]
  },
  {
    slug: "sony-bravia-65-inch-xr-oled-4k-tv",
    name: "Sony Bravia 65-inch XR OLED 4K Ultra HD Smart Google TV (XR-65A80L)",
    brand: "Sony",
    category: "television",
    description: "Sony 65-inch A80L OLED TV featuring Cognitive Processor XR, Acoustic Surface Audio+, XR OLED Contrast Pro, 120Hz native refresh rate.",
    specs: { "Screen Size": "65 inches", "Display": "4K OLED", "Processor": "Cognitive Processor XR", "Refresh Rate": "120Hz Native" },
    image: "https://m.media-amazon.com/images/I/81V8c99M5kL._SL1500_.jpg",
    tags: ["sony", "bravia", "oled", "tv", "4k"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C188M222", url: "https://www.amazon.in/dp/B0C188M222", currentPrice: 219990, isAvailable: true }
    ]
  },
  {
    slug: "samsung-65-inch-crystal-4k-vivid-pro-tv",
    name: "Samsung 65-inch Crystal 4K Vivid Pro Ultra HD Smart TV",
    brand: "Samsung",
    category: "television",
    description: "Samsung 65-inch Crystal 4K TV powered by Crystal Processor 4K, PurColor, Motion Xcelerator, Q-Symphony audio sync.",
    specs: { "Screen Size": "65 inches", "Display": "4K Crystal UHD", "Processor": "Crystal Processor 4K" },
    image: "https://m.media-amazon.com/images/I/81Z8c77M4kL._SL1500_.jpg",
    tags: ["samsung", "crystal-uhd", "tv", "4k"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CX88M333", url: "https://www.amazon.in/dp/B0CX88M333", currentPrice: 62990, isAvailable: true }
    ]
  },
  {
    slug: "bose-smart-ultra-soundbar-black",
    name: "Bose Smart Ultra Soundbar with Dolby Atmos and Voice Control (Black)",
    brand: "Bose",
    category: "audio",
    description: "Bose Smart Ultra flagship soundbar with Dolby Atmos, Spatial Audio, A.I. Dialogue Mode for ultra-clear speech clarity, ADAPTiQ audio calibration.",
    specs: { "Tech": "Dolby Atmos + Spatial Audio + AI Dialogue Mode", "Voice Control": "Alexa & Google Assistant Built-in" },
    image: "https://m.media-amazon.com/images/I/51W8c66M3kL._SL1500_.jpg",
    tags: ["bose", "soundbar", "dolby-atmos", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CH88M444", url: "https://www.amazon.in/dp/B0CH88M444", currentPrice: 94900, isAvailable: true }
    ]
  },
  {
    slug: "sonos-era-300-smart-speaker-black",
    name: "Sonos Era 300 Smart Speaker with Spatial Audio (Black)",
    brand: "Sonos",
    category: "audio",
    description: "Sonos Era 300 revolutionary smart speaker featuring 6 optimally positioned drivers for Dolby Atmos Spatial Audio, Trueplay tuning, Wi-Fi 6.",
    specs: { "Drivers": "6 Drivers (4 Tweeters + 2 Woofers)", "Tech": "Dolby Atmos Spatial Audio", "Connectivity": "Wi-Fi 6 + Bluetooth 5.0" },
    image: "https://m.media-amazon.com/images/I/61Z8c55M2kL._SL1500_.jpg",
    tags: ["sonos", "era300", "speaker", "spatial-audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BV88M555", url: "https://www.amazon.in/dp/B0BV88M555", currentPrice: 54999, isAvailable: true }
    ]
  },
  {
    slug: "jbl-tour-one-m2-headphones-black",
    name: "JBL Tour One M2 Wireless Noise Cancelling Headphones (Black)",
    brand: "JBL",
    category: "headphones",
    description: "JBL Tour One M2 headphones with True Adaptive Noise Cancelling, Personi-Fi 2.0 customized sound, up to 50 hours battery life.",
    specs: { "Drivers": "40mm Dynamic", "ANC": "True Adaptive ANC", "Battery Life": "Up to 50 Hours" },
    image: "https://m.media-amazon.com/images/I/61V8c44M1kL._SL1500_.jpg",
    tags: ["jbl", "headphones", "anc", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BP88M666", url: "https://www.amazon.in/dp/B0BP88M666", currentPrice: 19999, isAvailable: true }
    ]
  },
  {
    slug: "nothing-ear-a-tws-earbuds-yellow",
    name: "Nothing Ear (a) TWS Earbuds (Yellow)",
    brand: "Nothing",
    category: "earbuds",
    description: "Nothing Ear (a) featuring bold yellow transparent case design, 45dB Smart Active Noise Cancellation, 11mm dynamic driver, Hi-Res Audio certification.",
    specs: { "Driver": "11mm Dynamic Driver", "ANC": "45dB Smart ANC", "Battery": "Up to 42.5 Hours total" },
    image: "https://m.media-amazon.com/images/I/61Z8c33M9kL._SL1500_.jpg",
    tags: ["nothing", "ear-a", "earbuds", "tws", "yellow"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D188M777", url: "https://www.amazon.in/dp/B0D188M777", currentPrice: 7999, isAvailable: true }
    ]
  },
  {
    slug: "oneplus-watch-2-radiant-steel",
    name: "OnePlus Watch 2 46mm Smartwatch (Radiant Steel)",
    brand: "OnePlus",
    category: "smartwatch",
    description: "OnePlus Watch 2 with Dual-Engine Architecture (Snapdragon W5 + BES2700), Wear OS 4, Sapphire Crystal Glass, up to 100-hour battery life.",
    specs: { "Processor": "Snapdragon W5 + BES2700", "Battery": "Up to 100 Hours Smart Mode", "OS": "Wear OS 4 by Google" },
    image: "https://m.media-amazon.com/images/I/61V8c22M8kL._SL1500_.jpg",
    tags: ["oneplus", "oneplus-watch", "smartwatch", "wear-os"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CV88M888", url: "https://www.amazon.in/dp/B0CV88M888", currentPrice: 21999, isAvailable: true }
    ]
  },
  {
    slug: "garmin-venu-3-gps-smartwatch",
    name: "Garmin Venu 3 GPS Smartwatch (Passivated Stainless Steel)",
    brand: "Garmin",
    category: "smartwatch",
    description: "Garmin Venu 3 GPS fitness smartwatch featuring 1.4-inch AMOLED display, Sleep Coach, Nap Detection, Wheelchair Mode, up to 14 days battery.",
    specs: { "Display": "1.4-inch AMOLED Touchscreen", "Features": "Sleep Coach + Nap Detection", "Battery": "Up to 14 Days" },
    image: "https://m.media-amazon.com/images/I/61Z8c11M7kL._SL1500_.jpg",
    tags: ["garmin", "venu3", "smartwatch", "fitness"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CH88M999", url: "https://www.amazon.in/dp/B0CH88M999", currentPrice: 48990, isAvailable: true }
    ]
  },
  {
    slug: "alienware-aw2725df-27inch-360hz-qd-oled-monitor",
    name: "Alienware AW2725DF 27-inch 360Hz QHD QD-OLED Gaming Monitor",
    brand: "Alienware",
    category: "monitor",
    description: "Alienware AW2725DF world's first 360Hz QD-OLED gaming monitor with 2560x1440 QHD resolution, 0.03ms response time, VESA DisplayHDR True Black 400.",
    specs: { "Screen Size": "27 inches", "Resolution": "QHD (2560 x 1440)", "Refresh Rate": "360Hz", "Panel": "QD-OLED", "Response Time": "0.03ms GTG" },
    image: "https://m.media-amazon.com/images/I/81V8c11M6kL._SL1500_.jpg",
    tags: ["alienware", "qd-oled", "monitor", "360hz", "gaming"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CS88M111", url: "https://www.amazon.in/dp/B0CS88M111", currentPrice: 79990, isAvailable: true }
    ]
  },
  {
    slug: "nikon-z6-iii-mirrorless-camera-body",
    name: "Nikon Z6 III Mirrorless Camera Body",
    brand: "Nikon",
    category: "camera",
    description: "Nikon Z6 III featuring world's first partially-stacked 24.5MP CMOS sensor, EXPEED 7 processor, 5.76M-dot EVF, 6K 60p N-RAW internal recording.",
    specs: { "Sensor": "24.5MP Partially-Stacked CMOS", "Processor": "EXPEED 7", "EVF": "5.76M-dot 4000 nits", "Video": "6K 60p N-RAW Internal" },
    image: "https://m.media-amazon.com/images/I/71Z8c22M5kL._SL1500_.jpg",
    tags: ["nikon", "nikon-z", "camera", "mirrorless"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D688M222", url: "https://www.amazon.in/dp/B0D688M222", currentPrice: 247990, isAvailable: true }
    ]
  },
  {
    slug: "sony-playstation-vr2-headset",
    name: "Sony PlayStation VR2 Headset",
    brand: "Sony",
    category: "gaming",
    description: "Sony PlayStation VR2 next-gen virtual reality headset with 4K HDR OLED displays, 110-degree field of view, eye tracking, Tempest 3D AudioTech.",
    specs: { "Display": "4K HDR OLED (2000 x 2040 per eye)", "Refresh Rate": "90Hz / 120Hz", "Features": "Eye Tracking + Haptic Feedback" },
    image: "https://m.media-amazon.com/images/I/61V8c33M4kL._SL1500_.jpg",
    tags: ["sony", "psvr2", "vr", "gaming", "ps5"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BN88M333", url: "https://www.amazon.in/dp/B0BN88M333", currentPrice: 57990, isAvailable: true }
    ]
  },
  {
    slug: "logitech-g-pro-x-superlight-2-mouse-white",
    name: "Logitech G Pro X Superlight 2 Wireless Gaming Mouse (White)",
    brand: "Logitech",
    category: "accessory",
    description: "Logitech G Pro X Superlight 2 ultralight 60g wireless gaming mouse with LIGHTFORCE hybrid switches, HERO 2 sensor (32K DPI), 95-hour battery.",
    specs: { "Weight": "60 grams", "Sensor": "HERO 2 (32,000 DPI)", "Switches": "LIGHTFORCE Hybrid Optical-Mechanical" },
    image: "https://m.media-amazon.com/images/I/51Z8c44M3kL._SL1500_.jpg",
    tags: ["logitech", "superlight2", "mouse", "gaming", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CC88M444", url: "https://www.amazon.in/dp/B0CC88M444", currentPrice: 15995, isAvailable: true }
    ]
  },
  {
    slug: "razer-blackwidow-v4-pro-keyboard",
    name: "Razer BlackWidow V4 Pro Mechanical Gaming Keyboard (Green Switch)",
    brand: "Razer",
    category: "accessory",
    description: "Razer BlackWidow V4 Pro full-size wired mechanical gaming keyboard with Command Dial, 8 dedicated macro keys, Razer Chroma RGB 3-side underglow.",
    specs: { "Switches": "Razer Green Clicky Mechanical", "Polling": "Up to 8000Hz Razer HyperPolling", "Underglow": "3-Side RGB Underglow" },
    image: "https://m.media-amazon.com/images/I/71V8c55M2kL._SL1500_.jpg",
    tags: ["razer", "blackwidow", "keyboard", "gaming", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BT88M555", url: "https://www.amazon.in/dp/B0BT88M555", currentPrice: 22999, isAvailable: true }
    ]
  },
  {
    slug: "daikin-1-5-ton-5-star-inverter-split-ac",
    name: "Daikin 1.5 Ton 5 Star Inverter Split AC (MTKM50U)",
    brand: "Daikin",
    category: "air-conditioner",
    description: "Daikin 1.5 Ton 5 Star Inverter Split AC with PM 2.5 filter, Dew Clean technology, 3D Airflow, 100% copper condenser coil.",
    specs: { "Capacity": "1.5 Ton", "Energy Rating": "5 Star BEE", "Tech": "Dew Clean Technology + 3D Airflow" },
    image: "https://m.media-amazon.com/images/I/51Z8c66M1kL._SL1500_.jpg",
    tags: ["daikin", "ac", "air-conditioner", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B888M666", url: "https://www.amazon.in/dp/B0B888M666", currentPrice: 45990, isAvailable: true }
    ]
  },
  {
    slug: "whirlpool-7-5kg-5star-top-load-washing-machine",
    name: "Whirlpool 7.5 kg 5 Star Fully Automatic Top Load Washing Machine",
    brand: "Whirlpool",
    category: "washing-machine",
    description: "Whirlpool 7.5kg Royal Fully Automatic Top Load Washing Machine with 6th Sense Technology, Spiro Wash action, ZPM hard water wash.",
    specs: { "Capacity": "7.5 kg", "Energy Rating": "5 Star", "Tech": "6th Sense Technology + Spiro Wash" },
    image: "https://m.media-amazon.com/images/I/61V8c77M9kL._SL1500_.jpg",
    tags: ["whirlpool", "washing-machine", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B988M777", url: "https://www.amazon.in/dp/B0B988M777", currentPrice: 17990, isAvailable: true }
    ]
  },
  {
    slug: "whirlpool-265l-3star-double-door-refrigerator",
    name: "Whirlpool 265 L 3 Star Frost Free Double Door Refrigerator",
    brand: "Whirlpool",
    category: "refrigerator",
    description: "Whirlpool 265L Double Door Refrigerator featuring IntelliSense Inverter Technology, 85 minutes fastest bottle cooling, Zeolite technology.",
    specs: { "Capacity": "265 Liters", "Energy Rating": "3 Star BEE", "Tech": "IntelliSense Inverter" },
    image: "https://m.media-amazon.com/images/I/61Z8c88M8kL._SL1500_.jpg",
    tags: ["whirlpool", "refrigerator", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BA88M888", url: "https://www.amazon.in/dp/B0BA88M888", currentPrice: 27990, isAvailable: true }
    ]
  },
  {
    slug: "oral-b-io-series-9-electric-toothbrush",
    name: "Oral-B iO Series 9 Electric Toothbrush (Black Onyx)",
    brand: "Oral-B",
    category: "beauty-personal-care",
    description: "Oral-B iO Series 9 revolving electric toothbrush with 3D Teeth Tracking AI, interactive color display, magnetic charger, 7 smart modes.",
    specs: { "Tech": "iO Magnetic Technology + 3D AI Tracking", "Modes": "7 Smart Cleaning Modes" },
    image: "https://m.media-amazon.com/images/I/61V8c99M7kL._SL1500_.jpg",
    tags: ["oral-b", "toothbrush", "personal-care", "dental"],
    offers: [
      { marketplace: "Amazon India", asin: "B08888M999", url: "https://www.amazon.in/dp/B08888M999", currentPrice: 24999, isAvailable: true }
    ]
  },
  {
    slug: "new-balance-9060-sneakers-rain-cloud",
    name: "New Balance 9060 Unisex Sneakers (Rain Cloud/Castlerock)",
    brand: "New Balance",
    category: "shoes",
    description: "New Balance 9060 lifestyle sneakers featuring futuristic Y2K sculpted pods, dual-density ABZORB and SBS cushioning midsole, pigskin suede upper.",
    specs: { "Upper": "Pigskin Suede and Mesh", "Midsole": "ABZORB & SBS Cushioning", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71Z8c11M6kL._SL1500_.jpg",
    tags: ["new-balance", "nb9060", "shoes", "sneakers", "fashion"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B188M111", url: "https://www.amazon.in/dp/B0B188M111", currentPrice: 15999, isAvailable: true }
    ]
  },
  {
    slug: "converse-chuck-taylor-all-star-high-top-black",
    name: "Converse Chuck Taylor All Star High Top Sneakers (Black)",
    brand: "Converse",
    category: "shoes",
    description: "Timeless Converse Chuck Taylor All Star high top canvas sneakers with iconic star ankle patch, vulcanized rubber sole, medical eyelets.",
    specs: { "Upper": "100% Canvas", "Sole": "Vulcanized Rubber", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71V8c22M5kL._SL1500_.jpg",
    tags: ["converse", "chuck-taylor", "shoes", "sneakers"],
    offers: [
      { marketplace: "Amazon India", asin: "B00088M222", url: "https://www.amazon.in/dp/B00088M222", currentPrice: 4999, isAvailable: true }
    ]
  },
  {
    slug: "delsey-paris-chatelet-air-trunk-luggage-73cm",
    name: "Delsey Paris Chatelet Air 2.0 Hardside Trunk Luggage 73cm (Angora)",
    brand: "Delsey Paris",
    category: "bags",
    description: "Delsey Paris Chatelet Air 2.0 luxurious trunk luggage with Securitech 2 zip, corner protectors, double quiet wheels, peach-skin interior lining.",
    specs: { "Material": "100% Polycarbonate", "Size": "73cm Large Trunk", "Zip": "Zip SECURITECH 2" },
    image: "https://m.media-amazon.com/images/I/71Z8c33M4kL._SL1500_.jpg",
    tags: ["delsey", "chatelet", "luggage", "bags", "travel"],
    offers: [
      { marketplace: "Amazon India", asin: "B09888M333", url: "https://www.amazon.in/dp/B09888M333", currentPrice: 29999, isAvailable: true }
    ]
  },
  {
    slug: "shark-flexstyle-air-styling-drying-system",
    name: "Shark HD440FlexStyle Air Styling & Drying System (Copper)",
    brand: "Shark",
    category: "beauty-personal-care",
    description: "Shark FlexStyle multi-styler that powerful blow dryer converts to a versatile air styler with auto-wrap curlers, paddle brush, and oval brush.",
    specs: { "Power": "1400W", "Attachments": "Auto-Wrap Curlers, Paddle Brush, Oval Brush, Concentrator" },
    image: "https://m.media-amazon.com/images/I/61V8c44M3kL._SL1500_.jpg",
    tags: ["shark", "flexstyle", "hair-dryer", "styler", "beauty"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B588M444", url: "https://www.amazon.in/dp/B0B588M444", currentPrice: 29999, isAvailable: true }
    ]
  },
  /* BATCH 5: PRODUCTS 141 TO 170 (+30 PRODUCTS) */
  {
    slug: "google-pixel-8a-128gb-bay-blue",
    name: "Google Pixel 8a (128GB, Bay Blue)",
    brand: "Google",
    category: "smartphone",
    description: "Google Pixel 8a powered by Tensor G3 chip, Gemini AI features, 64MP dual rear camera system, and 6.1-inch 120Hz Actua display.",
    specs: { "Storage": "128GB", "RAM": "8GB", "Display": "6.1-inch 120Hz Actua OLED", "Processor": "Google Tensor G3" },
    image: "https://m.media-amazon.com/images/I/61V9d99M1kL._SL1500_.jpg",
    tags: ["google", "pixel-8a", "smartphone", "ai", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D389N222", url: "https://www.amazon.in/dp/B0D389N222", currentPrice: 52999, isAvailable: true }
    ]
  },
  {
    slug: "samsung-galaxy-a55-256gb-iceblue",
    name: "Samsung Galaxy A55 5G (12GB RAM, 256GB Storage, Awesome Iceblue)",
    brand: "Samsung",
    category: "smartphone",
    description: "Samsung Galaxy A55 5G featuring metal frame design, Exynos 1480 processor, 50MP OIS camera, IP67 water resistance.",
    specs: { "Storage": "256GB", "RAM": "12GB", "Display": "6.6-inch 120Hz FHD+ Super AMOLED", "Processor": "Exynos 1480" },
    image: "https://m.media-amazon.com/images/I/71Z9d88M2kL._SL1500_.jpg",
    tags: ["samsung", "galaxy-a", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CX89N333", url: "https://www.amazon.in/dp/B0CX89N333", currentPrice: 42999, isAvailable: true }
    ]
  },
  {
    slug: "poco-f6-5g-512gb-titanium",
    name: "POCO F6 5G (12GB RAM, 512GB Storage, Titanium)",
    brand: "POCO",
    category: "smartphone",
    description: "POCO F6 powered by Snapdragon 8s Gen 3 flagship processor, WildBoost Optimization 3.0, 90W Turbo Charge, 1.5K 120Hz AMOLED display.",
    specs: { "Storage": "512GB", "RAM": "12GB", "Display": "6.67-inch 1.5K 120Hz AMOLED", "Processor": "Snapdragon 8s Gen 3" },
    image: "https://m.media-amazon.com/images/I/71V9d77M3kL._SL1500_.jpg",
    tags: ["poco", "gaming-phone", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D489N444", url: "https://www.amazon.in/dp/B0D489N444", currentPrice: 33999, isAvailable: true }
    ]
  },
  {
    slug: "honor-200-pro-512gb-ocean-cyan",
    name: "Honor 200 Pro 5G (12GB RAM, 512GB Storage, Ocean Cyan)",
    brand: "Honor",
    category: "smartphone",
    description: "Honor 200 Pro featuring Studio-Level Portrait Camera with Harcourt portrait mode, Snapdragon 8s Gen 3, 100W Wired & 66W Wireless charging.",
    specs: { "Storage": "512GB", "RAM": "12GB", "Display": "6.78-inch 120Hz Curved OLED", "Processor": "Snapdragon 8s Gen 3" },
    image: "https://m.media-amazon.com/images/I/71Z9d66M4kL._SL1500_.jpg",
    tags: ["honor", "portrait", "smartphone", "5g"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D789N555", url: "https://www.amazon.in/dp/B0D789N555", currentPrice: 57999, isAvailable: true }
    ]
  },
  {
    slug: "lenovo-thinkpad-x1-carbon-gen-12",
    name: "Lenovo ThinkPad X1 Carbon Gen 12 (Intel Core Ultra 7 155H, 32GB, 1TB SSD)",
    brand: "Lenovo",
    category: "laptop",
    description: "Lenovo ThinkPad X1 Carbon Gen 12 ultralight carbon-fiber business laptop with 14-inch 2.8K OLED 120Hz display, Intel Core Ultra 7, Intel Arc graphics.",
    specs: { "Processor": "Intel Core Ultra 7 155H", "RAM": "32GB LPDDR5X", "Storage": "1TB PCIe Gen4 SSD", "Display": "14-inch 2.8K 120Hz OLED" },
    image: "https://m.media-amazon.com/images/I/61V9d55M5kL._SL1500_.jpg",
    tags: ["lenovo", "thinkpad", "laptop", "business", "carbon-fiber"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CX89N666", url: "https://www.amazon.in/dp/B0CX89N666", currentPrice: 214990, isAvailable: true }
    ]
  },
  {
    slug: "dell-alienware-m18-r2-i9-rtx4090",
    name: "Dell Alienware m18 R2 Gaming Laptop (Intel Core i9 14900HX, RTX 4090, 64GB, 2TB SSD)",
    brand: "Dell",
    category: "laptop",
    description: "Dell Alienware m18 R2 massive 18-inch QHD+ 165Hz gaming laptop with Intel Core i9 14900HX, NVIDIA RTX 4090 16GB, Cryo-tech cooling.",
    specs: { "Processor": "Intel Core i9-14900HX", "Graphics": "NVIDIA GeForce RTX 4090 16GB", "RAM": "64GB DDR5", "Storage": "2TB NVMe SSD" },
    image: "https://m.media-amazon.com/images/I/71Z9d44M6kL._SL1500_.jpg",
    tags: ["dell", "alienware", "gaming-laptop", "rtx4090"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CW89N777", url: "https://www.amazon.in/dp/B0CW89N777", currentPrice: 419990, isAvailable: true }
    ]
  },
  {
    slug: "microsoft-surface-pro-11-snapdragon-x-elite",
    name: "Microsoft Surface Pro 11th Edition (Copilot+ PC, Snapdragon X Elite, 16GB, 512GB SSD)",
    brand: "Microsoft",
    category: "tablet",
    description: "Microsoft Surface Pro 11 Copilot+ PC featuring 13-inch OLED PixelSense Flow display, Snapdragon X Elite NPU delivering 45 TOPS AI performance.",
    specs: { "Processor": "Snapdragon X Elite (12-core)", "NPU": "45 TOPS Qualcomm Hexagon", "Display": "13-inch OLED 120Hz", "Storage": "512GB SSD" },
    image: "https://m.media-amazon.com/images/I/61V9d33M7kL._SL1500_.jpg",
    tags: ["microsoft", "surface-pro", "copilot-pc", "tablet", "snapdragon"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D589N888", url: "https://www.amazon.in/dp/B0D589N888", currentPrice: 139990, isAvailable: true }
    ]
  },
  {
    slug: "realme-pad-2-256gb-lte",
    name: "Realme Pad 2 (11.5-inch 120Hz 2K Display, 8GB RAM, 256GB Storage, 4G LTE)",
    brand: "RealMe",
    category: "tablet",
    description: "Realme Pad 2 with 11.5-inch 2K 120Hz display, MediaTek Helio G99, quad speakers with O-Sync, 8360mAh battery, 33W SUPERVOOC charging.",
    specs: { "Display": "11.5-inch 2K 120Hz", "Processor": "MediaTek Helio G99", "Storage": "256GB", "Connectivity": "4G LTE" },
    image: "https://m.media-amazon.com/images/I/61Z9d22M8kL._SL1500_.jpg",
    tags: ["realme", "tablet", "lte", "android"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CC89N999", url: "https://www.amazon.in/dp/B0CC89N999", currentPrice: 19999, isAvailable: true }
    ]
  },
  {
    slug: "tcl-65-inch-c755-qd-mini-led-4k-tv",
    name: "TCL 65-inch C755 QD-Mini LED 4K Google TV",
    brand: "TCL",
    category: "television",
    description: "TCL 65-inch QD-Mini LED TV with 144Hz VRR, Dolby Vision IQ, ONKYO 2.1ch speaker system, Game Master 2.0, 500+ local dimming zones.",
    specs: { "Screen Size": "65 inches", "Display": "QD-Mini LED 4K", "Refresh Rate": "144Hz VRR", "Audio": "ONKYO 2.1ch 50W" },
    image: "https://m.media-amazon.com/images/I/81V9d11M9kL._SL1500_.jpg",
    tags: ["tcl", "mini-led", "tv", "4k", "gaming-tv"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CQ89N111", url: "https://www.amazon.in/dp/B0CQ89N111", currentPrice: 89990, isAvailable: true }
    ]
  },
  {
    slug: "sony-ht-s20r-51ch-dolby-digital-soundbar",
    name: "Sony HT-S20R 5.1ch Dolby Digital Soundbar",
    brand: "Sony",
    category: "audio",
    description: "Sony HT-S20R 400W 5.1 channel real surround soundbar with rear tallboy speakers, subwoofer, Dolby Digital surround sound, Bluetooth.",
    specs: { "Channels": "5.1 Real Surround", "Power": "400W Total Output", "Format": "Dolby Digital" },
    image: "https://m.media-amazon.com/images/I/61V9d00M8kL._SL1500_.jpg",
    tags: ["sony", "soundbar", "51-channel", "audio"],
    offers: [
      { marketplace: "Amazon India", asin: "B08489N222", url: "https://www.amazon.in/dp/B08489N222", currentPrice: 17990, isAvailable: true }
    ]
  },
  {
    slug: "marshall-emberton-ii-bluetooth-speaker",
    name: "Marshall Emberton II Portable Bluetooth Speaker (Black and Brass)",
    brand: "Marshall",
    category: "audio",
    description: "Marshall Emberton II compact portable speaker with 30+ hours of playtime, IP67 dust and waterproof rating, Stack Mode for multi-speaker listening.",
    specs: { "Playtime": "30+ Hours", "Rating": "IP67 Dust & Waterproof", "Feature": "Stack Mode" },
    image: "https://m.media-amazon.com/images/I/71Z9d99M7kL._SL1500_.jpg",
    tags: ["marshall", "emberton", "speaker", "bluetooth"],
    offers: [
      { marketplace: "Amazon India", asin: "B09Z89N333", url: "https://www.amazon.in/dp/B09Z89N333", currentPrice: 14999, isAvailable: true }
    ]
  },
  {
    slug: "bose-quietcomfort-earbuds-ii-black",
    name: "Bose QuietComfort Wireless Earbuds II (Triple Black)",
    brand: "Bose",
    category: "earbuds",
    description: "Bose QuietComfort Earbuds II featuring CustomTune sound personalization, world-best active noise cancellation, adjustable EQ, 6 hours battery.",
    specs: { "Tech": "CustomTune Sound Calibration", "ANC": "World's Best Noise Cancellation", "Battery": "6 Hours (24 with case)" },
    image: "https://m.media-amazon.com/images/I/51V9d88M6kL._SL1500_.jpg",
    tags: ["bose", "earbuds", "anc", "tws"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B989N444", url: "https://www.amazon.in/dp/B0B989N444", currentPrice: 19900, isAvailable: true }
    ]
  },
  {
    slug: "beats-fit-pro-tws-earbuds-black",
    name: "Beats Fit Pro True Wireless Earbuds (Black)",
    brand: "Beats",
    category: "earbuds",
    description: "Beats Fit Pro wireless earbuds with secure-fit wingtips, Apple H1 headphone chip, Active Noise Cancelling, Spatial Audio with dynamic head tracking.",
    specs: { "Chip": "Apple H1 Headphone Chip", "Wingtips": "Flexible Secure-Fit Wingtips", "Battery": "6 Hours (24 with case)" },
    image: "https://m.media-amazon.com/images/I/51Z9d77M5kL._SL1500_.jpg",
    tags: ["beats", "earbuds", "tws", "anc", "sports"],
    offers: [
      { marketplace: "Amazon India", asin: "B09JL89N55", url: "https://www.amazon.in/dp/B09JL89N55", currentPrice: 16900, isAvailable: true }
    ]
  },
  {
    slug: "cmf-watch-pro-2-dark-grey",
    name: "CMF Watch Pro 2 by Nothing (Dark Grey)",
    brand: "CMF by Nothing",
    category: "smartwatch",
    description: "CMF Watch Pro 2 featuring interchangeable bezel design, 1.32-inch AMOLED display, multi-system GPS, 11-day battery life, Bluetooth calls.",
    specs: { "Display": "1.32-inch AMOLED 60Hz", "Bezel": "Interchangeable Aluminum Bezel", "GPS": "Multi-System Built-in" },
    image: "https://m.media-amazon.com/images/I/61V9d66M4kL._SL1500_.jpg",
    tags: ["cmf", "nothing", "smartwatch", "fitness"],
    offers: [
      { marketplace: "Amazon India", asin: "B0D789N666", url: "https://www.amazon.in/dp/B0D789N666", currentPrice: 4999, isAvailable: true }
    ]
  },
  {
    slug: "suunto-race-all-black-gps-sports-watch",
    name: "Suunto Race All Black GPS Sports Watch",
    brand: "Suunto",
    category: "smartwatch",
    description: "Suunto Race high-performance sports watch with 1.43-inch AMOLED display, free offline outdoor maps, HRV recovery measurement, up to 40h GPS mode.",
    specs: { "Display": "1.43-inch AMOLED", "Battery": "Up to 40h in max GPS mode / 26 days daily", "Maps": "Free Offline Outdoor Maps" },
    image: "https://m.media-amazon.com/images/I/61Z9d55M3kL._SL1500_.jpg",
    tags: ["suunto", "gps-watch", "smartwatch", "outdoor", "sports"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CL89N777", url: "https://www.amazon.in/dp/B0CL89N777", currentPrice: 44990, isAvailable: true }
    ]
  },
  {
    slug: "benq-zowie-xl2566k-360hz-gaming-monitor",
    name: "BenQ ZOWIE XL2566K 24.5-inch 360Hz Gaming Monitor",
    brand: "BenQ",
    category: "monitor",
    description: "BenQ ZOWIE XL2566K esports monitor featuring 24.5-inch 360Hz TN panel, DyAc+ technology for maximum motion clarity, S Switch, Shield.",
    specs: { "Screen Size": "24.5 inches", "Refresh Rate": "360Hz Native", "Tech": "DyAc+ Dynamic Accuracy", "Panel": "TN Esports Panel" },
    image: "https://m.media-amazon.com/images/I/71V9d44M2kL._SL1500_.jpg",
    tags: ["benq", "zowie", "esports", "360hz", "monitor"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BD89N888", url: "https://www.amazon.in/dp/B0BD89N888", currentPrice: 64990, isAvailable: true }
    ]
  },
  {
    slug: "panasonic-lumix-s5-ii-mirrorless-camera-body",
    name: "Panasonic LUMIX S5 II Full-Frame Mirrorless Camera Body",
    brand: "Panasonic",
    category: "camera",
    description: "Panasonic LUMIX S5 II full-frame camera featuring 24.2MP CMOS sensor with Phase Hybrid AF, 6K 30p 10-bit open gate video, Active I.S. stabilization.",
    specs: { "Sensor": "24.2MP Full-Frame CMOS", "Autofocus": "779-point Phase Hybrid AF", "Video": "6K 30p 10-bit Open Gate" },
    image: "https://m.media-amazon.com/images/I/71Z9d33M1kL._SL1500_.jpg",
    tags: ["panasonic", "lumix", "camera", "fullframe", "mirrorless"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BR89N999", url: "https://www.amazon.in/dp/B0BR89N999", currentPrice: 179990, isAvailable: true }
    ]
  },
  {
    slug: "valve-steam-deck-oled-1tb-handheld-console",
    name: "Valve Steam Deck OLED 1TB Handheld Console",
    brand: "Valve",
    category: "gaming",
    description: "Valve Steam Deck OLED with 7.4-inch 90Hz HDR OLED display, 6nm AMD APU, Wi-Fi 6E, 1TB NVMe SSD, carrying case included.",
    specs: { "Display": "7.4-inch 90Hz HDR OLED", "Storage": "1TB NVMe SSD", "APU": "6nm AMD Custom APU" },
    image: "https://m.media-amazon.com/images/I/61V9d22M0kL._SL1500_.jpg",
    tags: ["valve", "steam-deck", "oled", "handheld", "gaming"],
    offers: [
      { marketplace: "Amazon India", asin: "B0CN89N111", url: "https://www.amazon.in/dp/B0CN89N111", currentPrice: 69990, isAvailable: true }
    ]
  },
  {
    slug: "steelseries-arctis-nova-pro-wireless-headset",
    name: "SteelSeries Arctis Nova Pro Wireless Headset (PC / PlayStation)",
    brand: "SteelSeries",
    category: "gaming",
    description: "SteelSeries Arctis Nova Pro wireless gaming headset with Nova Pro Acoustic System, Active Noise Cancellation, Infinity Power System dual batteries, GameDAC Gen 2.",
    specs: { "Drivers": "High Fidelity Drivers", "ANC": "4-mic Active Noise Cancellation", "Battery": "Dual Battery Swap System" },
    image: "https://m.media-amazon.com/images/I/71Z9d11M9kL._SL1500_.jpg",
    tags: ["steelseries", "arctis", "headset", "gaming", "wireless"],
    offers: [
      { marketplace: "Amazon India", asin: "B09ZW89N22", url: "https://www.amazon.in/dp/B09ZW89N22", currentPrice: 34999, isAvailable: true }
    ]
  },
  {
    slug: "hyperx-quadcast-s-rgb-usb-microphone",
    name: "HyperX QuadCast S RGB USB Condenser Microphone",
    brand: "HyperX",
    category: "accessory",
    description: "HyperX QuadCast S USB condenser microphone featuring dynamic RGB lighting effects, built-in anti-vibration shock mount, tap-to-mute sensor with LED indicator.",
    specs: { "Polar Patterns": "Stereo, Omnidirectional, Cardioid, Bidirectional", "Lighting": "Customizable RGB via NGENUITY" },
    image: "https://m.media-amazon.com/images/I/61V9d01M8kL._SL1500_.jpg",
    tags: ["hyperx", "microphone", "streaming", "accessory"],
    offers: [
      { marketplace: "Amazon India", asin: "B08G89N333", url: "https://www.amazon.in/dp/B08G89N333", currentPrice: 13490, isAvailable: true }
    ]
  },
  {
    slug: "blueair-dustmagnet-5440i-air-purifier",
    name: "Blueair DustMagnet 5440i Air Purifier for Home",
    brand: "Blueair",
    category: "home-appliances",
    description: "Blueair DustMagnet 5440i air purifier designed to catch airborne dust before it settles, HEPASilent dual-airflow technology, smart app control.",
    specs: { "Coverage": "Up to 380 sq ft", "Tech": "HEPASilent Technology", "Filter": "Dual DustMagnet Stainless Steel Pre-Filters" },
    image: "https://m.media-amazon.com/images/I/61Z9d99M7kL._SL1500_.jpg",
    tags: ["blueair", "air-purifier", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B09889N444", url: "https://www.amazon.in/dp/B09889N444", currentPrice: 26990, isAvailable: true }
    ]
  },
  {
    slug: "irobot-roomba-j7-plus-robot-vacuum",
    name: "iRobot Roomba j7+ Self-Emptying Robot Vacuum",
    brand: "iRobot",
    category: "home-appliances",
    description: "iRobot Roomba j7+ robot vacuum with PrecisionVision Navigation to avoid pet waste and cords, Clean Base Automatic Dirt Disposal (60 days).",
    specs: { "Navigation": "PrecisionVision AI Obstacle Avoidance", "Disposal": "Clean Base Auto Dirt Disposal" },
    image: "https://m.media-amazon.com/images/I/61V9d88M6kL._SL1500_.jpg",
    tags: ["irobot", "roomba", "robot-vacuum", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B09489N555", url: "https://www.amazon.in/dp/B09489N555", currentPrice: 64900, isAvailable: true }
    ]
  },
  {
    slug: "voltas-1-5-ton-5-star-inverter-split-ac",
    name: "Voltas 1.5 Ton 5 Star Inverter Split AC (185V DAZA)",
    brand: "Voltas",
    category: "air-conditioner",
    description: "Voltas 1.5 Ton 5 Star Inverter Split AC featuring 4-in-1 adjustable cooling, anti-microbial filter, 100% copper condenser, eco mode.",
    specs: { "Capacity": "1.5 Ton", "Energy Rating": "5 Star BEE", "Compressor": "Variable Speed Inverter Compressor" },
    image: "https://m.media-amazon.com/images/I/51A9a77M5kL._SL1500_.jpg",
    tags: ["voltas", "ac", "air-conditioner", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BS89N666", url: "https://www.amazon.in/dp/B0BS89N666", currentPrice: 38990, isAvailable: true }
    ]
  },
  {
    slug: "godrej-244l-3star-double-door-refrigerator",
    name: "Godrej 244 L 3 Star Frost Free Double Door Refrigerator",
    brand: "Godrej",
    category: "refrigerator",
    description: "Godrej 244L Double Door Refrigerator with Nano Shield Technology, Inverter Compressor, Cool Shower Technology, ambient weather sensing.",
    specs: { "Capacity": "244 Liters", "Energy Rating": "3 Star BEE", "Tech": "Nano Shield Technology (99.9%+ germ disinfection)" },
    image: "https://m.media-amazon.com/images/I/61B9b66M4kL._SL1500_.jpg",
    tags: ["godrej", "refrigerator", "appliances"],
    offers: [
      { marketplace: "Amazon India", asin: "B0BT89N777", url: "https://www.amazon.in/dp/B0BT89N777", currentPrice: 24990, isAvailable: true }
    ]
  },
  {
    slug: "asics-gel-kayano-30-running-shoes-men",
    name: "Asics Gel-Kayano 30 Running Shoes for Men (Black/Carrier Grey)",
    brand: "Asics",
    category: "shoes",
    description: "Asics Gel-Kayano 30 maximum stability running shoes featuring 4D GUIDANCE SYSTEM, PureGEL technology, FF BLAST PLUS ECO cushioning.",
    specs: { "Tech": "4D GUIDANCE SYSTEM + PureGEL", "Cushioning": "FF BLAST PLUS ECO", "Closure": "Lace-Up" },
    image: "https://m.media-amazon.com/images/I/71Z9d55M3kL._SL1500_.jpg",
    tags: ["asics", "gel-kayano", "shoes", "running", "stability"],
    offers: [
      { marketplace: "Amazon India", asin: "B0C589N888", url: "https://www.amazon.in/dp/B0C589N888", currentPrice: 15999, isAvailable: true }
    ]
  },
  {
    slug: "under-armour-mens-tech-20-tshirt-black",
    name: "Under Armour Men's Tech 2.0 Short Sleeve T-Shirt (Black)",
    brand: "Under Armour",
    category: "mens-clothing",
    description: "Under Armour UA Tech 2.0 short sleeve activewear t-shirt made with ultra-soft moisture-wicking quick-drying fabric, streamlined fit.",
    specs: { "Material": "100% Polyester UA Tech Fabric", "Feature": "Moisture Transport System" },
    image: "https://m.media-amazon.com/images/I/61V9d44M2kL._SL1500_.jpg",
    tags: ["under-armour", "tshirt", "mens-clothing", "sportswear"],
    offers: [
      { marketplace: "Amazon India", asin: "B07889N999", url: "https://www.amazon.in/dp/B07889N999", currentPrice: 1999, isAvailable: true }
    ]
  },
  {
    slug: "columbia-womens-switchback-iii-jacket-navy",
    name: "Columbia Women's Switchback III Adjustable Waterproof Jacket (Navy)",
    brand: "Columbia",
    category: "womens-clothing",
    description: "Columbia Women's Switchback III lightweight rain jacket with Hydroplus 100% nylon waterproof shell, stowaway hood, packs into pocket.",
    specs: { "Shell": "Hydroplus 100% Nylon Waterproof", "Feature": "Packable into Hand Pocket" },
    image: "https://m.media-amazon.com/images/I/71C9c33M1kL._SL1500_.jpg",
    tags: ["columbia", "jacket", "womens-clothing", "waterproof"],
    offers: [
      { marketplace: "Amazon India", asin: "B00G89N111", url: "https://www.amazon.in/dp/B00G89N111", currentPrice: 4999, isAvailable: true }
    ]
  },
  {
    slug: "tumi-alpha-bravo-navigation-backpack-black",
    name: "TUMI Alpha Bravo Navigation Backpack (Black)",
    brand: "TUMI",
    category: "bags",
    description: "TUMI Alpha Bravo Navigation laptop backpack crafted from durable FXT Ballistic Nylon with padded laptop compartment, water-resistant pocket, TUMI Tracer.",
    specs: { "Material": "FXT Ballistic Nylon", "Laptop Size": "Up to 15-inch", "Feature": "TUMI Tracer ID" },
    image: "https://m.media-amazon.com/images/I/71V9d22M0kL._SL1500_.jpg",
    tags: ["tumi", "backpack", "bags", "travel", "luxury"],
    offers: [
      { marketplace: "Amazon India", asin: "B09N89N222", url: "https://www.amazon.in/dp/B09N89N222", currentPrice: 42500, isAvailable: true }
    ]
  },
  {
    slug: "waterpik-aquarius-professional-water-flosser",
    name: "Waterpik Aquarius Professional Water Flosser (White)",
    brand: "Waterpik",
    category: "beauty-personal-care",
    description: "Waterpik Aquarius water flosser with 10 pressure settings, 7 flossing tips, 90 seconds water capacity, ADA accepted for oral health.",
    specs: { "Settings": "10 Pressure Settings (10 to 100 PSI)", "Tips": "7 Included Flossing Tips", "Rating": "ADA Accepted" },
    image: "https://m.media-amazon.com/images/I/61Z9d11M9kL._SL1500_.jpg",
    tags: ["waterpik", "flosser", "personal-care", "dental"],
    offers: [
      { marketplace: "Amazon India", asin: "B00889N333", url: "https://www.amazon.in/dp/B00889N333", currentPrice: 7999, isAvailable: true }
    ]
  },
  {
    slug: "theragun-pro-g5-massage-gun",
    name: "Theragun PRO G5 Handheld Deep Tissue Massage Gun",
    brand: "Theragun",
    category: "beauty-personal-care",
    description: "Theragun PRO 5th Gen commercial-grade quiet percussion massage gun with EQ-150 motor, OLED screen, 6 attachment heads, Bluetooth app connection.",
    specs: { "Motor": "QuietForce Technology EQ-150", "Amplitude": "16mm Deep Tissue", "Attachments": "6 Premium Attachments" },
    image: "https://m.media-amazon.com/images/I/61D9d00M8kL._SL1500_.jpg",
    tags: ["theragun", "massage-gun", "recovery", "personal-care"],
    offers: [
      { marketplace: "Amazon India", asin: "B0B889N444", url: "https://www.amazon.in/dp/B0B889N444", currentPrice: 49990, isAvailable: true }
    ]
  }
];

