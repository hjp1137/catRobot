/**
 * 第二章内容框架与新敌人单测（任务7）
 * ------------------------------------------------------------------
 * 覆盖任务文档 30 项验收点：章节配置/解锁/关卡/新敌人/毒液/背景/UI/链路。
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { BattleUI } from '../dist/ui/BattleUI.js';
import { ChapterSelectUI } from '../dist/ui/ChapterSelectUI.js';
import { StageSelectUI } from '../dist/ui/StageSelectUI.js';
import { StageIntroUI } from '../dist/ui/StageIntroUI.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';
import {
  STAGE_2_1, STAGE_2_3, STAGE_2_5, STAGE_1_5,
  getStageById, getChapterStages, CHAPTER2_STAGE_IDS, getNextStageId,
} from '../dist/data/StageConfig.js';
import {
  ENEMY_CONFIGS, MECHANICAL_BEETLE, TOXIC_MECHA_BUG, ELITE_TOXIC_BUG, MECHANICAL_MOUSE,
} from '../dist/data/EnemyConfig.js';
import {
  CHAPTER_1, CHAPTER_2, getAllChapters, getChapterById,
  isChapterUnlocked, getUnlockedChapters,
} from '../dist/chapter/ChapterConfig.js';
import { applyClear } from '../dist/chapter/ProgressManager.js';
import { createDefaultPlayerData, SAVE_KEY } from '../dist/data/PlayerData.js';
import { drawSewerBackground } from '../dist/render/BackgroundRenderer.js';
import { drawEnemy } from '../dist/render/Chapter2EnemyRenderer.js';

function newPlayer() { return createDefaultPlayerData(); }

// ---------- 章节配置 ----------
test('1. ChapterConfig 包含三个章节', () => {
  const all = getAllChapters();
  assert.equal(all.length, 3);
  assert.ok(getChapterById('chapter1'));
  assert.ok(getChapterById('chapter2'));
  assert.ok(getChapterById('chapter3'));
});

test('2. 第一章默认解锁', () => {
  assert.equal(isChapterUnlocked(newPlayer(), 'chapter1'), true);
});

test('3. 第二章初始锁定', () => {
  assert.equal(isChapterUnlocked(newPlayer(), 'chapter2'), false);
});

test('4. 通关 1-5 后第二章解锁', () => {
  const p = newPlayer();
  // 解锁并通关 1-1..1-5
  for (const id of ['1-1', '1-2', '1-3', '1-4']) {
    applyClear(p, { stage: getStageById(id)!, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  }
  assert.equal(isChapterUnlocked(p, 'chapter2'), false, '通关1-4仍未解锁');
  applyClear(p, { stage: getStageById('1-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  assert.equal(isChapterUnlocked(p, 'chapter2'), true, '通关1-5后应解锁');
});

test('5. 第二章包含 5 个关卡', () => {
  assert.equal(CHAPTER2_STAGE_IDS.length, 5);
  assert.equal(getChapterStages('chapter2').length, 5);
});

test('6. 2-1 解锁条件为通关 1-5', () => {
  assert.equal(STAGE_2_1.unlockAfter, '1-5');
});

test('7. 2-1 通关后解锁 2-2', () => {
  const p = newPlayer();
  p.unlockedStageIds = ['2-1'];
  applyClear(p, { stage: STAGE_2_1, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.ok(p.unlockedStageIds.includes('2-2'));
});

test('8. 2-5 通关后跨入第三章（下一关 3-1）', () => {
  const p = newPlayer();
  p.unlockedStageIds = ['2-5'];
  const r = applyClear(p, { stage: STAGE_2_5, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  assert.equal(r.unlockedNextId, '3-1');
  assert.equal(getNextStageId('2-5'), '3-1');
});

test('9. 第二章关卡奖励高于第一章平均水平', () => {
  const ch1Avg = [50, 70, 90, 120, 220].reduce((a, b) => a + b, 0) / 5;
  const ch2Avg = CHAPTER2_STAGE_IDS.map(id => getStageById(id)!.rewardGold).reduce((a, b) => a + b, 0) / 5;
  assert.ok(ch2Avg > ch1Avg, `第二章奖励应更高: ${ch2Avg} > ${ch1Avg}`);
});

test('10. 第二章推荐战力曲线递增', () => {
  const powers = CHAPTER2_STAGE_IDS.map(id => getStageById(id)!.recommendedPower);
  for (let i = 1; i < powers.length; i++) {
    assert.ok(powers[i] > powers[i - 1], `战力应递增: ${powers}`);
  }
});

// ---------- 新敌人配置 ----------
test('11. 新敌人配置存在：机械甲虫', () => {
  assert.ok(ENEMY_CONFIGS.mechanical_beetle);
  assert.equal(MECHANICAL_BEETLE.variant, 'beetle');
  assert.equal(MECHANICAL_BEETLE.maxHp, 45);
  assert.equal(MECHANICAL_BEETLE.poisonOnHit, undefined, '甲虫不施加毒液');
});

test('12. 新敌人配置存在：毒液机械虫', () => {
  assert.ok(ENEMY_CONFIGS.toxic_mecha_bug);
  assert.equal(TOXIC_MECHA_BUG.variant, 'toxic');
  assert.ok(TOXIC_MECHA_BUG.poisonOnHit, '毒液虫应有 poisonOnHit');
  assert.equal(TOXIC_MECHA_BUG.poisonOnHit!.damagePerTick, 2);
});

test('13. 新敌人配置存在：精英毒液机械虫', () => {
  assert.ok(ENEMY_CONFIGS.elite_toxic_bug);
  assert.equal(ELITE_TOXIC_BUG.variant, 'elite_toxic');
  assert.equal(ELITE_TOXIC_BUG.poisonOnHit!.damagePerTick, 3, '精英毒液更强');
  assert.ok(ELITE_TOXIC_BUG.maxHp > TOXIC_MECHA_BUG.maxHp);
});

// ---------- 战斗生成 ----------
test('14. BattleManager 可以生成第二章敌人', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(STAGE_2_1);
  for (let i = 0; i < 2; i++) { ctx.advance(0.016); battle.update(0.016); }
  // 2-1: 5鼠 + 2甲虫 = 7
  assert.equal(battle.enemies.length, 7);
  // 含甲虫
  assert.ok(battle.enemies.some(e => e.variant === 'beetle'));
});

test('15. 喵能炮可以命中第二章敌人', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.facingAngle = 0;
  const beetle = new EnemyMouse(ctx, MECHANICAL_BEETLE, 150, 100);
  const hpBefore = beetle.hp;
  const r = p.useSkill('meow_cannon', [beetle]);
  assert.equal(r.hitCount, 1);
  assert.ok(beetle.hp < hpBefore);
});

test('16. 新敌人死亡后可以推进波次', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start({ ...STAGE_2_1, enemies: [{ enemyId: 'mechanical_beetle', count: 1 }] });
  ctx.advance(0.016); battle.update(0.016);
  const e = battle.enemies[0];
  e.dead = true;
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(0.016); battle.update(0.016);
  assert.equal(battle.enemies.length, 0);
  assert.equal(battle.waveManager.isLastWaveCleared, true);
});

// ---------- 毒液机制 ----------
test('17. 毒液敌人接触玩家后施加 poison', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const bug = new EnemyMouse(ctx, TOXIC_MECHA_BUG, 100, 100);
  assert.equal(p.statusEffects.has('poison'), false);
  // 模拟接触攻击（手动调用 update 让接触判定触发）
  bug.x = p.x + 5; bug.y = p.y;
  // 推进超过 attackInterval
  for (let i = 0; i < 20; i++) bug.update(0.1, p);
  assert.ok(p.statusEffects.has('poison'), '毒液虫接触应施加毒液');
});

test('18. poison 会按 tick 造成持续伤害', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const hpBefore = p.hp;
  p.statusEffects.applyPoison(3, 2, 1);
  // 推进超过 1 个 tick（1秒），多帧避免浮点边界
  for (let i = 0; i < 12; i++) p.statusEffects.update(0.1, p);
  assert.ok(p.hp < hpBefore, '毒液应造成持续伤害');
});

test('19. poison 重复命中不无限叠加', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.statusEffects.applyPoison(3, 2, 1);
  p.statusEffects.applyPoison(3, 2, 1);
  p.statusEffects.applyPoison(3, 2, 1);
  const poison = p.statusEffects.getPoison()!;
  // 只有一个 poison 实例，damagePerTick 不叠加（仍 2）
  assert.equal(poison.damagePerTick, 2);
});

test('20. 重甲护盾可以减免 poison 伤害', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.useSkill('heavy_shield', []);
  const hpNoShield = (() => {
    const p2 = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
    p2.statusEffects.applyPoison(3, 2, 1);
    for (let i = 0; i < 12; i++) p2.statusEffects.update(0.1, p2);
    return 100 - p2.hp;
  })();
  p.statusEffects.applyPoison(3, 2, 1);
  for (let i = 0; i < 12; i++) p.statusEffects.update(0.1, p);
  const lostWithShield = 100 - p.hp;
  assert.ok(lostWithShield < hpNoShield, `护盾应减免毒液: ${lostWithShield} < ${hpNoShield}`);
});

test('21. 战斗结束后 poison 清空（玩家死亡触发 clear）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.statusEffects.applyPoison(3, 2, 1);
  assert.ok(p.statusEffects.has('poison'));
  // 玩家死亡
  p.hp = 1;
  p.takeDamage(999);
  // statusEffects.update 检测 dead 会 clear
  p.statusEffects.update(0.1, p);
  assert.equal(p.statusEffects.has('poison'), false);
});

// ---------- 渲染 ----------
test('22. 第二章背景渲染不抛错', () => {
  const ctx = new MockContext();
  assert.doesNotThrow(() => drawSewerBackground(ctx.canvas, 375, 667, 1.5));
  assert.doesNotThrow(() => drawSewerBackground(ctx.canvas, 0, 0, 0));
});

test('23. EnemyRenderer 渲染新敌人不抛错', () => {
  const ctx = new MockContext();
  for (const variant of ['beetle', 'toxic', 'elite_toxic'] as const) {
    const cfg = [MECHANICAL_BEETLE, TOXIC_MECHA_BUG, ELITE_TOXIC_BUG].find(c => c.variant === variant)!;
    assert.doesNotThrow(() => drawEnemy(ctx.canvas, {
      cx: 50, cy: 50, radius: cfg.radius, hpRatio: 0.5, variant,
    }));
  }
});

// ---------- 章节 UI ----------
test('24. 章节选择 UI 可以显示三个章节', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new ChapterSelectUI(ctx, game);
  game.goToChapterSelect();
  assert.equal(ui.cards.length, 3);
  assert.doesNotThrow(() => ui.render());
});

test('25. 锁定第二章不可进入', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.publishedCampaigns = [];
  const ui = new ChapterSelectUI(ctx, game);
  game.goToChapterSelect();
  // 点第二章卡片（锁定）
  const card2 = ui.cards.find(c => c.chapterId === 'chapter2')!;
  ctx.input.simulateTap(card2.x + 30, card2.y + 30);
  ui.handleClick();
  assert.equal(game.scene, 'chapterSelect', '锁定章节不应进入');
});

test('26. 解锁后第二章可以进入关卡选择', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new ChapterSelectUI(ctx, game);
  // 预置通关 1-5
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.goToChapterSelect();
  const card2 = ui.cards.find(c => c.chapterId === 'chapter2')!;
  ctx.input.simulateTap(card2.x + 30, card2.y + 30);
  ui.handleClick();
  assert.equal(game.scene, 'stageSelect');
  assert.equal(game.currentChapterId, 'chapter2');
});

test('27. StageIntroUI 显示第二章关卡信息不抛错', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new StageIntroUI(ctx, game);
  game.player.selectedStageId = '2-3';
  assert.doesNotThrow(() => ui.render());
});

// ---------- 旧存档兼容 ----------
test('28. 旧存档迁移后章节逻辑不崩溃', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ version: 1, mechaId: 'orange_cat', level: 1, gold: 0, parts: 0 }));
  const p = new SaveManager(ctx.storage).load();
  assert.equal(isChapterUnlocked(p, 'chapter1'), true);
  assert.equal(isChapterUnlocked(p, 'chapter2'), false);
  // 走解锁链路
  for (const id of ['1-1', '1-2', '1-3', '1-4']) {
    applyClear(p, { stage: getStageById(id)!, hpRatio: 0.5, elapsedSec: 50, nowSec: 1 });
  }
  applyClear(p, { stage: getStageById('1-5')!, hpRatio: 0.5, elapsedSec: 50, nowSec: 2 });
  assert.equal(isChapterUnlocked(p, 'chapter2'), true);
});

// ---------- 链路 ----------
test('29. 主界面正式入口进入战役地图', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  game.goToChapterSelect();
  assert.equal(game.scene, 'campaignMap');
});

test('30. 第二章关卡胜利后奖励和进度保存正常', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  // 预置解锁 2-1
  game.player.unlockedStageIds = ['2-1'];
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start({ ...STAGE_2_1, enemies: [{ enemyId: 'mechanical_beetle', count: 1 }] });
  ctx.advance(0.016); battle.update(0.016);
  for (const e of battle.enemies) e.dead = true;
  ctx.advance(0.016); battle.update(0.016);
  ctx.advance(0.016); battle.update(0.016);
  assert.equal(game.scene, 'result');
  assert.ok(game.lastOutcome?.win);
  assert.ok(game.player.stageProgress['2-1']?.cleared);
  assert.ok(game.player.unlockedStageIds.includes('2-2'));
  assert.equal(game.player.gold, STAGE_2_1.rewardGold); // 首通 100%
});

// ---------- 额外：2-3/2-5 波次 ----------
test('任务8：2-3 使用两波，2-5 升级为4波 Boss 关', () => {
  assert.ok(STAGE_2_3.waves && STAGE_2_3.waves.length === 2);
  assert.ok(STAGE_2_5.waves && STAGE_2_5.waves.length === 4, '2-5 任务8升级为4波');
  assert.equal(STAGE_2_5.isBossStage, true);
});

test('任务8：2-5 含精英毒液虫与污染核心虫后', () => {
  const w3 = STAGE_2_5.waves![2];
  assert.equal(w3.enemies[0].enemyId, 'elite_toxic_bug');
  const w4 = STAGE_2_5.waves![3];
  assert.equal(w4.enemies[0].enemyId, 'pollution_core_queen');
});

test('getUnlockedChapters：初始仅第一章', () => {
  const p = newPlayer();
  const unlocked = getUnlockedChapters(p);
  assert.equal(unlocked.length, 1);
  assert.equal(unlocked[0].id, 'chapter1');
});
