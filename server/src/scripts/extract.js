import fs from 'fs';
const html = fs.readFileSync('temp.html', 'utf8');
const matches = html.match(/https:\/\/[a-zA-Z0-9.-]*samsung[a-zA-Z0-9.-]*\/(?:[^"'\s>]+)\.(?:jpg|png|webp)/gi);
console.log(matches ? [...new Set(matches)].slice(0, 10) : 'None');
