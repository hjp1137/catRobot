import { flowModel, stepModel, transitionModel, unlockRuleModel } from '../tutorials/tutorial.mapper';
import { validateTutorialGraph } from '../tutorials/tutorial.validation';
import { TUTORIAL_COMPLETIONS, TUTORIAL_FEATURES, TUTORIAL_STATIC_TARGETS, TUTORIAL_TRIGGERS } from '../../../../shared/tutorial-catalog';
import { selectTutorialArtVersion } from './tutorial-art-version';

export function validateTutorialContent(errors: any[], rows: any, refs: any) {
  const staticTargets = new Set(TUTORIAL_STATIC_TARGETS.map(x => `${x[0]}:${x[1]}`));
  const features = new Set(TUTORIAL_FEATURES.map(x => x.id));
  const triggers = new Set(TUTORIAL_TRIGGERS); const completions = new Set(TUTORIAL_COMPLETIONS);
  for (const flowRow of rows.flows) {
    const flow = flowModel(flowRow);
    const steps = rows.steps.filter((x: any) => x.flow_id === flow.id).map(stepModel);
    const transitions = rows.transitions.filter((x: any) => x.flow_id === flow.id).map(transitionModel);
    const rules = rows.rules.filter((x: any) => x.flow_id === flow.id).map(unlockRuleModel);
    try { validateTutorialGraph({ startStepId: flow.startStepId, steps, transitions }); }
    catch (error: any) { errors.push(issue(flow.id, 'graph', error?.response?.code ?? 'TUTORIAL_GRAPH_INVALID')); }
    if (flow.campaignId && !refs.campaignIds.has(flow.campaignId)) errors.push(issue(flow.id, 'campaignId', 'Campaign不存在或未启用'));
    for (const step of steps) {
      if (!triggers.has(step.triggerType)) errors.push(issue(step.id, 'triggerType', 'Trigger不在正式目录'));
      if (!completions.has(step.completionType)) errors.push(issue(step.id, 'completionType', 'Completion不在正式目录'));
      if (step.timeoutMs != null && (!Number.isInteger(step.timeoutMs) || step.timeoutMs < 0)) errors.push(issue(step.id, 'timeoutMs', 'timeout非法'));
      if ((step.force || step.blockInput) && !step.fallbackAction) errors.push(issue(step.id, 'fallbackAction', '强制步骤必须配置fallback'));
      validateTarget(errors, step, staticTargets, features, refs);
      if (step.stageId && !refs.stageIds.has(step.stageId)) errors.push(issue(step.id, 'stageId', 'Stage不存在或未启用'));
      if (step.campaignId && !refs.campaignIds.has(step.campaignId)) errors.push(issue(step.id, 'campaignId', 'Campaign不存在或未启用'));
      if (step.avatarArtKey && !validArt(refs.artByKey.get(step.avatarArtKey), refs)) errors.push(issue(step.id, 'avatarArtKey', '头像Art不存在、Missing或Invalid'));
      if (step.arrow?.artKey && !validArt(refs.artByKey.get(step.arrow.artKey), refs)) errors.push(issue(step.id, 'arrowArtKey', '引导箭头Art不存在、Missing或Invalid'));
    }
    for (const rule of rules) if (!features.has(rule.featureId)) errors.push(issue(rule.id, 'featureId', 'Feature不在正式目录'));
  }
}

function validateTarget(errors: any[], step: any, staticTargets: Set<string>, features: Set<string>, refs: any) {
  const valid = step.targetType === 'ui' || step.targetType === 'canvas' ? staticTargets.has(`${step.targetType}:${step.targetId}`)
    : step.targetType === 'stage' ? refs.stageIds.has(step.targetId)
      : step.targetType === 'campaign' ? refs.campaignIds.has(step.targetId)
        : step.targetType === 'feature' ? features.has(step.targetId)
          : step.targetType === 'art' ? validArt(refs.artByKey.get(step.targetId), refs) : false;
  if (!valid) errors.push(issue(step.id, 'targetId', 'Target不存在、未启用或不在正式目录'));
}
function validArt(row: any, refs?: any) {
  return !!selectTutorialArtVersion(row, refs?.versionById ?? new Map());
}
function issue(id: string, field: string, message: string) {
  return { entityType: 'tutorial', entityId: id, field, reason: message, message, suggestion: '修正Tutorial草稿后重新校验。' };
}
