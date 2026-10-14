import https from 'https';

async function fetchUrlHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchUrlHtml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchUrlHtml('https://www.amazon.in/dp/B0B4666ZFR') // Random Dot & Key product
  .then(html => {
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*name=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<img[^>]*id=["']landingImage["'][^>]*src=["']([^"']+)["']/i);
    console.log(ogImage ? ogImage[1] : 'No image found');
  })
  .catch(console.error);
