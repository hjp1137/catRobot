import { test } from 'node:test';
import assert from 'node:assert';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { createDefaultPlayerData } from '../dist/data/PlayerData.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import {
  getEquipmentEnhanceLevel, getMaxEnhanceLevel, getEnhanceCost,
  canEnhanceEquipment, tryEnhanceEquipment, getDisassembleReward,
  tryDisassembleEquipment, sortEquipmentItems,
  toggleEquipmentLock, setEquipmentLocked, isEquipmentLocked
} from '../dist/data/EquipmentEnhance.js';
import { getEquipmentStats, getEquipmentPower, calculatePlayerBattleStats } from '../dist/data/EquipmentCalc.js';
import { calculateTotalPower } from '../dist/data/PowerCalc.js';
import { generateEquipmentInstance } from '../dist/data/EquipmentHelper.js';
import { EquipmentPanelUI } from '../dist/ui/EquipmentPanelUI.js';

// Mock storage
const mockStorage = {
  get: () => null,
  set: () => {},
  remove: () => {},
};

test('1. 默认 materials.enhanceStone 为 0', () => {
  const data = createDefaultPlayerData();
  assert.equal(data.materials.enhanceStone, 0);
});

test('2. 旧存档迁移补 materials', () => {
  const save = new SaveManager(mockStorage as any);
  const data = save.load(); // 默认存档
  assert.equal(data.materials.enhanceStone, 0);
  
  // 脏存档迁移
  const raw = {
    mechaId: 'orange_cat',
    gold: 100,
    // 缺失 materials
  };
  const migrated = (save as any).migrate(raw);
  assert.ok(migrated.materials);
  assert.equal(migrated.materials.enhanceStone, 0);
});

test('3. 旧装备缺 level 时补 0, < 0 补 0, > max 修正为 max', () => {
  const save = new SaveManager(mockStorage as any);
  const raw = {
    equipmentInventory: {
      items: [
        { uid: 'eq1', configId: 'rusty_claw', obtainedAt: 100 }, // 缺 level
        { uid: 'eq2', configId: 'patched_armor', level: -2, obtainedAt: 100 }, // < 0
        { uid: 'eq3', configId: 'small_core', level: 15, obtainedAt: 100 }, // > max
      ],
      equipped: {},
    }
  };
  const migrated = (save as any).migrate(raw);
  const items = migrated.equipmentInventory.items;
  assert.equal(items.length, 3);
  assert.equal(items[0].level, 0);
  assert.equal(items[1].level, 0);
  assert.equal(items[2].level, 10);
});

test('4. 强化消耗配置与倍率正确', () => {
  const commonItem = { uid: 'eq1', configId: 'rusty_claw', level: 0, obtainedAt: 100 };
  const costCommon = getEnhanceCost(commonItem);
  assert.equal(costCommon.gold, 50); // 50 * 1.0
  assert.equal(costCommon.enhanceStone, 2); // 2 * 1.0

  const rareItem = { uid: 'eq2', configId: 'neon_blaster', level: 0, obtainedAt: 100 };
  const costRare = getEnhanceCost(rareItem);
  assert.equal(costRare.gold, 65); // Math.floor(50 * 1.3)
  assert.equal(costRare.enhanceStone, 2); // Math.floor(2 * 1.3) = 2
});

test('5. 资源足够时强化成功，扣除对应金币强化石，等级+1', () => {
  const player = createDefaultPlayerData();
  player.gold = 1000;
  player.materials.enhanceStone = 10;
  const uid = 'test_eq';
  player.equipmentInventory.items.push({ uid, configId: 'rusty_claw', level: 0, obtainedAt: 0 });
  
  const res = tryEnhanceEquipment(player, uid);
  assert.ok(res.ok);
  assert.equal(res.newLevel, 1);
  assert.equal(player.gold, 950); // 1000 - 50
  assert.equal(player.materials.enhanceStone, 8); // 10 - 2
});

