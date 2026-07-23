/**
 * 关卡配置完整性单测（任务3）
 * ------------------------------------------------------------------
 * 覆盖 StageConfig 工具函数、章节配置、敌人配置、配置驱动生成的正确性。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGE_CONFIGS,
  getStageById, getAllStages, getChapterStages, getFirstStage,
  getNextStageId, getStageTotalEnemies, CHAPTER1_STAGE_IDS, FIRST_STAGE_ID,
} from '../dist/data/StageConfig.js';
import { ENEMY_CONFIGS, MECHANICAL_MOUSE, ELITE_MOUSE, MECHA_RAT_KING, getEnemyConfig } from '../dist/data/EnemyConfig.js';
import { CHAPTER_1, getChapterById, FIRST_CHAPTER_ID } from '../dist/chapter/ChapterConfig.js';
import { FIXED_SCREEN_WAVE_STAGE } from './fixtures/fixedScreenWaveFixture.ts';

test('第一章共 5 个关卡，id 有序（任务13：总 15 关含第三章）', () => {
  assert.deepEqual(CHAPTER1_STAGE_IDS, ['1-1', '1-2', '1-3', '1-4', '1-5']);
  assert.equal(getAllStages().length, 15);
  assert.equal(getChapterStages('chapter1').length, 5);
});

test('getStageById / getFirstStage / FIRST_STAGE_ID', () => {
  assert.equal(getFirstStage().id, '1-1');
  assert.equal(FIRST_STAGE_ID, '1-1');
  assert.equal(getStageById('1-3')?.name, '废料堆伏击');
  assert.equal(getStageById('not-exist'), undefined);
});

test('getNextStageId：顺序推导，任务13 跨章节 1-5→2-1，2-5→3-1，3-5→null', () => {
  assert.equal(getNextStageId('1-1'), '1-2');
  assert.equal(getNextStageId('1-4'), '1-5');
  assert.equal(getNextStageId('1-5'), '2-1'); // 任务7 跨章
  assert.equal(getNextStageId('2-4'), '2-5');
  assert.equal(getNextStageId('2-5'), '3-1'); // 任务13 跨章
  assert.equal(getNextStageId('3-4'), '3-5');
  assert.equal(getNextStageId('3-5'), null);  // 真正末关
  assert.equal(getNextStageId('unknown'), null);
});

test('getChapterStages：按章节过滤', () => {
  const stages = getChapterStages('chapter1');
  assert.equal(stages.length, 5);
  assert.equal(stages[0].id, '1-1');
});

test('解锁链：每关 unlockAfter 指向上一关（首关无）', () => {
  assert.equal(getStageById('1-1')?.unlockAfter, undefined);
  assert.equal(STAGE_CONFIGS['1-2'].unlockAfter, '1-1');
  assert.equal(STAGE_CONFIGS['1-3'].unlockAfter, '1-2');
  assert.equal(STAGE_CONFIGS['1-4'].unlockAfter, '1-3');
  assert.equal(STAGE_CONFIGS['1-5'].unlockAfter, '1-4');
});

test('getStageTotalEnemies：固定屏波次夹具为 12', () => {
  assert.equal(FIXED_SCREEN_WAVE_STAGE.waves?.length, 3);
  assert.equal(getStageTotalEnemies(FIXED_SCREEN_WAVE_STAGE), 12);
});

test('正式 1-5 保持 Boss 关标签', () => {
  assert.equal(getStageById('1-5')?.isBossStage, true);
});

test('推荐战力递增', () => {
  const powers = CHAPTER1_STAGE_IDS.map(id => getStageById(id)!.recommendedPower);
  for (let i = 1; i < powers.length; i++) {
    assert.ok(powers[i] > powers[i - 1], `战力应递增: ${powers}`);
  }
});

test('奖励递增', () => {
  const golds = CHAPTER1_STAGE_IDS.map(id => getStageById(id)!.rewardGold);
  for (let i = 1; i < golds.length; i++) {
    assert.ok(golds[i] > golds[i - 1]);
  }
});

// ---------- 敌人配置 ----------
test('敌人配置：普通鼠 + 强化鼠 + 鼠王 Boss', () => {
  assert.equal(MECHANICAL_MOUSE.id, 'mouse');
  assert.equal(MECHANICAL_MOUSE.variant, 'normal');
  assert.equal(ELITE_MOUSE.id, 'elite_mouse');
  assert.equal(ELITE_MOUSE.variant, 'elite');
  assert.equal(MECHA_RAT_KING.id, 'mecha_rat_king');
  assert.equal(MECHA_RAT_KING.variant, 'boss');
  assert.ok(ELITE_MOUSE.maxHp > MECHANICAL_MOUSE.maxHp, '强化鼠血量更高');
  assert.ok(MECHA_RAT_KING.maxHp > ELITE_MOUSE.maxHp, '鼠王血量最高');
});

test('getEnemyConfig：未知 id 回退普通鼠', () => {
  assert.equal(getEnemyConfig('unknown').id, 'mouse');
  assert.equal(getEnemyConfig('elite_mouse').maxHp, 80);
});

test('ENEMY_CONFIGS 注册两种敌人', () => {
  assert.ok(ENEMY_CONFIGS.mouse);
  assert.ok(ENEMY_CONFIGS.elite_mouse);
});

// ---------- 章节配置 ----------
test('章节配置：第一章 5 关', () => {
  assert.equal(CHAPTER_1.stageIds.length, 5);
  assert.equal(getChapterById(FIRST_CHAPTER_ID)?.name, '第一章：废弃训练场');
  assert.equal(getChapterById('not-exist'), undefined);
});
