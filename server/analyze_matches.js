import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function analyzeMatches() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Product } = await import('./src/models/Product.model.js');
  
  const allProducts = await Product.find({}).lean();
  console.log(`Total Products in DB: ${allProducts.length}`);

  const imgDir = "C:\\Users\\ajaym\\Downloads\\img's";
  const files = fs.readdirSync(imgDir);

  const matched = [];
  const unmatched = [];

  // Helper to normalize string for comparison
  const normalize = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  for (const file of files) {
    const ext = path.extname(file);
    let base = path.basename(file, ext).trim();
    // Remove leading "- " if present
    base = base.replace(/^-\s*/, '').trim();

    // Check patterns:
    // Some files are: "Brand ProductName" e.g. "Samsung Air Conditioners Samsung" or "UNKNOWN Air Conditioners Blue Star" or "Apple Apple iPhone Plus"
    // Let's try multiple extraction strategies:
    // 1. Direct match on full base name
    // 2. Strip leading brand if base starts with brand
    // 3. Match against brand + name
    // 4. Match against name

    let candidate = null;

    const normBase = normalize(base);

    // Strategy 1: Exact match with product name or brand + product name
    candidate = allProducts.find(p => {
      const normName = normalize(p.name);
      const normBrandName = normalize(`${p.brand} ${p.name}`);
      const normNameBrand = normalize(`${p.name} ${p.brand}`);
      return normBase === normName || normBase === normBrandName || normBase === normNameBrand;
    });

    // Strategy 2: If base starts with "UNKNOWN "
    if (!candidate && base.startsWith('UNKNOWN ')) {
      const rest = base.replace(/^UNKNOWN\s+/, '').trim();
      const normRest = normalize(rest);
      candidate = allProducts.find(p => {
        const normName = normalize(p.name);
        return normRest === normName || normRest === normalize(`${p.category} ${p.name}`);
      });
    }

    // Strategy 3: Check if base starts with a known brand
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

    // Strategy 4: Fuzzy or contains match
    if (!candidate) {
      candidate = allProducts.find(p => {
        const normName = normalize(p.name);
        return normBase.includes(normName) && normName.length > 5;
      });
    }

    if (candidate) {
      matched.push({ file, base, product: candidate });
    } else {
      unmatched.push({ file, base });
    }
  }

  console.log(`\nMatched: ${matched.length}/${files.length}`);
  console.log(`Unmatched: ${unmatched.length}/${files.length}`);

  if (unmatched.length > 0) {
    console.log('\n--- Unmatched Files (Sample 20) ---');
    unmatched.slice(0, 20).forEach(u => console.log('  FILE:', u.file));
  }

  console.log('\n--- Sample 10 Matched ---');
  matched.slice(0, 10).forEach(m => {
    console.log(`  FILE: "${m.file}" => PRODUCT: [${m.product.brand}] "${m.product.name}" (ID: ${m.product._id})`);
  });

  await mongoose.disconnect();
}

analyzeMatches().catch(console.error);
