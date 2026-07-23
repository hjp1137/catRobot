const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sort(value) {
  if (Array.isArray(value)) return value.map(sort);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out, key) => {
    if (value[key] !== undefined) out[key] = sort(value[key]); return out;
  }, {});
}
function stable(value) { return JSON.stringify(sort(value), null, 2); }
function fail(message) { throw new Error(message); }
function checksum(value) {
  return crypto.createHash('sha256').update(stable({ ...value, checksum: '' })).digest('hex');
}

function validateArtEntry(root, key, entry) {
  if (!entry) fail(`Art Key 不存在：${key}`);
  if (entry.status === 'virtual') return;
  if (entry.status && entry.status !== 'physical') fail(`Art Key 状态不可用：${key} / ${entry.status}`);
  if (!entry.versionId || !Number.isInteger(entry.versionNo) || entry.versionNo < 1) fail(`Art Key 缺少有效发布版本：${key}`);
  if (!entry.path || !entry.checksum || !(entry.width > 0) || !(entry.height > 0)) fail(`Art Key 发布元数据不完整：${key}`);
  const fullPath = path.resolve(root, entry.path);
  if (!fullPath.startsWith(root + path.sep) || !fs.existsSync(fullPath)) fail(`Art Key 发布文件不存在：${key}`);
  const actual = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
  if (actual !== entry.checksum) fail(`Art Key 发布文件 checksum 错误：${key}`);
}

function validateGraph(chapter) {
  const nodes = new Map((chapter.nodes ?? []).map(node => [node.id, node]));
  const starts = [...nodes.values()].filter(node => node.isStart);
  const ends = [...nodes.values()].filter(node => node.isEnd);
  if (starts.length !== 1 || ends.length < 1) fail(`${chapter.id} 起始/终点节点数量不合法`);
  const seen = new Set([starts[0].id]); const queue = [starts[0].id];
  while (queue.length) {
    const id = queue.shift();
    for (const edge of chapter.connections ?? []) if (edge.enabled !== false && edge.fromNodeId === id && !seen.has(edge.toNodeId)) {
      seen.add(edge.toNodeId); queue.push(edge.toNodeId);
    }
  }
  if (!ends.some(node => seen.has(node.id))) fail(`${chapter.id} 不存在起点到终点路径`);
  for (const edge of chapter.connections ?? []) if (!nodes.has(edge.fromNodeId) || !nodes.has(edge.toNodeId) || edge.fromNodeId === edge.toNodeId) fail(`${chapter.id} 连线引用不合法`);
}

function validateCampaignAssets(inputRoot) {
  const root = path.resolve(inputRoot);
  const published = path.join(root, 'content-store/published');
  const content = JSON.parse(fs.readFileSync(path.join(published, 'content.snapshot.json'), 'utf8'));
  if (!content.campaignSnapshotReleaseId || !content.campaignSnapshotChecksum) {
    return { message: `${content.releaseVersion} 未声明 Campaign Snapshot，正式游戏保持 LEGACY_FALLBACK。`, legacyFallback: true };
  }
  const campaignPath = path.join(published, 'campaign.snapshot.json');
  if (!fs.existsSync(campaignPath)) fail('内容快照已声明 Campaign，但 campaign.snapshot.json 缺失');
  const snapshot = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
  if (snapshot.checksum !== checksum(snapshot) || snapshot.checksum !== content.campaignSnapshotChecksum) fail('Campaign checksum 不一致');
  if (snapshot.releaseId !== content.campaignSnapshotReleaseId) fail('Campaign releaseId 与内容快照不一致');
  if (!content.artManifestReleaseId || !content.artManifestChecksum) fail('内容快照未声明 Art Snapshot');
  const artPath = path.join(published, 'art-manifest.snapshot.json');
  if (!fs.existsSync(artPath)) fail('内容快照已声明 Art Snapshot，但文件缺失');
  const artSnapshot = JSON.parse(fs.readFileSync(artPath, 'utf8'));
  if (artSnapshot.releaseId !== content.artManifestReleaseId) fail('Art Snapshot releaseId 与内容快照不一致');
  if (artSnapshot.checksum !== content.artManifestChecksum || artSnapshot.checksum !== checksum(artSnapshot)) fail('Art Snapshot checksum 不一致');
  const art = artSnapshot.resources ?? {}; const stages = new Set((content.stages ?? []).map(stage => stage.id)); const ids = new Set();
  for (const campaign of snapshot.campaigns ?? []) for (const chapter of campaign.chapters ?? []) {
    validateGraph(chapter);
    for (const key of [campaign.coverArtKey, chapter.backgroundArtKey].filter(Boolean)) validateArtEntry(root, key, art[key]);
    for (const node of chapter.nodes ?? []) {
      if (ids.has(node.id)) fail(`节点ID重复：${node.id}`); ids.add(node.id);
      if (!stages.has(node.stageId)) fail(`Stage引用不存在：${node.stageId}`);
      if (node.iconArtKey) validateArtEntry(root, node.iconArtKey, art[node.iconArtKey]);
    }
  }
  return { message: `Campaign ${snapshot.campaignCount}，Chapter ${snapshot.chapterCount}，Node ${snapshot.nodeCount}。`, legacyFallback: false };
}

module.exports = { validateCampaignAssets };
