import { BadRequestException, ConflictException } from '@nestjs/common';
import { StageOrchestrationService } from '../src/modules/content/stage-orchestration.service';
import fs from 'node:fs';

describe('StageOrchestrationService', () => {
  it('blocks deleting an enemy spawn point referenced by waves', async () => {
    const prisma: any = prismaMock();
    prisma.contentStageSpawnPoint.findFirst.mockResolvedValue({ id: 'sp1', stage_id: 'stage_battle_1_1', spawn_point_key: 'enemy_left' });
    prisma.contentStageWaveEntry.findMany.mockResolvedValue([{ entry_key: 'e1', spawn_point_key: 'enemy_left', wave_id: 'w1' }]);
    prisma.contentStageOrchestrationWave.findMany.mockResolvedValue([{ id: 'w1', stage_id: 'stage_battle_1_1', wave_key: 'wave_1', name: '第1波' }]);
    const service = new StageOrchestrationService(prisma);

    await expect(service.removeSpawnPoint('stage_battle_1_1', 'enemy_left')).rejects.toMatchObject({
      response: {
        code: 'CONTENT_REFERENCE_EXISTS',
        references: [{ waveName: '第1波', entryId: 'e1', enemyTemplateId: undefined, field: 'spawnPointId' }],
      },
    });
  });

  it('rejects missing or invalid layer Art Keys before replacing children', async () => {
    const prisma: any = prismaMock();
    prisma.contentStage.findFirst.mockResolvedValue({ id: 'stage_battle_1_1' });
    prisma.contentArtResource.findMany.mockResolvedValue([]);
    const service = new StageOrchestrationService(prisma);

    await expect(service.saveOrchestration('stage_battle_1_1', sampleOrchestration()))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns structured rowVersion details for optimistic-lock conflicts', async () => {
    const prisma: any = prismaMock();
    prisma.contentStage.findFirst.mockResolvedValue({ id: 'stage_battle_1_1' });
    prisma.contentStageSceneLayout.findUnique.mockResolvedValue({ row_version: 8 });
    prisma.contentEnemyTemplate.findMany.mockResolvedValue([{ id: 'enemy_scrap_mouse_01' }]);
    prisma.contentArtResource.findMany.mockResolvedValue([{ art_key: 'map.trainingGround.floor', resource_status: 'physical' }]);
    const service = new StageOrchestrationService(prisma);
    const body = { ...sampleOrchestration(), rowVersion: 7 };

    await expect(service.saveOrchestration('stage_battle_1_1', body)).rejects.toMatchObject({
      response: { code: 'CONTENT_CONFLICT', localRowVersion: 7, remoteRowVersion: 8 },
    });
  });

  it('reports R000007 legacy fallback without returning MySQL draft waves', async () => {
    const service = new StageOrchestrationService(prismaMock());
    const exists = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readFile = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ releaseVersion: 'R000007' }));
    try {
      await expect((service as any).getPublishedOrchestration('stage_battle_1_1')).resolves.toMatchObject({
        enabled: false,
        releaseVersion: 'R000007',
        reason: 'content-snapshot-stage-orchestration-not-declared',
        orchestration: null,
      });
    } finally {
      readFile.mockRestore();
      exists.mockRestore();
    }
  });

  it('saves complete orchestration in one transaction and increments draft state', async () => {
    const prisma: any = prismaMock();
    prisma.contentStage.findFirst.mockResolvedValue({ id: 'stage_battle_1_1', mode: 'fixed_battle' });
    prisma.contentStageSceneLayout.findUnique.mockResolvedValue(null);
    prisma.contentEnemyTemplate.findMany.mockResolvedValue([{ id: 'enemy_scrap_mouse_01', enabled: true }]);
    prisma.contentArtResource.findMany.mockResolvedValue([{ art_key: 'map.trainingGround.floor', resource_status: 'physical' }]);
    prisma.contentStageSceneLayout.create.mockResolvedValue({ row_version: 1 });
    const service = new StageOrchestrationService(prisma);

    const result = await service.saveOrchestration('stage_battle_1_1', sampleOrchestration());

    expect(result.rowVersion).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.contentStageLayer.createMany).toHaveBeenCalled();
    expect(prisma.contentStageWaveEntry.createMany).toHaveBeenCalled();
    expect(prisma.contentSystemState.upsert).toHaveBeenCalled();
  });
});

function prismaMock(): any {
  const prisma: any = {
    contentStage: { findFirst: jest.fn() },
    contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([]) },
    contentArtResource: { findMany: jest.fn().mockResolvedValue([]) },
    contentStageSceneLayout: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    contentStageLayer: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn(), deleteMany: jest.fn() },
    contentStageSpawnPoint: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn(), createMany: jest.fn(), deleteMany: jest.fn(), updateMany: jest.fn() },
    contentStageOrchestrationWave: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn().mockResolvedValue({ id: 'wave_row_1' }), deleteMany: jest.fn() },
    contentStageWaveEntry: { findMany: jest.fn().mockResolvedValue([]), createMany: jest.fn(), deleteMany: jest.fn() },
    contentSystemState: { upsert: jest.fn() },
    contentChangeLog: { create: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };
  return prisma;
}

function sampleOrchestration(): any {
  return {
    layout: { canvasWidth: 750, canvasHeight: 1334, sceneMode: 'fixed-screen', backgroundThemeId: 'background_forging_corridor_v1', heroSpawnPointId: 'hero_start', battleArea: { x: 0, y: 160, width: 750, height: 980 }, camera: { mode: 'fixed' }, enabled: true },
    layers: [{ id: 'ground', name: '地面', type: 'ground', artKey: 'map.trainingGround.floor', order: 1, x: 0, y: 0, width: 750, height: 1334, scale: 1, opacity: 1, tiled: true, scrollsWithCamera: false, parallax: 0, enabled: true }],
    spawnPoints: [
      { id: 'hero_start', name: '主角', type: 'hero', x: 375, y: 980, facing: 'right', enabled: true },
      { id: 'enemy_left', name: '左侧入口', type: 'enemy', x: 120, y: 360, facing: 'right', enabled: true },
    ],
    waves: [{
      id: 'wave_1', order: 1, name: '第1波', startTrigger: { type: 'stage-start' }, startDelayMs: 0,
      maxAlive: 3, completionRule: { type: 'all-enemies-cleared' }, completionDelayMs: 0, nextWave: 'next', enabled: true,
      entries: [{ id: 'entry_1', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPointId: 'enemy_left', count: 2, spawnIntervalMs: 500, initialDelayMs: 0, elite: false, levelMultiplier: 1, hpMultiplier: 1, attackMultiplier: 1, enabled: true }],
    }],
    completionRule: { type: 'all-waves-cleared' },
    failureRule: { type: 'hero-dead' },
  };
}
