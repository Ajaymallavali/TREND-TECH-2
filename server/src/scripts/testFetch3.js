import fs from 'fs';
async function testPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
  const html = await res.text();
  const regex = /https:\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^"'\s>]+\.(?:jpg|png|webp)/gi;
  const matches = html.match(regex);
  const dedup = matches ? [...new Set(matches)] : [];
  console.log(url, dedup.length);
}
async function run() {
  await testPage('https://www.samsung.com/us/watches/galaxy-watch-ultra/');
}
run();
