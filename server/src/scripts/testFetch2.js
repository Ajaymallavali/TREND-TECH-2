import fs from 'fs';

async function testPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
  const html = await res.text();
  const regex = /https:\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^"'\s>]+\.(?:jpg|png|webp)/gi;
  const matches = html.match(regex);
  const dedup = matches ? [...new Set(matches)] : [];
  console.log(url, dedup.length);
  if (dedup.length > 0) console.log(dedup[0]);
}

async function run() {
  await testPage('https://www.samsung.com/in/smartphones/galaxy-s23-fe/');
  await testPage('https://www.samsung.com/uk/smartphones/galaxy-s23-fe/buy/');
  await testPage('https://www.samsung.com/sg/smartphones/galaxy-s23-fe/buy/');
}
run();
