import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPlayerData } from '../dist/data/PlayerData.js';
import { applyDefaultStageUnlocks, evaluateStageObjectives, settleStageRun } from '../dist/progression/StageSettlementService.js';
import { resolvePublishedStageProgressions } from '../dist/progression/StageProgressionRepository.js';

test('任务27：三类真实目标产生一星、二星和三星', () => {
  assert.equal(evaluateStageObjectives(definition(), run({ victory: true, elapsedSec: 120, heroRemainingHp: 20 })).stars, 1);
  assert.equal(evaluateStageObjectives(definition(), run({ victory: true, elapsedSec: 50, heroRemainingHp: 20 })).stars, 2);
  const result = evaluateStageObjectives(definition(), run({ victory: true, elapsedSec: 50, heroRemainingHp: 80 }));
  assert.equal(result.stars, 3);
  assert.deepEqual(result.objectives.map(x => x.completed), [true, true, true]);
});

test('任务27：首次三星通关发四组奖励并解锁下一关', () => {
  const player = createDefaultPlayerData();
  const settlement = settleStageRun(player, definition(), run(), options());

  assert.equal(settlement.victory, true);
  assert.equal(settlement.stars, 3);
  assert.equal(settlement.firstClear, true);
  assert.equal(settlement.firstThreeStar, true);
  assert.deepEqual(settlement.unlockedStageIds, ['1-2']);
  assert.equal(player.gold, 50);
  assert.equal(player.parts, 3);
  assert.equal(player.materials.enhanceStone, 3);
  assert.equal(player.equipmentInventory.items.length, 1);
  assert.equal(player.runeInventory.length, 1);
});

test('任务27：同一stageRunId幂等且较低星级不覆盖最高记录', () => {
  const player = createDefaultPlayerData();
  const first = settleStageRun(player, definition(), run(), options());
  const snapshot = JSON.stringify(player);
  const duplicate = settleStageRun(player, definition(), run(), options());
  assert.equal(duplicate.idempotent, true);
  assert.equal(JSON.stringify(player), snapshot);

  const repeat = settleStageRun(player, definition(), run({ stageRunId: 'run_2', elapsedSec: 110, heroRemainingHp: 20 }), options());
  assert.equal(repeat.firstClear, false);
  assert.equal(repeat.firstThreeStar, false);
  assert.equal(player.stageProgress['1-1'].bestStars, first.stars);
  assert.equal(player.stageProgress['1-1'].clearCount, 2);
  assert.equal(player.gold, 50, '首通奖励不重复');
});

test('任务27：失败记录统计但不发胜利奖励也不解锁', () => {
  const player = createDefaultPlayerData();
  const settlement = settleStageRun(player, definition(), run({ victory: false, failureReason: 'hero-dead', heroRemainingHp: 0 }), options());
  assert.equal(settlement.stars, 0);
  assert.equal(settlement.grantedRewards.length, 0);
  assert.equal(player.gold, 0);
  assert.equal(player.stageProgress['1-1'].lastResult, 'failure');
  assert.deepEqual(player.unlockedStageIds, ['1-1']);
});

test('任务27：R000007未声明进度快照时安全回退', () => {
  const snapshot: any = { ...progressionSnapshot(), releaseId: 'release8', checksum: 'abc' };
  assert.deepEqual(resolvePublishedStageProgressions(snapshot, {}), []);
  assert.deepEqual(resolvePublishedStageProgressions(snapshot, { stageProgressionReleaseId: 'release8', stageProgressionChecksum: 'wrong' }), []);
  assert.equal(resolvePublishedStageProgressions(snapshot, { stageProgressionReleaseId: 'release8', stageProgressionChecksum: 'abc' }).length, 1);
});

test('任务27：默认解锁规则由配置初始化且保持幂等', () => {
  const player = createDefaultPlayerData();
  const value = definition();
  value.unlockRules.push({ id: 'default', type: 'default-unlocked', requiredStars: 0, nextStageId: 'stage_battle_1_2', enabled: true });
  assert.deepEqual(applyDefaultStageUnlocks(player, [value], (id: string) => id === 'stage_battle_1_2' ? '1-2' : id), ['1-2']);
  assert.deepEqual(applyDefaultStageUnlocks(player, [value], (id: string) => id === 'stage_battle_1_2' ? '1-2' : id), []);
});

test('任务27：未知的必需目标必须失败关闭而不是误判通关', () => {
  const value = definition();
  value.objectives = [{ ...value.objectives[0], id: 'unsupported', type: 'future-objective' }];
  const result = evaluateStageObjectives(value, run());
  assert.equal(result.requiredCompleted, false);
  assert.equal(result.stars, 0);
  assert.equal(result.objectives[0].supported, false);
});

