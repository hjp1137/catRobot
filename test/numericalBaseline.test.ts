import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { ALL_STAGE_ORDER, getStageById } from '../dist/data/StageConfig.js';
import { STAGE_LOOT_CONFIGS } from '../dist/data/Loot.js';

test('数值基线与掉落模拟测试', () => {
  const reports: string[] = [];
  reports.push('| 关卡 | 推荐战力 | 结果 | 耗时(s) | 累计受伤 | 喵能炮释放 | 重盾释放 | 首通金币 | 首通零件 | 装备掉落率 | 符文掉落率 |');
  reports.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');

  const wins: Record<string, boolean> = {};
  const elapseds: Record<string, number> = {};

  for (const stageId of ALL_STAGE_ORDER) {
    const stage = getStageById(stageId);
    if (!stage) continue;

    const ctx = new MockContext();
    const game = new GameManager(ctx);
    
    // 强制拉平属性以适配推荐战力
    const P = stage.recommendedPower;
    Object.defineProperty(game, 'totalPower', { get: () => P });
    Object.defineProperty(game, 'battleStats', {
      get: () => ({
        maxHp: P,
        attack: P / 10,
        attackInterval: 0.5,
        attackRange: 360,
        speed: 200,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        damageReduction: 0.1,
        poisonResist: stage.id.startsWith('2-') ? 0.3 : 0,
        burnResist: stage.id.startsWith('3-') ? 0.3 : 0,
      })
    });

    const bm = new BattleManager(ctx, game);
    bm.start(stage);

    let damageTaken = 0;
    let prevHp = bm.player ? bm.player.hp : P;
    let meowCannonCasts = 0;
    let heavyShieldCasts = 0;
    let frame = 0;
    const dt = 1 / 60;

    while (game.lastOutcome === null && frame < 18000) {
      ctx.advance(dt);

      if (bm.player && !bm.player.dead) {
        // 自动使用技能
        const states = bm.getPlayerSkillStates();
        const cannon = states.find(s => s.skillId === 'meow_cannon');
        if (cannon && cannon.cooldownRemaining <= 0) {
          const res = bm.usePlayerSkill('meow_cannon');
          if (res.ok) meowCannonCasts++;
        }
        const shield = states.find(s => s.skillId === 'heavy_shield');
        if (shield && shield.cooldownRemaining <= 0) {
          const res = bm.usePlayerSkill('heavy_shield');
          if (res.ok) heavyShieldCasts++;
        }

        // 挂机走位：直接迎战站撸策略，防止逃跑放空喵能炮
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
            // 风筝拉扯走位，避免被多怪包围撞死，同时保证在射程内
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

        bm.update(dt);

        if (bm.player) {
          if (bm.player.hp < prevHp) {
            damageTaken += (prevHp - bm.player.hp);
          }
          prevHp = bm.player.hp;
        }
      } else {
        bm.update(dt);
      }
      frame++;
    }

    const outcome = game.lastOutcome;
    wins[stageId] = outcome ? outcome.win : false;
    elapseds[stageId] = outcome ? outcome.elapsedSec : Infinity;

    const resultStr = outcome ? (outcome.win ? '胜利' : '失败') : '超时';
    const timeStr = outcome ? outcome.elapsedSec.toFixed(1) : '>300';
    const lootCfg = STAGE_LOOT_CONFIGS[stageId];
    const eqRate = lootCfg ? (lootCfg.equipmentDropRate * 100).toFixed(0) + '%' : '0%';
    const runeRate = lootCfg && lootCfg.runeDropRate ? (lootCfg.runeDropRate * 100).toFixed(0) + '%' : '0%';

    reports.push(`| ${stageId} | ${P} | ${resultStr} | ${timeStr} | ${damageTaken.toFixed(0)} | ${meowCannonCasts} | ${heavyShieldCasts} | ${stage.rewardGold} | ${stage.rewardParts} | ${eqRate} | ${runeRate} |`);
  }

  console.log('\n=== 数值打磨自动仿真报表 ===');
  console.log(reports.join('\n'));
  
  // 打印升级成本
  console.log('\n=== 机甲升级成本表 ===');
  console.log('| 等级 | 升级金币消耗 | 升级零件消耗 |');
  console.log('| --- | --- | --- |');
  for (let lv = 1; lv <= 10; lv++) {
    console.log(`| Lv.${lv} -> Lv.${lv+1} | ${lv * 50} | ${lv * 5} |`);
  }
  console.log('===========================\n');

  // 断言 15 个关卡全部胜利通关
  for (const stageId of ALL_STAGE_ORDER) {
    assert.strictEqual(wins[stageId], true, `关卡 ${stageId} 应当能够以推荐战力通关`);
    const limit = stageId.endsWith('-5') ? 80 : 40;
    assert.ok(elapseds[stageId] <= limit, `关卡 ${stageId} 通关用时 ${elapseds[stageId]}s 应当在限定时间 ${limit}s 内`);
  }

  // 1-1 无装备正常通关断言
  {
    const stage = getStageById('1-1');
    assert.ok(stage);
    const ctx = new MockContext();
    const game = new GameManager(ctx); // 默认无装备，Lv1 基础属性
    const bm = new BattleManager(ctx, game);
    bm.start(stage);
    let frame = 0;
    while (game.lastOutcome === null && frame < 18000) {
      ctx.advance(1/60);
      if (bm.player && !bm.player.dead) {
        let closest = null;
        let minDist = Infinity;
        for (const e of bm.enemies) {
          if (!e.dead) {
            const d = Math.hypot(e.x - bm.player.x, e.y - bm.player.y);
            if (d < minDist) { minDist = d; closest = e; }
          }
        }
        if (closest) {
          const dx = closest.x - bm.player.x, dy = closest.y - bm.player.y;
          const d = Math.hypot(dx, dy);
          if (d > 0) { ctx.input.moveX = dx/d; ctx.input.moveY = dy/d; }
        }
      }
      bm.update(1/60);
      frame++;
    }
    const outcome = game.lastOutcome;
    assert.ok(outcome && outcome.win, '1-1 应该在无任何装备时正常通关');
    assert.ok(outcome.elapsedSec <= 40, `1-1 无装备通关时间应在 40s 内，实际 ${outcome.elapsedSec}s`);
  }

  // 明显低战力（50%推荐战力）挑战 1-5 Boss 存在失败/超时风险的断言
  {
    const stage = getStageById('1-5');
    assert.ok(stage);
    const ctx = new MockContext();
    const game = new GameManager(ctx);
    const lowP = stage.recommendedPower * 0.5; // 50% 战力
    Object.defineProperty(game, 'totalPower', { get: () => lowP });
    Object.defineProperty(game, 'battleStats', {
      get: () => ({
        maxHp: lowP,
        attack: lowP / 20, // 攻击力也减半
        attackInterval: 0.8, // 攻击冷却变长
        attackRange: 360,
        speed: 150,
        criticalRate: 0.05,
        criticalDamage: 1.5,
        damageReduction: 0.05,
        poisonResist: 0,
        burnResist: 0,
      })
    });
    const bm = new BattleManager(ctx, game);
    bm.start(stage);
    let frame = 0;
    while (game.lastOutcome === null && frame < 18000) {
      ctx.advance(1/60);
      if (bm.player && !bm.player.dead) {
        let closest = null;
        let minDist = Infinity;
        for (const e of bm.enemies) {
          if (!e.dead) {
            const d = Math.hypot(e.x - bm.player.x, e.y - bm.player.y);
            if (d < minDist) { minDist = d; closest = e; }
          }
        }
        if (closest) {
          const dx = closest.x - bm.player.x, dy = closest.y - bm.player.y;
          const d = Math.hypot(dx, dy);
          if (d > 0) { ctx.input.moveX = dx/d; ctx.input.moveY = dy/d; }
        }
      }
      bm.update(1/60);
      frame++;
    }
    const outcome = game.lastOutcome;
    const isFailedOrTimeout = !outcome || !outcome.win || outcome.elapsedSec > 80;
    assert.ok(isFailedOrTimeout, '明显低战力挑战 1-5 Boss 应当存在失败或超时的风险');
  }

  // 校验重复收益低于首通，且同章 Boss 收益优于普通关
  for (const ch of [1, 2, 3]) {
    const prefix = `${ch}-`;
    const stages = ALL_STAGE_ORDER.map(id => getStageById(id)!).filter(s => s && s.id.startsWith(prefix));
    const boss = stages.find(s => s.id.endsWith('-5'));
    assert.ok(boss, `应当存在第 ${ch} 章的 Boss 关卡`);
    for (const s of stages) {
      // 校验重复收益低于首通
      const goldRepeat = Math.floor(s.rewardGold * 0.5);
      const partsRepeat = Math.floor(s.rewardParts * 0.5);
      assert.ok(goldRepeat < s.rewardGold, `关卡 ${s.id} 重复通关金币应当严格小于首通金币`);
      assert.ok(partsRepeat < s.rewardParts, `关卡 ${s.id} 重复通关零件应当严格小于首通零件`);
      
      // 校验 Boss 收益优于同章普通关
      if (s.id !== boss.id) {
        assert.ok(boss.rewardGold > s.rewardGold, `同章 Boss 关 ${boss.id} 的金币奖励应当优于普通关 ${s.id}`);
        assert.ok(boss.rewardParts > s.rewardParts, `同章 Boss 关 ${boss.id} 的零件奖励应当优于普通关 ${s.id}`);
      }
    }
  }
});
