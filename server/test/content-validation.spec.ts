import { ContentValidationService } from '../src/modules/content-validation/content-validation.service';
import { validateCampaignContent } from '../src/modules/content-validation/campaign-content.validation';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

describe('ContentValidationService', () => {
  it('rejects fixed battle waves that reference missing enemy templates', async () => {
    const state = { upsert: jest.fn() };
    const prisma = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([enemy('enemy_ok')]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([background('bg_ok')]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([hero('hero_ok')]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([stage('stage_battle_1_1')]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', stage_id: 'stage_battle_1_1', wave_no: 1 }]) },
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ stage_wave_id: 'wave1', enemy_template_id: 'enemy_missing', enemy_count: 1 }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([{ stage_id: 'stage_battle_1_1', objective_type: 'defeat', required_count: 1 }]) },
      contentArtResource: { findMany: jest.fn().mockResolvedValue(artRows()) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue(artVersions()) },
      contentSystemState: state,
    };
    const service = new ContentValidationService(prisma as any);

    const result = await service.validate();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        entityType: 'stage',
        entityId: 'stage_battle_1_1',
        field: 'waves[0].groups[0].enemyTemplateId',
      }),
    ]));
    expect(state.upsert).toHaveBeenCalled();
  });

  it('rejects invalid animation frame resources and missing clip references', async () => {
    const state = { upsert: jest.fn() };
    const prisma = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([enemyWithClip('enemy_ok', 'enemy.missing.attack')]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([background('bg_ok')]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([hero('hero_ok')]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([stage('stage_battle_1_1')]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', stage_id: 'stage_battle_1_1', wave_no: 1 }]) },
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ stage_wave_id: 'wave1', enemy_template_id: 'enemy_ok', enemy_count: 1 }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([{ stage_id: 'stage_battle_1_1', objective_type: 'defeat', required_count: 1 }]) },
      contentArtResource: { findMany: jest.fn().mockResolvedValue([...artRows(), invalidArtRow()]) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue([...artVersions(), { id: 'bad_frame', storage_path: 'missing.png', validation_status: 'invalid' }]) },
      contentAnimationClip: { findMany: jest.fn().mockResolvedValue([animationClip('enemy.scrapMouse.idle', 'enemy.invalid.frame')]) },
      contentSystemState: state,
    };
    const service = new ContentValidationService(prisma as any);

    const result = await service.validate();

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: 'animationClip', field: 'frames[0].artKey' }),
      expect.objectContaining({ entityType: 'enemy', field: 'visual.animationClipKeys.attack' }),
    ]));
  });

  it('rejects negative shadowScale from backend visual configuration', async () => {
    const state = { upsert: jest.fn() };
    const invalidEnemy = enemy('enemy_ok');
    (invalidEnemy.visual_json as any).shadowScale = -1;
    const prisma = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([invalidEnemy]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([background('bg_ok')]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([hero('hero_ok')]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([stage('stage_battle_1_1')]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', stage_id: 'stage_battle_1_1' }]) },
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ stage_wave_id: 'wave1', enemy_template_id: 'enemy_ok', enemy_count: 1 }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([]) },
      contentArtResource: { findMany: jest.fn().mockResolvedValue(artRows()) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue(artVersions()) },
      contentSystemState: state,
    };
    const result = await new ContentValidationService(prisma as any).validate();
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: 'enemy', entityId: 'enemy_ok', field: 'visual.shadowScale' }),
    ]));
  });

  it('rejects a referenced physical Art version with zero dimensions before publishing', async () => {
    const base: any = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([enemy('enemy_ok')]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([background('bg_ok')]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([hero('hero_ok')]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([stage('stage_battle_1_1')]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', stage_id: 'stage_battle_1_1', wave_no: 1 }]) },
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ stage_wave_id: 'wave1', enemy_template_id: 'enemy_ok', enemy_count: 1 }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([{ id: 'objective1', stage_id: 'stage_battle_1_1', objective_type: 'defeat', required_count: 1 }]) },
      contentArtResource: { findMany: jest.fn().mockResolvedValue(artRows()) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue(artVersions().map((row: any) => row.id === 'v_enemy_scrapMouse_normal' ? { ...row, actual_width: 0 } : row)) },
      contentSystemState: { upsert: jest.fn() },
    };
    const result = await new ContentValidationService(base).validate();
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: 'artResource', entityId: 'enemy.scrapMouse.normal', field: 'currentDraftVersion' }),
    ]));
  });
});

