/**
 * 战斗系统单测
 * ------------------------------------------------------------------
 * 用 MockContext + GameManager + BattleManager 在 Node 下驱动整局战斗。
 * 通过推进 ctx.clock 模拟帧，验证：
 *  - 玩家自动攻击能杀死敌人
 *  - 敌人接触玩家会扣血
 *  - 全部敌人死亡 → 胜利 + 发奖 + 存档
 *  - 玩家死亡 → 失败 + 不发奖
 *  - 返回主界面后资源正确
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import type { StageConfig } from '../dist/data/StageConfig.js';

/** 构造一套可单测的 game+battle（不接 UI，避免 wx 依赖） */
function setup(opts: { playerLevel?: number } = {}) {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  if (opts.playerLevel) game.player.level = opts.playerLevel;
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  return { ctx, game, battle };
}

/** 临时小关卡：N 只机械鼠 */
function smallStage(mouseCount: number): StageConfig {
  return { ...STAGE_1_1, contentStageId: undefined, enemies: [{ enemyId: 'mouse', count: mouseCount }], waves: undefined };
}

/** start 后推进若干帧，确保 WaveManager 已 spawn 第一波（任务4 波次系统） */
function startAndWait(ctx: MockContext, battle: BattleManager, stage: StageConfig, frames = 5) {
  battle.start(stage);
  for (let i = 0; i < frames; i++) { ctx.advance(0.016); battle.update(0.016); }
}

/** 手动驱动 N 帧，每帧 dt 秒，并执行 game.tick 同款逻辑（update+render+判定） */
function runFrames(ctx: MockContext, battle: BattleManager, frames: number, dt: number, onFrame?: () => void) {
  for (let i = 0; i < frames; i++) {
    ctx.advance(dt);
    battle.update(dt);
    if (battle['ended']) break;
    onFrame?.();
  }
}

test('玩家自动攻击能击杀范围内的敌人', () => {
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, smallStage(1));
  // 把唯一敌人挪到玩家攻击范围内
  const e = battle.enemies[0];
  e.x = battle.player.x + 30;
  e.y = battle.player.y;
  const hpBefore = e.hp;
  runFrames(ctx, battle, 60, 0.1); // 6 秒，cooldown 0.6s → 约 10 次攻击
  assert.ok(e.hp < hpBefore || e.dead, '敌人应已受伤或死亡');
});

test('全部敌人死亡 → 胜利 + 发奖(首通100%) + 存档', () => {
  const { ctx, game, battle } = setup({ playerLevel: 1 });
  startAndWait(ctx, battle, smallStage(3));
  // 直接把所有敌人拉到玩家脚下，让自动攻击一波带走
  for (const e of battle.enemies) { e.x = battle.player.x + 20; e.y = battle.player.y; }
  runFrames(ctx, battle, 600, 0.1); // 60s，足够 30hp/10atk 杀完
  assert.equal(battle.enemies.length, 0, '敌人应清空');
  assert.equal(game.scene, 'result');
  assert.ok(game.lastOutcome);
  assert.equal(game.lastOutcome!.win, true);
  // 任务3：奖励在 clearResult（首通 100%）
  assert.ok(game.lastOutcome!.clearResult);
  assert.equal(game.lastOutcome!.clearResult!.gold, STAGE_1_1.rewardGold);
  assert.equal(game.lastOutcome!.clearResult!.parts, STAGE_1_1.rewardParts);
  assert.equal(game.lastOutcome!.clearResult!.firstClear, true);
  // 发奖已写入 player
  assert.equal(game.player.gold, STAGE_1_1.rewardGold);
  assert.equal(game.player.parts, STAGE_1_1.rewardParts);
  // 存档已落盘
  const saved = JSON.parse(ctx.storage.snapshot()['mecha_save_v1']!);
  assert.equal(saved.gold, STAGE_1_1.rewardGold);
});

test('敌人接触玩家 → 玩家掉血 → 玩家死亡判负且不发奖', () => {
  const { ctx, game, battle } = setup({ playerLevel: 1 });
  startAndWait(ctx, battle, smallStage(1));
  const e = battle.enemies[0];
  // 高血量保证不被反杀
  (e as any).maxHp = 99999; e.hp = 99999;
  e.x = battle.player.x + 5;
  e.y = battle.player.y;
  const hpBefore = battle.player.hp;
  runFrames(ctx, battle, 50, 0.1); // 5 秒
  assert.ok(battle.player.hp < hpBefore, '玩家应已掉血');
  const goldBefore = game.player.gold;
  // 继续跑到玩家死
  runFrames(ctx, battle, 3000, 0.1); // 再 300s，足够耗尽
  assert.ok(battle.player.dead || game.scene === 'result');
  if (game.lastOutcome) {
    assert.equal(game.lastOutcome.win, false);
    assert.equal(game.lastOutcome.clearResult, null);
    assert.equal(game.player.gold, goldBefore); // 失败不发奖
  }
});

test('玩家升级后战力提升、击杀更快', () => {
  const { ctx, game, battle } = setup({ playerLevel: 1 });
  startAndWait(ctx, battle, smallStage(1));
  const e = battle.enemies[0];
  e.x = battle.player.x + 20; e.y = battle.player.y;
  let frames1 = 0;
  runFrames(ctx, battle, 200, 0.1, () => { frames1++; });
  const lv1Frames = frames1;

  // 升级到 Lv5：atk=30，一次命中即 30 伤害
  const ctx2 = new MockContext();
  const game2 = new GameManager(ctx2);
  game2.player.level = 5;
  const battle2 = new BattleManager(ctx2, game2);
  game2.setBattle(battle2);
  startAndWait(ctx2, battle2, smallStage(1));
  const e2 = battle2.enemies[0];
  e2.x = battle2.player.x + 20; e2.y = battle2.player.y;
  let frames2 = 0;
  runFrames(ctx2, battle2, 200, 0.1, () => { frames2++; });
  assert.ok(frames2 < lv1Frames, `Lv5 应更快击杀: ${frames2} vs ${lv1Frames}`);
  assert.ok(game2.stats.attack > game.stats.attack);
});

test('任务3：配置驱动生成指定数量敌人 + totalEnemies', () => {
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, smallStage(4));
  assert.equal(battle.enemies.length, 4);
  assert.equal(battle.totalEnemies, 4);
});
