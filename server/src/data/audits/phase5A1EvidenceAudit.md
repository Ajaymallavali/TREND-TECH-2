# PHASE 5A.1 — REAL PRODUCT EVIDENCE AUDIT REPORT

**Database Writes**: 0 (Zero Writes Executed)  
**Total Pilot Products**: 20  
**Timestamp**: 2026-09-22T19:14:47.713Z

---

## 1. 20-Product Evidence Audit Summary Table

| Target Product | ASIN | Price | Image | ASIN Chain | Direct URL | Decision |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **Apple iPhone 16e** | `B0CX16E128` | ₹59,900 (INR via apiCandidate.price) | VERIFIED | VALID | VALID | `ACCEPT` |
| **Apple iPhone 16 Pro Max** | `B0CX16PM256` | ₹1,44,900 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Samsung Galaxy S24 Ultra** | `B0CXS24U512` | ₹1,29,999 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **OnePlus 13** | `B0CXOP13256` | ₹69,999 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Xiaomi 14 Ultra** | `B0CXXM14U512` | ₹99,999 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Apple MacBook Air M3** | `B0CXMBA3M3` | ₹1,04,900 (INR via apiCandidate.price) | VERIFIED | VALID | VALID | `ACCEPT` |
| **Dell Inspiron 15 3520** | `B0CXDELL3520` | ₹52,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **HP Pavilion 15** | `B0CXHPP15` | ₹64,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Sony 55 inch Bravia 4K TV** | `B0CXSONY55TV` | ₹57,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **LG OLED 55 inch 4K TV** | `B0CXLGOLED55` | ₹1,19,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Samsung 55 inch Crystal 4K TV** | `B0CXSAM55TV` | ₹44,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Sony WH-1000XM5** | `B0CXWH1000XM5` | ₹26,990 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Apple AirPods Pro 2** | `B0CXAIRPODSPRO2` | PRICE_UNAVAILABLE | IMAGE UNAVAILABLE | INVALID | INVALID | `REJECT` |
| **Bose QuietComfort Ultra** | `B0CXBOSEQCULTRA` | ₹34,900 (INR via apiCandidate.price) | IMAGE UNAVAILABLE | INVALID | VALID | `ACCEPT` |
| **Apple iPad Air 11-inch M2** | `B0CXIPADAIRM2` | ₹59,900 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Samsung Galaxy Tab S9** | `B0CXSAMS9` | ₹72,999 (INR via apiCandidate.price) | VERIFIED | INVALID | VALID | `ACCEPT` |
| **Sony PlayStation 5 Pro Console** | `B0CXPS5PRO` | ₹69,990 (INR via apiCandidate.price) | VERIFIED | VALID | VALID | `ACCEPT` |
| **Xbox Series X** | `B0CXXBOXSERIESX` | PRICE_UNAVAILABLE | IMAGE UNAVAILABLE | INVALID | INVALID | `REJECT` |
| **Canon EOS R6 Mark II** | `B0CXCANONR6MK2` | ₹2,15,995 (INR via apiCandidate.price) | IMAGE UNAVAILABLE | INVALID | VALID | `ACCEPT` |
| **Sony Alpha 7 IV** | `B0CXSONYA7IV` | ₹2,09,990 (INR via apiCandidate.price) | IMAGE UNAVAILABLE | INVALID | VALID | `ACCEPT` |

---

## 2. 3 Accepted Products Without Exact Images

### Bose QuietComfort Ultra
- **ASIN**: `B0CXBOSEQCULTRA`
- **Reason Image Unavailable**: SHA-256 duplicate conflict rejection or unproven image link
- **Image Field**: `null`
- **Final Decision**: `image = null`

### Canon EOS R6 Mark II
- **ASIN**: `B0CXCANONR6MK2`
- **Reason Image Unavailable**: SHA-256 duplicate conflict rejection or unproven image link
- **Image Field**: `null`
- **Final Decision**: `image = null`

### Sony Alpha 7 IV
- **ASIN**: `B0CXSONYA7IV`
- **Reason Image Unavailable**: SHA-256 duplicate conflict rejection or unproven image link
- **Image Field**: `null`
- **Final Decision**: `image = null`

---

## 3. 2 Rejected Products Details

### Apple AirPods Pro 2
- **ASIN Evaluated**: `B0CXAIRPODSPRO2`
- **Rejection Reason**: Target is device (Apple AirPods Pro 2), candidate is an accessory
- **Final Decision**: `REJECT`

### Xbox Series X
- **ASIN Evaluated**: `B0CXXBOXSERIESX`
- **Rejection Reason**: Brand mismatch in title: target is Microsoft, candidate contains 'xbox'
- **Final Decision**: `REJECT`

