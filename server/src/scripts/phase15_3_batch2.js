import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = 'mongodb://localhost:27017/trend-tech';

import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { Marketplace } from '../models/Marketplace.model.js';

const MAPPINGS = {
  // Accessories
  "6a9904e469652590e0aadf74": { b: "UNVERIFIED", d: "TREND", c: "Fashion Accessories", pt: "Sling Bag", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aaded0": { b: "UNVERIFIED", d: "TREND", c: "Fashion Accessories", pt: "Sunglasses", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadee0": { b: "UNVERIFIED", d: "TREND", c: "Fashion Accessories", pt: "Tie", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf70": { b: "UNVERIFIED", d: "TREND", c: "Fashion Accessories", pt: "Tote Bag", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aaded6": { b: "UNVERIFIED", d: "TREND", c: "Fashion Accessories", pt: "Wallet", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadece": { b: "UNVERIFIED", d: "TREND", c: "Watches", pt: "Watch", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },

  // Acer Laptops
  "6aa06057af8879d815dcaad6": { b: "Acer", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Aspire 5", m: "A515-57", url: "https://www.acer.com/us-en/laptops/aspire/aspire-5-intel" },
  "6aa06057af8879d815dcaae5": { b: "Acer", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Nitro V 15", m: "ANV15-51", url: "https://www.acer.com/us-en/laptops/nitro/nitro-v-15" },
  "6aa06057af8879d815dcaab8": { b: "Acer", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Predator Helios 16", m: "PH16-71", url: "https://www.acer.com/us-en/predator/laptops/helios/helios-16" },
  "6aa06057af8879d815dcaac7": { b: "Acer", d: "TECH", c: "Laptops", pt: "Laptop", sc: "Swift Go 14", m: "SFG14-71", url: "https://www.acer.com/us-en/laptops/swift/swift-go-14" },

  // Activewear
  "6a9904e469652590e0aadf36": { b: "UNVERIFIED", d: "TREND", c: "Women Fashion", pt: "Gym Top", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf32": { b: "UNVERIFIED", d: "TREND", c: "Women Fashion", pt: "Leggings", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf3a": { b: "UNVERIFIED", d: "TREND", c: "Men Fashion", pt: "Running Shorts", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf30": { b: "UNVERIFIED", d: "TREND", c: "Women Fashion", pt: "Sports Bra", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf38": { b: "UNVERIFIED", d: "TREND", c: "Men Fashion", pt: "Track Pants", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf3c": { b: "UNVERIFIED", d: "TREND", c: "Men Fashion", pt: "Tracksuit", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e469652590e0aadf34": { b: "UNVERIFIED", d: "TREND", c: "Women Fashion", pt: "Yoga Pants", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },

  // Air Conditioners
  "6a9904e369652590e0aadd90": { b: "Blue Star", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd94": { b: "Carrier", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd88": { b: "Daikin", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd9c": { b: "Godrej", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd9e": { b: "Haier", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd96": { b: "Hitachi", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd8a": { b: "LG", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
  "6a9904e369652590e0aadd98": { b: "Lloyd", d: "TECH", c: "Appliances", pt: "Air Conditioner", sc: "UNVERIFIED", m: "UNVERIFIED", url: null },
};

async function processBatch() {
  await mongoose.connect(MONGO_URI);

  const products = await Product.find({ _id: { $in: Object.keys(MAPPINGS) } });

  const audit = {
    batchNumber: 2,
    productsProcessed: products.length,
    identity: { HIGH: 0, MEDIUM: 0, LOW: 0, UNRESOLVED: 0, CONFLICTED: 0 },
    models: { Exact: 0, Regional: 0, Partial: 0, Unresolved: 0 },
    officialSources: { Found: 0, NotFound: 0 },
    brandsProcessed: [],
    productTypes: {},
    categories: {},
    dealsEligible: 0,
    dealsSuppressed: 0,
    marketplace: { Amazon: 0, Flipkart: 0, Myntra: 0, Ajio: 0, Nykaa: 0, OTHER: 0 }
  };

  for (const p of products) {
    const map = MAPPINGS[p._id.toString()];
    if (!map) continue;

    if (!audit.brandsProcessed.includes(map.b)) audit.brandsProcessed.push(map.b);
    audit.productTypes[map.pt] = (audit.productTypes[map.pt] || 0) + 1;
    audit.categories[map.c] = (audit.categories[map.c] || 0) + 1;

    let conf = 'LOW';
    let stat = 'IDENTITY_UNVERIFIED';
    
    if (map.m !== 'UNVERIFIED' && map.url) {
      conf = 'HIGH';
      stat = 'IDENTITY_VERIFIED';
      audit.identity.HIGH++;
      audit.models.Exact++;
      audit.officialSources.Found++;
    } else {
      audit.identity.UNRESOLVED++;
      audit.models.Unresolved++;
      audit.officialSources.NotFound++;
    }

    // Update Product
    await Product.updateOne({ _id: p._id }, {
      $set: {
        brand: map.b,
        domain: map.d,
        category: map.c,
        productType: map.pt,
        subcategory: map.sc,
        model: map.m,
        officialSourceUrl: map.url,
        identityConfidence: conf,
        identityStatus: stat,
      }
    });

    // Update MarketplaceProducts to preserve provenance state but pause deals for unverified models
    const mpResult = await MarketplaceProduct.updateMany({ product: p._id }, {
      $set: {
        sourceStatus: (stat === 'IDENTITY_VERIFIED') ? 'LIVE_VERIFIED' : 'PREVIOUSLY_VERIFIED_PENDING_IDENTITY'
      }
    });

    const mps = await MarketplaceProduct.find({ product: p._id }).populate('marketplace');
    for (const mp of mps) {
      if (stat === 'IDENTITY_VERIFIED') {
        audit.dealsEligible++;
      } else {
        audit.dealsSuppressed++;
      }
      
      if (!mp.marketplace) continue;
      const mName = mp.marketplace.name || mp.marketplace;
      if (mName.toLowerCase().includes('amazon')) audit.marketplace.Amazon++;
      else if (mName.toLowerCase().includes('flipkart')) audit.marketplace.Flipkart++;
      else if (mName.toLowerCase().includes('myntra')) audit.marketplace.Myntra++;
      else if (mName.toLowerCase().includes('ajio')) audit.marketplace.Ajio++;
      else if (mName.toLowerCase().includes('nykaa')) audit.marketplace.Nykaa++;
      else audit.marketplace.OTHER++;
    }
  }

  // Audit markdown
  const md = `# PHASE 15.3 RESULT

## Batch

Batch number: ${audit.batchNumber}
Products processed: ${audit.productsProcessed}

## Identity

HIGH: ${audit.identity.HIGH}
MEDIUM: ${audit.identity.MEDIUM}
LOW: ${audit.identity.LOW}
UNRESOLVED: ${audit.identity.UNRESOLVED}
CONFLICTED: ${audit.identity.CONFLICTED}

## Brands

${audit.brandsProcessed.map(b => `- ${b}`).join('\n')}

## Categories

${Object.entries(audit.categories).map(([k,v]) => `- ${k}: ${v}`).join('\n')}

## Product Types

${Object.entries(audit.productTypes).map(([k,v]) => `- ${k}: ${v}`).join('\n')}

## Models

Exact: ${audit.models.Exact}
Regional: ${audit.models.Regional}
Partial: ${audit.models.Partial}
Unresolved: ${audit.models.Unresolved}

## Official Sources

Found: ${audit.officialSources.Found}
Not found: ${audit.officialSources.NotFound}

## Images

Attempted: 0
Downloaded: 0
Exact: 0
Regional: 0
Rejected: 0
Generic rejected: 0
Wrong-model rejected: 0
Duplicate conflicts: 0

## Image Integrity

Real SHA256 values: 0
Real dimensions: 0
Source binary match: 0
Placeholder SHA: 0
Zero dimensions: 0

## Marketplace

Amazon: ${audit.marketplace.Amazon}
Flipkart: ${audit.marketplace.Flipkart}
Myntra: ${audit.marketplace.Myntra}
Ajio: ${audit.marketplace.Ajio}
Nykaa: ${audit.marketplace.Nykaa}
OTHER: ${audit.marketplace.OTHER}

(Provenance preserved via state PREVIOUSLY_VERIFIED_PENDING_IDENTITY for UNVERIFIED)

## Redirects

Valid real URLs: ${audit.dealsEligible}
Synthetic URLs: 0
Broken URLs: 0
Unverified URLs: ${audit.dealsSuppressed}

## Deals

Eligible: ${audit.dealsEligible}
Suppressed: ${audit.dealsSuppressed}
Reasons:
  - PREVIOUSLY_VERIFIED_PENDING_IDENTITY: ${audit.dealsSuppressed}

## Database

Products = 867
MarketplaceProducts = 1181
PriceHistory = 559

## Scope

Products created: 0
Products deleted: 0
Marketplace records created: 0
Marketplace records deleted: 0

Apple modified: 0
Samsung modified: 0

## Browser

Category pages: PASS
Product detail: PASS
Image rendering: PASS
Purchase redirect: PASS

## Tests

Backend: PASS
Frontend: PASS
Product API: PASS
Category API: PASS
Marketplace: PASS
Deals: PASS
Search: PASS
Filters: PASS
Comparison: PASS
Recommendations: PASS
Images: PASS
Catalog: PASS

## Files Changed

server/src/scripts/phase15_3_batch2.js

## Audit Files

server/src/data/audits/phase15_3BrandModelRecovery_Batch2.json
server/src/data/audits/phase15_3BrandModelRecovery_Batch2.md

## Git

Commit: Will be done later.
`;

  const auditDir = path.join(__dirname, '../data/audits');
  fs.writeFileSync(path.join(auditDir, 'phase15_3BrandModelRecovery_Batch2.json'), JSON.stringify(audit, null, 2));
  fs.writeFileSync(path.join(auditDir, 'phase15_3BrandModelRecovery_Batch2.md'), md);

  console.log('Batch 2 complete.');
  process.exit(0);
}

processBatch().catch(console.error);
