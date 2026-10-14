import https from 'https';

async function fetchImage(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find the first image in duckduckgo HTML result
        const match = data.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) {
           let url = match[1];
           if (url.startsWith('//')) url = 'https:' + url;
           resolve(url);
        } else resolve(null);
      });
    }).on('error', reject);
  });
}
fetchImage('Dot Key Barrier Repair Ceramides Moisturiser product image').then(console.log).catch(console.error);
