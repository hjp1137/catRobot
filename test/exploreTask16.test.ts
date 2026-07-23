import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';
import { drawExploreScene } from '../dist/explore/ExploreRenderer.js';

function setupExplore() {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  game.scene = 'explore';
  return { ctx, game, explore };
}

test('任务16：引导状态机切换（敌人 -> 资源 -> 宝箱 -> 完成）', () => {
  const { explore } = setupExplore();

  // 1. 初始：击败未完成，引导敌人
  explore.objective.enemyKills = 0;
  explore.objective.enemyKillGoalCompleted = false;
  let target = explore.getGuideTarget();
  assert.equal(target.type, 'enemy');
  assert.equal(target.label, '清理敌人');

  // 2. 击败完成，资源未完成，引导资源
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = 0;
  explore.objective.resourceGoalCompleted = false;
  target = explore.getGuideTarget();
  assert.equal(target.type, 'resource');
  assert.equal(target.label, '寻找资源');

  // 3. 资源完成，宝箱未完成，引导宝箱
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.resourceGoalCompleted = true;
  explore.objective.chestsOpened = 0;
  explore.objective.chestGoalCompleted = false;
  target = explore.getGuideTarget();
  assert.equal(target.type, 'chest');
  assert.equal(target.label, '打开宝箱');

  // 4. 全部完成
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  explore.objective.chestGoalCompleted = true;
  explore.objective.completed = true;
  target = explore.getGuideTarget();
  assert.equal(target.type, 'complete');
  assert.equal(target.label, '训练完成');
});

test('任务16：清剿完成提示与训练完成公告一次性触发', () => {
  const { explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired - 1;
  explore.update(0.1);
  assert.equal(explore.killGoalNoticeVisible, false);

  // 触发清剿完成
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.enemyKillGoalCompleted = true;
  explore.update(0.1);
  assert.equal(explore.killGoalNoticeVisible, true);
  // 再过一会儿，计时器递减
  explore.update(2.1);
  assert.equal(explore.killGoalNoticeVisible, false);

  // 触发训练完成
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.resourceGoalCompleted = true;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  explore.objective.chestGoalCompleted = true;
  explore.objective.completed = true;
  explore.update(0.1);
  assert.equal(explore.completionNoticeVisible, true);
});

test('任务16：探针输出新字段正常', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = 0;
  explore.objective.resourceGoalCompleted = false;
  explore.update(0.1);

  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.guideTargetType, 'resource');
  assert.equal(state.nextActionText, '寻找资源');
  assert.equal(typeof state.guideArrowVisible, 'boolean');
  assert.equal(typeof state.clearNoticeVisible, 'boolean');
  assert.equal(typeof state.completionNoticeVisible, 'boolean');
});

test('任务16：渲染高亮与提示文本调用', () => {
  const { ctx, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.enemyKillGoalCompleted = true;
  explore.objective.resourcesCollected = 0;
  explore.objective.resourceGoalCompleted = false;

  // 将玩家移开，让资源超出屏幕测试边缘箭头
  explore.player.x = 0;
  explore.player.y = 0;
  const ui = new BattleUI(ctx, explore);
  ui.render();

  const texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /找资源/);
  assert.match(texts, /资源 \d+/);
});
