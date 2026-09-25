import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

async function verifyAndBackup() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB (Read-Only Baseline Check):', MONGODB_URI);

  const db = mongoose.connection.db;

  const productsCount = await db.collection('products').countDocuments();
  const marketplaceProductsCount = await db.collection('marketplaceproducts').countDocuments();
  const marketplacesCount = await db.collection('marketplaces').countDocuments();
  const priceHistoriesCount = await db.collection('pricehistories').countDocuments();

  const baseline = {
    timestamp: new Date().toISOString(),
    expected: {
      products: 867,
      marketplaceproducts: 1181,
      marketplaces: 7,
      pricehistories: 559
    },
    actual: {
      products: productsCount,
      marketplaceproducts: marketplaceProductsCount,
      marketplaces: marketplacesCount,
      pricehistories: priceHistoriesCount
    },
    match: (
      productsCount === 867 &&
      marketplaceProductsCount === 1181 &&
      marketplacesCount === 7 &&
      priceHistoriesCount === 559
    )
  };

  console.log('\n========================================');
  console.log('PHASE 1A — DATABASE BASELINE VERIFICATION');
  console.log('========================================');
  console.log(`Products: Expected = 867, Actual = ${productsCount}`);
  console.log(`MarketplaceProducts: Expected = 1181, Actual = ${marketplaceProductsCount}`);
  console.log(`Marketplaces: Expected = 7, Actual = ${marketplacesCount}`);
  console.log(`PriceHistories: Expected = 559, Actual = ${priceHistoriesCount}`);
  console.log(`Baseline Status: ${baseline.match ? 'PASSED (100% MATCH)' : 'MISMATCH'}`);
  console.log('========================================\n');

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });
  fs.writeFileSync(path.join(auditDir, 'phase1aBaselineCheck.json'), JSON.stringify(baseline, null, 2));

  // Source Backup
  const backupDir = path.join(__dirname, '../../../scratch/source_backup_phase1');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const filesToBackup = [
    'server/src/utils/categoryMapper.js',
    'server/src/utils/productDTO.js',
    'server/src/utils/productIdentity.js',
    'server/src/controllers/product.controller.js',
    'server/src/services/imagePipeline.service.js',
    'server/src/routes/product.routes.js'
  ];

  for (const relPath of filesToBackup) {
    const fullPath = path.join(__dirname, '../../../', relPath);
    if (fs.existsSync(fullPath)) {
      const destPath = path.join(backupDir, path.basename(relPath));
      fs.copyFileSync(fullPath, destPath);
      console.log(`Backed up: ${relPath} -> ${destPath}`);
    }
  }

  await mongoose.disconnect();
}

verifyAndBackup().catch(err => {
  console.error('Phase 1A Baseline Backup Error:', err);
  process.exit(1);
});
