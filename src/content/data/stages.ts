import type { StageDefinition } from '../models/StageDefinition';

export const STAGE_DEFINITIONS = [
  {
    id: 'stage_battle_1_1',
    legacyStageId: '1-1',
    name: '铸造通道',
    mode: 'explore',
    heroVisualTemplateId: 'hero_mecha_cat_default',
    backgroundThemeId: 'background_forging_corridor_v1',
    exploration: {
      worldWidth: 1800, worldHeight: 2800,
      spawnGroups: [
        { id: 'forge_a01', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 420, y: 620, radius: 160 }, initialCount: 2, maxAlive: 3, respawnInterval: 5000, active: true },
        { id: 'forge_c03', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 720, y: 1220, radius: 170 }, initialCount: 2, maxAlive: 3, respawnInterval: 5600, active: true },
        { id: 'forge_d04', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 1260, y: 1760, radius: 180 }, initialCount: 2, maxAlive: 4, respawnInterval: 6500, active: true },
        { id: 'forge_e05', enemyTemplateId: 'enemy_scrap_guard_elite_01', spawnPoint: { x: 860, y: 2380, radius: 160 }, initialCount: 1, maxAlive: 2, respawnInterval: 8000, active: true },
      ], resourcePointIds: ['energy_01', 'scrap_01', 'chip_01', 'coin_01'], chestIds: ['chest_training_01', 'supply_training_01'],
    },
    objectives: [{ type: 'defeat', required: 12 }],
    enabled: true,
    version: 1,
  },
  {
    id: 'stage_explore_training_01',
    legacyStageId: 'explore_training',
    name: '训练场',
    mode: 'explore',
    heroVisualTemplateId: 'hero_mecha_cat_default',
    backgroundThemeId: 'background_training_ground_v1',
    exploration: {
      worldWidth: 1800,
      worldHeight: 2800,
      spawnGroups: [
        { id: 'spawn_a01', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 420, y: 620, radius: 160 }, initialCount: 2, maxAlive: 3, respawnInterval: 5000, active: true },
        { id: 'spawn_c03', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 720, y: 1220, radius: 170 }, initialCount: 2, maxAlive: 3, respawnInterval: 5600, active: true },
        { id: 'spawn_d04', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPoint: { x: 1260, y: 1760, radius: 180 }, initialCount: 2, maxAlive: 4, respawnInterval: 6500, active: true },
        { id: 'spawn_e05', enemyTemplateId: 'enemy_scrap_guard_elite_01', spawnPoint: { x: 860, y: 2380, radius: 160 }, initialCount: 1, maxAlive: 2, respawnInterval: 8000, active: true },
      ],
      resourcePointIds: ['energy_01', 'scrap_01', 'chip_01', 'coin_01'],
      chestIds: ['chest_training_01', 'supply_training_01'],
    },
    objectives: [
      { type: 'defeat', required: 12 },
      { type: 'resource', required: 3 },
      { type: 'chest', required: 1 },
    ],
    enabled: true,
    version: 1,
  },
] as const satisfies StageDefinition[];
