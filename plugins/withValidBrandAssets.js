const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  t.copy(out, 4); data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([t, data])), 8 + data.length);
  return out;
}
function makePng(size = 256) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1); raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const i = row + 1 + x * 4;
      const cx = size / 2, cy = size / 2;
      const dx = x - cx, dy = y - cy;
      const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
      let r = 2, g = 7, b = 6, a = 255;
      if (edge < 14) { g = 90 + Math.round((14 - edge) * 8); r = 20; b = 20; }
      if (Math.abs(dx) < size * .08 && Math.abs(dy) < size * .27) { g = 240; r = 110; b = 20; }
      if (dx > -size*.02 && dx < size*.20 && Math.abs(dy) < size*.18 && dy > -dx*1.1 && dy < dx*1.1) { g = 235; r = 120; b = 25; }
      const bars=[-.32,-.22,-.12,.28,.38,.48];
      for (const p of bars) if (Math.abs(dx/size-p)<.025) { const h = Math.abs(p)<.15?.24:.17; if (Math.abs(dy/size)<h) {g=220;r=80;b=20;} }
      raw[i]=r; raw[i+1]=g; raw[i+2]=b; raw[i+3]=a;
    }
  }
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(size,0); ihdr.writeUInt32BE(size,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
module.exports = function withValidBrandAssets(config) {
  const png=makePng(256), root=process.cwd();
  for (const f of ['icon.png','splash-icon.png','favicon.png','android-icon-foreground.png','android-icon-monochrome.png','logo-source.png']) fs.writeFileSync(path.join(root,'assets',f),png);
  return config;
};
