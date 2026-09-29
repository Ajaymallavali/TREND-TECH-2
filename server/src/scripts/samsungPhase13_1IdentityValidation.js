import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const targets = [
    { id: '6aa06057af8879d815dcab5d', dbModel: 'QA65S90DAKXXL', name: 'Samsung 65" OLED 4K (S90D)', status: 'DOWNGRADE', reason: 'Acquired image is a generic Samsung Care image (@care-image-new.jpg), not the product.' },
    { id: '6aa06057af8879d815dcade2', dbModel: 'SM-R400N', name: 'Samsung Galaxy Buds FE', status: 'DOWNGRADE', reason: 'Acquired image is for SM-R420 (Galaxy Buds3 FE), an incorrect image assignment for SM-R400N.' },
    { id: '6aa06057af8879d815dcae5a', dbModel: 'SM-L705F', name: 'Samsung Galaxy Watch Ultra', status: 'MAINTAIN', reason: 'SM-L705UZB1XAA is a verified regional/color variant of SM-L705F.' },
    { id: '6aa06057af8879d815dcae69', dbModel: 'SM-L310N', name: 'Samsung Galaxy Watch 7', status: 'MAINTAIN', reason: 'SM-L310NZGAXAA is a verified regional/color variant of SM-L310N.' }
  ];

  const results = [];
  const basePath = path.join(__dirname, '../data/product-images/samsung');

  for (const t of targets) {
    const product = await Product.findById(t.id);
    if (!product) {
      console.log(`Not found: ${t.id}`);
      continue;
    }

    if (t.status === 'DOWNGRADE') {
      product.verificationStatus = 'UNVERIFIED';
      product.imageUrl = '';
      product.imageSource = 'UNKNOWN';
      await product.save();

      const imgDir = path.join(basePath, t.id);
      if (fs.existsSync(imgDir)) {
        fs.rmSync(imgDir, { recursive: true, force: true });
      }

      results.push({
        id: t.id,
        title: product.name,
        model: t.dbModel,
        validationStatus: 'FAILED',
        action: 'DOWNGRADED_TO_UNVERIFIED',
        evidence: t.reason
      });
      console.log(`Downgraded: ${t.name}`);
    } else {
      results.push({
        id: t.id,
        title: product.name,
        model: t.dbModel,
        validationStatus: 'PASSED',
        action: 'MAINTAIN_VERIFIED_EXACT',
        evidence: t.reason
      });
      console.log(`Maintained: ${t.name}`);
    }
  }

  const auditData = {
    timestamp: new Date().toISOString(),
    targetsAttempted: 4,
    passed: results.filter(r => r.validationStatus === 'PASSED').length,
    failed: results.filter(r => r.validationStatus === 'FAILED').length,
    duplicateConflictsInvestigated: 2,
    duplicateFindings: [
      {
        conflictHash: '466bfa1802115d9a8ef53ab62278f0df859b9f4586a2bddb0e3d1f5e5da0eca2',
        productsAffected: ['6aa06057af8879d815dcab5d (S90D)', '6aa06058af8879d815dcb1fc (Tab Active5)'],
        finding: 'The duplicate hash belongs to app_ico.png (a generic Samsung asset). The Phase 13 script incorrectly matched this on multiple product pages. S90D bypassed it but matched another generic image. Tab Active5 failed on it.'
      }
    ],
    results
  };

  const auditDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

  fs.writeFileSync(path.join(auditDir, 'samsungPhase13_1IdentityValidation.json'), JSON.stringify(auditData, null, 2));

  let md = `# SAMSUNG PHASE 13.1 RESULT\n\n`;
  md += `## Validation Summary\n`;
  md += `- Targets Validated: 4\n`;
  md += `- Validation Passed: ${auditData.passed}\n`;
  md += `- Validation Failed (Downgraded): ${auditData.failed}\n`;
  md += `- Duplicate Conflicts Investigated: 2\n\n`;

  md += `## Detailed Evidence Table\n\n`;
  md += `| Product ID | Title | Model | Status | Action | Evidence / Reason |\n`;
  md += `|---|---|---|---|---|---|\n`;
  results.forEach(r => {
    md += `| ${r.id} | ${r.title} | ${r.model} | **${r.validationStatus}** | ${r.action} | ${r.evidence} |\n`;
  });

  md += `\n## Duplicate Conflict Investigation\n\n`;
  auditData.duplicateFindings.forEach(df => {
    md += `- **Hash**: \`${df.conflictHash}\`\n`;
    md += `- **Affected**: ${df.productsAffected.join(', ')}\n`;
    md += `- **Finding**: ${df.finding}\n\n`;
  });

  fs.writeFileSync(path.join(auditDir, 'samsungPhase13_1IdentityValidation.md'), md);

  console.log('\n========================================');
  console.log(md);
  console.log('========================================\n');

  await mongoose.disconnect();
}

run().catch(console.error);
