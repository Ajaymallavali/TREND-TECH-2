import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { Product } = await import('./src/models/Product.model.js');
  
  const products = await Product.find({}, 'name brand category image').lean();
  console.log(`Total MongoDB Products: ${products.length}`);

  const imgDir = "C:\\Users\\ajaym\\Downloads\\img's";
  const files = fs.readdirSync(imgDir);
  console.log(`Total Images in directory: ${files.length}`);

  console.log('\nSample 15 image files:');
  files.slice(0, 15).forEach(f => console.log('  IMAGE:', f));

  console.log('\nSample 15 MongoDB products:');
  products.slice(0, 15).forEach(p => console.log(`  PROD [${p.brand}]: "${p.name}" (cat: ${p.category})`));

  // Let's test a simple matching check
  let exactCount = 0;
  let partialCount = 0;

  for (const file of files) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).trim();
    // Some filenames might start with "- "
    const cleanName = baseName.replace(/^-\s*/, '').trim();

    // Check match
    const exact = products.find(p => p.name.toLowerCase() === cleanName.toLowerCase());
    if (exact) {
      exactCount++;
    } else {
      // Try checking if cleanName contains product name or vice versa
      const partial = products.find(p => {
        const pName = p.name.toLowerCase();
        const cName = cleanName.toLowerCase();
        return cName.includes(pName) || pName.includes(cName);
      });
      if (partial) {
        partialCount++;
      }
    }
  }

  console.log(`\nDirect exact name match: ${exactCount}/${files.length}`);
  console.log(`Partial name match: ${partialCount}/${files.length}`);

  await mongoose.disconnect();
}

inspect().catch(console.error);
