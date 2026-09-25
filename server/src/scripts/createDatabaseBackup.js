import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { Marketplace } from '../models/Marketplace.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const BACKUP_DIR = path.join(__dirname, '../data/backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup() {
  console.log('================================================================');
  console.log('TREND-TECH-2 — DATABASE BACKUP & BASELINE AUDIT');
  console.log('================================================================');

  await connectDB();

  const products = await Product.find({}).lean();
  const mpProducts = await MarketplaceProduct.find({}).lean();
  const priceHistories = await PriceHistory.find({}).lean();
  const marketplaces = await Marketplace.find({}).lean();

  const backupData = {
    timestamp: new Date().toISOString(),
    counts: {
      products: products.length,
      marketplaceProducts: mpProducts.length,
      priceHistory: priceHistories.length,
      marketplaces: marketplaces.length
    },
    products,
    marketplaceProducts: mpProducts,
    priceHistories,
    marketplaces
  };

  const backupFilePath = path.join(BACKUP_DIR, 'mongodbCatalogBackup.json');
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

  console.log(`✅ Backup successfully created at: ${backupFilePath}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- MarketplaceProducts: ${mpProducts.length}`);
  console.log(`- PriceHistory: ${priceHistories.length}`);
  console.log(`- Marketplaces: ${marketplaces.length}`);

  await disconnectDB();
}

createBackup().catch(err => {
  console.error('Backup creation error:', err);
  process.exit(1);
});
