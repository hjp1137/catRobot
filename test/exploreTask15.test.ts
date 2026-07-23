import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { drawExploreScene } from '../dist/explore/ExploreRenderer.js';
import { TRAINING_GROUND_CONTENT } from '../dist/explore/ExploreContentConfig.js';
import { formatExploreObjective } from '../dist/explore/ExploreObjectiveSystem.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
function setupExplore() {
  const ctx = new MockContext(390, 844), game = new GameManager(ctx), explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  game.scene = 'explore';
  return { ctx, game, explore };
}
test('任务15：训练场内容配置包含刷新点资源点和宝箱', () => {
  assert.ok(TRAINING_GROUND_CONTENT.spawnPoints.length >= 3);
  assert.ok(TRAINING_GROUND_CONTENT.resourceNodes.length >= 3);
  assert.ok(TRAINING_GROUND_CONTENT.chests.length >= 1);
  for (const sp of TRAINING_GROUND_CONTENT.spawnPoints) {
    assert.ok(sp.x > 0 && sp.x < 1800 && sp.y > 0 && sp.y < 2800);
    assert.ok(sp.maxAlive >= sp.initialCount);
  }
});
test('任务15：刷新点按上限补怪且敌人不会刷在玩家身上', () => {
  const { ctx, explore } = setupExplore();
  assert.equal(explore.spawnPointCount, TRAINING_GROUND_CONTENT.spawnPoints.length);
  assert.ok(explore.aliveEnemies >= 4);
  assert.ok(explore.enemies.every(e => Math.hypot(e.x - explore.player.x, e.y - explore.player.y) >= 180));

  explore.enemies[0].dead = true;
  explore.update(0.016);
  const afterKill = explore.aliveEnemies;
  ctx.advance(7);
  explore.update(7);
  assert.ok(explore.aliveEnemies > afterKill);
  for (const sp of explore.spawnPoints) {
    assert.ok(explore.enemies.filter(e => e.spawnPointId === sp.id).length <= sp.maxAlive);
  }
});

test('任务15：探索敌人会巡逻警戒追击并在拉远后放弃追击', () => {
  const { explore } = setupExplore();
  const enemy = explore.enemies[0];
  const home = explore.spawnPoints.find(sp => sp.id === enemy.spawnPointId)!;
  explore.player.x = home.x + 20;
  explore.player.y = home.y + 20;
  explore.update(0.2);
  assert.ok(['chase', 'attack'].includes(enemy.exploreState));

  explore.player.x = Math.min(explore.worldWidth - 40, home.x + 700);
  explore.player.y = Math.min(explore.worldHeight - 40, home.y + 700);
  explore.update(0.2);
  assert.ok(['alert', 'patrol', 'idle'].includes(enemy.exploreState));
});

test('任务15：资源点和宝箱自动交互并推进训练目标', () => {
  const { explore } = setupExplore();
  const resource = explore.resourceNodes[0];
  explore.player.x = resource.x; explore.player.y = resource.y;
  explore.update(0.016);
  assert.equal(resource.collected, true);
  assert.equal(explore.objective.resourcesCollected, resource.amount);

  const chest = explore.chests[0];
  explore.player.x = chest.x; explore.player.y = chest.y;
  const hpBefore = explore.player.hp;
  explore.update(0.016);
  assert.equal(chest.opened, true);
  assert.equal(explore.objective.chestsOpened, 1);
  assert.ok(explore.coinCollected > 0 || explore.player.hp >= hpBefore);
});

test('任务15：击杀收集开箱完成目标后停止刷新并输出探针字段', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired - 1;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  explore.enemies[0].dead = true;
  explore.update(0.016);
  assert.equal(explore.objective.completed, true);
  const alive = explore.aliveEnemies;
  ctx.advance(10);
  explore.update(10);
  assert.equal(explore.aliveEnemies, alive);

  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.objectiveCompleted, true);
  assert.equal(state.spawnPointCount, explore.spawnPointCount);
  assert.equal(state.resourceCollected, explore.objective.resourcesCollected);
  assert.equal(state.chestsOpened, explore.objective.chestsOpened);
});

test('任务15：固定屏 1-1 不暴露探索目标字段', () => {
  const ctx = new MockContext(390, 844), game = new GameManager(ctx), battle = new BattleManager(ctx, game);
  battle.start(STAGE_1_1);
  assert.equal('objective' in battle, false);
});

