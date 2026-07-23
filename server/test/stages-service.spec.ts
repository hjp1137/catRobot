import { ConflictException } from '@nestjs/common';
import { StagesService } from '../src/modules/content/stages.service';

describe('StagesService list', () => {
  it('returns stage children for visual resource summaries', async () => {
    const prisma = {
      contentStage: { findMany: jest.fn().mockResolvedValue([{ id: 'stage_1', name: '1-1', mode: 'fixed_battle', hero_visual_template_id: 'hero_1', background_theme_id: 'bg_1' }]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave_1', stage_id: 'stage_1', wave_no: 1, sort_order: 0 }]) },
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ stage_wave_id: 'wave_1', enemy_template_id: 'enemy_1', enemy_count: 2 }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
      contentStageObjective: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new StagesService(prisma as any);

    const rows = await service.list();

    expect(rows[0]).toMatchObject({
      id: 'stage_1',
      waves: [{ wave: 1, groups: [{ enemyTemplateId: 'enemy_1', count: 2 }] }],
    });
  });
});

describe('StagesService progression references', () => {
  it('blocks deletion when unlock rules reference the stage', async () => {
    const prisma: any = {
      contentStage: { findUnique: jest.fn().mockResolvedValue({ id: 'stage_1', deleted_at: null }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      contentStageUnlockRule: { findMany: jest.fn().mockResolvedValue([{ id: 'rule1', stage_id: 'stage_2', prerequisite_stage_id: 'stage_1', next_stage_id: 'stage_3' }]) },
      $transaction: jest.fn((work: any) => work(prisma)),
    };
    const service = new StagesService(prisma);
    await expect(service.remove('stage_1')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('blocks deletion when a campaign node references the stage', async () => {
    const prisma: any = {
      contentStage: { findUnique: jest.fn().mockResolvedValue({ id: 'stage_1', deleted_at: null }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      contentStageUnlockRule: { findMany: jest.fn().mockResolvedValue([]) },
      contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([
        { id: 'node_1', chapter_id: 'chapter_1', stage_id: 'stage_1', name: '铸造通道' },
      ]) },
      $transaction: jest.fn((work: any) => work(prisma)),
    };
    const service = new StagesService(prisma);

    await expect(service.remove('stage_1')).rejects.toMatchObject({
      response: { code: 'CONTENT_REFERENCE_EXISTS' },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('blocks deletion when a tutorial step references the stage', async () => {
    const prisma: any = {
      contentStage: { findUnique: jest.fn().mockResolvedValue({ id: 'stage_1', deleted_at: null }), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      contentStageUnlockRule: { findMany: jest.fn().mockResolvedValue([]) },
      contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([]) },
      contentTutorialStep: { findMany: jest.fn().mockResolvedValue([{ id: 'tutorial.battle', flow_id: 'tutorial.main', stage_id: 'stage_1' }]) },
      $transaction: jest.fn((work: any) => work(prisma)),
    };
    await expect(new StagesService(prisma).remove('stage_1')).rejects.toMatchObject({
      response: { code: 'CONTENT_REFERENCE_EXISTS', references: [expect.objectContaining({ entity: 'tutorialStep' })] },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('locks the stage before checking references in a Serializable transaction', async () => {
    const events: string[] = [];
    const prisma: any = {
      contentStage: {
        updateMany: jest.fn(() => { events.push('lock'); return { count: 1 }; }),
        findUnique: jest.fn(() => { events.push('read'); return { id: 'stage_1', deleted_at: null }; }),
      },
      contentStageUnlockRule: { findMany: jest.fn(() => { events.push('progression'); return []; }) },
      contentCampaignStageNode: { findMany: jest.fn(() => { events.push('campaign'); return []; }) },
      contentTutorialStep: { findMany: jest.fn(() => { events.push('tutorial'); return [
        { id: 'step', flow_id: 'flow', target_type: 'stage', target_id: 'stage_1' },
      ]; }) },
    };
    prisma.$transaction = jest.fn((work: any) => work(prisma));
    await expect(new StagesService(prisma).remove('stage_1')).rejects.toMatchObject({ response: { code: 'CONTENT_REFERENCE_EXISTS' } });
    expect(events[0]).toBe('lock');
    expect(events.indexOf('read')).toBeLessThan(events.indexOf('tutorial'));
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: 'Serializable' }));
  });
});
