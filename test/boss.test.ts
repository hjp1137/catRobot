/**
 * Boss 关与技能单测（任务4）
 * ------------------------------------------------------------------
 * 用 MockContext + GameManager + BattleManager 驱动 1-5 Boss 关，覆盖：
 *  Boss 配置 variant=boss、Boss 登场后血条可获取、震荡冲击冷却/预警/范围伤害、
 *  Boss 死亡后技能停止、首次通关 1-5 显示第一章完成。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_5 } from '../dist/data/StageConfig.js';
import { MECHA_RAT_KING, ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { BossSkill, SHOCKWAVE } from '../dist/battle/BossSkill.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';

function setup() {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  // 预解锁 1-5 + 升到足够等级便于通关测试
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];
  game.player.level = 10; // atk=10+9*5=55, hp=120+9*20=300，足以打 Boss
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  return { ctx, game, battle };
}

function runFrames(ctx: MockContext, battle: BattleManager, frames: number, dt = 0.1) {
  for (let i = 0; i < frames; i++) {
    ctx.advance(dt);
    battle.update(dt);
    if ((battle as any).ended) break;
  }
}

// Boss 敌人配置
test('Boss 配置：机械鼠王 variant=boss，血量 220', () => {
  assert.equal(MECHA_RAT_KING.variant, 'boss');
  assert.equal(MECHA_RAT_KING.maxHp, 220);
  assert.equal(MECHA_RAT_KING.id, 'mecha_rat_king');
  assert.ok(ENEMY_CONFIGS.mecha_rat_king);
});

// Boss 关启动后能推进到 Boss 登场波（直接清除前两波敌人触发后续 spawn）
test('1-5 推进至第三波 Boss 登场，currentBoss 可获取', () => {
  const { ctx, battle } = setup();
  battle.start(STAGE_1_5);
  // 让 WaveManager spawn 第一波
  ctx.advance(0.016); battle.update(0.016);
  assert.equal(battle.enemies.length, 4, '第一波 4 鼠');
  // 直接清除第一波（dead=true → filter；需两次 update：第一次 filter，第二次 waveManager 看到清空）
  for (const e of battle.enemies) { e.dead = true; }
  ctx.advance(0.016); battle.update(0.016); // filter 掉 dead
  ctx.advance(0.016); battle.update(0.016); // waveManager 看到 aliveCount=0 → 进入 wave2 延迟
  // 过 wave2 延迟（1.2s）+ spawn
  ctx.advance(2); battle.update(2);
  ctx.advance(0.016); battle.update(0.016);
  assert.equal(battle.enemies.length, 2, `第二波应 2 强化鼠，实际 ${battle.enemies.length}`);
  // 清除第二波
  for (const e of battle.enemies) { e.dead = true; }
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(0.016); battle.update(0.016);
  // 过 wave3 延迟（1.5s）+ spawn
  ctx.advance(2); battle.update(2);
  ctx.advance(0.016); battle.update(0.016);
  const boss = battle.currentBoss;
  assert.ok(boss, 'Boss 应已登场');
  assert.equal(boss!.variant, 'boss');
  assert.equal(boss!.isBoss, true);
  assert.ok(boss!.bossSkill, 'Boss 应持有技能');
});

// 震荡冲击技能单元测试
test('BossSkill：冷却期间不进入 warning', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 200, 200);
  // 推进 < cooldown，应仍 idle
  for (let i = 0; i < 10; i++) skill.update(0.1, player);
  // 不应已进入 blast（玩家在范围外也不应受伤）
  assert.equal(player.hp, player.maxHp, '冷却期玩家不应受伤');
});

test('BossSkill：冷却期满进入 warning → blast，范围内玩家受伤', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  const ctx = new MockContext();
  // 玩家在 boss 范围内（距离 < 90）
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100); // 距离 20
  const hpBefore = player.hp;
  // 推进过 cooldown(5) + warning(1) + blast 判定
  for (let i = 0; i < 100; i++) skill.update(0.1, player);
  assert.ok(player.hp < hpBefore, `范围内玩家应受伤: ${player.hp} < ${hpBefore}`);
  assert.equal(hpBefore - player.hp, SHOCKWAVE.damage, '伤害应等于震荡冲击伤害');
});

test('BossSkill：范围外玩家不受伤', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  const ctx = new MockContext();
  // 玩家在范围外（距离 > 90）
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 300, 300); // 距离 ≈ 283
  const hpBefore = player.hp;
  for (let i = 0; i < 100; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, '范围外玩家不应受伤');
});

test('BossSkill：warning 期间不立即伤害（仅 blast 瞬间判定）', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  const hpBefore = player.hp;
  // 先过冷却进入 warning（5s）
  for (let i = 0; i < 50; i++) skill.update(0.1, player);
  // warning 期间（再 0.5s，未到 1s）不应受伤
  for (let i = 0; i < 5; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, 'warning 期间不应受伤');
});

test('BossSkill：boss 死亡后技能停止', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  // boss 死亡
  boss.dead = true;
  const hpBefore = player.hp;
  for (let i = 0; i < 200; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, 'boss 死亡后不应再造成技能伤害');
  assert.ok(skill.isDisabled, '技能应 disabled');
});

test('BossSkill：召唤小鼠（hp<50% 触发一次）', () => {
  const boss = { x: 100, y: 100, hp: 220, maxHp: 220, dead: false };
  const skill = new BossSkill(boss);
  let summonCount = 0;
  skill.onSummon = (n) => { summonCount += n; };
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 300, 300);
  // boss 血量降至 50% 以下
  boss.hp = 80; // < 110
  for (let i = 0; i < 5; i++) skill.update(0.1, player);
  assert.ok(skill.hasSummoned, '应已触发召唤');
  assert.equal(summonCount, 2);
  // 再次推进不应重复触发
  boss.hp = 10;
  for (let i = 0; i < 50; i++) skill.update(0.1, player);
  assert.equal(summonCount, 2, '每场最多触发一次');
});

// 首次通关 1-5 → 章节完成
test('首次通关 1-5 → clearResult.chapterCompleted=true', () => {
  const { ctx, game, battle } = setup();
  battle.start(STAGE_1_5);
  // 快速清三波（聚怪）
  for (let wave = 0; wave < 3; wave++) {
    for (let i = 0; i < 3; i++) { ctx.advance(0.016); battle.update(0.016); }
    ctx.advance(2); battle.update(2);
    for (const e of battle.enemies) { e.x = battle.player.x + 10; e.y = battle.player.y; }
    runFrames(ctx, battle, 300);
  }
  assert.ok(game.lastOutcome?.win, '应胜利');
  assert.ok(game.lastOutcome?.clearResult, '应有 clearResult');
  assert.equal(game.lastOutcome!.clearResult!.chapterCompleted, true, '首次通关 1-5 应触发章节完成');
});

test('重复通关 1-5 → chapterCompleted=false', () => {
  const { ctx, game, battle } = setup();
  // 预先标记 1-5 已通关
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 2, clearCount: 1 };
  battle.start(STAGE_1_5);
  for (let wave = 0; wave < 3; wave++) {
    for (let i = 0; i < 3; i++) { ctx.advance(0.016); battle.update(0.016); }
    ctx.advance(2); battle.update(2);
    for (const e of battle.enemies) { e.x = battle.player.x + 10; e.y = battle.player.y; }
    runFrames(ctx, battle, 300);
  }
  assert.ok(game.lastOutcome?.win);
  assert.equal(game.lastOutcome!.clearResult!.chapterCompleted, false, '重复通关不应再触发章节完成');
  assert.equal(game.lastOutcome!.clearResult!.firstClear, false);
});