describe('Campaign chapter art validation', () => {
  const campaign = { id: 'main', enabled: true, default_chapter_id: 'chapter_1' };
  const chapter = {
    id: 'chapter_1', campaign_id: 'main', enabled: true,
    background_art_key: 'map.trainingGround.floor',
  };
  const nodes = [
    { id: 'node_1', chapter_id: 'chapter_1', stage_id: 'stage_1', node_type: 'normal', x: 1, y: 1, enabled: true, is_start: true, is_end: false },
    { id: 'node_2', chapter_id: 'chapter_1', stage_id: 'stage_2', node_type: 'normal', x: 2, y: 2, enabled: true, is_start: false, is_end: true },
  ];
  const connections = [
    { id: 'path_1', chapter_id: 'chapter_1', from_node_id: 'node_1', to_node_id: 'node_2', enabled: true },
  ];

  it('ignores archived GUI campaigns instead of treating them as active invalid drafts', () => {
    const errors: any[] = [];
    validateCampaignContent(errors, [{ id: 'campaign_task29_gui', enabled: false, deleted_at: new Date() }], [], [], [],
      new Map(), new Map(), new Map());
    expect(errors).toEqual([]);
  });

  it('rejects an enabled campaign node bound to a fixed-screen stage', () => {
    const errors: any[] = [];
    validateCampaignContent(errors, [campaign], [chapter], nodes, connections,
      new Map([['stage_1', { mode: 'fixed_battle' }], ['stage_2', { mode: 'explore' }]]), new Map(), new Map());
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: 'campaignNode', objectId: 'node_1', field: 'stageId', reason: '正式章节关卡必须使用自由地图运行模式' }),
    ]));
  });

  it('uses Sharp metadata to reject a false alpha declaration for the physical campaign art', async () => {
    const storagePath = 'assets/art-packs/training_ground_v1/maps/map_training_ground_tile_floor_01.png';
    const fullPath = path.resolve(__dirname, '../..', storagePath);
    const version = { id: 'floor_v1', validation_status: 'valid', storage_path: storagePath,
      actual_width: 800, actual_height: 1200, has_alpha: false,
      checksum: crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex') };
    const art = new Map([['map.trainingGround.floor', { art_key: 'map.trainingGround.floor', resource_status: 'physical',
      enabled: true, current_draft_version_id: version.id, dimension_policy: 'recommended', required_alpha: false }]]);
    const errors: any[] = [];
    await (validateCampaignContent as any)(errors, [campaign], [chapter], nodes, connections,
      new Map([['stage_1', {}], ['stage_2', {}]]), art, new Map([[version.id, version]]));
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'backgroundArtKey', reason: expect.stringMatching(/透明通道/) }),
    ]));
  });

  it.each([
    ['no selected draft or published version', undefined],
    ['selected invalid version', { id: 'floor_v1', validation_status: 'invalid', storage_path: 'missing.png' }],
    ['selected version without checksum', { id: 'floor_v1', validation_status: 'valid',
      storage_path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_tile_floor_01.png' }],
  ])('rejects a physical chapter background with %s', (_label, version) => {
    const errors: any[] = [];
    const art = new Map([['map.trainingGround.floor', {
      art_key: 'map.trainingGround.floor', resource_status: 'physical', enabled: true,
      current_draft_version_id: version?.id,
    }]]);
    const versions = new Map(version ? [[version.id, version]] : []);

    (validateCampaignContent as any)(
      errors, [campaign], [chapter], nodes, connections,
      new Map([['stage_1', {}], ['stage_2', {}]]), art, versions,
    );

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: 'campaignChapter', field: 'backgroundArtKey' }),
    ]));
  });

  it.each([
    ['non-positive dimensions', { actual_width: 0, actual_height: 1200 }, {}, /实际尺寸/],
    ['file metadata mismatch', { actual_width: 64, actual_height: 64 }, {}, /文件实际尺寸/],
    ['exact policy mismatch', { actual_width: 800, actual_height: 1200 }, {
      dimension_policy: 'exact', expected_width: 64, expected_height: 64,
    }, /exact/],
    ['required alpha missing', { actual_width: 800, actual_height: 1200, has_alpha: false }, {
      required_alpha: true,
    }, /透明通道/],
  ])('rejects chapter background with %s', (_label, versionPatch, resourcePatch, reason) => {
    const storagePath = 'assets/factory_bg.png';
    const fullPath = path.resolve(__dirname, '../..', storagePath);
    const version = Object.assign({
      id: 'floor_v1', validation_status: 'valid', storage_path: storagePath,
      actual_width: 800, actual_height: 1200, has_alpha: false,
      checksum: crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex'),
    }, versionPatch);
    const art = new Map([['map.trainingGround.floor', {
      art_key: 'map.trainingGround.floor', resource_status: 'physical', enabled: true,
      current_draft_version_id: version.id, dimension_policy: 'recommended', required_alpha: false,
      ...resourcePatch,
    }]]);
    const errors: any[] = [];

    validateCampaignContent(errors, [campaign], [chapter], nodes, connections,
      new Map([['stage_1', {}], ['stage_2', {}]]), art, new Map([[version.id, version]]));

    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ file: 'campaignChapter', field: 'backgroundArtKey', reason: expect.stringMatching(reason) }),
    ]));
  });
});

