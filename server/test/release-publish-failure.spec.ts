import { ConflictException } from '@nestjs/common';
import { ReleasesService } from '../src/modules/releases/releases.service';
import { validateTutorialContent } from '../src/modules/content-validation/tutorial-content.validation';

describe('ReleasesService publish failure guard', () => {
  it('does not create release or write snapshot when validation fails', async () => {
    const prisma: any = {
      contentRelease: { create: jest.fn(), count: jest.fn() },
      contentReleaseSnapshot: { create: jest.fn() },
      contentSystemState: { update: jest.fn() },
    };
    const validation = {
      validate: jest.fn().mockResolvedValue({
        valid: false,
        errorCount: 1,
        warningCount: 0,
        errors: [{ entityType: 'stage', entityId: 'stage_battle_1_1', field: 'waves[0]', message: '敌人不存在' }],
        warnings: [],
      }),
    };
    const snapshots = { buildSnapshot: jest.fn(), writeSnapshot: jest.fn() };
    const service = new ReleasesService(prisma as any, validation as any, snapshots as any);

    await expect(service.publish('tester')).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.contentRelease.create).not.toHaveBeenCalled();
    expect(prisma.contentReleaseSnapshot.create).not.toHaveBeenCalled();
    expect(snapshots.buildSnapshot).not.toHaveBeenCalled();
    expect(snapshots.writeSnapshot).not.toHaveBeenCalled();
    expect(prisma.contentSystemState.update).not.toHaveBeenCalled();
  });

  it('blocks release creation when tutorial avatar draft version is invalid', async () => {
    const errors: any[] = [];
    const flow = { id: 'flow', name: '引导', campaign_id: null, start_step_id: 'step', end_step_id: 'step',
      enabled: true, skippable: true, allow_replay: false, priority: 1, schema_version: 1, content_version: 1 };
    const step = { id: 'step', flow_id: 'flow', sort_order: 1, trigger_type: 'page.enter', trigger_json: {},
      display_type: 'dialog', target_type: 'ui', target_id: 'home.campaign', title: '', body: '', mask_json: {},
      arrow_json: {}, block_input: false, force: false, completion_type: 'target.click', completion_json: {},
      terminal: true, enabled: true, avatar_art_key: 'ui.guide' };
    validateTutorialContent(errors, { flows: [flow], steps: [step], transitions: [], rules: [] }, {
      stageIds: new Set(), campaignIds: new Set(),
      artByKey: new Map([['ui.guide', { art_key: 'ui.guide', resource_status: 'physical', enabled: true,
        current_draft_version_id: 'bad' }]]),
      versionById: new Map([['bad', { id: 'bad', validation_status: 'invalid', storage_path: 'missing.png' }]]),
    });
    const prisma: any = { contentRelease: { create: jest.fn() } };
    const validation = { validate: jest.fn().mockResolvedValue({ valid: false, errors }) };

    await expect(new ReleasesService(prisma, validation as any, {} as any).publish('tester'))
      .rejects.toBeInstanceOf(ConflictException);
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'avatarArtKey' })]));
    expect(prisma.contentRelease.create).not.toHaveBeenCalled();
  });

  it.each([
    ['published-only', {
      current_draft_version_id: null, published_version_id: 'published',
    }, {
      id: 'published', validation_status: 'published', storage_path: 'guide.png', checksum: 'sha',
      actual_width: 64, actual_height: 64,
    }],
    ['warning draft', {
      current_draft_version_id: 'warning', published_version_id: null,
    }, {
      id: 'warning', validation_status: 'warning', storage_path: 'guide.png', checksum: 'sha',
      actual_width: 64, actual_height: 64,
    }],
  ])('accepts %s tutorial avatar version', (_name, selected, version) => {
    const errors: any[] = [];
    validateTutorialContent(errors, tutorialRows(), {
      stageIds: new Set(), campaignIds: new Set(),
      artByKey: new Map([['ui.guide', { art_key: 'ui.guide', resource_status: 'physical', enabled: true,
        ...selected }]]),
      versionById: new Map([[version.id, version]]),
    });
    expect(errors.filter(error => error.field === 'avatarArtKey')).toEqual([]);
  });

  it('prefers an invalid tutorial draft over a valid published version', () => {
    const errors: any[] = [];
    validateTutorialContent(errors, tutorialRows(), {
      stageIds: new Set(), campaignIds: new Set(),
      artByKey: new Map([['ui.guide', { art_key: 'ui.guide', resource_status: 'physical', enabled: true,
        current_draft_version_id: 'draft', published_version_id: 'published' }]]),
      versionById: new Map([
        ['draft', { id: 'draft', validation_status: 'invalid', storage_path: 'draft.png', checksum: 'bad', actual_width: 64, actual_height: 64 }],
        ['published', { id: 'published', validation_status: 'published', storage_path: 'published.png', checksum: 'ok', actual_width: 64, actual_height: 64 }],
      ]),
    });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'avatarArtKey' })]));
  });

  it('generates the next release version from the highest stored release number', async () => {
    const prisma: any = {
      contentRelease: {
        count: jest.fn().mockResolvedValue(5),
        findFirst: jest.fn().mockResolvedValue({ release_version: 'R000010' }),
        create: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'rel_11', ...data })),
        update: jest.fn().mockResolvedValue({}),
      },
      contentReleaseSnapshot: { create: jest.fn().mockResolvedValue({}) },
      contentSystemState: { update: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn((fn: any) => fn(prisma)),
    };
    const validation = { validate: jest.fn().mockResolvedValue({ valid: true }) };
    const snapshots = {
      buildAnimationManifestSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', clips: [] }),
      buildStageOrchestrationSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', stages: [] }),
      buildStageProgressionSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', stages: [], rewardCatalog: [] }),
      buildCampaignSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', campaigns: [] }),
      buildTutorialSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', flows: [] }),
      buildArtManifestSnapshot: jest.fn().mockResolvedValue({ releaseId: 'rel_11', releaseVersion: 'R000011', resources: {} }),
      buildSnapshot: jest.fn().mockResolvedValue({ checksum: 'snapshot_checksum' }),
      capturePublishedState: jest.fn().mockReturnValue({ files: [], artFiles: [] }),
      restorePublishedState: jest.fn(),
      writePublishJournal: jest.fn(), clearPublishJournal: jest.fn(),
      writeAnimationManifestSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'animation.json', tsPath: 'animation.ts' }),
      writeStageOrchestrationSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'stage.json', tsPath: 'stage.ts' }),
      writeStageProgressionSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'progression.json', tsPath: 'progression.ts' }),
      writeCampaignSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'campaign.json', tsPath: 'campaign.ts' }),
      writeTutorialSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'tutorial.json', tsPath: 'tutorial.ts', historyJsonPath: 'history.json' }),
      writeArtManifestSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'art.json', tsPath: 'art.ts' }),
      writeSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'content.json', tsPath: 'content.ts' }),
      markArtVersionsPublished: jest.fn().mockResolvedValue(undefined),
    };
    const service = new ReleasesService(prisma as any, validation as any, snapshots as any);

    const result = await service.publish('tester');

    expect(result.releaseVersion).toBe('R000011');
    expect(prisma.contentRelease.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ release_version: 'R000011' }),
    }));
    expect(snapshots.buildArtManifestSnapshot).toHaveBeenCalledWith('rel_11', 'R000011');
    expect(snapshots.writeAnimationManifestSnapshot).toHaveBeenCalled();
    expect(snapshots.writeCampaignSnapshot).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ maxWait: 10000, timeout: 60000 }));
  });

  it('restores every published snapshot when the database publish transaction fails', async () => {
    const tx = {
      contentRelease: { update: jest.fn().mockRejectedValue(new Error('db-down')) },
      contentSystemState: { update: jest.fn() },
    };
    const prisma: any = {
      contentRelease: { findFirst: jest.fn().mockResolvedValue({ release_version: 'R000007' }),
        create: jest.fn().mockResolvedValue({ id: 'rel_8' }), update: jest.fn().mockResolvedValue({}) },
      contentReleaseSnapshot: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn((fn: any) => fn(tx)),
    };
    const validation = { validate: jest.fn().mockResolvedValue({ valid: true }) };
    const snapshots: any = {
      buildAnimationManifestSnapshot: jest.fn().mockResolvedValue({ clips: [] }),
      buildStageOrchestrationSnapshot: jest.fn().mockResolvedValue({ stages: [] }),
      buildStageProgressionSnapshot: jest.fn().mockResolvedValue({ stages: [] }),
      buildCampaignSnapshot: jest.fn().mockResolvedValue({ campaigns: [] }),
      buildTutorialSnapshot: jest.fn().mockResolvedValue({ flows: [] }),
      buildArtManifestSnapshot: jest.fn().mockResolvedValue({ resources: {} }),
      buildSnapshot: jest.fn().mockResolvedValue({ checksum: 'new' }),
      capturePublishedState: jest.fn().mockReturnValue({ marker: 'old' }),
      writePublishJournal: jest.fn(), clearPublishJournal: jest.fn(),
      writeArtManifestSnapshot: jest.fn().mockResolvedValue({}), writeAnimationManifestSnapshot: jest.fn().mockResolvedValue({}),
      writeStageOrchestrationSnapshot: jest.fn().mockResolvedValue({}), writeStageProgressionSnapshot: jest.fn().mockResolvedValue({}),
      writeCampaignSnapshot: jest.fn().mockResolvedValue({}),
      writeTutorialSnapshot: jest.fn().mockResolvedValue({}),
      writeSnapshot: jest.fn().mockResolvedValue({ jsonPath: 'content.json' }), markArtVersionsPublished: jest.fn(),
      restorePublishedState: jest.fn(),
    };

    await expect(new ReleasesService(prisma, validation as any, snapshots).publish('tester')).rejects.toThrow('db-down');
    expect(snapshots.restorePublishedState).toHaveBeenCalledWith({ marker: 'old' });
    expect(prisma.contentRelease.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) }));
  });

  it('marks the release failed when snapshot building throws', async () => {
    const prisma: any = {
      contentRelease: {
        findFirst: jest.fn().mockResolvedValue({ release_version: 'R000007' }),
        create: jest.fn().mockResolvedValue({ id: 'rel_8' }),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const validation = { validate: jest.fn().mockResolvedValue({ valid: true }) };
    const snapshots = {
      buildAnimationManifestSnapshot: jest.fn().mockRejectedValue(new Error('snapshot-build-failed')),
    };

    await expect(new ReleasesService(prisma, validation as any, snapshots as any).publish('tester'))
      .rejects.toThrow('snapshot-build-failed');

    expect(prisma.contentRelease.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'rel_8' }, data: expect.objectContaining({ status: 'failed' }),
    }));
  });

  it('recovers an interrupted pre-commit publish from its persistent journal on startup', async () => {
    const prisma: any = {
      contentRelease: { findUnique: jest.fn().mockResolvedValue({ id: 'rel_8', status: 'publishing' }), update: jest.fn() },
      contentSystemState: { findUnique: jest.fn().mockResolvedValue({ current_release_id: 'rel_7' }) },
    };
    const snapshots: any = {
      listPublishJournals: jest.fn().mockReturnValue([{ releaseId: 'rel_8', state: { marker: 'old' } }]),
      restorePublishedState: jest.fn(), clearPublishJournal: jest.fn(),
    };
    const service = new ReleasesService(prisma, {} as any, snapshots);

    await service.onModuleInit();

    expect(snapshots.restorePublishedState).toHaveBeenCalledWith({ marker: 'old' });
    expect(snapshots.clearPublishJournal).toHaveBeenCalledWith('rel_8');
    expect(prisma.contentRelease.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) }));
  });
});

function tutorialRows() {
  return {
    flows: [{ id: 'flow', name: '引导', campaign_id: null, start_step_id: 'step', end_step_id: 'step',
      enabled: true, skippable: true, allow_replay: false, priority: 1, schema_version: 1, content_version: 1 }],
    steps: [{ id: 'step', flow_id: 'flow', sort_order: 1, trigger_type: 'page.enter', trigger_json: {},
      display_type: 'dialog', target_type: 'ui', target_id: 'home.campaign', title: '引导', body: '打开主线', mask_json: {},
      arrow_json: {}, block_input: false, force: false, completion_type: 'target.click', completion_json: {},
      terminal: true, enabled: true, avatar_art_key: 'ui.guide' }],
    transitions: [], rules: [],
  };
}
