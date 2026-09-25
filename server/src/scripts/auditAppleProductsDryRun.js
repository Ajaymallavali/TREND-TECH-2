import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const AUDITS_DIR = path.join(__dirname, '../data/audits');
if (!fs.existsSync(AUDITS_DIR)) {
  fs.mkdirSync(AUDITS_DIR, { recursive: true });
}

// Download image bytes and compute SHA256
async function downloadAndHashImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { status: 'MISSING_URL', sha256: null, bytes: 0, contentType: null, httpStatus: null };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { status: 'DOWNLOAD_FAILED', sha256: null, bytes: 0, contentType: null, httpStatus: res.status };
    }

    const cType = res.headers.get('content-type') || '';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      status: 'HASHED',
      sha256: hash,
      bytes: buffer.length,
      contentType: cType,
      httpStatus: res.status
    };
  } catch (err) {
    return { status: 'DOWNLOAD_FAILED', sha256: null, bytes: 0, contentType: null, httpStatus: null, error: err.message };
  }
}

// Determine Apple Product Family from Title
function getAppleFamily(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('iphone')) return 'iPhone';
  if (t.includes('ipad')) return 'iPad';
  if (t.includes('macbook air')) return 'MacBook Air';
  if (t.includes('macbook pro')) return 'MacBook Pro';
  if (t.includes('macbook')) return 'MacBook';
  if (t.includes('imac')) return 'iMac';
  if (t.includes('mac mini')) return 'Mac mini';
  if (t.includes('mac studio')) return 'Mac Studio';
  if (t.includes('mac pro')) return 'Mac Pro';
  if (t.includes('watch')) return 'Apple Watch';
  if (t.includes('airpods max')) return 'AirPods Max';
  if (t.includes('airpods pro')) return 'AirPods Pro';
  if (t.includes('airpods')) return 'AirPods';
  if (t.includes('apple tv')) return 'Apple TV';
  if (t.includes('homepod')) return 'HomePod';
  return 'Other Apple Products';
}

async function auditAppleProductsDryRun() {
  console.log('================================================================');
  console.log('TREND-TECH-2 — APPLE PRODUCT CATALOG FORENSIC AUDIT (DRY RUN)');
  console.log('================================================================');

  await connectDB();

  const totalProductsCount = await Product.countDocuments({});
  const totalMpCount = await MarketplaceProduct.countDocuments({});
  const totalPriceHistoryCount = await PriceHistory.countDocuments({});

  // Query MongoDB for all Apple products
  const appleProducts = await Product.find({
    $or: [
      { brand: { $regex: /^apple$/i } },
      { name: { $regex: /\bapple\b|\biphone\b|\bipad\b|\bmacbook\b|\bairpods\b|\bapple watch\b/i } }
    ]
  }).lean();

  console.log(`Discovered ${appleProducts.length} Apple products in MongoDB out of ${totalProductsCount} total products.\n`);

  const familyMap = {};
  let unsplashImagesCount = 0;
  let genericImagesCount = 0;
  let amazonCdnImagesCount = 0;
  let missingImagesCount = 0;
  let verifiedOfficialCount = 0;

  const shaMap = new Map();

  for (const p of appleProducts) {
    const family = getAppleFamily(p.name);
    if (!familyMap[family]) {
      familyMap[family] = [];
    }
    familyMap[family].push(p);

    if (!p.image) {
      missingImagesCount++;
    } else if (p.image.includes('unsplash.com')) {
      unsplashImagesCount++;
    } else if (p.image.includes('apple.com')) {
      verifiedOfficialCount++;
    } else if (p.image.includes('media-amazon.com') || p.image.includes('m.media-amazon.com')) {
      amazonCdnImagesCount++;
    } else {
      genericImagesCount++;
    }

    if (p.image) {
      const imgRes = await downloadAndHashImage(p.image);
      if (imgRes.status === 'HASHED') {
        if (!shaMap.has(imgRes.sha256)) {
          shaMap.set(imgRes.sha256, []);
        }
        shaMap.get(imgRes.sha256).push(p._id.toString());
      }
    }
  }

  let duplicateHashesCount = 0;
  shaMap.forEach(list => {
    if (list.length > 1) {
      duplicateHashesCount += (list.length - 1);
    }
  });

  console.log('--- APPLE PRODUCT FAMILIES BREAKDOWN ---');
  Object.entries(familyMap).forEach(([fam, prods]) => {
    console.log(`- ${fam}: ${prods.length} products`);
  });

  console.log('\n--- APPLE IMAGE AUDIT SUMMARY ---');
  console.log(`- Total Apple Products: ${appleProducts.length}`);
  console.log(`- Unsplash Stock Images: ${unsplashImagesCount}`);
  console.log(`- Generic Stock Images: ${genericImagesCount}`);
  console.log(`- Amazon CDN Images: ${amazonCdnImagesCount}`);
  console.log(`- Official Apple Images: ${verifiedOfficialCount}`);
  console.log(`- Missing Images: ${missingImagesCount}`);
  console.log(`- Duplicate SHA-256 Hashes Detected: ${duplicateHashesCount}`);

  await disconnectDB();
}

auditAppleProductsDryRun().catch(err => {
  console.error('Error during Apple dry run:', err);
  process.exit(1);
});
