import { CampaignsService } from '../src/modules/content/campaigns.service';
import * as campaignServiceModule from '../src/modules/content/campaigns.service';
import { validateCampaignMap } from '../src/modules/content/campaign.validation';
import fs from 'node:fs';

describe('CampaignsService', () => {
  it('creates campaign and chapter through the existing draft state', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.create.mockResolvedValue({ id: 'main_campaign', row_version: 1 });
    prisma.contentCampaignChapter.create.mockResolvedValue({ id: 'chapter_scrap_border', row_version: 1 });
    const service = new CampaignsService(prisma);

    await service.createCampaign({ id: 'main_campaign', name: '主线战役' });
    await service.createChapter('main_campaign', { id: 'chapter_scrap_border', name: '第一章·废料边境' });

    expect(prisma.contentCampaign.create).toHaveBeenCalled();
    expect(prisma.contentCampaignChapter.create).toHaveBeenCalled();
    expect(prisma.contentSystemState.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it.each(['campaign', 'chapter'] as const)('rolls back %s create when markDraft fails', async entity => {
    const { prisma, committed } = rollbackCreateMock(entity);
    const service = new CampaignsService(prisma);

    const action = entity === 'campaign'
      ? service.createCampaign({ id: 'campaign_test', name: '测试战役' })
      : service.createChapter('campaign_test', { id: 'chapter_test', name: '测试章节' });

    await expect(action).rejects.toThrow('change log unavailable');
    expect(committed).toEqual([]);
  });

  it('does not insert a campaign when the transaction cannot start', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.create.mockResolvedValue({ id: 'campaign_test', row_version: 1 });
    prisma.$transaction.mockRejectedValue(new Error('transaction unavailable'));
    const service = new CampaignsService(prisma);

    await expect(service.createCampaign({ id: 'campaign_test', name: '测试战役' }))
      .rejects.toThrow('transaction unavailable');
    expect(prisma.contentCampaign.create).not.toHaveBeenCalled();
  });

  it('saves normalized nodes and connections in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_scrap_border', row_version: 2 });
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    prisma.contentStage.findMany.mockResolvedValue([{ id: 'stage_battle_1_1' }, { id: 'stage_explore_training_01' }]);
    prisma.contentArtResource.findMany.mockResolvedValue([{ art_key: 'map.trainingGround.floor', resource_status: 'physical' }]);
    const service = new CampaignsService(prisma);

    const result = await service.saveChapterMap('chapter_scrap_border', { ...sampleMap(), rowVersion: 2 });

    expect(result.rowVersion).toBe(3);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaignStageNode.createMany).toHaveBeenCalled();
    expect(prisma.contentCampaignNodeConnection.createMany).toHaveBeenCalled();
  });

  it('returns structured 409 when chapter rowVersion changed concurrently', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_scrap_border', row_version: 3 });
    const service = new CampaignsService(prisma);
    await expect(service.saveChapterMap('chapter_scrap_border', { ...sampleMap(), rowVersion: 2 }))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 2, remoteRowVersion: 3 } });
  });

  it('clones a campaign with chapters and maps into one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'main', name: '主线', row_version: 1, deleted_at: null });
    prisma.contentCampaignChapter.findMany.mockResolvedValue([{ id: 'chapter_1', campaign_id: 'main', chapter_no: 1, name: '第一章' }]);
    prisma.contentCampaignStageNode.findMany.mockResolvedValue([{ id: 'node_1', chapter_id: 'chapter_1', stage_id: 'stage_1', name: '1-1' }]);
    prisma.contentCampaignNodeConnection.findMany.mockResolvedValue([]);
    prisma.contentCampaign.create.mockResolvedValue({ id: 'main_copy' });
    const service = new CampaignsService(prisma);

    const result = await service.cloneCampaign('main', 'main_copy');

    expect(result).toMatchObject({ id: 'main_copy' });
    expect(prisma.contentCampaignChapter.create).toHaveBeenCalled();
    expect(prisma.contentCampaignStageNode.createMany).toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('updates chapter metadata with rowVersion fencing', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_1', row_version: 4 });
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await expect(service.updateChapter('chapter_1', { name: '第一章', rowVersion: 4 }))
      .resolves.toMatchObject({ id: 'chapter_1', rowVersion: 5 });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('updates campaign order through rowVersion fenced editing', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'main', row_version: 2 });
    prisma.contentCampaign.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await service.updateCampaign('main', { name: '主线', order: 9, rowVersion: 2 });

    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'main', row_version: 2 }), data: expect.objectContaining({ sort_order: 9 }),
    }));
    expect(prisma.contentChangeLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action_type: 'update' }),
    }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('clones a chapter and its map in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({
      id: 'chapter_1', campaign_id: 'main', chapter_no: 1, name: '第一章', deleted_at: null,
    });
    prisma.contentCampaignChapter.findMany.mockResolvedValue([{ chapter_no: 1 }]);
    prisma.contentCampaignStageNode.findMany.mockResolvedValue([
      { id: 'node_1', chapter_id: 'chapter_1', stage_id: 'stage_1', name: '1-1' },
    ]);
    prisma.contentCampaignNodeConnection.findMany.mockResolvedValue([]);
    const service = new CampaignsService(prisma);

    const result = await (service as any).cloneChapter('chapter_1', 'chapter_1_copy');

    expect(result).toMatchObject({ id: 'chapter_1_copy', rowVersion: 1 });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaignChapter.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ id: 'chapter_1_copy', campaign_id: 'main', row_version: 1 }),
    }));
    expect(prisma.contentCampaignStageNode.createMany).toHaveBeenCalled();
  });

  it('reorders chapters atomically with rowVersion fencing and change log', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findMany.mockResolvedValue([
      { id: 'chapter_1' }, { id: 'chapter_2' },
    ]);
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    const result = await (service as any).reorderChapters('main', { items: [
      { id: 'chapter_2', rowVersion: 3, chapterNo: 1 },
      { id: 'chapter_1', rowVersion: 4, chapterNo: 2 },
    ] });

    expect(result.items).toEqual([
      { id: 'chapter_2', chapterNo: 1, rowVersion: 4 },
      { id: 'chapter_1', chapterNo: 2, rowVersion: 5 },
    ]);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentChangeLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action_type: 'reorder' }),
    }));
  });

  it('enables and disables a chapter through rowVersion fenced updates', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_1', row_version: 6 });
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await (service as any).setChapterEnabled('chapter_1', false, 6);

    expect(prisma.contentCampaignChapter.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'chapter_1', row_version: 6 }), data: expect.objectContaining({ enabled: false }),
    }));
  });

  it('rejects campaign and chapter enable when the client rowVersion is stale', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'main', row_version: 4, deleted_at: null });
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_1', row_version: 6, deleted_at: null });
    prisma.contentCampaignChapter.findMany.mockResolvedValue([]);
    prisma.contentCampaign.updateMany.mockResolvedValue({ count: 1 });
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await expect((service as any).setCampaignEnabled('main', false, 3))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 3, remoteRowVersion: 4 } });
    await expect((service as any).setChapterEnabled('chapter_1', false, 5))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 5, remoteRowVersion: 6 } });
  });

  it('keeps campaign update writes outside the database when transaction startup fails', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'main', row_version: 2 });
    prisma.contentCampaign.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction.mockRejectedValue(new Error('transaction unavailable'));
    const service = new CampaignsService(prisma);

    await expect(service.updateCampaign('main', { name: '主线', rowVersion: 2 }))
      .rejects.toThrow('transaction unavailable');
    expect(prisma.contentCampaign.updateMany).not.toHaveBeenCalled();
    expect(prisma.contentChangeLog.create).not.toHaveBeenCalled();
  });

  it('soft deletes campaigns with client CAS and change log in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'test', row_version: 3, deleted_at: null });
    prisma.contentCampaignChapter.count.mockResolvedValue(0);
    prisma.contentCampaign.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await (service as any).removeCampaign('test', 3);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'test', row_version: 3, deleted_at: null },
      data: expect.objectContaining({ enabled: false, deleted_at: expect.any(Date), row_version: { increment: 1 } }),
    }));
    expect(prisma.contentChangeLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action_type: 'delete' }),
    }));
  });

  it('blocks campaign deletion when an active Tutorial Flow references it', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'main', row_version: 3, deleted_at: null });
    prisma.contentCampaignChapter.count.mockResolvedValue(0);
    prisma.contentTutorialFlow.count.mockResolvedValue(1);
    await expect(new CampaignsService(prisma).removeCampaign('main', 3)).rejects.toMatchObject({
      response: { code: 'CONTENT_REFERENCE_EXISTS', references: [expect.objectContaining({ entity: 'tutorialFlow' })] },
    });
    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { row_version: { increment: 0 } },
    }));
  });

  it('locks campaign first and checks all references in a Serializable delete transaction', async () => {
    const prisma = prismaMock(); const events: string[] = [];
    prisma.contentCampaign.updateMany.mockImplementation(() => { events.push('lock-or-cas'); return { count: 1 }; });
    prisma.contentCampaign.findUnique.mockImplementation(() => { events.push('read'); return { id: 'main', row_version: 2, deleted_at: null }; });
    prisma.contentCampaignChapter.count.mockImplementation(() => { events.push('chapters'); return 0; });
    prisma.contentTutorialFlow.count.mockImplementation(() => { events.push('tutorial-flow'); return 0; });
    prisma.contentTutorialStep.count.mockImplementation(() => { events.push('tutorial-target'); return 0; });
    await new CampaignsService(prisma).removeCampaign('main', 2);
    expect(events[0]).toBe('lock-or-cas');
    expect(events.indexOf('read')).toBeLessThan(events.indexOf('tutorial-flow'));
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: 'Serializable' }));
  });

  it('rejects stale campaign delete instead of deleting the current row', async () => {
    const prisma = prismaMock();
    prisma.contentCampaign.findUnique.mockResolvedValue({ id: 'test', row_version: 4, deleted_at: null });
    prisma.contentCampaignChapter.count.mockResolvedValue(0);
    const service = new CampaignsService(prisma);

    await expect((service as any).removeCampaign('test', 3))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 3, remoteRowVersion: 4 } });
    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaign.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { row_version: { increment: 0 } },
    }));
  });

  it('protects a campaign default chapter even when it has no nodes', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_default', row_version: 2, deleted_at: null });
    prisma.contentCampaignStageNode.count.mockResolvedValue(0);
    prisma.contentCampaign.count.mockResolvedValue(1);
    const service = new CampaignsService(prisma);

    await expect((service as any).removeChapter('chapter_default', 2))
      .rejects.toMatchObject({ response: { code: 'CONTENT_REFERENCE_EXISTS' } });
    expect(prisma.contentCampaignChapter.updateMany).not.toHaveBeenCalled();
  });

  it('soft deletes an unreferenced chapter with client CAS in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({ id: 'chapter_test', row_version: 5, deleted_at: null });
    prisma.contentCampaignStageNode.count.mockResolvedValue(0);
    prisma.contentCampaign.count.mockResolvedValue(0);
    prisma.contentCampaignChapter.updateMany.mockResolvedValue({ count: 1 });
    const service = new CampaignsService(prisma);

    await (service as any).removeChapter('chapter_test', 5);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentCampaignChapter.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'chapter_test', row_version: 5, deleted_at: null },
      data: expect.objectContaining({ chapter_no: -1, enabled: false, deleted_at: expect.any(Date), row_version: { increment: 1 } }),
    }));
    prisma.contentCampaignChapter.create.mockResolvedValue({ id: 'chapter_replacement', chapter_no: 1 });
    await service.createChapter('main', { id: 'chapter_replacement', chapterNo: 1, name: '替代章节' });
    expect(prisma.contentCampaignChapter.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ campaign_id: 'main', chapter_no: 1 }),
    }));
  });

  it('keeps archived numbers disjoint from reorder temporary numbers under the unique key', async () => {
    const { prisma, rows } = uniqueChapterNoPrisma();
    const service = new CampaignsService(prisma);

    await service.removeChapter('chapter_old', 1);
    await expect(service.reorderChapters('main', { items: [
      { id: 'chapter_2', rowVersion: 1, chapterNo: 1 },
      { id: 'chapter_1', rowVersion: 1, chapterNo: 2 },
    ] })).resolves.toMatchObject({ items: [
      { id: 'chapter_2', chapterNo: 1 }, { id: 'chapter_1', chapterNo: 2 },
    ] });

    const occupied = rows.map(row => `${row.campaign_id}:${row.chapter_no}`);
    expect(new Set(occupied).size).toBe(occupied.length);
    expect(rows.find(row => row.id === 'chapter_old')?.chapter_no).toBeGreaterThanOrEqual(-1_073_741_824);
  });

  it('serializes concurrent chapter archive allocation with the campaign row lock', async () => {
    const { prisma, rows, events } = concurrentArchivePrisma();
    const service = new CampaignsService(prisma);

    await Promise.all([
      service.removeChapter('chapter_a', 1), service.removeChapter('chapter_b', 1),
    ]);

    expect(rows.map(row => row.chapter_no).sort((a, b) => a - b)).toEqual([-2, -1]);
    for (const id of ['chapter_a', 'chapter_b']) {
      expect(events.indexOf(`lock:${id}`)).toBeLessThan(events.indexOf(`find:${id}`));
      expect(events.indexOf(`find:${id}`)).toBeLessThan(events.indexOf(`update:${id}`));
    }
    expect(events.indexOf('unlock:chapter_a')).toBeLessThan(events.indexOf('lock:chapter_b'));
  });

  it('locks the campaign as the first tx operation and performs later reads in Serializable tx', async () => {
    const { prisma, txCalls } = mvccArchivePrisma();
    const service = new CampaignsService(prisma);

    await service.removeChapter('chapter_test', 4);

    expect(prisma.contentCampaignChapter.findUnique).toHaveBeenCalledWith({
      where: { id: 'chapter_test' }, select: { campaign_id: true },
    });
    expect(txCalls).toEqual([
      'campaign-lock', 'chapter-read', 'node-count', 'default-count',
      'archive-read', 'chapter-cas', 'draft-state', 'change-log',
    ]);
    expect(prisma.contentCampaignStageNode.count).not.toHaveBeenCalled();
    expect(prisma.contentCampaign.count).not.toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({
      isolationLevel: 'Serializable',
    }));
  });

  it('rejects chapter archive when the reserved archive interval is exhausted', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findUnique.mockResolvedValue({
      id: 'chapter_test', campaign_id: 'main', row_version: 1, deleted_at: null,
    });
    prisma.contentCampaign.updateMany.mockResolvedValue({ count: 1 });
    prisma.contentCampaignStageNode.count.mockResolvedValue(0);
    prisma.contentCampaign.count.mockResolvedValue(0);
    prisma.contentCampaignChapter.findFirst.mockResolvedValue({ chapter_no: -1_073_741_824 });
    const service = new CampaignsService(prisma);

    await expect(service.removeChapter('chapter_test', 1)).rejects.toMatchObject({
      response: { code: 'CAMPAIGN_CHAPTER_ARCHIVE_CAPACITY_EXCEEDED' },
    });
    expect(prisma.contentCampaignChapter.updateMany).not.toHaveBeenCalled();
  });

  it('guards reorder capacity without allocating an items array', () => {
    const guard = (campaignServiceModule as any).assertChapterReorderCapacity;
    const capacity = (campaignServiceModule as any).CHAPTER_REORDER_TEMP_CAPACITY;

    expect(typeof guard).toBe('function');
    expect(() => guard(capacity)).not.toThrow();
    expect(() => guard(capacity + 1)).toThrow(expect.objectContaining({
      response: { code: 'CAMPAIGN_CHAPTER_ORDER_CAPACITY_EXCEEDED' },
    }));
  });

  it.each([
    ['duplicate ids', [
      { id: 'chapter_1', rowVersion: 1, chapterNo: 1 },
      { id: 'chapter_1', rowVersion: 1, chapterNo: 2 },
    ]],
    ['incomplete active set', [
      { id: 'chapter_1', rowVersion: 1, chapterNo: 1 },
    ]],
    ['duplicate chapter numbers', [
      { id: 'chapter_1', rowVersion: 1, chapterNo: 1 },
      { id: 'chapter_2', rowVersion: 1, chapterNo: 1 },
    ]],
    ['non-positive chapter numbers', [
      { id: 'chapter_1', rowVersion: 1, chapterNo: 0 },
      { id: 'chapter_2', rowVersion: 1, chapterNo: 2 },
    ]],
  ])('rejects reorder with %s before writing', async (_label, items) => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findMany.mockResolvedValue([{ id: 'chapter_1' }, { id: 'chapter_2' }]);
    const service = new CampaignsService(prisma);

    await expect(service.reorderChapters('main', { items }))
      .rejects.toMatchObject({ response: { code: 'CAMPAIGN_CHAPTER_ORDER_INVALID' } });
    expect(prisma.contentCampaignChapter.updateMany).not.toHaveBeenCalled();
  });

  it('rolls back reorder when a final CAS update affects no row', async () => {
    const prisma = prismaMock();
    prisma.contentCampaignChapter.findMany.mockResolvedValue([{ id: 'chapter_1' }, { id: 'chapter_2' }]);
    prisma.contentCampaignChapter.updateMany
      .mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const service = new CampaignsService(prisma);

    await expect(service.reorderChapters('main', { items: [
      { id: 'chapter_1', rowVersion: 1, chapterNo: 1 },
      { id: 'chapter_2', rowVersion: 1, chapterNo: 2 },
    ] })).rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT' } });
    expect(prisma.contentChangeLog.create).not.toHaveBeenCalled();
  });

  it('reports R000007 legacy fallback without exposing MySQL draft nodes', async () => {
    const prisma = prismaMock();
    const service = new CampaignsService(prisma);
    const readFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ releaseVersion: 'R000007' }));
    try {
      await expect(service.getPublished()).resolves.toMatchObject({
        enabled: false, releaseVersion: 'R000007', reason: 'content-snapshot-campaign-not-declared', campaigns: [],
      });
      expect(prisma.contentCampaign.findMany).not.toHaveBeenCalled();
    } finally {
      readFile.mockRestore();
    }
  });

  it('rejects self links, duplicates and maps without a start-to-end path', () => {
    expect(() => validateCampaignMap({ ...sampleMap(), connections: [{ id: 'self', fromNodeId: 'node_1', toNodeId: 'node_1', enabled: true }] }))
      .toThrow('CAMPAIGN_CONNECTION_SELF');
    const duplicate = sampleMap(); duplicate.connections.push({ ...duplicate.connections[0], id: 'duplicate' });
    expect(() => validateCampaignMap(duplicate)).toThrow('CAMPAIGN_CONNECTION_DUPLICATE');
    expect(() => validateCampaignMap({ ...sampleMap(), connections: [] })).toThrow('CAMPAIGN_PATH_MISSING');
  });
});

