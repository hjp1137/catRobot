import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BattleUI, getBattleHudSafeTop, getBattleSkillButtonLayout, getExploreHudLayout } from '../dist/ui/BattleUI.js';
import { BattleFeedback } from '../dist/battle/BattleFeedback.js';
import { BATTLE_ASSETS, getEnemyVisualScale } from '../dist/config/BattleAssets.js';
import { drawTrainingBackground } from '../dist/render/BackgroundRenderer.js';
import { drawEnemy } from '../dist/render/Chapter2EnemyRenderer.js';
import { ResourceManager, IMAGE_RESOURCES } from '../dist/core/ResourceManager.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { getStageTotalEnemies } from '../dist/data/StageConfig.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import type { ISystemInfo } from '../src/engine/IContext.js';
import { FIXED_SCREEN_WAVE_STAGE } from './fixtures/fixedScreenWaveFixture.ts';

class SafeAreaMockContext extends MockContext {
  getSystemInfo(): ISystemInfo {
    return { windowWidth: 390, windowHeight: 844, pixelRatio: 3, statusBarHeight: 44,
      menuButton: { top: 52, bottom: 88, height: 32, right: 382, width: 87 } };
  }
}

test('任务12.1：HUD 安全区避开微信状态栏和胶囊按钮', () => {
  const safeTop = getBattleHudSafeTop({
    windowWidth: 390,
    windowHeight: 844,
    pixelRatio: 3,
    statusBarHeight: 44,
    menuButton: { top: 52, bottom: 88, height: 32, right: 382, width: 87 },
  });
  assert.ok(safeTop >= 96, `safeTop=${safeTop} 应位于胶囊按钮下方`);
});

test('任务12.1：技能按钮尺寸与触控热区满足局内操作', () => {
  const buttons = getBattleSkillButtonLayout(375, 667);
  assert.equal(buttons.length, 2);
  assert.ok(buttons.every(btn => btn.r >= 36), '技能按钮半径应至少 36px');
  assert.ok(buttons.every(btn => btn.hitR > btn.r), '触控热区应大于视觉半径');
  assert.ok(buttons[0].cy > 585, '技能按钮应位于右下易触达区域');
});

test('任务33：战术 HUD 完全按后台参数布置六边形技能舱', () => {
  const config = {
    layout: 'tactical' as const,
    theme: 'industrial' as const,
    skillButtonShape: 'hex' as const,
    skillButtonSize: 68,
    skillButtonGap: 14,
    skillButtonRight: 18,
    skillButtonBottom: 24,
    showSkillLabels: true,
    panelOpacity: 0.82,
  };
  const buttons = getBattleSkillButtonLayout(390, 844, config);
  assert.deepEqual(buttons.map(button => button.r), [34, 34]);
  assert.equal(buttons[0].cx, 338);
  assert.equal(buttons[0].cy, 786);
  assert.equal(buttons[0].shape, 'hex');
  assert.equal(buttons[0].showLabel, true);
  assert.equal(buttons[1].cx, 256);
});

test('任务33：战术 HUD 顶部舱体避开微信胶囊并采用后台透明度', () => {
  const layout = getExploreHudLayout(390, 844, 96, {
    layout: 'tactical', theme: 'industrial', panelOpacity: 0.76,
  });
  assert.ok(layout.title.y >= 108);
  assert.ok(layout.leftDock.y > layout.title.y);
  assert.equal(layout.panelOpacity, 0.76);
  assert.equal(layout.exit.w, 54);
});

test('任务12.1：战斗反馈池限制同屏对象数量', () => {
  const feedback = new BattleFeedback();
  for (let i = 0; i < 90; i++) {
    feedback.recordHit({
      kind: i % 3 === 0 ? 'skill' : 'basic',
      fromX: 180,
      fromY: 500,
      toX: 40 + i,
      toY: 120 + (i % 8) * 16,
      damage: 12,
      killed: true,
      targetRadius: 18,
    });
  }
  const snap = feedback.snapshot();
  assert.ok(snap.projectiles <= 36, `projectiles=${snap.projectiles}`);
  assert.ok(snap.damageNumbers <= 48, `damageNumbers=${snap.damageNumbers}`);
  assert.ok(snap.impacts <= 48, `impacts=${snap.impacts}`);
  assert.ok(snap.explosions <= 24, `explosions=${snap.explosions}`);
  assert.ok(snap.drops <= 32, `drops=${snap.drops}`);
});

