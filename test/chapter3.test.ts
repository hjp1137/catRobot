import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultPlayerData } from '../dist/data/PlayerData.js';
import { getAllChapters, getChapterById, isChapterUnlocked } from '../dist/chapter/ChapterConfig.js';
import { getStageById } from '../dist/data/StageConfig.js';
import { ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { StatusEffectManager } from '../dist/player/StatusEffect.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { calculatePlayerBattleStats } from '../dist/data/EquipmentCalc.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { rollLoot, getStageLootConfig } from '../dist/data/Loot.js';
import { EQUIPMENT_CONFIGS } from '../dist/data/EquipmentConfig.js';
import { RUNE_CONFIGS } from '../dist/data/RuneConfig.js';
import { GameManager } from '../dist/core/GameManager.js';
import { SAVE_KEY } from '../dist/data/PlayerData.js';


test('1. 章节与关卡配置校验', () => {
  const chapters = getAllChapters();
  // 必须包含第三章
  assert.equal(chapters.length, 3);
  const ch3 = getChapterById('chapter3');
  assert.ok(ch3);
  assert.equal(ch3.theme, 'factory');
  assert.equal(ch3.unlockAfterStageId, '2-5');

  // 解锁条件校验
  const player = createDefaultPlayerData();
  assert.equal(isChapterUnlocked(player, 'chapter3'), false);
});

test('2. 火焰敌人属性与状态效果（燃烧/双抗）及真实实体战斗链校验', () => {
  const beetle = ENEMY_CONFIGS.fire_beetle;
  assert.ok(beetle);
  assert.equal(beetle.burnOnHit?.damagePerTick, 3);
  assert.equal(beetle.burnOnHit?.duration, 3);

  const ctx = new MockContext();
  const player = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);

  // 1. 真实实体接触测试：普通敌人不施加燃烧，火焰敌人施加燃烧
  const normalEnemy = new EnemyMouse(ctx.canvas, ENEMY_CONFIGS.mouse, 100, 100); // 坐标重合，接触
  const fireEnemy = new EnemyMouse(ctx.canvas, ENEMY_CONFIGS.fire_beetle, 100, 100); // 坐标重合，接触

  // 普通敌人攻击玩家，不施加燃烧
  normalEnemy.update(1.6, player);
  assert.equal(player.statusEffects.has('burn'), false);

  // 火焰敌人攻击玩家，施加燃烧
  fireEnemy.update(1.5, player);
  assert.equal(player.statusEffects.has('burn'), true);

  // 验证 tick 扣血 (熔岩甲虫每秒 3 点燃烧伤害)
  const hpBeforeTick = player.hp;
  player.statusEffects.update(1.1, player);
  assert.equal(hpBeforeTick - player.hp, 3);

  // 2. 燃烧刷新不叠层
  player.statusEffects.applyBurn(5, 5, 1);
  const burn = player.statusEffects.getBurn();
  assert.equal(burn?.remaining, 5);
  assert.equal(burn?.damagePerTick, 5);

  // 3. 毒火共存
  player.statusEffects.applyPoison(4, 2, 1);
  assert.ok(player.statusEffects.has('burn'));
  assert.ok(player.statusEffects.has('poison'));

  // 4. 火抗测试（0/50%/80%上限）
  // 火抗 0%
  const player0 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);
  player0.fireResist = 0;
  let hpBefore = player0.hp;
  player0.statusEffects.applyBurn(3, 10, 1);
  player0.statusEffects.update(1.1, player0);
  assert.equal(hpBefore - player0.hp, 10);

  // 火抗 50%
  const player50 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);
  player50.fireResist = 0.5;
  hpBefore = player50.hp;
  player50.statusEffects.applyBurn(3, 10, 1);
  player50.statusEffects.update(1.1, player50);
  assert.equal(hpBefore - player50.hp, 5);

  // 火抗 80% (上限控制：就算配成 90% 也被限制到 80%)
  const player80 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);
  player80.fireResist = 0.9;
  hpBefore = player80.hp;
  player80.statusEffects.applyBurn(3, 10, 1);
  player80.statusEffects.update(1.1, player80);
  assert.equal(hpBefore - player80.hp, 2); // 10 * (1 - 0.8) = 2

  // 5. 护盾减伤
  const playerShield = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);
  playerShield.skillState.use('heavy_shield'); // 激活护盾，默认减免 50%
  assert.ok(playerShield.shieldActive);
  hpBefore = playerShield.hp;
  playerShield.statusEffects.applyBurn(3, 10, 1);
  playerShield.statusEffects.update(1.1, playerShield);
  assert.equal(hpBefore - playerShield.hp, 5); // 10 * (1 - 0.5) = 5

  // 6. 死亡清理
  const playerDead = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 100, 100);
  playerDead.statusEffects.applyBurn(3, 10, 1);
  assert.ok(playerDead.statusEffects.has('burn'));
  playerDead.takeDamage(200); // 致命伤
  assert.ok(playerDead.dead);
  playerDead.update(0.1, []); // 触发更新
  assert.equal(playerDead.statusEffects.has('burn'), false); // 自动清理
});

