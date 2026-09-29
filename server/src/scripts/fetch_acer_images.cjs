const https = require('https');

const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' } };

const getImg = (url, name) => {
  https.get(url, options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const match = data.match(/https:\/\/[^"']+\.(?:jpg|png|webp)/gi);
      if (match) {
        console.log('\n--- ' + name + ' ---');
        console.log([...new Set(match)].filter(u => u.includes('image') || u.includes('product')).slice(0, 10).join('\n'));
      }
    });
  });
};

getImg('https://www.acer.com/us-en/predator/laptops/helios/helios-16', 'Helios 16');
getImg('https://www.acer.com/us-en/laptops/swift/swift-go-14', 'Swift Go 14');
getImg('https://www.acer.com/us-en/laptops/aspire/aspire-5-intel', 'Aspire 5');
getImg('https://www.acer.com/us-en/laptops/nitro/nitro-v-15', 'Nitro V 15');
