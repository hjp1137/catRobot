export type StageObjectiveType = 'clear-all-waves' | 'survive-duration' | 'hero-health-above' | 'complete-within-duration' | 'defeat-enemy-count';
export type StageRewardType = 'equipment' | 'rune' | 'material' | 'currency';
export type StageRewardGroup = 'first-clear' | 'repeat-clear' | 'first-three-star' | 'objective-bonus';
export type StageUnlockRuleType = 'default-unlocked' | 'prerequisite-clear' | 'prerequisite-stars';

export interface StageObjectiveDefinition {
  id: string; name: string; type: StageObjectiveType; required: boolean;
  params: Record<string, number>; order: number; displayText: string;
  progressDisplay: string; starEligible: boolean; enabled: boolean;
}

export interface StageRewardEntry {
  id: string; rewardType: StageRewardType; rewardRefId: string;
  minQuantity: number; maxQuantity: number; probability: number;
  guaranteed: boolean; enabled: boolean;
}

export interface StageRewardPool {
  id: string; name: string; group: StageRewardGroup; objectiveId?: string;
  selectionMode: 'all' | 'independent-probability'; entries: StageRewardEntry[];
}

export interface StageUnlockRule {
  id: string; type: StageUnlockRuleType; prerequisiteStageId?: string;
  requiredStars: number; nextStageId?: string; enabled: boolean;
}

export interface StageProgressionDefinition {
  stageId: string; recommendedPower: number; victoryText: string; failureText: string;
  objectives: StageObjectiveDefinition[]; rewardPools: StageRewardPool[]; unlockRules: StageUnlockRule[];
}

export interface StageRewardCatalogEntry {
  type: StageRewardType; refId: string; name: string; iconArtKey?: ArtResourceKey;
}

export interface StageProgressionSnapshot {
  schemaVersion: 1; releaseId: string; releaseVersion: string; generatedAt: string; checksum: string;
  stageCount: number; objectiveCount: number; rewardEntryCount: number; unlockRuleCount: number;
  rewardCatalog: StageRewardCatalogEntry[]; stages: StageProgressionDefinition[];
}
import type { ArtResourceKey } from '../../assets/ArtResourceKeys';
