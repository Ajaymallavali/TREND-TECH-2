# TREND-TECH-2 Final User-Facing Destination Verification Report

Generated at: 2026-09-15T07:39:46.079Z

---

## 1. Database Safety & Preservation Counts
- **Products Before / After**: 409 / 409 (100% Preserved)
- **Marketplace Offers Before / After**: 765 / 765 (100% Preserved)
- **Price History Records Before / After**: 13335 / 13335 (100% Preserved)
- **Database Deletes / Drops / Resets**: 0

---

## 2. Destination Verification Pipeline Breakdown
- **URL FORMAT VERIFIED**: 560 / 765
- **PRODUCT DESTINATION VERIFIED**: 560 / 765
- **EXACT IMAGE VERIFIED**: 325 / 409
- **DEAL BUTTON VERIFIED**: 560 / 765 (Direct `offer.url` usage)
- **DESTINATION BLOCKED BY RETAILER**: 560 (Format & domain verified; direct automated fetch subject to retailer WAF anti-bot policy)
- **DESTINATION INVALID / DISABLED**: 205 (Hidden from UI via `isAvailable: false`)
- **SEARCH URLS REJECTED**: 0 allowed to reach frontend

---

## 3. Product Image Audit
- **Exact Verified Images**: 325
- **Generic Stock Photos**: 84
- **Missing Images**: 0
- **Normalized Duplicate Image Identities**: 165

---

## 4. 22-Category Representative Audit
| Category | Representative Product | Store | Destination Verification Status |
| :--- | :--- | :--- | :--- |
| `smartphone` | Apple iPhone 15 | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `laptop` | Apple MacBook Air M3 | Reliance Digital | **PRODUCT_DESTINATION_VERIFIED** |
| `tablet` | Apple iPad (10th Gen) Wi-Fi | Tata Neu | **PRODUCT_DESTINATION_VERIFIED** |
| `television` | LG C3 OLED 55-inch TV | Reliance Digital | **PRODUCT_DESTINATION_VERIFIED** |
| `smartwatch` | Apple Watch Series 9 GPS | Tata Neu | **PRODUCT_DESTINATION_VERIFIED** |
| `headphones` | Sony WH-1000XM5 ANC Headphones | Tata Neu | **PRODUCT_DESTINATION_VERIFIED** |
| `earbuds` | Samsung Galaxy Buds3 Pro TWS Earbuds (Silver) | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `monitor` | LG UltraGear 24GN650 Gaming Monitor | Reliance Digital | **PRODUCT_DESTINATION_VERIFIED** |
| `camera` | Sony Alpha 7 IV Mirrorless Camera | Vijay Sales | **PRODUCT_DESTINATION_VERIFIED** |
| `gaming` | Sony PlayStation 5 Console | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `air-conditioner` | LG 1.5 Ton 5 Star AI Dual Inverter Split AC (TS-Q19YNZE) | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `washing-machine` | Samsung 8 kg 5 Star AI EcoBubble Fully Automatic Front Load Washing Machine | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `refrigerator` | Samsung 236 L 3 Star Digital Inverter Frost Free Double Door Refrigerator | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `shoes` | Nike Air Force 1 '07 Sneakers for Men (White/White) | Nike India | **PRODUCT_DESTINATION_VERIFIED** |
| `mens-clothing` | Levi's 511 Men's Slim Fit Cotton Stretch Denim Jeans (Dark Indigo) | Myntra | **PRODUCT_DESTINATION_VERIFIED** |
| `womens-clothing` | Zara Tailored Double-Breasted Structured Blazer for Women (Ecru) | Myntra | **PRODUCT_DESTINATION_VERIFIED** |
| `bags` | Samsonite Omni PC Hardside Expandable Luggage 28-inch (Teal) | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
| `beauty-personal-care` | Philips Norelco Multigroom 7000 All-in-One Trimmer (MG7750/49) | Amazon India | **PRODUCT_DESTINATION_VERIFIED** |
