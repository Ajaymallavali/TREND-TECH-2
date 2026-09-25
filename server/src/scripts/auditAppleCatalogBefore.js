import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const AUDITS_DIR = path.join(__dirname, '../data/audits');
const BACKUPS_DIR = path.join(__dirname, '../data/backups');

if (!fs.existsSync(AUDITS_DIR)) fs.mkdirSync(AUDITS_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

async function runBeforeAudit() {
  console.log('================================================================');
  console.log('TREND-TECH-2 — APPLE CATALOG BEFORE-REPAIR AUDIT & BACKUP');
  console.log('================================================================');

  await connectDB();

  const totalProducts = await Product.countDocuments({});
  const totalMp = await MarketplaceProduct.countDocuments({});
  const totalPriceHistory = await PriceHistory.countDocuments({});

  // Fetch all Apple products
  const appleProducts = await Product.find({
    $or: [
      { brand: { $regex: /^apple$/i } },
      { name: { $regex: /\bapple\b|\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|\bapple watch\b/i } }
    ]
  }).lean();

  const appleProductIds = appleProducts.map(p => p._id);

  // Fetch MarketplaceProducts for Apple products
  const appleMpList = await MarketplaceProduct.find({ product: { $in: appleProductIds } }).lean();

  // Create timestamped backup file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `appleCatalogBackup-${timestamp}.json`;
  const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

  const backupPayload = {
    timestamp: new Date().toISOString(),
    totalCatalogBaseline: {
      products: totalProducts,
      marketplaceProducts: totalMp,
      priceHistory: totalPriceHistory
    },
    appleProductsCount: appleProducts.length,
    appleMarketplaceProductsCount: appleMpList.length,
    appleProducts,
    appleMarketplaceProducts: appleMpList
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2));
  console.log(`✅ Timestamped backup saved cleanly: ${backupFilePath}`);

  // Create appleCatalogBefore.json & .md
  const beforeRecords = [];
  for (const p of appleProducts) {
    const mps = appleMpList.filter(m => m.product.toString() === p._id.toString());
    beforeRecords.push({
      productId: p._id.toString(),
      productName: p.name,
      brand: p.brand || 'Apple',
      model: p.name,
      category: p.category,
      subcategory: p.subcategory || null,
      existingImageUrl: p.image || null,
      imageVerificationStatus: p.imageStatus || 'UNVERIFIED',
      marketplaceProductIds: mps.map(m => m._id.toString()),
      marketplace: mps.map(m => m.marketplace ? m.marketplace.toString() : 'UNKNOWN'),
      productUrl: mps.length > 0 ? mps[0].url : null,
      price: mps.length > 0 ? mps[0].currentPrice : null,
      sourceStatus: p.sourceStatus || 'LEGACY_SYNTHETIC'
    });
  }

  const beforeJson = {
    timestamp: new Date().toISOString(),
    appleProductsCount: appleProducts.length,
    records: beforeRecords
  };

  const beforeMd = `# TREND-TECH-2 — Apple Catalog Before-Repair Audit

## Overview
- **Total Catalog Products**: ${totalProducts}
- **Apple Products Discovered**: ${appleProducts.length}
- **Backup File Created**: \`${backupFileName}\`

## Discovered Apple Products
${beforeRecords.map(r => `- **${r.productName}** (ID: \`${r.productId}\` | Cat: \`${r.category}\` | Image: \`${r.existingImageUrl ? 'Present' : 'Missing'}\` | Status: \`${r.imageVerificationStatus}\`)`).join('\n')}
`;

  fs.writeFileSync(path.join(AUDITS_DIR, 'appleCatalogBefore.json'), JSON.stringify(beforeJson, null, 2));
  fs.writeFileSync(path.join(AUDITS_DIR, 'appleCatalogBefore.md'), beforeMd);

  console.log(`\nBefore-repair audit files generated cleanly:`);
  console.log(`- ${path.join(AUDITS_DIR, 'appleCatalogBefore.json')}`);
  console.log(`- ${path.join(AUDITS_DIR, 'appleCatalogBefore.md')}`);

  await disconnectDB();
}

runBeforeAudit().catch(err => {
  console.error('Error in before-repair audit:', err);
  process.exit(1);
});
