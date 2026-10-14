import https from 'https';

async function fetchUrlHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchUrlHtml('https://www.instagram.com/reel/Da0FnsaBPQU/?slkn=MWNuNm0xNjQxaG02bA==')
  .then(html => {
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    console.log("Instagram Reel Thumbnail:", ogImage ? ogImage[1] : 'Not found');
  });
