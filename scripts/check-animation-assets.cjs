const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const animationPath = path.join(root, 'content-store/published/animation-manifest.snapshot.json');
const artPath = path.join(root, 'content-store/published/art-manifest.snapshot.json');
const manifestPath = path.join(root, 'dist/assets/ArtManifest.js');

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result, key) => {
    if (value[key] !== undefined) result[key] = sortValue(value[key]);
    return result;
  }, {});
}

function stableJson(value) {
  return JSON.stringify(sortValue(value), null, 2);
}

function main() {
  console.log('[CheckAnimation] 开始动作片段快照校验...');
  if (!fs.existsSync(animationPath)) throw new Error('缺少 animation-manifest.snapshot.json');
  if (!fs.existsSync(manifestPath)) throw new Error('缺少 dist/assets/ArtManifest.js，请先运行 npm run build');
  const snapshot = JSON.parse(fs.readFileSync(animationPath, 'utf8'));
  const artSnapshot = fs.existsSync(artPath) ? JSON.parse(fs.readFileSync(artPath, 'utf8')) : { resources: {} };
  const { ART_MANIFEST } = require(manifestPath);
  const expected = crypto.createHash('sha256').update(stableJson({ ...snapshot, checksum: '' })).digest('hex');
  if (snapshot.checksum !== expected) throw new Error(`checksum 不一致：${snapshot.checksum} != ${expected}`);
  const keys = new Set();
  for (const clip of snapshot.clips ?? []) {
    if (!clip.key || !clip.targetType || !clip.state) throw new Error(`Clip 基础字段缺失：${clip.key}`);
    if (!['enemy', 'hero', 'effect'].includes(clip.targetType)) throw new Error(`targetType 不合法：${clip.key}`);
    if (!['loop', 'once', 'hold-last-frame'].includes(clip.playMode)) throw new Error(`playMode 不合法：${clip.key}`);
    if (!clip.frames?.length) throw new Error(`Clip 缺少帧：${clip.key}`);
    clip.frames.forEach((frame, index) => {
      if (frame.order !== index) throw new Error(`帧顺序必须从0连续：${clip.key}`);
      if (frame.durationMs != null && frame.durationMs <= 0) throw new Error(`帧时长不合法：${clip.key}`);
      if (!ART_MANIFEST[frame.artKey] && !artSnapshot.resources?.[frame.artKey]) throw new Error(`帧 Art Key 不存在：${frame.artKey}`);
      keys.add(frame.artKey);
    });
  }
  console.log(`[CheckAnimation] 通过。AnimationClip ${snapshot.clips?.length ?? 0}，FrameArtKey ${keys.size}。`);
}

try {
  main();
} catch (error) {
  console.error('[CheckAnimation] 失败：', error.message);
  process.exit(1);
}
