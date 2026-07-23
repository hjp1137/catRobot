import type { PlayerData } from '../data/PlayerData';
import type { CampaignChapterDefinition, CampaignNodeState, CampaignProgressData } from '../content/models/Campaign';

type StageMapper = (contentStageId: string) => string;
type UnlockRequirementMapper = (fromContentStageId: string, toContentStageId: string) => number;

export function buildChapterProgress(chapter: CampaignChapterDefinition, player: PlayerData,
  mapStage: StageMapper = id => id, requiredStarsFor: UnlockRequirementMapper = () => 1) {
  const progress = ensureProgress(player);
  const nodes = chapter.nodes.filter(node => node.enabled).sort((a, b) => a.order - b.order).map(node => {
    const stageId = mapStage(node.stageId);
    const stage = player.stageProgress[stageId];
    const unlocked = player.unlockedStageIds.includes(stageId) || node.isStart;
    let state: CampaignNodeState = 'LOCKED';
    if (stage?.cleared && stage.bestStars >= 3) state = 'THREE_STAR';
    else if (stage?.cleared) state = 'CLEARED';
    else if (unlocked && progress.newlyUnlockedNodeIds.includes(node.id) && !progress.playedUnlockNodeIds.includes(node.id)) state = 'NEWLY_UNLOCKED';
    else if (unlocked) state = 'UNLOCKED';
    const requirements = chapter.connections.filter(path => path.enabled && path.toNodeId === node.id)
      .map(path => chapter.nodes.find(item => item.enabled && item.id === path.fromNodeId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => a.order - b.order)
      .map(item => ({ nodeName: item.name,
        requiredStars: Math.max(1, requiredStarsFor(item.stageId, node.stageId)),
        currentStars: player.stageProgress[mapStage(item.stageId)]?.bestStars ?? 0 }));
    const unmet = requirements.filter(item => item.currentStars < item.requiredStars);
    const shown = unmet.length ? unmet : requirements;
    const requiredStars = shown.reduce((sum, item) => sum + item.requiredStars, 0) || 1;
    const currentStars = shown.reduce((sum, item) => sum + Math.min(item.currentStars, item.requiredStars), 0);
    const prerequisiteName = shown.map(item => item.nodeName).join('、') || '前置关卡';
    const reason = shown.length > 1
      ? `未满足前置关卡：${shown.map(item => `「${item.nodeName}」${item.currentStars} / ${item.requiredStars} 星`).join('；')}`
      : `前置关卡「${shown[0]?.nodeName ?? '未知'}」需要 ${requiredStars} 星`;
    const lockDetail = state === 'LOCKED' ? {
      status: 'LOCKED' as const, nodeName: node.name, prerequisiteName,
      requiredStars, currentStars, progressText: `${currentStars} / ${requiredStars} 星`,
      enterHint: '当前节点尚未解锁，无法进入', reason,
      ...(shown.length > 1 ? { prerequisites: shown } : {}),
    } : undefined;
    return { ...node, stageId, state, stars: stage?.bestStars ?? 0, bestTime: stage?.bestClearTimeSec,
      lockReason: lockDetail?.reason, lockDetail };
  });
  const byId = new Map(nodes.map(node => [node.id, node]));
  const connections = chapter.connections.filter(path => path.enabled).map(path => {
    const from = byId.get(path.fromNodeId); const to = byId.get(path.toNodeId);
    const state = from?.state === 'CLEARED' || from?.state === 'THREE_STAR'
      ? 'completed' : to?.state === 'LOCKED' ? 'locked' : 'normal';
    return { ...path, state };
  });
  const totalStars = nodes.reduce((sum, node) => sum + node.stars, 0);
  const completed = nodes.length > 0 && nodes.every(node => node.state === 'CLEARED' || node.state === 'THREE_STAR');
  progress.chapterStars[chapter.id] = Math.max(progress.chapterStars[chapter.id] ?? 0, totalStars);
  if (completed && !progress.completedChapterIds.includes(chapter.id)) progress.completedChapterIds.push(chapter.id);
  return { chapter, nodes, connections, totalStars, completed };
}

export function nextCampaignNode(chapter: CampaignChapterDefinition, nodeId: string, player: PlayerData, mapStage: StageMapper = id => id) {
  const path = chapter.connections.filter(item => item.enabled && item.fromNodeId === nodeId).sort((a, b) => a.order - b.order)[0];
  const node = path && chapter.nodes.find(item => item.id === path.toNodeId && item.enabled);
  return node && player.unlockedStageIds.includes(mapStage(node.stageId)) ? node : undefined;
}

export function markUnlockPresented(player: PlayerData, nodeId: string): void {
  const progress = ensureProgress(player);
  progress.newlyUnlockedNodeIds = progress.newlyUnlockedNodeIds.filter(id => id !== nodeId);
  if (!progress.playedUnlockNodeIds.includes(nodeId)) progress.playedUnlockNodeIds.push(nodeId);
}

function ensureProgress(player: PlayerData): CampaignProgressData {
  const value = player.campaignProgress;
  if (value) return value;
  return player.campaignProgress = { newlyUnlockedNodeIds: [], playedUnlockNodeIds: [], completedChapterIds: [], chapterStars: {}, claimedChapterRewardIds: [] };
}
