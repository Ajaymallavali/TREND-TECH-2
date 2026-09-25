import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { PriceAlert } from '../models/PriceAlert.model.js';
import { Wishlist } from '../models/Wishlist.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../../data/backups');

export async function runBackup(shouldDisconnect = true) {
  console.log('📦 Starting non-destructive MongoDB backup...');
  await connectDB();

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionBackupDir = path.join(BACKUP_DIR, `backup-${timestamp}`);
  fs.mkdirSync(sessionBackupDir, { recursive: true });

  const collections = [
    { name: 'products', model: Product },
    { name: 'marketplaces', model: Marketplace },
    { name: 'marketplaceproducts', model: MarketplaceProduct },
    { name: 'pricehistories', model: PriceHistory },
    { name: 'pricealerts', model: PriceAlert },
    { name: 'wishlists', model: Wishlist },
  ];

  const results = {};
  for (const col of collections) {
    const docs = await col.model.find({}).lean();
    const filePath = path.join(sessionBackupDir, `${col.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    results[col.name] = docs.length;
    console.log(`  └─ Backed up ${docs.length} documents from ${col.name} -> ${filePath}`);
  }

  console.log(`✅ Backup completed successfully in: ${sessionBackupDir}`);
  if (shouldDisconnect) {
    await disconnectDB();
  }
  return { sessionBackupDir, counts: results };
}

if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  runBackup().catch((err) => {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  });
}

