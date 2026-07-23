import { TutorialsService } from '../src/modules/tutorials/tutorials.service';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { TutorialTargetCatalog } from '../src/modules/tutorials/tutorial-target.catalog';
import { TutorialFeatureCatalog } from '../src/modules/tutorials/tutorial-feature.catalog';
import { validateTutorialGraph } from '../src/modules/tutorials/tutorial.validation';
import { defaultSteps, seedTutorialDraft } from '../prisma/tutorial-seed';

describe('TutorialsService', () => {
  it('exposes concrete Nest runtime constructor dependencies', () => {
    expect(Reflect.getMetadata('design:paramtypes', TutorialsService))
      .toEqual([PrismaService, TutorialTargetCatalog, TutorialFeatureCatalog]);
    expect(Reflect.getMetadata('design:paramtypes', TutorialTargetCatalog))
      .toEqual([PrismaService, TutorialFeatureCatalog]);
  });

  it('creates a flow inside the draft transaction', async () => {
    const db = prismaMock();
    db.contentTutorialFlow.create.mockResolvedValue({ id: 'tutorial.test', row_version: 1 });
    const result = await new TutorialsService(db).createFlow({ id: 'tutorial.test', name: '测试引导' });
    expect(result).toMatchObject({ id: 'tutorial.test', rowVersion: 1 });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.contentChangeLog.create).toHaveBeenCalled();
  });

  it('creates a referenced step and rejects missing stage or art', async () => {
    const db = prismaMock();
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.test', deleted_at: null });
    db.contentTutorialStep.findUnique.mockResolvedValue({ id: 'battle', flow_id: 'tutorial.test', deleted_at: null });
    db.contentStage.findUnique.mockResolvedValue({ id: 'stage_battle_1_1', enabled: true });
    db.contentArtResource.findUnique.mockResolvedValue({ art_key: 'ui.tutorial.guide', enabled: true });
    db.contentTutorialStep.create.mockResolvedValue({ id: 'welcome', row_version: 1 });
    const first = { ...step(), terminal: true, nextStepId: null };
    await expect(new TutorialsService(db).createStep('tutorial.test', first)).resolves.toMatchObject({ id: 'welcome' });
    db.contentArtResource.findUnique.mockResolvedValue(null);
    await expect(new TutorialsService(db).createStep('tutorial.test', first))
      .rejects.toMatchObject({ response: { code: 'TUTORIAL_ART_REFERENCE_INVALID' } });
  });

  it('returns structured conflict and protects referenced steps', async () => {
    const db = prismaMock();
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.test', row_version: 3, deleted_at: null });
    db.contentTutorialStep.findUnique.mockResolvedValue({ id: 'welcome', row_version: 3, deleted_at: null });
    const service = new TutorialsService(db);
    await expect(service.updateStep('tutorial.test', 'welcome', { ...step(), rowVersion: 2 }))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 2, remoteRowVersion: 3 } });
    db.contentTutorialStep.count.mockResolvedValue(1);
    await expect(service.removeStep('tutorial.test', 'welcome', 3))
      .rejects.toMatchObject({ response: { code: 'CONTENT_REFERENCE_EXISTS' } });
  });

  it.each([
    ['invalid next', { ...graph(), steps: [{ ...graph().steps[0], nextStepId: 'missing' }] }, 'TUTORIAL_NEXT_STEP_INVALID'],
    ['unreachable', { ...graph(), steps: [...graph().steps, { ...step(), id: 'orphan', order: 3, terminal: true }] }, 'TUTORIAL_STEP_UNREACHABLE'],
    ['cycle', { ...graph(), steps: graph().steps.map((s, i) => ({ ...s, nextStepId: i ? 'welcome' : 'battle', terminal: false })) }, 'TUTORIAL_CYCLE'],
    ['forced fallback', { ...graph(), steps: [{ ...graph().steps[0], blockInput: true, fallbackAction: null }] }, 'TUTORIAL_FORCED_STEP_FALLBACK_REQUIRED'],
  ])('rejects %s', (_name, value, code) => {
    try { validateTutorialGraph(value); throw new Error('expected validation error'); }
    catch (error) { expect(error).toMatchObject({ response: { code } }); }
  });

  it('rolls back a failed complete orchestration', async () => {
    const db = prismaMock(); db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.test', row_version: 1 });
    db.contentStage.findUnique.mockResolvedValue({ id: 'stage_battle_1_1', enabled: true });
    db.contentArtResource.findUnique.mockResolvedValue({ art_key: 'ui.tutorial.guide', enabled: true });
    db.contentTutorialStep.create.mockRejectedValue(new Error('insert failed'));
    await expect(new TutorialsService(db).saveOrchestration('tutorial.test', { ...graph(), rowVersion: 1 }))
      .rejects.toThrow('insert failed');
    expect(db.contentTutorialFlow.updateMany).toHaveBeenCalledTimes(1);
    expect(db.contentTutorialFlow.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { row_version: { increment: 0 } },
    }));
    expect(db.contentChangeLog.create).not.toHaveBeenCalled();
  });

  it('seeds the default draft idempotently without creating a release', async () => {
    const db = prismaMock(); db.contentCampaign.findUnique.mockResolvedValue({ id: 'campaign_main_01', enabled: true });
    db.contentStage.findUnique.mockResolvedValue({ id: 'stage_battle_1_1', enabled: true });
    db.contentArtResource.findMany.mockResolvedValue([
      { art_key: 'player.mechaCat.idle', resource_status: 'virtual' }, { art_key: 'ui.tutorial.arrow', resource_status: 'virtual' },
    ]);
    await expect(seedTutorialDraft(db)).resolves.toBe('created');
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.main.firstJourney' });
    db.contentTutorialStep.findUnique.mockResolvedValue({ deleted_at: null });
    db.contentFeatureUnlockRule.findUnique.mockResolvedValue({ deleted_at: null });
    await expect(seedTutorialDraft(db)).resolves.toBe('skipped');
    expect(db.contentTutorialFlow.create).toHaveBeenCalledTimes(1);
    expect(db.contentRelease?.create).toBeUndefined();
  });

  it('seeds production-reachable triggers and final equipment targets', () => {
    const byId = new Map(defaultSteps().map(row => [row.id, row]));
    expect(byId.get('tutorial.welcome')?.trigger_type).toBe('app.ready');
    expect(byId.get('tutorial.openCampaign')?.trigger_type).toBe('page.campaign');
    for (const id of ['tutorial.chapterOne', 'tutorial.newNode', 'tutorial.inventory']) {
      expect(byId.get(id)?.trigger_type).toBe('page.campaign');
    }
    expect(byId.get('tutorial.stageDetail')?.trigger_type).toBe('page.stage-detail');
    expect(byId.get('tutorial.stagePower')?.trigger_type).toBe('detail.objective-viewed');
    expect(byId.get('tutorial.stageReward')?.trigger_type).toBe('detail.power-viewed');
    expect(byId.get('tutorial.startStage')?.trigger_type).toBe('detail.reward-viewed');
    expect(byId.get('tutorial.move')?.trigger_type).toBe('battle.ready');
    expect(byId.get('tutorial.attack')?.trigger_type).toBe('battle.player-moved');
    expect(byId.get('tutorial.firstEnemy')?.trigger_type).toBe('battle.attack-used');
    expect(byId.get('tutorial.firstWave')?.trigger_type).toBe('battle.enemy-defeated');
    expect(byId.get('tutorial.clear')?.trigger_type).toBe('battle.wave-cleared');
    expect(byId.get('tutorial.inventory')?.target_id).toBe('campaign.back');
    expect(byId.get('tutorial.equipment')?.target_id).toBe('home.equipment');
    expect(byId.get('tutorial.complete')?.target_id).toBe('equipment.inventory.first');
    expect(byId.get('tutorial.complete')?.completion_type).toBe('equipment.equipped');
  });
});

