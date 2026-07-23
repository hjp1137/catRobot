import type { EnemyTemplate } from './EnemyTemplate';
import type { BackgroundTheme } from './BackgroundTheme';
import type { HeroVisualTemplate } from './HeroVisualTemplate';
import type { StageDefinition } from './StageDefinition';
import type { AnimationClipDefinition } from './AnimationClip';
import type { StageRuntimeConfig } from './StageOrchestration';
import type { StageProgressionDefinition, StageRewardCatalogEntry } from './StageProgression';
import type { CampaignDefinition } from './Campaign';
import type { TutorialFlowDefinition } from './Tutorial';

export type ContentKind = 'enemy' | 'background' | 'heroVisual' | 'stage';

export interface ContentDataSet {
  enemies: EnemyTemplate[];
  backgrounds: BackgroundTheme[];
  heroes: HeroVisualTemplate[];
  stages: StageDefinition[];
  animationClips?: AnimationClipDefinition[];
}

export type ContentRepositorySource = 'built-in-default' | 'mysql-published-snapshot';

export interface ContentSnapshot {
  schemaVersion: 1;
  releaseId: string;
  releaseVersion: string;
  generatedAt: string;
  checksum: string;
  artManifestReleaseId?: string;
  artManifestChecksum?: string;
  animationManifestReleaseId?: string;
  animationManifestChecksum?: string;
  stageOrchestrationReleaseId?: string;
  stageOrchestrationChecksum?: string;
  stageProgressionReleaseId?: string;
  stageProgressionChecksum?: string;
  campaignSnapshotReleaseId?: string;
  campaignSnapshotChecksum?: string;
  campaignSnapshotPath?: string;
  tutorialSnapshotReleaseId?: string;
  tutorialSnapshotChecksum?: string;
  tutorialSnapshotPath?: string;
  tutorialDefinitions?: TutorialFlowDefinition[];
  artResources?: ContentSnapshotArtResource[];
  stageOrchestrations?: ContentSnapshotStageOrchestration[];
  stageProgressions?: ContentSnapshotStageProgression[];
  stageProgressionDefinitions?: StageProgressionDefinition[];
  stageRewardCatalog?: StageRewardCatalogEntry[];
  stageOrchestrationDefinitions?: StageRuntimeConfig[];
  campaignDefinitions?: CampaignDefinition[];
  enemies: EnemyTemplate[];
  backgrounds: BackgroundTheme[];
  heroVisuals: HeroVisualTemplate[];
  heroes?: HeroVisualTemplate[];
  stages: StageDefinition[];
  animationClips?: AnimationClipDefinition[];
}

export interface ContentSnapshotStageProgression {
  stageId: string;
  objectiveCount: number;
  rewardEntryCount: number;
  unlockRuleCount: number;
}

export interface ContentSnapshotStageOrchestration {
  stageId: string;
  releaseId: string;
  checksum: string;
  waveCount: number;
  spawnPointCount: number;
  layerCount: number;
  runtime?: StageRuntimeConfig;
}

export interface ContentSnapshotArtResource {
  artKey: string;
  versionId: string;
  versionNo: number;
  checksum: string;
  path: string;
}

export interface ContentSnapshotMeta {
  releaseId: string;
  releaseVersion: string;
  snapshotChecksum: string;
}

export interface ContentValidationError {
  file: string;
  objectId: string;
  field: string;
  reason: string;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: ContentValidationError[];
}
