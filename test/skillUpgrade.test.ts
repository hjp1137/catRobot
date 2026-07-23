/**
 * 技能养成系统单测（任务6）
 * ------------------------------------------------------------------
 * 覆盖任务文档 26 项验收点：等级/迁移/升级/战力/战斗接入/UI。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import MockContextModule from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { SkillPanelUI } from '../dist/ui/SkillPanelUI.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import { MEOW_CANNON, HEAVY_SHIELD, getSkillConfig, getSkillEffect, getSkillUpgradeCost } from '../dist/data/SkillConfig.js';
import { createDefaultPlayerData, SAVE_KEY } from '../dist/data/PlayerData.js';
import {
  getSkillLevel, getSkillEffectForPlayer, getSkillUpgradePreview, tryUpgradeSkill,
} from '../dist/data/SkillUpgrade.js';
import { calculateTotalPower, calculateSkillPower, calculateBasePower } from '../dist/data/PowerCalc.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { MECHANICAL_MOUSE, MECHA_RAT_KING } from '../dist/data/EnemyConfig.js';

const { MockContext } = MockContextModule;

function newPlayer() { return createDefaultPlayerData(); }

// ---------- 默认/迁移 ----------
test('1. 默认技能等级为 1', () => {
  const p = newPlayer();
  assert.equal(getSkillLevel(p, 'meow_cannon'), 1);
  assert.equal(getSkillLevel(p, 'heavy_shield'), 1);
});

test('2. 默认解锁喵能炮和重甲护盾', () => {
  const p = newPlayer();
  assert.ok(p.unlockedSkillIds.includes('meow_cannon'));
  assert.ok(p.unlockedSkillIds.includes('heavy_shield'));
});

test('3. 旧存档迁移后补 unlockedSkillIds', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const p = new SaveManager(ctx.storage).load();
  assert.deepEqual(p.unlockedSkillIds, ['meow_cannon', 'heavy_shield']);
});

test('4. 旧存档迁移后补 skillLevels', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(p.skillLevels.meow_cannon, 1);
  assert.equal(p.skillLevels.heavy_shield, 1);
});

test('5. skillLevels 缺字段时自动补齐', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({
    version: 1, mechaId: 'orange_cat', level: 2, gold: 0, parts: 0,
    unlockedSkillIds: ['meow_cannon', 'heavy_shield'], skillLevels: { meow_cannon: 3 },
  }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(p.skillLevels.meow_cannon, 3);
  assert.equal(p.skillLevels.heavy_shield, 1, '缺字段应补 1');
});

test('6. 技能等级低于 1 时修正为 1', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({
    version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0,
    unlockedSkillIds: ['meow_cannon', 'heavy_shield'], skillLevels: { meow_cannon: -5, heavy_shield: 0 },
  }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(getSkillLevel(p, 'meow_cannon'), 1);
  assert.equal(getSkillLevel(p, 'heavy_shield'), 1);
});

test('7. 技能等级超过 maxLevel 时修正为 maxLevel', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({
    version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0,
    unlockedSkillIds: ['meow_cannon', 'heavy_shield'], skillLevels: { meow_cannon: 99, heavy_shield: 100 },
  }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(getSkillLevel(p, 'meow_cannon'), MEOW_CANNON.maxLevel);
  assert.equal(getSkillLevel(p, 'heavy_shield'), HEAVY_SHIELD.maxLevel);
});

// ---------- 成长 ----------
test('8. 喵能炮等级越高伤害越高', () => {
  const d1 = getSkillEffect('meow_cannon', 1)!.damage!;
  const d3 = getSkillEffect('meow_cannon', 3)!.damage!;
  const d5 = getSkillEffect('meow_cannon', 5)!.damage!;
  assert.ok(d1 < d3 && d3 < d5, `${d1} < ${d3} < ${d5}`);
});

test('9. 喵能炮等级越高范围或冷却有成长', () => {
  const r1 = getSkillEffect('meow_cannon', 1)!.range!;
  const r5 = getSkillEffect('meow_cannon', 5)!.range!;
  const c1 = getSkillEffect('meow_cannon', 1)!.cooldown!;
  const c5 = getSkillEffect('meow_cannon', 5)!.cooldown!;
  assert.ok(r5 > r1, '范围应成长');
  assert.ok(c5 < c1, '冷却应缩短');
});

test('10. 重甲护盾等级越高持续时间或减伤有成长', () => {
  const d1 = getSkillEffect('heavy_shield', 1)!.duration!;
  const d5 = getSkillEffect('heavy_shield', 5)!.duration!;
  const r1 = getSkillEffect('heavy_shield', 1)!.damageReduction!;
  const r5 = getSkillEffect('heavy_shield', 5)!.damageReduction!;
  assert.ok(d5 > d1, '持续时间应成长');
  assert.ok(r5 > r1, '减伤应成长');
});

// ---------- 升级逻辑 ----------
test('11. 技能升级资源足够时成功扣费', () => {
  const p = newPlayer();
  p.gold = 1000; p.parts = 100;
  const r = tryUpgradeSkill(p, 'meow_cannon');
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(p.gold, 1000 - 100);
    assert.equal(p.parts, 100 - 10);
  }
});

test('12. 技能升级后等级 +1', () => {
  const p = newPlayer();
  p.gold = 1000; p.parts = 100;
  tryUpgradeSkill(p, 'meow_cannon');
  assert.equal(getSkillLevel(p, 'meow_cannon'), 2);
});

test('13. 资源不足时升级失败且不扣费', () => {
  const p = newPlayer();
  p.gold = 50; p.parts = 5; // 不足 100/10
  const goldBefore = p.gold;
  const r = tryUpgradeSkill(p, 'meow_cannon');
  assert.equal(r.ok, false);
  assert.equal(p.gold, goldBefore, '不应扣费');
});

test('14. 满级技能不能继续升级', () => {
  const p = newPlayer();
  p.gold = 99999; p.parts = 99999;
  p.skillLevels.meow_cannon = MEOW_CANNON.maxLevel;
  const r = tryUpgradeSkill(p, 'meow_cannon');
  assert.equal(r.ok, false);
});

test('15. 未解锁技能不能升级', () => {
  const p = newPlayer();
  p.gold = 99999; p.parts = 99999;
  p.unlockedSkillIds = [];
  const r = tryUpgradeSkill(p, 'meow_cannon');
  assert.equal(r.ok, false);
});

test('16. 技能升级后写入存档', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.player.gold = 1000; game.player.parts = 100;
  game.doUpgradeSkill('meow_cannon');
  const saved = JSON.parse(ctx.storage.snapshot()[SAVE_KEY]!);
  assert.equal(saved.skillLevels.meow_cannon, 2);
  assert.equal(saved.gold, 900);
});

test('17. 重启后技能等级保留', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.player.gold = 1000; game.player.parts = 100;
  game.doUpgradeSkill('meow_cannon');
  game.doUpgradeSkill('heavy_shield');
  // 重新加载
  const game2 = new GameManager(ctx);
  assert.equal(getSkillLevel(game2.player, 'meow_cannon'), 2);
  assert.equal(getSkillLevel(game2.player, 'heavy_shield'), 2);
});

// ---------- 战斗接入 ----------
test('18. 战斗中喵能炮使用升级后的伤害', () => {
  const ctx = new MockContext();
  const p = newPlayer();
  p.skillLevels.meow_cannon = 5; // 伤害 90
  const mecha = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100, p.skillLevels);
  mecha.facingAngle = 0;
  const boss = new EnemyMouse(ctx, MECHA_RAT_KING, 140, 100);
  const hpBefore = boss.hp;
  mecha.useSkill('meow_cannon', [boss]);
  assert.equal(hpBefore - boss.hp, 90, '应使用 Lv5 伤害 90');
});

test('19. 战斗中重甲护盾使用升级后的减伤', () => {
  const ctx = new MockContext();
  const p = newPlayer();
  p.skillLevels.heavy_shield = 5; // 减伤 60%
  const mecha = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100, p.skillLevels);
  mecha.useSkill('heavy_shield', []);
  const hp = mecha.hp;
  mecha.takeDamage(100);
  // 减伤 60% → 实际 40
  assert.ok(Math.abs((hp - mecha.hp) - 40) < 0.5, `Lv5 护盾应减伤60%，实际扣 ${hp - mecha.hp}`);
});

// ---------- 战力 ----------
test('20. 技能升级后总战力提升', () => {
  const p = newPlayer();
  const power1 = calculateTotalPower(p);
  p.skillLevels.meow_cannon = 3;
  const power3 = calculateTotalPower(p);
  assert.ok(power3 > power1, `技能升级战力应提升: ${power3} > ${power1}`);
  assert.equal(calculateSkillPower(p), (3 + 1) * 20);
});

// ---------- UI ----------
test('21. 主界面可以进入技能养成界面', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.goToSkillPanel();
  assert.equal(game.scene, 'skillPanel');
});

test('22. 技能养成界面可以返回主界面', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new SkillPanelUI(ctx, game);
  game.goToSkillPanel();
  const b = (ui as any).backBtn;
  ctx.input.simulateTap(b.x + 10, b.y + 10);
  ui.handleClick();
  assert.equal(game.scene, 'menu');
});

test('23. 技能养成界面点击升级后资源和等级刷新', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new SkillPanelUI(ctx, game);
  game.player.gold = 1000; game.player.parts = 100;
  game.goToSkillPanel();
  const card = (ui as any).cards[0];
  const b = card.upgradeBtn;
  ctx.input.simulateTap(b.x + 10, b.y + 10);
  ui.handleClick();
  assert.equal(getSkillLevel(game.player, 'meow_cannon'), 2);
  assert.equal(game.player.gold, 900);
});

test('24. 满级状态 UI 渲染不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new SkillPanelUI(ctx, game);
  game.player.skillLevels.meow_cannon = MEOW_CANNON.maxLevel;
  game.player.skillLevels.heavy_shield = HEAVY_SHIELD.maxLevel;
  game.goToSkillPanel();
  assert.doesNotThrow(() => ui.render());
});

test('25. 资源不足状态 UI 渲染不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new SkillPanelUI(ctx, game);
  game.player.gold = 0; game.player.parts = 0;
  game.goToSkillPanel();
  assert.doesNotThrow(() => ui.render());
});

test('26. 旧存档兼容不导致任务1~5链路崩溃', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const game = new GameManager(ctx);
  // 走一遍核心链路：升级机甲 + 进战斗 + 用技能
  game.player.gold = 100; game.player.parts = 20;
  game.doUpgrade();
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  const stage = STAGE_1_1;
  battle.start(stage);
  for (let i = 0; i < 2; i++) { ctx.advance(0.016); battle.update(0.016); }
  // 用喵能炮（默认等级1，不崩溃）
  battle.player.facingAngle = 0;
  const r = battle.usePlayerSkill('meow_cannon');
  assert.equal(r.ok, true);
});

// ---------- 额外：升级预览/成本 ----------
test('getSkillUpgradePreview：满级 nextEffect=null', () => {
  const p = newPlayer();
  p.skillLevels.meow_cannon = MEOW_CANNON.maxLevel;
  const pv = getSkillUpgradePreview(p, 'meow_cannon')!;
  assert.equal(pv.isMaxLevel, true);
  assert.equal(pv.nextEffect, null);
  assert.equal(pv.cost, null);
});

test('getSkillUpgradeCost：满级返回 null', () => {
  assert.equal(getSkillUpgradeCost('meow_cannon', MEOW_CANNON.maxLevel), null);
  assert.ok(getSkillUpgradeCost('meow_cannon', 1));
});

test('calculateBasePower 与原战力公式一致', () => {
  const p = newPlayer();
  p.level = 5;
  // Lv5: hp 120+4*20=200, atk 10+4*5=30 → base 200+300=500
  assert.equal(calculateBasePower(p), 500);
});
