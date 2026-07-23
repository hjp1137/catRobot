const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const contentPath = path.join(root, 'content-store/published/content.snapshot.json');
const stagePath = path.join(root, 'content-store/published/stage-orchestration.snapshot.json');

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out, key) => {
    if (value[key] !== undefined) out[key] = stable(value[key]);
    return out;
  }, {});
}

function checksum(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stable(value), null, 2)).digest('hex');
}

function fail(message) {
  console.error(`[check:stage] ${message}`);
  process.exit(1);
}

const content = readJson(contentPath);
if (!content) fail('缺少内容快照');
if (!content.stageOrchestrationReleaseId || !content.stageOrchestrationChecksum) {
  console.log(`[check:stage] ${content.releaseVersion} 未声明 Stage Orchestration，正式运行保持旧逻辑回退。`);
  process.exit(0);
}

const snapshot = readJson(stagePath);
if (!snapshot) fail('内容快照声明了编排，但编排快照不存在');
if (snapshot.releaseId !== content.stageOrchestrationReleaseId) fail('编排快照 Release ID 不匹配');
if (snapshot.checksum !== content.stageOrchestrationChecksum) fail('编排快照 checksum 声明不匹配');
if (snapshot.checksum !== checksum({ ...snapshot, checksum: '' })) fail('编排快照 checksum 计算不一致');

let waveCount = 0;
let spawnCount = 0;
for (const stage of snapshot.stages ?? []) {
  if (!stage.stageId) fail('存在空 stageId');
  if (!stage.layout?.canvasWidth || !stage.layout?.canvasHeight) fail(`${stage.stageId} 逻辑画布尺寸不合法`);
  const hero = (stage.spawnPoints ?? []).filter(point => point.type === 'hero' && point.enabled);
  if (hero.length !== 1) fail(`${stage.stageId} 必须有且仅有一个主角出生点`);
  const pointIds = new Set((stage.spawnPoints ?? []).map(point => point.id));
  for (const wave of stage.waves ?? []) {
    waveCount += 1;
    if (!wave.entries?.length) fail(`${stage.stageId}/${wave.id} 缺少波次条目`);
    for (const entry of wave.entries) {
      if (!pointIds.has(entry.spawnPointId)) fail(`${stage.stageId}/${wave.id}/${entry.id} 引用不存在出生点`);
      if (entry.count <= 0 || entry.spawnIntervalMs < 0) fail(`${entry.id} 数量或间隔不合法`);
    }
  }
  spawnCount += stage.spawnPoints?.length ?? 0;
}

console.log(`[check:stage] Stage ${snapshot.stages?.length ?? 0} / Wave ${waveCount} / SpawnPoint ${spawnCount}，校验通过。`);
