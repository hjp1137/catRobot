import type { StageRewardType } from '../content/models/StageProgression';

export interface StageRunResult {
  stageRunId: string;
  stageId: string;
  contentStageId: string;
  victory: boolean;
  startedAt: number;
  endedAt: number;
  elapsedSec: number;
  clearedWaves: number;
  totalWaves: number;
  defeatedEnemies: number;
  heroRemainingHp: number;
  heroMaxHp: number;
  failureReason?: string;
}

export interface StageObjectiveResult {
  id: string;
  name: string;
  completed: boolean;
  failed: boolean;
  required: boolean;
  current: number;
  target: number;
  displayText: string;
  supported: boolean;
}

export interface GrantedStageReward {
  poolId: string;
  entryId: string;
  rewardType: StageRewardType;
  rewardRefId: string;
  quantity: number;
  convertedToEnhanceStone?: number;
}

export interface StageSettlement {
  stageRunId: string;
  stageId: string;
  victory: boolean;
  stars: number;
  objectiveResults: StageObjectiveResult[];
  grantedRewards: GrantedStageReward[];
  firstClear: boolean;
  firstThreeStar: boolean;
  rewardsGranted: boolean;
  idempotent: boolean;
  unlockedStageIds: string[];
  failureReason?: string;
  run: StageRunResult;
}

export interface StageSettlementOptions {
  random: () => number;
  now: () => number;
  mapStageId?: (contentStageId: string) => string;
}
