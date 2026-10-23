// Cut the concept-only 4x4 atlas; this does not read or write game resources.
const fs = require('node:fs');
const path = require('node:path');
const bundle = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const sharp = require(require.resolve('sharp', { paths: [process.cwd(), bundle] }));
const names = ['head_front', 'head_side', 'head_back', 'torso_front', 'torso_side', 'torso_back', 'upper_arm', 'forearm',
  'paw_front', 'paw_side', 'thigh', 'shin', 'foot_front', 'foot_side', 'foot_back', 'tail'];
const defaultDirectory = 'Walkthroughes/screenshots/20261018_compact_cat_fourway_preview';

function largestComponent(data, width, height) {
  const labels = new Int32Array(width * height), queue = new Int32Array(width * height);
  let label = 0, bestLabel = 0, bestCount = 0;
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || data[start * 4 + 3] <= 8) continue;
    label++; let read = 0, count = 1; queue[0] = start; labels[start] = label;
    while (read < count) {
      const point = queue[read++], x = point % width, y = Math.floor(point / width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((!dx && !dy) || nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!labels[next] && data[next * 4 + 3] > 8) { labels[next] = label; queue[count++] = next; }
      }
    }
    if (count > bestCount) { bestLabel = label; bestCount = count; }
  }
  if (!bestCount) throw new Error('Atlas cell has no visible alpha component.');
  let left = width, top = height, right = 0, bottom = 0, removed = 0;
  for (let pixel = 0; pixel < labels.length; pixel++) {
    if (labels[pixel] !== bestLabel) {
      if (data[pixel * 4 + 3] > 8) removed++;
      data[pixel * 4 + 3] = 0; continue;
    }
    const x = pixel % width, y = Math.floor(pixel / width);
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1, pixels: bestCount, removed };
}

async function prepare(source, directory = defaultDirectory) {
  if (!source) throw new Error('Usage: node scripts/prepare-compact-cat-preview.cjs <transparent-4x4-atlas.png> [output-directory]');
  const input = path.resolve(source), output = path.resolve(directory), metadata = await sharp(input).metadata();
  if (!metadata.hasAlpha) throw new Error('Expected transparent RGBA concept atlas; source has no alpha channel.');
  fs.mkdirSync(path.join(output, 'parts'), { recursive: true });
  const parts = {}, audit = { source: input, size: [metadata.width, metadata.height], grid: [4, 4], parts: {} };
  for (let index = 0; index < names.length; index++) {
    const name = names[index], col = index % 4, row = Math.floor(index / 4);
    const cell = { left: Math.floor(col * metadata.width / 4), top: Math.floor(row * metadata.height / 4),
      width: Math.floor((col + 1) * metadata.width / 4) - Math.floor(col * metadata.width / 4),
      height: Math.floor((row + 1) * metadata.height / 4) - Math.floor(row * metadata.height / 4) };
    const { data, info } = await sharp(input).extract(cell).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const transparent = data.some((value, offset) => offset % 4 === 3 && value < 250);
    if (!transparent) throw new Error(name + ': no transparent background found in the source cell.');
    const content = largestComponent(data, info.width, info.height);
    if (content.pixels < 64) throw new Error(name + ': visible component is unexpectedly small.');
    const padding = Math.max(8, Math.ceil(Math.max(content.width, content.height) * 0.04));
    const file = 'parts/' + name + '.png';
    await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extract({ left: content.left, top: content.top, width: content.width, height: content.height })
      .extend({ top: padding, bottom: padding, left: padding, right: padding, background: '#00000000' })
      .png().toFile(path.join(output, file));
    const width = content.width + padding * 2, height = content.height + padding * 2;
    parts[name] = { file, width, height };
    audit.parts[name] = { cell, content, padding, width, height };
  }
  fs.writeFileSync(path.join(output, 'parts.json'), JSON.stringify(parts, null, 2));
  fs.writeFileSync(path.join(output, 'parts.js'), 'window.CAT_PARTS = ' + JSON.stringify(parts, null, 2) + ';\n');
  fs.writeFileSync(path.join(output, 'parts_preparation.json'), JSON.stringify(audit, null, 2));
  console.log(JSON.stringify({ output, parts: names.length, source: input }));
  return audit;
}
module.exports = { prepare, largestComponent, names };
if (require.main === module) prepare(process.argv[2], process.argv[3]).catch(error => {
  console.error(error.stack); process.exitCode = 1;
});
