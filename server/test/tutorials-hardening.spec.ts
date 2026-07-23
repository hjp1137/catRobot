import { reconcileTutorialRows, TutorialsService } from '../src/modules/tutorials/tutorials.service';
import { TutorialTargetCatalog } from '../src/modules/tutorials/tutorial-target.catalog';
import { TutorialFeatureCatalog } from '../src/modules/tutorials/tutorial-feature.catalog';
import { defaultSteps, seedTutorialDraft } from '../prisma/tutorial-seed';

describe('Tutorial hardening', () => {
  it('uses a real character avatar for every default step and keeps the guide arrow in its own display field', () => {
    const rows = defaultSteps();
    expect(rows).toHaveLength(19);
    expect(rows.every((row: any) => row.avatar_art_key === 'player.mechaCat.idle')).toBe(true);
    expect(rows.every((row: any) => row.avatar_art_key !== row.arrow_json.artKey)).toBe(true);
    expect(rows.every((row: any) => row.arrow_json.artKey === 'ui.tutorial.arrow')).toBe(true);
  });

  it('exposes stable target and feature catalogs', async () => {
    const db = fakeDb();
    const targets = await new TutorialTargetCatalog(db).list();
    const features = new TutorialFeatureCatalog().list();
    expect(targets).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'ui', id: 'home.campaign' }),
      expect.objectContaining({ type: 'canvas', id: 'battle.enemy' }),
    ]));
    expect(features).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'feature.equipment' })]));
  });

  it('persists expanded flow fields in the transaction', async () => {
    const db = fakeDb(); db.contentTutorialFlow.create.mockImplementation(({ data }: any) => ({ ...data, row_version: 1 }));
    await new TutorialsService(db).createFlow({ id: 'tutorial.x', name: '测试', audience: { newPlayer: true },
      playerCondition: { maxStage: '1-1' }, allowReplay: true, priority: 9,
      skipUnlockFeatures: ['feature.campaign'] });
    expect(db.contentTutorialFlow.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      audience_json: { newPlayer: true }, player_condition_json: { maxStage: '1-1' },
      allow_replay: true, priority: 9, skip_unlock_features_json: ['feature.campaign'],
    }) });
  });

  it('updates, creates and soft deletes orchestration rows without hard delete', async () => {
    const db = fakeDb();
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.x', row_version: 2, deleted_at: null });
    db.contentTutorialStep.findMany.mockResolvedValue([{ id: 'old', flow_id: 'tutorial.x', row_version: 4, deleted_at: null }]);
    await new TutorialsService(db).saveOrchestration('tutorial.x', orchestration());
    expect(db.contentTutorialStep.deleteMany).not.toHaveBeenCalled();
    expect(db.contentTutorialStep.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'old', row_version: 5 }), data: expect.objectContaining({ deleted_at: expect.any(Date) }),
    }));
    expect(db.contentTutorialStep.create).toHaveBeenCalled();
  });

  it('rolls back earlier writes when a later orchestration CAS fails', async () => {
    const { db, committed, attempted } = rollbackDb();
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.x', row_version: 2, deleted_at: null });
    db.contentTutorialStep.findMany.mockResolvedValue([]);
    db.contentTutorialFlow.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    await expect(new TutorialsService(db).saveOrchestration('tutorial.x', orchestration()))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT' } });
    expect(attempted).toHaveLength(2);
    expect(committed).toEqual([]);
  });

  it('rejects invalid catalog target and unlock rule', async () => {
    const db = fakeDb(); db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.x', row_version: 2, deleted_at: null });
    await expect(new TutorialsService(db).saveOrchestration('tutorial.x', { ...orchestration(), steps: [
      { ...orchestration().steps[0], targetId: 'ui.not-registered' }, orchestration().steps[1],
    ] })).rejects.toMatchObject({ response: { code: 'TUTORIAL_UI_TARGET_INVALID' } });
    await expect(new TutorialsService(db).saveOrchestration('tutorial.x', { ...orchestration(), unlockRules: [
      { id: 'r1', stepId: 'done', featureId: 'feature.not-found', unlockTrigger: 'step.complete' },
    ] })).rejects.toMatchObject({ response: { code: 'TUTORIAL_FEATURE_REFERENCE_INVALID' } });
  });

  it('rejects flow start/end and skip links outside the same flow', async () => {
    const db = fakeDb(); db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.x', row_version: 2, deleted_at: null });
    db.contentTutorialStep.findUnique.mockResolvedValue({ id: 'foreign', flow_id: 'tutorial.other', deleted_at: null });
    await expect(new TutorialsService(db).updateFlow('tutorial.x', { name: '测试', rowVersion: 2,
      startStepId: 'foreign', endStepId: 'foreign' })).rejects.toMatchObject({ response: { code: 'TUTORIAL_START_STEP_INVALID' } });
    await expect(new TutorialsService(db).createStep('tutorial.x', { ...orchestration().steps[0], id: 'new',
      nextStepId: null, skipStepId: 'foreign' })).rejects.toMatchObject({ response: { code: 'TUTORIAL_SKIP_STEP_INVALID' } });
  });

  it('checks step references inside a Serializable transaction before CAS delete', async () => {
    const db = fakeDb(); const events: string[] = [];
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.x', row_version: 1, start_step_id: 'done' });
    db.contentTutorialStep.findUnique.mockImplementation(() => { events.push('read'); return { id: 'done', flow_id: 'tutorial.x', row_version: 2 }; });
    db.contentTutorialStep.count.mockImplementation(() => { events.push('references'); return 0; });
    db.contentTutorialStep.updateMany.mockImplementation(({ data }: any) => {
      events.push(data.deleted_at ? 'cas' : 'lock'); return { count: 1 };
    });
    await new TutorialsService(db).removeStep('tutorial.x', 'done', 2);
    expect(events.indexOf('read')).toBeLessThan(events.indexOf('references'));
    expect(events.indexOf('lock')).toBeLessThan(events.indexOf('references'));
    expect(events.indexOf('references')).toBeLessThan(events.indexOf('cas'));
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: 'Serializable' }));
  });

  it('restores a soft deleted default seed and contains the complete first chapter chain', async () => {
    const db = fakeDb(); db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.main.firstJourney', deleted_at: new Date(), row_version: 3 });
    db.contentCampaign.findUnique.mockResolvedValue({ id: 'campaign_main_01', enabled: true, deleted_at: null });
    db.contentStage.findUnique.mockResolvedValue({ id: 'stage_battle_1_1', enabled: true, deleted_at: null });
    db.contentArtResource.findMany.mockResolvedValue(['player.mechaCat.idle', 'ui.tutorial.arrow'].map(art_key => ({
      art_key, enabled: true, deleted_at: null, resource_status: 'virtual',
    })));
    await expect(seedTutorialDraft(db)).resolves.toBe('restored');
    const rows = db.contentTutorialStep.create.mock.calls.map((call: any[]) => call[0].data);
    expect(rows.map((row: any) => row.id)).toEqual(expect.arrayContaining([
      'tutorial.welcome', 'tutorial.openCampaign', 'tutorial.chapterOne', 'tutorial.stageDetail',
      'tutorial.move', 'tutorial.attack', 'tutorial.firstEnemy', 'tutorial.firstWave', 'tutorial.clear',
      'tutorial.resultReward', 'tutorial.returnMap', 'tutorial.newNode', 'tutorial.equipment', 'tutorial.complete',
    ]));
    expect(rows.find((row: any) => row.id === 'tutorial.firstEnemy')).toMatchObject({
      trigger_type: 'battle.attack-used', completion_type: 'battle.enemy-defeated',
    });
  });

  it('swaps step order through temporary positions without unique collisions', async () => {
    const delegate = statefulRows([
      { id: 'a', flow_id: 'f', sort_order: 1, row_version: 1, deleted_at: null, enabled: true },
      { id: 'b', flow_id: 'f', sort_order: 2, row_version: 1, deleted_at: null, enabled: true },
    ]);
    await reconcileTutorialRows(delegate, 'f', [
      { id: 'a', order: 2, rowVersion: 1 }, { id: 'b', order: 1, rowVersion: 1 },
    ], (x: any) => ({ id: x.id, flow_id: 'f', sort_order: x.order, row_version: 1, enabled: true }),
    (x: any) => ({ sort_order: x.order, enabled: true }), 'step');
    expect(delegate.rows.map((row: any) => [row.id, row.sort_order])).toEqual([['a', 2], ['b', 1]]);
  });

  it('restores a soft deleted same-id row and moves a deleted order occupant safely', async () => {
    const delegate = statefulRows([
      { id: 'restore', flow_id: 'f', sort_order: 1, row_version: 3, deleted_at: new Date(), enabled: false },
      { id: 'occupant', flow_id: 'f', sort_order: 2, row_version: 4, deleted_at: new Date(), enabled: false },
    ]);
    await reconcileTutorialRows(delegate, 'f', [{ id: 'restore', order: 2, rowVersion: 3 }],
      (x: any) => ({ id: x.id, flow_id: 'f', sort_order: x.order, row_version: 1, enabled: true }),
      (x: any) => ({ sort_order: x.order, enabled: true }), 'step');
    expect(delegate.rows.find((row: any) => row.id === 'restore')).toMatchObject({ sort_order: 2, deleted_at: null, enabled: true });
    expect(delegate.create).not.toHaveBeenCalled();
  });

  it('repairs missing and soft-deleted rows of an active seed without overwriting active rows', async () => {
    const db = fakeDb(); configureSeedRefs(db);
    db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'tutorial.main.firstJourney', deleted_at: null, row_version: 5 });
    db.contentTutorialStep.findUnique.mockImplementation(({ where }: any) => where.id === 'tutorial.welcome'
      ? { id: where.id, title: '人工欢迎文案', deleted_at: null, row_version: 7 }
      : where.id === 'tutorial.openCampaign' ? { id: where.id, deleted_at: new Date(), row_version: 3 } : null);
    await expect(seedTutorialDraft(db)).resolves.toBe('restored');
    expect(db.contentTutorialFlow.updateMany).not.toHaveBeenCalled();
    expect(db.contentTutorialStep.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'tutorial.openCampaign', row_version: 3 }, data: expect.objectContaining({ deleted_at: null }),
    }));
    expect(db.contentTutorialStep.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'tutorial.welcome' }),
    }));
  });

  it('creates an empty flow disabled and rejects explicitly enabled empty flow', async () => {
    const db = fakeDb(); db.contentTutorialFlow.create.mockImplementation(({ data }: any) => ({ ...data, row_version: 1 }));
    await new TutorialsService(db).createFlow({ id: 'draft.empty', name: '空草稿' });
    expect(db.contentTutorialFlow.create).toHaveBeenCalledWith({ data: expect.objectContaining({ enabled: false }) });
    await expect(new TutorialsService(db).createFlow({ id: 'draft.invalid', name: '非法', enabled: true }))
      .rejects.toMatchObject({ response: { code: 'TUTORIAL_EMPTY_FLOW_CANNOT_ENABLE' } });
  });

  it('rejects enabling a flow whose complete persisted graph is invalid', async () => {
    const db = fakeDb(); db.contentTutorialFlow.findUnique.mockResolvedValue({ id: 'f', name: '草稿', enabled: false,
      row_version: 2, start_step_id: null, end_step_id: null, deleted_at: null });
    await expect(new TutorialsService(db).updateFlow('f', { name: '草稿', enabled: true, rowVersion: 2 }))
      .rejects.toMatchObject({ response: { code: 'TUTORIAL_ENABLED_FLOW_STEPS_REQUIRED' } });
    expect(db.contentTutorialFlow.updateMany).not.toHaveBeenCalled();
  });

  it('allocates unoccupied deterministic temporary orders despite old temp values and shuffled reads', async () => {
    const delegate = statefulRows([
      { id: 'b', flow_id: 'f', sort_order: -2_000_000_000, row_version: 1, deleted_at: new Date(), enabled: false },
      { id: 'a', flow_id: 'f', sort_order: 1, row_version: 2, deleted_at: null, enabled: true },
    ]);
    await reconcileTutorialRows(delegate, 'f', [{ id: 'a', order: 1, rowVersion: 2 }],
      (x: any) => ({ id: x.id, flow_id: 'f', sort_order: x.order, row_version: 1, enabled: true }),
      (x: any) => ({ sort_order: x.order, enabled: true }), 'step');
    expect(delegate.rows.find((row: any) => row.id === 'a')?.sort_order).toBe(1);
    expect(delegate.rows.find((row: any) => row.id === 'b')?.sort_order).not.toBe(1);
    expect(delegate.findMany).toHaveBeenCalledWith({ where: { flow_id: 'f' }, orderBy: { id: 'asc' } });
  });

  it('restores a deleted orchestration id without exposing its hidden rowVersion', async () => {
    const delegate = statefulRows([{ id: 'restore', flow_id: 'f', sort_order: 7, row_version: 9,
      deleted_at: new Date(), enabled: false }]);
    await expect(reconcileTutorialRows(delegate, 'f', [{ id: 'restore', order: 1 }],
      (x: any) => ({ id: x.id, flow_id: 'f', sort_order: x.order, row_version: 1, enabled: true }),
      (x: any) => ({ sort_order: x.order, enabled: true }), 'step')).resolves.toBeUndefined();
    expect(delegate.rows[0]).toMatchObject({ sort_order: 1, deleted_at: null, enabled: true });
  });
});

