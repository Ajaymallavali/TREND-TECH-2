import fs from 'fs';
const dir = "C:\\Users\\ajaym\\Downloads\\img's";
const files = fs.readdirSync(dir);
console.log(`Total files: ${files.length}`);
files.forEach((f, i) => console.log(`${i + 1}: ${f}`));