function enemy(id: string) {
  return {
    id, name: id, category: 'normal', behavior_type: 'melee',
    visual_json: { idleArtKey: 'enemy.scrapMouse.normal', displayScale: 1, collisionRadius: 10 },
    stats_json: { maxHp: 10, attack: 1, defense: 0, moveSpeed: 1 },
    combat_json: { attackInterval: 1, attackRange: 10, detectRadius: 100, chaseRadius: 200 },
    enabled: true,
  };
}

function enemyWithClip(id: string, missingClipKey: string) {
  const row = enemy(id);
  (row.visual_json as any).animationClipKeys = { idle: 'enemy.scrapMouse.idle', attack: missingClipKey };
  return row;
}

function animationClip(key: string, artKey: string) {
  return {
    id: 'clip_1',
    clip_key: key,
    name: key,
    target_type: 'enemy',
    state: 'idle',
    default_frame_duration_ms: 120,
    play_mode: 'loop',
    loop: true,
    enabled: true,
    frames: [{ sort_order: 0, art_key: artKey, duration_ms: 80 }],
  };
}

function invalidArtRow() {
  return {
    art_key: 'enemy.invalid.frame',
    resource_status: 'physical',
    enabled: true,
    current_draft_version_id: 'bad_frame',
    dimension_policy: 'recommended',
    required_alpha: false,
  };
}

function background(id: string) {
  return {
    id, name: id, art_json: { floorArtKey: 'map.trainingGround.floor' },
    rendering_json: { mode: 'world-tile', tileWidth: 100, tileHeight: 100 },
    enabled: true,
  };
}

function hero(id: string) {
  return {
    id, name: id,
    visual_json: { idleArtKey: 'player.mechaCat.idle', displayScale: 1, collisionRadius: 10 },
    skills_json: { shieldIconArtKey: 'ui.skill.shield', cannonIconArtKey: 'ui.skill.cannon' },
    enabled: true,
  };
}

function stage(id: string) {
  return {
    id, name: id, mode: 'fixed_battle',
    hero_visual_template_id: 'hero_ok',
    background_theme_id: 'bg_ok',
    enabled: true,
  };
}

function artRows() {
  return [
    'enemy.scrapMouse.normal',
    'map.trainingGround.floor',
    'player.mechaCat.idle',
    'ui.skill.shield',
    'ui.skill.cannon',
  ].map(art_key => ({
    art_key,
    resource_status: 'physical',
    enabled: true,
    current_draft_version_id: `v_${art_key.replaceAll('.', '_')}`,
    dimension_policy: 'recommended',
    required_alpha: false,
  }));
}

function artVersions() {
  return [
    ['enemy.scrapMouse.normal', 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png'],
    ['map.trainingGround.floor', 'assets/art-packs/training_ground_v1/maps/map_training_ground_tile_floor_01.png'],
    ['player.mechaCat.idle', 'assets/art-packs/training_ground_v1/players/player_mecha_cat_idle_01.png'],
    ['ui.skill.shield', 'assets/art-packs/training_ground_v1/ui/ui_skill_shield_01.png'],
    ['ui.skill.cannon', 'assets/art-packs/training_ground_v1/ui/ui_skill_cannon_01.png'],
  ].map(([art_key, storage_path]) => ({
    id: `v_${art_key.replaceAll('.', '_')}`,
    art_key,
    storage_path,
    actual_width: 64,
    actual_height: 64,
    has_alpha: true,
    validation_status: 'valid',
  }));
}
