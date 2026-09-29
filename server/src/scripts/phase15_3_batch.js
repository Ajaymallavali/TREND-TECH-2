import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappings = {
  "6aa06057af8879d815dcb076": { b: "AOC", d: "TECH", c: "Monitors", pt: "Monitor", sc: "AGON PRO", m: "AGON PRO 27 240Hz OLED", url: "https://aoc.com/gaming/products/monitors/ag276qzd" },
  "6aa06058af8879d815dcb3dc": { b: "ASUS", d: "TECH", c: "Gaming", pt: "Handheld Console", sc: "ROG Ally", m: "ROG Ally Ryzen Z1 Extreme", url: "https://rog.asus.com/gaming-handhelds/rog-ally/rog-ally-2023/" },
  "6aa06058af8879d815dcb3cd": { b: "ASUS", d: "TECH", c: "Gaming", pt: "Handheld Console", sc: "ROG Ally", m: "ROG Ally X", url: "https://rog.asus.com/gaming-handhelds/rog-ally/rog-ally-x-2024/" },
  "6aa06057af8879d815dcaaa9": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "ROG Strix", m: "ROG Strix SCAR 18", url: "https://rog.asus.com/laptops/rog-strix/rog-strix-scar-18-2024/" },
  "6aa06057af8879d815dcaa6e": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "ROG Zephyrus", m: "ROG Zephyrus G16", url: "https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g16-2024/" },
  "6a9904e369652590e0aadcaa": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "TUF Gaming", m: "TUF Gaming A15", url: "https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a15-2024/" },
  "6aa06057af8879d815dcaa8c": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Vivobook", m: "Vivobook Pro 15 OLED", url: "https://www.asus.com/laptops/for-creators/vivobook/vivobook-pro-15-oled-k6502/" },
  "6a9904e369652590e0aadca4": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "ZenBook", m: "ZenBook 14 OLED", url: "https://www.asus.com/laptops/for-home/zenbook/zenbook-14-oled-ux3405/" },
  "6aa06057af8879d815dcaa7d": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "ZenBook", m: "ZenBook 14 OLED", url: "https://www.asus.com/laptops/for-home/zenbook/zenbook-14-oled-ux3405/" },
  "6aa06057af8879d815dcb02b": { b: "ASUS", d: "TECH", c: "Monitors", pt: "Monitor", sc: "ProArt", m: "ProArt PA279CRV", url: "https://www.asus.com/displays-desktops/monitors/proart/proart-display-pa279crv/" },
  "6aa06057af8879d815dcb00d": { b: "ASUS", d: "TECH", c: "Monitors", pt: "Monitor", sc: "ROG Swift", m: "ROG Swift PG32UCDM", url: "https://rog.asus.com/monitors/32-to-34-inches/rog-swift-oled-pg32ucdm/" },
  "6aa06057af8879d815dcb01c": { b: "ASUS", d: "TECH", c: "Monitors", pt: "Monitor", sc: "TUF Gaming", m: "TUF Gaming VG27AQ3A", url: "https://www.asus.com/displays-desktops/monitors/tuf-gaming/tuf-gaming-vg27aq3a/" },
  "6a9904e369652590e0aadca2": { b: "ASUS", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Vivobook", m: "Vivobook 15 OLED", url: "https://www.asus.com/laptops/for-home/vivobook/vivobook-15-oled-x1505/" },
  "6a9904e469652590e0aadede": { b: "UNVERIFIED", d: "TECH", c: "Accessories", pt: "Laptop Bag", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aaded2": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Backpack", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aaded4": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Belt", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aaded8": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Cap", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadf76": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Clutch", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadedc": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Crossbody Bag", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadee2": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Cufflinks", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadf6e": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Handbag", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadeda": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Hat", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadf78": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Jewellery", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadf7a": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Scarf", sc: "UNVERIFIED", m: "UNVERIFIED" },
  "6a9904e469652590e0aadf72": { b: "UNVERIFIED", d: "TREND", c: "Accessories", pt: "Shoulder Bag", sc: "UNVERIFIED", m: "UNVERIFIED" }
};

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MP = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  
  const products = await Product.find({}).sort({ brand: 1, category: 1, name: 1, _id: 1 }).limit(25).lean();
  
  let report = {
    batchNumber: 1,
    productsProcessed: 0,
    brandRecovery: { resolved: 0, partial: 0, unresolved: 0, conflicted: 0 },
    productTypeCounts: {},
    domain: { TECH: 0, TREND: 0, UNKNOWN: 0 },
    categoryCounts: {},
    brands: new Set(),
    brandAnomalies: [],
    models: { exact: 0, regional: 0, partial: 0, unresolved: 0 },
    officialSources: { found: 0, unavailable: 0 },
    imageQueue: { ready: 0, blocked: 0 },
    existingImages: { preserved: 0, modified: 0, downgraded: 0 },
    marketplace: { Amazon: 0, Flipkart: 0, OTHER: 0 },
    deals: { eligible: 0, suppressed: 0, reasons: {} },
    details: []
  };

  for (const p of products) {
    const id = p._id.toString();
    const map = mappings[id];
    if (!map) {
      console.log('Missing map for', id);
      continue;
    }

    const identityStatus = map.b === 'UNVERIFIED' ? 'IDENTITY_UNVERIFIED' : 'IDENTITY_VERIFIED';
    const confidence = map.b === 'UNVERIFIED' ? 'LOW' : 'HIGH';
    
    // Update Product
    await Product.updateOne({ _id: p._id }, {
      $set: {
        brand: map.b,
        domain: map.d,
        category: map.c,
        productType: map.pt,
        subcategory: map.sc,
        model: map.m,
        identityStatus,
        identityConfidence: confidence,
        officialSourceUrl: map.url || null
      }
    });

    report.productsProcessed++;
    if (map.b === 'UNVERIFIED') report.brandRecovery.unresolved++;
    else report.brandRecovery.resolved++;

    report.productTypeCounts[map.pt] = (report.productTypeCounts[map.pt] || 0) + 1;
    report.domain[map.d]++;
    report.categoryCounts[map.c] = (report.categoryCounts[map.c] || 0) + 1;
    
    if (p.brand === 'Accessories' && map.b === 'UNVERIFIED') {
      report.brandAnomalies.push({ current: p.brand, resolved: map.b, evidence: 'Generic product title', confidence: 'HIGH' });
    }
    
    if (map.b !== 'UNVERIFIED') report.brands.add(map.b);
    
    if (map.m === 'UNVERIFIED') report.models.unresolved++;
    else report.models.exact++;
    
    if (map.url) {
      report.officialSources.found++;
      report.imageQueue.ready++;
    } else {
      report.officialSources.unavailable++;
      report.imageQueue.blocked++;
    }
    
    // Existing images - preserved (we didn't modify image fields)
    if (p.image) report.existingImages.preserved++;

    // Marketplace
    const mps = await MP.find({ product: p._id }).lean();
    for (const m of mps) {
      let platform = 'OTHER';
      const urlLower = (m.url || '').toLowerCase();
      if (urlLower.includes('amazon')) platform = 'Amazon';
      else if (urlLower.includes('flipkart')) platform = 'Flipkart';
      report.marketplace[platform]++;

      // Preserve marketplace provenance:
      let marketplaceStatus = m.sourceStatus || m.marketplaceStatus || 'LIVE_UNVERIFIED';
      
      // If previously live verified but product identity now unresolved
      if (marketplaceStatus === 'LIVE_VERIFIED' && identityStatus === 'IDENTITY_UNVERIFIED') {
        marketplaceStatus = 'PREVIOUSLY_VERIFIED_PENDING_IDENTITY';
      }
      
      const dealEligible = (identityStatus === 'IDENTITY_VERIFIED') && (marketplaceStatus === 'LIVE_VERIFIED') && (m.currentPrice > 0);
      const dealReason = !dealEligible ? marketplaceStatus : 'VALID';

      await MP.updateOne({ _id: m._id }, {
        $set: {
          marketplaceStatus,
          dealEligible,
          dealReason
        }
      });

      if (dealEligible) report.deals.eligible++;
      else {
        report.deals.suppressed++;
        report.deals.reasons[dealReason] = (report.deals.reasons[dealReason] || 0) + 1;
      }
    }
    
    report.details.push({
      productId: id,
      title: p.name || p.title,
      oldBrand: p.brand,
      resolvedBrand: map.b,
      productType: map.pt,
      domain: map.d,
      oldCategory: p.category,
      resolvedCategory: map.c,
      subcategory: map.sc,
      oldModel: p.model || 'N/A',
      resolvedModel: map.m,
      confidence,
      officialSource: map.url || null
    });
  }

  const batchDir = path.join(__dirname, '../data/audits/catalogBatches');
  if (!fs.existsSync(batchDir)) fs.mkdirSync(batchDir, { recursive: true });
  fs.writeFileSync(path.join(batchDir, 'phase15_3_batch1.json'), JSON.stringify(report, null, 2));

  console.log('Batch done');
  process.exit(0);
}

run();