test('任务27：目标概率奖励全未命中也只允许一次领取尝试', () => {
  const player = createDefaultPlayerData();
  const value = definition();
  value.rewardPools = [{ id: 'bonus', name: '目标', group: 'objective-bonus', objectiveId: 'healthy', selectionMode: 'independent-probability',
    entries: [{ id: 'stone', rewardType: 'material', rewardRefId: 'enhanceStone', minQuantity: 1, maxQuantity: 1, probability: 0, guaranteed: false, enabled: true }] }];
  settleStageRun(player, value, run(), { ...options(), random: () => 1 });
  const repeat = settleStageRun(player, value, run({ stageRunId: 'run_retry' }), { ...options(), random: () => 0 });
  assert.deepEqual(player.stageProgress['1-1'].claimedObjectiveRewardIds, ['healthy']);
  assert.equal(repeat.grantedRewards.length, 0);
});

test('任务27：超过200局后旧stageRunId仍保持幂等', () => {
  const player = createDefaultPlayerData();
  const value = definition(); value.rewardPools = [];
  settleStageRun(player, value, run(), options());
  for (let index = 0; index < 205; index++) settleStageRun(player, value, run({ stageRunId: `run_${index + 2}` }), options());
  assert.equal(settleStageRun(player, value, run(), options()).idempotent, true);
  assert.equal(player.stageProgress['1-1'].clearCount, 206);
});

function run(overrides: any = {}): any {
  return { stageRunId: 'run_1', stageId: '1-1', contentStageId: 'stage_battle_1_1', victory: true,
    startedAt: 100, endedAt: 150, elapsedSec: 50, clearedWaves: 3, totalWaves: 3,
    defeatedEnemies: 8, heroRemainingHp: 80, heroMaxHp: 100, ...overrides };
}

function options(): any { return { random: () => 0, now: () => 200, mapStageId: (id: string) => id === 'stage_battle_1_2' ? '1-2' : id }; }

function definition(): any {
  return { stageId: 'stage_battle_1_1', recommendedPower: 220, victoryText: '胜利', failureText: '失败',
    objectives: [
      { id: 'clear', name: '清场', type: 'clear-all-waves', required: true, params: {}, order: 1, displayText: '清除三波', progressDisplay: 'waves', starEligible: true, enabled: true },
      { id: 'fast', name: '限时', type: 'complete-within-duration', required: false, params: { maxDurationSec: 60 }, order: 2, displayText: '60秒内', progressDisplay: 'timer', starEligible: true, enabled: true },
      { id: 'healthy', name: '生命', type: 'hero-health-above', required: false, params: { minHealthRatio: 0.5 }, order: 3, displayText: '生命50%', progressDisplay: 'ratio', starEligible: true, enabled: true },
    ],
    rewardPools: [
      { id: 'first', name: '首通', group: 'first-clear', selectionMode: 'all', entries: [{ id: 'gold', rewardType: 'currency', rewardRefId: 'gold', minQuantity: 50, maxQuantity: 50, probability: 1, guaranteed: true, enabled: true }] },
      { id: 'repeat', name: '常规', group: 'repeat-clear', selectionMode: 'independent-probability', entries: [{ id: 'parts', rewardType: 'currency', rewardRefId: 'parts', minQuantity: 3, maxQuantity: 3, probability: 1, guaranteed: true, enabled: true }, { id: 'equip', rewardType: 'equipment', rewardRefId: 'rusty_claw', minQuantity: 1, maxQuantity: 1, probability: 1, guaranteed: true, enabled: true }] },
      { id: 'three', name: '三星', group: 'first-three-star', selectionMode: 'all', entries: [{ id: 'rune', rewardType: 'rune', rewardRefId: 'cannon_rune_1', minQuantity: 1, maxQuantity: 1, probability: 1, guaranteed: true, enabled: true }] },
      { id: 'health_bonus', name: '目标', group: 'objective-bonus', objectiveId: 'healthy', selectionMode: 'all', entries: [{ id: 'stone', rewardType: 'material', rewardRefId: 'enhanceStone', minQuantity: 3, maxQuantity: 3, probability: 1, guaranteed: true, enabled: true }] },
    ],
    unlockRules: [{ id: 'next', type: 'prerequisite-stars', prerequisiteStageId: 'stage_battle_1_1', requiredStars: 3, nextStageId: 'stage_battle_1_2', enabled: true }],
  };
}

function progressionSnapshot(): any {
  return { schemaVersion: 1, releaseId: 'release8', releaseVersion: 'R000008', generatedAt: '', checksum: 'abc',
    stageCount: 1, objectiveCount: 3, rewardEntryCount: 5, unlockRuleCount: 1,
    rewardCatalog: [], stages: [definition()] };
}