function prismaMock(): any {
  const prisma: any = {
    contentCampaign: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    contentCampaignChapter: { create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
    contentCampaignNodeConnection: { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn(), createMany: jest.fn() },
    contentTutorialFlow: { count: jest.fn().mockResolvedValue(0) },
    contentTutorialStep: { count: jest.fn().mockResolvedValue(0) },
    contentStage: { findMany: jest.fn().mockResolvedValue([]) },
    contentArtResource: { findMany: jest.fn().mockResolvedValue([]) },
    contentSystemState: { upsert: jest.fn() }, contentChangeLog: { create: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };
  return prisma;
}

function rollbackCreateMock(entity: 'campaign' | 'chapter') {
  const prisma = prismaMock(); const committed: any[] = [];
  const direct = entity === 'campaign' ? prisma.contentCampaign : prisma.contentCampaignChapter;
  direct.create.mockImplementation(async ({ data }: any) => {
    committed.push(data); return { ...data, row_version: 1 };
  });
  prisma.contentChangeLog.create.mockRejectedValue(new Error('change log unavailable'));
  prisma.$transaction.mockImplementation(async (work: any) => {
    const staged: any[] = [];
    const tx = {
      ...prisma,
      contentCampaign: { ...prisma.contentCampaign },
      contentCampaignChapter: { ...prisma.contentCampaignChapter },
      contentChangeLog: { create: jest.fn().mockRejectedValue(new Error('change log unavailable')) },
    };
    const delegate = entity === 'campaign' ? tx.contentCampaign : tx.contentCampaignChapter;
    delegate.create = jest.fn(async ({ data }: any) => { staged.push(data); return { ...data, row_version: 1 }; });
    const result = await work(tx); committed.push(...staged); return result;
  });
  return { prisma, committed };
}

function uniqueChapterNoPrisma() {
  const prisma = prismaMock();
  const rows: any[] = [
    { id: 'chapter_1', campaign_id: 'main', chapter_no: 1, row_version: 1, deleted_at: null },
    { id: 'chapter_2', campaign_id: 'main', chapter_no: 2, row_version: 1, deleted_at: null },
    { id: 'chapter_old', campaign_id: 'main', chapter_no: 3, row_version: 1, deleted_at: null },
  ];
  prisma.contentCampaignChapter.findUnique.mockImplementation(({ where }: any) =>
    Promise.resolve(rows.find(row => row.id === where.id)));
  prisma.contentCampaignChapter.findMany.mockImplementation(({ where }: any) => Promise.resolve(
    rows.filter(row => row.campaign_id === where.campaign_id && row.deleted_at === null)
      .map(row => ({ id: row.id })),
  ));
  prisma.contentCampaignChapter.findFirst.mockImplementation(({ where }: any) => {
    const range = where.chapter_no;
    const found = rows.filter(row => row.campaign_id === where.campaign_id && row.chapter_no < (range.lt ?? 0)
      && (range.gte == null || row.chapter_no >= range.gte) && (range.lte == null || row.chapter_no <= range.lte))
      .sort((a, b) => a.chapter_no - b.chapter_no)[0];
    return Promise.resolve(found ? { chapter_no: found.chapter_no } : null);
  });
  prisma.contentCampaignChapter.updateMany.mockImplementation(({ where, data }: any) => {
    const row = rows.find(item => item.id === where.id && item.campaign_id === (where.campaign_id ?? item.campaign_id)
      && item.row_version === where.row_version && item.deleted_at === where.deleted_at);
    if (!row) return Promise.resolve({ count: 0 });
    if (data.chapter_no != null && rows.some(item => item !== row && item.campaign_id === row.campaign_id && item.chapter_no === data.chapter_no)) {
      return Promise.reject(Object.assign(new Error('unique constraint'), { code: 'P2002' }));
    }
    Object.assign(row, { chapter_no: data.chapter_no ?? row.chapter_no,
      deleted_at: data.deleted_at ?? row.deleted_at, enabled: data.enabled ?? row.enabled });
    if (data.row_version?.increment) row.row_version += data.row_version.increment;
    return Promise.resolve({ count: 1 });
  });
  prisma.contentCampaignStageNode.count.mockResolvedValue(0);
  prisma.contentCampaign.count.mockResolvedValue(0);
  return { prisma, rows };
}

function concurrentArchivePrisma() {
  const prisma = prismaMock(); const events: string[] = [];
  const rows: any[] = [
    { id: 'chapter_a', campaign_id: 'main', chapter_no: 1, row_version: 1, deleted_at: null },
    { id: 'chapter_b', campaign_id: 'main', chapter_no: 2, row_version: 1, deleted_at: null },
  ];
  const locatorQueue: string[] = [];
  prisma.contentCampaignChapter.findUnique.mockImplementation(({ where }: any) => {
    locatorQueue.push(where.id); return Promise.resolve(rows.find(row => row.id === where.id));
  });
  let lockTail = Promise.resolve();
  prisma.contentCampaignStageNode.count.mockResolvedValue(0);
  prisma.contentCampaign.count.mockResolvedValue(0);
  prisma.$transaction.mockImplementation(async (work: any) => {
    let releaseLock: (() => void) | undefined; let locked = false;
    const chapterId = locatorQueue.shift() ?? '';
    const tx: any = { ...prisma,
      contentCampaign: { ...prisma.contentCampaign },
      contentCampaignChapter: { ...prisma.contentCampaignChapter } };
    tx.contentCampaignChapter.findUnique = jest.fn(({ where }: any) => {
      return Promise.resolve(rows.find(row => row.id === where.id));
    });
    tx.contentCampaign.updateMany = jest.fn(async () => {
      const previous = lockTail;
      lockTail = new Promise<void>(resolve => { releaseLock = resolve; });
      await previous; locked = true; events.push(`lock:${chapterId}`);
      return { count: 1 };
    });
    tx.contentCampaignChapter.findFirst = jest.fn(() => {
      if (!locked) throw new Error('archive read before campaign lock');
      events.push(`find:${chapterId}`);
      const found = rows.filter(row => row.deleted_at && row.chapter_no < 0)
        .sort((a, b) => a.chapter_no - b.chapter_no)[0];
      return Promise.resolve(found ? { chapter_no: found.chapter_no } : null);
    });
    tx.contentCampaignChapter.updateMany = jest.fn(({ where, data }: any) => {
      if (!locked) throw new Error('archive update before campaign lock');
      events.push(`update:${chapterId}`);
      const row = rows.find(item => item.id === where.id && item.row_version === where.row_version && item.deleted_at === null);
      if (!row) return Promise.resolve({ count: 0 });
      if (rows.some(item => item !== row && item.campaign_id === row.campaign_id && item.chapter_no === data.chapter_no)) {
        return Promise.reject(Object.assign(new Error('unique constraint'), { code: 'P2002' }));
      }
      row.chapter_no = data.chapter_no; row.deleted_at = data.deleted_at; row.row_version++;
      return Promise.resolve({ count: 1 });
    });
    try { return await work(tx); }
    finally {
      if (locked) events.push(`unlock:${chapterId}`);
      releaseLock?.();
    }
  });
  return { prisma, rows, events };
}

function mvccArchivePrisma() {
  const prisma = prismaMock(); const txCalls: string[] = [];
  prisma.contentCampaignChapter.findUnique.mockResolvedValue({ campaign_id: 'main' });
  const tx: any = {
    contentCampaign: {
      updateMany: jest.fn(async () => { txCalls.push('campaign-lock'); return { count: 1 }; }),
      count: jest.fn(async () => { txCalls.push('default-count'); return 0; }),
    },
    contentCampaignChapter: {
      findUnique: jest.fn(async () => { txCalls.push('chapter-read'); return {
        id: 'chapter_test', campaign_id: 'main', chapter_no: 1, row_version: 4, deleted_at: null,
      }; }),
      findFirst: jest.fn(async () => { txCalls.push('archive-read'); return null; }),
      updateMany: jest.fn(async () => { txCalls.push('chapter-cas'); return { count: 1 }; }),
    },
    contentCampaignStageNode: {
      count: jest.fn(async () => { txCalls.push('node-count'); return 0; }),
    },
    contentSystemState: {
      upsert: jest.fn(async () => { txCalls.push('draft-state'); return {}; }),
    },
    contentChangeLog: {
      create: jest.fn(async () => { txCalls.push('change-log'); return {}; }),
    },
  };
  prisma.$transaction.mockImplementation((work: any) => work(tx));
  return { prisma, txCalls };
}

function sampleMap(): any {
  return {
    chapter: { name: '第一章·废料边境', chapterNo: 1, subtitle: '', description: '', backgroundArtKey: 'map.trainingGround.floor', canvasWidth: 1000, canvasHeight: 600, viewportX: 0, viewportY: 0, enabled: true, completionText: '完成' },
    nodes: [
      { id: 'node_1', stageId: 'stage_battle_1_1', name: '铸造通道', x: 180, y: 320, type: 'normal', isStart: true, isEnd: false, order: 1, recommendedPower: 220, enabled: true },
      { id: 'node_2', stageId: 'stage_explore_training_01', name: '训练场', x: 720, y: 240, type: 'exploration', isStart: false, isEnd: true, order: 2, recommendedPower: 260, enabled: true },
    ],
    connections: [{ id: 'path_1', fromNodeId: 'node_1', toNodeId: 'node_2', pathType: 'normal', oneWay: true, order: 1, enabled: true }],
  };
}
