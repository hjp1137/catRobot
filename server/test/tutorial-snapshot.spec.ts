import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { SnapshotGeneratorService } from '../src/infrastructure/snapshot-generator/snapshot-generator.service';
import { readPublishedTutorial } from '../src/modules/tutorials/tutorial-published';
import { validateTutorialContent } from '../src/modules/content-validation/tutorial-content.validation';

describe('Tutorial snapshot publication', () => {
  beforeEach(() => { jest.useFakeTimers().setSystemTime(new Date('2026-07-16T00:00:00Z')); });
  afterEach(() => jest.useRealTimers());

  it('builds stable enabled runtime definitions and declares them in content snapshot', async () => {
    const db = fakeDb(); const service = new SnapshotGeneratorService(db);
    const tutorial: any = await service.buildTutorialSnapshot('release8', 'R000008');
    expect(tutorial).toMatchObject({ releaseId: 'release8', releaseVersion: 'R000008', flowCount: 1,
      stepCount: 1, featureUnlockRuleCount: 1, checksum: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(tutorial.flows[0]).toMatchObject({ id: 'flow', steps: [{ id: 'step', targetId: 'home.campaign' }] });
    expect(db.contentTutorialFlow.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { enabled: true, deleted_at: null } }));
    const content: any = await service.buildSnapshot('release8', 'R000008', undefined, undefined, undefined, undefined, undefined, tutorial);
    expect(content).toMatchObject({ tutorialSnapshotReleaseId: 'release8', tutorialSnapshotChecksum: tutorial.checksum,
      tutorialSnapshotPath: 'content-store/published/tutorial.snapshot.json', tutorialDefinitions: tutorial.flows });
  });

  it('uses published-only and warning Art versions in the offline publication catalog', async () => {
    const db = fakeDb();
    db.contentTutorialStep.findMany.mockResolvedValue([
      { ...(await db.contentTutorialStep.findMany())[0], avatar_art_key: 'ui.guide.published' },
    ]);
    const resources = [
      { art_key: 'ui.guide.published', enabled: true, resource_status: 'physical', current_draft_version_id: null, published_version_id: 'published' },
      { art_key: 'ui.guide.warning', enabled: true, resource_status: 'physical', current_draft_version_id: 'warning', published_version_id: null },
    ];
    db.contentArtResource = {
      findMany: jest.fn().mockResolvedValue(resources),
      findUnique: jest.fn(({ where }: any) => resources.find(row => row.art_key === where.art_key) ?? null),
    };
    db.contentArtResourceVersion = { findMany: jest.fn().mockResolvedValue([
      { id: 'published', validation_status: 'published', storage_path: 'published.png', checksum: 'sha1', actual_width: 64, actual_height: 64 },
      { id: 'warning', validation_status: 'warning', storage_path: 'warning.png', checksum: 'sha2', actual_width: 64, actual_height: 64 },
    ]) };
    const tutorial: any = await new SnapshotGeneratorService(db).buildTutorialSnapshot('release8', 'R000008');
    expect(tutorial.referenceSummary.catalog.artKeys).toEqual(['ui.guide.published', 'ui.guide.warning']);
  });

  it('writes published/generated/history atomically and rejects historical overwrite', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-snapshot-'));
    try {
      const service = new SnapshotGeneratorService(fakeDb()); const snapshot = await service.buildTutorialSnapshot('release8', 'R000008');
      const paths = await service.writeTutorialSnapshot(snapshot, root);
      expect(fs.existsSync(paths.jsonPath)).toBe(true); expect(fs.existsSync(paths.tsPath)).toBe(true);
      expect(fs.existsSync(paths.historyJsonPath)).toBe(true);
      await expect(service.writeTutorialSnapshot(snapshot, root)).rejects.toThrow('历史');
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });

  it('journal rollback removes a newly created Tutorial history file', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-rollback-'));
    try {
      const service = new SnapshotGeneratorService(fakeDb()); const snapshot = await service.buildTutorialSnapshot('release8', 'R000008');
      const state = service.capturePublishedState({ resources: {} }, snapshot, root);
      const paths = await service.writeTutorialSnapshot(snapshot, root);
      service.restorePublishedState(state);
      expect(fs.existsSync(paths.historyJsonPath)).toBe(false);
      expect(fs.existsSync(paths.jsonPath)).toBe(false);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });

  it('keeps R000007 and tampered snapshots in legacy fallback without reading draft', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-published-'));
    try {
      write(root, 'content-store/published/content.snapshot.json', { releaseId: 'r7' });
      expect(readPublishedTutorial(root)).toMatchObject({ mode: 'LEGACY_FALLBACK' });
      const tutorial: any = await new SnapshotGeneratorService(fakeDb()).buildTutorialSnapshot('r8', 'R000008');
      write(root, 'content-store/published/content.snapshot.json', { releaseId: 'r8', tutorialSnapshotReleaseId: 'r8',
        tutorialSnapshotChecksum: tutorial.checksum, tutorialSnapshotPath: 'content-store/published/tutorial.snapshot.json' });
      write(root, 'content-store/published/tutorial.snapshot.json', { ...tutorial, flowCount: 9 });
      expect(readPublishedTutorial(root)).toMatchObject({ mode: 'LEGACY_FALLBACK', reason: 'tutorial-checksum-mismatch' });
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });

  it('rejects a self-checksummed snapshot with an illegal trigger', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tutorial-illegal-'));
    try {
      const tutorial: any = await new SnapshotGeneratorService(fakeDb()).buildTutorialSnapshot('r8', 'R000008');
      tutorial.flows[0].steps[0].triggerType = 'illegal.trigger';
      tutorial.checksum = digest({ ...tutorial, checksum: '' });
      write(root, 'content-store/published/content.snapshot.json', {
        releaseId: 'r8', tutorialSnapshotReleaseId: 'r8', tutorialSnapshotChecksum: tutorial.checksum,
        tutorialSnapshotPath: 'content-store/published/tutorial.snapshot.json',
      });
      write(root, 'content-store/published/tutorial.snapshot.json', tutorial);
      expect(readPublishedTutorial(root)).toEqual(expect.objectContaining({
        mode: 'LEGACY_FALLBACK', reason: 'tutorial-structure-invalid',
      }));
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });

  it('blocks invalid Tutorial targets before publish', async () => {
    const db = fakeDb(); const errors: any[] = [];
    const flows = await db.contentTutorialFlow.findMany(); const steps = await db.contentTutorialStep.findMany();
    steps[0] = { ...steps[0], target_id: 'ui.not-declared', force: true, fallback_action: null };
    validateTutorialContent(errors, { flows, steps, transitions: [], rules: [] },
      { stageIds: new Set(), campaignIds: new Set(['campaign_main_01']), artByKey: new Map() });
    expect(errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: 'tutorial', field: 'targetId' }),
      expect.objectContaining({ entityType: 'tutorial', field: 'fallbackAction' }),
    ]));
  });

  it('blocks a missing tutorial arrow Art before publish', async () => {
    const db = fakeDb(); const errors: any[] = [];
    const flows = await db.contentTutorialFlow.findMany(); const steps = await db.contentTutorialStep.findMany();
    steps[0] = { ...steps[0], arrow_json: { artKey: 'ui.tutorial.missing' } };
    validateTutorialContent(errors, { flows, steps, transitions: [], rules: [] },
      { stageIds: new Set(), campaignIds: new Set(['campaign_main_01']), artByKey: new Map() });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'arrowArtKey' })]));
  });
});

