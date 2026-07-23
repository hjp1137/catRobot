"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enemies_1 = require("../../src/content/data/enemies");
const backgrounds_1 = require("../../src/content/data/backgrounds");
const heroes_1 = require("../../src/content/data/heroes");
const stages_1 = require("../../src/content/data/stages");
const prisma = new client_1.PrismaClient();
const result = { created: 0, skipped: 0, failed: 0 };
async function createIfMissing(model, id, data) {
    if (await model.findUnique({ where: { id } })) {
        result.skipped += 1;
        return;
    }
    await model.create({ data });
    result.created += 1;
}
async function main() {
    console.log('Seed计划：导入任务21首批敌人、背景、主角和关卡；已有ID不覆盖，不删除数据。');
    for (const item of enemies_1.ENEMY_TEMPLATES) {
        const e = item;
        await createIfMissing(prisma.contentEnemyTemplate, e.id, {
            id: e.id, name: e.name, description: e.description, category: e.category, behavior_type: e.behaviorType,
            visual_json: e.visual, stats_json: e.stats, combat_json: e.combat, rewards_json: e.rewards, tags_json: e.tags,
            enabled: e.enabled, content_version: e.version,
        });
    }
    for (const item of backgrounds_1.BACKGROUND_THEMES) {
        const b = item;
        await createIfMissing(prisma.contentBackgroundTheme, b.id, {
            id: b.id, name: b.name, description: b.description, art_json: b.art, colors_json: b.colors,
            rendering_json: b.rendering, enabled: b.enabled, content_version: b.version,
        });
    }
    for (const item of heroes_1.HERO_VISUAL_TEMPLATES) {
        const h = item;
        await createIfMissing(prisma.contentHeroVisual, h.id, {
            id: h.id, name: h.name, description: h.description, visual_json: h.visual, skills_json: h.skills,
            enabled: h.enabled, content_version: h.version,
        });
    }
    for (const s of stages_1.STAGE_DEFINITIONS)
        await seedStage(s);
    await prisma.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} });
    console.log(`Seed结果：新增 ${result.created}，跳过 ${result.skipped}，失败 ${result.failed}`);
}
async function seedStage(s) {
    if (await prisma.contentStage.findUnique({ where: { id: s.id } })) {
        result.skipped += 1;
        return;
    }
    await prisma.$transaction(async (tx) => {
        await tx.contentStage.create({ data: { id: s.id, legacy_stage_id: s.legacyStageId, name: s.name, mode: s.mode === 'fixed-battle' ? 'fixed_battle' : 'explore', hero_visual_template_id: s.heroVisualTemplateId, background_theme_id: s.backgroundThemeId, world_width: s.exploration?.worldWidth, world_height: s.exploration?.worldHeight, enabled: s.enabled, content_version: s.version } });
        for (const [i, wave] of (s.waves ?? []).entries()) {
            const row = await tx.contentStageWave.create({ data: { stage_id: s.id, wave_no: wave.wave, wave_key: wave.id, name: wave.name, message: wave.message, spawn_delay: wave.spawnDelay, sort_order: i } });
            for (const [j, group] of wave.groups.entries())
                await tx.contentStageWaveEnemyGroup.create({ data: { stage_wave_id: row.id, enemy_template_id: group.enemyTemplateId, enemy_count: group.count, spawn_area_id: group.spawnAreaId ?? group.spawnGroup, spawn_interval: group.spawnInterval, level_multiplier: group.levelMultiplier, sort_order: j } });
        }
        for (const [i, group] of (s.exploration?.spawnGroups ?? []).entries())
            await tx.contentExploreSpawnGroup.create({ data: { stage_id: s.id, group_key: group.id, enemy_template_id: group.enemyTemplateId, spawn_x: group.spawnPoint.x, spawn_y: group.spawnPoint.y, spawn_radius: group.spawnPoint.radius, initial_count: group.initialCount, max_alive: group.maxAlive, respawn_interval: group.respawnInterval, sort_order: i } });
        for (const [i, objective] of (s.objectives ?? []).entries())
            await tx.contentStageObjective.create({ data: { stage_id: s.id, objective_type: objective.type, required_count: objective.required, sort_order: i } });
    });
    result.created += 1;
}
main().catch(error => {
    result.failed += 1;
    console.error(error);
    process.exit(1);
}).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map