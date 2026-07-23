const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const content = read('content-store/published/content.snapshot.json');
if (!content.stageProgressionReleaseId || !content.stageProgressionChecksum) {
  console.log(`[check:progression] LEGACY_FALLBACK ${content.releaseVersion}: 未声明 Stage Progression，不启用新奖励。`);
  process.exit(0);
}
const snapshot = read('content-store/published/stage-progression.snapshot.json');
const errors = [];
const objectiveTypes = new Set(['clear-all-waves', 'survive-duration', 'hero-health-above', 'complete-within-duration', 'defeat-enemy-count']);
const rewardTypes = new Set(['equipment', 'rune', 'material', 'currency']);
const groups = new Set(['first-clear', 'repeat-clear', 'first-three-star', 'objective-bonus']);
const catalog = new Set((snapshot.rewardCatalog || []).map(x => `${x.type}:${x.refId}`));
const stages = new Set((content.stages || []).map(x => x.id));
const edges = new Map();

if (snapshot.releaseId !== content.stageProgressionReleaseId) errors.push('releaseId 与内容快照不一致');
if (snapshot.checksum !== content.stageProgressionChecksum) errors.push('checksum 声明不一致');
if (snapshot.checksum !== checksum({ ...snapshot, checksum: '' })) errors.push('snapshot checksum 计算不一致');
for (const stage of snapshot.stages || []) {
  const ids = new Set();
  const enabled = (stage.objectives || []).filter(x => x.enabled !== false);
  if (!enabled.some(x => x.required)) errors.push(`${stage.stageId}: 缺少必需目标`);
  for (const objective of enabled) {
    if (!objective.id || ids.has(objective.id)) errors.push(`${stage.stageId}: 目标ID重复 ${objective.id}`);
    ids.add(objective.id);
    if (!objectiveTypes.has(objective.type)) errors.push(`${stage.stageId}: 目标类型非法 ${objective.type}`);
    const p = objective.params || {};
    if (objective.type === 'complete-within-duration' && !(p.maxDurationSec > 0)) errors.push(`${objective.id}: maxDurationSec 非法`);
    if (objective.type === 'hero-health-above' && !(p.minHealthRatio >= 0 && p.minHealthRatio <= 1)) errors.push(`${objective.id}: minHealthRatio 非法`);
    if (objective.type === 'survive-duration' && !(p.durationSec > 0)) errors.push(`${objective.id}: durationSec 非法`);
    if (objective.type === 'defeat-enemy-count' && !(p.count > 0)) errors.push(`${objective.id}: count 非法`);
  }
  for (const pool of stage.rewardPools || []) {
    if (!groups.has(pool.group)) errors.push(`${pool.id}: 奖励组非法`);
    if (pool.group === 'objective-bonus' && !ids.has(pool.objectiveId)) errors.push(`${pool.id}: 目标引用不存在`);
    for (const entry of pool.entries || []) {
      if (!rewardTypes.has(entry.rewardType) || !catalog.has(`${entry.rewardType}:${entry.rewardRefId}`)) errors.push(`${entry.id}: 奖励引用非法`);
      if (!(entry.minQuantity > 0) || entry.maxQuantity < entry.minQuantity) errors.push(`${entry.id}: 数量非法`);
      if (entry.probability < 0 || entry.probability > 1) errors.push(`${entry.id}: probability 非法`);
    }
  }
  for (const rule of stage.unlockRules || []) {
    if (rule.prerequisiteStageId && !stages.has(rule.prerequisiteStageId)) errors.push(`${rule.id}: 前置关卡不存在`);
    if (rule.nextStageId && !stages.has(rule.nextStageId)) errors.push(`${rule.id}: 下一关不存在`);
    if (rule.nextStageId === stage.stageId) errors.push(`${rule.id}: 自引用`);
    if (rule.type === 'prerequisite-stars' && !(rule.requiredStars >= 1 && rule.requiredStars <= 3)) errors.push(`${rule.id}: 星级条件非法`);
    if (rule.nextStageId) edges.set(stage.stageId, [...(edges.get(stage.stageId) || []), rule.nextStageId]);
  }
}
if (hasCycle(edges)) errors.push('解锁依赖存在循环');
if (snapshot.stageCount !== snapshot.stages.length) errors.push('stageCount 不一致');
if (snapshot.objectiveCount !== snapshot.stages.reduce((n, x) => n + x.objectives.length, 0)) errors.push('objectiveCount 不一致');
if (snapshot.rewardEntryCount !== snapshot.stages.reduce((n, x) => n + x.rewardPools.reduce((m, p) => m + p.entries.length, 0), 0)) errors.push('rewardEntryCount 不一致');
if (snapshot.unlockRuleCount !== snapshot.stages.reduce((n, x) => n + x.unlockRules.length, 0)) errors.push('unlockRuleCount 不一致');
if (errors.length) { console.error(errors.map(x => `- ${x}`).join('\n')); process.exit(1); }
console.log(`[check:progression] ${snapshot.releaseVersion}: Stage ${snapshot.stageCount}, Objective ${snapshot.objectiveCount}, Reward ${snapshot.rewardEntryCount}, Unlock ${snapshot.unlockRuleCount}, checksum OK`);

function read(file) { return JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8')); }
function sort(v) { if (Array.isArray(v)) return v.map(sort); if (!v || typeof v !== 'object') return v; return Object.keys(v).sort().reduce((o, k) => (v[k] === undefined ? o : (o[k] = sort(v[k]), o)), {}); }
function checksum(v) { return crypto.createHash('sha256').update(JSON.stringify(sort(v), null, 2)).digest('hex'); }
function hasCycle(graph) { const active = new Set(), done = new Set(); const visit = id => { if (active.has(id)) return true; if (done.has(id)) return false; active.add(id); for (const n of graph.get(id) || []) if (visit(n)) return true; active.delete(id); done.add(id); return false; }; return [...graph.keys()].some(visit); }