test('任务13.1：玩家与普通敌人显示比例保持主角优先', () => {
  const normalVisualRadius = ENEMY_CONFIGS.mouse.radius * getEnemyVisualScale(false, false);
  const eliteVisualRadius = ENEMY_CONFIGS.elite_mouse.radius * getEnemyVisualScale(false, true);
  assert.ok(BATTLE_ASSETS.player.idle.scale >= 1.7);
  assert.ok(getEnemyVisualScale(false, false) >= 1.06);
  assert.ok(getEnemyVisualScale(false, false) <= 1.18);
  assert.ok(eliteVisualRadius >= normalVisualRadius * 1.2);
  assert.ok(eliteVisualRadius <= normalVisualRadius * 1.3);
});

test('任务12.2：背景图片绘制后叠加暗色遮罩，避免大机甲抢主体', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawTrainingBackground(ctx.canvas, 390, 844, 1);
  const drawIndex = ctx.canvas.calls.findIndex(call => call.startsWith(`drawImage:${IMAGE_RESOURCES.main_bg}`));
  const laterFillRect = ctx.canvas.calls.slice(drawIndex + 1).includes('fillRect');
  assert.ok(drawIndex >= 0, '应先绘制训练场背景图');
  assert.ok(laterFillRect, '背景图之后应再绘制暗色遮罩');
});

test('任务12.2：普通敌人不再直接绘制带灰底的 enemy_rat 贴图', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawEnemy(ctx.canvas, { cx: 100, cy: 120, radius: 20, hpRatio: 1, variant: 'normal' });
  assert.equal(ctx.canvas.calls.some(call => call.startsWith('drawImage:assets/enemy_rat.png')), false);
  assert.ok(ctx.canvas.calls.includes('fill'), '普通敌人应使用干净的程序化绘制');
});

test('任务20：普通敌人优先绘制训练场 physical 图片资源', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawEnemy(ctx.canvas, { cx: 100, cy: 120, radius: 20, hpRatio: 1, variant: 'normal' });
  assert.ok(
    ctx.canvas.calls.some(call => call.startsWith(`drawImage:${IMAGE_RESOURCES.enemy_rat}`)),
    '普通敌人应使用训练场 scrap mouse physical 图片'
  );
});

test('任务13：固定屏波次夹具与玩家视觉比例满足截图修复目标', () => {
  assert.equal(FIXED_SCREEN_WAVE_STAGE.waves?.length, 3);
  assert.equal(getStageTotalEnemies(FIXED_SCREEN_WAVE_STAGE), 12);
  assert.ok(BATTLE_ASSETS.player.idle.scale >= 1.9);
});

test('任务13.1：敌人靠近玩家后保持可读分离距离', () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(FIXED_SCREEN_WAVE_STAGE);
  ctx.advance(0.016);
  battle.update(0.016);

  const [a, b] = battle.enemies;
  a.x = battle.player.x - 1;
  a.y = battle.player.y - 20;
  b.x = battle.player.x + 1;
  b.y = battle.player.y - 20;

  ctx.advance(0.016);
  battle.update(0.016);

  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  assert.ok(dist >= 36, `dist=${dist}`);
});

test('任务13.1：敌人边界避开顶部 HUD 与底部技能热区', () => {
  const ctx = new SafeAreaMockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(FIXED_SCREEN_WAVE_STAGE);
  ctx.advance(0.016);
  battle.update(0.016);

  const enemy = battle.enemies[0];
  enemy.x = 180;
  enemy.y = 20;
  ctx.advance(0.016);
  battle.update(0.016);

  const hudBottom = getBattleHudSafeTop(ctx.getSystemInfo()) + 54;
  const skillTop = Math.min(...getBattleSkillButtonLayout(ctx.canvasWidth, ctx.canvasHeight).map(btn => btn.cy - btn.hitR));
  assert.ok(enemy.y >= hudBottom + enemy.radius, `enemy.y=${enemy.y}, hudBottom=${hudBottom}`);
  assert.ok(enemy.y <= skillTop - enemy.radius, `enemy.y=${enemy.y}, skillTop=${skillTop}`);
});

test('任务13.1：波次提示带半透明底板并避开战斗中心', () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(FIXED_SCREEN_WAVE_STAGE);
  ctx.advance(0.016);
  battle.update(0.016);

  const ui = new BattleUI(ctx, battle);
  ui.render();

  assert.ok(ctx.canvas.calls.includes('fillStyle:rgba(4, 8, 18, 0.62)'));
});
