import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test list of candidate official & retailer image URLs for Samsung models
const TEST_CANDIDATES = [
  // Galaxy Z Fold 6
  { id: '6a9904e369652590e0aadc00', name: 'Galaxy Z Fold 6', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-f956bzsains/gallery/in-galaxy-z-fold6-f956-sm-f956bzsains-thumb-542171120' },
  { id: '6a9904e369652590e0aadc00', name: 'Galaxy Z Fold 6', url: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-z-fold6/buy/galaxy-z-fold6-silver-shadow.png' },
  { id: '6a9904e369652590e0aadc00', name: 'Galaxy Z Fold 6', url: 'https://m.media-amazon.com/images/I/71X4t3sM5wL._AC_SL1500_.jpg' },
  
  // Galaxy Z Flip 6
  { id: '6a9904e369652590e0aadc02', name: 'Galaxy Z Flip 6', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-f741bzblins/gallery/in-galaxy-z-flip6-f741-sm-f741bzblins-thumb-542159048' },
  { id: '6a9904e369652590e0aadc02', name: 'Galaxy Z Flip 6', url: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-z-flip6/buy/galaxy-z-flip6-mint.png' },

  // Galaxy S24 Ultra
  { id: '6aa06056af8879d815dca5ef', name: 'Galaxy S24 Ultra', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s928bztqins/gallery/in-galaxy-s24-s928-sm-s928bztqins-thumb-539572413' },
  { id: '6aa06056af8879d815dca5ef', name: 'Galaxy S24 Ultra', url: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-s24-ultra/buy/product_color_titanium_gray.png' },
  { id: '6aa06056af8879d815dca5ef', name: 'Galaxy S24 Ultra', url: 'https://m.media-amazon.com/images/I/71CXhVyg3YL._AC_SL1500_.jpg' },

  // Galaxy S23 FE
  { id: '6aa06056af8879d815dca656', name: 'Galaxy S23 FE', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s711bzgcins/gallery/in-galaxy-s23-fe-s711-sm-s711bzgcins-thumb-538356972' },
  { id: '6aa06056af8879d815dca656', name: 'Galaxy S23 FE', url: 'https://m.media-amazon.com/images/I/61VfL-WzB5L._AC_SL1500_.jpg' },

  // Galaxy Buds FE
  { id: '6aa06057af8879d815dcade2', name: 'Galaxy Buds FE', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-r400nzawins/gallery/in-galaxy-buds-fe-r400-sm-r400nzawins-thumb-538446187' },

  // Galaxy Watch Ultra
  { id: '6aa06057af8879d815dcae5a', name: 'Galaxy Watch Ultra', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-l705fdaains/gallery/in-galaxy-watch-ultra-l705-sm-l705fdaains-thumb-542159187' },
  { id: '6aa06057af8879d815dcae5a', name: 'Galaxy Watch Ultra', url: 'https://m.media-amazon.com/images/I/71fZ1Xv6WBL._AC_SL1500_.jpg' },

  // Galaxy Watch 7
  { id: '6aa06057af8879d815dcae69', name: 'Galaxy Watch 7', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-l310nzgains/gallery/in-galaxy-watch7-l310-sm-l310nzgains-thumb-542159142' },
  { id: '6aa06057af8879d815dcae69', name: 'Galaxy Watch 7', url: 'https://m.media-amazon.com/images/I/61Yg4E-S2TL._AC_SL1500_.jpg' },

  // Tab S9 FE
  { id: '6aa06058af8879d815dcb139', name: 'Galaxy Tab S9 FE', url: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-x510nzaains/gallery/in-galaxy-tab-s9-fe-x510-sm-x510nzaains-thumb-538446299' },
  { id: '6aa06058af8879d815dcb139', name: 'Galaxy Tab S9 FE', url: 'https://m.media-amazon.com/images/I/61H4P2yJ5WL._AC_SL1500_.jpg' }
];

async function testAll() {
  console.log('Testing image URLs...');
  for (const item of TEST_CANDIDATES) {
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`[${res.status}] ${item.name} (${item.id}) => ${item.url}`);
      if (res.status === 200) {
        const buf = Buffer.from(await res.arrayBuffer());
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        console.log(`  -> SUCCESS! Size: ${buf.length} bytes, SHA256: ${hash}`);
      }
    } catch (err) {
      console.log(`[ERR] ${item.name} => ${err.message}`);
    }
  }
}

testAll();
