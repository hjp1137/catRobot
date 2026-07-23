import type { StageConfig } from '../../src/data/StageConfig.ts';

/** 固定屏调试专用；不继承任何正式 StageConfig 或已发布内容。 */
export const FIXED_SCREEN_WAVE_STAGE: StageConfig = {
  id: 'fixture-fixed-screen-wave',
  chapterId: 'fixture-debug-chapter',
  name: '固定屏波次夹具',
  subtitle: '仅供调试入口验证',
  recommendedPower: 1,
  enemies: [],
  waves: [
    { id: 'fixture-wave-1', name: '第一波', message: '固定屏第一波机械鼠出现！', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 0 },
    { id: 'fixture-wave-2', name: '第二波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
    { id: 'fixture-wave-3', name: '第三波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
  ],
  rewardGold: 0,
  rewardParts: 0,
  spawnMargin: 60,
};

export const FIXED_SCREEN_SINGLE_ENEMY_STAGE: StageConfig = {
  id: 'fixture-fixed-screen-single',
  chapterId: 'fixture-debug-chapter',
  name: '固定屏单敌人夹具',
  recommendedPower: 1,
  enemies: [{ enemyId: 'mouse', count: 1 }],
  rewardGold: 0,
  rewardParts: 0,
  spawnMargin: 60,
};
