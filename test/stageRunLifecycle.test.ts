import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import { CONTENT_SNAPSHOT } from '../dist/content/generated/contentSnapshot.js';
import { STAGE_PROGRESSION_SNAPSHOT } from '../dist/content/generated/stageProgressionSnapshot.js';

test('任务27：每次开始或重试都生成新的 stageRunId', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  battle.start(STAGE_1_1);
  const first = battle.currentStageRunId;
  battle.start(STAGE_1_1);
  assert.notEqual(battle.currentStageRunId, first);
});

test('任务27：一局失败只提交一次完整运行统计', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  const outcomes: any[] = [];
  (game as any).finishBattle = (outcome: any) => outcomes.push(outcome);
  battle.start(STAGE_1_1);
  battle.player.takeDamage(battle.player.maxHp);
  battle.update(0.016);
  battle.update(0.016);
  assert.equal(outcomes.length, 1);
  assert.equal(outcomes[0].run.stageRunId, battle.currentStageRunId);
  assert.equal(outcomes[0].run.victory, false);
  assert.equal(outcomes[0].run.failureReason, 'hero-dead');
});

test('任务27：正式存档失败时回滚奖励进度并禁止展示成功', () => {
  const content: any = CONTENT_SNAPSHOT;
  const progression: any = STAGE_PROGRESSION_SNAPSHOT;
  const oldContent = { id: content.stageProgressionReleaseId, checksum: content.stageProgressionChecksum };
  const oldProgression = { id: progression.releaseId, checksum: progression.checksum, stages: progression.stages };
  content.stageProgressionReleaseId = 'test-release'; content.stageProgressionChecksum = 'test-checksum';
  progression.releaseId = 'test-release'; progression.checksum = 'test-checksum';
  progression.stages = [{ stageId: 'stage_battle_1_1', recommendedPower: 1, victoryText: '胜利', failureText: '存档失败',
    objectives: [{ id: 'clear', name: '通关', type: 'clear-all-waves', required: true, params: {}, order: 1, displayText: '通关', progressDisplay: 'waves', starEligible: true, enabled: true }],
    rewardPools: [{ id: 'gold', name: '金币', group: 'repeat-clear', selectionMode: 'all', entries: [{ id: 'gold', rewardType: 'currency', rewardRefId: 'gold', minQuantity: 10, maxQuantity: 10, probability: 1, guaranteed: true, enabled: true }] }],
    unlockRules: [] }];
  try {
    const game = new GameManager(new MockContext());
    (game.save as any).save = () => false;
    const outcome: any = { win: true, stageId: '1-1', contentStageId: 'stage_battle_1_1', elapsedSec: 1, hpRatio: 1, clearResult: null, loot: null,
      run: { stageRunId: 'save-fail', stageId: '1-1', contentStageId: 'stage_battle_1_1', victory: true, startedAt: 0, endedAt: 1, elapsedSec: 1, clearedWaves: 1, totalWaves: 1, defeatedEnemies: 1, heroRemainingHp: 100, heroMaxHp: 100 } };
    game.finishBattle(outcome);
    assert.equal(outcome.win, false);
    assert.equal(outcome.settlement.failureReason, 'save-failed');
    assert.equal(game.player.gold, 0);
    assert.deepEqual(game.player.settledStageRunIds, []);
  } finally {
    content.stageProgressionReleaseId = oldContent.id; content.stageProgressionChecksum = oldContent.checksum;
    progression.releaseId = oldProgression.id; progression.checksum = oldProgression.checksum; progression.stages = oldProgression.stages;
  }
});
