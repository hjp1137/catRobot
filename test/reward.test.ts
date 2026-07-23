import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { getStageById } from '../dist/data/StageConfig.js';

test('1-1 关卡奖励与引导额外装备掉落机制测试', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);

  // 1. 首次通关，且掷骰也产生普通装备掉落，验证并存
  game.player.gold = 0;
  game.player.parts = 0;
  game.player.stageProgress = {};
  game.player.tutorialFinished = false;
  game.player.equipmentInventory.items = [];

  // 控制随机数，使其 100% 掉落普通关卡装备
  let randCount = 0;
  ctx.random = () => {
    randCount++;
    if (randCount === 1) return 0.01; // 装备掉落率 0.2，0.01 触发掉落
    if (randCount === 2) return 0.01; // 选择 common 品质
    return 0.1;
  };

  const outcomeFirst = {
    win: true,
    stageId: '1-1',
    elapsedSec: 30,
    hpRatio: 1.0,
    clearResult: null,
    loot: null as any
  };

  game.finishBattle(outcomeFirst);

  // 断言并存：普通关卡掉落与引导额外奖励并存
  assert.ok(outcomeFirst.loot, '首次通关应当产生掉落 loot 结果');
  assert.ok(outcomeFirst.loot.equipmentConfigId, '首次通关应当产生普通装备掉落');
  assert.equal(outcomeFirst.loot.tutorialEquipmentConfigId, 'rusty_claw', '首次通关应当获得新手引导额外奖励装备 rusty_claw');
  assert.equal(game.player.equipmentInventory.items.length, 2, '背包中应该同时有普通掉落装备与引导额外装备');

  // 断言基础金币与零件满额发放 (100% 奖励)
  assert.equal(game.player.gold, 50, '首次通关应当获得 100% 金币（50）');
  assert.equal(game.player.parts, 5, '首次通关应当获得 100% 零件（5）');

  // 2. 第二次通关（重复挑战），验证仅首次发放引导奖励，且普通奖励折半
  const outcomeRepeat = {
    win: true,
    stageId: '1-1',
    elapsedSec: 30,
    hpRatio: 1.0,
    clearResult: null,
    loot: null as any
  };

  randCount = 0; // 重置随机数计数，再次触发普通装备掉落
  game.finishBattle(outcomeRepeat);

  // 断言重复挑战：不发放引导奖励，只发放普通装备掉落
  assert.ok(outcomeRepeat.loot, '重复挑战仍应产生掉落');
  assert.ok(outcomeRepeat.loot.equipmentConfigId, '重复挑战应该产生普通装备掉落');
  assert.equal(outcomeRepeat.loot.tutorialEquipmentConfigId, undefined, '重复挑战时不应该重复发放新手引导额外奖励');
  
  // 重复挑战奖励折半：50 * 50% = 25 金币，共 75；5 * 50% = 2 零件，共 7
  assert.equal(game.player.gold, 75, '重复挑战获得折半金币，累计 75');
  assert.equal(game.player.parts, 7, '重复挑战获得折半零件，累计 7');

  // 3. 挑战失败场景，验证不发放任何奖励
  const oldGold = game.player.gold;
  const oldParts = game.player.parts;
  const oldItemsCount = game.player.equipmentInventory.items.length;

  const outcomeFail = {
    win: false,
    stageId: '1-1',
    elapsedSec: 30,
    hpRatio: 0.0,
    clearResult: null,
    loot: null as any
  };

  game.finishBattle(outcomeFail);

  // 断言挑战失败：无任何增益
  assert.equal(game.player.gold, oldGold, '挑战失败金币不应改变');
  assert.equal(game.player.parts, oldParts, '挑战失败零件不应改变');
  assert.equal(game.player.equipmentInventory.items.length, oldItemsCount, '挑战失败背包物品数不应改变');
  assert.equal(outcomeFail.loot, null, '挑战失败不产生任何掉落');

  // 4. 当背包已满（超过或等于 60 件）时，验证掉落折算
  // 重置 1-1 通关进度
  game.player.stageProgress = {};
  game.player.tutorialFinished = false;
  game.player.materials = { enhanceStone: 0 };
  
  // 强行把背包塞满到 60 件
  game.player.equipmentInventory.items = Array(60).fill({ uid: 'mock_uid', configId: 'rusty_claw' });

  const outcomeFirstFull = {
    win: true,
    stageId: '1-1',
    elapsedSec: 30,
    hpRatio: 1.0,
    clearResult: null,
    loot: null as any
  };

  randCount = 0;
  game.finishBattle(outcomeFirstFull);

  // 断言背包已满时的折算
  assert.ok(outcomeFirstFull.loot, '背包满首次通关仍然产生结算掉落结果');
  assert.equal(outcomeFirstFull.loot.fullBagConverted, true, '普通装备掉落应该标记为折算');
  assert.equal(outcomeFirstFull.loot.tutorialFullBagConverted, true, '引导额外奖励应该标记为折算');
  assert.equal(game.player.equipmentInventory.items.length, 60, '背包大小应该保持 60 不变');
  // rusty_claw 的 rarity 是 common，折算强化石数量是 2 颗。
  // 普通掉落也是 rusty_claw，折算 2 颗，引导额外奖励也是 2 颗，胜利掉落结算 1 颗，累计增加 5 颗
  assert.equal(game.player.materials.enhanceStone, 5, '满包折算增加的强化石数量应为 5 颗（额外胜利奖励 1 颗 + 首通保底折算 2 颗 + 普通掉落折算 2 颗）');
});

