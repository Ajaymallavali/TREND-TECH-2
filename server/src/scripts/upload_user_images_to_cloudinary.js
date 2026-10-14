import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ffjt1wkl',
  api_key: process.env.CLOUDINARY_API_KEY || '886124727776774',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech');
  console.log('MongoDB connected.');

  const { Product } = await import('../models/Product.model.js');
  const allProducts = await Product.find({}).lean();
  console.log(`Loaded ${allProducts.length} products from database.`);

  const imgDir = "C:\\Users\\ajaym\\Downloads\\img's";
  const files = fs.readdirSync(imgDir);
  console.log(`Found ${files.length} images in "${imgDir}".`);

  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/[\/\\]/g, ' ')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const tasks = [];

  for (const file of files) {
    const ext = path.extname(file);
    let base = path.basename(file, ext).trim();
    base = base.replace(/^-\s*/, '').trim();

    const normBase = normalize(base);
    let candidate = null;

    // 1. Direct match on name, brand + name, name + brand
    candidate = allProducts.find(p => {
      const nName = normalize(p.name);
      const nBrandName = normalize(`${p.brand} ${p.name}`);
      const nNameBrand = normalize(`${p.name} ${p.brand}`);
      return normBase === nName || normBase === nBrandName || normBase === nNameBrand;
    });

    // 2. Strip UNKNOWN
    if (!candidate && base.startsWith('UNKNOWN ')) {
      const rest = base.replace(/^UNKNOWN\s+/, '').trim();
      const nRest = normalize(rest);
      candidate = allProducts.find(p => {
        const nName = normalize(p.name);
        return nRest === nName || nRest === normalize(`${p.category} ${p.name}`);
      });
    }

    // 3. Strip known brand
    if (!candidate) {
      for (const p of allProducts) {
        if (p.brand && p.brand !== 'UNKNOWN' && base.toLowerCase().startsWith(p.brand.toLowerCase())) {
          const rest = base.substring(p.brand.length).trim();
          if (normalize(rest) === normalize(p.name)) {
            candidate = p;
            break;
          }
        }
      }
    }

    // 4. Substring match
    if (!candidate) {
      candidate = allProducts.find(p => {
        const nName = normalize(p.name);
        return normBase.includes(nName) && nName.length > 5;
      });
    }

    // 5. Compact no-space match
    if (!candidate) {
      const compactBase = normBase.replace(/\s+/g, '').replace(/^unknown/, '');
      candidate = allProducts.find(p => {
        const compactName = normalize(p.name).replace(/\s+/g, '');
        return compactBase === compactName || compactBase.includes(compactName);
      });
    }

    if (candidate) {
      tasks.push({
        filePath: path.join(imgDir, file),
        fileName: file,
        product: candidate
      });
    } else {
      console.warn(`WARNING: No product match found for file: "${file}"`);
    }
  }

  console.log(`\nSuccessfully prepared ${tasks.length}/${files.length} upload tasks.`);

  // Upload in concurrent batches of 5
  const CONCURRENCY = 5;
  let completed = 0;
  let successCount = 0;
  let failCount = 0;
  const auditLog = [];

  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (task) => {
      const { filePath, fileName, product } = task;
      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          folder: 'trend-tech/products',
          public_id: `${product._id}_primary`,
          overwrite: true
        });

        // Update MongoDB product
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              image: uploadRes.secure_url,
              imageSourceUrl: uploadRes.secure_url,
              imageSource: 'Cloudinary',
              imageStatus: 'VERIFIED_EXACT',
              imageVerifiedAt: new Date(),
              imageVerifiedProductName: product.name,
              imageVerifiedBrand: product.brand,
              imageVerifiedCategory: product.category,
              imageWidth: uploadRes.width,
              imageHeight: uploadRes.height,
              imageMimeType: `image/${uploadRes.format}`,
              imageVerificationReason: 'User provided exact product image uploaded to Cloudinary',
              cloudinaryId: uploadRes.public_id
            }
          }
        );

        completed++;
        successCount++;
        console.log(`[${completed}/${tasks.length}] SUCCESS: "${fileName}" -> [${product.brand}] "${product.name}" (${uploadRes.secure_url})`);

        auditLog.push({
          productId: product._id,
          brand: product.brand,
          name: product.name,
          category: product.category,
          fileName,
          cloudinaryUrl: uploadRes.secure_url,
          status: 'SUCCESS'
        });
      } catch (err) {
        completed++;
        failCount++;
        console.error(`[${completed}/${tasks.length}] FAILED: "${fileName}" -> Error:`, err.message || err);
        auditLog.push({
          productId: product._id,
          brand: product.brand,
          name: product.name,
          fileName,
          error: err.message,
          status: 'FAILED'
        });
      }
    }));
  }

  console.log(`\n========================================`);
  console.log(`Upload process finished!`);
  console.log(`Total Uploaded & Linked: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`========================================\n`);

  // Write audit log file
  const auditPath = path.join(__dirname, '../../data/cloudinary_upload_audit.json');
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));
  console.log(`Saved audit log to: ${auditPath}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
