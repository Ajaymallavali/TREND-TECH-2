import https from 'https';

async function fetchBingImage(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/murl&quot;:&quot;(http[^&]+)&quot;/);
        if (match) {
           resolve(match[1]);
        } else resolve(null);
      });
    }).on('error', reject);
  });
}
fetchBingImage('Dot & Key Barrier Repair Ceramides Moisturiser product').then(console.log).catch(console.error);
