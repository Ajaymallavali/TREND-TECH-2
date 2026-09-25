import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

async function performAudit() {
  await connectDB();

  const productCount = await Product.countDocuments();
  const categories = await Product.distinct('category');
  const marketplaceCount = await Marketplace.countDocuments();
  const marketplaceProductCount = await MarketplaceProduct.countDocuments();
  const priceHistoryCount = await PriceHistory.countDocuments();

  const products = await Product.find({}).lean();
  let productImageCount = 0;
  let missingImageCount = 0;
  let brokenImageCount = 0;

  const urlToProductsMap = {};

  for (const p of products) {
    const img = p.image ? p.image.trim() : null;
    if (img && img !== 'null' && img !== 'undefined') {
      productImageCount++;
      if (!urlToProductsMap[img]) urlToProductsMap[img] = [];
      urlToProductsMap[img].push(p.name);

      try {
        const u = new URL(img);
        if (!['http:', 'https:'].includes(u.protocol)) {
          brokenImageCount++;
        }
      } catch {
        brokenImageCount++;
      }
    } else {
      missingImageCount++;
    }
  }

  let duplicateImageCount = 0;
  const duplicateUrlMap = {};
  for (const [url, names] of Object.entries(urlToProductsMap)) {
    const uniqueNames = new Set(names);
    if (uniqueNames.size > 1) {
      duplicateImageCount++;
      duplicateUrlMap[url] = Array.from(uniqueNames);
    }
  }

  const result = {
    productCount,
    categoryCount: categories.length,
    distinctCategories: categories,
    marketplaceCount,
    marketplaceProductCount,
    priceHistoryCount,
    productImageCount,
    missingImageCount,
    brokenImageCount,
    duplicateImageCount,
    duplicateUrlMap,
  };

  console.log(JSON.stringify(result, null, 2));
  await disconnectDB();
}

performAudit().catch(console.error);
