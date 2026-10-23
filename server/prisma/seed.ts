import { PrismaClient } from '@prisma/client';
import { ENEMY_TEMPLATES } from '../../src/content/data/enemies';
import { BACKGROUND_THEMES } from '../../src/content/data/backgrounds';
import { HERO_VISUAL_TEMPLATES } from '../../src/content/data/heroes';
import { STAGE_DEFINITIONS } from '../../src/content/data/stages';
import { ANIMATION_CLIPS } from '../../src/content/data/animations';
import { EQUIPMENT_CONFIGS } from '../../src/data/EquipmentConfig';
import { RUNE_CONFIGS } from '../../src/data/RuneConfig';
import { seedTutorialDraft } from './tutorial-seed';
import { seedChapterOne } from './seed-chapter-one';

const prisma = new PrismaClient();
const result = { created: 0, skipped: 0, failed: 0 };

async function createIfMissing(model: any, id: string, data: any) {
  if (await model.findUnique({ where: { id } })) {
    result.skipped += 1;
    return;
  }
  await model.create({ data });
  result.created += 1;
}

async function main() {
  console.log('Seed计划：导入任务21首批敌人、背景、主角和关卡；已有ID不覆盖，不删除数据。');
  for (const item of ENEMY_TEMPLATES) {
    const e = item as any;
    await createIfMissing(prisma.contentEnemyTemplate, e.id, {
    id: e.id, name: e.name, description: e.description, category: e.category, behavior_type: e.behaviorType,
    visual_json: e.visual, stats_json: e.stats, combat_json: e.combat, rewards_json: e.rewards, tags_json: e.tags,
    enabled: e.enabled, content_version: e.version,
    });
  }
  for (const item of BACKGROUND_THEMES) {
    const b = item as any;
    await createIfMissing(prisma.contentBackgroundTheme, b.id, {
    id: b.id, name: b.name, description: b.description, art_json: b.art, colors_json: b.colors,
    rendering_json: b.rendering, enabled: b.enabled, content_version: b.version,
    });
  }
  for (const item of HERO_VISUAL_TEMPLATES) {
    const h = item as any;
    await createIfMissing(prisma.contentHeroVisual, h.id, {
    id: h.id, name: h.name, description: h.description, visual_json: h.visual, skills_json: h.skills,
    enabled: h.enabled, content_version: h.version,
    });
  }
  for (const clip of ANIMATION_CLIPS) await seedAnimationClip(clip);
  for (const s of STAGE_DEFINITIONS) await seedStage(s);
  await seedRewardDefinitions();
  await seedChapterOne(prisma as any, result);
  const tutorialSeed = await seedTutorialDraft(prisma as any);
  result[tutorialSeed === 'created' ? 'created' : 'skipped'] += 1;
  await prisma.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} });
  console.log(`Seed结果：新增 ${result.created}，跳过 ${result.skipped}，失败 ${result.failed}`);
}

async function seedCampaignDraft() {
  const db = prisma as any;
  const campaignId = 'campaign_main_01';
  const chapterId = 'chapter_scrap_border_01';
  if (await db.contentCampaign.findUnique({ where: { id: campaignId } })) { result.skipped += 1; return; }
  await prisma.$transaction(async raw => {
    const tx = raw as any;
    await tx.contentCampaign.create({ data: {
      id: campaignId, name: '喵喵机甲主线战役', subtitle: '星核觉醒', description: '从废料边境启程的主线章节。',
      cover_art_key: 'map.trainingGround.floor', default_chapter_id: chapterId, sort_order: 1,
      enabled: true, schema_version: 1, content_version: 1,
    } });
    await tx.contentCampaignChapter.create({ data: {
      id: chapterId, campaign_id: campaignId, chapter_no: 1, name: '第一章·废料边境', subtitle: '边境启动',
      description: '沿铸造通道进入训练场，重启边境防线。', background_art_key: 'map.trainingGround.floor',
      canvas_width: 1000, canvas_height: 600, viewport_x: 0, viewport_y: 0, enabled: true,
      completion_text: '废料边境防线已重新点亮。',
    } });
    await tx.contentCampaignStageNode.createMany({ data: [
      { id: 'campaign_node_battle_1_1', chapter_id: chapterId, stage_id: 'stage_battle_1_1', name: '铸造通道',
        x: 180, y: 330, node_type: 'normal', icon_art_key: 'icon.objective.enemy', is_start: true, is_end: false,
        sort_order: 1, recommended_power: 220, description: '清除铸造通道内的三波敌人。', enabled: true },
      { id: 'campaign_node_training', chapter_id: chapterId, stage_id: 'stage_explore_training_01', name: '边境训练场',
        x: 760, y: 240, node_type: 'exploration', icon_art_key: 'icon.objective.chest', is_start: false, is_end: true,
        sort_order: 2, recommended_power: 260, description: '探索训练场并完成资源、宝箱与敌人目标。', enabled: true },
    ] });
    await tx.contentCampaignNodeConnection.create({ data: {
      id: 'campaign_path_1_1_training', chapter_id: chapterId, from_node_id: 'campaign_node_battle_1_1',
      to_node_id: 'campaign_node_training', path_type: 'normal', one_way: true, sort_order: 1, enabled: true,
    } });
    await tx.contentSystemState.upsert({ where: { id: 'singleton' },
      create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
      update: { draft_revision: { increment: 1 }, draft_dirty: true } });
    await tx.contentChangeLog.create({ data: { entity_type: 'campaign', entity_id: campaignId,
      action_type: 'seed-campaign-draft', after_json: { chapterId, nodeCount: 2, releasePublished: false } } });
  });
  result.created += 1;
}

