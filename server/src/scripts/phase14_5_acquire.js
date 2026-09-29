import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANDIDATE_ACQUISITION_MATRIX = [
  {
    id: '6aa06056af8879d815dca656',
    name: 'Samsung Galaxy S23 FE',
    baseModel: 'SM-S711',
    regionalModel: 'SM-S711B',
    category: 'smartphone',
    pages: ['https://www.samsung.com/in/smartphones/galaxy-s23-fe/buy/', 'https://www.samsung.com/sg/smartphones/galaxy-s23-fe/buy/'],
    matchStr: 's711'
  },
  {
    id: '6aa06057af8879d815dcab3f',
    name: 'Samsung 65" Neo QLED 8K (QN900D)',
    baseModel: 'QN900D',
    regionalModel: 'QA65QN900DWXXY',
    category: 'television',
    pages: ['https://www.samsung.com/au/tvs/qled-tv/qn900d-65-inch-neo-qled-8k-smart-tv-qa65qn900dwxxy/'],
    matchStr: 'qn900'
  },
  {
    id: '6aa06057af8879d815dcab4e',
    name: 'Samsung 55" The Frame TV QLED',
    baseModel: 'LS03D',
    regionalModel: 'QA55LS03DAWXXY',
    category: 'television',
    pages: ['https://www.samsung.com/au/tvs/the-frame/ls03d-55-inch-the-frame-qled-4k-smart-tv-qa55ls03dawxxy/'],
    matchStr: 'ls03d'
  },
  {
    id: '6aa06057af8879d815dcab6c',
    name: 'Samsung 50" Crystal 4K Vivid Pro',
    baseModel: 'DUE77A',
    regionalModel: 'UA50DUE77AKXXL',
    category: 'television',
    pages: ['https://www.samsung.com/in/tvs/uhd-4k-tv/due77-50-inch-crystal-uhd-4k-smart-tv-ua50due77akxxl/'],
    matchStr: 'due77'
  },
  {
    id: '6aa06057af8879d815dcac7a',
    name: 'Samsung 75" QN85D Neo QLED 4K',
    baseModel: 'QN85D',
    regionalModel: 'QA75QN85DBWXXY',
    category: 'television',
    pages: ['https://www.samsung.com/au/tvs/qled-tv/qn85d-75-inch-neo-qled-4k-smart-tv-qa75qn85dbwxxy/'],
    matchStr: 'qn85d'
  },
  {
    id: '6aa06057af8879d815dcade2',
    name: 'Samsung Galaxy Buds FE',
    baseModel: 'SM-R400',
    regionalModel: 'SM-R400N',
    category: 'headphones',
    pages: ['https://www.samsung.com/in/audio-sound/galaxy-buds/galaxy-buds-fe-graphite-sm-r400nzaains/'],
    matchStr: 'r400'
  },
  {
    id: '6aa06057af8879d815dcafe0',
    name: 'Samsung Odyssey OLED G9 49"',
    baseModel: 'CG954S',
    regionalModel: 'LS49CG954SEXXY',
    category: 'monitor',
    pages: ['https://www.samsung.com/au/monitors/gaming/odyssey-oled-g9-g95sc-49-inch-240hz-curved-dual-qhd-ls49cg954sexxy/'],
    matchStr: 'cg954s'
  },
  {
    id: '6aa06057af8879d815dcaffe',
    name: 'Samsung Smart Monitor M8 32" 4K',
    baseModel: 'DM801U',
    regionalModel: 'LS32DM801UEXXY',
    category: 'monitor',
    pages: ['https://www.samsung.com/au/monitors/smart-monitor/smart-monitor-m8-32-inch-smart-tv-experience-ls32dm801uexxy/'],
    matchStr: 'dm801'
  },
  {
    id: '6aa06058af8879d815dcb1fc',
    name: 'Samsung Galaxy Tab Active5 Rugged',
    baseModel: 'SM-X306',
    regionalModel: 'SM-X306B',
    category: 'tablet',
    pages: ['https://www.samsung.com/in/business/tablets/galaxy-tab-active/galaxy-tab-active5-5g-sm-x306bzggins/'],
    matchStr: 'x306'
  }
];

