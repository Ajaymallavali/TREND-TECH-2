import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDuplicates() {
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

  const productMap = new Map();

  for (const file of files) {
    const ext = path.extname(file);
    let base = path.basename(file, ext).trim();
    base = base.replace(/^-\s*/, '').trim();

    const normBase = normalize(base);
    let candidate = null;

    candidate = allProducts.find(p => {
      const nName = normalize(p.name);
      const nBrandName = normalize(`${p.brand} ${p.name}`);
      const nNameBrand = normalize(`${p.name} ${p.brand}`);
      return normBase === nName || normBase === nBrandName || normBase === nNameBrand;
    });

    if (!candidate && base.startsWith('UNKNOWN ')) {
      const rest = base.replace(/^UNKNOWN\s+/, '').trim();
      const nRest = normalize(rest);
      candidate = allProducts.find(p => {
        const nName = normalize(p.name);
        return nRest === nName || nRest === normalize(`${p.category} ${p.name}`);
      });
    }

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

    if (!candidate) {
      candidate = allProducts.find(p => {
        const nName = normalize(p.name);
        return normBase.includes(nName) && nName.length > 5;
      });
    }

    if (!candidate) {
      const compactBase = normBase.replace(/\s+/g, '').replace(/^unknown/, '');
      candidate = allProducts.find(p => {
        const compactName = normalize(p.name).replace(/\s+/g, '');
        return compactBase === compactName || compactBase.includes(compactName);
      });
    }

    if (candidate) {
      const pId = candidate._id.toString();
      if (!productMap.has(pId)) {
        productMap.set(pId, []);
      }
      productMap.get(pId).push(file);
    }
  }

  console.log(`Unique products matched: ${productMap.size}`);
  let collisions = 0;
  for (const [pId, fList] of productMap.entries()) {
    if (fList.length > 1) {
      collisions++;
      console.log(`Product ID ${pId} matched multiple files:`, fList);
    }
  }
  console.log(`Total collisions: ${collisions}`);

  await mongoose.disconnect();
}

checkDuplicates().catch(console.error);
