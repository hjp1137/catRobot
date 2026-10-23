import test from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import * as BattleUiModule from '../dist/ui/BattleUI.js';

const campaign: any = {
  id: 'main', enabled: true, defaultChapterId: 'chapter_1', chapters: [{
    id: 'chapter_1', enabled: true, nodes: [{
      id: 'node_1', stageId: 'stage_battle_1_1', name: '铸造通道', enabled: true,
    }], connections: [],
  }],
};

function setup() {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  (game as any).publishedCampaigns = [campaign];
  game.player.campaignProgress.currentCampaignId = 'main';
  game.player.campaignProgress.currentChapterId = 'chapter_1';
  game.currentCampaignNodeId = 'node_1';
  return { ctx, game, explore };
}

test('任务30：正式 Campaign 节点统一启动自由地图而不是固定屏', () => {
  const { game, explore } = setup();
  assert.equal(game.beginCampaignNode(), true);
  assert.equal(game.scene, 'explore');
  assert.equal(explore.activeStageId, 'stage_battle_1_1');
});

test('任务30 回归：历史关卡选择的正式开始也必须进入自由地图', () => {
  const { game, explore } = setup();
  game.player.unlockedStageIds = ['1-1'];
  assert.equal(typeof (game as any).openFormalStage, 'function');
  assert.equal((game as any).openFormalStage('1-1'), true);
  assert.equal(game.scene, 'stageIntro');
  assert.equal((game as any).beginSelectedStage(), true);
  assert.equal(game.scene, 'explore');
  assert.equal(explore.activeStageId, 'stage_battle_1_1');
});

test('任务30 回归：自由地图 HUD 顶部仅保留标题，信息分列左右', () => {
  const getExploreHudLayout = (BattleUiModule as any).getExploreHudLayout;
  assert.equal(typeof getExploreHudLayout, 'function');
  const layout = getExploreHudLayout(390, 844, 96);
  assert.equal(layout.topPanelHeight, 0);
  assert.ok(layout.title.y < layout.leftDock.y);
  assert.ok(layout.leftDock.x < 32);
  assert.ok(layout.rightDock.x > 250);
  assert.ok(layout.exit.y >= layout.rightDock.y + layout.rightDock.h + 8);
});

test('任务30 回归：正式自由地图完成目标后自动进入发布结算并解锁下一节点', () => {
  const { game, explore } = setup();
  game.player.unlockedStageIds = ['1-1'];
  assert.equal((game as any).openFormalStage('1-1'), true);
  assert.equal((game as any).beginSelectedStage(), true);
  explore.objective.enemyKills = explore.objective.enemyKillsRequired;
  explore.objective.resourcesCollected = explore.objective.resourcesRequired;
  explore.objective.chestsOpened = explore.objective.chestsRequired;
  game.tick(0.016);
  assert.equal(game.scene, 'result');
  assert.equal(game.lastOutcome?.win, true);
  assert.ok(game.player.unlockedStageIds.includes('1-2'));
  assert.deepEqual(game.lastOutcome?.settlement?.unlockedStageIds, ['1-2']);
});

test('任务30 回归：已解锁的第二关使用自身敌人数量启动自由地图', () => {
  const { game, explore } = setup();
  game.player.unlockedStageIds = ['1-1', '1-2'];
  assert.equal((game as any).openFormalStage('1-2'), true);
  assert.equal((game as any).beginSelectedStage(), true);
  assert.equal(game.scene, 'explore');
  assert.equal(explore.objective.enemyKillsRequired, 5);
  assert.equal(explore.objective.resourcesRequired, 0);
  assert.equal(explore.objective.chestsRequired, 0);
});

test('任务30 回归：章节关卡 HUD 不显示未配置的资源和宝箱目标', () => {
  const { ctx, game, explore } = setup();
  game.player.unlockedStageIds = ['1-1', '1-2'];
  (game as any).openFormalStage('1-2');
  (game as any).beginSelectedStage();
  const ui = new (BattleUiModule as any).BattleUI(ctx, explore, game);
  ui.render();
  const texts = ctx.canvas.calls.filter((call: string) => call.startsWith('text:')).join('|');
  assert.match(texts, /敌 0\/5/);
  assert.doesNotMatch(texts, /资√|箱√/);
});

test('任务30 回归：第一关自由地图按原关卡波次分批出敌', () => {
  const { game, explore } = setup();
  game.player.unlockedStageIds = ['1-1'];
  (game as any).openFormalStage('1-1');
  (game as any).beginSelectedStage();
  assert.equal(explore.enemies.length, 4);
  for (const enemy of explore.enemies) enemy.dead = true;
  game.tick(0.016);
  assert.equal(explore.enemies.length, 4);
});

test('任务30：确认退出清理临时关卡且不结算、不奖励、不解锁', () => {
  const { game, explore } = setup();
  const baseline = JSON.stringify(game.player);
  game.beginCampaignNode();
  explore.coinCollected = 99;
  assert.equal(typeof (game as any).abortCurrentStage, 'function');
  (game as any).abortCurrentStage();
  assert.equal(game.scene, 'campaignMap');
  assert.equal(JSON.stringify(game.player), baseline);
  assert.equal(explore.aliveEnemies, 0);
  assert.equal((game as any).stageResult, 'aborted');
});

test('任务30：退出确认暂停，取消后恢复且重复退出不重复结算', () => {
  const { ctx, game, explore } = setup();
  game.beginCampaignNode();
  const x = explore.player.x;
  ctx.input.simulateMove(1, 0);
  game.pauseCurrentStage(); game.tick(1);
  assert.equal(explore.player.x, x);
  game.resumeCurrentStage(); game.tick(1);
  assert.ok(explore.player.x > x);
  game.abortCurrentStage(); game.abortCurrentStage();
  assert.equal(game.stageResult, 'aborted');
  assert.equal(game.lastOutcome, null);
});
