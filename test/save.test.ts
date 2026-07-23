/**
 * 存档系统单测
 * 覆盖：首次读档返回默认、写后读一致、脏存档回退默认、版本号、属性派生
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { createDefaultPlayerData, SAVE_KEY, SAVE_VERSION } from '../dist/data/PlayerData.js';
import { SAVE_BACKUP_KEY, SAVE_CORRUPT_KEY, SAVE_TMP_KEY } from '../dist/core/SaveManager.js';
import { getMechaStats, ORANGE_CAT } from '../dist/data/MechaConfig.js';

function newSave() {
  const ctx = new MockContext();
  return { ctx, save: new SaveManager(ctx.storage) };
}

test('首次读档 = 默认存档', () => {
  const { save } = newSave();
  const p = save.load();
  assert.equal(p.level, 1);
  assert.equal(p.gold, 0);
  assert.equal(p.parts, 0);
  assert.equal(p.mechaId, 'orange_cat');
});

test('写后读一致', () => {
  const { save } = newSave();
  const p = createDefaultPlayerData();
  p.level = 5;
  p.gold = 999;
  p.parts = 42;
  p.stageProgress['1-1'] = { cleared: true, bestStars: 2, clearCount: 1 };
  save.save(p);
  const r = save.load();
  assert.equal(r.level, 5);
  assert.equal(r.gold, 999);
  assert.equal(r.parts, 42);
  assert.equal(r.stageProgress['1-1']?.cleared, true);
  assert.equal(r.stageProgress['1-1']?.bestStars, 2);
  assert.deepEqual(r.unlockedStageIds, ['1-1']);
});

test('脏存档回退默认（不抛错）', () => {
  const { ctx, save } = newSave();
  ctx.storage.set(SAVE_KEY, '{ 这不是 json');
  const p = save.load();
  assert.equal(p.level, 1);
  assert.equal(p.gold, 0);
});

test('字段缺失会被补齐（migrate 防御）', () => {
  const { ctx, save } = newSave();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ level: 7 })); // 缺 gold/parts/mechaId
  const p = save.load();
  assert.equal(p.level, 7);
  assert.equal(p.gold, 0);
  assert.equal(p.parts, 0);
  assert.equal(p.mechaId, 'orange_cat');
});

test('reset 清空存档', () => {
  const { ctx, save } = newSave();
  save.save({ ...createDefaultPlayerData(), level: 9 });
  assert.ok(ctx.storage.get(SAVE_KEY));
  const fresh = save.reset();
  assert.equal(fresh.level, 1);
  assert.equal(ctx.storage.get(SAVE_KEY), null);
});

test('属性派生：等级越高 hp/attack/power 越高', () => {
  const s1 = getMechaStats(ORANGE_CAT, 1);
  const s5 = getMechaStats(ORANGE_CAT, 5);
  // 任务1.1 平衡调整后：baseHp=120, baseAtk=10
  assert.equal(s1.maxHp, 120);
  assert.equal(s1.attack, 10);
  assert.equal(s1.power, 120 + 10 * 10);
  // Lv5: 120 + 4*20=200 hp, 10 + 4*5=30 atk
  assert.equal(s5.maxHp, 200);
  assert.equal(s5.attack, 30);
  assert.equal(s5.power, 200 + 30 * 10);
  assert.ok(s5.power > s1.power);
});

test('旧档迁移：无效装备、无效符文、无效穿戴 UID 和无效已装备符文', () => {
  const { ctx, save } = newSave();
  const rawSave = {
    level: 2,
    equipmentInventory: {
      items: [
        { uid: 'eq_valid_1', configId: 'lava_cannon', level: 1, obtainedAt: 100 },
        { uid: 'eq_invalid_2', configId: 'non_existent_equip', level: 1, obtainedAt: 200 },
      ],
      equipped: {
        weapon: 'eq_valid_1',
        armor: 'eq_invalid_2', // 无效装备穿戴
        core: 'eq_non_existent_uid', // 不存在装备的 UID
      }
    },
    runeInventory: [
      { uid: 'rune_valid_1', configId: 'fire_guard_rune', obtainedAt: 100 },
      { uid: 'rune_valid_2', configId: 'cannon_rune_1', obtainedAt: 110 },
      { uid: 'rune_valid_3', configId: 'shield_rune_1', obtainedAt: 120 },
      { uid: 'rune_invalid_4', configId: 'non_existent_rune', obtainedAt: 130 },
    ],
    equippedRunes: [
      'rune_valid_1',
      'rune_invalid_4', // 无效已装备符文
      'rune_valid_2',
      'rune_valid_3', // 超过2个
      'rune_non_existent', // 不存在的 UID
    ],
  };

  ctx.storage.set(SAVE_KEY, JSON.stringify(rawSave));
  const p = save.load();

  // 1. 无效装备过滤断言
  const eqItems = p.equipmentInventory.items;
  assert.ok(eqItems.some(i => i.uid === 'eq_valid_1'));
  assert.ok(!eqItems.some(i => i.uid === 'eq_invalid_2'));

  // 2. 无效穿戴 UID 清理断言
  assert.equal(p.equipmentInventory.equipped.weapon, 'eq_valid_1');
  assert.equal(p.equipmentInventory.equipped.armor, undefined);
  assert.equal(p.equipmentInventory.equipped.core, undefined);

  // 3. 无效符文过滤断言
  const runeItems = p.runeInventory;
  assert.ok(runeItems.some(r => r.uid === 'rune_valid_1'));
  assert.ok(runeItems.some(r => r.uid === 'rune_valid_2'));
  assert.ok(runeItems.some(r => r.uid === 'rune_valid_3'));
  assert.ok(!runeItems.some(r => r.uid === 'rune_invalid_4'));

  // 4. 无效已装备符文与上限断言
  assert.deepEqual(p.equippedRunes, ['rune_valid_1', 'rune_valid_2']);
});

test('任务27：v1旧档升级v2并保留装备、符文、材料和旧进度', () => {
  const { ctx, save } = newSave();
  const old = createDefaultPlayerData() as any;
  old.version = 1;
  delete old.settledStageRunIds;
  old.gold = 77;
  old.materials.enhanceStone = 9;
  old.equipmentInventory.items = [{ uid: 'eq1', configId: 'rusty_claw', level: 0, obtainedAt: 1 }];
  old.runeInventory = [{ uid: 'r1', configId: 'cannon_rune_1', obtainedAt: 1 }];
  old.stageProgress['1-1'] = { cleared: true, bestStars: 2, clearCount: 1 };
  ctx.storage.set(SAVE_KEY, JSON.stringify(old));

  const migrated = save.load();
  assert.equal(migrated.version, SAVE_VERSION);
  assert.equal(migrated.gold, 77);
  assert.equal(migrated.materials.enhanceStone, 9);
  assert.equal(migrated.equipmentInventory.items.length, 1);
  assert.equal(migrated.runeInventory.length, 1);
  assert.deepEqual(migrated.settledStageRunIds, []);
  assert.deepEqual(migrated.stageProgress['1-1'].claimedObjectiveRewardIds, []);
});

test('任务27：安全写入保留备份并清理临时键', () => {
  const { ctx, save } = newSave();
  const first = createDefaultPlayerData(); first.gold = 10; save.save(first);
  const second = { ...first, gold: 20 }; save.save(second);
  const snapshot = (ctx.storage as any).snapshot();
  assert.equal(JSON.parse(snapshot[SAVE_BACKUP_KEY]).gold, 10);
  assert.equal(snapshot[SAVE_TMP_KEY], undefined);
  assert.equal(save.load().gold, 20);
});

test('任务27：中断临时档可恢复，损坏正式档保留原文后回退默认', () => {
  const { ctx, save } = newSave();
  const pending = { ...createDefaultPlayerData(), gold: 33 };
  ctx.storage.set(SAVE_TMP_KEY, JSON.stringify(pending));
  assert.equal(save.load().gold, 33);
  ctx.storage.set(SAVE_KEY, '{broken');
  const recovered = save.load();
  assert.equal(recovered.gold, 0);
  assert.equal(ctx.storage.get(SAVE_CORRUPT_KEY), '{broken');
});

test('任务27：正式档损坏时从最近有效备份恢复', () => {
  const ctx = new MockContext();
  const backup = createDefaultPlayerData(); backup.gold = 88;
  ctx.storage.set(SAVE_BACKUP_KEY, JSON.stringify(backup));
  ctx.storage.set(SAVE_KEY, '{broken');
  const loaded = new SaveManager(ctx.storage).load();
  assert.equal(loaded.gold, 88);
  assert.equal(ctx.storage.get(SAVE_CORRUPT_KEY), '{broken');
});

test('任务27：正式写入失败必须返回失败且保留可恢复临时档', () => {
  const { ctx, save } = newSave();
  const originalSet = ctx.storage.set.bind(ctx.storage);
  (ctx.storage as any).set = (key: string, value: string) => {
    if (key === SAVE_KEY) throw new Error('disk-full');
    originalSet(key, value);
  };
  const player = createDefaultPlayerData(); player.gold = 66;
  assert.equal(save.save(player), false);
  assert.equal(JSON.parse(ctx.storage.get(SAVE_TMP_KEY)!).gold, 66);
});

test('任务28：v2旧档升级并保留资产和关卡进度且补齐战役字段', () => {
  const { ctx, save } = newSave();
  const old = createDefaultPlayerData() as any;
  old.version = 2;
  delete old.campaignProgress;
  old.gold = 91;
  old.materials.enhanceStone = 12;
  old.equipmentInventory.items = [{ uid: 'eq28', configId: 'rusty_claw', level: 2, obtainedAt: 1 }];
  old.runeInventory = [{ uid: 'r28', configId: 'cannon_rune_1', obtainedAt: 1 }];
  old.stageProgress['1-1'] = { cleared: true, bestStars: 3, clearCount: 2 };
  ctx.storage.set(SAVE_KEY, JSON.stringify(old));

  const migrated = save.load();
  assert.equal(SAVE_VERSION, 4);
  assert.equal(migrated.gold, 91);
  assert.equal(migrated.materials.enhanceStone, 12);
  assert.equal(migrated.equipmentInventory.items[0].uid, 'eq28');
  assert.equal(migrated.runeInventory[0].uid, 'r28');
  assert.equal(migrated.stageProgress['1-1'].bestStars, 3);
  assert.deepEqual(migrated.campaignProgress, {
    currentCampaignId: undefined, currentChapterId: undefined, recentStageId: undefined,
    newlyUnlockedNodeIds: [], playedUnlockNodeIds: [], completedChapterIds: [],
    chapterStars: {}, claimedChapterRewardIds: [],
  });
});

for (const version of [1, 2, 3]) test(`任务29：schemaVersion ${version}升级到v4并保留业务数据`, () => {
  const { ctx, save } = newSave(); const old = createDefaultPlayerData() as any;
  old.version = version; delete old.tutorial; old.gold = 91; old.materials.enhanceStone = 12;
  old.equipmentInventory.items = [{ uid: `eq${version}`, configId: 'rusty_claw', level: 2, obtainedAt: 1 }];
  old.stageProgress['1-1'] = { cleared: true, bestStars: 3, clearCount: 2 };
  ctx.storage.set(SAVE_KEY, JSON.stringify(old));
  const migrated = save.load();
  assert.equal(SAVE_VERSION, 4); assert.equal(migrated.version, 4); assert.equal(migrated.gold, 91);
  assert.equal(migrated.materials.enhanceStone, 12); assert.equal(migrated.equipmentInventory.items[0].uid, `eq${version}`);
  assert.equal(migrated.stageProgress['1-1'].bestStars, 3);
  assert.deepEqual(migrated.tutorial, {
    schemaVersion: 1, startedFlowIds: [], currentFlowId: undefined, currentStepId: undefined,
    completedStepIds: [], completedFlowIds: [], skippedFlowIds: [], unlockedFeatureIds: [],
    pendingUnlockNoticeIds: [], updatedAt: 0, recoveryCount: 0,
  });
});

test('任务29：损坏Tutorial字段安全恢复且不重置其他玩家数据', () => {
  const { ctx, save } = newSave(); const old = createDefaultPlayerData() as any;
  old.gold = 321; old.tutorial = { completedStepIds: 'bad', recoveryCount: -5, unlockedFeatureIds: [1, 'feature.campaign', 'feature.campaign'] };
  ctx.storage.set(SAVE_KEY, JSON.stringify(old)); const migrated = save.load();
  assert.equal(migrated.gold, 321); assert.deepEqual(migrated.tutorial.completedStepIds, []);
  assert.equal(migrated.tutorial.recoveryCount, 0); assert.deepEqual(migrated.tutorial.unlockedFeatureIds, ['feature.campaign']);
});
