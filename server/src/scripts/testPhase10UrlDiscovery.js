import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const candidateUrls = [
  // Z Fold 6
  { id: '6a9904e369652590e0aadc00', name: 'Galaxy Z Fold 6', url: 'https://images.samsung.com/in/smartphones/galaxy-z-fold6/images/galaxy-z-fold6-share-image.jpg' },
  // Z Flip 6
  { id: '6a9904e369652590e0aadc02', name: 'Galaxy Z Flip 6', url: 'https://images.samsung.com/in/smartphones/galaxy-z-flip6/images/galaxy-z-flip6-share-image.jpg' },
  // S24 Ultra
  { id: '6aa06056af8879d815dca5ef', name: 'Galaxy S24 Ultra', url: 'https://images.samsung.com/in/smartphones/galaxy-s24-ultra/images/galaxy-s24-ultra-share-image.jpg' },
  // S24+
  { id: '6aa06056af8879d815dca604', name: 'Galaxy S24+', url: 'https://images.samsung.com/in/smartphones/galaxy-s24/images/galaxy-s24-share-image.jpg' },
  // S23 FE
  { id: '6aa06056af8879d815dca656', name: 'Galaxy S23 FE', url: 'https://images.samsung.com/in/smartphones/galaxy-s23-fe/images/galaxy-s23-fe-share-image.jpg' },
  // Buds FE
  { id: '6aa06057af8879d815dcade2', name: 'Galaxy Buds FE', url: 'https://images.samsung.com/in/audio-sound/galaxy-buds-fe/images/galaxy-buds-fe-share-image.jpg' },
  // Watch Ultra
  { id: '6aa06057af8879d815dcae5a', name: 'Galaxy Watch Ultra', url: 'https://images.samsung.com/in/watches/galaxy-watch-ultra/images/galaxy-watch-ultra-share-image.jpg' },
  // Watch 7
  { id: '6aa06057af8879d815dcae69', name: 'Galaxy Watch 7', url: 'https://images.samsung.com/in/watches/galaxy-watch7/images/galaxy-watch7-share-image.jpg' },
  // Watch 6 Classic
  { id: '6aa06057af8879d815dcae78', name: 'Galaxy Watch 6 Classic', url: 'https://images.samsung.com/in/watches/galaxy-watch6/images/galaxy-watch6-share-image.jpg' },
  // Tab S9 FE
  { id: '6aa06058af8879d815dcb139', name: 'Galaxy Tab S9 FE', url: 'https://images.samsung.com/in/tablets/galaxy-tab-s9-fe/images/galaxy-tab-s9-fe-share-image.jpg' },
  // Tab A9+
  { id: '6aa06058af8879d815dcb148', name: 'Galaxy Tab A9+', url: 'https://images.samsung.com/in/tablets/galaxy-tab-a9/images/galaxy-tab-a9-share-image.jpg' },
  // Tab Active5
  { id: '6aa06058af8879d815dcb1fc', name: 'Galaxy Tab Active5 Rugged', url: 'https://images.samsung.com/in/business/tablets/galaxy-tab-active5-5g/images/galaxy-tab-active5-5g-share-image.jpg' },
  // Odyssey OLED G9
  { id: '6aa06057af8879d815dcafe0', name: 'Odyssey OLED G9 49"', url: 'https://images.samsung.com/in/monitors/gaming/odyssey-oled-g9/images/odyssey-oled-g9-share-image.jpg' },
  // Odyssey OLED G8
  { id: '6aa06057af8879d815dcafef', name: 'Odyssey OLED G8 32"', url: 'https://images.samsung.com/in/monitors/gaming/odyssey-oled-g8/images/odyssey-oled-g8-share-image.jpg' },
  // Smart Monitor M8
  { id: '6aa06057af8879d815dcaffe', name: 'Smart Monitor M8 32"', url: 'https://images.samsung.com/in/monitors/smart/smart-monitor-m8/images/smart-monitor-m8-share-image.jpg' },
  // 65" QN900D
  { id: '6aa06057af8879d815dcab3f', name: '65" Neo QLED 8K (QN900D)', url: 'https://images.samsung.com/in/tvs/neo-qled-tv/qn900d/images/qn900d-share-image.jpg' },
  // 55" The Frame
  { id: '6aa06057af8879d815dcab4e', name: '55" The Frame TV QLED', url: 'https://images.samsung.com/in/tvs/the-frame/ls03d/images/the-frame-share-image.jpg' },
  // 65" S90D
  { id: '6aa06057af8879d815dcab5d', name: '65" OLED 4K (S90D)', url: 'https://images.samsung.com/in/tvs/oled-tv/s90d/images/s90d-share-image.jpg' },
  // 50" Crystal 4K
  { id: '6aa06057af8879d815dcab6c', name: '50" Crystal 4K Vivid Pro', url: 'https://images.samsung.com/in/tvs/crystal-uhd-tv/due77/images/due77-share-image.jpg' },
  // 75" QN85D
  { id: '6aa06057af8879d815dcac7a', name: '75" QN85D Neo QLED 4K', url: 'https://images.samsung.com/in/tvs/neo-qled-tv/qn85d/images/qn85d-share-image.jpg' }
];

async function testAllUrls() {
  console.log('Testing official Samsung share-image URLs...\n');
  for (const item of candidateUrls) {
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
    } catch (e) {
      console.log(`  -> ERR: ${item.name} => ${e.message}`);
    }
  }
}

testAllUrls();
