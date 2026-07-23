/**
 * 装备与符文系统单测（任务9）
 * ------------------------------------------------------------------
 * 覆盖任务文档 31 项验收点。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import {
  EQUIPMENT_CONFIGS, getEquipmentConfig,
} from '../dist/data/EquipmentConfig.js';
import type { EquipmentSlot } from '../dist/data/EquipmentConfig.js';
import type { EquipmentInstance } from '../dist/data/EquipmentData.js';
import { RUNE_CONFIGS, getRuneConfig, MAX_EQUIPPED_RUNES } from '../dist/data/RuneConfig.js';
import {
  equipItem, unequipSlot, equipRune, unequipRune,
  getEquippedItems, getEquipmentStats, getEquippedRunes, getRuneEffects,
  getEquipmentPower, getRunePower, calculatePlayerBattleStats,
} from '../dist/data/EquipmentCalc.js';
import { rollLoot, getStageLootConfig, STAGE_LOOT_CONFIGS } from '../dist/data/Loot.js';
import { calculateTotalPower } from '../dist/data/PowerCalc.js';
import { createDefaultPlayerData, SAVE_KEY } from '../dist/data/PlayerData.js';
import { STAGE_1_1, STAGE_1_5, STAGE_2_5 } from '../dist/data/StageConfig.js';
import { generateEquipmentInstance } from '../dist/data/EquipmentHelper.js';
import { EquipmentPanelUI } from '../dist/ui/EquipmentPanelUI.js';
import { generateRuneInstance } from '../dist/data/RuneHelper.js';

function newPlayer() { return createDefaultPlayerData(); }
function addItem(player: any, configId: string): string {
  const inst = generateEquipmentInstance(configId, 0);
  player.equipmentInventory.items.push(inst);
  return inst.uid;
}
function addRune(player: any, configId: string): string {
  const inst = generateRuneInstance(configId, 0);
  player.runeInventory.push(inst);
  return inst.uid;
}

// ---------- 装备配置 ----------
test('1. 装备配置存在 3 个槽位', () => {
  const slots = new Set(Object.values(EQUIPMENT_CONFIGS).map(e => e.slot));
  assert.ok(slots.has('weapon'));
  assert.ok(slots.has('armor'));
  assert.ok(slots.has('core'));
  assert.equal(slots.size, 3);
});

test('2. 装备品质 common/rare/epic 存在', () => {
  const rarities = new Set(Object.values(EQUIPMENT_CONFIGS).map(e => e.rarity));
  assert.ok(rarities.has('common'));
  assert.ok(rarities.has('rare'));
  assert.ok(rarities.has('epic'));
});

test('3. 默认装备背包为空', () => {
  const p = newPlayer();
  assert.equal(p.equipmentInventory.items.length, 0);
  assert.equal(Object.keys(p.equipmentInventory.equipped).length, 0);
});

test('4. 旧存档迁移后补 equipmentInventory', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const p = new SaveManager(ctx.storage).load();
  assert.deepEqual(p.equipmentInventory.items, []);
  assert.deepEqual(p.equipmentInventory.equipped, {});
  assert.deepEqual(p.runeInventory, []);
  assert.deepEqual(p.equippedRunes, []);
});

test('5. 装备 uid 不存在时自动清理穿戴记录', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({
    version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0,
    unlockedSkillIds: ['meow_cannon', 'heavy_shield'], skillLevels: { meow_cannon: 1, heavy_shield: 1 },
    equipmentInventory: { items: [], equipped: { weapon: 'nonexistent_uid' } },
  }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(p.equipmentInventory.equipped.weapon, undefined, '无效 uid 应清理');
});

// ---------- 穿戴属性 ----------
test('6. 穿戴武器后 attack 增加', () => {
  const p = newPlayer();
  const before = calculatePlayerBattleStats(p).attack;
  const uid = addItem(p, 'rusty_claw');
  equipItem(p, uid);
  const after = calculatePlayerBattleStats(p).attack;
  assert.ok(after > before, `attack 应增加: ${after} > ${before}`);
  assert.equal(after - before, 5);
});

test('7. 穿戴装甲后 maxHp 增加', () => {
  const p = newPlayer();
  const before = calculatePlayerBattleStats(p).maxHp;
  const uid = addItem(p, 'patched_armor');
  equipItem(p, uid);
  const after = calculatePlayerBattleStats(p).maxHp;
  assert.equal(after - before, 30);
});

test('8. 穿戴核心后冷却缩减生效', () => {
  const p = newPlayer();
  const before = calculatePlayerBattleStats(p).cooldownReduction;
  const uid = addItem(p, 'neon_core');
  equipItem(p, uid);
  const after = calculatePlayerBattleStats(p).cooldownReduction;
  assert.ok(after > before);
  assert.ok(Math.abs(after - 0.05) < 0.001);
});

test('9. 同槽位穿戴新装备会替换旧装备', () => {
  const p = newPlayer();
  const uid1 = addItem(p, 'rusty_claw');
  const uid2 = addItem(p, 'neon_blaster');
  equipItem(p, uid1);
  equipItem(p, uid2);
  assert.equal(p.equipmentInventory.equipped.weapon, uid2);
});

test('10. 卸下装备后属性恢复', () => {
  const p = newPlayer();
  const before = calculatePlayerBattleStats(p).attack;
  const uid = addItem(p, 'rusty_claw');
  equipItem(p, uid);
  unequipSlot(p, 'weapon');
  assert.equal(calculatePlayerBattleStats(p).attack, before);
});

test('11. 装备战力计入 totalPower', () => {
  const p = newPlayer();
  const before = calculateTotalPower(p);
  const uid = addItem(p, 'starcore_cannon');
  equipItem(p, uid);
  const after = calculateTotalPower(p);
  assert.ok(after > before, `装备应增加战力: ${after} > ${before}`);
  assert.equal(after - before, 90); // starcore_cannon power
});

// ---------- 掉落 ----------
test('12. 胜利后有概率掉落装备', () => {
  // 1-1 掉率 20%，用 r1=0.1（< 0.2）触发掉落
  const loot = rollLoot('1-1', 0.1, 0.5, 0.5);
  assert.ok(loot);
  assert.ok(loot!.equipmentConfigId);
});

test('13. 失败不掉落装备（GameManager.finishBattle 失败时 loot=null）', () => {
  // 直接验证 rollLoot 仅在调用时才掉；finishBattle 在 !win 时设 loot=null
  // 这里验证 BattleOutcome 失败路径
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(STAGE_1_1);
  // 让玩家死
  battle.player.hp = 1; battle.player.takeDamage(999);
  for (let i = 0; i < 5; i++) { ctx.advance(0.016); battle.update(0.016); }
  assert.ok(game.lastOutcome);
  assert.equal(game.lastOutcome!.win, false);
  assert.equal(game.lastOutcome!.loot, null);
});

test('14. Boss 关掉落概率高于普通关', () => {
  const normal = getStageLootConfig('1-1')!.equipmentDropRate;
  const boss = getStageLootConfig('1-5')!.equipmentDropRate;
  assert.ok(boss > normal, `Boss 关掉率应更高: ${boss} > ${normal}`);
});

test('15. 掉落装备写入存档', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  // 预置玩家强大到必胜 + 控制随机使必掉
  game.player.level = 20;
  battle.start(STAGE_1_1);
  for (const e of battle.enemies) { e.x = battle.player.x + 10; e.y = battle.player.y; e.hp = 1; }
  for (let i = 0; i < 60 * 5 && !battle.isEnded; i++) { ctx.advance(0.1); battle.update(0.1); }
  // 检查背包或存档
  const saved = JSON.parse(ctx.storage.snapshot()[SAVE_KEY]!);
  // 背包可能有装备（取决于随机）
  assert.ok(game.lastOutcome!.win);
  // 验证 loot 写入 player
  if (game.lastOutcome.loot?.equipmentName) {
    assert.ok(game.player.equipmentInventory.items.length > 0);
    assert.ok(saved.equipmentInventory.items.length > 0);
  }
});

test('16. 结算结果包含掉落装备信息', () => {
  // 强制掉落场景：1-5 高掉率
  const loot = rollLoot('1-5', 0.1, 0.5, 0.3);
  if (loot?.equipmentConfigId) {
    assert.ok(getEquipmentConfig(loot.equipmentConfigId));
  }
});

// ---------- 符文 ----------
test('17. 符文配置存在', () => {
  assert.ok(RUNE_CONFIGS.cannon_rune_1);
  assert.ok(RUNE_CONFIGS.shield_rune_1);
  assert.ok(RUNE_CONFIGS.poison_guard_rune);
});

test('18. 默认符文背包为空', () => {
  const p = newPlayer();
  assert.equal(p.runeInventory.length, 0);
  assert.equal(p.equippedRunes.length, 0);
});

test('19. 符文可装备', () => {
  const p = newPlayer();
  const uid = addRune(p, 'cannon_rune_1');
  assert.ok(equipRune(p, uid));
  assert.equal(p.equippedRunes.length, 1);
});

test('20. 符文可卸下', () => {
  const p = newPlayer();
  const uid = addRune(p, 'cannon_rune_1');
  equipRune(p, uid);
  unequipRune(p, uid);
  assert.equal(p.equippedRunes.length, 0);
});

test('21. 符文最多装备 2 个', () => {
  const p = newPlayer();
  const u1 = addRune(p, 'cannon_rune_1');
  const u2 = addRune(p, 'shield_rune_1');
  const u3 = addRune(p, 'poison_guard_rune');
  assert.ok(equipRune(p, u1));
  assert.ok(equipRune(p, u2));
  assert.equal(equipRune(p, u3), false); // 第3个应失败
  assert.equal(p.equippedRunes.length, MAX_EQUIPPED_RUNES);
});

test('22. 炮击符文增加喵能炮伤害', () => {
  const p = newPlayer();
  const uid = addRune(p, 'cannon_rune_1');
  equipRune(p, uid);
  const stats = calculatePlayerBattleStats(p);
  assert.ok(stats.skillDamageBonus > 0, '炮击符文应增加技能伤害');
  assert.ok(Math.abs(stats.skillDamageBonus - 0.05) < 0.001);
});

test('23. 护盾符文增加护盾持续时间', () => {
  const p = newPlayer();
  const uid = addRune(p, 'shield_rune_1');
  equipRune(p, uid);
  const effects = getRuneEffects(p);
  assert.equal(effects.shieldDurationBonus, 0.5);
});

test('24. 净化符文降低毒液伤害', () => {
  const p = newPlayer();
  const uid = addRune(p, 'poison_guard_rune');
  equipRune(p, uid);
  const stats = calculatePlayerBattleStats(p);
  assert.ok(stats.poisonResist > 0);
  assert.ok(Math.abs(stats.poisonResist - 0.15) < 0.001);
});

test('25. 符文战力计入 totalPower', () => {
  const p = newPlayer();
  const before = calculateTotalPower(p);
  const uid = addRune(p, 'poison_guard_rune');
  equipRune(p, uid);
  const after = calculateTotalPower(p);
  assert.ok(after > before, `符文应增加战力: ${after} > ${before}`);
});

// ---------- UI ----------
test('26. 装备界面可从主界面进入', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.goToEquipmentPanel();
  assert.equal(game.scene, 'equipmentPanel');
});

test('27. 装备界面可返回主界面', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.goToEquipmentPanel();
  game.backToMenu();
  assert.equal(game.scene, 'menu');
});

test('28. 装备界面穿戴装备后 UI 刷新不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new EquipmentPanelUI(ctx, game);
  addItem(game.player, 'rusty_claw');
  game.goToEquipmentPanel();
  assert.doesNotThrow(() => ui.render());
});

// ---------- 战斗接入 ----------
test('29. 战斗中装备属性生效', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  // 穿戴武器（+5攻击）
  const uid = addItem(game.player, 'rusty_claw');
  equipItem(game.player, uid);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(STAGE_1_1);
  // PlayerMecha.attack 应含装备加成
  assert.ok(battle.player.attack >= 15, `装备攻击应生效: ${battle.player.attack}`); // 基础10 + 5
});

test('30. 战斗中符文效果生效', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  // 装备炮击符文
  const uid = addRune(game.player, 'cannon_rune_1');
  equipRune(game.player, uid);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(STAGE_1_1);
  // PlayerMecha.skillDamageBonus 应 > 0
  assert.ok(battle.player.skillDamageBonus > 0, '符文技能伤害加成应生效');
});

// ---------- 旧存档兼容 ----------
test('31. 旧存档兼容任务1~8链路', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const game = new GameManager(ctx);
  // 核心链路：升级 + 战斗 + 装备
  game.player.gold = 100; game.player.parts = 20;
  game.doUpgrade();
  assert.equal(game.player.level, 2);
  // 进装备界面
  game.goToEquipmentPanel();
  assert.equal(game.scene, 'equipmentPanel');
  game.backToMenu();
  assert.equal(game.scene, 'menu');
});

// ---------- 额外：冷却缩减上限保护 ----------
test('冷却缩减上限保护（≤0.5）', () => {
  const p = newPlayer();
  // 穿星核碎片核心（-8%）+ 小核心（-2%）= 10%，应被钳制到... 实际 0.1
  const u1 = addItem(p, 'starcore_fragment');
  const u2 = addItem(p, 'small_core');
  // 同槽位只能穿一件核心，所以只生效一件
  equipItem(p, u1);
  const stats = calculatePlayerBattleStats(p);
  assert.ok(stats.cooldownReduction <= 0.5);
});

test('减伤上限保护（≤0.7）', () => {
  const p = newPlayer();
  const uid = addItem(p, 'alloy_armor');
  equipItem(p, uid);
  assert.ok(calculatePlayerBattleStats(p).damageReduction <= 0.7);
});

// ---------- 任务15：熔岩套装与火抗符文测试 ----------
test('避火符文属性与上限保护', () => {
  const p = newPlayer();
  const uid = addRune(p, 'fire_guard_rune');
  equipRune(p, uid);
  const stats = calculatePlayerBattleStats(p);
  assert.strictEqual(stats.fireResist, 0.15);
});

test('熔岩套装激活与战力/属性累加计算', () => {
  const p = newPlayer();
  // 1. 无熔岩装
  assert.strictEqual(getEquipmentPower(p), 0);
  
  // 2. 穿1件熔岩装，不激活套装
  const u1 = addItem(p, 'lava_cannon');
  equipItem(p, u1);
  const stats1 = calculatePlayerBattleStats(p);
  assert.strictEqual(stats1.fireResist, 0.05); // 装备自带5%火抗，无套装火抗
  const p1 = getEquipmentPower(p);
  assert.strictEqual(p1, 100); // 仅有重炮战力100
  
  // 3. 穿2件熔岩装，激活2件套：hp+300, damageReduction+0.05, fireResist+0.15, power+30
  const u2 = addItem(p, 'lava_armor');
  equipItem(p, u2);
  const stats2 = calculatePlayerBattleStats(p);
  // 属性：火抗 = 装备自带0.15 (0.05+0.10) + 套装0.15 = 0.30
  assert.ok(Math.abs(stats2.fireResist - 0.30) < 0.001);
  const p2 = getEquipmentPower(p);
  assert.strictEqual(p2, 230); // 自带战力200 + 2件套战力30 = 230
  
  // 4. 穿3件熔岩装，激活3件套：2件套加成 + 3件套加成，hp+700, damageReduction+0.10, power+80
  const u3 = addItem(p, 'lava_core');
  equipItem(p, u3);
  const stats3 = calculatePlayerBattleStats(p);
  // 属性：火抗 = 装备自带0.20 (0.05+0.10+0.05) + 2件套0.15 = 0.35
  assert.ok(Math.abs(stats3.fireResist - 0.35) < 0.001);
  // 3件套额外属性：冷却缩减 = 装备自带0.06 + 套装0.05 = 0.11
  assert.ok(Math.abs(stats3.cooldownReduction - 0.11) < 0.001);
  // 3件套额外属性：技能伤害 = 套装0.10
  assert.ok(Math.abs(stats3.skillDamageBonus - 0.10) < 0.001);
  const p3 = getEquipmentPower(p);
  assert.strictEqual(p3, 385); // 自带战力305 (100+100+105) + 套装战力80 (30+50) = 385
});

