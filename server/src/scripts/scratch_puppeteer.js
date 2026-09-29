import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const urls = [
    'https://www.samsung.com/au/tvs/the-frame/ls03d-55-inch-the-frame-qled-4k-smart-tv-qa55ls03dawxxy/',
    'https://www.samsung.com/in/tvs/uhd-4k-tv/due77-50-inch-crystal-uhd-4k-smart-tv-ua50due77akxxl/',
    'https://www.samsung.com/au/monitors/gaming/odyssey-oled-g9-g95sc-49-inch-240hz-curved-dual-qhd-ls49cg954sexxy/',
    'https://www.samsung.com/au/monitors/smart-monitor/smart-monitor-m8-32-inch-smart-tv-experience-ls32dm801uexxy/',
    'https://www.samsung.com/in/business/tablets/galaxy-tab-active/galaxy-tab-active5-5g-sm-x306bzggins/'
  ];
  
  for (const url of urls) {
     console.log(`Loading ${url}...`);
     await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
     
     // Scroll down to load lazy images
     await page.evaluate(() => window.scrollTo(0, 1000));
     await new Promise(r => setTimeout(r, 2000));
     
     const content = await page.content();
     const matches = [...content.matchAll(/(?:https?:)?\/\/images\.samsung\.com\/is\/image\/samsung\/p6pim\/[^\s\"\'\)<>\\]+/gi)];
     console.log(`Found ${matches.length} p6pim urls.`);
     console.log(matches.map(m=>m[0]).slice(0, 5));
  }
  
  await browser.close();
}
run();
