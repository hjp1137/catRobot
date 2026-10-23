const fs = require('fs');
const path = require('path');
const sharp = require('../server/node_modules/sharp');

const root = path.resolve('scratch/task35-stage11-animation');
const sheets = [
  ['hero', 'C:/Users/xping/.codex/generated_images/019fa79d-a6da-7430-a52b-9407b7a452b6/exec-d7ab9ff6-deea-4f20-b7bb-723d364c1576.png'],
  ['mouse', 'C:/Users/xping/.codex/generated_images/019fa79d-a6da-7430-a52b-9407b7a452b6/exec-81396d6f-12c9-49ea-b5fb-61a36e227d84.png'],
  ['guard', 'C:/Users/xping/.codex/generated_images/019fa79d-a6da-7430-a52b-9407b7a452b6/exec-99e7a392-3229-45ed-b63e-6e556cd9bdb6.png'],
];

function chroma(buffer) {
  for (let i = 0; i < buffer.length; i += 4) {
    const r = buffer[i], g = buffer[i + 1], b = buffer[i + 2];
    const excess = g - Math.max(r, b);
    if (g > 80 && excess > 18) {
      const strength = Math.min(1, (excess - 18) / 80);
      buffer[i + 1] = Math.min(g, Math.max(r, b));
      buffer[i + 3] = Math.round(255 * (1 - strength));
    }
  }
  return buffer;
}

function alphaBounds(data, width, height) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] < 20) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

async function processSheet(name, source) {
  const sourceDir = path.join(root, 'source');
  fs.mkdirSync(sourceDir, { recursive: true });
  const sheetPath = path.join(sourceDir, `${name}-directional-chroma.png`);
  fs.copyFileSync(source, sheetPath);
  const meta = await sharp(sheetPath).metadata();
  const cells = [];
  for (let row = 0; row < 2; row++) for (let col = 0; col < 6; col++) {
    const left = Math.round(meta.width * col / 6), right = Math.round(meta.width * (col + 1) / 6);
    const top = Math.round(meta.height * row / 2), bottom = Math.round(meta.height * (row + 1) / 2);
    const raw = await sharp(sheetPath).extract({ left, top, width: right - left, height: bottom - top })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    chroma(raw.data);
    cells.push({ row, col, raw, bounds: alphaBounds(raw.data, raw.info.width, raw.info.height) });
  }
  const maxW = Math.max(...cells.map(c => c.bounds.width));
  const maxH = Math.max(...cells.map(c => c.bounds.height));
  const scale = Math.min(420 / maxW, 420 / maxH);
  for (const cell of cells) {
    const direction = cell.row === 0 ? 'down' : 'up';
    const outDir = path.join(root, name, direction);
    fs.mkdirSync(outDir, { recursive: true });
    const trimmed = await sharp(cell.raw.data, { raw: cell.raw.info }).extract(cell.bounds).png().toBuffer();
    const width = Math.max(1, Math.round(cell.bounds.width * scale));
    const height = Math.max(1, Math.round(cell.bounds.height * scale));
    const sprite = await sharp(trimmed).resize(width, height, { fit: 'fill' }).png().toBuffer();
    const left = Math.round((512 - width) / 2), top = 472 - height;
    await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: sprite, left, top }]).png().toFile(path.join(outDir, `${name}-run-${direction}-${cell.col + 1}.png`));
  }
  console.log(`${name}: 12 frames, common scale ${scale.toFixed(3)}`);
}

(async () => { for (const sheet of sheets) await processSheet(...sheet); })().catch(error => {
  console.error(error); process.exitCode = 1;
});
