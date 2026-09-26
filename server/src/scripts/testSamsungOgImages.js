import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  { name: 'Galaxy Z Fold 6', url: 'https://www.samsung.com/in/smartphones/galaxy-z-fold6/' },
  { name: 'Galaxy Z Flip 6', url: 'https://www.samsung.com/in/smartphones/galaxy-z-flip6/' },
  { name: 'Galaxy S24 Ultra', url: 'https://www.samsung.com/in/smartphones/galaxy-s24-ultra/' },
  { name: 'Galaxy S23 FE', url: 'https://www.samsung.com/in/smartphones/galaxy-s23-fe/' },
  { name: 'Galaxy Buds FE', url: 'https://www.samsung.com/in/audio-sound/galaxy-buds/galaxy-buds-fe-white-sm-r400nzawins/' },
  { name: 'Galaxy Watch Ultra', url: 'https://www.samsung.com/in/watches/galaxy-watch-ultra/' },
  { name: 'Galaxy Watch 7', url: 'https://www.samsung.com/in/watches/galaxy-watch7/' },
  { name: 'Galaxy Tab S9 FE', url: 'https://www.samsung.com/in/tablets/galaxy-tab-s/galaxy-tab-s9-fe-gray-128gb-sm-x510nzaains/' }
];

async function testPageFetch() {
  console.log('Testing official Samsung product page og:image extraction...\n');

  for (const page of pages) {
    try {
      const res = await fetch(page.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      console.log(`[${res.status}] ${page.name} => ${page.url}`);
      if (res.status === 200) {
        const text = await res.text();
        const ogMatch = text.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                        text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        
        const twitterMatch = text.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                             text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

        const ogUrl = ogMatch ? ogMatch[1] : null;
        const twitterUrl = twitterMatch ? twitterMatch[1] : null;

        console.log(`  -> og:image: ${ogUrl}`);
        console.log(`  -> twitter:image: ${twitterUrl}`);

        const imgUrl = ogUrl || twitterUrl;
        if (imgUrl) {
          const imgRes = await fetch(imgUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          console.log(`  -> Download Status: ${imgRes.status}, Content-Type: ${imgRes.headers.get('content-type')}`);
          if (imgRes.status === 200) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            const hash = crypto.createHash('sha256').update(buf).digest('hex');
            console.log(`  -> SUCCESS! Size: ${buf.length} bytes, SHA256: ${hash}`);
          }
        }
      }
    } catch (e) {
      console.log(`  -> ERR: ${e.message}`);
    }
    console.log('');
  }
}

testPageFetch();
