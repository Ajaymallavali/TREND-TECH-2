import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { determineProductCategory, isUserFacingProductEligible } from '../utils/categoryMapper.js';
import { getExactProductImageDetails } from '../services/imagePipeline.service.js';

dotenv.config({ path: 'server/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCategoryIntegrityAudit() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trend-tech';
  await mongoose.connect(mongoUri);

  const products = await Product.find({});
  const offers = await MarketplaceProduct.find({});

  const validProducts = [];
  const misclassifiedProducts = [];
  const syntheticTemplateProducts = [];
  const categoryCounts = {};

  for (const p of products) {
    const storedCat = p.category;
    const detectedCat = determineProductCategory(p);
    const isEligible = isUserFacingProductEligible(p);
    const imgDetails = getExactProductImageDetails(p);

    const productOffers = offers.filter((o) => o.product && o.product.toString() === p._id.toString());

    const itemReport = {
      id: p._id.toString(),
      name: p.name,
      brand: p.brand,
      storedCategory: storedCat,
      detectedCategory: detectedCat,
      isUserFacingEligible: isEligible,
      imageStatus: imgDetails.imageStatus,
      imageUrl: imgDetails.url,
      offerCount: productOffers.length,
    };

    if (!isEligible) {
      syntheticTemplateProducts.push(itemReport);
    } else if (storedCat !== detectedCat) {
      misclassifiedProducts.push(itemReport);
    } else {
      validProducts.push(itemReport);
    }

    categoryCounts[detectedCat] = (categoryCounts[detectedCat] || 0) + 1;
  }

  const reportData = {
    generatedAt: new Date().toISOString(),
    totalProductsInDB: products.length,
    totalOffersInDB: offers.length,
    validCategoryProductsCount: validProducts.length,
    misclassifiedProductsCount: misclassifiedProducts.length,
    syntheticTemplateProductsCount: syntheticTemplateProducts.length,
    categoryBreakdown: categoryCounts,
    sampleMisclassified: misclassifiedProducts.slice(0, 10),
    sampleSynthetic: syntheticTemplateProducts.slice(0, 10),
  };

  const outputDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'categoryIntegrityReport.json');
  fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));

  console.log('Category Integrity Audit Completed Successfully.');
  console.log('Total Products:', products.length);
  console.log('Valid Products:', validProducts.length);
  console.log('Misclassified Products:', misclassifiedProducts.length);
  console.log('Synthetic Templates:', syntheticTemplateProducts.length);
  console.log('Report saved to:', outputPath);

  await mongoose.disconnect();
}

runCategoryIntegrityAudit().catch((err) => {
  console.error('Audit Error:', err);
  process.exit(1);
});