async function seedStageOrchestration() {
  const stageId = 'stage_battle_1_1';
  const db = prisma as any;
  if (await db.contentStageSceneLayout.findUnique({ where: { stage_id: stageId } })) {
    result.skipped += 1;
    return;
  }
  await prisma.$transaction(async txRaw => {
    const tx = txRaw as any;
    await tx.contentStageSceneLayout.create({ data: { stage_id: stageId, canvas_width: 1800, canvas_height: 2800, scene_mode: 'exploration', background_theme_id: 'background_forging_corridor_v1', hero_spawn_point_key: 'hero_start', battle_area_json: { x: 0, y: 0, width: 1800, height: 2800 }, camera_json: { mode: 'follow', clampToWorld: true }, completion_rule_json: { type: 'all-waves-cleared' }, failure_rule_json: { type: 'hero-dead' } } });
    await tx.contentStageLayer.createMany({ data: [
      { stage_id: stageId, layer_key: 'background', name: '背景层', layer_type: 'background', background_theme_id: 'background_forging_corridor_v1', sort_order: 0, x: 0, y: 0, width: 750, height: 1334, scale: 1, opacity: 1, tiled: false, scrolls_with_camera: false, parallax: 0, enabled: true },
      { stage_id: stageId, layer_key: 'ground', name: '地面层', layer_type: 'ground', art_key: 'map.trainingGround.floor', sort_order: 1, x: 0, y: 0, width: 750, height: 1334, scale: 1, opacity: 1, tiled: true, scrolls_with_camera: false, parallax: 0, enabled: true },
    ] } as any);
    await tx.contentStageSpawnPoint.createMany({ data: [
      { stage_id: stageId, spawn_point_key: 'hero_start', name: '主角出生点', spawn_type: 'hero', x: 375, y: 980, facing: 'right', sort_order: 0 },
      { stage_id: stageId, spawn_point_key: 'enemy_left', name: '左侧入口', spawn_type: 'enemy', x: 120, y: 360, facing: 'right', sort_order: 1 },
      { stage_id: stageId, spawn_point_key: 'enemy_right', name: '右侧入口', spawn_type: 'enemy', x: 630, y: 360, facing: 'left', sort_order: 2 },
      { stage_id: stageId, spawn_point_key: 'enemy_top', name: '上方入口', spawn_type: 'enemy', x: 375, y: 240, facing: 'down', sort_order: 3 },
    ] } as any);
    for (const wave of defaultWaves()) {
      const row = await tx.contentStageOrchestrationWave.create({ data: { stage_id: stageId, wave_key: wave.id, name: wave.name, wave_order: wave.order, start_trigger: wave.trigger, start_delay_ms: wave.delay, max_alive: wave.maxAlive, completion_rule: 'all-enemies-cleared', completion_delay_ms: 600, next_wave: 'next', sort_order: wave.order - 1 } });
      await tx.contentStageWaveEntry.createMany({ data: wave.entries.map((entry: any, index: number) => ({ wave_id: row.id, entry_key: entry.id, enemy_template_id: entry.enemy, spawn_point_key: entry.point, quantity: entry.count, spawn_interval_ms: entry.interval, initial_delay_ms: 0, elite: entry.elite, level_multiplier: entry.multiplier, hp_multiplier: entry.multiplier, attack_multiplier: entry.multiplier, sort_order: index })) } as any);
    }
  });
  await prisma.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
  await prisma.contentChangeLog.create({ data: { entity_type: 'stage-orchestration', entity_id: stageId, action_type: 'seed-default-orchestration', after_json: { waveCount: 3, spawnPointCount: 4, layerCount: 2 } } });
  result.created += 1;
}

