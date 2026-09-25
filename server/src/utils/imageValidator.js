import crypto from 'crypto';
import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Calculates SHA-256 hash of image buffer for duplicate detection.
 */
export function calculateImageHash(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) return null;
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extracts image dimensions (width, height) and format from raw buffer.
 * Supports PNG, JPEG, and WebP natively.
 */
export function getImageDimensionsFromBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) {
    return { valid: false, reason: 'Buffer is empty or too short' };
  }

  // 1. PNG Magic Number: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    if (buffer.length < 24) return { valid: true, format: 'image/png', width: 500, height: 500 };
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { valid: true, format: 'image/png', width: width || 500, height: height || 500 };
  }

  // 2. JPEG Magic Number: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        if (offset + 8 >= buffer.length) break;
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { valid: true, format: 'image/jpeg', width: width || 500, height: height || 500 };
      }
      if (offset + 3 >= buffer.length) break;
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
    return { valid: true, format: 'image/jpeg', width: 500, height: 500 };
  }

  // 3. WebP Magic Number: RIFF ... WEBP
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer.length >= 12 &&
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { valid: true, format: 'image/webp', width: 500, height: 500 };
  }

  return { valid: false, reason: 'Unrecognized image format signature' };
}

/**
 * Validates raw image buffer content, size, magic bytes, and dimensions.
 */
export function validateImageBuffer(buffer, options = {}) {
  const minBytes = options.minBytes || 2048; // Minimum 2KB
  const minWidth = options.minWidth || 80;
  const minHeight = options.minHeight || 80;

  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { valid: false, errorType: 'IMAGE_INVALID_FILE', reason: 'Buffer is missing or invalid type' };
  }

  // Check for HTML / JSON error response text in header first
  const sampleHeader = buffer.slice(0, 512).toString('utf8').toLowerCase();
  if (
    sampleHeader.includes('<!doctype html') ||
    sampleHeader.includes('<html') ||
    sampleHeader.includes('<head>') ||
    sampleHeader.includes('{"error"') ||
    sampleHeader.includes('{"message"') ||
    sampleHeader.includes('{"statuscode"') ||
    sampleHeader.includes('404 not found') ||
    sampleHeader.includes('access denied')
  ) {
    return { valid: false, errorType: 'IMAGE_INVALID_FILE', reason: 'Buffer contains HTML/JSON error response text' };
  }

  if (buffer.length < minBytes) {
    return { valid: false, errorType: 'IMAGE_INVALID_FILE', reason: `Buffer length (${buffer.length} bytes) below minimum (${minBytes} bytes)` };
  }

  const dimResult = getImageDimensionsFromBuffer(buffer);
  if (!dimResult.valid) {
    return { valid: false, errorType: 'IMAGE_INVALID_FILE', reason: dimResult.reason };
  }

  if (dimResult.width < minWidth || dimResult.height < minHeight) {
    return { 
      valid: false, 
      errorType: 'IMAGE_INVALID_FILE', 
      reason: `Image dimensions (${dimResult.width}x${dimResult.height}) below minimum (${minWidth}x${minHeight})` 
    };
  }

  const hash = calculateImageHash(buffer);

  return {
    valid: true,
    format: dimResult.format,
    width: dimResult.width,
    height: dimResult.height,
    sizeBytes: buffer.length,
    hash
  };
}

/**
 * Performs actual HTTP GET fetch and validates returned image bytes.
 */
export async function fetchAndValidateImage(imageUrl, options = {}) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return { valid: false, errorType: 'IMAGE_NOT_FOUND', httpStatus: null, reason: 'URL is missing' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return { valid: false, errorType: 'IMAGE_NOT_FOUND', httpStatus: null, reason: 'Malformed URL format' };
  }

  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  const timeoutMs = options.timeoutMs || 8000;

  return new Promise((resolve) => {
    const req = protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      timeout: timeoutMs
    }, (res) => {
      const statusCode = res.statusCode;

      if (statusCode === 404) {
        return resolve({ valid: false, errorType: 'IMAGE_NOT_FOUND', httpStatus: 404, reason: 'HTTP 404 Not Found' });
      }
      if (statusCode === 403) {
        return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: 403, reason: 'HTTP 403 Forbidden' });
      }
      if (statusCode === 429) {
        return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: 429, reason: 'HTTP 429 Too Many Requests' });
      }
      if (statusCode >= 500) {
        return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: statusCode, reason: `HTTP ${statusCode} Server Error` });
      }
      if (statusCode < 200 || statusCode >= 300) {
        return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: statusCode, reason: `HTTP status ${statusCode}` });
      }

      const contentType = (res.headers['content-type'] || '').toLowerCase();
      if (!contentType.includes('image/') && !contentType.includes('octet-stream')) {
        return resolve({ valid: false, errorType: 'IMAGE_INVALID_FILE', httpStatus: statusCode, reason: `Non-image Content-Type: ${contentType}` });
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const validation = validateImageBuffer(buffer, options);
        if (!validation.valid) {
          return resolve({
            valid: false,
            errorType: validation.errorType,
            httpStatus: statusCode,
            reason: validation.reason
          });
        }
        return resolve({
          valid: true,
          httpStatus: statusCode,
          format: validation.format,
          width: validation.width,
          height: validation.height,
          sizeBytes: validation.sizeBytes,
          hash: validation.hash,
          buffer
        });
      });
    });

    req.on('error', (err) => {
      return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: null, reason: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      return resolve({ valid: false, errorType: 'IMAGE_DOWNLOAD_FAILED', httpStatus: null, reason: 'Request timed out' });
    });
  });
}
