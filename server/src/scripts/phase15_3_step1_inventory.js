import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = 'mongodb://localhost:27017/trend-tech';

async function runInventory() {
  await mongoose.connect(MONGO_URI);

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));
  
  const products = await Product.find({}).lean();
  
  const inventory = {
    totalProducts: products.length,
    brands: {}
  };

  for (const p of products) {
    const rawBrand = p.brand || 'Unknown';
    if (!inventory.brands[rawBrand]) {
      inventory.brands[rawBrand] = {
        count: 0,
        categories: {},
        productTypes: {},
        identityStates: {}
      };
    }
    
    const b = inventory.brands[rawBrand];
    b.count++;
    
    const cat = p.category || 'Unknown';
    b.categories[cat] = (b.categories[cat] || 0) + 1;
    
    const pt = p.productType || 'Unknown';
    b.productTypes[pt] = (b.productTypes[pt] || 0) + 1;
    
    const idState = p.identityStatus || 'UNVERIFIED';
    b.identityStates[idState] = (b.identityStates[idState] || 0) + 1;
  }

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const jsonPath = path.join(auditDir, 'phase15_3CatalogInventory.json');
  fs.writeFileSync(jsonPath, JSON.stringify(inventory, null, 2));

  // Build MD
  let md = `# Phase 15.3 Catalog Inventory\n\n`;
  md += `Total Products: ${inventory.totalProducts}\n\n`;
  
  const sortedBrands = Object.keys(inventory.brands).sort((a, b) => inventory.brands[b].count - inventory.brands[a].count);
  
  md += `## Brand Discovery\n\n`;
  for (const bName of sortedBrands) {
    const b = inventory.brands[bName];
    md += `### ${bName}\n`;
    md += `- **Products**: ${b.count}\n`;
    md += `- **Categories**: ${Object.entries(b.categories).map(([k,v]) => `${k}(${v})`).join(', ')}\n`;
    md += `- **Types**: ${Object.entries(b.productTypes).map(([k,v]) => `${k}(${v})`).join(', ')}\n`;
    md += `- **States**: ${Object.entries(b.identityStates).map(([k,v]) => `${k}(${v})`).join(', ')}\n\n`;
  }

  const mdPath = path.join(auditDir, 'phase15_3CatalogInventory.md');
  fs.writeFileSync(mdPath, md);

  console.log(`Inventory generated: ${products.length} products processed.`);
  process.exit(0);
}

runInventory().catch(console.error);
