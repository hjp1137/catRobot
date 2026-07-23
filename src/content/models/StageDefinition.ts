export type StageMode = 'fixed-battle' | 'explore';

export interface StageEnemyGroup {
  enemyTemplateId: string;
  count: number;
  spawnAreaId?: string;
  spawnGroup?: 'around_player' | 'left_right' | 'top' | 'default';
  spawnInterval?: number;
  levelMultiplier?: number;
}

export interface StageWaveDefinition {
  wave: number;
  id?: string;
  name?: string;
  message?: string;
  spawnDelay?: number;
  groups: StageEnemyGroup[];
}

export interface ExplorationSpawnGroup {
  id: string;
  enemyTemplateId: string;
  spawnPoint: { x: number; y: number; radius: number };
  initialCount: number;
  maxAlive: number;
  respawnInterval: number;
  active: boolean;
}

export interface ExplorationStageConfig {
  worldWidth: number;
  worldHeight: number;
  spawnGroups: ExplorationSpawnGroup[];
  resourcePointIds?: string[];
  chestIds?: string[];
}

export interface StageObjectiveDefinition {
  type: 'defeat' | 'resource' | 'chest';
  required: number;
}

export interface StageDefinition {
  id: string;
  legacyStageId?: string;
  name: string;
  mode: StageMode;
  heroVisualTemplateId: string;
  backgroundThemeId: string;
  waves?: StageWaveDefinition[];
  exploration?: ExplorationStageConfig;
  objectives?: StageObjectiveDefinition[];
  enabled: boolean;
  version: number;
}
