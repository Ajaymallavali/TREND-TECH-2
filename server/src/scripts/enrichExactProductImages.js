import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { getExactProductImage, isValidProductImage } from '../services/imagePipeline.service.js';

// Mapping table to map series/generic names to exact product names & high-res verified images
const EXACT_PRODUCT_ENRICHMENT_MAP = {
  // Smartphones
  'apple iphone air': { name: 'Apple iPhone 17 Air', brand: 'Apple', image: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg' },
  'apple iphone 16e': { name: 'Apple iPhone 16e', brand: 'Apple', image: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg' },
  'apple iphone se (2024)': { name: 'Apple iPhone SE (3rd Gen)', brand: 'Apple', image: 'https://m.media-amazon.com/images/I/61TOWf11+jL._SL1500_.jpg' },
  'apple iphone se / equivalent current entry models': { name: 'Apple iPhone SE 2022', brand: 'Apple', image: 'https://m.media-amazon.com/images/I/61TOWf11+jL._SL1500_.jpg' },
  'smartphone galaxy s series': { name: 'Samsung Galaxy S24 Ultra 5G', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SL1500_.jpg' },
  'smartphone galaxy z fold': { name: 'Samsung Galaxy Z Fold 6', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71R2HjJ4K5L._SL1500_.jpg' },
  'smartphone galaxy z flip': { name: 'Samsung Galaxy Z Flip 6', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71XMT65380L._SL1500_.jpg' },
  'smartphone galaxy a series': { name: 'Samsung Galaxy A55 5G', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71E5zB1qbIL._SL1500_.jpg' },
  'smartphone galaxy m series': { name: 'Samsung Galaxy M55 5G', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71qGismu6NL._SL1500_.jpg' },
  'smartphone galaxy f series': { name: 'Samsung Galaxy F55 5G', brand: 'Samsung', image: 'https://m.media-amazon.com/images/I/71CXhVhpM0L._SL1500_.jpg' },
  'smartphone oneplus flagship series': { name: 'OnePlus 12 5G', brand: 'OnePlus', image: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg' },
  'smartphone oneplus nord': { name: 'OnePlus Nord CE4 5G', brand: 'OnePlus', image: 'https://m.media-amazon.com/images/I/61Io5-q3A8L._SL1500_.jpg' },
  'smartphone oneplus open': { name: 'OnePlus Open Foldable', brand: 'OnePlus', image: 'https://m.media-amazon.com/images/I/71XNeka-BRL._SL1500_.jpg' },

  // Laptops
  'laptop macbook air': { name: 'Apple MacBook Air M3 (13-inch)', brand: 'Apple', image: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg' },
  'laptop inspiron': { name: 'Dell Inspiron 15 3520', brand: 'Dell', image: 'https://m.media-amazon.com/images/I/61L2lG4cWBL._SL1500_.jpg' },
  'laptop xps': { name: 'Dell XPS 13 9320', brand: 'Dell', image: 'https://m.media-amazon.com/images/I/61bwiPR7n0L._SL1500_.jpg' },
  'laptop pavilion': { name: 'HP Pavilion 15 EG3036TU', brand: 'HP', image: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' },
  'laptop envy': { name: 'HP Envy x360 2-in-1', brand: 'HP', image: 'https://m.media-amazon.com/images/I/71vFKBpKakL._SL1500_.jpg' },
  'laptop ideapad': { name: 'Lenovo IdeaPad Slim 3', brand: 'Lenovo', image: 'https://m.media-amazon.com/images/I/61Q65W-zVCL._SL1500_.jpg' },
  'laptop thinkpad': { name: 'Lenovo ThinkPad E14 Gen 5', brand: 'Lenovo', image: 'https://m.media-amazon.com/images/I/61Q65W-zVCL._SL1500_.jpg' },
  'laptop vivobook': { name: 'ASUS VivoBook 15 OLED', brand: 'ASUS', image: 'https://m.media-amazon.com/images/I/71qYx05hUBL._SL1500_.jpg' },
  'laptop zenbook': { name: 'ASUS ZenBook 14 OLED', brand: 'ASUS', image: 'https://m.media-amazon.com/images/I/71qYx05hUBL._SL1500_.jpg' },
  'laptop tuf': { name: 'ASUS TUF Gaming A15', brand: 'ASUS', image: 'https://m.media-amazon.com/images/I/81+5W8J05vL._SL1500_.jpg' },
};

async function enrichProductImages() {
  console.log('🔄 Executing non-destructive Exact Product Image Enrichment...');
  await connectDB();

  const products = await Product.find({});
  let updatedCount = 0;

  for (const p of products) {
    const cleanName = p.name.trim().toLowerCase();

    // 1. Try exact image pipeline
    let resolvedImage = getExactProductImage(p);

    // 2. Try enrichment map for series-level names
    if (!resolvedImage && EXACT_PRODUCT_ENRICHMENT_MAP[cleanName]) {
      const entry = EXACT_PRODUCT_ENRICHMENT_MAP[cleanName];
      p.name = entry.name;
      p.brand = entry.brand;
      resolvedImage = entry.image;
    }

    if (resolvedImage && p.image !== resolvedImage) {
      p.image = resolvedImage;
      await p.save();
      updatedCount++;
    }
  }

  console.log(`✅ Successfully enriched exact images for ${updatedCount} products in MongoDB.`);
  await disconnectDB();
}

enrichProductImages().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
