import {
  CHAPTER_ONE_CAMPAIGN,
  CHAPTER_ONE_CONNECTIONS,
  CHAPTER_ONE_NODES,
  CHAPTER_ONE_STAGES,
} from '../prisma/chapter-one-blueprint';
import { syncStageMapLayers } from '../prisma/seed-chapter-one';

describe('Chapter one backend blueprint', () => {
  it('defines ten ordered backend stages with a boss finale', () => {
    expect(CHAPTER_ONE_STAGES).toHaveLength(10);
    expect(CHAPTER_ONE_STAGES.map(stage => stage.order)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(new Set(CHAPTER_ONE_STAGES.map(stage => stage.id)).size).toBe(10);
    expect(CHAPTER_ONE_STAGES[9]).toMatchObject({ order: 10, boss: true });
    expect(CHAPTER_ONE_STAGES[9].waves.at(-1)?.entries[0]).toMatchObject({
      enemyTemplateId: 'enemy_scrap_mouse_king_01',
      count: 1,
    });
    expect(CHAPTER_ONE_STAGES.every(stage => stage.exploration.spawnGroups.length >= 4)).toBe(true);
    expect(CHAPTER_ONE_STAGES[9].exploration.spawnGroups.some(
      group => group.enemyTemplateId === 'enemy_scrap_mouse_king_01',
    )).toBe(true);
    expect(CHAPTER_ONE_STAGES.every(stage => stage.orchestration.layout.exploreHud.layout === 'tactical')).toBe(true);
  });

  it('connects ten campaign nodes into one sequential unlock chain', () => {
    expect(CHAPTER_ONE_CAMPAIGN.chapterNo).toBe(1);
    expect(CHAPTER_ONE_NODES).toHaveLength(10);
    expect(CHAPTER_ONE_CONNECTIONS).toHaveLength(9);
    expect(CHAPTER_ONE_CONNECTIONS.every(connection => ['normal', 'locked', 'completed'].includes(connection.pathType))).toBe(true);
    expect(CHAPTER_ONE_NODES[0].isStart).toBe(true);
    expect(CHAPTER_ONE_NODES[9]).toMatchObject({ isEnd: true, type: 'boss' });
    for (let index = 0; index < CHAPTER_ONE_CONNECTIONS.length; index += 1) {
      expect(CHAPTER_ONE_CONNECTIONS[index]).toMatchObject({
        fromNodeId: CHAPTER_ONE_NODES[index].id,
        toNodeId: CHAPTER_ONE_NODES[index + 1].id,
      });
    }
  });

  it('configures objectives, rewards and next-stage unlocks for every section', () => {
    for (const [index, stage] of CHAPTER_ONE_STAGES.entries()) {
      expect(stage.progression.objectives.length).toBeGreaterThanOrEqual(3);
      expect(stage.progression.rewardPools.length).toBeGreaterThanOrEqual(2);
      if (index === 0) expect(stage.progression.unlockRules[0].type).toBe('default-unlocked');
      if (index < 9) expect(stage.progression.unlockRules.some(rule => rule.nextStageId === CHAPTER_ONE_STAGES[index + 1].id)).toBe(true);
    }
  });

  it('keeps the ten-node mobile campaign route readable without node overlap', () => {
    for (let index = 1; index < CHAPTER_ONE_NODES.length; index += 1) {
      const previous = CHAPTER_ONE_NODES[index - 1];
      const current = CHAPTER_ONE_NODES[index];
      expect(Math.hypot(current.x - previous.x, current.y - previous.y)).toBeGreaterThanOrEqual(240);
    }
  });

  it('uses one real top-down map and bounded collision geometry in every stage', () => {
    for (const stage of CHAPTER_ONE_STAGES) {
      const visible = stage.orchestration.layers.filter(layer => layer.enabled && layer.type !== 'collision');
      const collisions = stage.orchestration.layers.filter(layer => layer.enabled && layer.type === 'collision');
      expect(stage.backgroundThemeId).toBe('background_training_ground_v1');
      expect(visible).toHaveLength(1);
      expect(visible[0]).toMatchObject({
        type: 'ground', artKey: 'map.trainingGround.overhead',
        x: 0, y: 0, width: 1800, height: 2800,
      });
      expect(collisions).toHaveLength(4);
      for (const layer of collisions) {
        expect(layer.x).toBeGreaterThanOrEqual(0);
        expect(layer.y).toBeGreaterThanOrEqual(0);
        expect(layer.x + layer.width).toBeLessThanOrEqual(stage.worldWidth);
        expect(layer.y + layer.height).toBeLessThanOrEqual(stage.worldHeight);
      }
    }
  });

  it('replaces map layers when an existing stage is seeded again', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const createMany = jest.fn().mockResolvedValue({ count: 5 });
    const prisma = {
      $transaction: (work: any) => work({ contentStageLayer: { deleteMany, createMany } }),
    };
    await syncStageMapLayers(prisma, CHAPTER_ONE_STAGES[1]);
    expect(deleteMany).toHaveBeenCalledWith({ where: { stage_id: 'stage_ch1_02' } });
    expect(createMany).toHaveBeenCalledTimes(1);
    const rows = createMany.mock.calls[0][0].data;
    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({
      stage_id: 'stage_ch1_02', art_key: 'map.trainingGround.overhead', layer_type: 'ground',
    });
  });
});
