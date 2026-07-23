import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublishedCampaigns } from '../dist/campaign/CampaignRepository.js';
import { buildChapterProgress, markUnlockPresented, nextCampaignNode } from '../dist/campaign/CampaignProgressService.js';

const chapter = {
  id: 'chapter_scrap_border', campaignId: 'main_campaign', chapterNo: 1,
  name: '第一章·废料边境', subtitle: '边境启动', description: '', backgroundArtKey: 'map.trainingGround.floor',
  canvasWidth: 1000, canvasHeight: 600, viewportX: 0, viewportY: 0, enabled: true,
  completionText: '第一章完成', nodes: [
    { id: 'node_1_1', chapterId: 'chapter_scrap_border', stageId: 'stage_battle_1_1', name: '铸造通道', x: 180, y: 320, type: 'normal', isStart: true, isEnd: false, order: 1, recommendedPower: 220, enabled: true },
    { id: 'node_training', chapterId: 'chapter_scrap_border', stageId: 'stage_explore_training_01', name: '训练场', x: 720, y: 240, type: 'exploration', isStart: false, isEnd: true, order: 2, recommendedPower: 260, enabled: true },
  ], connections: [
    { id: 'path_1', chapterId: 'chapter_scrap_border', fromNodeId: 'node_1_1', toNodeId: 'node_training', pathType: 'normal', oneWay: true, order: 1, enabled: true },
  ],
} as any;

const campaign = { id: 'main_campaign', name: '主线战役', subtitle: '', description: '', defaultChapterId: chapter.id, order: 1, enabled: true, schemaVersion: 1, contentVersion: 1, chapters: [chapter] } as any;
const snapshot = { schemaVersion: 1, releaseId: 'r8', releaseVersion: 'R000008', generatedAt: '', checksum: 'sum', campaignCount: 1, chapterCount: 1, nodeCount: 2, connectionCount: 1, campaigns: [campaign] } as any;

test('正式Campaign Snapshot必须由内容快照声明且checksum匹配', () => {
  assert.deepEqual(resolvePublishedCampaigns(snapshot, {}), []);
  assert.deepEqual(resolvePublishedCampaigns(snapshot, { campaignSnapshotReleaseId: 'r8', campaignSnapshotChecksum: 'bad' }), []);
  assert.equal(resolvePublishedCampaigns(snapshot, { campaignSnapshotReleaseId: 'r8', campaignSnapshotChecksum: 'sum' })[0].id, 'main_campaign');
});

test('章节节点状态结合正式地图和玩家进度计算', () => {
  const player: any = playerWith(['1-1'], {});
  let view = buildChapterProgress(chapter, player, mapStage);
  assert.equal(view.nodes[0].state, 'UNLOCKED');
  assert.equal(view.nodes[1].state, 'LOCKED');
  player.stageProgress['1-1'] = { cleared: true, bestStars: 3, clearCount: 1, bestClearTimeSec: 42 };
  player.unlockedStageIds.push('explore_training');
  player.campaignProgress.newlyUnlockedNodeIds.push('node_training');
  view = buildChapterProgress(chapter, player, mapStage);
  assert.equal(view.nodes[0].state, 'THREE_STAR');
  assert.equal(view.nodes[1].state, 'NEWLY_UNLOCKED');
  assert.equal(view.connections[0].state, 'completed');
});

test('锁定节点详情使用中文关卡名与真实星级进度', () => {
  const player: any = playerWith(['1-1'], {
    '1-1': { cleared: false, bestStars: 1, clearCount: 0 },
  });
  const requirement = (fromStageId: string, toStageId: string) =>
    fromStageId === 'stage_battle_1_1' && toStageId === 'stage_explore_training_01' ? 3 : 1;

  const view = (buildChapterProgress as any)(chapter, player, mapStage, requirement);

  assert.equal(view.nodes[1].state, 'LOCKED');
  assert.deepEqual(view.nodes[1].lockDetail, {
    status: 'LOCKED', nodeName: '训练场', prerequisiteName: '铸造通道', requiredStars: 3,
    currentStars: 1, progressText: '1 / 3 星', enterHint: '当前节点尚未解锁，无法进入',
    reason: '前置关卡「铸造通道」需要 3 星',
  });
  assert.doesNotMatch(view.nodes[1].lockReason, /node_1_1/);
});