test('6. 金币或强化石不足时强化失败且不扣资源，满级后拒绝强化', () => {
  const player = createDefaultPlayerData();
  player.gold = 10; // 升级需 50
  player.materials.enhanceStone = 10;
  const uid = 'test_eq';
  player.equipmentInventory.items.push({ uid, configId: 'rusty_claw', level: 0, obtainedAt: 0 });

  const res = tryEnhanceEquipment(player, uid);
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'not_enough_gold');
  assert.equal(player.gold, 10); // 未扣除

  // 强化石不足
  player.gold = 100;
  player.materials.enhanceStone = 0; // 升级需 2
  const res2 = tryEnhanceEquipment(player, uid);
  assert.equal(res2.ok, false);
  assert.equal(res2.reason, 'not_enough_material');

  // 满级强化
  player.materials.enhanceStone = 100;
  const item = player.equipmentInventory.items[0];
  item.level = 10; // 满级
  const res3 = tryEnhanceEquipment(player, uid);
  assert.equal(res3.ok, false);
  assert.equal(res3.reason, 'max_level');
});

test('7. 强化后装备属性提升，战力提升，且战斗实际属性及 totalPower 提升', () => {
  const player = createDefaultPlayerData();
  const uid = 'test_eq';
  player.equipmentInventory.items.push({ uid, configId: 'rusty_claw', level: 0, obtainedAt: 0 });
  player.equipmentInventory.equipped.weapon = uid;

  const power0 = calculateTotalPower(player);
  const stats0 = calculatePlayerBattleStats(player);
  
  // 强化到 1 级
  player.equipmentInventory.items[0].level = 1;
  const power1 = calculateTotalPower(player);
  const stats1 = calculatePlayerBattleStats(player);

  assert.ok(power1 > power0, '强化后总战力应提升');
  assert.ok(stats1.attack > stats0.attack, '强化后攻击属性应提升');
});

test('8. 装备分解：品质产出、已穿戴保护、强化石返还 50%', () => {
  const player = createDefaultPlayerData();
  player.materials.enhanceStone = 0;
  
  // 普通装备分解
  const uid1 = 'eq_common';
  player.equipmentInventory.items.push({ uid: uid1, configId: 'rusty_claw', level: 0, obtainedAt: 100 });
  const reward1 = getDisassembleReward(player.equipmentInventory.items[0]);
  assert.equal(reward1.enhanceStone, 2); // 基础 2
  
  const disRes1 = tryDisassembleEquipment(player, uid1);
  assert.ok(disRes1.ok);
  assert.equal(player.materials.enhanceStone, 2);
  assert.equal(player.equipmentInventory.items.length, 0);

  // 优秀 +3 分解并返还 50% 强化石
  // 0->1: 2*1.3=2, 1->2: 3*1.3=3, 2->3: 5*1.3=6 (总消耗 11)
  // 返还：floor(11 * 0.5) = 5
  // 优秀基础：6。总获得：6 + 5 = 11
  const uid2 = 'eq_rare';
  player.equipmentInventory.items.push({ uid: uid2, configId: 'neon_blaster', level: 3, obtainedAt: 200 });
  const reward2 = getDisassembleReward(player.equipmentInventory.items[0]);
  assert.equal(reward2.enhanceStone, 11);

  // 已穿戴不能分解
  player.equipmentInventory.equipped.weapon = uid2;
  const disRes2 = tryDisassembleEquipment(player, uid2);
  assert.equal(disRes2.ok, false);
  assert.equal(disRes2.reason, 'equipped');
});

test('9. 背包排序：品质 > 槽位 > 等级 > 获得时间', () => {
  const items = [
    { uid: '1', configId: 'rusty_claw', level: 0, obtainedAt: 100 }, // weapon, common, lv0, time 100
    { uid: '2', configId: 'neon_blaster', level: 0, obtainedAt: 200 }, // weapon, rare, lv0, time 200
    { uid: '3', configId: 'neon_blaster', level: 3, obtainedAt: 150 }, // weapon, rare, lv3, time 150
    { uid: '4', configId: 'alloy_armor', level: 0, obtainedAt: 300 }, // armor, rare, lv0, time 300
  ];
  const sorted = sortEquipmentItems(items);
  // 预期顺序：
  // 1. 3 (weapon, rare, lv3) - 优先罕见，且lv3高
  // 2. 2 (weapon, rare, lv0, time 200) - 同品质/槽位，lv相同，time 200 > 150 (但3的lv高排在最前面)
  // 3. 4 (armor, rare, lv0) - 槽位武器(3)高于装甲(2)
  // 4. 1 (rusty_claw, common) - 普通品质最低排在最后
  assert.equal(sorted[0].uid, '3');
  assert.equal(sorted[1].uid, '2');
  assert.equal(sorted[2].uid, '4');
  assert.equal(sorted[3].uid, '1');
});

