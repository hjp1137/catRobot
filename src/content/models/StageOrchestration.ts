export type StageSceneMode = 'fixed-screen' | 'exploration';
export type StageLayerType = 'background' | 'far' | 'ground' | 'entity' | 'foreground' | 'overlay' | 'collision';
export type StageSpawnPointType = 'hero' | 'enemy' | 'effect' | 'portal';
export type StageTriggerType = 'stage-start' | 'previous-wave-cleared' | 'delay' | 'manual-preview';
export type StageCompletionType = 'all-waves-cleared' | 'survive-duration';
export type StageFailureType = 'hero-dead' | 'timeout' | 'protected-target-destroyed';

export interface StageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StageSceneLayout {
  stageId?: string;
  canvasWidth: number;
  canvasHeight: number;
  sceneMode: StageSceneMode;
  backgroundThemeId?: string;
  heroSpawnPointId?: string;
  battleArea: StageRect;
  camera?: Record<string, unknown>;
  exploreHud?: ExploreHudConfig;
  enabled: boolean;
  version?: number;
}

export interface ExploreHudConfig {
  layout?: 'standard' | 'compact' | 'tactical';
  theme?: 'legacy' | 'industrial';
  showWaveNotice?: boolean;
  skillButtonShape?: 'circle' | 'hex';
  skillButtonSize?: number;
  skillButtonGap?: number;
  skillButtonRight?: number;
  skillButtonBottom?: number;
  showSkillLabels?: boolean;
  panelOpacity?: number;
}

export interface StageLayer {
  id: string;
  name: string;
  type: StageLayerType;
  artKey?: string;
  backgroundThemeId?: string;
  order: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale: number;
  opacity: number;
  tiled: boolean;
  scrollsWithCamera: boolean;
  parallax: number;
  enabled: boolean;
}

export interface StageSpawnPoint {
  id: string;
  name: string;
  type: StageSpawnPointType;
  x: number;
  y: number;
  facing: 'left' | 'right' | 'up' | 'down';
  battleAreaId?: string;
  enabled: boolean;
  note?: string;
}

export interface StageWaveEntry {
  id: string;
  enemyTemplateId: string;
  spawnPointId: string;
  count: number;
  spawnIntervalMs: number;
  initialDelayMs: number;
  elite: boolean;
  levelMultiplier: number;
  hpMultiplier: number;
  attackMultiplier: number;
  animationClipOverrides?: Record<string, string>;
  enabled: boolean;
}

export interface StageWave {
  id: string;
  order: number;
  name: string;
  startTrigger: { type: StageTriggerType };
  startDelayMs: number;
  entries: StageWaveEntry[];
  maxAlive: number;
  completionRule: { type: 'all-enemies-cleared' };
  completionDelayMs: number;
  nextWave?: 'next' | 'stage-clear' | string;
  enabled: boolean;
}

export interface StageRuntimeConfig {
  schemaVersion: 1;
  stageId: string;
  layout: StageSceneLayout;
  layers: StageLayer[];
  spawnPoints: StageSpawnPoint[];
  waves: StageWave[];
  completionRule: { type: StageCompletionType };
  failureRule: { type: StageFailureType };
}

export interface StageOrchestrationSnapshot {
  schemaVersion: 1;
  releaseId: string;
  releaseVersion: string;
  generatedAt: string;
  checksum: string;
  stages: StageRuntimeConfig[];
}
