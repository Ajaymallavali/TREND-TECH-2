import fs from 'fs';

async function run() {
  const res = await fetch('https://www.samsung.com/au/tvs/neo-qled-tv/qn900d-65-inch-neo-qled-8k-smart-tv-qa65qn900awxxy/');
  const t = await res.text();
  console.log([...t.matchAll(/(?:https?:)?\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^\s"'\)<>\\]+/gi)].length);
}
run();
