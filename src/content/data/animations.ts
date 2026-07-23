import type { AnimationClipDefinition } from '../models/AnimationClip';

export const ANIMATION_CLIPS = [
  {
    key: 'enemy.scrapMouse.idle.sequence01',
    name: '废料机械鼠待机测试序列',
    targetType: 'enemy',
    state: 'idle',
    defaultFrameDurationMs: 180,
    loop: true,
    playMode: 'loop',
    endBehavior: 'hold-last-frame',
    enabled: true,
    version: 1,
    frames: [
      { order: 0, artKey: 'enemy.scrapMouse.normal', note: '任务25样例帧A' },
      { order: 1, artKey: 'enemy.scrapBug.normal', note: '任务25样例帧B' },
    ],
  },
  {
    key: 'hero.mechaCat.move.sequence01',
    name: '机甲猫移动测试序列',
    targetType: 'hero',
    state: 'move',
    defaultFrameDurationMs: 160,
    loop: true,
    playMode: 'loop',
    endBehavior: 'hold-last-frame',
    enabled: true,
    version: 1,
    frames: [
      { order: 0, artKey: 'player.mechaCat.idle', note: '任务25样例帧A' },
      { order: 1, artKey: 'player.mechaCat.move', note: '任务25样例帧B' },
    ],
  },
] as const satisfies AnimationClipDefinition[];
