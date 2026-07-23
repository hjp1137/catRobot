/** 正式 Campaign 入口与显式调试固定屏的回归测试。 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { StageIntroUI } from '../dist/ui/StageIntroUI.js';
import { CampaignMapUI } from '../dist/ui/CampaignMapUI.js';
import { CampaignStageDetailUI } from '../dist/ui/CampaignStageDetailUI.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import type { CampaignDefinition } from '../src/content/models/Campaign.ts';

const CAMPAIGN_FIXTURE: CampaignDefinition = {
  id: 'task32_campaign', name: '任务32战役', subtitle: '', description: '', defaultChapterId: 'task32_chapter', order: 1, enabled: true, schemaVersion: 1, contentVersion: 1,
  chapters: [{ id: 'task32_chapter', campaignId: 'task32_campaign', chapterNo: 1, name: '任务32章节', subtitle: '', description: '', backgroundArtKey: 'map.trainingGround.floor', canvasWidth: 1000, canvasHeight: 600, viewportX: 0, viewportY: 0, enabled: true, completionText: '完成', nodes: [
    { id: 'task32_node_1', chapterId: 'task32_chapter', stageId: 'stage_battle_1_1', name: '铸造通道', x: 180, y: 320, type: 'normal', isStart: true, isEnd: true, order: 1, recommendedPower: 220, enabled: true },
    { id: 'task32_node_2', chapterId: 'task32_chapter', stageId: 'stage_explore_training_01', name: '训练场', x: 720, y: 240, type: 'exploration', isStart: false, isEnd: false, order: 2, recommendedPower: 260, enabled: true },
  ], connections: [{ id: 'task32_path_1', chapterId: 'task32_chapter', fromNodeId: 'task32_node_1', toNodeId: 'task32_node_2', pathType: 'normal', oneWay: true, order: 1, enabled: true }] }],
};

function setup() {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.publishedCampaigns = [CAMPAIGN_FIXTURE];
  game.player.unlockedStageIds = ['1-1'];
  const battle = new BattleManager(ctx, game);
  const explore = new ExploreScene(ctx, game);
  game.setBattle(battle);
  game.setExplore(explore);
  const stageIntro = new StageIntroUI(ctx, game);
  const map = new CampaignMapUI(ctx, game);
  const detail = new CampaignStageDetailUI(ctx, game);
  game.setStageIntroUi(stageIntro);
  game.setCampaignMapUi(map);
  game.setCampaignStageDetailUi(detail);
  return { ctx, game, stageIntro, map, detail, explore };
}

function tap(ctx: MockContext, x: number, y: number): void {
  ctx.input.simulateTap(x, y);
}

test('正式 StageSelect 旧入口缺失时，经 Campaign 地图和详情进入 free-map', () => {
  const { ctx, game, map, detail, explore } = setup();
  assert.equal(game.stageSelectUi, null);
  game.goToChapterSelect();
  assert.equal(game.scene, 'campaignMap');
  map.render();
  const node = map.cards[0];
  assert.ok(node);
  tap(ctx, node.x, node.y);
  map.handleClick();
  assert.equal(game.scene, 'campaignStageDetail');
  tap(ctx, ctx.canvasWidth / 2, ctx.canvasHeight - 94);
  detail.handleClick();
  assert.equal(game.scene, 'explore');
  assert.equal(explore.activeStageId, 'stage_battle_1_1');
});

test('正式 Campaign 详情返回明确回到 Campaign 地图', () => {
  const { ctx, game, map, detail } = setup();
  game.goToChapterSelect();
  map.render();
  const node = map.cards[0];
  assert.ok(node);
  tap(ctx, node.x, node.y);
  map.handleClick();
  tap(ctx, ctx.canvasWidth / 2, ctx.canvasHeight - 43);
  detail.handleClick();
  assert.equal(game.scene, 'campaignMap');
});

test('固定屏仅由显式调试 startBattle 入口启动', () => {
  const { ctx, game, stageIntro } = setup();
  assert.equal(game.startBattle('1-1'), true);
  assert.equal(game.scene, 'stageIntro');
  tap(ctx, ctx.canvasWidth / 2, ctx.canvasHeight - 92);
  stageIntro.handleClick();
  assert.equal(game.scene, 'battle');
});

test('正式 Campaign 地图锁定节点停留地图并说明不可进入', () => {
  const { ctx, game, map } = setup();
  game.goToChapterSelect();
  map.render();
  const locked = map.cards.find(card => card.nodeId === 'task32_node_2');
  assert.ok(locked);
  tap(ctx, locked.x, locked.y);
  map.handleClick();
  assert.equal(game.scene, 'campaignMap');
  assert.match(map.toast, /前置|解锁/);
});

test('正式 free-map 中途退出明确返回 Campaign 地图', () => {
  const { ctx, game, map, detail } = setup();
  game.goToChapterSelect();
  map.render();
  const node = map.cards[0];
  assert.ok(node);
  tap(ctx, node.x, node.y);
  map.handleClick();
  tap(ctx, ctx.canvasWidth / 2, ctx.canvasHeight - 94);
  detail.handleClick();
  game.abortCurrentStage();
  assert.equal(game.scene, 'campaignMap');
  assert.equal(game.stageResult, 'aborted');
});

test('调试固定屏介绍页返回时仍回到 Campaign 地图', () => {
  const { ctx, game, stageIntro } = setup();
  game.goToChapterSelect();
  assert.equal(game.startBattle('1-1'), true);
  tap(ctx, ctx.canvasWidth / 2, ctx.canvasHeight - 38);
  stageIntro.handleClick();
  assert.equal(game.scene, 'campaignMap');
});
