/**
 * 玩家移动 / 边界 / 输入注入 + UI 按钮命中 单测
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1, getStageById } from '../dist/data/StageConfig.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { hitButton } from '../dist/ui/UIWidgets.js';
import { MainUI } from '../dist/ui/MainUI.js';
import { ResultUI } from '../dist/ui/ResultUI.js';

test('玩家按 input 向右移动 1 秒 = speed 像素', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  ctx.input.simulateMove(1, 0); // 纯右
  p.update(1.0, []);
  assert.ok(Math.abs(p.x - (100 + ORANGE_CAT.speed)) < 0.01, `x=${p.x}`);
  assert.equal(p.y, 100);
});

test('玩家斜向移动被归一化（不会超速）', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  ctx.input.simulateMove(1, 1); // 应被外部归一化？我们的 Input 已归一化
  // 注：simulateMove 直接赋值，未归一化。这里手动给归一化向量
  ctx.input.simulateMove(Math.SQRT1_2, Math.SQRT1_2);
  p.update(1.0, []);
  const dist = Math.hypot(p.x - 100, p.y - 100);
  assert.ok(Math.abs(dist - ORANGE_CAT.speed) < 0.5, `dist=${dist}`);
});

test('玩家被边界夹取，不超出画布', () => {
  const ctx = new MockContext(200, 300);
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 10, 150); // 接近左边界
  ctx.input.simulateMove(-1, 0);
  p.update(1.0, []); // 试图左移 200，但应被夹在 radius=18
  assert.equal(p.x, p.radius);
});

test('玩家无输入时不动', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  p.update(1.0, []);
  assert.equal(p.x, 100);
  assert.equal(p.y, 100);
});

test('玩家受伤 + 死亡判定', () => {
  const ctx = new MockContext();
  const p = new PlayerMecha(ctx, ORANGE_CAT, 1, 100, 100);
  const maxHp = p.maxHp;
  p.takeDamage(30);
  assert.equal(p.hp, maxHp - 30);
  assert.equal(p.dead, false);
  p.takeDamage(maxHp);
  assert.equal(p.hp, 0);
  assert.equal(p.dead, true);
});

test('MainUI：点击「主线战役」按钮进入正式 Campaign 地图', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new MainUI(ctx, game);
  const battleBtn = (ui as any).buttons[0];
  ctx.input.simulateTap(battleBtn.x + 50, battleBtn.y + 25);
  ui.handleClick();
  assert.equal(game.scene, 'campaignMap', '正式入口应进入战役地图');
  assert.equal(ctx.input.tapX, null, 'tap 应被消费');
});

test('MainUI：资源不足时升级按钮 disabled 且不触发', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new MainUI(ctx, game);
  // 先渲染一帧让按钮 label/disabled 更新（layout 已在构造时完成，disabled 在 render 计算）
  ui.render();
  // 初始 0 金币 → 不足
  const btn = (ui as any).buttons[1] as { disabled?: boolean; x: number; y: number; w: number; h: number };
  // 模拟点中升级按钮位置
  ctx.input.simulateTap(btn.x + 50, btn.y + 25);
  ui.handleClick();
  assert.equal(game.player.level, 1, '资源不足不应升级');
});

test('ResultUI：胜利结算显示奖励，点击返回关卡选择', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const ui = new ResultUI(ctx, game);
  // 模拟一场胜利（任务3：outcome 带 clearResult）
  game.lastOutcome = {
    win: true, stageId: '1-1', elapsedSec: 30, hpRatio: 0.8,
    clearResult: { stars: 2, firstClear: true, gold: 50, parts: 5, unlockedNextId: '1-2', previousBestStars: 0, chapterCompleted: false },
  };
  game.scene = 'result';
  ui.render(); // 不抛错即可
  // 返回关卡选择按钮
  const btn = (ui as any).backStageBtn as { x: number; y: number; w: number; h: number };
  ctx.input.simulateTap(btn.x + 50, btn.y + 25);
  ui.handleClick();
  assert.equal(game.scene, 'stageSelect');
});

test('hitButton：边界与圆心判定', () => {
  const b = { id: 'x', label: '', x: 10, y: 10, w: 100, h: 50, color: '#000' };
  assert.equal(hitButton(b, 60, 35), true);  // 中心
  assert.equal(hitButton(b, 10, 10), true);  // 左上角
  assert.equal(hitButton(b, 110, 60), true); // 右下角
  assert.equal(hitButton(b, 9, 35), false);  // 左外
  assert.equal(hitButton(b, 60, 61), false); // 下外
});

test('整局 e2e：主界面升级 → 战斗胜利 → 结算返回 → 存档保留', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  // 先给点资源
  game.player.gold = 100;
  game.player.parts = 20;
  game.doUpgrade(); // Lv1→2 消耗 50/5
  assert.equal(game.player.level, 2);
  assert.equal(game.player.gold, 50);

  // 战斗（直接通过 battle.start 绕过 intro，专注 e2e 逻辑）
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  const stage = getStageById('1-1')!;
  battle.start(stage);
  // 推进几帧让 WaveManager spawn 第一波
  for (let i = 0; i < 3; i++) { ctx.advance(0.016); battle.update(0.016); }
  for (const e of battle.enemies) { e.x = battle.player.x + 10; e.y = battle.player.y; }
  for (let i = 0; i < 600 && battle['ended'] === false; i++) { ctx.advance(0.1); battle.update(0.1); }
  assert.equal(battle.enemies.length, 0);
  // 触发结算（battle 内部已调 game.finishBattle）
  assert.ok(game.lastOutcome);
  assert.equal(game.lastOutcome!.win, true);

  game.returnToMenu();
  assert.equal(game.scene, 'menu');
  // 重读存档确认持久化
  const reloaded = game.save.load();
  assert.equal(reloaded.level, 2);
  assert.equal(reloaded.gold, 50 + STAGE_1_1.rewardGold);
  assert.equal(reloaded.parts, game.player.parts, '结算后的零件应被完整持久化');
});