test('锁定节点按节点顺序汇总全部未满足的多入边前置条件', () => {
  const multi = structuredClone(chapter);
  multi.nodes.splice(1, 0, {
    id: 'node_side', chapterId: chapter.id, stageId: 'stage_side', name: '支线维修间',
    x: 420, y: 180, type: 'normal', isStart: false, isEnd: false,
    order: 2, recommendedPower: 240, enabled: true,
  });
  multi.nodes[2].order = 3;
  multi.connections = [
    { id: 'path_side', chapterId: chapter.id, fromNodeId: 'node_side', toNodeId: 'node_training', pathType: 'normal', oneWay: true, order: 2, enabled: true },
    { id: 'path_main', chapterId: chapter.id, fromNodeId: 'node_1_1', toNodeId: 'node_training', pathType: 'normal', oneWay: true, order: 1, enabled: true },
  ];
  const player: any = playerWith(['1-1', 'side'], {
    '1-1': { cleared: false, bestStars: 1, clearCount: 0 },
    side: { cleared: false, bestStars: 0, clearCount: 0 },
  });
  const mapper = (id: string) => id === 'stage_battle_1_1' ? '1-1' : id === 'stage_side' ? 'side' : 'explore_training';
  const requirement = (from: string) => from === 'stage_battle_1_1' ? 3 : 1;

  const detail = buildChapterProgress(multi, player, mapper, requirement)
    .nodes.find(item => item.id === 'node_training')?.lockDetail;

  assert.deepEqual(detail, {
    status: 'LOCKED', nodeName: '训练场', prerequisiteName: '铸造通道、支线维修间',
    requiredStars: 4, currentStars: 1, progressText: '1 / 4 星',
    enterHint: '当前节点尚未解锁，无法进入',
    reason: '未满足前置关卡：「铸造通道」1 / 3 星；「支线维修间」0 / 1 星',
    prerequisites: [
      { nodeName: '铸造通道', requiredStars: 3, currentStars: 1 },
      { nodeName: '支线维修间', requiredStars: 1, currentStars: 0 },
    ],
  });
});

test('新解锁表现只消费一次且下一节点必须已解锁', () => {
  const player: any = playerWith(['1-1'], {});
  player.campaignProgress.newlyUnlockedNodeIds = ['node_training'];
  assert.equal(nextCampaignNode(chapter, 'node_1_1', player, mapStage), undefined);
  player.unlockedStageIds.push('explore_training');
  assert.equal(nextCampaignNode(chapter, 'node_1_1', player, mapStage)?.id, 'node_training');
  markUnlockPresented(player, 'node_training');
  assert.deepEqual(player.campaignProgress.newlyUnlockedNodeIds, []);
  assert.deepEqual(player.campaignProgress.playedUnlockNodeIds, ['node_training']);
  markUnlockPresented(player, 'node_training');
  assert.deepEqual(player.campaignProgress.playedUnlockNodeIds, ['node_training']);
});

test('全部节点完成时章节汇总星数并标记完成', () => {
  const progress = { '1-1': { cleared: true, bestStars: 3, clearCount: 1 }, explore_training: { cleared: true, bestStars: 1, clearCount: 1 } };
  const player: any = playerWith(['1-1', 'explore_training'], progress);
  const view = buildChapterProgress(chapter, player, mapStage);
  assert.equal(view.completed, true);
  assert.equal(view.totalStars, 4);
  assert.deepEqual(player.campaignProgress.completedChapterIds, ['chapter_scrap_border']);
});

function mapStage(id: string) { return id === 'stage_battle_1_1' ? '1-1' : 'explore_training'; }
function playerWith(unlockedStageIds: string[], stageProgress: any) {
  return { unlockedStageIds, stageProgress, campaignProgress: { newlyUnlockedNodeIds: [], playedUnlockNodeIds: [], completedChapterIds: [], chapterStars: {}, claimedChapterRewardIds: [] } };
}
