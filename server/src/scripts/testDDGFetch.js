import fs from 'fs';

async function searchDuckDuckGo(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
  });
  const html = await res.text();
  // DuckDuckGo returns images in img tags inside the .result__snippet or similar.
  // Actually, DuckDuckGo image search is different.
  console.log(html.length);
  fs.writeFileSync('ddg.html', html);
}
searchDuckDuckGo('Apple iPhone 17 Pro Max official front view site:amazon.in');
