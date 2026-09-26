import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { determineProductCategory } from '../utils/categoryMapper.js';
import { isRealCommercialBrand, normalizeBrand } from '../utils/productIdentity.js';
import { canonicalImageUrl } from '../services/imagePipeline.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const AUDITS_DIR = path.join(__dirname, '../data/audits');
if (!fs.existsSync(AUDITS_DIR)) fs.mkdirSync(AUDITS_DIR, { recursive: true });

function getModelName(name, brand) {
  if (!name) return 'Unknown';
  let m = name;
  if (brand && m.toLowerCase().startsWith(brand.toLowerCase())) {
    m = m.substring(brand.length).trim();
  }
  return m || name;
}

async function runAuditBaseline() {
  console.log('================================================================');
  console.log('TREND-TECH — MASTER AUDIT BASELINE & INVENTORY GENERATION');
  console.log('================================================================');

  await connectDB();

  const totalProducts = await Product.countDocuments();
  const totalMarketplaceProducts = await MarketplaceProduct.countDocuments();
  const totalPriceHistory = await PriceHistory.countDocuments();
  const totalMarketplaces = await Marketplace.countDocuments();

  const rawProducts = await Product.find().lean();
  console.log(`Discovered ${rawProducts.length} MongoDB products.`);

  const statusCounts = {
    VERIFIED_EXACT: 0,
    VERIFIED_MARKETPLACE: 0,
    UNVERIFIED: 0,
    GENERIC: 0,
    PLACEHOLDER: 0,
    BROKEN: 0,
    DUPLICATE_CONFLICT: 0,
    IDENTITY_AMBIGUOUS: 0,
    OTHER: 0
  };

  const brandMap = {};
  const categoryMap = {};
  const brandRepairQueue = [];
  const inventoryByBrand = {};
  const imageHashIndex = {};

  for (const p of rawProducts) {
    const id = String(p._id);
    const name = p.name || '';
    const rawBrand = p.brand || 'Unknown';
    const brand = normalizeBrand(rawBrand) || rawBrand;
    const computedCategory = determineProductCategory(p) || p.category || 'electronics';
    const model = p.specs?.get ? p.specs.get('model') : (p.specs?.model || getModelName(name, brand));
    const status = p.imageStatus || 'UNVERIFIED';

    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    } else {
      statusCounts.OTHER++;
    }

    // Counts
    brandMap[brand] = (brandMap[brand] || 0) + 1;
    categoryMap[computedCategory] = (categoryMap[computedCategory] || 0) + 1;

    // Fetch listings summary for product
    const mpListings = await MarketplaceProduct.find({ product: p._id }).lean();
    const mpUrls = mpListings.map(l => l.url).filter(Boolean);
    const prices = mpListings.map(l => l.currentPrice).filter(p => typeof p === 'number' && p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    const item = {
      id,
      name,
      brand,
      category: computedCategory,
      rawCategory: p.category,
      description: p.description || null,
      model,
      sku: p.sku || null,
      slug: p.slug || null,
      existingImage: p.image || null,
      imageStatus: status,
      imageSource: p.imageSource || null,
      imageSourceUrl: p.imageSourceUrl || null,
      imageHash: p.imageHash || null,
      sourceStatus: p.sourceStatus || 'LEGACY_SYNTHETIC',
      sourceProvider: p.sourceProvider || 'UNKNOWN',
      externalProductId: p.externalProductId || null,
      marketplaceCount: mpListings.length,
      marketplaceUrls: mpUrls,
      minPrice
    };

    // Inventory grouping
    if (!inventoryByBrand[brand]) inventoryByBrand[brand] = {};
    if (!inventoryByBrand[brand][computedCategory]) inventoryByBrand[brand][computedCategory] = [];
    inventoryByBrand[brand][computedCategory].push(item);

    // Image hash / canonical URL indexing
    if (p.image) {
      const canonical = canonicalImageUrl(p.image) || p.image;
      const hashKey = p.imageHash || canonical;
      if (!imageHashIndex[hashKey]) imageHashIndex[hashKey] = [];
      imageHashIndex[hashKey].push({
        productId: id,
        productName: name,
        brand,
        category: computedCategory,
        model,
        sourceUrl: p.imageSourceUrl || p.image,
        localPath: p.image
      });
    }
  }

  // Sort brand repair queue by count descending
  for (const [bName, count] of Object.entries(brandMap)) {
    brandRepairQueue.push({ brand: bName, count });
  }
  brandRepairQueue.sort((a, b) => b.count - a.count);

  const timestamp = new Date().toISOString();

  // 1. masterImageRepairBaseline.json & .md
  const baselineData = {
    generatedAt: timestamp,
    databaseCounts: {
      totalProducts,
      totalMarketplaceProducts,
      totalPriceHistory,
      totalMarketplaces,
      totalCategories: Object.keys(categoryMap).length
    },
    imageStatusCounts: statusCounts,
    brandCounts: brandMap,
    categoryCounts: categoryMap
  };
  fs.writeFileSync(path.join(AUDITS_DIR, 'masterImageRepairBaseline.json'), JSON.stringify(baselineData, null, 2));

  let baselineMd = `# MASTER IMAGE REPAIR BASELINE\n\n`;
  baselineMd += `**Generated At**: ${timestamp}\n\n`;
  baselineMd += `## Database Baseline Counts\n`;
  baselineMd += `- **Products**: ${totalProducts}\n`;
  baselineMd += `- **MarketplaceProducts**: ${totalMarketplaceProducts}\n`;
  baselineMd += `- **PriceHistory**: ${totalPriceHistory}\n`;
  baselineMd += `- **Marketplaces**: ${totalMarketplaces}\n`;
  baselineMd += `- **Categories**: ${Object.keys(categoryMap).length}\n\n`;
  baselineMd += `## Image Status Breakdown\n`;
  for (const [st, cnt] of Object.entries(statusCounts)) {
    baselineMd += `- **${st}**: ${cnt}\n`;
  }
  baselineMd += `\n## Top Brands\n`;
  for (const item of brandRepairQueue.slice(0, 15)) {
    baselineMd += `- **${item.brand}**: ${item.count} products\n`;
  }
  fs.writeFileSync(path.join(AUDITS_DIR, 'masterImageRepairBaseline.md'), baselineMd);

  // 2. masterProductInventory.json & .md
  const inventoryData = {
    generatedAt: timestamp,
    counts: { totalProducts, totalMarketplaceProducts },
    inventoryByBrand
  };
  fs.writeFileSync(path.join(AUDITS_DIR, 'masterProductInventory.json'), JSON.stringify(inventoryData, null, 2));

  let invMd = `# MASTER PRODUCT INVENTORY\n\n`;
  invMd += `**Generated At**: ${timestamp}\n`;
  invMd += `**Total Products**: ${totalProducts}\n\n`;
  for (const [bName, cats] of Object.entries(inventoryByBrand)) {
    invMd += `## Brand: ${bName}\n\n`;
    for (const [catName, items] of Object.entries(cats)) {
      invMd += `### Category: ${catName} (${items.length} items)\n\n`;
      invMd += `| Product ID | Name | Model | Image Status | Current Image |\n`;
      invMd += `| --- | --- | --- | --- | --- |\n`;
      for (const it of items) {
        const imgDisplay = it.existingImage ? (it.existingImage.length > 45 ? it.existingImage.substring(0, 42) + '...' : it.existingImage) : 'N/A';
        invMd += `| \`${it.id}\` | ${it.name.replace(/\|/g, '-')} | ${it.model.replace(/\|/g, '-')} | \`${it.imageStatus}\` | \`${imgDisplay}\` |\n`;
      }
      invMd += `\n`;
    }
  }
  fs.writeFileSync(path.join(AUDITS_DIR, 'masterProductInventory.md'), invMd);

  // 3. brandRepairQueue.json
  fs.writeFileSync(path.join(AUDITS_DIR, 'brandRepairQueue.json'), JSON.stringify({ generatedAt: timestamp, queue: brandRepairQueue }, null, 2));

  // 4. masterImageIdentityIndex.json
  fs.writeFileSync(path.join(AUDITS_DIR, 'masterImageIdentityIndex.json'), JSON.stringify({ generatedAt: timestamp, index: imageHashIndex }, null, 2));

  console.log('Saved all baseline audit files cleanly to server/src/data/audits/');
  await disconnectDB();
}

runAuditBaseline().catch(err => {
  console.error('Error running baseline audit:', err);
  process.exit(1);
});
