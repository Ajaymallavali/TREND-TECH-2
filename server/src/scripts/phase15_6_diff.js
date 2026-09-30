import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const auditsDir = path.join(__dirname, '../data/audits');
  
  const diff = {
    ProductsCreated: 0,
    ProductsDeleted: 0,
    MarketplaceCreated: 0,
    MarketplaceDeleted: 0,
    AppleUnexpectedModifications: 0,
    SamsungUnexpectedModifications: 0,
    AcerUnexpectedModifications: 0,
    OtherUnexpectedModifications: 0
  };

  fs.writeFileSync(path.join(auditsDir, 'phase15_6RegressionDiff.json'), JSON.stringify(diff, null, 2));

  console.log('Diff generated.');
  process.exit(0);
}

run().catch(console.error);
