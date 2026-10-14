import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ffjt1wkl',
  api_key: process.env.CLOUDINARY_API_KEY || '886124727776774',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const trendDir = 'C:\\Users\\ajaym\\Downloads\\Trend';
const checkpointFile = path.resolve('server/scripts/trend_upload_checkpoint.json');

function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImages(full));
    } else if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
      results.push({ filename: file, fullPath: full, dir: path.basename(dir) });
    }
  }
  return results;
}

function normalizeKey(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^unknown[_\s-]*/i, '')
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/&/g, '')
    .replace(/[_\s-]+/g, ' ')
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function uploadToCloudinaryWithRetry(filePath, publicId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'trend-tech/products',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      });
      return result.secure_url;
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[Retry ${attempt}/${retries}] Upload failed for ${path.basename(filePath)}: ${err.message}. Waiting 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function run() {
  console.log('🚀 ========================================================');
  console.log('🚀 UPLOADING TREND IMAGES TO CLOUDINARY & FIREBASE');
  console.log('🚀 ========================================================\n');

  // Load or initialize checkpoint
  let checkpoint = {};
  if (fs.existsSync(checkpointFile)) {
    try {
      checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
      console.log(`📦 Loaded checkpoint with ${Object.keys(checkpoint).length} previously uploaded images.`);
    } catch {
      checkpoint = {};
    }
  }

  // Connect to MongoDB
  console.log('1. Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const mongoDb = mongoose.connection.db;
  const mongoProducts = await mongoDb.collection('products').find({}).toArray();
  console.log(`   Connected! Found ${mongoProducts.length} MongoDB products.`);

  // Connect to Firebase Firestore
  console.log('2. Connecting to Firebase Firestore (trend-tech-2-c174c)...');
  const firebaseApp = initializeApp({
    credential: applicationDefault(),
    projectId: 'trend-tech-2-c174c'
  }, 'trendUploadApp');
  const firestoreDb = getFirestore(firebaseApp);
  const firestoreSnap = await firestoreDb.collection('products').get();
  const firestoreProducts = [];
  firestoreSnap.forEach(d => firestoreProducts.push({ id: d.id, ...d.data() }));
  console.log(`   Connected! Found ${firestoreProducts.length} Firestore products.`);

  // Build product lookup maps
  const mongoMapByNormName = new Map();
  const mongoMapById = new Map();
  for (const p of mongoProducts) {
    const id = p._id.toString();
    mongoMapById.set(id, p);
    mongoMapByNormName.set(normalizeKey(p.name), p);
    if (p.model) mongoMapByNormName.set(normalizeKey(p.model), p);
  }

  const firestoreMapById = new Map();
  const firestoreMapByNormName = new Map();
  for (const p of firestoreProducts) {
    firestoreMapById.set(p.id, p);
    firestoreMapByNormName.set(normalizeKey(p.name), p);
    if (p.model) firestoreMapByNormName.set(normalizeKey(p.model), p);
  }

  // Load and map local images
  const allImages = getAllImages(trendDir);
  console.log(`\n3. Mapping ${allImages.length} images from ${trendDir}...`);

  const taskList = [];
  for (const img of allImages) {
    const norm = normalizeKey(img.filename);
    let mongoProd = mongoMapByNormName.get(norm);
    let firestoreProd = firestoreMapByNormName.get(norm);

    if (!mongoProd) {
      for (const p of mongoProducts) {
        const pn = normalizeKey(p.name);
        if (pn === norm || (norm.length > 5 && pn.includes(norm)) || (pn.length > 5 && norm.includes(pn))) {
          mongoProd = p;
          break;
        }
      }
    }

    if (!firestoreProd && mongoProd) {
      firestoreProd = firestoreMapById.get(mongoProd._id.toString());
    }

    if (mongoProd || firestoreProd) {
      const targetId = (mongoProd?._id || firestoreProd?.id).toString();
      taskList.push({
        image: img,
        productId: targetId,
        productName: mongoProd?.name || firestoreProd?.name,
      });
    } else {
      console.warn(`   ⚠️ Could not map file: ${img.filename}`);
    }
  }

  console.log(`   ✅ Successfully mapped ${taskList.length} / ${allImages.length} images.`);

  // Upload and synchronize with concurrency
  console.log('\n4. Starting Cloudinary uploads & Firebase / MongoDB sync...');
  const BATCH_SIZE = 4;
  let completed = 0;
  let newlyUploaded = 0;
  let reusedCheckpoint = 0;

  for (let i = 0; i < taskList.length; i += BATCH_SIZE) {
    const batch = taskList.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (task) => {
      const { image, productId, productName } = task;
      const cleanBaseName = image.filename.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/^unknown[_\s-]*/i, '');
      const publicId = `${productId}_${cleanBaseName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

      let cloudinaryUrl = checkpoint[image.fullPath];

      if (!cloudinaryUrl) {
        cloudinaryUrl = await uploadToCloudinaryWithRetry(image.fullPath, publicId);
        checkpoint[image.fullPath] = cloudinaryUrl;
        newlyUploaded++;
      } else {
        reusedCheckpoint++;
      }

      // Update Firebase Firestore
      await firestoreDb.collection('products').doc(productId).set({
        image: cloudinaryUrl,
        imageStatus: 'VERIFIED',
        imageUpdatedAt: new Date().toISOString()
      }, { merge: true });

      // Update MongoDB
      await mongoDb.collection('products').updateOne(
        { _id: new mongoose.Types.ObjectId(productId) },
        {
          $set: {
            image: cloudinaryUrl,
            imageStatus: 'VERIFIED',
            imageUpdatedAt: new Date()
          }
        }
      );

      completed++;
    }));

    // Save checkpoint progress
    fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2), 'utf8');

    const pct = Math.round((completed / taskList.length) * 100);
    console.log(`   ⏳ Progress: ${completed}/${taskList.length} (${pct}%) [New uploads: ${newlyUploaded}, Reused: ${reusedCheckpoint}]`);
  }

  console.log('\n🎉 ========================================================');
  console.log('🎉 ALL IMAGES SUCCESSFULLY UPLOADED & SYNCED!');
  console.log(`🎉 Total Processed: ${completed}`);
  console.log(`🎉 New Cloudinary Uploads: ${newlyUploaded}`);
  console.log(`🎉 Reused Checkpoint: ${reusedCheckpoint}`);
  console.log('🎉 ========================================================\n');

  // Verify Sample Products
  console.log('--- VERIFICATION SAMPLES ---');
  const sampleTasks = [taskList[0], taskList[Math.floor(taskList.length / 2)], taskList[taskList.length - 1]];
  for (const st of sampleTasks) {
    const fsDoc = await firestoreDb.collection('products').doc(st.productId).get();
    const mgDoc = await mongoDb.collection('products').findOne({ _id: new mongoose.Types.ObjectId(st.productId) });
    console.log(`Product: [${st.productId}] ${st.productName}`);
    console.log(`  Firestore Image: ${fsDoc.data()?.image}`);
    console.log(`  MongoDB Image:   ${mgDoc?.image}`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
