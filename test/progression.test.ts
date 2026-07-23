import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { ALL_STAGE_ORDER, getStageById } from '../dist/data/StageConfig.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { ResultUI } from '../dist/ui/ResultUI.js';
import { ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import type { StageConfig } from '../src/data/StageConfig.js';

const FIXED_SCREEN_WAVE_FIXTURE: StageConfig = {
  ...STAGE_1_1,
  contentStageId: undefined,
  enemies: [],
  waves: [
    { id: 'fixture-w1', name: '第一波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 0 },
    { id: 'fixture-w2', name: '第二波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
    { id: 'fixture-w3', name: '第三波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
  ],
};

test('游戏连续游玩回归：从 1-1 直至通关第三章 3-5 BOSS 关', () => {
  const ctx = new MockContext();
  let game = new GameManager(ctx);
  const bm = new BattleManager(ctx, game);
  game.setBattle(bm);
  // 先把引导置为已完成，防止干扰连续挑战
  game.player.tutorialFinished = true;

  // 辅助战斗挂机推进函数：通过真实策略直到分出胜负
  function runBattle(g: GameManager, autoMove = true): void {
    const bm = g.battle;
    if (!bm) return;
    let frame = 0;
    const dt = 1 / 60;
    while (g.lastOutcome === null && frame < 18000) {
      ctx.advance(dt);
      if (bm.player && !bm.player.dead) {
        // 自动使用技能
        const states = bm.getPlayerSkillStates();
        const cannon = states.find((s: any) => s.skillId === 'meow_cannon');
        if (cannon && cannon.cooldownRemaining <= 0) {
          bm.usePlayerSkill('meow_cannon');
        }
        const shield = states.find((s: any) => s.skillId === 'heavy_shield');
        if (shield && shield.cooldownRemaining <= 0) {
          bm.usePlayerSkill('heavy_shield');
        }

        // 挂机走位
        if (autoMove) {
          let closestEnemy = null;
          let minDist = Infinity;
          for (const e of bm.enemies) {
            if (e.dead) continue;
            const d = Math.hypot(e.x - bm.player.x, e.y - bm.player.y);
            if (d < minDist) {
              minDist = d;
              closestEnemy = e;
            }
          }
          if (closestEnemy) {
            const dx = closestEnemy.x - bm.player.x;
            const dy = closestEnemy.y - bm.player.y;
            const d = Math.hypot(dx, dy);
            if (d > 0) {
              // 智能风筝走位拉扯
              if (d < 80) {
                ctx.input.moveX = -dx / d;
                ctx.input.moveY = -dy / d;
              } else if (d > 105) {
                ctx.input.moveX = dx / d;
                ctx.input.moveY = dy / d;
              } else {
                ctx.input.moveX = 0;
                ctx.input.moveY = 0;
              }
            }
          } else {
            ctx.input.moveX = 0;
            ctx.input.moveY = 0;
          }
        } else {
          ctx.input.moveX = 0;
          ctx.input.moveY = 0;
        }
      }
      g.tick(dt);
      frame++;
    }
  }

  // 1. 通关 1-1 并测试掉落与升级
  bm.start(FIXED_SCREEN_WAVE_FIXTURE);
  game.scene = 'battle';
  runBattle(game);
  
  const outcome1_1 = game.lastOutcome;
  assert.ok(outcome1_1 && outcome1_1.win, '1-1 应该顺利通关');
  assert.ok(game.player.gold > 0, '通关 1-1 后应该获得金币');
  
  // 检查掉落是否应用并穿戴
  const loot1_1 = outcome1_1.loot;
  if (loot1_1 && loot1_1.equipmentConfigId) {
    const item = game.player.equipmentInventory.items.find(i => i.configId === loot1_1.equipmentConfigId);
    assert.ok(item, '掉落的装备应当写入背包');
    const equipOk = game.doEquipItem(item.uid);
    assert.ok(equipOk, '穿戴装备应当成功');
  }

  // 升级机甲属性
  const goldBefore = game.player.gold;
  while (game.player.gold >= game.player.level * 50 && game.player.parts >= game.player.level * 5) {
    const upgradeRes = game.doUpgrade();
    if (!upgradeRes.ok) break;
  }
  assert.ok(game.player.level >= 1, '属性升级应该正常进行');

  // 2. 模拟 1-2 战败及重新挑战重置逻辑
  const ok1_2 = game.startBattle('1-2');
  assert.ok(ok1_2);
  
  // 为了确保战败，我们临时削弱玩家属性，并不做任何走位
  const oldLevel = game.player.level;
  const oldGold = game.player.gold;
  const oldParts = game.player.parts;
  const oldItemsCount = game.player.equipmentInventory.items.length;
  
  // 注入战败 mock 属性（低生命）
  Object.defineProperty(game, 'battleStats', {
    get: () => ({
      maxHp: 1, // 碰一下就死
      attack: 1,
      attackInterval: 1.0,
      attackRange: 10,
      speed: 10,
      criticalRate: 0,
      criticalDamage: 1,
      damageReduction: 0,
      poisonResist: 0,
      burnResist: 0,
    }),
    configurable: true
  });
  
  const oldBattle = game.battle!;
  game.beginBattle();
  runBattle(game, false); // 不移动，等死
  
  const outcome1_2_fail = game.lastOutcome;
  assert.ok(outcome1_2_fail && !outcome1_2_fail.win, '临时削弱后挑战 1-2 应当失败');
  assert.equal(game.player.gold, oldGold, '战败不应获得金币');
  assert.equal(game.player.parts, oldParts, '战败不应获得零件');
  assert.equal(game.player.equipmentInventory.items.length, oldItemsCount, '战败不应掉落任何装备');

  // 恢复正常属性并测试重新挑战重置
  delete (game as any).battleStats; // 移除战败 mock 属性
  
  // 实例化真实的 ResultUI 并模拟点击“重新挑战”
  const resultUI = new ResultUI(ctx, game);
  const w = ctx.canvasWidth;
  const h = ctx.canvasHeight;
  const btnW = w * 0.7;
  const btnX = (w - btnW) / 2;
  const clickX = btnX + btnW / 2;
  const clickY = h - 176 + 22; // retryBtn 中心点
  (ctx.input as any).tapX = clickX;
  (ctx.input as any).tapY = clickY;
  resultUI.handleClick();

  const bmRetry = game.battle;
  assert.ok(bmRetry);
  assert.strictEqual(bmRetry, oldBattle, '重新挑战应复用同一个 BattleManager 实例');
  assert.equal(bmRetry.stage.id, '1-2', '当前关卡应当是1-2');
  assert.equal(bmRetry.player.hp, bmRetry.player.maxHp, '重新挑战后玩家生命应当恢复');
  assert.equal(bmRetry.player.statusEffects.has('poison'), false, '重新挑战后玩家毒液状态应当清空');
  assert.equal(bmRetry.player.statusEffects.has('burn'), false, '重新挑战后玩家燃烧状态应当清空');
  assert.equal(bmRetry.player.skillState.canUse('meow_cannon'), true, '重新挑战后喵能炮冷却应当重置');
  assert.equal(bmRetry.player.skillState.canUse('heavy_shield'), true, '重新挑战后重盾冷却应当重置');
  assert.equal(bmRetry.waveManager.currentWaveIndex, 0, '重新挑战后波次索引应当重置为0');

  // 推进一帧以生成第一波敌人
  game.tick(1 / 60);

  assert.equal(bmRetry.enemies.length, 5, '重新挑战后敌人列表应当重置为初始关卡配置数量');
  assert.equal(bmRetry.enemies.some(e => e.dead), false, '重新挑战后所有敌人均应是存活状态');
  assert.equal(bmRetry.enemies.filter(e => e.variant === 'boss').length, 0, '重新挑战后不应有Boss残留');
  
  // 确保所有敌人身上的 Boss/环境技能和熔岩池、毒液领域已被清空
  for (const e of bmRetry.enemies) {
    if (e.pollutionSkill) {
      assert.equal(e.pollutionSkill.getFieldRenderState(), null, '污染领域状态应当清空');
      assert.equal(e.pollutionSkill.getEruptionRenderState(), null, '污染喷发状态应当清空');
    }
    if (e.furnaceSkill) {
      assert.equal(e.furnaceSkill.getRoarRenderState(), null, '熔岩咆哮状态应当清空');
      assert.equal(e.furnaceSkill.getFissureRenderState(), null, '熔岩裂隙状态应当清空');
      assert.equal(e.furnaceSkill.getLavaPools().length, 0, '环境熔岩池数量应当重置为0');
    }
  }
  
  runBattle(game);
  const outcome1_2_win = game.lastOutcome;
  assert.ok(outcome1_2_win && outcome1_2_win.win, '恢复属性后打 1-2 应当胜利');

  // 3. 通关第一章 1-5 Boss 并进行存档重启测试
  for (const stageId of ['1-3', '1-4', '1-5']) {
    game.startBattle(stageId);
    game.beginBattle();
    runBattle(game);
    assert.ok(game.lastOutcome && game.lastOutcome.win, `通关 ${stageId} 应当胜利`);
    
    // 穿装备与属性升级
    const outcome = game.lastOutcome;
    if (outcome && outcome.loot && outcome.loot.equipmentConfigId) {
      const item = game.player.equipmentInventory.items.find(i => i.configId === outcome.loot?.equipmentConfigId);
      if (item) game.doEquipItem(item.uid);
    }
    // 强化装备
    if (game.player.materials?.enhanceStone && game.player.materials.enhanceStone > 0) {
      const equippedWeapon = game.player.equipmentInventory.equipped['weapon'];
      if (equippedWeapon) {
        game.doEnhanceEquipment(equippedWeapon);
      }
    }
    // 升级
    while (game.player.gold >= game.player.level * 50 && game.player.parts >= game.player.level * 5) {
      game.doUpgrade();
    }
  }

  // 1-5 胜利后存档并重启游戏实例
  game.save.save(game.player);
  
  // 销毁并重建 GameManager 实例 (重启)
  const savedPlayer = game.player;
  game = new GameManager(ctx);
  const newBm = new BattleManager(ctx, game);
  game.setBattle(newBm);
  assert.equal(game.player.stageProgress['1-5']?.cleared, true, '重启后存档进度应当被继承');
  assert.deepEqual(game.player.equipmentInventory.equipped, savedPlayer.equipmentInventory.equipped, '重启后穿戴的装备应当正确继承');

  // 4. 连续推进，直至通过 3-5 Boss 关
  const remainingStages = ALL_STAGE_ORDER.slice(ALL_STAGE_ORDER.indexOf('2-1'));
  for (const stageId of remainingStages) {
    if (stageId === '2-5') {
      // 2-5 特殊测试：在正常胜利前，先测试战败并重试
      const failOk = game.startBattle('2-5');
      assert.ok(failOk);
      game.beginBattle();
      
      // 使用玩家技能使其进入冷却
      game.battle!.usePlayerSkill('meow_cannon');
      game.battle!.usePlayerSkill('heavy_shield');
      assert.equal(game.battle!.player.skillState.canUse('meow_cannon'), false);
      assert.equal(game.battle!.player.skillState.canUse('heavy_shield'), false);

      // 记录 Boss 加入前的敌人
      const countBeforeBoss = game.battle!.enemies.length;

      // 手动生成 2-5 Boss (pollution_core_queen) 并注入状态
      const bossCfg = ENEMY_CONFIGS['pollution_core_queen'];
      assert.ok(bossCfg);
      const boss = new EnemyMouse(ctx, bossCfg, 200, 200);
      const oldPollutionSkill = boss.pollutionSkill; // 保存旧 Boss 技能引用
      if (boss.pollutionSkill) {
        boss.pollutionSkill.onSummon = (count: number) => (game.battle! as any).summonMice(count);
      }
      game.battle!.enemies.push(boss);

      // 记录召唤前
      const countBeforeSummon = game.battle!.enemies.length;
      assert.equal(countBeforeSummon, countBeforeBoss + 1);

      // 将波次修改为第 3 波 (0-based)
      (game.battle!.waveManager as any).currentIndex = 3;
      (game.battle!.waveManager as any).currentSpawned = true;

      // 降低 Boss 生命触发召唤
      boss.hp = boss.maxHp * 0.4;
      boss.update(1 / 60, game.battle!.player); // 触发召唤小怪
      
      // 记录召唤后并证明小鼠真实出现
      const countAfterSummon = game.battle!.enemies.length;
      const summonedMice = game.battle!.enemies.filter(e => e.name === '机械鼠' && e.variant === 'normal');
      assert.ok(summonedMice.length > 0, '小鼠应当被召唤出来');
      assert.equal(countAfterSummon, countBeforeSummon + summonedMice.length, '敌人数量应该精确增加');

      // 强制推进 Boss 技能状态
      const ps = boss.pollutionSkill;
      assert.ok(ps);
      (ps as any).fieldPhase = 'active';
      (ps as any).fieldTimer = 2.0;
      (ps as any).eruptionPhase = 'warning';
      (ps as any).eruptionTimer = 0.5;
      (ps as any).eruptionCx = game.battle!.player.x;
      (ps as any).eruptionCy = game.battle!.player.y;

      assert.ok(ps.getFieldRenderState());
      assert.ok(ps.getEruptionRenderState());

      // 施加毒液状态效果
      game.battle!.player.statusEffects.applyPoison(3, 3, 1);
      assert.equal(game.battle!.player.statusEffects.has('poison'), true);

      // 记录重试前数据
      const goldBeforeRetry = game.player.gold;
      const partsBeforeRetry = game.player.parts;
      const stonesBeforeRetry = game.player.materials?.enhanceStone || 0;
      const equipCountBeforeRetry = game.player.equipmentInventory.items.length;
      const runeCountBeforeRetry = game.player.runeInventory.length;
      const progressBeforeRetry = JSON.stringify(game.player.stageProgress);

      const oldBattle = game.battle!; // 保存旧 Battle 引用

      // 制造玩家战败
      game.battle!.player.hp = 0;
      game.battle!.player.dead = true;
      game.battle!.update(1 / 60);
      assert.ok(game.lastOutcome && !game.lastOutcome.win);

      // 实例化真实的 ResultUI 并模拟点击“重新挑战”
      const resultUI = new ResultUI(ctx, game);
      const w = ctx.canvasWidth;
      const h = ctx.canvasHeight;
      const clickX = (w - w * 0.7) / 2 + (w * 0.7) / 2;
      const clickY = h - 176 + 22;
      (ctx.input as any).tapX = clickX;
      (ctx.input as any).tapY = clickY;
      resultUI.handleClick();

      // 断言重置状态：当前 Battle 被重置且完全初始化
      const bmRetry = game.battle!;
      assert.strictEqual(bmRetry, oldBattle, '重试时应复用相同的 BattleManager 实例');
      assert.equal(bmRetry.isEnded, false, '战斗应该重置为未结束状态');
      assert.equal(bmRetry.stage.id, '2-5');
      assert.equal(bmRetry.player.hp, bmRetry.player.maxHp);
      assert.equal(bmRetry.player.statusEffects.has('poison'), false, '状态效果应该清空');
      assert.equal(bmRetry.player.skillState.canUse('meow_cannon'), true, '冷却重置：重试后喵能炮应该可用');
      assert.equal(bmRetry.player.skillState.canUse('heavy_shield'), true, '冷却重置：重试后重盾应该可用');
      assert.equal(bmRetry.waveManager.currentWaveIndex, 0);

      // 断言未发奖
      assert.equal(game.player.gold, goldBeforeRetry, '重试未结算前金币不应增加');
      assert.equal(game.player.parts, partsBeforeRetry, '重试未结算前零件不应增加');
      assert.equal(game.player.materials?.enhanceStone || 0, stonesBeforeRetry, '重试未结算前强化石不应增加');
      assert.equal(game.player.equipmentInventory.items.length, equipCountBeforeRetry, '重试未结算前装备数不应改变');
      assert.equal(game.player.runeInventory.length, runeCountBeforeRetry, '重试未结算前符文数不应改变');
      assert.equal(JSON.stringify(game.player.stageProgress), progressBeforeRetry, '重试未结算前进度不应更新');

      // 结算清空
      assert.equal(game.lastOutcome, null, '重试后 lastOutcome 应当清空为 null');

      // 推进一帧产生初始敌人，断言无Boss/召唤怪残留，且仅含有第一波初始敌人
      game.tick(1 / 60);
      assert.equal(bmRetry.enemies.length, 4); // 2-5-w1 count: 4
      assert.equal(bmRetry.enemies.some(e => e.dead), false);
      assert.equal(bmRetry.enemies.some(e => e.variant === 'chapter2_boss'), false, '新敌人中不应包含旧 Boss');
      assert.equal(bmRetry.enemies.some(e => e.variant === 'toxic'), false, '新第一波敌人中不应包含召唤的小怪');

      // 旧 Boss 实例及其召唤物不在新列表
      assert.equal(bmRetry.enemies.includes(boss), false, '旧 Boss 实例不应存在于新敌人列表中');
      for (const m of summonedMice) {
        assert.strictEqual(bmRetry.enemies.includes(m), false, '旧召唤小鼠实例不应存在于新敌人列表中');
      }

      // 旧领域/喷发不再更新或渲染
      if (oldPollutionSkill) {
        assert.equal(oldPollutionSkill.getFieldRenderState(), null, '旧领域渲染状态应重置为空');
        assert.equal(oldPollutionSkill.getEruptionRenderState(), null, '旧喷发渲染状态应重置为空');
        oldPollutionSkill.update(1.0, bmRetry.player);
        assert.ok(oldPollutionSkill.isDisabled, '旧技能更新后应该变为 disabled 状态并不再进行位置或状态演变');
      }

      // 继续运行该局战斗直至胜利
      runBattle(game);
      assert.ok(game.lastOutcome && game.lastOutcome.win, '2-5 战败重新挑战后应当能打赢');
    } else if (stageId === '3-5') {
      // 3-5 特殊测试：在正常胜利前，先测试战败并重试
      const failOk = game.startBattle('3-5');
      assert.ok(failOk);
      game.beginBattle();

      // 使用玩家技能使其进入冷却
      game.battle!.usePlayerSkill('meow_cannon');
      game.battle!.usePlayerSkill('heavy_shield');
      assert.equal(game.battle!.player.skillState.canUse('meow_cannon'), false);
      assert.equal(game.battle!.player.skillState.canUse('heavy_shield'), false);

      // 记录 Boss 加入前的敌人
      const countBeforeBoss = game.battle!.enemies.length;

      // 手动生成 3-5 Boss (furnace_guard) 并注入状态
      const bossCfg = ENEMY_CONFIGS['furnace_guard'];
      assert.ok(bossCfg);
      const boss = new EnemyMouse(ctx, bossCfg, 200, 200);
      const oldFurnaceSkill = boss.furnaceSkill; // 保存旧 Boss 技能引用
      if (boss.furnaceSkill) {
        boss.furnaceSkill.onSummon = (count: number) => (game.battle! as any).summonFireBeetles(count);
      }
      game.battle!.enemies.push(boss);

      // 记录召唤前
      const countBeforeSummon = game.battle!.enemies.length;
      assert.equal(countBeforeSummon, countBeforeBoss + 1);

      // 将波次修改为第 3 波 (0-based)
      (game.battle!.waveManager as any).currentIndex = 3;
      (game.battle!.waveManager as any).currentSpawned = true;

      // 降低 Boss 生命触发召唤
      boss.hp = boss.maxHp * 0.4;
      boss.update(1 / 60, game.battle!.player); // 触发召唤小怪

      // 记录召唤后并证明火焰召唤物（熔岩甲虫）真实出现
      const countAfterSummon = game.battle!.enemies.length;
      const summonedBeetles = game.battle!.enemies.filter(e => e.name === '熔岩甲虫' && e.variant === 'fire_normal');
      assert.ok(summonedBeetles.length > 0, '火焰召唤物应当被召唤出来');
      assert.equal(countAfterSummon, countBeforeSummon + summonedBeetles.length, '敌人数量应该精确增加');

      // 强制推进 Boss 技能状态并生成熔岩池
      const fs = boss.furnaceSkill;
      assert.ok(fs);
      (fs as any).roarPhase = 'warning';
      (fs as any).roarTimer = 0.5;
      (fs as any).roarCx = game.battle!.player.x;
      (fs as any).roarCy = game.battle!.player.y;

      (fs as any).fissurePhase = 'warning';
      (fs as any).fissureTimer = 0.5;
      (fs as any).fissureBx = boss.x;
      (fs as any).fissureBy = boss.y;
      (fs as any).fissureTx = game.battle!.player.x;
      (fs as any).fissureTy = game.battle!.player.y;

      (fs as any).lavaPools.push({
        cx: game.battle!.player.x,
        cy: game.battle!.player.y,
        radius: 37.5,
        phase: 'warning',
        timer: 0.5,
        tickTimer: 0
      });

      assert.ok(fs.getRoarRenderState());
      assert.ok(fs.getFissureRenderState());
      assert.ok(fs.getLavaPools().length > 0);

      // 施加燃烧状态效果
      game.battle!.player.statusEffects.applyBurn(3, 3, 1);
      assert.equal(game.battle!.player.statusEffects.has('burn'), true);

      // 记录重试前数据
      const goldBeforeRetry = game.player.gold;
      const partsBeforeRetry = game.player.parts;
      const stonesBeforeRetry = game.player.materials?.enhanceStone || 0;
      const equipCountBeforeRetry = game.player.equipmentInventory.items.length;
      const runeCountBeforeRetry = game.player.runeInventory.length;
      const progressBeforeRetry = JSON.stringify(game.player.stageProgress);

      const oldBattle = game.battle!; // 保存旧 Battle 引用

      // 制造玩家战败
      game.battle!.player.hp = 0;
      game.battle!.player.dead = true;
      game.battle!.update(1 / 60);
      assert.ok(game.lastOutcome && !game.lastOutcome.win);

      // 重新挑战
      const resultUI35 = new ResultUI(ctx, game);
      const w35 = ctx.canvasWidth;
      const h35 = ctx.canvasHeight;
      const clickX35 = (w35 - w35 * 0.7) / 2 + (w35 * 0.7) / 2;
      const clickY35 = h35 - 176 + 22;
      (ctx.input as any).tapX = clickX35;
      (ctx.input as any).tapY = clickY35;
      resultUI35.handleClick();

      // 断言重置状态：当前 Battle 被重置且完全初始化
      const bmRetry35 = game.battle!;
      assert.strictEqual(bmRetry35, oldBattle, '重试时应复用相同的 BattleManager 实例');
      assert.equal(bmRetry35.isEnded, false, '战斗应该重置为未结束状态');
      assert.equal(bmRetry35.stage.id, '3-5');
      assert.equal(bmRetry35.player.hp, bmRetry35.player.maxHp);
      assert.equal(bmRetry35.player.statusEffects.has('burn'), false, '状态效果应该清空');
      assert.equal(bmRetry35.player.skillState.canUse('meow_cannon'), true, '冷却重置：重试后喵能炮应该可用');
      assert.equal(bmRetry35.player.skillState.canUse('heavy_shield'), true, '冷却重置：重试后重盾应该可用');
      assert.equal(bmRetry35.waveManager.currentWaveIndex, 0);

      // 断言未发奖
      assert.equal(game.player.gold, goldBeforeRetry, '重试未结算前金币不应增加');
      assert.equal(game.player.parts, partsBeforeRetry, '重试未结算前零件不应增加');
      assert.equal(game.player.materials?.enhanceStone || 0, stonesBeforeRetry, '重试未结算前强化石不应增加');
      assert.equal(game.player.equipmentInventory.items.length, equipCountBeforeRetry, '重试未结算前装备数不应改变');
      assert.equal(game.player.runeInventory.length, runeCountBeforeRetry, '重试未结算前符文数不应改变');
      assert.equal(JSON.stringify(game.player.stageProgress), progressBeforeRetry, '重试未结算前进度不应更新');

      // 结算清空
      assert.equal(game.lastOutcome, null, '重试后 lastOutcome 应当清空为 null');

      // 推进一帧产生初始敌人，断言无Boss/召唤怪残留，且仅含有第一波初始敌人
      game.tick(1 / 60);
      assert.equal(bmRetry35.enemies.length, 4); // 3-5-w1 count: 4
      assert.equal(bmRetry35.enemies.some(e => e.dead), false);
      assert.equal(bmRetry35.enemies.some(e => e.variant === 'chapter3_boss'), false, '新敌人中不应包含旧 Boss');
      assert.equal(bmRetry35.enemies.some(e => e.variant === 'fire_beetle'), false, '新第一波敌人中不应包含召唤的火甲虫');

      // 旧 Boss 实例及其召唤物不在新列表
      assert.equal(bmRetry35.enemies.includes(boss), false, '旧 Boss 实例不应存在于新敌人列表中');
      for (const b of summonedBeetles) {
        assert.strictEqual(bmRetry35.enemies.includes(b), false, '旧召唤甲虫实例不应存在于新敌人列表中');
      }

      // 旧领域/喷发/咆哮/裂隙/熔岩池不再更新或渲染
      if (oldFurnaceSkill) {
        assert.equal(oldFurnaceSkill.getRoarRenderState(), null, '旧咆哮渲染状态应清空');
        assert.equal(oldFurnaceSkill.getFissureRenderState(), null, '旧裂隙渲染状态应清空');
        assert.equal(oldFurnaceSkill.getLavaPools().length, 0, '旧熔岩池列表应清空');
        oldFurnaceSkill.update(1.0, bmRetry35.player);
        assert.ok(oldFurnaceSkill.isDisabled, '旧技能更新后应该变为 disabled 状态并不再进行位置或状态演变');
      }

      // 继续运行该局战斗直至胜利
      runBattle(game);
      assert.ok(game.lastOutcome && game.lastOutcome.win, '3-5 战败重新挑战后应当能打赢');
    } else {
      // 正常非 Boss 关卡推进
      const ok = game.startBattle(stageId);
      assert.ok(ok, `关关相扣，应该能开始挑战 ${stageId}`);
      game.beginBattle();
      runBattle(game);
      assert.ok(game.lastOutcome && game.lastOutcome.win, `通关 ${stageId} 应当胜利`);
    }

    // 穿装备、技能升级与属性升级
    const outcome = game.lastOutcome;
    if (outcome && outcome.loot && outcome.loot.equipmentConfigId) {
      const item = game.player.equipmentInventory.items.find(i => i.configId === outcome.loot?.equipmentConfigId);
      if (item) game.doEquipItem(item.uid);
    }
    // 技能升级
    if (game.player.gold >= 100 && game.player.parts >= 10) {
      game.doUpgradeSkill('meow_cannon');
    }
    // 强化装备
    if (game.player.materials?.enhanceStone && game.player.materials.enhanceStone > 0) {
      const equippedWeapon = game.player.equipmentInventory.equipped['weapon'];
      if (equippedWeapon) game.doEnhanceEquipment(equippedWeapon);
    }
    // 升级属性
    while (game.player.gold >= game.player.level * 50 && game.player.parts >= game.player.level * 5) {
      game.doUpgrade();
    }
  }

  // 验证 3-5 胜利且第三章完成
  assert.ok(game.lastOutcome && game.lastOutcome.win, '3-5 应当通关胜利');
  const isChapterCompleted = !!game.lastOutcome.clearResult?.chapterCompleted;
  assert.ok(isChapterCompleted, '3-5 胜利后应当标志着章节通关');
});
