'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { TUTORIAL_COMPLETIONS, TUTORIAL_FEATURES, TUTORIAL_STATIC_TARGETS, TUTORIAL_TRIGGERS } = require('../shared/tutorial-catalog');
const { validateTutorialPublication } = require('../shared/tutorial-publication-validation');

function checkTutorialAssets({ root, fsImpl = fs }) {
  const errors = []; const content = read(root, 'content-store/published/content.snapshot.json', fsImpl);
  if (!content) return result(false, 'LEGACY_FALLBACK', 'content-snapshot-missing', errors);
  if (!content.tutorialSnapshotReleaseId || !content.tutorialSnapshotChecksum || !content.tutorialSnapshotPath) {
    return result(true, 'LEGACY_FALLBACK', 'tutorial-snapshot-not-declared', errors);
  }
  if (content.tutorialSnapshotPath !== 'content-store/published/tutorial.snapshot.json') errors.push('Tutorial path声明非法');
  const snapshot = read(root, 'content-store/published/tutorial.snapshot.json', fsImpl);
  if (!snapshot) errors.push('Tutorial snapshot不存在');
  if (snapshot) {
    const actual = checksum({ ...snapshot, checksum: '' });
    if (actual !== snapshot.checksum || actual !== content.tutorialSnapshotChecksum) errors.push('Tutorial checksum不匹配');
    if (snapshot.releaseId !== content.releaseId || snapshot.releaseId !== content.tutorialSnapshotReleaseId) errors.push('Tutorial release不匹配');
    errors.push(...validateTutorialPublication(snapshot));
  }
  return result(errors.length === 0, 'PUBLISHED', errors.length ? 'invalid' : 'ok', errors);
}

function validateSnapshot(snapshot, content, art, errors) {
  const flows = Array.isArray(snapshot.flows) ? snapshot.flows : [];
  unique(flows, 'Flow', errors);
  const stages = new Set((content.stages || []).map(x => x.id));
  const campaigns = new Set((content.campaignDefinitions || []).map(x => x.id));
  const features = new Set(TUTORIAL_FEATURES.map(x => x.id));
  const targets = new Set(TUTORIAL_STATIC_TARGETS.map(x => `${x[0]}:${x[1]}`));
  const artKeys = new Set(Object.entries(art && art.resources || {}).filter(([, value]) =>
    !['missing', 'invalid'].includes(value && value.status)).map(([key]) => key));
  for (const flow of flows) {
    if (!Array.isArray(flow.steps) || !flow.steps.length) { errors.push(`${flow.id}: enabled Flow无Step`); continue; }
    unique(flow.steps, 'Step', errors); unique(flow.transitions || [], 'Transition', errors); unique(flow.unlockRules || [], 'Rule', errors);
    validateGraph(flow, errors);
    if (flow.campaignId && !campaigns.has(flow.campaignId)) errors.push(`${flow.id}: Campaign无效`);
    for (const step of flow.steps) {
      if (!TUTORIAL_TRIGGERS.includes(step.triggerType) || !TUTORIAL_COMPLETIONS.includes(step.completionType)) errors.push(`${step.id}: Trigger/Completion无效`);
      if (step.timeoutMs != null && (!Number.isInteger(step.timeoutMs) || step.timeoutMs < 0)) errors.push(`${step.id}: timeout无效`);
      if ((step.force || step.blockInput) && !step.fallbackAction) errors.push(`${step.id}: force缺fallback`);
      const targetOk = step.targetType === 'ui' || step.targetType === 'canvas' ? targets.has(`${step.targetType}:${step.targetId}`)
        : step.targetType === 'stage' ? stages.has(step.targetId) : step.targetType === 'campaign' ? campaigns.has(step.targetId)
          : step.targetType === 'feature' ? features.has(step.targetId) : step.targetType === 'art' ? artKeys.has(step.targetId) : false;
      if (!targetOk) errors.push(`${step.id}: Target无效`);
      if (step.stageId && !stages.has(step.stageId)) errors.push(`${step.id}: Stage无效`);
      if (step.campaignId && !campaigns.has(step.campaignId)) errors.push(`${step.id}: Campaign无效`);
      if (step.avatarArtKey && !artKeys.has(step.avatarArtKey)) errors.push(`${step.id}: 头像Art Missing/Invalid`);
      if (step.arrow && step.arrow.artKey && !artKeys.has(step.arrow.artKey)) errors.push(`${step.id}: 引导箭头Art Missing/Invalid`);
    }
    for (const rule of flow.unlockRules || []) if (!features.has(rule.featureId)) errors.push(`${rule.id}: Feature无效`);
  }
  if (snapshot.flowCount !== flows.length || snapshot.stepCount !== flows.reduce((n, x) => n + x.steps.length, 0)) errors.push('Tutorial计数不匹配');
}

function validateGraph(flow, errors) {
  const ids = new Set(flow.steps.map(x => x.id)); const edges = new Map(flow.steps.map(x => [x.id, [x.nextStepId, x.skipStepId].filter(Boolean)]));
  for (const t of flow.transitions || []) { if (!ids.has(t.fromStepId) || !ids.has(t.toStepId)) errors.push(`${t.id}: Transition无效`); else edges.get(t.fromStepId).push(t.toStepId); }
  if (!ids.has(flow.startStepId)) errors.push(`${flow.id}: start无效`);
  for (const s of flow.steps) { if (!s.terminal && !edges.get(s.id).length) errors.push(`${s.id}: 无出口`); for (const next of edges.get(s.id)) if (!ids.has(next)) errors.push(`${s.id}: next/skip无效`); }
  const seen = new Set(), active = new Set(); const visit = id => { if (active.has(id)) { errors.push(`${flow.id}: 存在环`); return; } if (seen.has(id) || !ids.has(id)) return; seen.add(id); active.add(id); for (const n of edges.get(id) || []) visit(n); active.delete(id); };
  visit(flow.startStepId); for (const id of ids) if (!seen.has(id)) errors.push(`${id}: 不可达`);
}

function unique(items, label, errors) { const ids = new Set(); for (const x of items) { if (!x || !x.id || ids.has(x.id)) errors.push(`${label} ID不唯一`); ids.add(x && x.id); } }
function read(root, rel, io) { const target = path.resolve(root, rel); if (!target.startsWith(path.resolve(root) + path.sep) || !io.existsSync(target)) return null; try { return JSON.parse(io.readFileSync(target, 'utf8')); } catch { return null; } }
function checksum(v) { return crypto.createHash('sha256').update(JSON.stringify(sort(v), null, 2)).digest('hex'); }
function sort(v) { if (Array.isArray(v)) return v.map(sort); if (!v || typeof v !== 'object') return v; return Object.keys(v).sort().reduce((o, k) => { if (v[k] !== undefined) o[k] = sort(v[k]); return o; }, {}); }
function result(valid, mode, reason, errors) { return { valid, mode, reason, errors }; }
module.exports = { checkTutorialAssets, checksum };