async function seedRewardDefinitions() {
  const db = prisma as any;
  const definitions = [
    ...Object.values(EQUIPMENT_CONFIGS).map(x => ({ reward_type: 'equipment', reward_ref_id: x.id, name: x.name, icon_art_key: 'ui.equip.icon' })),
    ...Object.values(RUNE_CONFIGS).map(x => ({ reward_type: 'rune', reward_ref_id: x.id, name: x.name, icon_art_key: 'ui.rune.icon' })),
    { reward_type: 'material', reward_ref_id: 'enhanceStone', name: '强化石', icon_art_key: 'drop.stone' },
    { reward_type: 'currency', reward_ref_id: 'gold', name: '金币', icon_art_key: 'drop.coin' },
    { reward_type: 'currency', reward_ref_id: 'parts', name: '机甲零件', icon_art_key: 'drop.part' },
  ];
  for (const definition of definitions) {
    const where = { reward_type_reward_ref_id: { reward_type: definition.reward_type, reward_ref_id: definition.reward_ref_id } };
    if (await db.contentRewardDefinition.findUnique({ where })) result.skipped += 1;
    else { await db.contentRewardDefinition.create({ data: definition }); result.created += 1; }
  }
}

async function seedStageProgression() {
  const db = prisma as any;
  const stageId = 'stage_battle_1_1';
  if (await db.contentStageProgressionConfig.findUnique({ where: { stage_id: stageId } })) { result.skipped += 1; return; }
  await prisma.$transaction(async raw => {
    const tx = raw as any;
    await tx.contentStageProgressionConfig.create({ data: { stage_id: stageId, recommended_power: 220, victory_text: '铸造通道已净化', failure_text: '机甲核心失稳，请重新挑战' } });
    await tx.contentStageProgressionObjective.createMany({ data: [
      { stage_id: stageId, objective_key: 'clear_all', name: '清除全部三波', objective_type: 'clear-all-waves', required: true, params_json: {}, display_text: '清除全部三波敌人', progress_display: 'waves', star_eligible: true, sort_order: 0 },
      { stage_id: stageId, objective_key: 'fast_clear', name: '迅捷清场', objective_type: 'complete-within-duration', required: false, params_json: { maxDurationSec: 90 }, display_text: '90秒内完成', progress_display: 'timer', star_eligible: true, sort_order: 1 },
      { stage_id: stageId, objective_key: 'healthy_clear', name: '保持装甲', objective_type: 'hero-health-above', required: false, params_json: { minHealthRatio: 0.5 }, display_text: '结束时生命不低于50%', progress_display: 'ratio', star_eligible: true, sort_order: 2 },
    ] });
    for (const [index, pool] of defaultRewardPools().entries()) {
      const row = await tx.contentStageRewardPool.create({ data: { stage_id: stageId, pool_key: pool.id, name: pool.name, group_type: pool.group, objective_key: pool.objectiveId, selection_mode: 'independent-probability', sort_order: index } });
      await tx.contentStageRewardEntry.createMany({ data: pool.entries.map((x: any, i: number) => ({ pool_id: row.id, entry_key: x.id, reward_type: x.type, reward_ref_id: x.ref, min_quantity: x.min, max_quantity: x.max, probability: x.probability, guaranteed: x.probability === 1, sort_order: i })) });
    }
    await tx.contentStageUnlockRule.createMany({ data: [
      { stage_id: stageId, rule_key: 'default_1_1', rule_type: 'default-unlocked', required_stars: 0, sort_order: 0 },
      { stage_id: stageId, rule_key: 'unlock_training', rule_type: 'prerequisite-clear', prerequisite_stage_id: stageId, required_stars: 1, next_stage_id: 'stage_explore_training_01', sort_order: 1 },
    ] });
  });
  result.created += 1;
}

function defaultRewardPools() {
  return [
    { id: 'first_clear', name: '首通奖励', group: 'first-clear', entries: [{ id: 'gold', type: 'currency', ref: 'gold', min: 50, max: 50, probability: 1 }, { id: 'stone', type: 'material', ref: 'enhanceStone', min: 2, max: 2, probability: 1 }] },
    { id: 'repeat_clear', name: '常规通关', group: 'repeat-clear', entries: [{ id: 'parts', type: 'currency', ref: 'parts', min: 2, max: 4, probability: 1 }, { id: 'equipment', type: 'equipment', ref: 'rusty_claw', min: 1, max: 1, probability: 0.2 }] },
    { id: 'first_three_star', name: '首次三星', group: 'first-three-star', entries: [{ id: 'rune', type: 'rune', ref: 'cannon_rune_1', min: 1, max: 1, probability: 1 }] },
    { id: 'healthy_bonus', name: '装甲目标奖励', group: 'objective-bonus', objectiveId: 'healthy_clear', entries: [{ id: 'stone', type: 'material', ref: 'enhanceStone', min: 1, max: 1, probability: 1 }] },
  ];
}

