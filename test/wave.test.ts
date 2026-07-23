/**
 * 波次系统单测（任务4）
 * ------------------------------------------------------------------
 * 覆盖 WaveManager：单波兼容、多波推进、波次切换、最后一波判胜利。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WaveManager } from '../dist/battle/WaveManager.js';
import type { StageWaveConfig } from '../dist/data/StageConfig.js';
import { FIXED_SCREEN_SINGLE_ENEMY_STAGE, FIXED_SCREEN_WAVE_STAGE } from './fixtures/fixedScreenWaveFixture.ts';

/** 模拟 spawn：记录被生成的波 */
function makeSpawnLog() {
  const log: StageWaveConfig[] = [];
  return { log, cb: (w: StageWaveConfig) => log.push(w) };
}

test('WaveManager：单波关卡（无 waves）自动转为单波', () => {
  const wm = new WaveManager(FIXED_SCREEN_SINGLE_ENEMY_STAGE);
  assert.equal(wm.totalWaves, 1);
  assert.equal(wm.isMultiWave, false);
});

test('WaveManager：固定屏多波夹具保持三波', () => {
  const wm = new WaveManager(FIXED_SCREEN_WAVE_STAGE);
  assert.equal(wm.totalWaves, 3);
  assert.equal(wm.isMultiWave, true);
});

test('初始进入第一波并生成', () => {
  const wm = new WaveManager(FIXED_SCREEN_SINGLE_ENEMY_STAGE);
  const { log, cb } = makeSpawnLog();
  wm.update(0.016, 0, cb);
  assert.equal(log.length, 1, '应生成第一波');
  assert.equal(wm.currentWaveIndex, 0);
});

test('当前波敌人清空后进入下一波', () => {
  const wm = new WaveManager(FIXED_SCREEN_WAVE_STAGE);
  const { log, cb } = makeSpawnLog();
  // 第一波生成
  wm.update(0.016, 0, cb);
  // 模拟第一波敌人存活
  wm.update(0.016, 3, cb);
  assert.equal(log.length, 1);
  // 第一波清空 → 触发下一波判定（带 spawnDelay）
  wm.update(0.016, 0, cb);
  assert.equal(wm.currentWaveIndex, 1);
  // 等待 spawnDelay 过后生成第二波（先减 delay，再下一帧生成）
  wm.update(2, 0, cb);   // 递减 delay 到 <0
  wm.update(0.016, 0, cb); // 生成第二波
  assert.equal(log.length, 2);
});

test('最后一波清空 → isLastWaveCleared=true', () => {
  const wm = new WaveManager(FIXED_SCREEN_SINGLE_ENEMY_STAGE);
  const { cb } = makeSpawnLog();
  wm.update(0.016, 0, cb); // 生成
  assert.equal(wm.isLastWaveCleared, false);
  wm.update(0.016, 0, cb); // 清空 → 最后一波 cleared
  assert.equal(wm.isLastWaveCleared, true);
});

test('波次切换提示 message 被记录并可读取', () => {
  const wm = new WaveManager(FIXED_SCREEN_WAVE_STAGE);
  const { cb } = makeSpawnLog();
  wm.update(0.016, 0, cb);
  assert.equal(wm.currentMessage, '固定屏第一波机械鼠出现！');
});
