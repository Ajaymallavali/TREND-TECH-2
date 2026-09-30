# Phase 15.17: Real-Time Deal Scanner & Price Tracking

## Objective
Transform the existing verified AI Shopping Research system into a Real-Time Verified Deal Scanner by implementing secure, deduplicated `PriceHistory` snapshots, providing exact Marketplace-specific price history drops/increases, and introducing price monitoring triggers—all without creating fake price data.

## Enhancements Implemented
1. **Deduplicated Price Snapshots**: The core `productUrlAnalysis` service now stores a `PriceHistory` snapshot for verified catalog local products whenever their price is requested and differs from the last stored value, thus effectively saving new snapshots automatically on 'Search' or 'Manual Refresh'.
2. **Deal Scanner Generation**: A completely passive UI array (`dealScanner`) generated purely from server-side history calculations (`priceChange`, `status`, `lowestVerified`, `historyCount`).
3. **Marketplace Price Intelligence**: 
   - Captures independent historical paths per marketplace. (e.g., Flipkart can drop while Amazon increases).
   - Strict labels are assigned logically (e.g. `VERIFIED PRICE DROP`, `PRICE INCREASE`, `PRICE UNCHANGED`, `INSUFFICIENT HISTORY`).
4. **AI Verdict Contextualization**: Added conditional formatting directly in `computeAIScores/verdict` to mention explicitly: "The current verified price is ₹X below the previous verified observation on [Store]" or "The current price matches the lowest verified price in the available history."
5. **UI Interactivity**:
   - `[ TRACK PRICE ]` Button layout implemented for local catalog products.
   - `[ CHECK CURRENT PRICE ]` (Manual Refresh) added to forcefully hit the backend and spawn a new verification iteration (which then captures snapshot deduplication if the price moved).
6. **External Protection**: External products generated via Gemini dynamically have `historyCount` strictly forced to 1 to block UI layout overflow, and tracking/comparison are explicitly branded "unavailable" to prevent silent persistence into the DB.
7. **No Synthetics**: ZERO fake prices or drops are populated in `PriceHistory`. Chart logic maps precisely to real array lengths.

## System Integrity Check
- Products: 867
- MarketplaceProducts: 1181
- PriceHistory: 559 (Grows dynamically upon test observation)
- Products Created/Deleted: 0
- Tests: 315/315 PASS
