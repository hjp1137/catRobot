const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = path.join(__dirname, '..', 'dist', 'assets', 'ArtManifest.js');
const snapshotPath = path.join(__dirname, '..', 'content-store', 'published', 'art-manifest.snapshot.json');
const contentSnapshotPath = path.join(__dirname, '..', 'content-store', 'published', 'content.snapshot.json');

if (!fs.existsSync(manifestPath)) {
  console.error('未找到编译产物 ArtManifest.js，请先运行 npm run build！');
  process.exit(1);
}

const { ART_MANIFEST } = require(manifestPath);

console.log('[CheckArt] 开始美术资源完整性及槽位接入检测...');
let hasError = false;

// 四类状态统计
let virtualCount = 0;
let physicalCount = 0;
let fallbackCount = 0;
let missingCount = 0;
let publishedPhysicalCount = 0;
let checksumMismatchCount = 0;
let dimensionMismatchCount = 0;
let warningCount = 0;

const missingFiles = [];

function readPngMeta(filePath) {
  const buf = fs.readFileSync(filePath);
  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.subarray(0, 8).equals(pngSig)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] };
}

function readJpegMeta(filePath) {
  const buf = fs.readFileSync(filePath);
  if (!(buf[0] === 0xff && buf[1] === 0xd8)) return null;
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    offset += 2 + length;
  }
  return null;
}

function stableJson(value) {
  return JSON.stringify(sortValue(value), null, 2);
}

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result, key) => {
    if (value[key] !== undefined) result[key] = sortValue(value[key]);
    return result;
  }, {});
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function collectArtKeys(value, output = new Set(), keyName = '') {
  const isArtField = keyName === 'artKey' || /ArtKey$/.test(keyName);
  const isArtArray = /ArtKeys$/.test(keyName);
  if (typeof value === 'string' && isArtField) {
    output.add(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string' && isArtArray) output.add(item);
      else collectArtKeys(item, output, keyName);
    }
    return output;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) collectArtKeys(item, output, key);
  }
  return output;
}

for (const [key, entry] of Object.entries(ART_MANIFEST)) {
  if (entry.virtual) {
    virtualCount++;
    console.log(`- [Virtual] 虚资源 [${key}] 跳过物理检测。`);
    continue;
  }

  const fullPath = path.join(__dirname, '..', entry.path);
  if (fs.existsSync(fullPath)) {
    physicalCount++;
    console.log(`- [Physical] 实体资源 [${key}] 已成功接入并物理存在: "${entry.path}"`);
    if (entry.width || entry.height) {
      const meta = readPngMeta(fullPath);
      if (!meta) {
        console.error(`❌ [PNG Error] 资源 [${key}] 不是合法 PNG 文件。`);
        hasError = true;
      } else if (meta.width !== entry.width || meta.height !== entry.height) {
        console.error(`❌ [Size Error] 资源 [${key}] 尺寸为 ${meta.width}x${meta.height}，Manifest 记录为 ${entry.width}x${entry.height}。`);
        hasError = true;
      }
    }
  } else {
    missingCount++;
    console.error(`❌ [Missing] 缺失资源 [${key}]: 未在物理路径 "${entry.path}" 找到对应文件。`);
    missingFiles.push({ key, path: entry.path });
    hasError = true;
  }

  if (entry.fallback) {
    if (ART_MANIFEST[entry.fallback]) {
      fallbackCount++;
    } else {
      console.error(`❌ [Fallback Error] 资源 [${key}] 的 fallback Key "${entry.fallback}" 未在 Manifest 中定义。`);
      hasError = true;
    }
  }
}