test('1-1 首次通关强制普通符文掉落与引导额外装备并存测试', async () => {
  const { STAGE_LOOT_CONFIGS } = await import('../dist/data/Loot.js');
  const { ResultUI } = await import('../dist/ui/ResultUI.js');
  const originCfg = { ...STAGE_LOOT_CONFIGS['1-1'] };

  try {
    // 强制增加普通符文掉落配置
    STAGE_LOOT_CONFIGS['1-1'].runeDropRate = 0.5;
    STAGE_LOOT_CONFIGS['1-1'].possibleRuneIds = ['cannon_rune_1'];

    const ctx = new MockContext();
    const game = new GameManager(ctx);

    game.player.gold = 0;
    game.player.parts = 0;
    game.player.stageProgress = {};
    game.player.tutorialFinished = false;
    game.player.equipmentInventory.items = [];
    game.player.runeInventory = [];

    // 控制随机数：
    // 第1次 random：rollLoot 的 r1 (装备判定) -> 0.9 (大于 0.2，不掉装备)
    // 第2次 random：rollLoot 的 r2 (符文判定) -> 0.1 (小于 0.5，掉符文)
    // 第3次 random：rollLoot 的 r3 (符文选择) -> 0.0 (选择 cannon_rune_1)
    // 第4次 random：落入 enhanceStone 奖励判定，返回 0 保证稳定
    let randCount = 0;
    ctx.random = () => {
      randCount++;
      if (randCount === 1) return 0.9;
      if (randCount === 2) return 0.1;
      if (randCount === 3) return 0.0;
      return 0.0;
    };

    const outcome = {
      win: true,
      stageId: '1-1',
      elapsedSec: 30,
      hpRatio: 1.0,
      clearResult: null,
      loot: null as any
    };

    game.finishBattle(outcome);

    // 断言符文与引导额外装备并存
    assert.ok(outcome.loot, '应该产生掉落结果');
    assert.equal(outcome.loot.runeConfigId, 'cannon_rune_1', '应当成功掉落普通符文 cannon_rune_1');
    assert.equal(outcome.loot.tutorialEquipmentConfigId, 'rusty_claw', '应当成功获得新手引导额外装备 rusty_claw');
    
    // 断言已写入背包
    assert.ok(game.player.runeInventory.some(r => r.configId === 'cannon_rune_1'), '符文背包中应当写入符文 cannon_rune_1');
    assert.ok(game.player.equipmentInventory.items.some(i => i.configId === 'rusty_claw'), '装备背包中应当写入引导装备 rusty_claw');

    // 验证 ResultUI 绘制展示正常（无崩溃），且同时绘制符文与引导额外装备名称
    const fillTextCalls: string[] = [];
    const originFillText = (ctx.canvas as any).fillText;
    (ctx.canvas as any).fillText = (text: string, x: number, y: number) => {
      fillTextCalls.push(text);
      if (originFillText) {
        originFillText.call(ctx.canvas, text, x, y);
      }
    };

    const resultUI = new ResultUI(ctx, game);
    resultUI.render();

    (ctx.canvas as any).fillText = originFillText;

    const hasRuneName = fillTextCalls.some(t => t.includes('炮击符文'));
    const hasEquipName = fillTextCalls.some(t => t.includes('锈蚀猫爪炮'));
    assert.ok(hasRuneName, '结算界面应绘制符文名称 "炮击符文"');
    assert.ok(hasEquipName, '结算界面应绘制引导额外装备名称 "锈蚀猫爪炮"');
  } finally {
    // 恢复配置
    STAGE_LOOT_CONFIGS['1-1'] = originCfg;
  }
});
