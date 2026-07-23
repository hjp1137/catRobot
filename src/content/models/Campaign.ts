export type CampaignNodeType = 'normal' | 'elite' | 'boss' | 'exploration';
export type CampaignPathType = 'normal' | 'locked' | 'completed';
export type CampaignNodeState = 'LOCKED' | 'UNLOCKED' | 'CLEARED' | 'THREE_STAR' | 'NEWLY_UNLOCKED';

export interface CampaignStageNodeDefinition {
  id: string; chapterId: string; stageId: string; name: string; x: number; y: number;
  type: CampaignNodeType; iconArtKey?: ArtResourceKey; isStart: boolean; isEnd: boolean;
  order: number; recommendedPower: number; description?: string; enabled: boolean;
}

export interface CampaignNodeConnectionDefinition {
  id: string; chapterId: string; fromNodeId: string; toNodeId: string;
  pathType: CampaignPathType; oneWay: boolean; order: number; enabled: boolean;
}

export interface CampaignChapterDefinition {
  id: string; campaignId: string; chapterNo: number; name: string; subtitle: string;
  description: string; backgroundArtKey: ArtResourceKey; canvasWidth: number; canvasHeight: number;
  viewportX: number; viewportY: number; enabled: boolean; completionText: string;
  completionRewardRef?: string; nodes: CampaignStageNodeDefinition[];
  connections: CampaignNodeConnectionDefinition[];
}

export interface CampaignDefinition {
  id: string; name: string; subtitle: string; description: string; coverArtKey?: ArtResourceKey;
  defaultChapterId: string; order: number; enabled: boolean; schemaVersion: number;
  contentVersion: number; chapters: CampaignChapterDefinition[];
}

export interface CampaignSnapshot {
  schemaVersion: 1; releaseId: string; releaseVersion: string; generatedAt: string;
  checksum: string; campaignCount: number; chapterCount: number; nodeCount: number;
  connectionCount: number; campaigns: CampaignDefinition[];
}

export interface CampaignProgressData {
  currentCampaignId?: string; currentChapterId?: string; recentStageId?: string;
  newlyUnlockedNodeIds: string[]; playedUnlockNodeIds: string[];
  completedChapterIds: string[]; chapterStars: Record<string, number>;
  claimedChapterRewardIds: string[];
}
import type { ArtResourceKey } from '../../assets/ArtResourceKeys';
