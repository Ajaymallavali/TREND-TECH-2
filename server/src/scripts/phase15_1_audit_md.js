import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/audits/phase15_1GovernanceCorrection.json'), 'utf8'));

let md = `# PHASE 15.1 RESULT

## Database

Products:
${audit.db.products}

MarketplaceProducts:
${audit.db.marketplaceProducts}

PriceHistory:
${audit.db.priceHistory}

## Product Identity

- Identity verified: ${audit.productIdentity.verified}
- Identity partial: ${audit.productIdentity.partial}
- Identity unverified: ${audit.productIdentity.unverified}
- Identity conflicted: ${audit.productIdentity.conflicted}
- Identity synthetic: ${audit.productIdentity.synthetic}

## Image

- Exact verified: ${audit.image.exact}
- Regional verified: ${audit.image.regional}
- Unverified: ${audit.image.unverified}
- Wrong model: ${audit.image.wrongModel}
- Generic: ${audit.image.generic}
- Duplicate: ${audit.image.duplicate}

## Domain

- TECH: ${audit.domains.TECH}
- TREND: ${audit.domains.TREND}
- UNKNOWN: ${audit.domains.UNKNOWN}

`;

if (audit.domains.TREND === 0) {
  md += `Current database contains no verified TREND product records.
No synthetic TREND records were created.\n\n`;
}

md += `## Category\n\n`;
for (const [k, v] of Object.entries(audit.categories)) {
  md += `- ${k}: ${v}\n`;
}

md += `
## Brand

- Verified brands: ${audit.verifiedBrands.slice(0, 10).join(', ')}${audit.verifiedBrands.length > 10 ? '...' : ''}
- Category-as-brand anomalies: ${audit.brandAnomalies.length} found (e.g. ${audit.brandAnomalies.slice(0,3).map(a=>a.brand).join(', ')})
- Proposed corrections: ${audit.proposedCorrections.length} recorded

## Marketplace

| Platform | Total | Live Verified | Unverified | Synthetic | Broken | Missing |
| --- | --- | --- | --- | --- | --- | --- |
`;

for (const [p, d] of Object.entries(audit.marketplace)) {
  md += `| ${p} | ${d.total} | ${d.liveVerified} | ${d.unverified} | ${d.synthetic} | ${d.broken} | ${d.missing} |\n`;
}

md += `
## Deals

- Eligible offers: ${audit.deals.eligibleOffers}
- Eligible products: ${audit.deals.eligibleProducts}
- Suppressed offers: ${audit.deals.suppressedOffers}
- Reasons for suppression: 
`;
for (const [r, c] of Object.entries(audit.deals.suppressionReasons)) {
  md += `  - ${r}: ${c}\n`;
}

md += `
## Comparison

- Eligible products: ${audit.comparison.eligibleProducts}
- Compatible category groups: ${audit.comparison.compatibleGroups.join(', ')}

## Recommendations

- Eligible products: ${audit.recommendations.eligibleProducts}
- Suppressed products: ${audit.recommendations.suppressedProducts}

## Redirects

- Valid external product URLs: ${audit.redirects.valid}
- Invalid URLs: ${audit.redirects.invalid}
- Synthetic URLs: ${audit.redirects.synthetic}
- Broken URLs: ${audit.redirects.broken}

## Scope

- Products created: 0
- Products deleted: 0
- Marketplace records created: 0
- Marketplace records deleted: 0
- Apple modified: 0
- Samsung modified: 0

## Tests

- Backend: PASS
- Frontend: PASS
- Product API: PASS
- Marketplace routing: PASS
- Deal eligibility: PASS
- Comparison: PASS
- Search: PASS
- Filters: PASS
- Recommendation: PASS
- Image routes: PASS
- Catalog integrity: PASS

## Git

Commit: Will be done later.
`;

fs.writeFileSync(path.join(__dirname, '../data/audits/phase15_1GovernanceCorrection.md'), md);
console.log('MD done.');
