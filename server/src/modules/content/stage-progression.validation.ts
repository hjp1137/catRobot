import { BadRequestException, NotFoundException } from '@nestjs/common';

const OBJECTIVE_TYPES = new Set(['clear-all-waves', 'survive-duration', 'hero-health-above', 'complete-within-duration', 'defeat-enemy-count']);
const REWARD_TYPES = new Set(['equipment', 'rune', 'material', 'currency']);
const REWARD_GROUPS = new Set(['first-clear', 'repeat-clear', 'first-three-star', 'objective-bonus']);
const SELECTION_MODES = new Set(['all', 'independent-probability']);
const RULE_TYPES = new Set(['default-unlocked', 'prerequisite-clear', 'prerequisite-stars']);

export async function validateStageProgression(prisma: any, stageId: string, body: any): Promise<void> {
  if (!await prisma.contentStage.findFirst({ where: { id: stageId, deleted_at: null } })) throw new NotFoundException(stageId);
  const objectives = (body.objectives ?? []).filter((x: any) => x.enabled !== false);
  if (!objectives.some((x: any) => x.required)) fail('STAGE_OBJECTIVE_REQUIRED', '至少需要一个必需目标');
  const ids = new Set<string>();
  for (const objective of objectives) {
    if (!objective.id || ids.has(objective.id)) fail('STAGE_OBJECTIVE_INVALID', `目标ID重复或为空：${objective.id ?? '-'}`);
    ids.add(objective.id);
    if (!OBJECTIVE_TYPES.has(objective.type)) fail('STAGE_OBJECTIVE_INVALID', `目标类型不合法：${objective.type}`);
    validateObjectiveParams(objective);
  }

  const definitions = await prisma.contentRewardDefinition.findMany({ where: { enabled: true } });
  const validRewards = new Set(definitions.map((x: any) => `${x.reward_type}:${x.reward_ref_id}`));
  for (const pool of body.rewardPools ?? []) {
    if (!REWARD_GROUPS.has(pool.group)) fail('STAGE_REWARD_INVALID', `奖励组不合法：${pool.group}`);
    if (!SELECTION_MODES.has(pool.selectionMode ?? 'all')) fail('STAGE_REWARD_INVALID', `奖励选择模式不合法：${pool.selectionMode}`);
    if (pool.group === 'objective-bonus' && !ids.has(pool.objectiveId)) fail('STAGE_REWARD_INVALID', `目标奖励引用不存在：${pool.objectiveId}`);
    for (const entry of pool.entries ?? []) {
      if (!REWARD_TYPES.has(entry.rewardType)) fail('STAGE_REWARD_INVALID', `奖励类型不合法：${entry.rewardType}`);
      if (!validRewards.has(`${entry.rewardType}:${entry.rewardRefId}`)) fail('STAGE_REWARD_REFERENCE_INVALID', `奖励引用不存在：${entry.rewardType}:${entry.rewardRefId}`);
      if (entry.minQuantity <= 0 || entry.maxQuantity < entry.minQuantity) fail('STAGE_REWARD_INVALID', `奖励数量不合法：${entry.id}`);
      if (entry.probability < 0 || entry.probability > 1) fail('STAGE_REWARD_INVALID', `奖励概率必须在0到1：${entry.id}`);
    }
  }

  const stages = await prisma.contentStage.findMany({ where: { deleted_at: null }, select: { id: true } });
  const stageIds = new Set(stages.map((x: any) => x.id));
  const rules = (body.unlockRules ?? []).filter((x: any) => x.enabled !== false);
  for (const rule of rules) {
    if (!RULE_TYPES.has(rule.type)) fail('STAGE_UNLOCK_INVALID', `解锁类型不合法：${rule.type}`);
    if (rule.prerequisiteStageId && !stageIds.has(rule.prerequisiteStageId)) fail('STAGE_UNLOCK_INVALID', `前置关卡不存在：${rule.prerequisiteStageId}`);
    if (rule.nextStageId && !stageIds.has(rule.nextStageId)) fail('STAGE_UNLOCK_INVALID', `下一关不存在：${rule.nextStageId}`);
    if (rule.nextStageId === stageId) fail('STAGE_UNLOCK_CYCLE', '关卡不得解锁自身');
    if (rule.type === 'prerequisite-stars' && (!Number.isInteger(rule.requiredStars) || rule.requiredStars < 1 || rule.requiredStars > 3)) fail('STAGE_UNLOCK_INVALID', '所需星级必须为1到3的整数');
  }
  await rejectUnlockCycles(prisma, stageId, rules);
}

function validateObjectiveParams(objective: any) {
  const p = objective.params ?? {};
  if (objective.type === 'complete-within-duration' && !(p.maxDurationSec > 0)) fail('STAGE_OBJECTIVE_INVALID', '限时目标必须配置 maxDurationSec');
  if (objective.type === 'hero-health-above' && !(p.minHealthRatio >= 0 && p.minHealthRatio <= 1)) fail('STAGE_OBJECTIVE_INVALID', '生命目标必须配置0到1的 minHealthRatio');
  if (objective.type === 'survive-duration' && !(p.durationSec > 0)) fail('STAGE_OBJECTIVE_INVALID', '生存目标必须配置 durationSec');
  if (objective.type === 'defeat-enemy-count' && !(p.count > 0)) fail('STAGE_OBJECTIVE_INVALID', '击败目标必须配置 count');
}

async function rejectUnlockCycles(prisma: any, stageId: string, incoming: any[]) {
  const stored = await prisma.contentStageUnlockRule.findMany({ where: { enabled: true } });
  const edges = stored.filter((x: any) => x.stage_id !== stageId && x.next_stage_id).map((x: any) => [x.stage_id, x.next_stage_id]);
  edges.push(...incoming.filter(x => x.nextStageId).map(x => [stageId, x.nextStageId]));
  const graph = new Map<string, string[]>();
  for (const [from, to] of edges) graph.set(from, [...(graph.get(from) ?? []), to]);
  const visiting = new Set<string>(), done = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true; if (done.has(id)) return false;
    visiting.add(id); for (const next of graph.get(id) ?? []) if (visit(next)) return true;
    visiting.delete(id); done.add(id); return false;
  };
  for (const id of graph.keys()) if (visit(id)) fail('STAGE_UNLOCK_CYCLE', '检测到循环解锁依赖');
}

function fail(code: string, message: string): never { throw new BadRequestException({ code, message }); }
