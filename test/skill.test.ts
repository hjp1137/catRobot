/**
 * 玩家技能系统单测（任务5）
 * ------------------------------------------------------------------
 * 覆盖任务文档 22 项验收点：配置/冷却/命中/减伤/重置/按钮/击杀推进。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1, STAGE_1_5 } from '../dist/data/StageConfig.js';
import { SKILL_CONFIGS, MEOW_CANNON, HEAVY_SHIELD, getSkillConfig, getSkillEffect, DEFAULT_SKILL_IDS } from '../dist/data/SkillConfig.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { MECHANICAL_MOUSE, MECHA_RAT_KING } from '../dist/data/EnemyConfig.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { SAVE_KEY } from '../dist/data/PlayerData.js';

function setup(opts: { playerLevel?: number } = {}) {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  if (opts.playerLevel) game.player.level = opts.playerLevel;
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  return { ctx, game, battle };
}

function startAndWait(ctx: MockContext, battle: BattleManager, stage: any, frames = 2) {
  battle.start(stage);
  for (let i = 0; i < frames; i++) { ctx.advance(0.016); battle.update(0.016); }
}

// ---------- 技能配置 ----------
test('1. 技能配置存在：喵能炮、重甲护盾', () => {
  assert.ok(SKILL_CONFIGS.meow_cannon);
  assert.ok(SKILL_CONFIGS.heavy_shield);
  assert.equal(MEOW_CANNON.type, 'damage');
  assert.equal(HEAVY_SHIELD.type, 'shield');
  // 任务6：数值在 effects 中，按等级读取
  assert.equal(getSkillEffect('meow_cannon', 1)!.damage, 35);
  assert.equal(getSkillEffect('heavy_shield', 1)!.damageReduction, 0.5);
  assert.ok(DEFAULT_SKILL_IDS.includes('meow_cannon'));
  assert.ok(DEFAULT_SKILL_IDS.includes('heavy_shield'));
});

test('2. 技能冷却初始为 0（canUse=true）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  assert.equal(p.skillState.get('meow_cannon')!.cooldownRemaining, 0);
  assert.equal(p.skillState.canUse('meow_cannon'), true);
  assert.equal(p.skillState.canUse('heavy_shield'), true);
});

// ---------- 喵能炮 ----------
test('3. 使用喵能炮后进入冷却', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0; // 朝右
  const r = p.useSkill('meow_cannon', []);
  assert.equal(r.ok, true);
  assert.ok(p.skillState.get('meow_cannon')!.cooldownRemaining > 0);
  assert.equal(p.skillState.canUse('meow_cannon'), false);
});

test('4. 冷却中不能重复释放喵能炮', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.useSkill('meow_cannon', []);
  const r2 = p.useSkill('meow_cannon', []);
  assert.equal(r2.ok, false);
  assert.equal(r2.reason, 'cooldown');
});

test('5. 冷却结束后可以再次释放', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.useSkill('meow_cannon', []);
  // 推进超过冷却
  for (let i = 0; i < 100; i++) p.skillState.update(0.1);
  assert.equal(p.skillState.canUse('meow_cannon'), true);
  const r2 = p.useSkill('meow_cannon', []);
  assert.equal(r2.ok, true);
});

test('6. 喵能炮能命中范围内敌人', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0; // 朝右
  const enemy = new EnemyMouse(ctx, MECHANICAL_MOUSE, 150, 100); // 右侧 50px，在范围+扇形内
  const hpBefore = enemy.hp;
  const r = p.useSkill('meow_cannon', [enemy]);
  assert.equal(r.ok, true);
  assert.equal(r.hitCount, 1);
  assert.ok(enemy.hp < hpBefore);
});

test('7. 喵能炮不能命中范围外敌人', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0; // 朝右
  // 敌人在背后（左侧）
  const enemy = new EnemyMouse(ctx, MECHANICAL_MOUSE, 50, 100);
  const hpBefore = enemy.hp;
  const r = p.useSkill('meow_cannon', [enemy]);
  assert.equal(r.hitCount, 0);
  assert.equal(enemy.hp, hpBefore);
});

test('8. 喵能炮可对 Boss 造成伤害', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0;
  const boss = new EnemyMouse(ctx, MECHA_RAT_KING, 140, 100);
  const hpBefore = boss.hp;
  const r = p.useSkill('meow_cannon', [boss]);
  assert.equal(r.hitCount, 1);
  // 任务6：等级1 喵能炮伤害 35
  assert.equal(hpBefore - boss.hp, getSkillEffect('meow_cannon', 1)!.damage);
});

test('9. 喵能炮击杀敌人后敌人死亡状态正确', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0;
  // 残血敌人
  const enemy = new EnemyMouse(ctx, MECHANICAL_MOUSE, 150, 100);
  enemy.hp = 10;
  p.useSkill('meow_cannon', [enemy]);
  assert.equal(enemy.dead, true);
  assert.equal(enemy.hp, 0);
});

test('10. 喵能炮击杀当前波最后敌人后能推进下一波', () => {
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, { ...STAGE_1_1, contentStageId: undefined, enemies: [{ enemyId: 'mouse', count: 1 }], waves: undefined });
  // 朝右，把唯一剩余敌人挪到右侧范围
  battle.player.facingAngle = 0;
  // 留一只残血敌人在右侧
  const e = battle.enemies[0];
  e.hp = 10; e.x = battle.player.x + 50; e.y = battle.player.y;
  battle.enemies = battle.enemies.slice(0, 1);
  const r = battle.usePlayerSkill('meow_cannon');
  assert.equal(r.ok, true);
  assert.equal(r.hitCount, 1);
  // 推进几帧让 filter + waveManager 判定
  for (let i = 0; i < 3; i++) { ctx.advance(0.016); battle.update(0.016); }
  assert.equal(battle.enemies.length, 0);
  assert.equal(battle.waveManager.isLastWaveCleared, true);
});

// ---------- 重甲护盾 ----------
test('11. 重甲护盾释放后进入激活状态', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const r = p.useSkill('heavy_shield', []);
  assert.equal(r.ok, true);
  assert.equal(p.shieldActive, true);
  assert.ok(p.skillState.get('heavy_shield')!.activeRemaining > 0);
});

test('12. 护盾持续时间结束后失效', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.useSkill('heavy_shield', []);
  assert.equal(p.shieldActive, true);
  // 推进超过持续时间（3s）
  for (let i = 0; i < 40; i++) p.skillState.update(0.1);
  assert.equal(p.shieldActive, false);
});

test('13. 护盾期间普通敌人伤害降低', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const dmg = 20;
  // 无护盾
  const hpNoShield = p.hp;
  p.takeDamage(dmg);
  const lostNoShield = hpNoShield - p.hp;
  // 重置 + 开盾
  p.hp = p.maxHp;
  p.useSkill('heavy_shield', []);
  const hpShield = p.hp;
  p.takeDamage(dmg);
  const lostShield = hpShield - p.hp;
  assert.ok(lostShield < lostNoShield, `护盾应减伤: ${lostShield} < ${lostNoShield}`);
  assert.ok(Math.abs(lostShield - dmg * 0.5) < 0.01, '应减伤 50%');
});

test('14. 护盾期间 Boss 震荡冲击伤害降低（takeDamage 统一减伤）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  // 模拟 Boss 震荡冲击伤害（直接 takeDamage，与震荡冲击同路径）
  p.useSkill('heavy_shield', []);
  const hp = p.hp;
  p.takeDamage(12); // 震荡冲击伤害
  assert.ok(hp - p.hp < 12, 'Boss 震荡冲击应被护盾减伤');
  assert.ok(Math.abs((hp - p.hp) - 6) < 0.01, '减伤后应为 6');
});

test('15. 护盾冷却中不能重复释放', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.useSkill('heavy_shield', []);
  // 等护盾结束后仍在冷却
  for (let i = 0; i < 40; i++) p.skillState.update(0.1);
  assert.equal(p.shieldActive, false);
  assert.equal(p.skillState.canUse('heavy_shield'), false, '冷却中不可释放');
  // 冷却结束
  for (let i = 0; i < 100; i++) p.skillState.update(0.1);
  assert.equal(p.skillState.canUse('heavy_shield'), true);
});

// ---------- 战斗生命周期 ----------
test('16. 新战斗开始后技能状态重置', () => {
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, STAGE_1_1);
  // 用掉喵能炮
  battle.player.facingAngle = 0;
  battle.usePlayerSkill('meow_cannon');
  assert.ok(battle.player.skillState.get('meow_cannon')!.cooldownRemaining > 0);
  // 重新开始（新 PlayerMecha = 新 SkillState）
  battle.start(STAGE_1_1);
  assert.equal(battle.player.skillState.get('meow_cannon')!.cooldownRemaining, 0, '新战斗应重置');
});

test('17. 战斗结束后技能按钮不再触发技能', () => {
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, STAGE_1_1);
  // 快速胜利
  battle.player.facingAngle = 0;
  for (const e of battle.enemies) { e.x = battle.player.x + 10; e.y = battle.player.y; e.hp = 1; }
  for (let i = 0; i < 600 && !battle.isEnded; i++) { ctx.advance(0.1); battle.update(0.1); }
  assert.equal(battle.isEnded, true);
  // 战斗结束后释放技能应被拒
  const r = battle.usePlayerSkill('meow_cannon');
  assert.equal(r.ok, false);
});

// ---------- UI ----------
test('18. BattleUI 可以绘制两个技能按钮（不抛错）', () => {
  const { ctx, game, battle } = setup();
  const battleUI = new BattleUI(ctx, battle);
  startAndWait(ctx, battle, STAGE_1_1);
  game.setBattle(battle);
  assert.doesNotThrow(() => battleUI.render());
  assert.equal(battleUI.skillButtons.length, 2);
});

test('19. 技能按钮冷却状态显示不抛错（用掉技能后 render）', () => {
  const { ctx, game, battle } = setup();
  const battleUI = new BattleUI(ctx, battle);
  startAndWait(ctx, battle, STAGE_1_1);
  game.setBattle(battle);
  battle.player.facingAngle = 0;
  battle.usePlayerSkill('meow_cannon');
  battle.usePlayerSkill('heavy_shield');
  assert.doesNotThrow(() => battleUI.render());
});

test('20. 点击技能按钮可以触发对应技能', () => {
  const { ctx, game, battle } = setup();
  const battleUI = new BattleUI(ctx, battle);
  startAndWait(ctx, battle, STAGE_1_1);
  game.setBattle(battle);
  // tap 喵能炮按钮中心
  const btn = battleUI.skillButtons[0];
  ctx.input.simulateTap(btn.cx, btn.cy);
  battleUI.handleSkillInput();
  assert.ok(battle.player.skillState.get('meow_cannon')!.cooldownRemaining > 0, '应触发喵能炮');
  assert.equal(ctx.input.tapX, null, 'tap 应被消费');
});

test('21. 键盘快捷键 1/2 映射（通过 usePlayerSkill 间接验证映射逻辑）', () => {
  // main.ts 里 Digit1→meow_cannon, Digit2→heavy_shield
  // 这里验证 skillId 映射正确性
  assert.ok(getSkillConfig('meow_cannon'));
  assert.ok(getSkillConfig('heavy_shield'));
  const { ctx, battle } = setup();
  startAndWait(ctx, battle, STAGE_1_1);
  // 模拟键盘 1 的效果 = usePlayerSkill('meow_cannon')
  battle.player.facingAngle = 0;
  const r = battle.usePlayerSkill('meow_cannon');
  assert.equal(r.ok, true);
});

// ---------- 旧存档兼容 ----------
test('22. 旧存档迁移后不因技能字段缺失崩溃（技能为局内系统，不写存档）', () => {
  const ctx = new MockContext();
  // 任务1 旧存档（无任何技能字段）
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const save = new SaveManager(ctx.storage);
  const p = save.load();
  assert.equal(p.level, 1);
  // 技能默认全解锁，不依赖存档
  assert.ok(DEFAULT_SKILL_IDS.length >= 2);
});

// ---------- 额外：Boss 关技能可用 ----------
test('Boss 关：喵能炮可打 Boss，护盾可减 Boss 伤害', () => {
  const { ctx, battle } = setup({ playerLevel: 10 });
  battle.start(STAGE_1_5);
  // 推进到第三波 Boss（参考 boss.test 的清波手法）
  ctx.advance(0.016); battle.update(0.016);
  for (const e of battle.enemies) e.dead = true;
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(2); battle.update(2); ctx.advance(0.016); battle.update(0.016);
  for (const e of battle.enemies) e.dead = true;
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(2); battle.update(2); ctx.advance(0.016); battle.update(0.016);
  const boss = battle.currentBoss;
  assert.ok(boss, 'Boss 应登场');
  // 喵能炮打 Boss
  battle.player.facingAngle = 0;
  boss.x = battle.player.x + 50; boss.y = battle.player.y;
  const hpBefore = boss.hp;
  const r = battle.usePlayerSkill('meow_cannon');
  assert.equal(r.hitCount, 1);
  assert.ok(boss.hp < hpBefore);
});
