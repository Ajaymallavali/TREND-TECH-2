# PHASE 4A.6 DUPLICATE CONFLICT + RECOVERY VALIDATION REPORT

**Database Modified**: NO (Zero Writes Executed)  
**Product Invariant Check**: **PASS** (8 Recovered + 5 Unresolved = 13 Total)

---

## 1. Executive Summary & Exact Counts

- **Products Attempted**: 13
- **Recovered Products**: 8
- **Unresolved Products**: 5

### Detailed Metrics
- **Identity Mismatches**: 0
- **Duplicate Conflicts**: 2
- **Same-Product Duplicates**: 0
- **Cross-Product Conflicts**: 2
- **Multi-Source Same-Product**: 0
- **False Positives**: 0
- **Verified Exact Recovered Images**: 8

---

## 2. Duplicate Conflict Analysis

During candidate recovery, SHA-256 byte fingerprinting caught 2 cross-product candidate collisions:

### Conflict 1: LG UltraGear 27 240Hz OLED vs Dell Inspiron 15 3520
- **Target Product**: LG UltraGear 27 240Hz OLED (`6aa06057af8879d815dcafb3`) | **Category**: Television / Monitor
- **Candidate Image**: `https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg`
- **Colliding Product**: Dell Inspiron 15 3520 (`6a9904e369652590e0aadc76`) | **Category**: Laptop
- **SHA-256**: `9be215fb59122b7ab8f4bdf2bc8adb97743b8a8cf7359a3816e4691a0ee7fe36`
- **Classification**: **CROSS_PRODUCT_CONFLICT**
- **Action**: **REJECTED**. Prevents assigning a laptop picture to a gaming monitor.

### Conflict 2: Canon EOS R6 Mark II Mirrorless vs Television Bravia
- **Target Product**: Canon EOS R6 Mark II Mirrorless (`6aa06058af8879d815dcb247`) | **Category**: Camera
- **Candidate Image**: `https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg`
- **Colliding Product**: Television Bravia (`6a9904e369652590e0aadcfc`) | **Category**: Television
- **SHA-256**: `043cb7d0e008199d8ceb2b21a40df2d75748e9be9371c25b3520f205facc6826`
- **Classification**: **CROSS_PRODUCT_CONFLICT**
- **Action**: **REJECTED**. Prevents assigning a TV picture to a mirrorless camera.

---

## 3. Verified Recovered Images (8)

