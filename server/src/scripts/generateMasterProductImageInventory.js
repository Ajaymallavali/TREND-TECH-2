import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { determineProductCategory } from '../utils/categoryMapper.js';
// Helper function to derive model from name and brand
function getModelName(name, brand) {
  if (!name) return 'Unknown';
  let m = name;
  if (brand && m.toLowerCase().startsWith(brand.toLowerCase())) {
    m = m.substring(brand.length).trim();
  }
  return m || name;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const AUDITS_DIR = path.join(__dirname, '../data/audits');
if (!fs.existsSync(AUDITS_DIR)) fs.mkdirSync(AUDITS_DIR, { recursive: true });

async function generateInventory() {
  console.log('================================================================');
  console.log('TREND-TECH — MASTER PRODUCT & IMAGE INVENTORY AUDIT');
  console.log('================================================================');

  await connectDB();

  const totalProducts = await Product.countDocuments();
  const totalMarketplaceProducts = await MarketplaceProduct.countDocuments();
  const totalPriceHistory = await PriceHistory.countDocuments();
  const totalMarketplaces = await Marketplace.countDocuments();

  const rawProducts = await Product.find().lean();
  console.log(`Discovered ${rawProducts.length} MongoDB products.`);

  const inventoryList = [];
  const categoryMap = {};

  for (const p of rawProducts) {
    const id = String(p._id);
    const name = p.name || '';
    const brand = p.brand || 'Unknown';
    const computedCategory = determineProductCategory(p) || p.category || 'electronics';
    const model = p.specs?.get ? p.specs.get('model') : (p.specs?.model || getModelName(name, brand));
    
    const item = {
      id,
      name,
      brand,
      category: computedCategory,
      rawCategory: p.category,
      model: model || name,
      existingImage: p.image || null,
      imageStatus: p.imageStatus || 'UNVERIFIED',
      sourceStatus: p.sourceStatus || 'LEGACY_SYNTHETIC',
      imageSourceUrl: p.imageSourceUrl || null,
      imageSource: p.imageSource || null,
      imageHash: p.imageHash || null,
      imageVerificationReason: p.imageVerificationReason || null
    };

    inventoryList.push(item);

    if (!categoryMap[computedCategory]) categoryMap[computedCategory] = [];
    categoryMap[computedCategory].push(item);
  }

  // Save JSON
  const jsonPath = path.join(AUDITS_DIR, 'masterProductImageInventory.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        counts: {
          totalProducts,
          totalMarketplaceProducts,
          totalPriceHistory,
          totalMarketplaces,
          categoriesCount: Object.keys(categoryMap).length
        },
        products: inventoryList
      },
      null,
      2
    )
  );
  console.log(`Saved JSON inventory to: ${jsonPath}`);

  // Generate Markdown
  let md = `# MASTER PRODUCT IMAGE INVENTORY\n\n`;
  md += `**Generated At**: ${new Date().toISOString()}\n\n`;
  md += `## Baseline Counts\n`;
  md += `- **Products**: ${totalProducts}\n`;
  md += `- **MarketplaceProducts**: ${totalMarketplaceProducts}\n`;
  md += `- **PriceHistory**: ${totalPriceHistory}\n`;
  md += `- **Marketplaces**: ${totalMarketplaces}\n`;
  md += `- **Categories Present**: ${Object.keys(categoryMap).length}\n\n`;

  md += `## Master Inventory Table\n\n`;
  md += `| Product ID | Name | Brand | Category | Model | Existing Image | Image Status | Source Status |\n`;
  md += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;

  for (const item of inventoryList) {
    const imgStr = item.existingImage ? (item.existingImage.length > 40 ? item.existingImage.substring(0, 37) + '...' : item.existingImage) : 'N/A';
    md += `| \`${item.id}\` | ${item.name.replace(/\|/g, '-')} | ${item.brand} | ${item.category} | ${item.model.replace(/\|/g, '-')} | \`${imgStr}\` | \`${item.imageStatus}\` | \`${item.sourceStatus}\` |\n`;
  }

  md += `\n\n## Grouped Inventories by Category\n\n`;

  for (const [cat, items] of Object.entries(categoryMap)) {
    md += `### Category: ${cat.toUpperCase()} (${items.length} Products)\n\n`;
    
    // Group by Brand
    const brandGroup = {};
    for (const item of items) {
      if (!brandGroup[item.brand]) brandGroup[item.brand] = [];
      brandGroup[item.brand].push(item);
    }

    for (const [bName, bItems] of Object.entries(brandGroup)) {
      md += `#### Brand: ${bName} (${bItems.length} Products)\n\n`;
      md += `| Product ID | Name | Model | Image Status | Image Path / URL |\n`;
      md += `| --- | --- | --- | --- | --- |\n`;
      for (const bi of bItems) {
        md += `| \`${bi.id}\` | ${bi.name.replace(/\|/g, '-')} | ${bi.model.replace(/\|/g, '-')} | \`${bi.imageStatus}\` | \`${bi.existingImage || 'N/A'}\` |\n`;
      }
      md += `\n`;
    }
  }

  const mdPath = path.join(AUDITS_DIR, 'masterProductImageInventory.md');
  fs.writeFileSync(mdPath, md);
  console.log(`Saved Markdown inventory to: ${mdPath}`);

  await disconnectDB();
  console.log('Audit completed successfully.');
}

generateInventory().catch((err) => {
  console.error('Error generating inventory:', err);
  process.exit(1);
});
