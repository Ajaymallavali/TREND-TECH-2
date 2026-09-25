import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function backup() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const db = mongoose.connection.db;

  const productsCount = await db.collection('products').countDocuments();
  const marketplaceProductsCount = await db.collection('marketplaceproducts').countDocuments();
  const marketplacesCount = await db.collection('marketplaces').countDocuments();
  const priceHistoriesCount = await db.collection('pricehistories').countDocuments();

  const baseline = {
    timestamp: new Date().toISOString(),
    counts: {
      products: productsCount,
      marketplaceproducts: marketplaceProductsCount,
      marketplaces: marketplacesCount,
      pricehistories: priceHistoriesCount
    }
  };

  console.log('\n========================================');
  console.log('PHASE 1 — BASELINE DATABASE BACKUP METRICS');
  console.log('========================================');
  console.log(`Products Count: ${productsCount}`);
  console.log(`MarketplaceProducts Count: ${marketplaceProductsCount}`);
  console.log(`Marketplaces Count: ${marketplacesCount}`);
  console.log(`PriceHistories Count: ${priceHistoriesCount}`);
  console.log('========================================\n');

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const backupPath = path.join(auditDir, 'baselineBackup.json');
  fs.writeFileSync(backupPath, JSON.stringify(baseline, null, 2));
  console.log(`Baseline recorded to: ${backupPath}`);

  await mongoose.disconnect();
}

backup().catch((err) => {
  console.error('Backup error:', err);
  process.exit(1);
});
