const fs = require('fs');
const path = require('path');
const q = require(path.join(process.cwd(), 'server/src/data/audits/phase18ImageRepairQueue.json'));
let md = '\n## IMPORTANT PRODUCT LIST\n\n';
q.forEach(x => {
  md += `Product ID: ${x.ProductId}\n`;
  md += `Category: ${x.Category}\n`;
  md += `Brand: ${x.Brand}\n`;
  md += `Product: ${x.Product}\n`;
  md += `Model: ${x.Model}\n`;
  md += `Variant: ${x.Variant}\n`;
  md += `Image Status: ${x.CurrentImageStatus}\n`;
  md += `Reason: ${x.Problem}\n`;
  md += `Official Source Search Result: PENDING\n`;
  md += `Action Required: ${x.ActionRequired}\n\n`;
});
fs.appendFileSync(path.join(process.cwd(), 'server/src/data/audits/phase18ProductImageCoverageAudit.md'), md);
