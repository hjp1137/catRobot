import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import {
  EQUIPMENT_CONFIGS, getEquipmentConfig,
} from '../dist/data/EquipmentConfig.js';
import {
  equipItem, unequipSlot, calculatePlayerBattleStats, getEquipmentPower, getEquipmentSetEffects
} from '../dist/data/EquipmentCalc.js';
import { createDefaultPlayerData, SAVE_KEY } from '../dist/data/PlayerData.js';
import { generateEquipmentInstance } from '../dist/data/EquipmentHelper.js';
import { rollLoot, getStageLootConfig } from '../dist/data/Loot.js';
import { tryEnhanceEquipment, tryDisassembleEquipment, toggleEquipmentLock } from '../dist/data/EquipmentEnhance.js';

function newPlayer() { return createDefaultPlayerData(); }
function addItem(player: any, configId: string): string {
  const inst = generateEquipmentInstance(configId, 0);
  player.equipmentInventory.items.push(inst);
  return inst.uid;
}

test('套装测试：0/1/2/3件切换', () => {
  const p = newPlayer();
  assert.deepEqual(getEquipmentSetEffects(p), {});
  assert.equal(getEquipmentPower(p), 0);

  const u1 = addItem(p, 'lava_cannon');
  equipItem(p, u1);
  assert.deepEqual(getEquipmentSetEffects(p), {});
  assert.equal(getEquipmentPower(p), 100);

  const u2 = addItem(p, 'lava_armor');
  equipItem(p, u2);
  const eff2 = getEquipmentSetEffects(p);
  assert.equal(eff2.fireResist, 0.15);
  assert.equal(eff2.attack, 5);
  assert.equal(getEquipmentPower(p), 230); // 100+100 + 30

  const u3 = addItem(p, 'lava_core');
  equipItem(p, u3);
  const eff3 = getEquipmentSetEffects(p);
  assert.equal(eff3.fireResist, 0.15);
  assert.equal(eff3.attack, 5);
  assert.equal(eff3.skillDamageBonus, 0.10);
  assert.equal(eff3.cooldownReduction, 0.05);
  assert.equal(getEquipmentPower(p), 385); // 100+100+105 + 30 + 50

  unequipSlot(p, 'weapon');
  const effAfter = getEquipmentSetEffects(p);
  assert.equal(effAfter.fireResist, 0.15); // 仍然是2件套
  assert.equal(effAfter.skillDamageBonus ?? 0, 0); // 失去3件套效果
  assert.equal(getEquipmentPower(p), 235); // 100+105 + 30
});

test('套装测试：抗性上限保护', () => {
  const p = newPlayer();
  const u1 = addItem(p, 'lava_cannon');
  const u2 = addItem(p, 'lava_armor');
  const u3 = addItem(p, 'lava_core');
  equipItem(p, u1);
  equipItem(p, u2);
  equipItem(p, u3);

  // 此时装备自带 0.20 火抗，套装 0.15，符文 0.15 + 0.15 = 0.30，总火抗 0.65 没超。
  // 我们手动调大火抗数值测试上限
  const baseStats = calculatePlayerBattleStats(p);
  assert.ok(baseStats.fireResist <= 0.8);

  // 备份全局配置以便还原，防止测试污染
  const originalFireResists: Record<string, number> = {};
  p.equipmentInventory.items.forEach(item => {
    const cfg = EQUIPMENT_CONFIGS[item.configId];
    if (cfg) {
      originalFireResists[item.configId] = cfg.baseStats.fireResist;
    }
  });

  try {
    // 极端情况下火抗若为 1.2，应限制到 0.8
    p.equipmentInventory.items.forEach(item => {
      const cfg = EQUIPMENT_CONFIGS[item.configId];
      if (cfg) {
        cfg.baseStats.fireResist = 0.8;
      }
    });
    const limitStats = calculatePlayerBattleStats(p);
    assert.equal(limitStats.fireResist, 0.8);
  } finally {
    // 恢复全局配置
    p.equipmentInventory.items.forEach(item => {
      const cfg = EQUIPMENT_CONFIGS[item.configId];
      if (cfg && originalFireResists[item.configId] !== undefined) {
        cfg.baseStats.fireResist = originalFireResists[item.configId];
      }
    });
  }
});

