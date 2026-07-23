"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGE_DEFINITIONS = void 0;
exports.STAGE_DEFINITIONS = [
    {
        id: 'stage_battle_1_1',
        legacyStageId: '1-1',
        name: '铸造通道',
        mode: 'fixed-battle',
        heroVisualTemplateId: 'hero_mecha_cat_default',
        backgroundThemeId: 'background_forging_corridor_v1',
        waves: [
            {
                wave: 1,
                id: '1-1-w1',
                name: '训练鼠群',
                message: '第 1 波机械鼠出现！',
                spawnDelay: 0,
                groups: [{ enemyTemplateId: 'enemy_scrap_mouse_01', count: 4, spawnGroup: 'around_player' }],
            },
            {
                wave: 2,
                id: '1-1-w2',
                name: '左右夹击',
                message: '第 2 波左右夹击！',
                spawnDelay: 1,
                groups: [{ enemyTemplateId: 'enemy_scrap_mouse_01', count: 4, spawnGroup: 'left_right' }],
            },
            {
                wave: 3,
                id: '1-1-w3',
                name: '强化收尾',
                message: '最后一波强化鼠加入！',
                spawnDelay: 1.2,
                groups: [
                    { enemyTemplateId: 'enemy_scrap_mouse_01', count: 3, spawnGroup: 'around_player' },
                    { enemyTemplateId: 'enemy_scrap_guard_elite_01', count: 1, spawnGroup: 'top' },
                ],
            },
        ],
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
];
//# sourceMappingURL=stages.js.map