function defaultWaves() {
  return [
    { id: 'wave_1', order: 1, name: '第1波 基础鼠群', trigger: 'stage-start', delay: 0, maxAlive: 4, entries: [{ id: 'entry_1', enemy: 'enemy_scrap_mouse_01', point: 'enemy_left', count: 3, interval: 500, elite: false, multiplier: 1 }] },
    { id: 'wave_2', order: 2, name: '第2波 双侧夹击', trigger: 'previous-wave-cleared', delay: 800, maxAlive: 5, entries: [{ id: 'entry_2', enemy: 'enemy_scrap_mouse_01', point: 'enemy_right', count: 4, interval: 450, elite: false, multiplier: 1.1 }] },
    { id: 'wave_3', order: 3, name: '第3波 精英收束', trigger: 'previous-wave-cleared', delay: 900, maxAlive: 4, entries: [{ id: 'entry_3', enemy: 'enemy_scrap_guard_elite_01', point: 'enemy_top', count: 1, interval: 0, elite: true, multiplier: 1.25 }] },
  ];
}

async function seedAnimationClip(clip: any) {
  if (await prisma.contentAnimationClip.findUnique({ where: { clip_key: clip.key } })) {
    result.skipped += 1;
    return;
  }
  await prisma.$transaction(async tx => {
    const row = await tx.contentAnimationClip.create({
      data: {
        clip_key: clip.key, name: clip.name, target_type: clip.targetType, state: clip.state,
        default_fps: clip.defaultFps, default_frame_duration_ms: clip.defaultFrameDurationMs,
        loop: clip.loop, play_mode: clip.playMode, end_behavior: clip.endBehavior,
        enabled: clip.enabled, content_version: clip.version,
      },
    });
    for (const frame of clip.frames) await tx.contentAnimationFrame.create({
      data: { clip_id: row.id, sort_order: frame.order, art_key: frame.artKey, duration_ms: frame.durationMs, note: frame.note },
    });
  });
  result.created += 1;
}

async function seedStage(s: any) {
  if (await prisma.contentStage.findUnique({ where: { id: s.id } })) {
    result.skipped += 1;
    return;
  }
  await prisma.$transaction(async tx => {
    await tx.contentStage.create({ data: { id: s.id, legacy_stage_id: s.legacyStageId, name: s.name, mode: s.mode === 'fixed-battle' ? 'fixed_battle' : 'explore', hero_visual_template_id: s.heroVisualTemplateId, background_theme_id: s.backgroundThemeId, world_width: s.exploration?.worldWidth, world_height: s.exploration?.worldHeight, enabled: s.enabled, content_version: s.version } });
    for (const [i, wave] of (s.waves ?? []).entries()) {
      const row = await tx.contentStageWave.create({ data: { stage_id: s.id, wave_no: wave.wave, wave_key: wave.id, name: wave.name, message: wave.message, spawn_delay: wave.spawnDelay, sort_order: i } });
      for (const [j, group] of wave.groups.entries()) await tx.contentStageWaveEnemyGroup.create({ data: { stage_wave_id: row.id, enemy_template_id: group.enemyTemplateId, enemy_count: group.count, spawn_area_id: group.spawnAreaId ?? group.spawnGroup, spawn_interval: group.spawnInterval, level_multiplier: group.levelMultiplier, sort_order: j } });
    }
    for (const [i, group] of (s.exploration?.spawnGroups ?? []).entries()) await tx.contentExploreSpawnGroup.create({ data: { stage_id: s.id, group_key: group.id, enemy_template_id: group.enemyTemplateId, spawn_x: group.spawnPoint.x, spawn_y: group.spawnPoint.y, spawn_radius: group.spawnPoint.radius, initial_count: group.initialCount, max_alive: group.maxAlive, respawn_interval: group.respawnInterval, sort_order: i } });
    for (const [i, objective] of (s.objectives ?? []).entries()) await tx.contentStageObjective.create({ data: { stage_id: s.id, objective_type: objective.type, required_count: objective.required, sort_order: i } });
  });
  result.created += 1;
}

main().catch(error => {
  result.failed += 1;
  console.error(error);
  process.exit(1);
}).finally(() => prisma.$disconnect());