test('套装测试：强化只放大装备基础属性', () => {
  const p = newPlayer();
  const u1 = addItem(p, 'lava_cannon');
  const u2 = addItem(p, 'lava_armor');
  equipItem(p, u1);
  equipItem(p, u2);

  // 记录强化前的装备属性
  const statsBefore = calculatePlayerBattleStats(p);

  // 给玩家充足的金币和强化石
  p.gold = 10000;
  p.materials.enhanceStone = 100;

  // 真实调用强化接口（强化 u1 两次）
  const res1 = tryEnhanceEquipment(p, u1);
  assert.ok(res1.ok);
  const res2 = tryEnhanceEquipment(p, u1);
  assert.ok(res2.ok);

  const item1 = p.equipmentInventory.items.find(i => i.uid === u1)!;
  assert.equal(item1.level, 2);

  const statsAfter = calculatePlayerBattleStats(p);
  // 验证基础属性增长（熔岩炮提供攻击力，它的强化会提升基础攻击力）
  assert.ok(statsAfter.attack > statsBefore.attack, '强化后玩家攻击力应提升');

  const eff = getEquipmentSetEffects(p);
  // 套装属性仍然是 0.15 和 5，不受强化倍率影响
  assert.equal(eff.fireResist, 0.15);
  assert.equal(eff.attack, 5);
});

test('套装测试：穿戴锁定与分解限制', () => {
  const p = newPlayer();
  const u1 = addItem(p, 'lava_cannon');
  const item = p.equipmentInventory.items.find(i => i.uid === u1)!;
  item.locked = false;

  // 1. 穿戴中禁止分解
  equipItem(p, u1);
  const r1 = tryDisassembleEquipment(p, u1);
  assert.equal(r1.ok, false);
  assert.equal(r1.reason, 'equipped');

  // 2. 锁定中禁止分解
  unequipSlot(p, 'weapon');
  const resLock = toggleEquipmentLock(p, u1);
  assert.equal(resLock.ok, true, `toggleLock should succeed but got reason: ${resLock.reason}`);
  assert.equal(resLock.locked, true);

  const itemAfterLock = p.equipmentInventory.items.find(i => i.uid === u1)!;
  assert.equal(itemAfterLock.locked, true);

  const r2 = tryDisassembleEquipment(p, u1);
  assert.equal(r2.ok, false);
  assert.equal(r2.reason, 'locked');

  // 3. 解锁后可以分解
  const resUnlock = toggleEquipmentLock(p, u1);
  assert.equal(resUnlock.ok, true);
  assert.equal(resUnlock.locked, false);

  const itemAfterUnlock = p.equipmentInventory.items.find(i => i.uid === u1)!;
  assert.equal(itemAfterUnlock.locked, false);

  const r3 = tryDisassembleEquipment(p, u1);
  assert.equal(r3.ok, true);
});

test('套装测试：火抗符文掉落池与3-5最高收益', () => {
  const cfg31 = getStageLootConfig('3-1')!;
  const cfg35 = getStageLootConfig('3-5')!;

  assert.ok(cfg31.possibleRuneIds?.includes('fire_guard_rune'));
  assert.ok(cfg35.possibleRuneIds?.includes('fire_guard_rune'));

  assert.ok(cfg35.equipmentDropRate > cfg31.equipmentDropRate);
  assert.ok((cfg35.runeDropRate ?? 0) > (cfg31.runeDropRate ?? 0));
});

test('套装测试：旧档迁移', () => {
  const ctx = new MockContext();
  // 模拟旧版存档，无套装字段，仅有装备uid穿戴记录
  ctx.storage.set(SAVE_KEY, JSON.stringify({
    version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0,
    equipmentInventory: {
      items: [
        { uid: 'eq_1', configId: 'lava_cannon', level: 0, obtainedAt: 123 },
        { uid: 'eq_2', configId: 'lava_armor', level: 0, obtainedAt: 124 }
      ],
      equipped: { weapon: 'eq_1', armor: 'eq_2' }
    }
  }));
  const p = new SaveManager(ctx.storage).load();
  const eff = getEquipmentSetEffects(p);
  // 从穿戴装备自动派生出套装效果，不报错
  assert.equal(eff.fireResist, 0.15);
  assert.equal(eff.attack, 5);
});

test('套装测试：无效配置ID处理', () => {
  const p = newPlayer();
  // 插入一个不存在 configId 的装备
  p.equipmentInventory.items.push({
    uid: 'invalid_eq', configId: 'nonexistent_lava_cannon', level: 0, obtainedAt: 123
  });
  p.equipmentInventory.equipped.weapon = 'invalid_eq';

  assert.doesNotThrow(() => {
    getEquipmentSetEffects(p);
    calculatePlayerBattleStats(p);
    getEquipmentPower(p);
  });
});
