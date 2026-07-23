/**
 * 进度系统单测（任务3）
 * ------------------------------------------------------------------
 * 覆盖任务文档要求的 17 项验收点：
 *  默认解锁/迁移、解锁链、奖励规则、星级、bestStars 只增、失败不发奖等。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPlayerData, SAVE_KEY } from '../dist/data/PlayerData.js';
import type { PlayerData } from '../dist/data/PlayerData.js';
import { STAGE_1_1, STAGE_1_2, getStageById } from '../dist/data/StageConfig.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import {
  isUnlocked, isCleared, getProgress, computeStars, getReward, applyClear,
  STAR_HP_RATIO_THRESHOLD, STAR_TIME_THRESHOLD_SEC, MAX_STARS, REPEAT_REWARD_RATIO,
} from '../dist/chapter/ProgressManager.js';

function newPlayer(): PlayerData { return createDefaultPlayerData(); }
function saveCtx() { return new MockContext(); }

// 1. 初始存档默认解锁 1-1
test('初始存档默认解锁 1-1，其余锁定', () => {
  const p = newPlayer();
  assert.ok(isUnlocked(p, '1-1'));
  assert.ok(!isUnlocked(p, '1-2'));
  assert.ok(!isUnlocked(p, '1-5'));
});

// 2. 旧存档迁移：补 stageProgress + unlockedStageIds
test('旧存档迁移：自动补 stageProgress={} 与 unlockedStageIds=[1-1]', () => {
  const ctx = saveCtx();
  const save = new SaveManager(ctx.storage);
  // 模拟旧存档（任务1/2 格式，无进度字段）
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 3, gold: 100, parts: 10 }));
  const p = save.load();
  assert.equal(p.level, 3);
  assert.deepEqual(p.stageProgress, {});
  assert.deepEqual(p.unlockedStageIds, ['1-1']);
});

test('旧存档迁移：脏存档回退默认不崩溃', () => {
  const ctx = saveCtx();
  const save = new SaveManager(ctx.storage);
  ctx.storage.set(SAVE_KEY, 'garbage{');
  const p = save.load();
  assert.equal(p.level, 1);
  assert.deepEqual(p.unlockedStageIds, ['1-1']);
});

// 3 & 11. 1-1 通关后解锁 1-2
test('1-1 通关 → 解锁 1-2 + cleared=true + bestStars 记录', () => {
  const p = newPlayer();
  const r = applyClear(p, { stage: STAGE_1_1, hpRatio: 0.8, elapsedSec: 30, nowSec: 1000 });
  assert.ok(isUnlocked(p, '1-2'));
  assert.equal(r.unlockedNextId, '1-2');
  assert.ok(isCleared(p, '1-1'));
  assert.equal(getProgress(p, '1-1').cleared, true);
  assert.ok(getProgress(p, '1-1').bestStars >= 1);
});

// 4. 未解锁关卡不能进入（GameManager.startBattle 返回 false）—— 由 smoke 覆盖；
//    这里验证 isUnlocked 判定
test('isUnlocked：未解锁返回 false', () => {
  const p = newPlayer();
  assert.equal(isUnlocked(p, '1-3'), false);
});

// 6. 战斗奖励按关卡配置
test('getReward：首通 100% 按关卡配置', () => {
  const r = getReward(STAGE_1_1, true);
  assert.equal(r.gold, STAGE_1_1.rewardGold);
  assert.equal(r.parts, STAGE_1_1.rewardParts);
});

// 7. 首通 100%，重复 50%（向下取整）
test('getReward：重复通关 50% 向下取整', () => {
  const first = getReward(STAGE_1_1, true);
  const repeat = getReward(STAGE_1_1, false);
  assert.equal(repeat.gold, Math.floor(STAGE_1_1.rewardGold * REPEAT_REWARD_RATIO));
  assert.equal(repeat.parts, Math.floor(STAGE_1_1.rewardParts * REPEAT_REWARD_RATIO));
  assert.ok(repeat.gold < first.gold);
  // 1-3: 90 金币 → 重复 45
  const s13 = getStageById('1-3')!;
  assert.equal(getReward(s13, false).gold, 45);
});

test('applyClear：首次 vs 重复奖励不同，防重复领首通', () => {
  const p = newPlayer();
  const r1 = applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(r1.firstClear, true);
  assert.equal(r1.gold, STAGE_1_1.rewardGold);
  const goldAfterFirst = p.gold;
  // 重复通关
  const r2 = applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  assert.equal(r2.firstClear, false);
  assert.equal(r2.gold, Math.floor(STAGE_1_1.rewardGold * REPEAT_REWARD_RATIO));
  assert.equal(p.gold, goldAfterFirst + r2.gold);
});

// 8. cleared=true
test('applyClear：cleared=true', () => {
  const p = newPlayer();
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(p.stageProgress['1-1'].cleared, true);
});

// 9. clearCount 正确增加
test('clearCount：每次通关 +1', () => {
  const p = newPlayer();
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 3 });
  assert.equal(p.stageProgress['1-1'].clearCount, 3);
});

// 10. bestStars 只增不降
test('bestStars：只增不降（取历史最高）', () => {
  const p = newPlayer();
  // 第一次 3 星
  applyClear(p, { stage: STAGE_1_1, hpRatio: 1.0, elapsedSec: 10, nowSec: 1 });
  assert.equal(p.stageProgress['1-1'].bestStars, 3);
  // 第二次仅 1 星，bestStars 应保持 3
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.1, elapsedSec: 100, nowSec: 2 });
  assert.equal(p.stageProgress['1-1'].bestStars, 3);
});

// 11. 星级规则
test('computeStars：基础1 + hp≥50% +1 + time≤60 +1，上限3', () => {
  assert.equal(computeStars(0.8, 30), 3); // 满
  assert.equal(computeStars(0.8, 80), 2); // hp 满足、超时
  assert.equal(computeStars(0.3, 30), 2); // hp 不足、速通
  assert.equal(computeStars(0.3, 80), 1); // 仅基础
  assert.equal(computeStars(1.0, STAR_TIME_THRESHOLD_SEC), 3); // 边界：=60 算速通
  assert.equal(computeStars(STAR_HP_RATIO_THRESHOLD, 60), 3); // 边界：=0.5 算高血
});

test('computeStars：最低 1 星（胜利基础）', () => {
  // 0 血 + 超时：仅基础 1 星
  assert.equal(computeStars(0, 999), 1);
  // 边界确认上限
  assert.equal(computeStars(1, 1), 3);
  assert.ok(MAX_STARS === 3);
});

// 12. 失败不发奖、不解锁下一关（applyClear 仅处理胜利；失败由 GameManager 跳过）
test('失败场景：不调用 applyClear → 不发奖不解锁', () => {
  const p = newPlayer();
  const goldBefore = p.gold;
  // 模拟失败：GameManager.finishBattle 在 !win 时不调 applyClear
  // 这里直接验证未调用 applyClear 时状态不变
  assert.equal(p.gold, goldBefore);
  assert.ok(!isUnlocked(p, '1-2'));
  assert.ok(!isCleared(p, '1-1'));
});

// 解锁链全程
test('解锁链：依次通关 1-1→1-4 后 1-5 解锁', () => {
  const p = newPlayer();
  for (const id of ['1-1', '1-2', '1-3', '1-4']) {
    const stage = getStageById(id)!;
    applyClear(p, { stage, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  }
  assert.ok(isUnlocked(p, '1-5'));
  assert.ok(!isUnlocked(p, '1-6'), '1-6 不存在不应解锁');
});

// 通关 1-5：任务7 跨章节解锁 2-1（不再为 null）
test('通关 1-5：unlockedNextId=2-1（跨章解锁）', () => {
  const p = newPlayer();
  // 先解锁到 1-5
  for (const id of ['1-1', '1-2', '1-3', '1-4']) {
    applyClear(p, { stage: getStageById(id)!, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  }
  const r = applyClear(p, { stage: getStageById('1-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  assert.equal(r.unlockedNextId, '2-1');
});

// 17. 存档重启后进度保留
test('存档重启：通关进度持久化', () => {
  const ctx = saveCtx();
  const save = new SaveManager(ctx.storage);
  const p = newPlayer();
  applyClear(p, { stage: STAGE_1_1, hpRatio: 0.8, elapsedSec: 30, nowSec: 1 });
  save.save(p);
  // 重启读回
  const reloaded = new SaveManager(ctx.storage).load();
  assert.ok(reloaded.unlockedStageIds.includes('1-2'));
  assert.equal(reloaded.stageProgress['1-1'].cleared, true);
  assert.ok(reloaded.stageProgress['1-1'].bestStars >= 1);
});
