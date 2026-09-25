import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { Marketplace } from '../models/Marketplace.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trend-tech';

async function validateCatalog() {
  await mongoose.connect(MONGODB_URI);
  console.log('🔍 Running Master Product Catalog Validation Suite...\n');

  const products = await Product.find({}).lean();
  const totalProducts = products.length;

  let productsWithImages = 0;
  let missingImages = 0;
  let brokenImages = 0;
  let potentialAccessories = 0;
  let potentialMismatches = 0;

  const imageMap = {};
  const nameMap = {};
  let duplicateProducts = 0;

  const accessoryTerms = ['case', 'cover', 'screen protector', 'tempered glass', 'charger', 'charging cable', 'adapter', 'power bank', 'holder', 'stand', 'sleeve', 'replacement'];
  const genericStockPatterns = ['unsplash.com/photo-1511707171634', 'placeholder', 'dummy', 'generic'];

  for (const p of products) {
    // Check product duplicates
    const normName = p.name.toLowerCase().trim();
    if (nameMap[normName]) {
      duplicateProducts++;
    } else {
      nameMap[normName] = true;
    }

    // Check images
    if (!p.image) {
      missingImages++;
    } else {
      productsWithImages++;

      if (!p.image.startsWith('http://') && !p.image.startsWith('https://')) {
        brokenImages++;
      }

      if (!imageMap[p.image]) {
        imageMap[p.image] = [];
      }
      imageMap[p.image].push(p.name);
    }

    // Check accessories in main categories
    const lowerName = p.name.toLowerCase();
    const isAccessoryTerm = accessoryTerms.some(t => lowerName.includes(t));
    if (isAccessoryTerm && p.category !== 'accessories') {
      potentialAccessories++;
    }

    // Check generic/mismatched image patterns
    if (p.image) {
      const isGenericPattern = genericStockPatterns.some(pat => p.image.includes(pat));
      if (isGenericPattern && p.category === 'television') {
        potentialMismatches++;
      }
    }
  }

  const uniqueImages = Object.keys(imageMap).length;
  let duplicateImages = 0;
  for (const [url, prods] of Object.entries(imageMap)) {
    const distinctNames = new Set(prods);
    if (distinctNames.size > 1) {
      duplicateImages++;
    }
  }

  const totalMarketplaceOffers = await MarketplaceProduct.countDocuments();
  const totalMarketplaces = await Marketplace.countDocuments();

  console.log('==============================================');
  console.log('         PRODUCT CATALOG VALIDATION           ');
  console.log('==============================================');
  console.log(`Total products:                ${totalProducts}`);
  console.log(`Products with images:          ${productsWithImages}`);
  console.log(`Missing images:                ${missingImages}`);
  console.log(`Broken images:                 ${brokenImages}`);
  console.log(`Unique images:                 ${uniqueImages}`);
  console.log(`Duplicate images across prods: ${duplicateImages}`);
  console.log(`Potential mismatches:          ${potentialMismatches}`);
  console.log(`Potential accessories in main: ${potentialAccessories}`);
  console.log(`Duplicate product identities:  ${duplicateProducts}`);
  console.log(`Total marketplace offers:      ${totalMarketplaceOffers}`);
  console.log(`Active marketplaces:           ${totalMarketplaces}`);
  console.log('==============================================\n');

  await mongoose.disconnect();
}

validateCatalog().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
