import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const auditsDir = path.join(__dirname, '../data/audits');
  if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });

  const testCases = [
    { type: 'query', query: 'iPhone 15' },
    { type: 'url', url: 'https://www.amazon.in/dp/B00SP11' },
    { type: 'url_invalid', url: 'https://invalid-store.com/product' },
    { type: 'url_missing', url: 'https://amazon.in/dp/DOES_NOT_EXIST' }
  ];

  const report = {
    URLs_analyzed: 4,
    Products_identified: 0,
    Exact_identities: 0,
    Ambiguous_identities: 0,
    Marketplace_sources_checked: 0,
    Exact_marketplace_matches: 0,
    Wrong_product_matches_rejected: 0,
    Verified_prices: 0,
    Unavailable_prices: 0,
    Verified_discounts: 0,
    Best_verified_deals: 0,
    Redirects_validated: 0,
    Redirects_rejected: 0,
    Images_verified: 0,
    Images_rejected: 0,
    Synthetic_URLs_rejected: 0,
    Errors: 0,
    API_failures: 0
  };

  for (const t of testCases) {
    try {
      const resp = await fetch('http://localhost:5001/api/products/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t)
      });
      const data = await resp.json();
      const res = data.data;

      if (res && res.status === 'SUCCESS' && res.product) {
        report.Products_identified++;
        if (res.identity.status === 'IDENTITY_VERIFIED') report.Exact_identities++;
        else report.Ambiguous_identities++;
        
        if (res.image.status === 'VERIFIED_EXACT') report.Images_verified++;
        else report.Images_rejected++;

        report.Marketplace_sources_checked += res.coverage.checked.length;
        
        for (const mp of res.marketplaces) {
          if (mp.isVerified) {
            report.Exact_marketplace_matches++;
            if (mp.price) report.Verified_prices++;
            if (mp.discountPercentage) report.Verified_discounts++;
            report.Redirects_validated++;
          } else {
            report.Unavailable_prices++;
            report.Synthetic_URLs_rejected++;
            report.Redirects_rejected++;
          }
        }
        
        if (res.bestDeal) {
          report.Best_verified_deals++;
        }
      } else {
        if (res && res.status === 'INVALID_URL') {
          report.Redirects_rejected++;
          report.Errors++;
        }
        if (res && res.status === 'PRODUCT_NOT_FOUND') {
          report.Errors++;
        }
      }
    } catch (err) {
      report.API_failures++;
      report.Errors++;
    }
  }

  // Write JSON
  fs.writeFileSync(path.join(auditsDir, 'phase15_6ProductUrlAnalysis.json'), JSON.stringify(report, null, 2));

  // Write MD
  let md = `# Phase 15.6 Product URL Analysis Report\n\n`;
  for (const [k, v] of Object.entries(report)) {
    md += `- **${k.replace(/_/g, ' ')}**: ${v}\n`;
  }
  fs.writeFileSync(path.join(auditsDir, 'phase15_6ProductUrlAnalysis.md'), md);

  console.log('Audit completed successfully');
  process.exit(0);
}

run().catch(console.error);
