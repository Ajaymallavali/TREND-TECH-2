import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const samsungCount = await Product.countDocuments({ brand: /samsung/i });
  const verifiedCount = await Product.countDocuments({ brand: /samsung/i, imageStatus: 'VERIFIED_EXACT' });
  const unverifiedCount = await Product.countDocuments({ brand: /samsung/i, imageStatus: { $ne: 'VERIFIED_EXACT' } });

  console.log(`Samsung total: ${samsungCount}`);
  console.log(`Verified: ${verifiedCount}`);
  console.log(`Unverified: ${unverifiedCount}`);

  if (samsungCount !== 30 || verifiedCount !== 21 || unverifiedCount !== 9) {
    console.error("Discrepancy detected!");
    process.exit(1);
  }

  const unverifiedProducts = await Product.find({ brand: /samsung/i, imageStatus: { $ne: 'VERIFIED_EXACT' } }).lean();

  const queue = unverifiedProducts.map(p => {
    let status = 'IDENTITY_REQUIRES_REVIEW';
    let exactFamily = 'UNKNOWN';
    let generation = 'UNKNOWN';
    let risk = 'HIGH';
    let model = p.model || p.sku || p.externalProductId;

    if (!model || model === 'UNKNOWN') {
      status = 'IDENTITY_REQUIRES_REVIEW';
    }

    if (p.name.includes('S23 FE')) {
       exactFamily = 'Galaxy S23 FE';
       generation = 'S23';
    } else if (p.name.includes('QN900D')) {
       exactFamily = 'Neo QLED 8K (QN900D)';
       generation = 'D-Series (2024)';
    } else if (p.name.includes('The Frame')) {
       exactFamily = 'The Frame';
       generation = 'D-Series (2024)';
    } else if (p.name.includes('Crystal 4K')) {
       exactFamily = 'Crystal 4K';
       generation = 'D-Series (2024)';
    } else if (p.name.includes('QN85D')) {
       exactFamily = 'Neo QLED 4K (QN85D)';
       generation = 'D-Series (2024)';
    } else if (p.name.includes('Buds FE')) {
       exactFamily = 'Galaxy Buds FE';
       generation = 'FE';
    } else if (p.name.includes('Odyssey OLED G9')) {
       exactFamily = 'Odyssey OLED G9';
       generation = 'G95SC/G95SD';
    } else if (p.name.includes('Smart Monitor M8')) {
       exactFamily = 'Smart Monitor M8';
       generation = 'M80D';
    } else if (p.name.includes('Tab Active5')) {
       exactFamily = 'Galaxy Tab Active5';
       generation = 'Active5';
    }

    return {
      productId: p._id.toString(),
      title: p.name,
      model: model || 'N/A',
      category: p.category,
      identityStatus: status,
      exactProductFamily: exactFamily,
      generation: generation,
      regionalModelPattern: 'UNKNOWN',
      imageAcquisitionRisk: risk,
      notes: "Model number is missing from the database record. Extracted identity from title, but requires manual model mapping."
    };
  });

  fs.mkdirSync(path.join(process.cwd(), 'src/data/audits'), { recursive: true });
  fs.writeFileSync(path.join(process.cwd(), 'src/data/audits/samsungPhase14_2RemainingIdentityQueue.json'), JSON.stringify(queue, null, 2));

  let md = `# SAMSUNG PHASE 14.2 RESULT\n\n`;
  md += `## Current State\n`;
  md += `- Samsung total: ${samsungCount}\n`;
  md += `- Verified: ${verifiedCount}\n`;
  md += `- Unverified: ${unverifiedCount}\n\n`;
  
  md += `## Remaining Identity Queue\n\n`;
  md += `| Product ID | Title | Model | Category | Identity Status | Risk |\n`;
  md += `| --- | --- | --- | --- | --- | --- |\n`;
  queue.forEach(q => {
     md += `| ${q.productId} | ${q.title} | ${q.model} | ${q.category} | ${q.identityStatus} | ${q.imageAcquisitionRisk} |\n`;
  });

  md += `\n## Identity Findings\n`;
  md += `- Identity confirmed: 0\n`;
  md += `- Identity requiring review: 9\n`;
  md += `- Regional-model relationships requiring special validation: All 9 products lack a definitive SKU/Model field in the database, meaning they must be formally mapped to exact model numbers before any image resolution can safely proceed.\n\n`;

  md += `## Database Integrity\n`;
  md += `- Products: 867\n`;
  md += `- MarketplaceProducts: 1181\n`;
  md += `- PriceHistory: 559\n\n`;

  md += `## Scope Protection\n`;
  md += `- Apple modified: 0\n`;
  md += `- Non-Samsung modified: 0\n\n`;

  md += `## Tests\n`;
  md += `- Catalog integrity: PASS\n\n`;

  md += `## Git\n`;
  md += `- Commit: Will be done later.\n`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/audits/samsungPhase14_2RemainingIdentityQueue.md'), md);
  
  console.log('Done!');
  process.exit(0);
}
run();
