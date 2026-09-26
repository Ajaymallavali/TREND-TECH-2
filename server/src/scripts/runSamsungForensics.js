import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const allSamsung = await db.collection('products').find({ brand: /samsung/i }).toArray();
  const verifiedIds = new Set([
    '6a9904e369652590e0aadc01', // Galaxy S24 Ultra
    '6a9904e369652590e0aadc03', // Galaxy Z Fold 5
    '6a9904e369652590e0aadc04', // Galaxy Tab S9 Ultra
    '6a9904e369652590e0aadc05', // Galaxy Watch 6
    '6aa06057af8879d815dcab20', // Samsung 65" OLED 4K (S95D)
    '6aa06057af8879d815dcadcf'  // Galaxy Buds3 Pro
  ]);

  const candidates = allSamsung.filter(p => !verifiedIds.has(p._id.toString()));

  console.log(`Found ${candidates.length} candidate Samsung products`);

  const forensics = [];

  for (const p of candidates) {
    const mps = await db.collection('marketplaceproducts').find({ productId: p._id }).toArray();
    const phs = await db.collection('pricehistories').find({ productId: p._id }).toArray();

    const entry = {
      product: p,
      marketplaceProducts: mps,
      priceHistories: phs
    };
    forensics.push(entry);
  }

  // Also check if any MarketplaceProducts match brand "Samsung" or title matching candidate names even if productId isn't linked
  const allMps = await db.collection('marketplaceproducts').find({}).toArray();
  console.log(`Total MarketplaceProducts in DB: ${allMps.length}`);
  
  const samsungMps = allMps.filter(mp => mp.title && mp.title.toLowerCase().includes('samsung'));
  console.log(`MarketplaceProducts containing 'samsung' in title: ${samsungMps.length}`);

  for (const smp of samsungMps) {
    console.log(`[Samsung MP] ID: ${smp._id} | ProductId: ${smp.productId} | Title: ${smp.title} | ImageURL: ${smp.imageUrl}`);
  }

  // Save forensic inspection output
  const jsonPath = path.join(__dirname, '../data/audits/samsungEvidenceForensics.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(forensics, null, 2));

  let mdContent = `# SAMSUNG EVIDENCE FORENSICS REPORT\n\n`;
  mdContent += `**Generated At**: ${new Date().toISOString()}\n`;
  mdContent += `**Total Candidate Products Inspected**: ${candidates.length}\n\n`;
  mdContent += `## Candidate Inspection Detail\n\n`;

  for (const item of forensics) {
    const p = item.product;
    mdContent += `### ${p.name} (\`${p._id}\`)\n`;
    mdContent += `- **Brand**: ${p.brand}\n`;
    mdContent += `- **Category**: ${p.category}\n`;
    mdContent += `- **Description**: ${p.description || 'N/A'}\n`;
    mdContent += `- **Features**: ${p.features ? p.features.join(', ') : 'N/A'}\n`;
    mdContent += `- **Tags**: ${p.tags ? p.tags.join(', ') : 'N/A'}\n`;
    mdContent += `- **Existing DB Image**: ${p.image || 'null'}\n`;
    mdContent += `- **Existing DB ImageStatus**: ${p.imageStatus || 'N/A'}\n`;
    mdContent += `- **Linked MarketplaceProducts**: ${item.marketplaceProducts.length}\n`;
    if (item.marketplaceProducts.length > 0) {
      for (const mp of item.marketplaceProducts) {
        mdContent += `  - **MP Title**: ${mp.title}\n`;
        mdContent += `  - **MP ProductURL**: ${mp.productUrl || 'N/A'}\n`;
        mdContent += `  - **MP ImageURL**: ${mp.imageUrl || 'N/A'}\n`;
        mdContent += `  - **MP ASIN/SKU**: ${mp.asin || mp.sku || 'N/A'}\n`;
      }
    } else {
      mdContent += `  - *No linked MarketplaceProduct records found in MongoDB for this productId.*\n`;
    }
    mdContent += `\n---\n\n`;
  }

  const mdPath = path.join(__dirname, '../data/audits/samsungEvidenceForensics.md');
  fs.writeFileSync(mdPath, mdContent);
  console.log('Forensics written to samsungEvidenceForensics.json and .md');

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