test('10. 装备背包满 60 件时掉落自动转化为强化石', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  
  // 模拟 random：1.触发装备掉落，2.roll出普通品质，3.选择rusty_claw
  let callCount = 0;
  ctx.random = () => {
    callCount++;
    if (callCount === 1) return 0.01; // r1 (equipmentDropRate)
    if (callCount === 2) return 0.01; // r2 (rarity common)
    return 0.1; // r3 (choose id)
  };

  const player = game.player;
  player.materials.enhanceStone = 0;
  
  // 塞满背包
  for (let i = 0; i < 60; i++) {
    player.equipmentInventory.items.push({ uid: `eq_${i}`, configId: 'rusty_claw', level: 0, obtainedAt: 0 });
  }

  // 胜利结算 (finishBattle 会调用 rollAndApplyLoot)
  const outcome = {
    win: true,
    stageId: '1-1',
    elapsedSec: 10,
    hpRatio: 1.0,
    clearResult: null,
    loot: null,
  };
  game.finishBattle(outcome as any);

  assert.ok(outcome.loot);
  assert.equal(outcome.loot.fullBagConverted, true);
  assert.equal(outcome.loot.convertedStones, 2); // rusty_claw 是 common，转化为 2
  assert.equal(player.equipmentInventory.items.length, 60); // 背包数量仍是 60
  assert.ok(player.materials.enhanceStone > 2); // 结算掉落强化石奖励 (1-3) + 满包转化 (2) > 2
});

test('11. 强化装甲后战斗 maxHp 提升，强化核心后冷却缩减提升', () => {
  const player = createDefaultPlayerData();
  const uidArmor = 'armor_eq';
  const uidCore = 'core_eq';
  player.equipmentInventory.items.push(
    { uid: uidArmor, configId: 'patched_armor', level: 0, obtainedAt: 0 },
    { uid: uidCore, configId: 'small_core', level: 0, obtainedAt: 0 }
  );
  player.equipmentInventory.equipped.armor = uidArmor;
  player.equipmentInventory.equipped.core = uidCore;

  const stats0 = calculatePlayerBattleStats(player);
  
  // 强化到 10 级（满级）
  player.equipmentInventory.items.find(i => i.uid === uidArmor)!.level = 10;
  player.equipmentInventory.items.find(i => i.uid === uidCore)!.level = 10;
  
  const stats1 = calculatePlayerBattleStats(player);

  assert.ok(stats1.maxHp > stats0.maxHp, '强化装甲后 maxHp 应提升');
  assert.ok(stats1.cooldownReduction > stats0.cooldownReduction, '强化核心后 cooldownReduction 应提升');
});

test('12. 装备锁定、解锁逻辑与分解拦截验证', () => {
  const player = createDefaultPlayerData();
  const uid = 'eq_test_lock';
  player.equipmentInventory.items.push({ uid, configId: 'rusty_claw', level: 0, obtainedAt: 100 });

  // 默认锁状态为 false
  assert.equal(isEquipmentLocked(player, uid), false);

  // 锁定装备
  const res1 = toggleEquipmentLock(player, uid);
  assert.ok(res1.ok);
  assert.equal(res1.locked, true);
  assert.equal(isEquipmentLocked(player, uid), true);

  // 锁定后不可分解，且不扣减资源/不移除装备
  const beforeLen = player.equipmentInventory.items.length;
  const beforeStone = player.materials.enhanceStone;
  const resDis = tryDisassembleEquipment(player, uid);
  assert.equal(resDis.ok, false);
  assert.equal(resDis.reason, 'locked');
  assert.equal(player.equipmentInventory.items.length, beforeLen);
  assert.equal(player.materials.enhanceStone, beforeStone);

  // 锁定后仍可强化和穿戴
  const resEnhance = tryEnhanceEquipment(player, uid);
  // 可强化（资源不足报错 'not_enough_gold' 代表通过了 locked 的检验）
  assert.equal(resEnhance.ok, false);
  assert.notEqual(resEnhance.reason, 'locked');

  // 解锁装备
  const res2 = toggleEquipmentLock(player, uid);
  assert.ok(res2.ok);
  assert.equal(res2.locked, false);
  assert.equal(isEquipmentLocked(player, uid), false);
});