function step() { return { id: 'welcome', name: '欢迎', order: 1, triggerType: 'page.enter', triggerConfig: {}, displayType: 'dialog', targetType: 'ui', targetId: 'home.campaign', title: '欢迎', body: '打开主线', avatarArtKey: 'ui.tutorial.guide', campaignId: null, blockInput: true, force: true, completionType: 'target.click', completionConfig: {}, timeoutMs: 5000, fallbackAction: 'skip-step', stageId: 'stage_battle_1_1', terminal: false, nextStepId: 'battle' }; }
function graph() { return { flow: { id: 'tutorial.test', name: '测试', description: '', campaignId: null, startStepId: 'welcome', endStepId: 'battle', startCondition: {}, audience: {}, playerCondition: {}, skipUnlockFeatures: [], skippable: true, allowReplay: false, priority: 0, enabled: true, schemaVersion: 1, contentVersion: 1, rowVersion: 1 }, startStepId: 'welcome', steps: [step(), { ...step(), id: 'battle', order: 2, blockInput: false, fallbackAction: null, nextStepId: null, terminal: true }], transitions: [], unlockRules: [] }; }
function prismaMock(): any {
  const db: any = { contentTutorialFlow: delegates(), contentTutorialStep: delegates(), contentTutorialStepTransition: delegates(), contentFeatureUnlockRule: delegates(), contentStage: delegates(), contentCampaign: delegates(), contentArtResource: delegates(), contentSystemState: { upsert: jest.fn() }, contentChangeLog: { create: jest.fn() } };
  db.$transaction = jest.fn(async (work: any) => work(db)); return db;
}
function delegates() { return { create: jest.fn(), createMany: jest.fn(), findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), updateMany: jest.fn().mockResolvedValue({ count: 1 }), deleteMany: jest.fn() }; }
