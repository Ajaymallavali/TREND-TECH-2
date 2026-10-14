import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const trendDir = 'C:\\Users\\ajaym\\Downloads\\Trend';

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

async function testMapping() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const mongoProducts = await mongoose.connection.db.collection('products').find({}).toArray();

  const app = initializeApp({
    credential: applicationDefault(),
    projectId: 'trend-tech-2-c174c'
  }, 'auditApp');
  const firestoreDb = getFirestore(app);

  const firestoreSnap = await firestoreDb.collection('products').get();
  const firestoreProducts = [];
  firestoreSnap.forEach(d => firestoreProducts.push({ id: d.id, ...d.data() }));

  const images = getAllImages(trendDir);
  console.log(`Total local images in Trend: ${images.length}`);
  console.log(`Total MongoDB products: ${mongoProducts.length}`);
  console.log(`Total Firestore products: ${firestoreProducts.length}`);

  // Build lookup maps
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

  const matches = [];
  const unmatched = [];

  for (const img of images) {
    const norm = normalizeKey(img.filename);
    let mongoProd = mongoMapByNormName.get(norm);
    let firestoreProd = firestoreMapByNormName.get(norm);

    // If not direct, search with partial contains
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
      matches.push({
        image: img,
        productId: targetId,
        mongoName: mongoProd?.name,
        firestoreName: firestoreProd?.name
      });
    } else {
      unmatched.push(img);
    }
  }

  console.log(`\n✅ Matched: ${matches.length} / ${images.length}`);
  if (unmatched.length > 0) {
    console.log(`❌ Unmatched: ${unmatched.length}`);
    unmatched.forEach(u => console.log(`   - ${u.filename}`));
  }

  console.log('\nSample Matches:');
  matches.slice(0, 10).forEach(m => {
    console.log(`File: ${m.image.filename} -> ID: ${m.productId} | Name: ${m.mongoName || m.firestoreName}`);
  });

  process.exit(0);
}

testMapping().catch(console.error);
