'use strict';
const { TUTORIAL_COMPLETIONS, TUTORIAL_STATIC_TARGETS, TUTORIAL_TRIGGERS } = require('../tutorial-catalog');

function validateTutorialPublication(snapshot) {
  const errors = []; const flows = Array.isArray(snapshot && snapshot.flows) ? snapshot.flows : [];
  if (!snapshot || snapshot.schemaVersion !== 1) errors.push('schemaVersion无效');
  unique(flows, 'Flow', errors);
  const catalog = snapshot && snapshot.referenceSummary && snapshot.referenceSummary.catalog || {};
  for (const key of ['stageIds', 'campaignIds', 'artKeys', 'featureIds']) {
    if (!Array.isArray(catalog[key])) errors.push(`referenceSummary.catalog.${key}无效`);
  }
  const stages = new Set(catalog.stageIds || []), campaigns = new Set(catalog.campaignIds || []);
  const art = new Set(catalog.artKeys || []), features = new Set(catalog.featureIds || []);
  const staticTargets = new Set(TUTORIAL_STATIC_TARGETS.map(x => `${x[0]}:${x[1]}`));
  for (const flow of flows) validateFlow(flow, { stages, campaigns, art, features, staticTargets }, errors);
  const refs = collectTutorialReferences(flows);
  for (const key of ['campaignIds', 'stageIds', 'featureIds', 'artKeys']) {
    if (JSON.stringify(refs[key]) !== JSON.stringify(snapshot && snapshot.referenceSummary && snapshot.referenceSummary[key] || [])) errors.push(`referenceSummary.${key}不匹配`);
  }
  const steps = flows.reduce((n, x) => n + (x.steps || []).length, 0);
  const rules = flows.reduce((n, x) => n + (x.unlockRules || []).length, 0);
  if (snapshot.flowCount !== flows.length) errors.push('flowCount不匹配');
  if (snapshot.stepCount !== steps) errors.push('stepCount不匹配');
  if (snapshot.featureUnlockRuleCount !== rules) errors.push('featureUnlockRuleCount不匹配');
  return errors;
}

function validateFlow(flow, catalogs, errors) {
  const steps = Array.isArray(flow.steps) ? flow.steps : []; const transitions = Array.isArray(flow.transitions) ? flow.transitions : [];
  const rules = Array.isArray(flow.unlockRules) ? flow.unlockRules : [];
  unique(steps, 'Step', errors); unique(transitions, 'Transition', errors); unique(rules, 'Rule', errors);
  if (!steps.length) { errors.push(`${flow.id}: enabled Flow无Step`); return; }
  const ids = new Set(steps.map(x => x.id)); const edges = new Map(steps.map(x => [x.id, [x.nextStepId, x.skipStepId].filter(Boolean)]));
  if (!ids.has(flow.startStepId)) errors.push(`${flow.id}: start无效`);
  if (flow.campaignId && !catalogs.campaigns.has(flow.campaignId)) errors.push(`${flow.id}: Campaign无效`);
  for (const t of transitions) { if (!ids.has(t.fromStepId) || !ids.has(t.toStepId)) errors.push(`${t.id}: Transition无效`); else edges.get(t.fromStepId).push(t.toStepId); }
  for (const s of steps) {
    if (!TUTORIAL_TRIGGERS.includes(s.triggerType) || !TUTORIAL_COMPLETIONS.includes(s.completionType)) errors.push(`${s.id}: Trigger/Completion无效`);
    if (s.timeoutMs != null && (!Number.isInteger(s.timeoutMs) || s.timeoutMs < 0)) errors.push(`${s.id}: timeout无效`);
    if ((s.force || s.blockInput) && !s.fallbackAction) errors.push(`${s.id}: force缺fallback`);
    if (!s.terminal && !(edges.get(s.id) || []).length) errors.push(`${s.id}: 无出口`);
    for (const next of edges.get(s.id) || []) if (!ids.has(next)) errors.push(`${s.id}: next/skip无效`);
    const targetOk = s.targetType === 'ui' || s.targetType === 'canvas' ? catalogs.staticTargets.has(`${s.targetType}:${s.targetId}`)
      : s.targetType === 'stage' ? catalogs.stages.has(s.targetId) : s.targetType === 'campaign' ? catalogs.campaigns.has(s.targetId)
        : s.targetType === 'feature' ? catalogs.features.has(s.targetId) : s.targetType === 'art' ? catalogs.art.has(s.targetId) : false;
    if (!targetOk) errors.push(`${s.id}: Target无效`);
    if (s.stageId && !catalogs.stages.has(s.stageId)) errors.push(`${s.id}: Stage无效`);
    if (s.campaignId && !catalogs.campaigns.has(s.campaignId)) errors.push(`${s.id}: Campaign无效`);
    if (s.avatarArtKey && !catalogs.art.has(s.avatarArtKey)) errors.push(`${s.id}: 头像Art Missing/Invalid`);
    if (s.arrow && s.arrow.artKey && !catalogs.art.has(s.arrow.artKey)) errors.push(`${s.id}: 引导箭头Art Missing/Invalid`);
  }
  for (const r of rules) if (!catalogs.features.has(r.featureId)) errors.push(`${r.id}: Feature无效`);
  const seen = new Set(), active = new Set(); const visit = id => { if (active.has(id)) { errors.push(`${flow.id}: 存在环`); return; } if (seen.has(id) || !ids.has(id)) return; seen.add(id); active.add(id); for (const n of edges.get(id) || []) visit(n); active.delete(id); };
  visit(flow.startStepId); for (const id of ids) if (!seen.has(id)) errors.push(`${id}: 不可达`);
}

function collectTutorialReferences(flows) {
  const values = { campaignIds: new Set(), stageIds: new Set(), featureIds: new Set(), artKeys: new Set() };
  for (const f of flows) { if (f.campaignId) values.campaignIds.add(f.campaignId); for (const s of f.steps || []) { if (s.campaignId) values.campaignIds.add(s.campaignId); if (s.stageId) values.stageIds.add(s.stageId); if (s.avatarArtKey) values.artKeys.add(s.avatarArtKey); if (s.arrow && s.arrow.artKey) values.artKeys.add(s.arrow.artKey); if (s.targetType === 'campaign') values.campaignIds.add(s.targetId); if (s.targetType === 'stage') values.stageIds.add(s.targetId); if (s.targetType === 'feature') values.featureIds.add(s.targetId); if (s.targetType === 'art') values.artKeys.add(s.targetId); } for (const r of f.unlockRules || []) values.featureIds.add(r.featureId); }
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, [...v].sort()]));
}
function unique(items, label, errors) { const ids = new Set(); for (const x of items) { if (!x || !x.id || ids.has(x.id)) errors.push(`${label} ID不唯一`); ids.add(x && x.id); } }
module.exports = { validateTutorialPublication, collectTutorialReferences };
