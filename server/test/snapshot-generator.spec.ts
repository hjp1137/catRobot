import { SnapshotGeneratorService } from '../src/infrastructure/snapshot-generator/snapshot-generator.service';
import fs from 'node:fs';
import path from 'node:path';

describe('SnapshotGeneratorService', () => {
  it('emits runtime-only content without admin metadata or null optionals', async () => {
    const prisma = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([enemyRow()]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([backgroundRow()]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([heroRow()]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([stageRow()]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', wave_no: 1, wave_key: 'w1', name: 'Wave 1', message: 'Wave message', spawn_delay: 1.2 }]) },
      contentStageWaveEnemyGroup: {
        findMany: jest.fn().mockResolvedValue([
          { stage_wave_id: 'wave1', enemy_template_id: 'enemy1', enemy_count: 2, spawn_area_id: 'around_player', spawn_interval: null, level_multiplier: null },
        ]),
      },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([{ objective_type: 'defeat', required_count: 2, config_json: null }]) },
    };
    const service = new SnapshotGeneratorService(prisma as any);

    const snapshot: any = await service.buildSnapshot('release1', 'R000001');
    const group = snapshot.stages[0].waves?.[0].groups[0] as any;

    expect(snapshot.enemies[0]).not.toHaveProperty('rowVersion');
    expect(snapshot.backgrounds[0]).not.toHaveProperty('updatedAt');
    expect(snapshot.heroVisuals[0]).not.toHaveProperty('rowVersion');
    expect(snapshot.stages[0]).not.toHaveProperty('updatedAt');
    expect(snapshot.stages[0].objectives?.[0]).not.toHaveProperty('config');
    expect(snapshot.stages[0].waves?.[0]).toMatchObject({ id: 'w1', name: 'Wave 1', message: 'Wave message', spawnDelay: 1.2 });
    expect(group.spawnGroup).toBe('around_player');
    expect(group).not.toHaveProperty('spawnInterval');
    expect(group).not.toHaveProperty('levelMultiplier');
  });

  it('builds a checksummed stage progression snapshot with summary counts', async () => {
    const prisma: any = {
      contentStageProgressionConfig: { findMany: jest.fn().mockResolvedValue([{ stage_id: 'stage1', recommended_power: 200, victory_text: '胜利', failure_text: '失败' }]) },
      contentStageProgressionObjective: { findMany: jest.fn().mockResolvedValue([
        { stage_id: 'stage1', objective_key: 'clear', name: '通关', objective_type: 'clear-all-waves', required: true, params_json: {}, display_text: '清除全部', progress_display: 'waves', star_eligible: true, enabled: true, sort_order: 0 },
      ]) },
      contentStageRewardPool: { findMany: jest.fn().mockResolvedValue([{ id: 'p1', stage_id: 'stage1', pool_key: 'first', name: '首通', group_type: 'first-clear', objective_key: null, selection_mode: 'all', enabled: true, sort_order: 0 }]) },
      contentStageRewardEntry: { findMany: jest.fn().mockResolvedValue([{ pool_id: 'p1', entry_key: 'gold', reward_type: 'currency', reward_ref_id: 'gold', min_quantity: 10, max_quantity: 10, probability: 1, guaranteed: true, enabled: true, sort_order: 0 }]) },
      contentStageUnlockRule: { findMany: jest.fn().mockResolvedValue([{ stage_id: 'stage1', rule_key: 'next', rule_type: 'prerequisite-clear', prerequisite_stage_id: 'stage1', required_stars: 1, next_stage_id: 'stage2', enabled: true, sort_order: 0 }]) },
      contentRewardDefinition: { findMany: jest.fn().mockResolvedValue([{ reward_type: 'currency', reward_ref_id: 'gold', name: '金币', icon_art_key: 'drop.coin', enabled: true }]) },
    };
    const service = new SnapshotGeneratorService(prisma);

    const snapshot: any = await service.buildStageProgressionSnapshot('release1', 'R000008');

    expect(snapshot).toMatchObject({ schemaVersion: 1, releaseId: 'release1', releaseVersion: 'R000008', stageCount: 1, objectiveCount: 1, rewardEntryCount: 1, unlockRuleCount: 1 });
    expect(snapshot.stages[0].objectives[0].type).toBe('clear-all-waves');
    expect(snapshot.checksum).toMatch(/^[a-f0-9]{64}$/);
  });

  it('keeps referenced virtual Art Keys in the release manifest without a physical version', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma: any = {
      contentEnemyTemplate: { findMany }, contentBackgroundTheme: { findMany }, contentHeroVisual: { findMany },
      contentArtResource: { findMany: jest.fn().mockResolvedValue([{ art_key: 'icon.objective.enemy', resource_status: 'virtual', resource_type: 'icon', pack_name: 'runtime', fallback_art_key: null }]) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue([]) },
      contentCampaign: { findMany }, contentCampaignChapter: { findMany },
      contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([{ icon_art_key: 'icon.objective.enemy' }]) },
    };
    const snapshot: any = await new SnapshotGeneratorService(prisma).buildArtManifestSnapshot('release10', 'R000010');
    expect(snapshot.resources['icon.objective.enemy']).toEqual(expect.objectContaining({ status: 'virtual' }));
  });

  it('does not query an undefined Art version for virtual release entries', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new SnapshotGeneratorService({ contentArtResourceVersion: { findMany } } as any);
    await (service as any).copyArtReleaseFiles({ releaseId: 'release10', resources: { icon: { status: 'virtual' } } });
    expect(findMany).toHaveBeenCalledWith({ where: { id: { in: [] } } });
  });

  it('builds Campaign Snapshot counts and lets content snapshot declare it', async () => {
    const prisma: any = {
      contentCampaign: { findMany: jest.fn().mockResolvedValue([{ id: 'main_campaign', name: '主线战役', subtitle: '', description: '', cover_art_key: null, default_chapter_id: 'chapter1', sort_order: 1, enabled: true, schema_version: 1, content_version: 1 }]) },
      contentCampaignChapter: { findMany: jest.fn().mockResolvedValue([{ id: 'chapter1', campaign_id: 'main_campaign', chapter_no: 1, name: '第一章', subtitle: '', description: '', background_art_key: 'map.trainingGround.floor', canvas_width: 1000, canvas_height: 600, viewport_x: 0, viewport_y: 0, enabled: true, completion_text: '完成', completion_reward_ref: null }]) },
      contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([
        { id: 'node1', chapter_id: 'chapter1', stage_id: 'stage1', name: '铸造通道', x: 100, y: 200, node_type: 'normal', icon_art_key: null, is_start: true, is_end: false, sort_order: 1, recommended_power: 220, description: null, enabled: true },
        { id: 'node2', chapter_id: 'chapter1', stage_id: 'stage2', name: '训练场', x: 800, y: 200, node_type: 'exploration', icon_art_key: null, is_start: false, is_end: true, sort_order: 2, recommended_power: 260, description: null, enabled: true },
      ]) },
      contentCampaignNodeConnection: { findMany: jest.fn().mockResolvedValue([{ id: 'path1', chapter_id: 'chapter1', from_node_id: 'node1', to_node_id: 'node2', path_type: 'normal', one_way: true, sort_order: 1, enabled: true }]) },
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([]) }, contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([]) }, contentStage: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([]) }, contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) }, contentStageObjective: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new SnapshotGeneratorService(prisma);
    const campaign: any = await service.buildCampaignSnapshot('release8', 'R000008');
    const content: any = await service.buildSnapshot('release8', 'R000008', undefined, undefined, undefined, undefined, campaign);

    expect(campaign).toMatchObject({ campaignCount: 1, chapterCount: 1, nodeCount: 2, connectionCount: 1 });
    expect(campaign.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(content).toMatchObject({ campaignSnapshotReleaseId: 'release8', campaignSnapshotChecksum: campaign.checksum, campaignSnapshotPath: 'content-store/published/campaign.snapshot.json' });
  });

  it('restores the previous published file set and removes failed release assets', () => {
    const root = path.resolve(__dirname, '../..');
    const temp = path.join(root, 'server', '.tmp-task27-publish-rollback');
    const envKeys = ['CONTENT_SNAPSHOT_JSON_PATH','CONTENT_SNAPSHOT_TS_PATH','ART_MANIFEST_JSON_PATH','ART_MANIFEST_TS_PATH',
      'ANIMATION_MANIFEST_JSON_PATH','ANIMATION_MANIFEST_TS_PATH','STAGE_ORCHESTRATION_JSON_PATH','STAGE_ORCHESTRATION_TS_PATH',
      'STAGE_PROGRESSION_JSON_PATH','STAGE_PROGRESSION_TS_PATH'];
    const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
    try {
      fs.mkdirSync(temp, { recursive: true });
      envKeys.forEach((key, index) => { process.env[key] = path.relative(root, path.join(temp, `${index}.txt`)); });
      const contentPath = path.join(temp, '0.txt');
      const artPath = path.join(temp, 'R000008', 'asset.png');
      fs.writeFileSync(contentPath, 'old');
      const service = new SnapshotGeneratorService({} as any);
      const state = service.capturePublishedState({ resources: { asset: { path: path.relative(root, artPath) } } });
      fs.writeFileSync(contentPath, 'new');
      fs.mkdirSync(path.dirname(artPath), { recursive: true }); fs.writeFileSync(artPath, 'new-art');

      service.restorePublishedState(state);

      expect(fs.readFileSync(contentPath, 'utf8')).toBe('old');
      expect(fs.existsSync(artPath)).toBe(false);
      expect(fs.existsSync(path.dirname(artPath))).toBe(false);
    } finally {
      for (const key of envKeys) previous[key] == null ? delete process.env[key] : process.env[key] = previous[key];
      fs.rmSync(temp, { recursive: true, force: true });
    }
  });

  it('persists publish recovery journals across process restarts', () => {
    const root = path.resolve(__dirname, '../..');
    const journalRoot = path.join(root, 'server', '.tmp-task27-publish-journal');
    const previous = process.env.PUBLISH_JOURNAL_ROOT;
    process.env.PUBLISH_JOURNAL_ROOT = path.relative(root, journalRoot);
    try {
      const service = new SnapshotGeneratorService({} as any);
      service.writePublishJournal('rel_8', { files: [{ filePath: 'old', content: 'v1' }], artFiles: [] });
      expect(service.listPublishJournals()).toEqual([{ releaseId: 'rel_8', state: { files: [{ filePath: 'old', content: 'v1' }], artFiles: [] } }]);
      service.clearPublishJournal('rel_8');
      expect(service.listPublishJournals()).toEqual([]);
    } finally {
      previous == null ? delete process.env.PUBLISH_JOURNAL_ROOT : process.env.PUBLISH_JOURNAL_ROOT = previous;
      fs.rmSync(journalRoot, { recursive: true, force: true });
    }
  });
});

