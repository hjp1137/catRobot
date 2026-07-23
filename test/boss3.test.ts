import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { STAGE_3_5, getStageById } from '../dist/data/StageConfig.js';
import { ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import { FurnaceBossSkill } from '../dist/battle/FurnaceBossSkill.js';
import type { FurnaceSkillRenderState, FissureRenderState, LavaPool } from '../dist/battle/FurnaceBossSkill.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { createDefaultPlayerData } from '../dist/data/PlayerData.js';
import { StageSelectUI } from '../dist/ui/StageSelectUI.js';
import { StageIntroUI } from '../dist/ui/StageIntroUI.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ResultUI } from '../dist/ui/ResultUI.js';
import { applyClear } from '../dist/chapter/ProgressManager.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';
import { drawLavaRoar, drawLavaFissure, drawLavaPool } from '../dist/render/Chapter3BossRenderer.js';

test('第三章 Boss 熔炉守卫专项断言测试', async (t) => {
  
  // 辅助函数：以 0.1s 为小步长逐步推进时间，模拟真实的连续帧更新
  const tick = (bm: BattleManager, sec: number) => {
    const steps = Math.round(sec / 0.1);
    for (let i = 0; i < steps; i++) {
      bm.update(0.1);
    }
  };

  await t.test('关卡 3-5 波次推进与 Boss 召唤及 currentBoss 获取', () => {
    const ctx = new MockContext();
    const game = new GameManager(ctx);
    const bm = new BattleManager(ctx, game);
    game.setBattle(bm);
    
    // 解锁并开始 3-5
    game.player.unlockedStageIds.push('3-5');
    game.startBattle('3-5');
    game.beginBattle();

    // 将玩家挪到极其遥远的地方，防止自动攻击杀死新生成的敌人
    bm.player.x = -9999;
    bm.player.y = -9999;

    assert.strictEqual(bm.stage.id, '3-5');
    assert.strictEqual(bm.stage.isBossStage, true);
    assert.strictEqual(bm.waveManager.totalWaves, 4);

    // 1. 推进 0.1s 触发第一波生成
    bm.update(0.1);
    assert.strictEqual(bm.waveManager.currentWaveIndex, 0);
    assert.ok(bm.enemies.length > 0, '第一波敌人应已生成');

    // 2. 清空第一波敌人，并推进 0.1s 使得第一波 cleared，进入第二波（延迟 1.2s）
    bm.enemies = []; 
    bm.update(0.1);
    assert.strictEqual(bm.waveManager.currentWaveIndex, 1);

    // 3. 推进 1.5s 触发第二波生成（通过 0.1s 小步长推进）
    tick(bm, 1.5);
    assert.ok(bm.enemies.length > 0, '第二波敌人应已生成');

    // 4. 清空第二波敌人，并推进 0.1s 使得第二波 cleared，进入第三波（延迟 1.5s）
    bm.enemies = [];
    bm.update(0.1);
    assert.strictEqual(bm.waveManager.currentWaveIndex, 2);

    // 5. 推进 1.8s 触发第三波生成（小步长）
    tick(bm, 1.8);
    assert.ok(bm.enemies.length > 0, '第三波敌人应已生成');

    // 6. 清空第三波敌人，并推进 0.1s 使得第三波 cleared，进入第四波（延迟 1.8s）
    bm.enemies = [];
    bm.update(0.1);
    assert.strictEqual(bm.waveManager.currentWaveIndex, 3);

    // 7. 推进 2.0s 触发第四波 Boss 召唤（小步长）
    tick(bm, 2.0);

    assert.strictEqual(bm.enemies.length, 1);
    const boss = bm.currentBoss!;
    assert.ok(boss);
    assert.strictEqual(boss.name, '熔炉守卫');
    assert.strictEqual(boss.variant, 'chapter3_boss');
    assert.strictEqual(boss.maxHp, 500);
    assert.ok(boss.furnaceSkill);
  });

  await t.test('Boss 技能双重冷却避免与时序测试', () => {
    const bossRef = { x: 200, y: 200, hp: 500, maxHp: 500, dead: false };
    const skill = new FurnaceBossSkill(bossRef);
    const mockPlayer = { x: 200, y: 200, radius: 20, hp: 100, dead: false, takeDamage() {}, statusEffects: { applyBurn() {}, has() { return false; } } } as any;
    
    // 初始状态均为 idle
    assert.strictEqual(skill.currentRoarPhase, 'idle');
    assert.strictEqual(skill.currentFissurePhase, 'idle');

    // 推进 8 秒使得咆哮触发，但裂隙冷却为 10 秒，仍处于 idle
    skill.update(8.0, mockPlayer);
    assert.strictEqual(skill.currentRoarPhase, 'warning');
    assert.strictEqual(skill.currentFissurePhase, 'idle'); // 裂隙不应被联动重置或触发

    // 再推进 2 秒，裂隙达到 10 秒触发 warning，此时咆哮已处于 blast 之后进入冷却
    skill.update(2.0, mockPlayer);
    assert.strictEqual(skill.currentFissurePhase, 'warning');

    // ----------------------------------------------------
    // 测试至少完整跑两轮咆哮和两轮裂隙并断言周期 (使用0.1s小步长推进模拟真实运行)
    // ----------------------------------------------------
    const skill2 = new FurnaceBossSkill(bossRef);
    const tickSkill = (sk: FurnaceBossSkill, sec: number) => {
      const steps = Math.round(sec / 0.1);
      for (let i = 0; i < steps; i++) {
        sk.update(0.10001, mockPlayer);
      }
    };
    
    // 第一轮 咆哮 (Roar) 与 裂隙 (Fissure)
    // 推进 8s：咆哮触发 warning，裂隙仍为 idle
    tickSkill(skill2, 8.0);
    assert.strictEqual(skill2.currentRoarPhase, 'warning');
    assert.strictEqual(skill2.currentFissurePhase, 'idle');

    // 推进 1.2s：咆哮进入 blast，裂隙为 idle
    tickSkill(skill2, 1.2);
    assert.strictEqual(skill2.currentRoarPhase, 'blast');
    assert.strictEqual(skill2.currentFissurePhase, 'idle');

    // 推进 0.4s：咆哮进入 cooldown，时间总计 9.6s，裂隙为 idle
    tickSkill(skill2, 0.4);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'idle');

    // 推进 0.4s：裂隙总计达到 10.0s 触发 warning
    tickSkill(skill2, 0.4);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'warning');

    // 推进 1.5s：裂隙进入 blast。咆哮 cooldown 推进到 1.9s
    tickSkill(skill2, 1.5);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'blast');

    // 推进 0.4s：裂隙 blast 结束，进入 cooldown。咆哮 cooldown 推进到 2.3s
    tickSkill(skill2, 0.4);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 5.7s：咆哮 cooldown 结束（经历单次 8s 冷却），咆哮直接进入第二轮 warning
    tickSkill(skill2, 5.7);
    assert.strictEqual(skill2.currentRoarPhase, 'warning');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 1.2s：咆哮进入 blast（第二轮）
    tickSkill(skill2, 1.2);
    assert.strictEqual(skill2.currentRoarPhase, 'blast');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 0.4s：咆哮进入 cooldown（第二轮）。裂隙 cooldown 达到 7.3s
    tickSkill(skill2, 0.4);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 2.7s：裂隙 cooldown 结束（经历单次 10s 冷却），直接进入第二轮 warning
    tickSkill(skill2, 2.7);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'warning');

    // 推进 1.5s：裂隙进入 blast（第二轮）
    tickSkill(skill2, 1.5);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'blast');

    // 推进 0.4s：裂隙进入 cooldown（第二轮）
    tickSkill(skill2, 0.4);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 3.4s：咆哮再次结束 8s 冷却进入第三轮 warning
    tickSkill(skill2, 3.4);
    assert.strictEqual(skill2.currentRoarPhase, 'warning', '咆哮已完成两轮完整周期并进入第三轮预警');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 1.6s（跑完咆哮预警 1.2s 和 blast 0.4s 并使其进入 cooldown）
    tickSkill(skill2, 1.6);
    assert.strictEqual(skill2.currentRoarPhase, 'cooldown');
    assert.strictEqual(skill2.currentFissurePhase, 'cooldown');

    // 推进 5.0s：裂隙再次结束 10s 冷却进入第三轮 warning
    tickSkill(skill2, 5.0);
    assert.strictEqual(skill2.currentFissurePhase, 'warning', '裂隙已完成两轮完整周期并进入第三轮预警');
  });

  await t.test('熔岩咆哮与熔岩裂隙的覆盖判定：预警不伤、范围内命中、范围外不伤、护盾减伤与燃烧', () => {
    const bossRef = { x: 200, y: 200, hp: 500, maxHp: 500, dead: false };
    const skill = new FurnaceBossSkill(bossRef);
    const ctx = new MockContext();
    
    // 玩家在咆哮范围内
    const p1 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 200, 200);
    const hpBeforeRoar = p1.hp;
    
    // 推进 8 秒到 warning
    skill.update(8.0, p1);
    assert.strictEqual(skill.currentRoarPhase, 'warning');
    assert.strictEqual(p1.hp, hpBeforeRoar, '预警期间不应受到伤害');
    
    // 推进 1.2 秒到 blast，再推进 0.1 秒执行 logic
    skill.update(1.2, p1);
    skill.update(0.1, p1);
    assert.strictEqual(skill.currentRoarPhase, 'blast');
    assert.ok(p1.hp < hpBeforeRoar, '范围内玩家应受伤害');
    assert.ok(p1.statusEffects.has('burn'), '范围内玩家应附带燃烧状态');

    // 玩家在裂隙范围外
    const p2 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 400, 400); // 远在 400,400
    const skill2 = new FurnaceBossSkill(bossRef);
    // 推进 10 秒到 warning，锁定玩家位置向 400,400 射击
    skill2.update(10.0, p2);
    assert.strictEqual(skill2.currentFissurePhase, 'warning');
    
    // 在 blast 结算伤害前，把玩家移到侧边，例如 200, 400，远远避开裂隙中轴线
    p2.x = 200;
    p2.y = 400;
    p2.hp = 120; // 重置血量以排除任何意外
    const hpBeforeFissure = p2.hp;
    
    skill2.update(1.5, p2);
    skill2.update(0.1, p2);
    assert.strictEqual(p2.hp, hpBeforeFissure, '范围外玩家不应受到伤害');

    // 护盾减免测试
    const pShield = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 200, 200);
    pShield.useSkill('heavy_shield', []);
    const skillShield = new FurnaceBossSkill(bossRef);
    skillShield.update(8.0, pShield);
    const hpBeforeShield = pShield.hp;
    skillShield.update(1.2, pShield);
    skillShield.update(0.1, pShield);
    const lostWithShield = hpBeforeShield - pShield.hp;
    
    const pNoShield = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 200, 200);
    const skillNoShield = new FurnaceBossSkill(bossRef);
    skillNoShield.update(8.0, pNoShield);
    const hpBeforeNoShield = pNoShield.hp;
    skillNoShield.update(1.2, pNoShield);
    skillNoShield.update(0.1, pNoShield);
    const lostNoShield = hpBeforeNoShield - pNoShield.hp;

    assert.ok(lostWithShield < lostNoShield, '护盾应当能减免咆哮伤害');
  });

  await t.test('熔岩裂隙拒绝身后 (t < 0) 或 终点外 (t > 1) 误伤判定', () => {
    const bossRef = { x: 200, y: 200, hp: 500, maxHp: 500, dead: false };
    const skill = new FurnaceBossSkill(bossRef);
    const ctx = new MockContext();

    // 1. 玩家在 Boss 正后方 (t < 0)
    const player = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 200, 250);
    skill.update(10.0, player); // 锁定 direction 为向下 (ux = 0, uy = 1)，起点 (200,200)，终点 (200,500)
    assert.strictEqual(skill.currentFissurePhase, 'warning');

    // 随后，玩家在预警期间移到 Boss 的正后方 (200, 100)。此时距离 100 > 85（避开咆哮），且 t = -100/300 = -0.33 < 0（仍在身后）
    player.x = 200;
    player.y = 100;
    player.hp = 120; // 排除之前任何扣血，重置为满血
    const hpBeforeFissure = player.hp;
    
    // 推进 1.5 秒进入 blast，再推进 0.1 执行判定
    skill.update(1.5, player);
    skill.update(0.1, player);
    assert.strictEqual(player.hp, hpBeforeFissure, 'Boss身后的目标 (t < 0) 即使距中轴线极近也不应被伤害');

    // 2. 玩家在裂隙终点之外 (t > 1)
    const skill2 = new FurnaceBossSkill(bossRef);
    const player2 = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 300, 200); // 锁定 direction 为向右 (ux = 1, uy = 0)，终点 (500,200)
    skill2.update(10.0, player2);
    
    // 玩家在预警期移到终点外 (520, 200)，其投影 t = 1.067 > 1
    player2.x = 520;
    player2.y = 200;
    player2.hp = 120; // 重置血量
    const hpBeforeFissure2 = player2.hp;
    
    skill2.update(1.5, player2);
    skill2.update(0.1, player2);
    assert.strictEqual(player2.hp, hpBeforeFissure2, '裂隙终点之外的目标 (t > 1) 不应被伤害');
  });

  await t.test('Boss低于50%血量二阶段转换、只召唤一次、熔岩池警告/伤害/清理', () => {
    const bossRef = { x: 200, y: 200, hp: 500, maxHp: 500, dead: false };
    const skill = new FurnaceBossSkill(bossRef);
    let summonCount = 0;
    skill.onSummon = (count) => { summonCount = count; };

    const ctx = new MockContext();
    const player = new PlayerMecha(ctx.canvas, ORANGE_CAT, 1, 200, 200);

    // 血量 > 50% 不触发二阶段
    bossRef.hp = 260;
    skill.update(1.0, player);
    assert.strictEqual(summonCount, 0);

    // 血量 < 50% 首次触发召唤
    bossRef.hp = 240;
    skill.update(1.0, player);
    assert.strictEqual(summonCount, 2);
    assert.strictEqual(skill.hasSummoned, true);

    // 血量继续降低，不会再次触发召唤
    summonCount = 0;
    bossRef.hp = 100;
    skill.update(1.0, player);
    assert.strictEqual(summonCount, 0, '二阶段召唤只能触发一次');

    // 持续推进，二阶段会每 6 秒生成一个熔岩池。我们推进 45 次 0.1 秒以安全跨越浮点精度。
    for (let i = 0; i < 45; i++) {
      skill.update(0.1, player);
    }
    const pools = skill.getLavaPools();
    assert.strictEqual(pools.length, 1, '应产生熔岩池');
    assert.strictEqual(pools[0].phase, 'warning');

    // 预警 1 秒后进入 active
    for (let i = 0; i < 10; i++) {
      skill.update(0.1, player);
    }
    assert.strictEqual(pools[0].phase, 'active');

    // 在 active 池中受到伤害与燃烧
    const hpBeforeLava = player.hp;
    // 推进 0.5 秒
    for (let i = 0; i < 5; i++) {
      skill.update(0.1, player);
    }
    assert.ok(player.hp < hpBeforeLava, '站在熔岩池上应受伤害');
    assert.ok(player.statusEffects.has('burn'), '站在熔岩池上应被附加燃烧');

    // 清理：当 Boss 死亡时，熔岩池清空，且不再产生后续伤害
    bossRef.dead = true;
    skill.update(0.1, player);
    assert.strictEqual(skill.getLavaPools().length, 0, '死亡后熔岩池应被清空');
  });

  await t.test('Boss死亡及玩家死亡结束战斗后的清理', () => {
    const ctx = new MockContext();
    const game = new GameManager(ctx);
    const bm = new BattleManager(ctx, game);
    game.setBattle(bm);
    
    game.player.unlockedStageIds.push('3-5');
    game.startBattle('3-5');
    game.beginBattle();
    
    // 挪开玩家防止伤害敌人
    bm.player.x = -9999;
    bm.player.y = -9999;

    // 推进第一波生成并清空
    bm.update(0.1); bm.enemies = []; bm.update(0.1);
    // 推进第二波生成并清空
    tick(bm, 1.5); bm.enemies = []; bm.update(0.1);
    // 推进第三波生成并清空
    tick(bm, 1.8); bm.enemies = []; bm.update(0.1);
    // 推进第四波 Boss 生成
    tick(bm, 2.0);
    
    const boss = bm.currentBoss!;
    assert.ok(boss);

    // 将玩家挪回 Boss 身边，以便熔岩池可以投在玩家脚下，并受到测试检测
    bm.player.x = boss.x;
    bm.player.y = boss.y;
    
    // 触发二阶段产生熔岩池
    boss.hp = 100;
    bm.update(1.0); 
    bm.update(6.0); 
    assert.ok(boss.furnaceSkill!.getLavaPools().length > 0);

    // 1. Boss 死亡结束战斗清理
    boss.takeDamage(999);
    assert.strictEqual(boss.dead, true);
    assert.strictEqual(boss.furnaceSkill!.getLavaPools().length, 0, '死亡时技能熔岩池应清空');

    // 2. 玩家死亡结束战斗清理
    const ctx2 = new MockContext();
    const game2 = new GameManager(ctx2);
    const bm2 = new BattleManager(ctx2, game2);
    game2.setBattle(bm2);
    
    game2.player.unlockedStageIds.push('3-5');
    game2.startBattle('3-5');
    game2.beginBattle();

    bm2.player.x = -9999;
    bm2.player.y = -9999;
    
    // 推进第一波生成并清空
    bm2.update(0.1); bm2.enemies = []; bm2.update(0.1);
    // 推进第二波生成并清空
    tick(bm2, 1.5); bm2.enemies = []; bm2.update(0.1);
    // 推进第三波生成并清空
    tick(bm2, 1.8); bm2.enemies = []; bm2.update(0.1);
    // 推进第四波 Boss 生成
    tick(bm2, 2.0);
    
    const boss2 = bm2.currentBoss!;
    assert.ok(boss2);

    bm2.player.x = boss2.x;
    bm2.player.y = boss2.y;
    
    boss2.hp = 100;
    bm2.update(1.0);
    bm2.update(6.0);
    assert.ok(boss2.furnaceSkill!.getLavaPools().length > 0);

    // 玩家死亡
    bm2.player.takeDamage(999);
    bm2.update(0.1);
    assert.strictEqual(game2.scene, 'result');
    assert.strictEqual(boss2.furnaceSkill!.getLavaPools().length, 0, '战斗结束时熔岩池应清空');
  });

  await t.test('首次/重复通关3-5时章节结局文案与回归第一、二章文案测试', () => {
    const p = createDefaultPlayerData();
    const ctx = new MockContext();
    const game = new GameManager(ctx);
    game.player = p;
    const resultUi = new ResultUI(ctx, game);
    
    // 首次通关 1-5 展示第一章完成
    const r1 = applyClear(p, { stage: getStageById('1-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
    assert.strictEqual(r1.chapterCompleted, true);
    game.lastOutcome = { win: true, stageId: '1-5', elapsedSec: 50, hpRatio: 0.5, clearResult: r1, loot: null };
    ctx.canvas.calls = [];
    resultUi.render();
    assert.ok(ctx.canvas.calls.includes('text:★ 第一章完成！★'), '应绘制第一章完成文案');

    // 首次通关 2-5 展示第二章完成
    const r2 = applyClear(p, { stage: getStageById('2-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
    assert.strictEqual(r2.chapterCompleted, true);
    game.lastOutcome = { win: true, stageId: '2-5', elapsedSec: 50, hpRatio: 0.5, clearResult: r2, loot: null };
    ctx.canvas.calls = [];
    resultUi.render();
    assert.ok(ctx.canvas.calls.includes('text:★ 第二章完成！★'), '应绘制第二章完成文案');

    // 首次通关 3-5 展示第三章完成
    const r3 = applyClear(p, { stage: STAGE_3_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 3 });
    assert.strictEqual(r3.chapterCompleted, true);
    game.lastOutcome = { win: true, stageId: '3-5', elapsedSec: 50, hpRatio: 0.5, clearResult: r3, loot: null };
    ctx.canvas.calls = [];
    resultUi.render();
    assert.ok(ctx.canvas.calls.includes('text:★ 第三章完成 · 星核觉醒 ★'), '应绘制第三章完成文案');
    assert.ok(ctx.canvas.calls.includes('text:熔火工厂核心已重构 · 橘猫机甲迎来觉醒新纪元'), '应绘制第三章详细完成文案');

    // 重复通关 3-5 不显示完成
    const r3_repeat = applyClear(p, { stage: STAGE_3_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 4 });
    assert.strictEqual(r3_repeat.chapterCompleted, false, '重复通关不显示首次完成');
    game.lastOutcome = { win: true, stageId: '3-5', elapsedSec: 50, hpRatio: 0.5, clearResult: r3_repeat, loot: null };
    ctx.canvas.calls = [];
    resultUi.render();
    assert.ok(!ctx.canvas.calls.includes('text:★ 第三章完成 · 星核觉醒 ★'), '重复通关不应绘制第三章完成文案');
  });

  await t.test('界面与标识断言：选关Boss标识与专属血条', () => {
    const ctx = new MockContext();
    const game = new GameManager(ctx);
    game.player.unlockedStageIds.push('3-5');
    
    // 关卡选择 UI
    const stageSelect = new StageSelectUI(ctx, game);
    game.currentChapterId = 'chapter3';
    ctx.canvas.calls = [];
    stageSelect.render();
    assert.ok(ctx.canvas.calls.includes('text:☠ BOSS'), 'StageSelect 应包含 ☠ BOSS 文字');

    // 关卡介绍 UI
    game.player.selectedStageId = '3-5';
    const stageIntro = new StageIntroUI(ctx, game);
    ctx.canvas.calls = [];
    stageIntro.render();
    assert.ok(ctx.canvas.calls.includes('text:⚠ BOSS 关 ⚠'), 'StageIntro 应包含 BOSS 关提示文字');

    // 专属血条 UI
    const bm = new BattleManager(ctx, game);
    bm.start(STAGE_3_5);
    const boss = new EnemyMouse(ctx.canvas, ENEMY_CONFIGS['furnace_guard'], 100, 100);
    bm.enemies.push(boss);
    
    const battleUi = new BattleUI(ctx, bm);
    ctx.canvas.calls = [];
    battleUi.render();
    assert.ok(ctx.canvas.calls.includes('text:☠ 熔炉守卫'), 'BattleUI 应包含 Boss 名称 ☠ 熔炉守卫');
    assert.ok(ctx.canvas.calls.includes('fillStyle:#ff5500'), 'BattleUI 专属血条应使用 #ff5500');
  });

  await t.test('美术渲染：加载成功与失败兜底的 Canvas 绘制行为', () => {
    const ctx = new MockContext();
    const res = ResourceManager.getInstance();
    
    // 1. 测试加载失败 (兜底)
    res.resetForTest();
    const roarState: FurnaceSkillRenderState = { phase: 'blast', cx: 200, cy: 200, radius: 85, progress: 0.5 };
    const fissureState: FissureRenderState = { phase: 'blast', bx: 200, by: 200, tx: 200, ty: 500, width: 50, progress: 0.5 };
    const poolState: LavaPool = { cx: 200, cy: 200, radius: 37.5, phase: 'active', timer: 1.0, tickTimer: 0.1 };

    ctx.canvas.calls = [];
    drawLavaRoar(ctx.canvas, roarState);
    assert.ok(!ctx.canvas.calls.some(c => c.startsWith('drawImage:')), 'Roar失败兜底路径不应调用 drawImage');
    assert.ok(ctx.canvas.calls.includes('arc') || ctx.canvas.calls.includes('stroke') || ctx.canvas.calls.includes('fill'), 'Roar失败兜底路径应执行圆弧/描边/填充绘制');

    ctx.canvas.calls = [];
    drawLavaFissure(ctx.canvas, fissureState);
    assert.ok(!ctx.canvas.calls.some(c => c.startsWith('drawImage:')), 'Fissure失败兜底路径不应调用 drawImage');
    assert.ok(ctx.canvas.calls.includes('fillRect') || ctx.canvas.calls.includes('strokeRect'), 'Fissure失败兜底路径应执行fillRect/strokeRect程序化绘制');

    ctx.canvas.calls = [];
    drawLavaPool(ctx.canvas, poolState);
    assert.ok(!ctx.canvas.calls.some(c => c.startsWith('drawImage:')), 'LavaPool失败兜底路径不应调用 drawImage');

    // 2. 测试加载成功 (调用专属新素材 drawImage)
    res.resetForTest();
    (res as any).statuses.set('skill_roar', 'LOADED');
    (res as any).images.set('skill_roar', { src: 'assets/skill_roar.png' });
    (res as any).statuses.set('skill_fissure', 'LOADED');
    (res as any).images.set('skill_fissure', { src: 'assets/skill_fissure.png' });
    (res as any).statuses.set('status_burn', 'LOADED');
    (res as any).images.set('status_burn', { src: 'assets/status_burn.png' });

    ctx.canvas.calls = [];
    drawLavaRoar(ctx.canvas, roarState);
    assert.ok(ctx.canvas.calls.some(c => c.startsWith('drawImage:assets/skill_roar.png')), 'Roar成功路径应调用 drawImage 加载 skill_roar.png');

    ctx.canvas.calls = [];
    drawLavaFissure(ctx.canvas, fissureState);
    assert.ok(ctx.canvas.calls.some(c => c.startsWith('drawImage:assets/skill_fissure.png')), 'Fissure成功路径应调用 drawImage 加载 skill_fissure.png');

    ctx.canvas.calls = [];
    drawLavaPool(ctx.canvas, poolState);
    assert.ok(ctx.canvas.calls.some(c => c.startsWith('drawImage:assets/status_burn.png')), 'LavaPool成功路径应调用 drawImage 加载 status_burn.png');
  });
});
