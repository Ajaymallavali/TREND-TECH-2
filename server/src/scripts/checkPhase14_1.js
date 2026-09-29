import fs from 'fs';
import crypto from 'crypto';

function getJpegSize(buffer) {
    let offset = 2; // Skip FFD8
    while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) return null; // Invalid marker
        const marker = buffer[offset + 1];
        if (marker >= 0xC0 && marker <= 0xC3) { // SOF0 - SOF3
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            return { width, height };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
    }
    return null;
}
function getPngSize(buffer) {
    if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

function processImage(id) {
    const p = `src/data/product-images/samsung/${id}/primary.jpg`;
    if (!fs.existsSync(p)) { console.log(id, 'Missing'); return; }
    const buf = fs.readFileSync(p);
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    let size = getJpegSize(buf);
    if (!size) size = getPngSize(buf);
    console.log(id);
    console.log(`  Size: ${buf.length} bytes`);
    console.log(`  Hash: ${hash}`);
    console.log(`  Dimensions: ${size ? size.width + 'x' + size.height : 'Unknown'}`);
}
['6aa06057af8879d815dcab5d', '6aa06057af8879d815dcafe0', '6aa06057af8879d815dcafef'].forEach(processImage);