test('3. 第三章掉落与存档写入校验', () => {
  // 配置存在与候选有效，且所有候选 ID 均存在于装备/符文配置中
  for (let i = 1; i <= 5; i++) {
    const stageId = `3-${i}`;
    const cfg = getStageLootConfig(stageId);
    assert.ok(cfg);
    assert.ok(cfg.possibleEquipmentIds.length > 0);
    
    // 校验装备候选 ID 存在于配置中
    for (const eqId of cfg.possibleEquipmentIds) {
      assert.ok(EQUIPMENT_CONFIGS[eqId], `关卡 ${stageId} 掉落的装备 ID ${eqId} 应该存在于装备配置中`);
    }
    
    // 校验符文候选 ID 存在于配置中
    if (cfg.possibleRuneIds) {
      for (const runeId of cfg.possibleRuneIds) {
        assert.ok(RUNE_CONFIGS[runeId], `关卡 ${stageId} 掉落的符文 ID ${runeId} 应该存在于符文配置中`);
      }
    }
  }

  // 3-5 概率更高，且不使用 Boss 专属逻辑
  const cfg31 = getStageLootConfig('3-1')!;
  const cfg35 = getStageLootConfig('3-5')!;
  assert.ok(cfg35.equipmentDropRate > cfg31.equipmentDropRate);

  // 实际调用掉落逻辑，并真实写入背包与存档验证
  const ctx = new MockContext();
  const game = new GameManager(ctx);

  // 1. 模拟第一次战斗胜利：掉落 lava_cannon
  let callCount1 = 0;
  ctx.random = () => {
    callCount1++;
    if (callCount1 === 1) return 0.5; // 强化石奖励
    if (callCount1 === 2) return 0.1; // r1: 装备掉落 (0.1 < 0.5)
    if (callCount1 === 3) return 0.9; // r2: 装备品质 (0.9 -> epic)
    if (callCount1 === 4) return 0.55; // r3: 装备候选索引 3 (0.55 * 6 = 3.3 -> lava_cannon)
    return 0;
  };

  const outcome1 = {
    win: true,
    stageId: '3-5',
    elapsedSec: 10,
    hpRatio: 0.9,
    clearResult: null,
    loot: null,
  };

  game.finishBattle(outcome1 as any);

  // 验证掉落结果
  assert.ok(outcome1.loot, '应该有掉落结算');
  assert.equal(outcome1.loot.equipmentConfigId, 'lava_cannon');

  // 验证是否真实写入玩家装备背包
  const hasLavaCannon = game.player.equipmentInventory.items.some(
    item => item.configId === 'lava_cannon'
  );
  assert.ok(hasLavaCannon, '熔岩重炮应当存入装备背包');

  // 验证是否真实保存到存档中
  const rawSave1 = ctx.storage.get(SAVE_KEY);
  assert.ok(rawSave1, '存档应该被保存');
  const saveObj1 = JSON.parse(rawSave1);
  const savedHasLavaCannon = saveObj1.equipmentInventory.items.some(
    (item: any) => item.configId === 'lava_cannon'
  );
  assert.ok(savedHasLavaCannon, '熔岩重炮应当写入存档文件');

  // 2. 模拟第二次战斗胜利：掉落 fire_guard_rune
  let callCount2 = 0;
  ctx.random = () => {
    callCount2++;
    if (callCount2 === 1) return 0.5; // 强化石奖励
    if (callCount2 === 2) return 0.8; // r1: 不掉落装备
    if (callCount2 === 3) return 0.1; // r2: 掉落符文 (0.1 < 0.22)
    if (callCount2 === 4) return 0.8; // r3: 符文候选索引 3 (0.8 * 4 = 3.2 -> fire_guard_rune)
    return 0;
  };

  const outcome2 = {
    win: true,
    stageId: '3-5',
    elapsedSec: 15,
    hpRatio: 0.8,
    clearResult: null,
    loot: null,
  };

  game.finishBattle(outcome2 as any);

  // 验证掉落结果
  assert.ok(outcome2.loot, '应该有掉落结算');
  assert.equal(outcome2.loot.runeConfigId, 'fire_guard_rune');

  // 验证是否真实写入玩家符文背包
  const hasFireRune = game.player.runeInventory.some(
    rune => rune.configId === 'fire_guard_rune'
  );
  assert.ok(hasFireRune, '避火符文应当存入符文背包');

  // 验证是否真实保存到存档中
  const rawSave2 = ctx.storage.get(SAVE_KEY);
  assert.ok(rawSave2, '存档应该被保存');
  const saveObj2 = JSON.parse(rawSave2);
  const savedHasFireRune = saveObj2.runeInventory.some(
    (rune: any) => rune.configId === 'fire_guard_rune'
  );
  assert.ok(savedHasFireRune, '避火符文应当写入存档文件');
});
