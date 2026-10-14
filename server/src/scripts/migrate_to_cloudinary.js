import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ffjt1wkl',
  api_key: process.env.CLOUDINARY_API_KEY || '886124727776774',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const products = await Product.find({ 
    imageStatus: 'VERIFIED_EXACT', 
    image: { $regex: /^\/product-images/ }
  }).lean();

  console.log(`Found ${products.length} local exact images to migrate to Cloudinary.`);

  let successCount = 0;
  let failCount = 0;

  for (const p of products) {
    try {
      // Reconstruct local path
      // image is like "/product-images/Apple/6aa06056af8879d815dca970/primary.jpg"
      const relativePath = p.image.replace(/^\/?product-images\//, '');
      const localPath = path.join(__dirname, '../data/product-images', relativePath);

      if (!fs.existsSync(localPath)) {
        console.warn(`File missing for ${p._id}: ${localPath}`);
        failCount++;
        continue;
      }

      console.log(`Uploading ${p._id} (${p.brand} ${p.name})...`);

      const uploadResult = await cloudinary.uploader.upload(localPath, {
        folder: 'trend-tech/products',
        public_id: `${p._id}_primary`,
        overwrite: true,
      });

      // Update DB
      await Product.updateOne({ _id: p._id }, {
        $set: {
          image: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id
        }
      });
      console.log(`Success: ${uploadResult.secure_url}`);
      successCount++;
      
      // Optional: don't bombard API
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.error(`Failed to upload ${p._id}:`, error.message || error);
      failCount++;
    }
  }

  console.log(`Migration complete. Success: ${successCount}, Failures: ${failCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
