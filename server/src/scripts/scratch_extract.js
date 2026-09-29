import fs from 'fs';

const html = fs.readFileSync('scratch.html', 'utf8');
const matches = html.match(/images\.samsung\.com[^\"\'\\]+p6pim[^\"\'\\]+/gi);
console.log(matches ? [...new Set(matches)].slice(0, 20) : 'None');
