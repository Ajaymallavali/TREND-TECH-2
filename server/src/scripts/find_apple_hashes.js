const fs = require('fs');

const ids = [
  '6aa06056af8879d815dca934', 
  '6aa06056af8879d815dca943', 
  '6aa06056af8879d815dca970', 
  '6aa06057af8879d815dcad10', 
  '6aa06057af8879d815dcad1f', 
  '6aa06057af8879d815dcad2e'
];

const found = {};

for (const file of fs.readdirSync('server/src/data/audits')) {
  if (!file.endsWith('.json')) continue;
  try {
    const text = fs.readFileSync('server/src/data/audits/' + file, 'utf8');
    const json = JSON.parse(text);
    
    // Recursive search
    const search = (obj) => {
      if (!obj) return;
      if (Array.isArray(obj)) {
        obj.forEach(search);
      } else if (typeof obj === 'object') {
        const id = obj.id || obj.productId || obj._id;
        if (ids.includes(id) && (obj.imageSha256 || obj.imageHash || obj.sha256)) {
          found[id] = obj;
        }
        Object.values(obj).forEach(search);
      }
    };
    search(json);
  } catch(e) {}
}

console.log(JSON.stringify(found, null, 2));