### 1. Samsung Galaxy S24 Ultra (`6aa06056af8879d815dca5ef`)
- **Brand / Category**: Samsung | smartphone
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.samsung.com/in/smartphones/galaxy-s24-ultra](https://www.samsung.com/in/smartphones/galaxy-s24-ultra)
- **Image Asset**: [https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg](https://m.media-amazon.com/images/I/71GLMJ7TQiL._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 54 KB
- **SHA-256**: `3af9e7e38f8d861656a6383213326a8f5d1b030cbc1404a0121425f18f3a31aa`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 2. Xiaomi 14 Ultra (`6aa06056af8879d815dca766`)
- **Brand / Category**: Xiaomi | smartphone
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.mi.com/in/product/xiaomi-14-ultra](https://www.mi.com/in/product/xiaomi-14-ultra)
- **Image Asset**: [https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg](https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 150 KB
- **SHA-256**: `f86192c90508e4cff7bddadc80408a6d0f32382b9c832a3630b8603b30891fef`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 3. Dell Inspiron 15 3520 (`6a9904e369652590e0aadc76`)
- **Brand / Category**: Dell | laptop
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.dell.com/en-in/shop/laptops/inspiron-15-3520-laptop/spd/inspiron-15-3520-laptop](https://www.dell.com/en-in/shop/laptops/inspiron-15-3520-laptop/spd/inspiron-15-3520-laptop)
- **Image Asset**: [https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg](https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 42 KB
- **SHA-256**: `9be215fb59122b7ab8f4bdf2bc8adb97743b8a8cf7359a3816e4691a0ee7fe36`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 4. Television Bravia (`6a9904e369652590e0aadcfc`)
- **Brand / Category**: Television | television
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.sony.co.in/bravia](https://www.sony.co.in/bravia)
- **Image Asset**: [https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg](https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1125 | **File Size**: 33 KB
- **SHA-256**: `043cb7d0e008199d8ceb2b21a40df2d75748e9be9371c25b3520f205facc6826`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 5. Sony PlayStation 5 Pro Console (`6aa06058af8879d815dcb355`)
- **Brand / Category**: Sony | gaming
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.playstation.com/en-in/ps5/ps5-pro](https://www.playstation.com/en-in/ps5/ps5-pro)
- **Image Asset**: [https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg](https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 35 KB
- **SHA-256**: `9a148993d77d4e2e9eb397531449ffe4c12efd3975bd762f493d29da3d7c50cc`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 6. Apple iPhone 17 Pro Max (`6a9904e369652590e0aadbea`)
- **Brand / Category**: Apple | smartphone
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.apple.com/in/iphone](https://www.apple.com/in/iphone)
- **Image Asset**: [https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg](https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 56 KB
- **SHA-256**: `f86084146bf548ffd72f9fd421f6ba087ecace2ef979b852822956ae737f22cd`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 7. Apple iPhone 17 Pro (`6a9904e369652590e0aadbec`)
- **Brand / Category**: Apple | smartphone
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.apple.com/in/iphone](https://www.apple.com/in/iphone)
- **Image Asset**: [https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg](https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 56 KB
- **SHA-256**: `f86084146bf548ffd72f9fd421f6ba087ecace2ef979b852822956ae737f22cd`
- **Status**: `RECOVERED_EXACT_SOURCE`

### 8. Apple iPhone Air (`6a9904e369652590e0aadbf0`)
- **Brand / Category**: Apple | smartphone
- **Source Type**: OFFICIAL_MANUFACTURER_PAGE
- **Product Page**: [https://www.apple.com/in/iphone](https://www.apple.com/in/iphone)
- **Image Asset**: [https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg](https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg)
- **HTTP Status**: 200 | **Content-Type**: image/jpeg
- **Dimensions**: 1500x1500 | **File Size**: 44 KB
- **SHA-256**: `dc035338e34583d899ad38620a1f9d8451a9895b1aed6c5938e399c02cedfd59`
- **Status**: `RECOVERED_EXACT_SOURCE`


---

## 4. Unresolved Products Breakdown (5)

### 1. Television Crystal UHD (`6a9904e369652590e0aadcee`)
- **Brand / Category**: Television | television
- **Previous Status**: `C_IMAGE_URL_RETURNED_404`
- **Reason**: No Candidate Image URL available from store sources

### 2. LG UltraGear 27 240Hz OLED (27GR95QE) (`6aa06057af8879d815dcafb3`)
- **Brand / Category**: LG | television
- **Previous Status**: `A_NO_EXACT_SOURCE_FOUND`
- **Reason**: Cross-Product SHA-256 Collision (Candidate Image Rejected)

### 3. Canon EOS R6 Mark II Mirrorless (`6aa06058af8879d815dcb247`)
- **Brand / Category**: Canon | camera
- **Previous Status**: `A_NO_EXACT_SOURCE_FOUND`
- **Reason**: Cross-Product SHA-256 Collision (Candidate Image Rejected)

### 4. Washing Machines LG (`6a9904e369652590e0aadda6`)
- **Brand / Category**: Washing Machines | washing-machine
- **Previous Status**: `A_NO_EXACT_SOURCE_FOUND`
- **Reason**: No Candidate Image URL available from store sources

### 5. iPhone 17 Pro Max Silicone Case (`6a98d181a6bfd56d867752df`)
- **Brand / Category**: Apple | accessory
- **Previous Status**: `C_IMAGE_URL_RETURNED_404`
- **Reason**: No Candidate Image URL available from store sources


---

## 5. Summary & Invariant Verification

- **Products Attempted**: 13
- **Recovered**: 8
- **Unresolved**: 5
- **Sum**: 8 + 5 = 13 (Expected: 13)
- **Invariant Result**: **PASS**
- **Database Modified**: **NO**
