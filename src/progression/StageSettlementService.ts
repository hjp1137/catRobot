import type { PlayerData, StageProgress } from '../data/PlayerData';
import { createDefaultStageProgress } from '../data/PlayerData';
import type { StageProgressionDefinition, StageUnlockRule } from '../content/models/StageProgression';
import { evaluateStageObjectives } from './StageObjectiveEvaluator';
import { grantStageRewards } from './StageRewardGrantService';
import type { StageRunResult, StageSettlement, StageSettlementOptions } from './StageSettlementModels';

export { evaluateStageObjectives } from './StageObjectiveEvaluator';

export function applyDefaultStageUnlocks(player: PlayerData, definitions: StageProgressionDefinition[], map = (id: string) => id): string[] {
  const added: string[] = [];
  for (const definition of definitions) for (const rule of definition.unlockRules.filter(x => x.enabled && x.type === 'default-unlocked')) {
    const stageId = map(rule.nextStageId ?? definition.stageId);
    if (!player.unlockedStageIds.includes(stageId)) { player.unlockedStageIds.push(stageId); added.push(stageId); }
  }
  return added;
}

export function settleStageRun(
  player: PlayerData,
  definition: StageProgressionDefinition,
  run: StageRunResult,
  options: StageSettlementOptions,
): StageSettlement {
  const evaluation = evaluateStageObjectives(definition, run);
  if (player.settledStageRunIds?.includes(run.stageRunId)) return duplicate(run, evaluation.objectives);

  const previous = normalizeProgress(player.stageProgress[run.stageId]);
  const victory = run.victory && evaluation.requiredCompleted;
  const firstClear = victory && !previous.cleared;
  const firstThreeStar = victory && evaluation.stars === 3 && !previous.firstThreeStarRewardClaimed;
  const grantedRewards = victory
    ? grantStageRewards(player, definition.rewardPools, { firstClear, firstThreeStar, objectives: evaluation.objectives, previous }, options)
    : [];
  const healthRatio = run.heroMaxHp > 0 ? run.heroRemainingHp / run.heroMaxHp : 0;

  player.stageProgress[run.stageId] = {
    ...previous,
    cleared: previous.cleared || victory,
    bestStars: Math.max(previous.bestStars, victory ? evaluation.stars : 0),
    clearCount: previous.clearCount + (victory ? 1 : 0),
    firstClearedAt: victory ? previous.firstClearedAt ?? options.now() : previous.firstClearedAt,
    lastClearedAt: victory ? options.now() : previous.lastClearedAt,
    bestClearTimeSec: victory ? bestTime(previous.bestClearTimeSec, run.elapsedSec) : previous.bestClearTimeSec,
    bestHealthRatio: Math.max(previous.bestHealthRatio ?? 0, victory ? healthRatio : 0),
    firstClearRewardClaimed: previous.firstClearRewardClaimed || firstClear,
    firstThreeStarRewardClaimed: previous.firstThreeStarRewardClaimed || firstThreeStar,
    claimedObjectiveRewardIds: previous.claimedObjectiveRewardIds ?? [],
    lastAttemptAt: options.now(),
    lastResult: victory ? 'victory' : 'failure',
    lastFailureReason: victory ? undefined : run.failureReason ?? (run.victory ? 'required-objective-failed' : 'stage-failed'),
  };

  const unlockedStageIds = victory ? applyUnlocks(player, definition, evaluation.stars, options.mapStageId) : [];
  player.settledStageRunIds = [...(player.settledStageRunIds ?? []), run.stageRunId];
  return { stageRunId: run.stageRunId, stageId: run.stageId, victory, stars: victory ? evaluation.stars : 0,
    objectiveResults: evaluation.objectives, grantedRewards, firstClear, firstThreeStar, rewardsGranted: grantedRewards.length > 0,
    idempotent: false, unlockedStageIds, failureReason: victory ? undefined : player.stageProgress[run.stageId].lastFailureReason, run };
}

function applyUnlocks(player: PlayerData, definition: StageProgressionDefinition, stars: number, map = (id: string) => id): string[] {
  const unlocked: string[] = [];
  for (const rule of definition.unlockRules.filter(x => x.enabled)) {
    const eligible = (!rule.prerequisiteStageId || rule.prerequisiteStageId === definition.stageId) && unlockEligible(rule, stars);
    const contentId = rule.nextStageId ?? (rule.type === 'default-unlocked' ? definition.stageId : undefined);
    if (!eligible || !contentId) continue;
    const stageId = map(contentId);
    if (!player.unlockedStageIds.includes(stageId)) { player.unlockedStageIds.push(stageId); unlocked.push(stageId); }
  }
  return unlocked;
}

function unlockEligible(rule: StageUnlockRule, stars: number): boolean {
  if (rule.type === 'default-unlocked') return true;
  if (rule.type === 'prerequisite-clear') return stars >= 1;
  return stars >= Math.max(1, rule.requiredStars);
}

function normalizeProgress(value?: StageProgress): StageProgress {
  return { ...createDefaultStageProgress(), ...value, claimedObjectiveRewardIds: [...(value?.claimedObjectiveRewardIds ?? [])] };
}
function bestTime(previous: number | undefined, current: number): number { return previous == null ? current : Math.min(previous, current); }
function duplicate(run: StageRunResult, objectives: any[]): StageSettlement { return { stageRunId: run.stageRunId, stageId: run.stageId, victory: run.victory, stars: 0, objectiveResults: objectives, grantedRewards: [], firstClear: false, firstThreeStar: false, rewardsGranted: false, idempotent: true, unlockedStageIds: [], failureReason: run.failureReason, run }; }
