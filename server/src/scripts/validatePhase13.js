import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  { id: '6aa06057af8879d815dcab5d', name: 'Samsung 65" OLED 4K (S90D)' },
  { id: '6aa06057af8879d815dcade2', name: 'Samsung Galaxy Buds FE' },
  { id: '6aa06057af8879d815dcae5a', name: 'Samsung Galaxy Watch Ultra' },
  { id: '6aa06057af8879d815dcae69', name: 'Samsung Galaxy Watch 7' }
];

const basePath = path.join(__dirname, '../data/product-images/samsung');

for (const c of candidates) {
  const metaPath = path.join(basePath, c.id, 'metadata.json');
  const imgPath = path.join(basePath, c.id, 'primary.jpg');

  if (fs.existsSync(metaPath) && fs.existsSync(imgPath)) {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const buffer = fs.readFileSync(imgPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    console.log(`\n=== ${c.name} ===`);
    console.log(`Model: ${meta.exactModel}`);
    console.log(`Source URL: ${meta.sourceUrl}`);
    console.log(`Meta Hash: ${meta.sha256}`);
    console.log(`File Hash: ${hash}`);
    console.log(`Size: ${buffer.length} bytes`);
    console.log(`Match? ${meta.sha256 === hash ? 'YES' : 'NO'}`);
  } else {
    console.log(`\n=== ${c.name} === MISSING FILES`);
  }
}
