import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';

async function testVerifiedCatalogImages() {
  console.log(`Testing ${REAL_VERIFIED_CATALOG.length} images from REAL_VERIFIED_CATALOG...\n`);

  let workingCount = 0;
  let sampleWorking = [];

  for (let idx = 0; idx < REAL_VERIFIED_CATALOG.length; idx++) {
    const p = REAL_VERIFIED_CATALOG[idx];
    if (!p.image || p.image.includes('unsplash.com')) continue;

    try {
      const res = await fetch(p.image, { method: 'HEAD' });
      if (res.status === 200 || res.status === 304) {
        workingCount++;
        if (sampleWorking.length < 15) {
          sampleWorking.push({ name: p.name, image: p.image, status: res.status });
        }
      }
    } catch {}
  }

  console.log(`Working HTTP 200 Product Images in REAL_VERIFIED_CATALOG: ${workingCount} out of ${REAL_VERIFIED_CATALOG.length}`);
  console.log('\nSample 15 HTTP 200 Working Product Images:');
  sampleWorking.forEach((item, i) => {
    console.log(`[${i+1}] ${item.name.padEnd(50)} -> HTTP ${item.status} | ${item.image}`);
  });
}

testVerifiedCatalogImages().catch(console.error);
