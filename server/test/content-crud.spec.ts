import { ContentCrudService } from '../src/modules/content/content-crud.service';

describe('ContentCrudService references', () => {
  it('returns stage ids and names for enemy references', async () => {
    const prisma = {
      contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([{ id: 'group1', stage_wave_id: 'wave1', enemy_template_id: 'enemy_scrap_mouse_01' }]) },
      contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([{ id: 'spawn1', stage_id: 'stage_explore_training_01', group_key: 'spawn_a', enemy_template_id: 'enemy_scrap_mouse_01' }]) },
      contentStageWave: { findMany: jest.fn().mockResolvedValue([{ id: 'wave1', stage_id: 'stage_battle_1_1', wave_no: 1 }]) },
      contentStage: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'stage_battle_1_1', name: '固定屏 1-1' },
          { id: 'stage_explore_training_01', name: '训练场' },
        ]),
      },
    };
    const service = new ContentCrudService(prisma as any);

    const refs = await service.references('enemies', 'enemy_scrap_mouse_01');

    expect(refs).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'stage-wave-enemy-group', stageId: 'stage_battle_1_1', stageName: '固定屏 1-1', waveNo: 1 }),
      expect.objectContaining({ type: 'explore-spawn-group', stageId: 'stage_explore_training_01', stageName: '训练场' }),
    ]));
  });
});