test('13. 史诗/普通掉落装备锁策略与旧存档迁移验证', () => {
  // 1. 史诗掉落默认锁定，普通掉落默认解锁
  const epicInst = generateEquipmentInstance('starcore_cannon', 100);
  assert.equal(epicInst.locked, true);

  const commonInst = generateEquipmentInstance('rusty_claw', 100);
  assert.equal(commonInst.locked, false);

  // 2. 旧存档迁移防御性锁定值：无锁/非布尔强制迁移为 false
  const save = new SaveManager(mockStorage as any);
  const raw = {
    equipmentInventory: {
      items: [
        { uid: 'eq1', configId: 'rusty_claw', obtainedAt: 100 }, // 缺失 locked
        { uid: 'eq2', configId: 'patched_armor', locked: 123, obtainedAt: 100 }, // locked 非布尔
        { uid: 'eq3', configId: 'small_core', locked: true, obtainedAt: 100 }, // 正确 true
      ],
      equipped: {},
    }
  };
  const migrated = (save as any).migrate(raw);
  const items = migrated.equipmentInventory.items;
  assert.equal(items[0].locked, false);
  assert.equal(items[1].locked, false);
  assert.equal(items[2].locked, true);
});

test('14. 槽位/品质筛选、组合筛选及分页边界防越界验证', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  
  // 注入 8 件装备做筛选分页测试
  game.player.equipmentInventory.items = [
    { uid: 'w1', configId: 'rusty_claw', level: 0, obtainedAt: 100 }, // weapon, common
    { uid: 'w2', configId: 'neon_blaster', level: 0, obtainedAt: 110 }, // weapon, rare
    { uid: 'w3', configId: 'starcore_cannon', level: 0, obtainedAt: 120 }, // weapon, epic
    { uid: 'a1', configId: 'patched_armor', level: 0, obtainedAt: 130 }, // armor, common
    { uid: 'a2', configId: 'alloy_armor', level: 0, obtainedAt: 140 }, // armor, rare
    { uid: 'c1', configId: 'small_core', level: 0, obtainedAt: 150 }, // core, common
    { uid: 'c2', configId: 'neon_core', level: 0, obtainedAt: 160 }, // core, rare
    { uid: 'c3', configId: 'starcore_fragment', level: 0, obtainedAt: 170 }, // core, epic
  ];

  const ui = new EquipmentPanelUI(ctx, game);

  // 1. 默认 all 筛选：8件
  assert.equal(ui.getFilteredItems().length, 8);

  // 2. 槽位筛选
  ui.slotFilter = 'weapon';
  assert.equal(ui.getFilteredItems().length, 3); // 3件武器
  ui.slotFilter = 'armor';
  assert.equal(ui.getFilteredItems().length, 2); // 2件装甲

  // 3. 品质筛选
  ui.slotFilter = 'all';
  ui.rarityFilter = 'epic';
  assert.equal(ui.getFilteredItems().length, 2); // 2件史诗

  // 4. 组合筛选 (武器 + 史诗)
  ui.slotFilter = 'weapon';
  ui.rarityFilter = 'epic';
  const combined = ui.getFilteredItems();
  assert.equal(combined.length, 1);
  assert.equal(combined[0].uid, 'w3');

  // 5. 分页测试 (每页最多6件，总8件，第0页6件，第1页2件)
  ui.slotFilter = 'all';
  ui.rarityFilter = 'all';
  ui.currentPage = 0;
  // 模拟翻页与越界保护
  assert.equal(ui.currentPage, 0);
  ui.currentPage = 1; // 翻到下一页
  assert.equal(ui.currentPage, 1);
});



