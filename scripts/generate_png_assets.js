const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height rows, each starts with 0 filter byte, followed by width * 3 RGB bytes
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Draw a subtle rounded card or logo accent
      const margin = Math.floor(Math.min(width, height) * 0.15);
      const isInner = x >= margin && x < width - margin && y >= margin && y < height - margin;
      if (isInner) {
        rawData[pxOffset] = 99;   // Indigo-600 RGB (99, 102, 241)
        rawData[pxOffset + 1] = 102;
        rawData[pxOffset + 2] = 241;
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crcBuf = buf.slice(4, 8 + len);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);

  return buf;
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const publicDir = path.join(__dirname, '..', 'public');

// Generate 192x192 PNG Icon
const icon192 = createPng(192, 192, 15, 23, 42); // Dark slate bg (15, 23, 42)
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

// Generate 512x512 PNG Icon
const icon512 = createPng(512, 512, 15, 23, 42);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

// Generate Mobile Screenshot (720x1280)
const screenshotMobile = createPng(720, 1280, 15, 23, 42);
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), screenshotMobile);

// Generate Desktop Screenshot (1280x720)
const screenshotDesktop = createPng(1280, 720, 15, 23, 42);
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), screenshotDesktop);

console.log('Successfully generated PWA PNG icons and screenshots in frontend/public!');
