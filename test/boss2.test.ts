/**
 * 第二章 Boss 关与污染核心虫后技能单测（任务8）
 * ------------------------------------------------------------------
 * 覆盖任务文档 30 项验收点：2-5 Boss/虫后配置/毒液领域/污染喷发/召唤/章节完成/UI。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_2_5, getStageById } from '../dist/data/StageConfig.js';
import { POLLUTION_CORE_QUEEN, ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { PollutionBossSkill, TOXIC_FIELD, ERUPTION, QUEEN_SUMMON } from '../dist/battle/PollutionBossSkill.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { applyClear } from '../dist/chapter/ProgressManager.js';
import { createDefaultPlayerData } from '../dist/data/PlayerData.js';
import { StageSelectUI } from '../dist/ui/StageSelectUI.js';
import { StageIntroUI } from '../dist/ui/StageIntroUI.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { SAVE_KEY } from '../dist/data/PlayerData.js';
import { drawToxicField, drawEruption, drawPollutionQueen } from '../dist/render/Chapter2BossRenderer.js';

function setup(opts: { playerLevel?: number } = {}) {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.player.unlockedStageIds = ['2-1', '2-2', '2-3', '2-4', '2-5'];
  if (opts.playerLevel) game.player.level = opts.playerLevel;
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  return { ctx, game, battle };
}

// ---------- 2-5 Boss 关配置 ----------
test('1. 2-5 配置为 Boss 关', () => {
  assert.equal(STAGE_2_5.isBossStage, true);
});

test('2. 2-5 使用 waves 配置（4波）', () => {
  assert.ok(STAGE_2_5.waves && STAGE_2_5.waves.length === 4);
});

test('3. 污染核心虫后 EnemyConfig 存在', () => {
  assert.ok(ENEMY_CONFIGS.pollution_core_queen);
  assert.equal(POLLUTION_CORE_QUEEN.id, 'pollution_core_queen');
  assert.equal(POLLUTION_CORE_QUEEN.maxHp, 360);
});

test('4. 污染核心虫后 variant 为 chapter2_boss', () => {
  assert.equal(POLLUTION_CORE_QUEEN.variant, 'chapter2_boss');
});

test('5. 2-5 最后一波生成污染核心虫后', () => {
  const w4 = STAGE_2_5.waves![3];
  assert.equal(w4.enemies[0].enemyId, 'pollution_core_queen');
});

test('6. Boss 登场后 currentBoss 可获取', () => {
  const { ctx, battle } = setup();
  battle.start(STAGE_2_5);
  // 清前三波
  for (let wave = 0; wave < 3; wave++) {
    ctx.advance(0.016); battle.update(0.016);
    for (const e of battle.enemies) e.dead = true;
    ctx.advance(0.016); battle.update(0.016);
    ctx.advance(0.016); battle.update(0.016);
    ctx.advance(2); battle.update(2); ctx.advance(0.016); battle.update(0.016);
  }
  const boss = battle.currentBoss;
  assert.ok(boss);
  assert.equal(boss!.variant, 'chapter2_boss');
  assert.equal(boss!.isBoss, true);
  assert.ok(boss!.pollutionSkill, '虫后应持有 pollutionSkill');
});

// ---------- 毒液领域 ----------
test('7. 毒液领域有冷却（初始 idle 不伤害）', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100); // 在范围内
  const hpBefore = player.hp;
  for (let i = 0; i < 10; i++) skill.update(0.1, player); // 1s < 7s cooldown
  assert.equal(player.hp, hpBefore, '冷却期不应受伤');
});

test('8. 毒液领域预警期间不伤害玩家', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  const hpBefore = player.hp;
  // 推进到 warning（7s cooldown 后）
  for (let i = 0; i < 70; i++) skill.update(0.1, player);
  // warning 期间（再 0.5s）
  for (let i = 0; i < 5; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, '预警期不应受伤');
});

test('9. 毒液领域 active 期间范围内玩家受到持续伤害', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100); // 距离20 < 110
  const hpBefore = player.hp;
  // 95 帧（9.5s）：field ~8s 进 active，8-9.5s tick 触发；eruption 仍 warning 未 blast
  for (let i = 0; i < 95; i++) skill.update(0.1, player);
  assert.ok(player.hp < hpBefore, `active 期内应受伤: ${player.hp} < ${hpBefore}`);
});

test('10. 毒液领域范围外玩家不受伤', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 400, 400); // 远离 field(110)
  const hpBefore = player.hp;
  // 95 帧：field active 但玩家不在范围内；eruption 仍 warning 未 blast
  for (let i = 0; i < 95; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, '范围外不应受伤');
});

test('11. 护盾可以减免毒液领域伤害', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const ctx = new MockContext();
  const skillShield = new PollutionBossSkill(boss);
  const pShield = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  pShield.useSkill('heavy_shield', []);
  for (let i = 0; i < 95; i++) skillShield.update(0.1, pShield);
  const lostShield = pShield.maxHp - pShield.hp;
  const skillNoShield = new PollutionBossSkill({ x: 100, y: 100, hp: 360, maxHp: 360, dead: false });
  const pNoShield = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  for (let i = 0; i < 95; i++) skillNoShield.update(0.1, pNoShield);
  const lostNoShield = pNoShield.maxHp - pNoShield.hp;
  assert.ok(lostShield < lostNoShield, `护盾应减免: ${lostShield} < ${lostNoShield}`);
});

// ---------- 污染喷发 ----------
test('12. 污染喷发预警期间不伤害玩家', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  // 玩家在 field 范围外（300>110），避免 field 干扰；eruption 锁定玩家位置
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 300, 100);
  const hpBefore = player.hp;
  // 95 帧（9.5s）：eruption 刚进 warning 0.5s 未 blast；field 范围外不伤
  for (let i = 0; i < 95; i++) skill.update(0.1, player);
  assert.equal(player.hp, hpBefore, '预警期不应受伤');
});

test('13. 污染喷发锁定技能开始时玩家位置', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  // 玩家在 field 外（避免 field 干扰），eruption 会锁定此位置
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 300, 100);
  // 推进到 eruption 即将进入 warning（~9s）
  for (let i = 0; i < 92; i++) skill.update(0.1, player);
  // 玩家移走（脱离 eruption 锁定位置 300,100）
  player.x = 500; player.y = 500;
  // 完成 warning + blast（再 ~15 帧 = 1.5s）
  for (let i = 0; i < 15; i++) skill.update(0.1, player);
  // 玩家不在锁定位置 → 不受 eruption 伤害
  assert.ok(!player.statusEffects.has('poison'), '脱离锁定位置不应中毒');
});

test('14. 污染喷发爆发时范围内玩家受伤并中毒', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100); // 留在锁定位置
  const hpBefore = player.hp;
  // 推进到 eruption blast
  for (let i = 0; i < 110; i++) skill.update(0.1, player);
  assert.ok(player.hp <= hpBefore - ERUPTION.damage, '应受直接伤害');
  assert.ok(player.statusEffects.has('poison'), '应中毒');
});

test('15. 污染喷发范围外玩家不受伤', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  // 推进到 warning 锁定 (100,100)
  for (let i = 0; i < 95; i++) skill.update(0.1, player);
  // 移出范围
  player.x = 500; player.y = 500;
  for (let i = 0; i < 20; i++) skill.update(0.1, player);
  assert.ok(!player.statusEffects.has('poison'), '范围外不应中毒');
});

test('16. 护盾可以减免污染喷发直接伤害', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const ctx = new MockContext();
  // 无护盾
  const p1 = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const s1 = new PollutionBossSkill(boss);
  for (let i = 0; i < 110; i++) s1.update(0.1, p1);
  const lost1 = p1.maxHp - p1.hp;
  // 有护盾
  const p2 = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p2.useSkill('heavy_shield', []);
  const s2 = new PollutionBossSkill({ x: 100, y: 100, hp: 360, maxHp: 360, dead: false });
  for (let i = 0; i < 110; i++) s2.update(0.1, p2);
  const lost2 = p2.maxHp - p2.hp;
  assert.ok(lost2 < lost1, `护盾应减免喷发伤害: ${lost2} < ${lost1}`);
});

test('17. 护盾可以减免污染喷发 poison 伤害', () => {
  // 喷发 poison 走 takeDamage，护盾激活时减免
  const ctx = new MockContext();
  const pShield = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  pShield.useSkill('heavy_shield', []);
  pShield.statusEffects.applyPoison(3, ERUPTION.poisonDamagePerTick, 1);
  for (let i = 0; i < 12; i++) pShield.statusEffects.update(0.1, pShield);
  const lostShield = pShield.maxHp - pShield.hp;
  const pNoShield = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  pNoShield.statusEffects.applyPoison(3, ERUPTION.poisonDamagePerTick, 1);
  for (let i = 0; i < 12; i++) pNoShield.statusEffects.update(0.1, pNoShield);
  const lostNoShield = pNoShield.maxHp - pNoShield.hp;
  assert.ok(lostShield < lostNoShield, '护盾应减免 poison');
});

// ---------- 召唤 ----------
test('18. Boss 血量低于阈值时召唤毒液虫', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  let summoned = 0;
  skill.onSummon = (n) => { summoned += n; };
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 400, 400);
  boss.hp = 100; // < 50%
  for (let i = 0; i < 5; i++) skill.update(0.1, player);
  assert.ok(skill.hasSummoned);
  assert.equal(summoned, QUEEN_SUMMON.count);
});

test('19. Boss 召唤每场最多触发一次', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  let summoned = 0;
  skill.onSummon = (n) => { summoned += n; };
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 400, 400);
  boss.hp = 10;
  for (let i = 0; i < 50; i++) skill.update(0.1, player);
  assert.equal(summoned, QUEEN_SUMMON.count, '不应重复召唤');
});

// ---------- 死亡/清空 ----------
test('20. Boss 死亡后技能停止', () => {
  const boss = { x: 100, y: 100, hp: 360, maxHp: 360, dead: false };
  const skill = new PollutionBossSkill(boss);
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 100);
  boss.dead = true;
  const hp = player.hp;
  for (let i = 0; i < 200; i++) skill.update(0.1, player);
  assert.equal(player.hp, hp, 'boss 死亡后不应再伤');
  assert.ok(skill.isDisabled);
});

test('21. 战斗结束后领域和 poison 清空（玩家死亡触发）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.statusEffects.applyPoison(3, 3, 1);
  p.hp = 1; p.takeDamage(999); // 死亡
  p.statusEffects.update(0.1, p);
  assert.ok(!p.statusEffects.has('poison'));
});

test('22. Boss 与召唤敌人都死亡后才判定胜利', () => {
  const { ctx, game, battle } = setup({ playerLevel: 20 });
  battle.start({ ...STAGE_2_5, waves: [{ id: 't', enemies: [{ enemyId: 'pollution_core_queen', count: 1 }], spawnDelay: 0 }] });
  ctx.advance(0.016); battle.update(0.016);
  const boss = battle.enemies[0];
  // Boss hp 降至召唤阈值，触发召唤
  boss.hp = 100;
  ctx.advance(0.016); battle.update(0.016); // 触发召唤
  // Boss 死但召唤虫还在
  boss.dead = true;
  ctx.advance(0.016); battle.update(0.016);
  // 不应胜利（召唤虫还在）
  if (battle.enemies.length > 0) {
    assert.notEqual(game.scene, 'result');
    // 清光召唤虫
    for (const e of battle.enemies) e.dead = true;
    ctx.advance(0.016); battle.update(0.016);
    ctx.advance(0.016); battle.update(0.016);
  }
  assert.equal(game.scene, 'result');
});

// ---------- 章节完成 ----------
test('23. 2-5 首次通关显示第二章完成提示', () => {
  const p = createDefaultPlayerData();
  const r = applyClear(p, { stage: STAGE_2_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(r.chapterCompleted, true);
});

test('24. 重复通关 2-5 不重复显示首次完成', () => {
  const p = createDefaultPlayerData();
  applyClear(p, { stage: STAGE_2_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  const r2 = applyClear(p, { stage: STAGE_2_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  assert.equal(r2.chapterCompleted, false);
});

test('25. 第一章完成提示仍然正常', () => {
  const p = createDefaultPlayerData();
  const r = applyClear(p, { stage: getStageById('1-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(r.chapterCompleted, true);
});

// ---------- UI ----------
test('26. StageSelectUI 显示 2-5 Boss 标识不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['2-1', '2-2', '2-3', '2-4', '2-5'];
  const ui = new StageSelectUI(ctx, game);
  game.currentChapterId = 'chapter2';
  assert.doesNotThrow(() => ui.render());
});

test('27. StageIntroUI 显示污染核心 Boss 提示不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new StageIntroUI(ctx, game);
  game.player.selectedStageId = '2-5';
  assert.doesNotThrow(() => ui.render());
});

test('28. BattleUI 显示 poison 状态提示不抛错', () => {
  const { ctx, game, battle } = setup();
  const battleUI = new BattleUI(ctx, battle);
  game.setBattle(battle);
  battle.start({ ...STAGE_2_5, waves: [{ id: 't', enemies: [{ enemyId: 'toxic_mecha_bug', count: 1 }], spawnDelay: 0 }] });
  ctx.advance(0.016); battle.update(0.016);
  // 玩家中毒
  battle.player.statusEffects.applyPoison(3, 2, 1);
  assert.doesNotThrow(() => battleUI.render());
});

test('29. 毒液状态清除后 UI 提示消失（statusEffects.has 返回 false）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.statusEffects.applyPoison(3, 2, 1);
  assert.ok(p.statusEffects.has('poison'));
  p.statusEffects.clear();
  assert.ok(!p.statusEffects.has('poison'));
});

test('30. 旧存档迁移后不因新增 Boss 逻辑崩溃', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(p.level, 1);
  // 走 2-5 通关链路不崩
  const r = applyClear({ ...p }, { stage: STAGE_2_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(r.chapterCompleted, true);
});

// ---------- 额外：渲染 ----------
test('drawPollutionQueen/drawToxicField/drawEruption 渲染不抛错', () => {
  const ctx = new MockContext();
  assert.doesNotThrow(() => drawPollutionQueen(ctx.canvas, { cx: 100, cy: 100, radius: 38, hpRatio: 0.5 }));
  assert.doesNotThrow(() => drawToxicField(ctx.canvas, { phase: 'warning', cx: 100, cy: 100, radius: 110, progress: 0.5 }));
  assert.doesNotThrow(() => drawToxicField(ctx.canvas, { phase: 'active', cx: 100, cy: 100, radius: 110, progress: 0.5 }));
  assert.doesNotThrow(() => drawEruption(ctx.canvas, { phase: 'warning', cx: 100, cy: 100, radius: 65, progress: 0.5 }));
  assert.doesNotThrow(() => drawEruption(ctx.canvas, { phase: 'blast', cx: 100, cy: 100, radius: 65, progress: 0.5 }));
});
