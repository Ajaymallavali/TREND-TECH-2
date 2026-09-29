import fs from 'fs';

async function run() {
  const res = await fetch('https://www.samsung.com/au/smartphones/galaxy-s23-fe/buy/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();
  const regex = /https:\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^"'\s>]+\.(?:jpg|png|webp)/gi;
  const matches = html.match(regex);
  const dedup = matches ? [...new Set(matches)] : [];
  console.log('Matches:', dedup.length);
  if (dedup) console.log(dedup.slice(0, 10));
}
run();