function orchestration(): any { return { flow: { id: 'tutorial.x', name: '测试', description: '', campaignId: null, startStepId: 'start', endStepId: 'done', startCondition: {}, audience: {}, playerCondition: {}, skipUnlockFeatures: [], skippable: true, allowReplay: false, priority: 0, enabled: true, schemaVersion: 1, contentVersion: 1, rowVersion: 2 }, steps: [
  { id: 'start', name: '开始', order: 1, triggerType: 'page.enter', triggerConfig: {}, displayType: 'dialog', targetType: 'ui', targetId: 'home.campaign', title: '开始', body: '开始', campaignId: null, stageId: null, avatarArtKey: null, blockInput: true, force: true, completionType: 'target.click', completionConfig: {}, fallbackAction: 'skip-step', nextStepId: 'done', rowVersion: 0 },
  { id: 'done', name: '完成', order: 2, triggerType: 'page.enter', triggerConfig: {}, displayType: 'dialog', targetType: 'ui', targetId: 'home.equipment', title: '完成', body: '完成', campaignId: null, stageId: null, avatarArtKey: null, blockInput: false, force: false, completionType: 'target.click', completionConfig: {}, terminal: true, rowVersion: 0 },
], transitions: [], unlockRules: [] }; }
function delegates() { return { create: jest.fn(), createMany: jest.fn(), findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), updateMany: jest.fn().mockResolvedValue({ count: 1 }), deleteMany: jest.fn() }; }
function fakeDb(): any { const db: any = { contentTutorialFlow: delegates(), contentTutorialStep: delegates(), contentTutorialStepTransition: delegates(), contentFeatureUnlockRule: delegates(), contentStage: delegates(), contentCampaign: delegates(), contentArtResource: delegates(), contentSystemState: { upsert: jest.fn() }, contentChangeLog: { create: jest.fn() } }; db.$transaction = jest.fn((fn: any) => fn(db)); return db; }
function rollbackDb() { const db = fakeDb(); const committed: any[] = []; const attempted: any[] = []; db.$transaction = jest.fn(async (fn: any) => { const staged: any[] = []; const tx = { ...db, contentTutorialStep: { ...db.contentTutorialStep, create: jest.fn(({ data }: any) => { staged.push(data); attempted.push(data); return data; }) } }; const result = await fn(tx); committed.push(...staged); return result; }); return { db, committed, attempted }; }
function statefulRows(initial: any[]) {
  const rows = initial.map(row => ({ ...row }));
  const delegate: any = { rows, findMany: jest.fn(() => rows.map(row => ({ ...row }))), create: jest.fn(({ data }: any) => {
    if (rows.some(row => row.id === data.id)) throw new Error('P2002 primary key');
    if (rows.some(row => row.flow_id === data.flow_id && row.sort_order === data.sort_order)) throw new Error('P2002 sort');
    rows.push({ ...data }); return data;
  }), updateMany: jest.fn(({ where, data }: any) => {
    const row = rows.find(value => value.id === where.id && value.flow_id === where.flow_id &&
      value.row_version === where.row_version && (where.deleted_at === undefined || value.deleted_at === where.deleted_at));
    if (!row) return { count: 0 };
    const nextOrder = data.sort_order ?? row.sort_order;
    if (rows.some(value => value !== row && value.flow_id === row.flow_id && value.sort_order === nextOrder)) throw new Error('P2002 sort');
    const nextVersion = row.row_version + (data.row_version?.increment ?? 0);
    Object.assign(row, data, { row_version: nextVersion });
    return { count: 1 };
  }) };
  return delegate;
}
function configureSeedRefs(db: any) {
  db.contentCampaign.findUnique.mockResolvedValue({ id: 'campaign_main_01', enabled: true, deleted_at: null });
  db.contentStage.findUnique.mockResolvedValue({ id: 'stage_battle_1_1', enabled: true, deleted_at: null });
  db.contentArtResource.findMany.mockResolvedValue(['player.mechaCat.idle', 'ui.tutorial.arrow'].map(art_key => ({
    art_key, enabled: true, deleted_at: null, resource_status: 'virtual',
  })));
}
