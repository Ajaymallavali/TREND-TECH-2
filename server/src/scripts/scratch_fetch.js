import fs from 'fs';

async function test(url) {
  const r = await fetch(url);
  const t = await r.text();
  fs.writeFileSync('scratch.html', t);
  console.log('Done');
}
test('https://www.samsung.com/au/tvs/the-frame/ls03d-55-inch-the-frame-qled-4k-smart-tv-qa55ls03dawxxy/');
