import test from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { MainUI } from '../dist/ui/MainUI.js';
import { CampaignMapUI } from '../dist/ui/CampaignMapUI.js';
import { CampaignStageDetailUI } from '../dist/ui/CampaignStageDetailUI.js';
import { resolvePublishedCampaigns } from '../dist/campaign/CampaignRepository.js';
import type { CampaignDefinition, CampaignSnapshot } from '../src/content/models/Campaign.ts';
import { LEGACY_R000007_RELEASE_FIXTURE } from './fixtures/legacyReleaseFixture.ts';

const CURRENT_CAMPAIGNS: CampaignDefinition[] = [{
  id: 'main', name: '主线战役', subtitle: '星核远征', description: '', defaultChapterId: 'chapter_1', order: 1, enabled: true, schemaVersion: 1, contentVersion: 1,
  chapters: [{ id: 'chapter_1', campaignId: 'main', chapterNo: 1, name: '第一章·废料边境', subtitle: '边境启动', description: '', backgroundArtKey: 'map.trainingGround.floor', canvasWidth: 1000, canvasHeight: 600, viewportX: 0, viewportY: 0, enabled: true, completionText: '完成', nodes: [
    { id: 'node_1', chapterId: 'chapter_1', stageId: 'stage_battle_1_1', name: '铸造通道', x: 180, y: 320, type: 'normal', isStart: true, isEnd: false, order: 1, recommendedPower: 220, enabled: true },
    { id: 'node_2', chapterId: 'chapter_1', stageId: 'stage_explore_training_01', name: '训练场', x: 720, y: 240, type: 'exploration', isStart: false, isEnd: true, order: 2, recommendedPower: 260, enabled: true },
  ], connections: [{ id: 'path_1', chapterId: 'chapter_1', fromNodeId: 'node_1', toNodeId: 'node_2', pathType: 'normal', oneWay: true, order: 1, enabled: true }] }],
}];

function setup(publishedCampaigns: CampaignDefinition[] = CURRENT_CAMPAIGNS) {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.publishedCampaigns = publishedCampaigns;
  const map = new CampaignMapUI(ctx, game);
  game.setCampaignMapUi(map);
  game.setCampaignStageDetailUi(new CampaignStageDetailUI(ctx, game));
  return { ctx, game, map };
}

function assertRenderedText(ctx: MockContext, text: string): void {
  assert.ok(ctx.canvas.calls.includes(`text:${text}`), `应渲染 ${text}`);
}

test('R000007 历史发布包无 Campaign 快照时走 LEGACY_FALLBACK', () => {
  const snapshot: CampaignSnapshot = {
    schemaVersion: 1,
    releaseId: LEGACY_R000007_RELEASE_FIXTURE.release.id,
    releaseVersion: LEGACY_R000007_RELEASE_FIXTURE.release.version,
    generatedAt: '', checksum: 'legacy-r000007-empty-campaigns',
    campaignCount: 0, chapterCount: 0, nodeCount: 0, connectionCount: 0,
    campaigns: LEGACY_R000007_RELEASE_FIXTURE.publishedCampaigns,
  };
  const campaigns = resolvePublishedCampaigns(snapshot, {
    campaignSnapshotReleaseId: snapshot.releaseId,
    campaignSnapshotChecksum: snapshot.checksum,
  });
  assert.deepEqual(campaigns, []);
  const { ctx, game } = setup(campaigns);
  new MainUI(ctx, game).render();
  assert.equal(LEGACY_R000007_RELEASE_FIXTURE.mode, 'LEGACY_FALLBACK');
  assert.equal(LEGACY_R000007_RELEASE_FIXTURE.release.version, 'R000007');
  assert.equal(LEGACY_R000007_RELEASE_FIXTURE.legacyContent.stages.length, 2);
  assertRenderedText(ctx, '进入章节'); game.goToChapterSelect(); assert.equal(game.scene, 'chapterSelect');
});

test('有 Campaign 时首页进入章节地图并记录定位', () => {
  const { ctx, game } = setup(); new MainUI(ctx, game).render(); assertRenderedText(ctx, '主线战役');
  game.goToChapterSelect(); assert.equal(game.scene, 'campaignMap'); assert.equal(game.player.campaignProgress.currentChapterId, 'chapter_1');
});

test('地图锁定节点给出原因，解锁节点进入关卡详情', () => {
  const { ctx, game, map } = setup(); game.goToChapterSelect(); map.render();
  const locked = map.cards.find(card => card.nodeId === 'node_2'); assert.ok(locked); ctx.input.simulateTap(locked.x, locked.y); map.handleClick();
  assert.match(map.toast, /前置|解锁/); const open = map.cards.find(card => card.nodeId === 'node_1'); assert.ok(open); ctx.input.simulateTap(open.x, open.y); map.handleClick();
  assert.equal(game.scene, 'campaignStageDetail'); assert.equal(game.currentCampaignNodeId, 'node_1');
});

test('点击 LOCKED 节点显示详情且不得跳转', () => {
  const { ctx, game, map } = setup(); game.goToChapterSelect(); map.render();
  const locked = map.cards.find(card => card.nodeId === 'node_2'); assert.ok(locked); ctx.input.simulateTap(locked.x, locked.y); map.handleClick();
  assert.equal(game.scene, 'campaignMap'); assert.deepEqual(map.lockedDetail, { status: 'LOCKED', nodeName: '训练场', prerequisiteName: '铸造通道', requiredStars: 1, currentStars: 0, progressText: '0 / 1 星', enterHint: '当前节点尚未解锁，无法进入', reason: '前置关卡「铸造通道」需要 1 星' });
});

test('NEWLY_UNLOCKED 节点可进入详情', () => {
  const { ctx, game, map } = setup(); game.player.unlockedStageIds.push('explore_training'); game.player.campaignProgress.newlyUnlockedNodeIds.push('node_2'); game.goToChapterSelect(); map.render();
  const node = map.cards.find(card => card.nodeId === 'node_2'); assert.ok(node); ctx.input.simulateTap(node.x, node.y); map.handleClick();
  assert.equal(game.getCampaignChapterView()?.nodes[1].state, 'NEWLY_UNLOCKED'); assert.equal(game.scene, 'campaignStageDetail'); assert.equal(map.lockedDetail, undefined);
});

test('战役详情开始挑战后统一进入自由地图运行链', () => {
  const { game } = setup(); game.goToChapterSelect(); assert.equal(game.openCampaignNode('node_1'), true); assert.equal(game.beginCampaignNode(), true); assert.equal(game.scene, 'explore'); assert.equal(game.player.selectedStageId, '1-1');
});

test('返回地图刷新且新解锁表现只消费一次', () => {
  const { game } = setup(); game.player.unlockedStageIds.push('explore_training'); game.player.campaignProgress.newlyUnlockedNodeIds.push('node_2'); game.goToChapterSelect();
  assert.equal(game.getCampaignChapterView()?.nodes[1].state, 'NEWLY_UNLOCKED'); game.consumeCampaignUnlocks(); assert.equal(game.getCampaignChapterView()?.nodes[1].state, 'UNLOCKED'); game.returnToStageSelect(); assert.equal(game.scene, 'campaignMap');
});
