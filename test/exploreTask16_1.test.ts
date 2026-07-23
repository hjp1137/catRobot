import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';

function setupExplore() {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  game.scene = 'explore';
  return { ctx, game, explore };
}

test('任务16.1：调试探针输出 hudMode, hudHeight 与 objectiveCompactText', () => {
  const { ctx, game, explore } = setupExplore();
  
  // 1. 初始状态
  explore.objective.enemyKills = 2;
  explore.objective.resourcesCollected = 1;
  explore.objective.chestsOpened = 0;
  explore.objective.enemyKillGoalCompleted = false;
  explore.objective.resourceGoalCompleted = false;
  explore.objective.chestGoalCompleted = false;
  
  let state = getExploreTestState(game, explore, ctx);
  assert.equal(state.hudMode, 'edge-minimal');
  assert.equal(state.hudHeight, 63);
  assert.equal(state.objectiveCompactText, '敌 2/12｜资 1/3｜箱 0/1');

  // 2. 部分完成并校验封顶显示 (敌完成，资溢出)
  explore.objective.enemyKills = 15;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = 5; // 超过 3
  explore.objective.resourceGoalCompleted = true;
  
  state = getExploreTestState(game, explore, ctx);
  assert.equal(state.objectiveCompactText, '敌√｜资√｜箱 0/1');
});

test('任务16.1：紧凑 HUD 胶囊行渲染校验与导航内容', () => {
  const { ctx, explore } = setupExplore();
  
  // 1. 清敌阶段
  explore.objective.enemyKills = 4;
  explore.objective.enemyKillGoalCompleted = false;
  
  let ui = new BattleUI(ctx, explore);
  ui.render();
  let texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /敌 4\/12/);
  assert.match(texts, /资 0\/3/);
  assert.match(texts, /箱 0\/1/);
  assert.match(texts, /清敌/);

  // 2. 找资源阶段
  ctx.canvas.calls.length = 0;
  explore.objective.enemyKills = 12;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = 1;
  explore.objective.resourceGoalCompleted = false;
  
  ui = new BattleUI(ctx, explore);
  ui.render();
  texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /敌√/);
  assert.match(texts, /资 1\/3/);
  assert.match(texts, /找资源/);

  // 3. 开宝箱阶段
  ctx.canvas.calls.length = 0;
  explore.objective.resourcesCollected = 3;
  explore.objective.resourceGoalCompleted = true;
  explore.objective.chestsOpened = 0;
  explore.objective.chestGoalCompleted = false;
  
  ui = new BattleUI(ctx, explore);
  ui.render();
  texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /资√/);
  assert.match(texts, /箱 0\/1/);
  assert.match(texts, /开箱/);

  // 4. 完成阶段
  ctx.canvas.calls.length = 0;
  explore.objective.chestsOpened = 1;
  explore.objective.chestGoalCompleted = true;
  explore.objective.completed = true;
  
  ui = new BattleUI(ctx, explore);
  ui.render();
  texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /箱√/);
  assert.ok(!texts.includes('完成'), '右侧导航Dock卡片在完成时应自动隐藏');
});

test('任务16.1：边缘方向指示器高度避让使用新的 HUD 边界', () => {
  const { ctx, explore } = setupExplore();
  explore.player.x = 0;
  explore.player.y = 0; // 玩家在一角，让资源目标在屏幕外以触发边缘箭头避让
  
  const ui = new BattleUI(ctx, explore);
  ui.render();
  
  // 检查是否绘制了方向箭头
  const pathDraws = ctx.canvas.calls.filter(call => call.startsWith('beginPath') || call.startsWith('lineTo'));
  assert.ok(pathDraws.length > 0);
});