let snapshot = null;
if (fs.existsSync(snapshotPath)) {
  snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const expected = crypto.createHash('sha256').update(stableJson({ ...snapshot, checksum: '' })).digest('hex');
  if (snapshot.checksum !== expected) {
    console.error(`❌ [Snapshot Checksum] Art Manifest Snapshot checksum 不一致。expected=${expected} actual=${snapshot.checksum}`);
    checksumMismatchCount++;
    hasError = true;
  }
  const seenPaths = new Set();
  for (const [key, entry] of Object.entries(snapshot.resources ?? {})) {
    if (entry.status === 'virtual') continue;
    const fullPath = path.join(__dirname, '..', entry.path);
    if (path.isAbsolute(entry.path) || entry.path.includes('..')) {
      console.error(`❌ [Published Path] 资源 [${key}] 发布路径不是安全项目相对路径: ${entry.path}`);
      hasError = true;
      continue;
    }
    if (seenPaths.has(entry.path)) {
      console.error(`❌ [Duplicate Path] 发布路径重复: ${entry.path}`);
      hasError = true;
    }
    seenPaths.add(entry.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ [Published Missing] 发布资源 [${key}] 不存在: ${entry.path}`);
      missingCount++;
      hasError = true;
      continue;
    }
    publishedPhysicalCount++;
    const ext = path.extname(entry.path).toLowerCase();
    const meta = ext === '.jpg' || ext === '.jpeg' ? readJpegMeta(fullPath) : readPngMeta(fullPath);
    if (!meta) {
      console.error(`❌ [Published Format] 发布资源 [${key}] 真实格式不合法: ${entry.path}`);
      hasError = true;
    } else if (meta.width !== entry.width || meta.height !== entry.height) {
      console.error(`❌ [Published Size] 发布资源 [${key}] 实际 ${meta.width}x${meta.height}，快照 ${entry.width}x${entry.height}`);
      dimensionMismatchCount++;
      hasError = true;
    }
    const actual = sha256File(fullPath);
    if (actual !== entry.checksum) {
      console.error(`❌ [Published Checksum] 发布资源 [${key}] checksum 不一致。`);
      checksumMismatchCount++;
      hasError = true;
    }
    if (entry.fallback && !ART_MANIFEST[entry.fallback] && !snapshot.resources[entry.fallback]) {
      console.error(`❌ [Published Fallback] 资源 [${key}] fallback 不存在: ${entry.fallback}`);
      hasError = true;
    }
  }
} else {
  warningCount++;
  console.warn('⚠️ [Warning] 未找到发布 Art Manifest Snapshot，将只检查基础 Manifest。');
}

if (snapshot && fs.existsSync(contentSnapshotPath)) {
  const contentSnapshot = JSON.parse(fs.readFileSync(contentSnapshotPath, 'utf8'));
  for (const key of collectArtKeys(contentSnapshot)) {
    if (!ART_MANIFEST[key] && !snapshot.resources?.[key]) {
      console.error(`❌ [Content Art] 内容快照引用了不存在的 Art Key: ${key}`);
      hasError = true;
    }
  }
}

console.log('\n================ 美术资源自检报告 ================');
console.log(`- 发布实体资源 (Published Physical): ${publishedPhysicalCount} 个`);
console.log(`- 程序化虚资源 (Virtual Programmatic): ${virtualCount} 个`);
console.log(`- 已落地物理资源 (Physical Assets)  : ${physicalCount} 个`);
console.log(`- 安全降级资源数 (Fallback Keyed)    : ${fallbackCount} 个`);
console.log(`- 警告数量 (Warning)                 : ${warningCount} 个`);
console.log(`- 致命缺失资源数 (Missing Files)     : ${missingCount} 个`);
console.log(`- Checksum Mismatch                  : ${checksumMismatchCount} 个`);
console.log(`- Dimension Mismatch                 : ${dimensionMismatchCount} 个`);
console.log('==================================================');

if (hasError) {
  console.error('\n💥 资源自检失败！存在缺失的实体图片资产或错误的 fallback 配置。');
  process.exit(1);
} else {
  console.log('\n✅ 资源自检成功！全部 Manifest 文件及 fallback 配置符合规范。');
  process.exit(0);
}
