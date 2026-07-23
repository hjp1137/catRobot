import { TutorialsService, reconcileTutorialRows } from '../src/modules/tutorials/tutorials.service';
import { flowPatchRow, transitionModel, unlockRuleModel } from '../src/modules/tutorials/tutorial.mapper';

describe('Tutorial quality gates', () => {
  it('maps GET orchestration rows to PUT-ready camelCase with versions', async () => {
    const db = fakeDb();
    db.contentTutorialFlow.findUnique.mockResolvedValue(flowRow());
    db.contentTutorialStep.findMany.mockResolvedValue([stepRow()]);
    db.contentTutorialStepTransition.findMany.mockResolvedValue([{ id: 'tr', flow_id: 'f', from_step_id: 's',
      to_step_id: 's', condition_type: 'always', condition_json: {}, sort_order: 1, enabled: true, row_version: 4,
      created_at: new Date('2026-01-01'), updated_at: new Date('2026-01-02'), deleted_at: null }]);
    db.contentFeatureUnlockRule.findMany.mockResolvedValue([{ id: 'rule', flow_id: 'f', step_id: 's',
      feature_id: 'feature.campaign', unlock_trigger: 'step.complete', condition_json: {}, unlock_on_skip: true,
      sort_order: 1, enabled: true, row_version: 5, created_at: new Date(), updated_at: new Date(), deleted_at: null }]);
    const value = await new TutorialsService(db).getFlow('f');
    expect(value).toMatchObject({ contentVersion: 2, createdAt: expect.any(Date), transitions: [
      { id: 'tr', flowId: 'f', fromStepId: 's', toStepId: 's', rowVersion: 4, deletedAt: null },
    ], unlockRules: [{ id: 'rule', flowId: 'f', stepId: 's', featureId: 'feature.campaign', rowVersion: 5 }] });
    expect(transitionModel).toBeDefined(); expect(unlockRuleModel).toBeDefined();
  });

  it('builds a flow patch from explicit fields only', () => {
    expect(flowPatchRow({ description: '新说明', rowVersion: 3 })).toEqual({ description: '新说明' });
  });

  it.each([
    [{ id: '', name: 'x' }, 'TUTORIAL_FLOW_ID_INVALID'],
    [{ id: 'ok', name: '', priority: 1 }, 'TUTORIAL_FLOW_NAME_INVALID'],
    [{ id: 'ok', name: 'x', priority: 1.2 }, 'TUTORIAL_FLOW_PRIORITY_INVALID'],
    [{ id: 'ok', name: 'x', audience: [] }, 'TUTORIAL_FLOW_AUDIENCE_INVALID'],
  ])('returns structured 400 for invalid flow input', async (body, code) => {
    await expect(new TutorialsService(fakeDb()).createFlow(body)).rejects.toMatchObject({ response: { code } });
  });

  it('does not churn unrelated deleted history during reconcile', async () => {
    const delegate = stateful([{ id: 'active', flow_id: 'f', sort_order: 1, row_version: 2, deleted_at: null },
      { id: 'history', flow_id: 'f', sort_order: -9, row_version: 8, deleted_at: new Date() }]);
    await reconcileTutorialRows(delegate, 'f', [{ id: 'active', order: 1, rowVersion: 2 }],
      (x: any) => ({ id: x.id, flow_id: 'f', sort_order: x.order, row_version: 1 }),
      (x: any) => ({ sort_order: x.order, enabled: true }), 'step');
    expect(delegate.calls.filter((call: any) => call.where.id === 'history')).toHaveLength(0);
  });

  it('keeps orchestration read, source locks, reconcile and Flow CAS in one Serializable transaction', async () => {
    const db = fakeDb(); const events: string[] = [];
    db.contentTutorialFlow.findUnique.mockImplementation(() => { events.push('flow-read'); return flowRow(); });
    db.contentTutorialFlow.updateMany.mockImplementation(({ data }: any) => { events.push(data.row_version?.increment === 0 ? 'flow-lock' : 'flow-cas'); return { count: 1 }; });
    db.contentCampaign.updateMany.mockImplementation(() => { events.push('campaign-lock'); return { count: 1 }; });
    db.contentTutorialStep.findMany.mockImplementation(() => { events.push('reconcile-read'); return [stepRow()]; });
    await new TutorialsService(db).saveOrchestration('f', orchestration());
    expect(events[0]).toBe('campaign-lock');
    expect(events.indexOf('campaign-lock')).toBeLessThan(events.indexOf('flow-read'));
    expect(events.indexOf('flow-read')).toBeLessThan(events.indexOf('flow-lock'));
    expect(events.indexOf('flow-lock')).toBeLessThan(events.indexOf('reconcile-read'));
    expect(events.indexOf('reconcile-read')).toBeLessThan(events.indexOf('flow-cas'));
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: 'Serializable' }));
  });

  it.each([
    [{ ...orchestration(), flow: undefined }, 'TUTORIAL_ORCHESTRATION_FLOW_REQUIRED'],
    [{ ...orchestration(), flow: { ...orchestration().flow, campaignId: undefined } }, 'TUTORIAL_FLOW_REFERENCE_FIELD_REQUIRED'],
    [{ ...orchestration(), steps: [{ ...orchestration().steps[0], title: undefined }] }, 'TUTORIAL_STEP_TITLE_INVALID'],
    [{ ...orchestration(), steps: [{ ...orchestration().steps[0], targetId: 7 }] }, 'TUTORIAL_STEP_TARGET_ID_INVALID'],
    [{ ...orchestration(), transitions: [{ id: 't', fromStepId: 's', toStepId: 's', conditionType: 2 }] }, 'TUTORIAL_TRANSITION_CONDITION_TYPE_INVALID'],
    [{ ...orchestration(), unlockRules: [{ id: 'r', stepId: 's', featureId: 1, unlockTrigger: 'step.complete' }] }, 'TUTORIAL_RULE_FEATURE_ID_INVALID'],
    [{ ...orchestration(), steps: [orchestration().steps[0], orchestration().steps[0]] }, 'TUTORIAL_STEP_ID_DUPLICATE'],
  ])('rejects malformed complete orchestration before Prisma', async (body, code) => {
    const db = fakeDb();
    await expect(new TutorialsService(db).saveOrchestration('f', body))
      .rejects.toMatchObject({ response: { code } });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('locks step resources before reading Flow and Step rows', async () => {
    const db = fakeDb(); const events: string[] = [];
    db.contentCampaign.updateMany.mockImplementation(() => { events.push('campaign-lock'); return { count: 1 }; });
    db.contentTutorialFlow.findUnique.mockImplementation(() => { events.push('flow-read'); return flowRow(); });
    db.contentTutorialStep.findUnique.mockImplementation(() => { events.push('step-read'); return stepRow(); });
    db.contentTutorialStep.findMany.mockResolvedValue([stepRow()]);
    await new TutorialsService(db).updateStep('f', 's', orchestration().steps[0]);
    expect(events.slice(0, 3)).toEqual(['campaign-lock', 'flow-read', 'step-read']);
  });

  it.each([
    [(x: any) => { x.flow.description = 1; }, 'TUTORIAL_FLOW_DESCRIPTION_INVALID'],
    [(x: any) => { x.flow.startStepId = 1; }, 'TUTORIAL_REFERENCE_FIELD_INVALID'],
    [(x: any) => { x.flow.contentVersion = 0; }, 'TUTORIAL_CONTENT_VERSION_INVALID'],
    [(x: any) => { x.steps[0].id = 1; }, 'TUTORIAL_STEP_ID_INVALID'],
    [(x: any) => { x.steps[0].triggerConfig = []; }, 'TUTORIAL_STEP_JSON_INVALID'],
    [(x: any) => { x.steps[0].timeoutMs = -1; }, 'TUTORIAL_TIMEOUT_INVALID'],
    [(x: any) => { x.steps[0].force = 1; }, 'TUTORIAL_STEP_BOOLEAN_INVALID'],
    [(x: any) => { x.transitions = [{ id: 't', fromStepId: 's', toStepId: 's', conditionType: 'always', condition: [] }]; }, 'TUTORIAL_TRANSITION_CONDITION_INVALID'],
    [(x: any) => { x.transitions = [{ id: 't', fromStepId: 's', toStepId: 's', conditionType: 'always', order: -1 }]; }, 'TUTORIAL_TRANSITION_ORDER_INVALID'],
    [(x: any) => { x.unlockRules = [{ id: 'r', stepId: 's', featureId: 'feature.campaign', unlockTrigger: 1 }]; }, 'TUTORIAL_RULE_TRIGGER_INVALID'],
    [(x: any) => { x.unlockRules = [{ id: 'r', stepId: 's', stageId: 1, featureId: 'feature.campaign', unlockTrigger: 'step.complete' }]; }, 'TUTORIAL_REFERENCE_FIELD_INVALID'],
    [(x: any) => { x.unlockRules = [{ id: 'r', stepId: 's', featureId: 'feature.campaign', unlockTrigger: 'step.complete', unlockOnSkip: 1 }]; }, 'TUTORIAL_RULE_SKIP_INVALID'],
  ])('validates every persisted field family before Prisma', async (mutate, code) => {
    const body = orchestration(); mutate(body); const db = fakeDb();
    await expect(new TutorialsService(db).saveOrchestration('f', body)).rejects.toMatchObject({ response: { code } });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('keeps resource-before-Flow order for updateFlow and createStep', async () => {
    for (const action of ['flow', 'step']) {
      const db = fakeDb(); const events: string[] = [];
      db.contentCampaign.updateMany.mockImplementation(() => { events.push('campaign-lock'); return { count: 1 }; });
      db.contentTutorialFlow.findUnique.mockImplementation(() => { events.push('flow-read'); return null; });
      const service = new TutorialsService(db);
      if (action === 'flow') await expect(service.updateFlow('f', { campaignId: 'campaign_main_01', rowVersion: 1 })).rejects.toThrow();
      else await expect(service.createStep('f', { ...orchestration().steps[0], id: 'new', rowVersion: 0 })).rejects.toThrow();
      expect(events.slice(0, 2)).toEqual(['campaign-lock', 'flow-read']);
    }
  });

  it.each([
    [(service: TutorialsService) => service.removeFlow('', 1), 'TUTORIAL_ID_INVALID'],
    [(service: TutorialsService) => service.removeFlow('f', undefined as any), 'TUTORIAL_ROW_VERSION_INVALID'],
    [(service: TutorialsService) => service.removeFlow('f', '1' as any), 'TUTORIAL_ROW_VERSION_INVALID'],
    [(service: TutorialsService) => service.removeStep('f', '', 1), 'TUTORIAL_ID_INVALID'],
    [(service: TutorialsService) => service.removeStep('f', 's', 0), 'TUTORIAL_ROW_VERSION_INVALID'],
  ])('rejects invalid delete input before opening a transaction', async (action, code) => {
    const db = fakeDb();
    await expect(action(new TutorialsService(db))).rejects.toMatchObject({ response: { code } });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('locks Flow then Step before removeStep reference checks and CAS', async () => {
    const db = fakeDb(); const events: string[] = [];
    db.contentTutorialFlow.findUnique.mockImplementation(() => { events.push('flow-read'); return flowRow(); });
    db.contentTutorialFlow.updateMany.mockImplementation(({ data }: any) => {
      events.push(data.row_version?.increment === 0 ? 'flow-lock' : 'flow-update'); return { count: 1 };
    });
    db.contentTutorialStep.findUnique.mockImplementation(() => { events.push('step-read'); return stepRow(); });
    db.contentTutorialStep.updateMany.mockImplementation(({ data }: any) => {
      events.push(data.row_version?.increment === 0 ? 'step-lock' : 'step-cas'); return { count: 1 };
    });
    for (const delegate of [db.contentTutorialStep, db.contentTutorialStepTransition, db.contentFeatureUnlockRule]) {
      delegate.count.mockImplementation(() => { events.push('references'); return 0; });
    }
    db.contentTutorialStep.findMany.mockResolvedValue([]);
    await new TutorialsService(db).removeStep('f', 's', 2);
    expect(events.slice(0, 4)).toEqual(['flow-read', 'flow-lock', 'step-read', 'step-lock']);
    expect(events.indexOf('step-lock')).toBeLessThan(events.indexOf('references'));
    expect(events.indexOf('references')).toBeLessThan(events.indexOf('step-cas'));
  });
});

function flowRow() { return { id: 'f', name: 'Flow', description: '', campaign_id: 'campaign_main_01', start_step_id: 's', end_step_id: 's', start_condition_json: {}, audience_json: {}, player_condition_json: {}, skip_unlock_features_json: [], skippable: true, allow_replay: true, priority: 1, enabled: true, schema_version: 1, content_version: 2, row_version: 3, created_at: new Date('2026-01-01'), updated_at: new Date('2026-01-02'), deleted_at: null }; }
function stepRow() { return { id: 's', flow_id: 'f', sort_order: 1, name: '结束', trigger_type: 'page.enter', trigger_json: {}, display_type: 'dialog', target_type: 'ui', target_id: 'home.campaign', title: '结束', body: '结束', mask_json: {}, arrow_json: {}, block_input: false, completion_type: 'target.click', completion_json: {}, terminal: true, enabled: true, content_version: 1, row_version: 2, deleted_at: null }; }
function orchestration(): any { return { flow: { id: 'f', name: 'Flow', description: '', campaignId: 'campaign_main_01', startStepId: 's', endStepId: 's', startCondition: {}, audience: {}, playerCondition: {}, skipUnlockFeatures: [], skippable: true, allowReplay: true, priority: 1, enabled: true, schemaVersion: 1, contentVersion: 2, rowVersion: 3 }, steps: [{ id: 's', order: 1, name: '结束', triggerType: 'page.enter', triggerConfig: {}, displayType: 'dialog', targetType: 'ui', targetId: 'home.campaign', title: '结束', body: '结束', campaignId: 'campaign_main_01', stageId: null, avatarArtKey: null, blockInput: false, force: false, completionType: 'target.click', completionConfig: {}, fallbackAction: null, nextStepId: null, skipStepId: null, timeoutMs: null, terminal: true, enabled: true, contentVersion: 1, rowVersion: 2 }], transitions: [], unlockRules: [] }; }
function delegates() { return { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), updateMany: jest.fn().mockResolvedValue({ count: 1 }) }; }
function fakeDb(): any { const db: any = { contentTutorialFlow: delegates(), contentTutorialStep: delegates(), contentTutorialStepTransition: delegates(), contentFeatureUnlockRule: delegates(), contentCampaign: delegates(), contentStage: delegates(), contentArtResource: delegates(), contentSystemState: { upsert: jest.fn() }, contentChangeLog: { create: jest.fn() } }; db.contentCampaign.findUnique.mockResolvedValue({ id: 'campaign_main_01', enabled: true }); db.$transaction = jest.fn((fn: any) => fn(db)); return db; }
function stateful(rows: any[]) { const calls: any[] = []; return { calls, findMany: jest.fn(() => rows.map(row => ({ ...row }))), create: jest.fn(), updateMany: jest.fn(({ where, data }: any) => { calls.push({ where, data }); const row = rows.find(item => item.id === where.id && item.row_version === where.row_version); if (!row) return { count: 0 }; const version = row.row_version + (data.row_version?.increment ?? 0); Object.assign(row, data, { row_version: version }); return { count: 1 }; }) }; }
