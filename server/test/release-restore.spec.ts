import { ReleasesService } from '../src/modules/releases/releases.service';

describe('ReleasesService restore', () => {
  it('restores stages, waves, explore spawns and objectives from a snapshot draft', async () => {
    const tx = createTx();
    const prisma = {
      contentReleaseSnapshot: { findFirst: jest.fn().mockResolvedValue({ snapshot_json: snapshot() }) },
      $transaction: jest.fn(async (fn: any) => fn(tx)),
    };
    const service = new ReleasesService(prisma as any, {} as any, {} as any);

    await service.restore('release1');

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ timeout: 20000 }));
    expect(tx.contentStage.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'stage_battle_1_1' },
      update: expect.objectContaining({ background_theme_id: 'bg_training_alt' }),
    }));
    expect(tx.contentStageWave.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ stage_id: 'stage_battle_1_1', wave_key: 'wave_a' }),
    }));
    expect(tx.contentStageWaveEnemyGroup.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ enemy_template_id: 'enemy_alt', enemy_count: 2 }),
    }));
    expect(tx.contentExploreSpawnGroup.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ group_key: 'spawn_a', enemy_template_id: 'enemy_alt' }),
    }));
    expect(tx.contentStageObjective.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ objective_type: 'defeat', required_count: 2 }),
    }));
    expect(tx.contentStageProgressionObjective.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ objective_key: 'clear', objective_type: 'clear-all-waves' })],
    }));
    expect(tx.contentStageRewardEntry.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ reward_ref_id: 'gold', min_quantity: 50 })],
    }));
    expect(tx.contentStageUnlockRule.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ next_stage_id: 'stage_battle_1_2' })],
    }));
  });

  it('restores Tutorial definitions transactionally and reports old release no-op', async () => {
    const tx = createTx(); const data: any = { tutorialDefinitions: [{ id: 'flow', name: '引导', description: '',
      campaignId: null, startStepId: 'step', endStepId: 'step', startCondition: {}, audience: {}, playerCondition: {},
      skipUnlockFeatures: [], skippable: true, allowReplay: false, priority: 1, enabled: true, schemaVersion: 1,
      contentVersion: 1, steps: [{ id: 'step', order: 1, name: '完成', triggerType: 'app.ready', triggerConfig: {},
        displayType: 'dialog', targetType: 'ui', targetId: 'home.campaign', title: '完成', body: '完成', blockInput: false,
        force: false, completionType: 'dialog.acknowledged', completionConfig: {}, terminal: true }], transitions: [], unlockRules: [] }] };
    const prisma: any = { contentReleaseSnapshot: { findFirst: jest.fn().mockResolvedValue({ snapshot_json: data }) },
      $transaction: jest.fn((fn: any) => fn(tx)) };
    const result = await new ReleasesService(prisma, {} as any, {} as any).restore('release-tutorial');
    expect(result.tutorialRestore).toBe('restored');
    expect(tx.contentTutorialFlow.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'flow' } }));
    expect(tx.contentTutorialStep.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'step' } }));

    prisma.contentReleaseSnapshot.findFirst.mockResolvedValue({ snapshot_json: {} });
    const old = await new ReleasesService(prisma, {} as any, {} as any).restore('release-old');
    expect(old.tutorialRestore).toBe('not-declared-noop');
  });
});

function createTx() {
  return {
    contentEnemyTemplate: { upsert: jest.fn() },
    contentBackgroundTheme: { upsert: jest.fn() },
    contentHeroVisual: { upsert: jest.fn() },
    contentStage: { upsert: jest.fn() },
    contentStageWave: {
      findMany: jest.fn().mockResolvedValue([{ id: 'old_wave' }]),
      deleteMany: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'new_wave' }),
    },
    contentStageWaveEnemyGroup: { deleteMany: jest.fn(), create: jest.fn() },
    contentExploreSpawnGroup: { deleteMany: jest.fn(), create: jest.fn() },
    contentStageObjective: { deleteMany: jest.fn(), create: jest.fn() },
    contentStageProgressionConfig: { upsert: jest.fn() },
    contentStageProgressionObjective: { deleteMany: jest.fn(), createMany: jest.fn() },
    contentStageRewardPool: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn(), create: jest.fn().mockResolvedValue({ id: 'pool1' }) },
    contentStageRewardEntry: { deleteMany: jest.fn(), createMany: jest.fn() },
    contentStageUnlockRule: { deleteMany: jest.fn(), createMany: jest.fn() },
    contentSystemState: { upsert: jest.fn() },
    contentChangeLog: { create: jest.fn() },
    contentTutorialFlow: tutorialDelegate(), contentTutorialStep: tutorialDelegate(),
    contentTutorialStepTransition: tutorialDelegate(), contentFeatureUnlockRule: tutorialDelegate(),
  };
}

function tutorialDelegate() { return { upsert: jest.fn(), findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn() }; }

function snapshot() {
  return {
    enemies: [{ id: 'enemy_alt', name: 'Alt', category: 'normal', behaviorType: 'melee', visual: {}, stats: {}, combat: {}, enabled: true, version: 1 }],
    backgrounds: [{ id: 'bg_training_alt', name: 'Alt BG', art: {}, rendering: {}, enabled: true, version: 1 }],
    heroVisuals: [{ id: 'hero_default', name: 'Hero', visual: {}, skills: {}, enabled: true, version: 1 }],
    stages: [{
      id: 'stage_battle_1_1',
      legacyStageId: '1-1',
      name: '1-1',
      mode: 'fixed-battle',
      heroVisualTemplateId: 'hero_default',
      backgroundThemeId: 'bg_training_alt',
      waves: [{ id: 'wave_a', wave: 1, groups: [{ enemyTemplateId: 'enemy_alt', count: 2, spawnGroup: 'left_right' }] }],
      exploration: { worldWidth: 1000, worldHeight: 800, spawnGroups: [{ id: 'spawn_a', enemyTemplateId: 'enemy_alt', spawnPoint: { x: 10, y: 20, radius: 30 }, initialCount: 1, maxAlive: 2, respawnInterval: 5, active: true }] },
      objectives: [{ type: 'defeat', required: 2 }],
      enabled: true,
      version: 1,
    }],
    stageProgressionDefinitions: [{
      stageId: 'stage_battle_1_1', recommendedPower: 200, victoryText: '胜利', failureText: '失败',
      objectives: [{ id: 'clear', name: '清场', type: 'clear-all-waves', required: true, params: {}, order: 1, displayText: '清场', progressDisplay: 'waves', starEligible: true, enabled: true }],
      rewardPools: [{ id: 'first', name: '首通', group: 'first-clear', selectionMode: 'all', entries: [{ id: 'gold', rewardType: 'currency', rewardRefId: 'gold', minQuantity: 50, maxQuantity: 50, probability: 1, guaranteed: true, enabled: true }] }],
      unlockRules: [{ id: 'next', type: 'prerequisite-clear', requiredStars: 1, nextStageId: 'stage_battle_1_2', enabled: true }],
    }],
  };
}
