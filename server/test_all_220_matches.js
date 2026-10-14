import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Product } = await import('./src/models/Product.model.js');
  
  const allProducts = await Product.find({}).lean();
  const imgDir = "C:\\Users\\ajaym\\Downloads\\img's";
  const files = fs.readdirSync(imgDir);

  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/[\/\\]/g, ' ')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const results = [];
  const unmatched = [];

  for (const file of files) {
    const ext = path.extname(file);
    let base = path.basename(file, ext).trim();
    base = base.replace(/^-\s*/, '').trim();

    const normBase = normalize(base);
    let candidate = null;

    // 1. Direct normalized match against name, brand + name, name + brand
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

    // 3. Strip known brand if at start of base
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

    // 4. Substring / contains match
    if (!candidate) {
      candidate = allProducts.find(p => {
        const nName = normalize(p.name);
        return normBase.includes(nName) && nName.length > 5;
      });
    }

    // 5. No-spaces comparison (handles "OlympusOM" vs "Olympus/OM")
    if (!candidate) {
      const compactBase = normBase.replace(/\s+/g, '').replace(/^unknown/, '');
      candidate = allProducts.find(p => {
        const compactName = normalize(p.name).replace(/\s+/g, '');
        return compactBase === compactName || compactBase.includes(compactName);
      });
    }

    if (candidate) {
      results.push({ file, product: candidate });
    } else {
      unmatched.push(file);
    }
  }

  console.log(`Matched: ${results.length}/${files.length}`);
  console.log(`Unmatched: ${unmatched.length}/${files.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched files:', unmatched);
  }

  await mongoose.disconnect();
}

checkAll().catch(console.error);
