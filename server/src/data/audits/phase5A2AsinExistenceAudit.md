# PHASE 5A.2 — REAL ASIN EXISTENCE VERIFICATION AUDIT REPORT

**Database Writes**: 0 (Zero Writes Executed)  
**Total Products Evaluated**: 20  
**Timestamp**: 2026-09-22T19:17:58.104Z

---

## Final Classification Summary

- **REAL_VERIFIED**: 0
- **SUSPICIOUS**: 18
- **REJECTED**: 2

> [!WARNING]
> All 18 ASIN strings (`B0CX...`) evaluated in the Phase 5A dry run were traced to mock data fixtures in `server/src/scripts/phase5A20ProductDryRun.js` (`MOCK_LIVE_API_RESPONSES`). Under Section 7 rules, they are classified as **SUSPICIOUS** and strictly barred from database entry.

---

## Detailed ASIN Provenance Matrix

### Apple iPhone 16e
- **ASIN**: `B0CX16E128`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CX16E128 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Apple iPhone 16 Pro Max
- **ASIN**: `B0CX16PM256`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CX16PM256 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Samsung Galaxy S24 Ultra
- **ASIN**: `B0CXS24U512`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXS24U512 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### OnePlus 13
- **ASIN**: `B0CXOP13256`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXOP13256 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Xiaomi 14 Ultra
- **ASIN**: `B0CXXM14U512`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXXM14U512 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Apple MacBook Air M3
- **ASIN**: `B0CXMBA3M3`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXMBA3M3 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Dell Inspiron 15 3520
- **ASIN**: `B0CXDELL3520`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXDELL3520 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### HP Pavilion 15
- **ASIN**: `B0CXHPP15`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXHPP15 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Sony 55 inch Bravia 4K TV
- **ASIN**: `B0CXSONY55TV`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXSONY55TV exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### LG OLED 55 inch 4K TV
- **ASIN**: `B0CXLGOLED55`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXLGOLED55 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Samsung 55 inch Crystal 4K TV
- **ASIN**: `B0CXSAM55TV`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXSAM55TV exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Sony WH-1000XM5
- **ASIN**: `B0CXWH1000XM5`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXWH1000XM5 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Apple AirPods Pro 2
- **ASIN**: `B0CXAIRPODSPRO2`
- **Classification**: `REJECTED`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: Target is device (Apple AirPods Pro 2), candidate is an accessory

### Bose QuietComfort Ultra
- **ASIN**: `B0CXBOSEQCULTRA`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXBOSEQCULTRA exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Apple iPad Air 11-inch M2
- **ASIN**: `B0CXIPADAIRM2`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXIPADAIRM2 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Samsung Galaxy Tab S9
- **ASIN**: `B0CXSAMS9`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXSAMS9 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Sony PlayStation 5 Pro Console
- **ASIN**: `B0CXPS5PRO`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXPS5PRO exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Xbox Series X
- **ASIN**: `B0CXXBOXSERIESX`
- **Classification**: `REJECTED`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: Brand mismatch in title: target is Microsoft, candidate contains 'xbox'

### Canon EOS R6 Mark II
- **ASIN**: `B0CXCANONR6MK2`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXCANONR6MK2 exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

### Sony Alpha 7 IV
- **ASIN**: `B0CXSONYA7IV`
- **Classification**: `SUSPICIOUS`
- **Source Provenance**: MOCK_FIXTURE_PHASE5A
- **Reason**: ASIN B0CXSONYA7IV exists in mock data fixture phase5A20ProductDryRun.js (MOCK_LIVE_API_RESPONSES); unverified against live SerpAPI HTTP response

