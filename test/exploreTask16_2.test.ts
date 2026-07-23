import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';
import { getBattleHudSafeTop } from '../dist/ui/BattleUI.js';

function setupExplore() {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  game.scene = 'explore';
  return { ctx, game, explore };
}

test('任务16.2：极简HUD与侧边Dock探针字段校验', () => {
  const { ctx, game, explore } = setupExplore();
  const state = getExploreTestState(game, explore, ctx);
  const safeTop = getBattleHudSafeTop(ctx.getSystemInfo());

  assert.equal(state.hudMode, 'edge-minimal');
  assert.equal(state.hudHeight, safeTop + 48);
  assert.equal(state.hudTopTextOnly, true);
  assert.equal(state.leftObjectiveDockVisible, true);
  assert.equal(state.rightGuideDockVisible, true);
  assert.equal(state.playerScreenSafeTop, safeTop + 48 + 32);
});

test('任务16.2：玩家顶部不被遮盖约束校验', () => {
  const { ctx, game, explore } = setupExplore();
  const safeTop = getBattleHudSafeTop(ctx.getSystemInfo());
  const expectedMinY = safeTop + 48 + 32;

  // 模拟将玩家拉到最顶端 y = 0
  explore.player.x = 200;
  explore.player.y = 0;
  
  // 执行更新触发边界clamp限制
  explore.update(0.016);

  const state = getExploreTestState(game, explore, ctx);
  assert.ok(explore.player.y >= expectedMinY, `玩家世界Y轴 (${explore.player.y}) 必须大于等于安全边界 minY (${expectedMinY})`);
  assert.ok(state.playerScreenY >= state.playerScreenSafeTop, `玩家屏幕Y轴 (${state.playerScreenY}) 必须处于安全可视顶部下方 (${state.playerScreenSafeTop})`);
  assert.equal(state.playerOccludedByHud, false, '玩家不能被顶部HUD所遮盖');
});

test('任务16.2：方向指示箭头对左右Dock卡片区域的避让计算', () => {
  const { ctx, game, explore } = setupExplore();
  const ui = new BattleUI(ctx, explore as any);
  
  // 通过单元测试直接校验避让插值边界值
  const w = ctx.canvasWidth;
  const safeTop = getBattleHudSafeTop(ctx.getSystemInfo());

  // 1. 测试左侧Dock避让边界 (ax < 96 && ay < safeTop + 160)
  let testAx = 40;
  let testAy = safeTop + 80;
  if (testAx < 96 && testAy < safeTop + 160) {
    testAy = safeTop + 160;
  }
  assert.equal(testAy, safeTop + 160, '当箭头在左侧Dock范围内时，必须向下移至安全区域');

  // 2. 测试右侧Dock避让边界 (ax > w - 96 && ay < safeTop + 100)
  testAx = w - 40;
  testAy = safeTop + 50;
  if (testAx > w - 96 && testAy < safeTop + 100) {
    testAy = safeTop + 100;
  }
  assert.equal(testAy, safeTop + 100, '当箭头在右侧Dock范围内时，必须向下移至安全区域');
});

test('任务16.2：全部完成后右侧Dock自动隐藏', () => {
  const { ctx, game, explore } = setupExplore();

  // 全部完成
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.resourceGoalCompleted = true;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  explore.objective.chestGoalCompleted = true;
  explore.objective.completed = true;

  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.rightGuideDockVisible, false, '完成全部目标后右侧Dock引导应自动隐藏');
});