test('任务15.1：目标HUD显示封顶且使用击败资源宝箱文案', () => {
  const { explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired + 9;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired + 2;
  explore.objective.chestsOpened = explore.objective.chestsRequired + 1;
  const text = formatExploreObjective(explore.objective);
  assert.equal(text, '目标：击败 12/12｜资源 3/3｜宝箱 1/1');
  assert.doesNotMatch(text, /21\/12|5\/3|宝箱 2\/1| 敌/);
});

test('任务15.1：探索HUD区分存活敌人与累计击败目标并显示金币', () => {
  const { ctx, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired + 9;
  explore.objective.resourcesCollected = 0;
  explore.objective.chestsOpened = explore.objective.chestsRequired + 1;
  explore.coinCollected = 9;
  const ui = new BattleUI(ctx, explore);
  ui.render();
  const texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, new RegExp(`存活 ${explore.aliveEnemies}`));
  assert.match(texts, /金币 \+9/);
  assert.match(texts, /敌√/);
  assert.match(texts, /资 0\/3/);
  assert.match(texts, /箱√/);
  assert.doesNotMatch(texts, new RegExp(`敌人 ${explore.aliveEnemies}\\/`));
  assert.doesNotMatch(texts, /21\/12|宝箱 2\/1/);
});

test('任务15.1：探针输出原始计数显示计数和完成后停刷状态', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired + 9;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired + 2;
  explore.objective.chestsOpened = explore.objective.chestsRequired + 1;
  explore.objective.completed = true;
  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.enemyKilledRaw, 21);
  assert.equal(state.enemyKilledDisplay, 12);
  assert.equal(state.enemyKillRequired, 12);
  assert.equal(state.resourceCollectedRaw, 5);
  assert.equal(state.resourceCollectedDisplay, 3);
  assert.equal(state.resourceRequired, 3);
  assert.equal(state.chestsOpenedRaw, 2);
  assert.equal(state.chestsOpenedDisplay, 1);
  assert.equal(state.chestRequired, 1);
  assert.equal(state.objectiveCompleted, true);
  assert.equal(state.spawnPaused, true);
});

test('任务15.2：击败目标完成但资源未完成时暂停补怪且不提前完成训练', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired - 1;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  const beforeAlive = explore.aliveEnemies;
  ctx.advance(8);
  explore.update(8);
  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.enemyKillGoalCompleted, true);
  assert.equal(state.resourceGoalCompleted, false);
  assert.equal(state.chestGoalCompleted, true);
  assert.equal(state.objectiveCompleted, false);
  assert.equal(state.enemySpawnPaused, true);
  assert.equal(state.enemySpawnPausedByKillGoal, true);
  assert.equal(state.enemySpawnPausedByCompletion, false);
  assert.equal(explore.aliveEnemies, beforeAlive);
});

test('任务15.2：击败未完成时刷新点保持正常补怪', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = 5;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired - 1;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  const beforeAlive = explore.aliveEnemies;
  ctx.advance(8);
  explore.update(8);
  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.enemyKillGoalCompleted, false);
  assert.equal(state.objectiveCompleted, false);
  assert.equal(state.enemySpawnPaused, false);
  assert.ok(explore.aliveEnemies > beforeAlive);
});

test('任务15.2：三项目标全部完成后才显示训练完成并按完成状态停刷', () => {
  const { ctx, game, explore } = setupExplore();
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  explore.update(0.016);
  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.enemyKillGoalCompleted, true);
  assert.equal(state.resourceGoalCompleted, true);
  assert.equal(state.chestGoalCompleted, true);
  assert.equal(state.objectiveCompleted, true);
  assert.equal(state.enemySpawnPaused, true);
  assert.equal(state.enemySpawnPausedByCompletion, true);
  assert.equal(formatExploreObjective(explore.objective), '训练完成');
});

test('任务15.1：资源点和宝箱靠近时绘制轻提示', () => {
  const { ctx, explore } = setupExplore();
  const resource = explore.resourceNodes.find(n => n.type !== 'coin')!;
  explore.player.x = resource.x;
  explore.player.y = resource.y;
  drawExploreScene(ctx.canvas, explore, 1);
  assert.match(ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n'), /拾取/);

  ctx.canvas.calls.length = 0;
  const chest = explore.chests[0];
  explore.player.x = chest.x;
  explore.player.y = chest.y;
  drawExploreScene(ctx.canvas, explore, 1);
  assert.match(ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n'), /打开|补给/);
});
