import { getContentStageDefinition } from '../content/adapters/LegacyStageConfigAdapter';
import { getLegacyEnemyIdForTemplate } from '../content/adapters/EnemyTemplateAdapter';

export type ExploreEnemyState = 'idle' | 'patrol' | 'alert' | 'chase' | 'attack' | 'dead';
export type ExploreResourceType = 'energy' | 'scrap' | 'chip' | 'coin';
export type ExploreChestRewardType = 'coin' | 'heal' | 'energy' | 'shield';

export interface ExploreSpawnPointConfig {
  id: string;
  x: number;
  y: number;
  radius: number;
  enemyTemplateId: string;
  enemyType: 'mouse' | 'elite_mouse';
  maxAlive: number;
  intervalMs: number;
  initialCount: number;
  active: boolean;
}

export interface ExploreResourceNodeConfig {
  id: string;
  type: ExploreResourceType;
  x: number;
  y: number;
  amount: number;
  collected: boolean;
}

export interface ExploreChestConfig {
  id: string;
  x: number;
  y: number;
  rewardType: ExploreChestRewardType;
  rewardAmount: number;
  opened: boolean;
}

export interface ExploreObjectiveState {
  enemyKillsRequired: number;
  enemyKills: number;
  enemyKillGoalCompleted: boolean;
  resourcesRequired: number;
  resourcesCollected: number;
  resourceGoalCompleted: boolean;
  chestsRequired: number;
  chestsOpened: number;
  chestGoalCompleted: boolean;
  completed: boolean;
}

const EXPLORE_STAGE_DEFINITION = getContentStageDefinition('stage_explore_training_01');
const EXPLORE_STAGE_CONFIG = EXPLORE_STAGE_DEFINITION.exploration!;

export const TRAINING_GROUND_CONTENT = {
  stageDefinitionId: EXPLORE_STAGE_DEFINITION.id,
  backgroundThemeId: EXPLORE_STAGE_DEFINITION.backgroundThemeId,
  heroVisualTemplateId: EXPLORE_STAGE_DEFINITION.heroVisualTemplateId,
  worldWidth: EXPLORE_STAGE_CONFIG.worldWidth,
  worldHeight: EXPLORE_STAGE_CONFIG.worldHeight,
  enemyAI: {
    patrolRadius: 140,
    alertRadius: 360,
    chaseGiveUpRadius: 520,
    attackRange: 42,
    playerSpawnSafeRadius: 180,
  },
  objective: {
    enemyKillsRequired: 12,
    resourcesRequired: 3,
    chestsRequired: 1,
  },
  spawnPoints: EXPLORE_STAGE_CONFIG.spawnGroups.map(group => ({
    id: group.id,
    x: group.spawnPoint.x,
    y: group.spawnPoint.y,
    radius: group.spawnPoint.radius,
    enemyTemplateId: group.enemyTemplateId,
    enemyType: getLegacyEnemyIdForTemplate(group.enemyTemplateId) as 'mouse' | 'elite_mouse',
    maxAlive: group.maxAlive,
    intervalMs: group.respawnInterval,
    initialCount: group.initialCount,
    active: group.active,
  })) satisfies ExploreSpawnPointConfig[],
  resourceNodes: [
    { id: 'energy_01', type: 'energy', x: 520, y: 860, amount: 1, collected: false },
    { id: 'scrap_01', type: 'scrap', x: 1120, y: 1680, amount: 1, collected: false },
    { id: 'chip_01', type: 'chip', x: 360, y: 2240, amount: 1, collected: false },
    { id: 'coin_01', type: 'coin', x: 1450, y: 1180, amount: 4, collected: false },
  ] satisfies ExploreResourceNodeConfig[],
  chests: [
    { id: 'chest_training_01', x: 760, y: 1320, rewardType: 'coin', rewardAmount: 10, opened: false },
    { id: 'supply_training_01', x: 1280, y: 2040, rewardType: 'heal', rewardAmount: 30, opened: false },
  ] satisfies ExploreChestConfig[],
} as const;
