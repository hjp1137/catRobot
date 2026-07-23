import { BadRequestException } from '@nestjs/common';
import { StageProgressionService, progressionChecksum, resolvePublishedStageProgression } from '../src/modules/content/stage-progression.service';

describe('StageProgressionService', () => {
  it('saves objectives, reward pools and unlock rule in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentStageProgressionConfig.findUnique.mockResolvedValue(null);
    prisma.contentStageProgressionConfig.create.mockResolvedValue({ row_version: 1 });
    const service = new StageProgressionService(prisma);

    const result = await service.save('stage_battle_1_1', sample());

    expect(result.rowVersion).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.contentStageProgressionObjective.createMany).toHaveBeenCalled();
    expect(prisma.contentStageRewardEntry.createMany).toHaveBeenCalled();
    expect(prisma.contentStageUnlockRule.createMany).toHaveBeenCalled();
  });

  it('rejects missing reward references and cyclic unlock dependencies', async () => {
    const prisma = prismaMock();
    prisma.contentRewardDefinition.findMany.mockResolvedValue([]);
    prisma.contentStage.findMany.mockResolvedValue([
      { id: 'stage_battle_1_1' }, { id: 'stage_battle_1_2' },
    ]);
    prisma.contentStageUnlockRule.findMany.mockResolvedValue([
      { stage_id: 'stage_battle_1_2', prerequisite_stage_id: 'stage_battle_1_1' },
    ]);
    const service = new StageProgressionService(prisma);
    const body = sample();
    body.rewardPools[0].entries[0].rewardRefId = 'missing_equipment';
    body.unlockRules[0].prerequisiteStageId = 'stage_battle_1_2';

    await expect(service.save('stage_battle_1_1', body)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns structured optimistic-lock details', async () => {
    const prisma = prismaMock();
    prisma.contentStageProgressionConfig.findUnique.mockResolvedValue({ row_version: 4 });
    const service = new StageProgressionService(prisma);

    await expect(service.save('stage_battle_1_1', { ...sample(), rowVersion: 3 }))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 3, remoteRowVersion: 4 } });
  });

  it('rejects unsupported reward selection modes before persistence', async () => {
    const prisma = prismaMock();
    const service = new StageProgressionService(prisma);
    const body = sample();
    body.rewardPools[0].selectionMode = 'pick-one';

    await expect(service.save('stage_battle_1_1', body))
      .rejects.toMatchObject({ response: { code: 'STAGE_REWARD_INVALID' } });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects missing star thresholds for star-gated unlocks', async () => {
    const prisma = prismaMock();
    const service = new StageProgressionService(prisma);
    const body = sample();
    body.unlockRules[0].type = 'prerequisite-stars';
    delete body.unlockRules[0].requiredStars;

    await expect(service.save('stage_battle_1_1', body))
      .rejects.toMatchObject({ response: { code: 'STAGE_UNLOCK_INVALID' } });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('uses an atomic rowVersion compare-and-swap inside the save transaction', async () => {
    const prisma = prismaMock();
    prisma.contentStageProgressionConfig.findUnique.mockResolvedValue({ row_version: 4 });
    prisma.contentStageProgressionConfig.update.mockResolvedValue({ row_version: 5 });
    prisma.contentStageProgressionConfig.updateMany.mockResolvedValue({ count: 0 });
    const service = new StageProgressionService(prisma);

    await expect(service.save('stage_battle_1_1', { ...sample(), rowVersion: 4 }))
      .rejects.toMatchObject({ response: { code: 'CONTENT_CONFLICT', localRowVersion: 4 } });
    expect(prisma.contentStageProgressionConfig.updateMany).toHaveBeenCalled();
  });

  it('keeps published progression isolated by release and checksum', () => {
    const snapshot: any = { releaseId: 'release8', checksum: '', stages: [{ stageId: 'stage_battle_1_1' }] };
    snapshot.checksum = progressionChecksum(snapshot);
    expect(resolvePublishedStageProgression({}, snapshot, 'stage_battle_1_1').enabled).toBe(false);
    expect(resolvePublishedStageProgression({ stageProgressionReleaseId: 'release8', stageProgressionChecksum: 'wrong' }, snapshot, 'stage_battle_1_1').enabled).toBe(false);
    expect(resolvePublishedStageProgression({ releaseVersion: 'R000008', stageProgressionReleaseId: 'release8', stageProgressionChecksum: snapshot.checksum }, snapshot, 'stage_battle_1_1')).toMatchObject({ enabled: true, releaseVersion: 'R000008' });
  });
});

function prismaMock(): any {
  const prisma: any = {
    contentStage: { findFirst: jest.fn().mockResolvedValue({ id: 'stage_battle_1_1' }), findMany: jest.fn().mockResolvedValue([{ id: 'stage_battle_1_1' }, { id: 'stage_battle_1_2' }]) },
    contentRewardDefinition: { findMany: jest.fn().mockResolvedValue([
      { reward_type: 'equipment', reward_ref_id: 'rusty_claw', enabled: true },
      { reward_type: 'rune', reward_ref_id: 'cannon_rune_1', enabled: true },
    ]) },
    contentStageProgressionConfig: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    contentStageProgressionObjective: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn(), deleteMany: jest.fn() },
    contentStageRewardPool: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'pool_row' }), deleteMany: jest.fn() },
    contentStageRewardEntry: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn(), deleteMany: jest.fn() },
    contentStageUnlockRule: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn(), deleteMany: jest.fn() },
    contentSystemState: { upsert: jest.fn() }, contentChangeLog: { create: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };
  return prisma;
}

function sample(): any {
  return {
    rowVersion: 0, recommendedPower: 220, victoryText: '核心稳定', failureText: '重新校准',
    objectives: [
      { id: 'clear', name: '清除全部三波', type: 'clear-all-waves', required: true, params: {}, order: 1, displayText: '清除全部敌人', progressDisplay: 'waves', starEligible: true, enabled: true },
      { id: 'fast', name: '限时', type: 'complete-within-duration', required: false, params: { maxDurationSec: 60 }, order: 2, displayText: '60秒内通关', progressDisplay: 'timer', starEligible: true, enabled: true },
    ],
    rewardPools: [{ id: 'first', name: '首通', group: 'first-clear', selectionMode: 'all', enabled: true,
      entries: [{ id: 'equip', rewardType: 'equipment', rewardRefId: 'rusty_claw', minQuantity: 1, maxQuantity: 1, probability: 1, guaranteed: true, enabled: true }] }],
    unlockRules: [{ id: 'next', type: 'prerequisite-clear', prerequisiteStageId: 'stage_battle_1_1', requiredStars: 1, nextStageId: 'stage_battle_1_2', enabled: true }],
  };
}
