import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { MASTER_CATALOG } from '../data/masterCatalogData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trend-tech';

async function seedMasterCatalog() {
  console.log('🚀 Starting Idempotent Master Catalog Seeding & Repair...');
  await mongoose.connect(MONGODB_URI);

  // 1. Ensure Standard Marketplaces Exist
  const standardMarketplaces = [
    { name: 'Amazon', code: 'amazon', baseUrl: 'https://www.amazon.in', logoUrl: '/assets/marketplaces/amazon.svg' },
    { name: 'Flipkart', code: 'flipkart', baseUrl: 'https://www.flipkart.com', logoUrl: '/assets/marketplaces/flipkart.svg' },
    { name: 'Croma', code: 'croma', baseUrl: 'https://www.croma.com', logoUrl: '/assets/marketplaces/croma.svg' },
    { name: 'Reliance Digital', code: 'reliancedigital', baseUrl: 'https://www.reliancedigital.in', logoUrl: '/assets/marketplaces/reliancedigital.svg' },
    { name: 'Vijay Sales', code: 'vijaysales', baseUrl: 'https://www.vijaysales.com', logoUrl: '/assets/marketplaces/vijaysales.svg' }
  ];

  const marketplaceMap = {};
  for (const mData of standardMarketplaces) {
    let mp = await Marketplace.findOne({ 
      $or: [{ code: mData.code }, { name: mData.name }] 
    });
    if (!mp) {
      mp = await Marketplace.create(mData);
    }
    marketplaceMap[mData.name] = mp._id;
  }

  // 2. Re-categorize accessories in existing database so they don't pollute smartphones/laptops
  const accessoryTerms = ['case', 'cover', 'screen protector', 'tempered glass', 'charger', 'charging cable', 'adapter', 'power bank', 'holder', 'stand', 'sleeve', 'replacement'];
  const existingProducts = await Product.find({});
  let reCategorizedCount = 0;

  for (const p of existingProducts) {
    const lowerName = p.name.toLowerCase();
    const isAccessory = accessoryTerms.some(term => lowerName.includes(term));
    if (isAccessory && p.category !== 'accessories') {
      p.category = 'accessories';
      await p.save();
      reCategorizedCount++;
    }
  }
  console.log(`  🛡️ Re-categorized ${reCategorizedCount} accessory products to 'accessories' category.`);

  // 3. Upsert Master Catalog Products
  let upsertedCount = 0;
  let offersCount = 0;

  for (const item of MASTER_CATALOG) {
    let product = await Product.findOne({ name: item.name });
    if (!product) {
      product = await Product.create({
        name: item.name,
        brand: item.brand,
        description: item.description,
        category: item.category,
        image: item.image,
        specs: item.specs || {},
        tags: item.tags || []
      });
      upsertedCount++;
    } else {
      // Update missing image or specs if better data is provided
      if (!product.image && item.image) {
        product.image = item.image;
      }
      if (item.specs && Object.keys(item.specs).length > 0) {
        product.specs = item.specs;
      }
      await product.save();
    }

    // Upsert Marketplace Offers for this Product
    if (item.offers && item.offers.length > 0) {
      for (const offer of item.offers) {
        const mpId = marketplaceMap[offer.marketplace] || marketplaceMap['Amazon'];
        let mpProduct = await MarketplaceProduct.findOne({
          product: product._id,
          marketplace: mpId
        });

        if (!mpProduct) {
          mpProduct = await MarketplaceProduct.create({
            product: product._id,
            marketplace: mpId,
            url: offer.url,
            currentPrice: offer.price,
            originalPrice: offer.originalPrice || offer.price,
            currency: 'INR',
            isAvailable: true
          });
          offersCount++;
        } else {
          mpProduct.currentPrice = offer.price;
          mpProduct.url = offer.url;
          await mpProduct.save();
        }

        // Add a PriceHistory entry if none exists for this offer
        const existingHistory = await PriceHistory.findOne({ marketplaceProduct: mpProduct._id });
        if (!existingHistory) {
          await PriceHistory.create({
            marketplaceProduct: mpProduct._id,
            price: offer.price,
            recordedAt: new Date()
          });
        }
      }
    }
  }

  console.log(`✅ Master Catalog Seeding Complete!`);
  console.log(`   - New Products Added: ${upsertedCount}`);
  console.log(`   - Marketplace Offers Processed: ${offersCount}`);

  const finalProductCount = await Product.countDocuments();
  console.log(`   - Total Products in DB: ${finalProductCount}`);

  await mongoose.disconnect();
}

seedMasterCatalog().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