function enemyRow() {
  return {
    id: 'enemy1',
    name: 'Enemy',
    category: 'normal',
    behavior_type: 'melee',
    visual_json: { idleArtKey: 'enemy.scrapMouse.normal', displayScale: 1, collisionRadius: 10 },
    stats_json: { maxHp: 1, attack: 1, defense: 0, moveSpeed: 1 },
    combat_json: { attackInterval: 1, attackRange: 1, detectRadius: 1, chaseRadius: 1 },
    rewards_json: null,
    tags_json: null,
    enabled: true,
    content_version: 1,
    row_version: 1,
    updated_at: new Date(),
  };
}

function backgroundRow() {
  return {
    id: 'bg1',
    name: 'Background',
    art_json: { floorArtKey: 'map.trainingGround.floor' },
    colors_json: null,
    rendering_json: { mode: 'world-tile' },
    enabled: true,
    content_version: 1,
    row_version: 1,
    updated_at: new Date(),
  };
}

function heroRow() {
  return {
    id: 'hero1',
    name: 'Hero',
    visual_json: { idleArtKey: 'player.mechaCat.idle', displayScale: 1, collisionRadius: 12 },
    skills_json: { shieldIconArtKey: 'ui.skill.shield', cannonIconArtKey: 'ui.skill.cannon' },
    enabled: true,
    content_version: 1,
    row_version: 1,
    updated_at: new Date(),
  };
}

function stageRow() {
  return {
    id: 'stage1',
    name: 'Stage',
    mode: 'fixed_battle',
    hero_visual_template_id: 'hero1',
    background_theme_id: 'bg1',
    enabled: true,
    content_version: 1,
    row_version: 1,
    updated_at: new Date(),
  };
}
