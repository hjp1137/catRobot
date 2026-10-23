import assert from 'node:assert/strict';
import test from 'node:test';
import { GameManager } from '../dist/core/GameManager.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';

test('正式战役完成后解锁发布地图的下一节点', () => {
  const game = new GameManager(new MockContext());
  const explore = new ExploreScene(game.ctx, game);
  game.setExplore(explore);
  game.goToChapterSelect();
  const view = game.getCampaignChapterView();
  const first = view?.nodes.find(node => node.isStart);
  const next = view?.nodes.find(node => !node.isStart);
  assert.ok(first);
  assert.ok(next);

  assert.equal(game.openCampaignNode(first.id), true);
  assert.equal(game.beginCampaignNode(), true);
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  game.tick(0.016);

  assert.equal(game.scene, 'result');
  assert.ok(game.player.unlockedStageIds.includes(next.stageId));
  assert.deepEqual(game.lastOutcome?.settlement?.unlockedStageIds, [next.stageId]);
});

test('已有首关通关记录的存档启动时补齐发布节点解锁', () => {
  const ctx = new MockContext();
  const firstGame = new GameManager(ctx);
  firstGame.player.stageProgress['1-1'] = { cleared: true, bestStars: 3, clearCount: 1,
    firstClearRewardClaimed: true, firstThreeStarRewardClaimed: true, claimedObjectiveRewardIds: [] };
  assert.equal(firstGame.save.save(firstGame.player), true);

  const restoredGame = new GameManager(ctx);
  assert.ok(restoredGame.player.unlockedStageIds.includes('1-2'));
});