function fakeDb(): any {
  const flow = { id: 'flow', name: '引导', description: '', campaign_id: 'campaign_main_01', start_step_id: 'step', end_step_id: 'step', start_condition_json: {}, audience_json: {}, player_condition_json: {}, skip_unlock_features_json: [], skippable: true, allow_replay: false, priority: 1, enabled: true, schema_version: 1, content_version: 1, row_version: 1 };
  const step = { id: 'step', flow_id: 'flow', sort_order: 1, name: '完成', trigger_type: 'page.enter', trigger_json: {}, display_type: 'dialog', target_type: 'ui', target_id: 'home.campaign', title: '完成', body: '完成', mask_json: {}, arrow_json: {}, block_input: false, force: false, completion_type: 'target.click', completion_json: {}, terminal: true, enabled: true, content_version: 1, row_version: 1 };
  const rule = { id: 'rule', flow_id: 'flow', step_id: 'step', feature_id: 'feature.campaign', unlock_trigger: 'step.complete', condition_json: {}, unlock_on_skip: false, sort_order: 0, enabled: true, row_version: 1 };
  const d = (rows: any[]) => ({ findMany: jest.fn().mockResolvedValue(rows), findUnique: jest.fn(({ where }: any) =>
    rows.find(row => row.id === where.id || row.art_key === where.art_key) ?? null) });
  return { contentTutorialFlow: d([flow]), contentTutorialStep: d([step]), contentTutorialStepTransition: d([]), contentFeatureUnlockRule: d([rule]),
    contentStage: d([]), contentCampaign: d([{ id: 'campaign_main_01', enabled: true }]), contentArtResource: d([]),
    contentEnemyTemplate: d([]), contentBackgroundTheme: d([]), contentHeroVisual: d([]) };
}

function write(root: string, relative: string, value: unknown) {
  const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value));
}

function digest(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(sortValue(value), null, 2)).digest('hex');
}
function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((out: any, key) => {
    if (value[key] !== undefined) out[key] = sortValue(value[key]); return out;
  }, {});
}