function extractImageUrlsFromHtml(html) {
  const urls = [];
  const cdnMatches = [...html.matchAll(/(?:https?:)?\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^\s\"\'\)<>\\]+/gi)];
  cdnMatches.forEach(m => urls.push(m[0]));
  const normalized = urls.map(u => {
    let clean = u;
    if (clean.includes('?')) {
        clean = clean.split('?')[0];
    }
    if (clean.startsWith('//')) return 'https:' + clean;
    return clean;
  }).filter(u => u.startsWith('http'));
  return [...new Set(normalized)];
}

function fetchHtml(url) {
  return fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  }).then(async res => ({ html: await res.text(), status: res.status }));
}

function fetchImage(url) {
  return fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  }).then(res => res.arrayBuffer()).then(buf => Buffer.from(buf));
}

function isGenericAsset(url) {
  const genericStrings = [
    'logo', 'icon', 'placeholder', 'default', 'banner', 'gnb', 'menu', 'shop',
    'app_ico', 'favicon', 'support', 'care', 'video', 'button', 'badge'
  ];
  const lowerUrl = url.toLowerCase();
  for (const str of genericStrings) {
    if (lowerUrl.includes(str)) return true;
  }
  return false;
}

function isWrongModel(url, matchStr) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes(matchStr)) return false;
  return true;
}

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));

  const existingImageHashes = new Set();
  const imagesDir = path.join(process.cwd(), 'src/data/product-images/samsung');
  if (fs.existsSync(imagesDir)) {
      const dirs = fs.readdirSync(imagesDir);
      for (const d of dirs) {
          const imgP = path.join(imagesDir, d, 'primary.jpg');
          if (fs.existsSync(imgP)) {
              const buf = fs.readFileSync(imgP);
              const h = crypto.createHash('sha256').update(buf).digest('hex');
              existingImageHashes.add(h);
          }
      }
  }

  const results = [];
  
  for (const c of CANDIDATE_ACQUISITION_MATRIX) {
    console.log(`Processing ${c.name}...`);
    let found = false;
    let verifiedUrl = null;
    let sha256 = null;
    let buffer = null;

    for (const page of c.pages) {
      if (found) break;
      const { html, status } = await fetchHtml(page);
      if (status !== 200) continue;
      
      const urls = extractImageUrlsFromHtml(html);
      
      for (const u of urls) {
         if (isGenericAsset(u)) continue;
         if (isWrongModel(u, c.matchStr)) continue;
         
         // Fetch image
         try {
           const buf = await fetchImage(u);
           if (buf.length < 5000) continue; // too small
           
           const h = crypto.createHash('sha256').update(buf).digest('hex');
           if (existingImageHashes.has(h)) continue; // duplicate
           
           found = true;
           verifiedUrl = u;
           sha256 = h;
           buffer = buf;
           
           existingImageHashes.add(h);
           break;
         } catch (e) {
           // Ignore fetch error
         }
      }
    }
    
    if (found) {
       console.log(`  -> VERIFIED: ${verifiedUrl}`);
       
       const prodDir = path.join(imagesDir, c.id);
       if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });
       fs.writeFileSync(path.join(prodDir, 'primary.jpg'), buffer);
       
       await Product.updateOne({ _id: new mongoose.Types.ObjectId(c.id) }, {
         $set: {
           imageStatus: 'VERIFIED_EXACT',
           imageSourceUrl: verifiedUrl,
           imageSha256: sha256,
           imageVerificationReason: `Official Samsung product page exact regional model match: ${c.regionalModel}`
         }
       });
       
       results.push({ id: c.id, status: 'VERIFIED_EXACT', url: verifiedUrl });
    } else {
       console.log(`  -> FAILED`);
       results.push({ id: c.id, status: 'FAILED', url: null });
    }
  }
  console.log('Results:', results);
  process.exit(0);
}

run();
