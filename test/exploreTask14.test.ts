import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { MainUI } from '../dist/ui/MainUI.js';
import { BattleUI, getExploreHudLayout } from '../dist/ui/BattleUI.js';
import { createCameraState, followCameraToPoint, screenToWorld, worldToScreen } from '../dist/explore/WorldTransform.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { drawExploreScene } from '../dist/explore/ExploreRenderer.js';
import { drawExploreTrainingMap } from '../dist/explore/ExploreMapRenderer.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';
import { ResourceManager, IMAGE_RESOURCES } from '../dist/core/ResourceManager.js';
import { drawMecha } from '../dist/render/MechaRenderer.js';
import { drawEnemy } from '../dist/render/Chapter2EnemyRenderer.js';
import { findAnimationClipFor } from '../dist/animation/AnimationManifestRepository.js';

function setupExplore() {
  const ctx = new MockContext(390, 844), game = new GameManager(ctx), explore = new ExploreScene(ctx, game);
  game.setExplore(explore); explore.start(); game.scene = 'explore';
  return { ctx, game, explore };
}

test('任务14：摄像机跟随玩家并夹紧在世界边界内', () => {
  const camera = createCameraState(390, 844, 1800, 2800);
  const followed = followCameraToPoint(camera, { x: 900, y: 1400 }, { targetOffsetY: 80 });
  assert.equal(followed.x, 705);
  assert.equal(followed.y, 898);

  const topLeft = followCameraToPoint(camera, { x: 10, y: 10 }, { targetOffsetY: 80 });
  assert.equal(topLeft.x, 0);
  assert.equal(topLeft.y, 0);

  const bottomRight = followCameraToPoint(camera, { x: 1790, y: 2790 }, { targetOffsetY: 80 });
  assert.equal(bottomRight.x, 1410);
  assert.equal(bottomRight.y, 1956);

  const screen = worldToScreen(followed, { x: 900, y: 1400 });
  assert.deepEqual(screen, { x: 195, y: 502 });
  assert.deepEqual(screenToWorld(followed, screen), { x: 900, y: 1400 });
});

test('任务14：自由探索玩家使用世界坐标移动且不能越出地图', () => {
  const { ctx, explore } = setupExplore();
  assert.ok(explore.worldWidth > ctx.canvasWidth);
  assert.ok(explore.worldHeight > ctx.canvasHeight);

  const startX = explore.player.x;
  ctx.input.simulateMove(1, 0);
  explore.update(1);
  assert.ok(explore.player.x > startX);
  assert.ok(explore.camera.x > 0);

  for (let i = 0; i < 60; i++) explore.update(0.2);
  assert.ok(explore.player.x <= explore.worldWidth - explore.player.radius);
  assert.ok(explore.camera.x <= explore.worldWidth - ctx.canvasWidth);
});

test('任务14：敌人按世界坐标追击，自动攻击与技能可复用', () => {
  const { ctx, game, explore } = setupExplore();
  const enemy = explore.enemies[0];
  enemy.x = explore.player.x + 180;
  enemy.y = explore.player.y;
  const before = Math.hypot(enemy.x - explore.player.x, enemy.y - explore.player.y);

  ctx.advance(0.5);
  explore.update(0.5);
  const after = Math.hypot(enemy.x - explore.player.x, enemy.y - explore.player.y);
  assert.ok(after < before);

  explore.player.attackRange = 360;
  explore.player.attackCooldown = 0.01;
  ctx.advance(0.02);
  explore.update(0.02);
  assert.ok(explore.activeProjectiles >= 1);

  assert.equal(explore.usePlayerSkill('heavy_shield').ok, true);
  explore.player.facingAngle = 0;
  assert.equal(explore.usePlayerSkill('meow_cannon').ok, true);

  ctx.input.simulateMove(1, 0);
  const state = getExploreTestState(game, explore, ctx);
  assert.equal(state.scene, 'explore');
  assert.equal(state.mapId, 'training_ground');
  assert.equal(state.enemyAlive, explore.aliveEnemies);
  assert.equal(state.joystickActive, true);
  assert.ok(state.skillCooldowns.shield >= 0);
  assert.ok(state.skillCooldowns.cannon > 0);
});

test('任务14：devtools 首页新增自由探索入口且不影响战斗测试入口', () => {
  const ctx = new MockContext(390, 844), game = new GameManager(ctx);
  game.setBattle(new BattleManager(ctx, game));
  game.setExplore(new ExploreScene(ctx, game));
  (ctx as any).getSystemInfo = () => ({ windowWidth: 390, windowHeight: 844, pixelRatio: 2, platform: 'devtools' });
  const ui = new MainUI(ctx, game);

  const exploreBtn = (ui as any).guiExploreButton;
  assert.ok(exploreBtn);
  ctx.input.simulateTap(exploreBtn.x + exploreBtn.w / 2, exploreBtn.y + exploreBtn.h / 2);
  ui.handleClick();
  assert.equal(game.scene, 'explore');

  const battleBtn = (ui as any).guiBattleButton;
  assert.ok(battleBtn);
  game.scene = 'menu';
  ctx.input.simulateTap(battleBtn.x + battleBtn.w / 2, battleBtn.y + battleBtn.h / 2);
  ui.handleClick();
  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.stage.id, '1-1');
});

test('任务14.1：自由探索 HUD 显示训练场与自由探索状态', () => {
  const { ctx, explore } = setupExplore();
  const ui = new BattleUI(ctx, explore);
  ui.render();
  const texts = ctx.canvas.calls.filter(call => call.startsWith('text:')).join('\n');
  assert.match(texts, /训练场/);
  assert.match(texts, /敌 0\/12/);
  assert.match(texts, /资 0\/3/);
  assert.match(texts, /箱 0\/1/);
  assert.doesNotMatch(texts, /训练场启动|能源仓警报|废料堆伏击/);
});

test('任务14.1：训练场地图不使用旧主背景并绘制区域地标', () => {
  const ctx = new MockContext(390, 844);
  const camera = createCameraState(390, 844, 1800, 2800);
  drawExploreTrainingMap(ctx.canvas, camera, 1);
  const calls = ctx.canvas.calls.join('\n');
  assert.equal(calls.includes('drawImage:assets/main_bg.png'), false);
  assert.match(calls, /text:训练场/);
  assert.match(calls, /text:A-01/);

  ctx.canvas.calls.length = 0;
  drawExploreTrainingMap(ctx.canvas, { ...camera, x: 640, y: 120 }, 1);
  assert.match(ctx.canvas.calls.join('\n'), /text:B-02/);
});

test('任务20：自由探索训练场以平面地形而非透视背景绘制', async () => {
  const ctx = new MockContext(390, 844);
  const camera = createCameraState(390, 844, 1800, 2800);
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawExploreTrainingMap(ctx.canvas, camera, 1);
  assert.equal(ctx.canvas.calls.some(call => call.includes('map_trainingGround_floor.png:0,0,390,844')), false);
  assert.ok(ctx.canvas.calls.includes('fillRect'), '训练场必须绘制可通行平面地形');
  assert.match(ctx.canvas.calls.join('\n'), /text:A-01/);
});

test('任务32：训练场不把透视插画铺满可移动地面', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawExploreTrainingMap(ctx.canvas, createCameraState(390, 844, 1800, 2800), 1);
  assert.equal(
    ctx.canvas.calls.some(call => call.includes('map_trainingGround_floor.png:0,0,390,844')),
    false,
    '训练场地面必须由平面地形绘制，不能将纵向插画拉伸成整个视口',
  );
});

test('任务32：探索机械鼠以独立视觉尺寸清晰绘制', async () => {
  const { ctx, explore } = setupExplore();
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  drawExploreScene(ctx.canvas, explore, 1);
  const mouse = ctx.canvas.calls.find(call => call.includes('enemy_scrapMouse_normal.png')) ?? '';
  assert.match(mouse, /,64,64$/, '机械鼠绘制直径至少应为 64px，不能复用 14px 碰撞半径');
});

test('任务32：地图图层由后台发布配置的 Art Key 绘制', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest(); await rm.loadAll(ctx);
  const camera = createCameraState(390, 844, 1800, 2800);
  drawExploreTrainingMap(ctx.canvas, camera, 1, undefined, [{
    id: 'configured-floor', name: '后台真实底图', type: 'ground', artKey: 'player.mechaCat.attack',
    order: 0, x: 0, y: 0, width: 1800, height: 2800, scale: 1, opacity: 1,
    tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true,
  }]);
  assert.ok(ctx.canvas.calls.some(call => call.includes('players/player_mechaCat_attack.png')));
});

test('任务32：主角移动读取后台主角表现配置而不是固定 idle 图', async () => {
  const { ctx, explore } = setupExplore();
  const rm = ResourceManager.getInstance();
  rm.resetForTest(); await rm.loadAll(ctx);
  explore.heroVisualTemplate = {
    ...explore.heroVisualTemplate,
    visual: { ...explore.heroVisualTemplate.visual, animationClipKeys: undefined, moveArtKey: 'player.mechaCat.attack' },
  };
  explore.player.attackCooldown = 999;
  ctx.input.simulateMove(1, 0); explore.update(0.2);
  drawExploreScene(ctx.canvas, explore, 0.2);
  assert.ok(ctx.canvas.calls.some(call => call.includes('players/player_mechaCat_attack.png')));
});

test('任务32：后台阻挡图层同时阻断角色和常规子弹', () => {
  const { ctx, explore } = setupExplore();
  const blocker = { id: 'configured-press', x: explore.player.x + 52, y: explore.player.y - 80, w: 80, h: 160, label: '后台压装台', kind: 'machine' };
  (explore as any).terrainObstacles = [blocker];
  const startX = explore.player.x;
  ctx.input.simulateMove(1, 0); explore.update(1);
  assert.ok(explore.player.x < startX + 50, '角色必须使用后台阻挡图层');

  const enemy = explore.enemies[0];
  enemy.x = startX + 250; enemy.y = explore.player.y;
  const hpBefore = enemy.hp;
  explore.player.attackRange = 400; explore.player.attackCooldown = 0;
  explore.player.update(0.01, [enemy], [blocker] as any);
  explore.player.attackCooldown = 999;
  explore.player.update(0.4, [enemy], [blocker] as any);
  assert.equal(explore.player.activeProjectileCount, 0, '常规子弹撞阻挡后应销毁');
  assert.equal(enemy.hp, hpBefore, '障碍后的敌人不能被常规子弹命中');
});

test('任务32：后台 shadowScale 为零时不绘制主角或敌人的地面阴影', async () => {
  const ctx = new MockContext(390, 844);
  const rm = ResourceManager.getInstance();
  rm.resetForTest(); await rm.loadAll(ctx);
  drawMecha(ctx.canvas, { cx: 80, cy: 120, radius: 32, battleFocus: true, shadowScale: 0, artKey: 'player.mechaCat.idle' });
  drawEnemy(ctx.canvas, { cx: 180, cy: 120, radius: 32, hpRatio: 1, shadowScale: 0, artKey: 'enemy.scrapMouse.normal' });
  assert.equal(ctx.canvas.calls.filter(call => call === 'arc').length, 0);
});

test('任务32：主角和机械鼠移动均由后台双帧动画绑定驱动', () => {
  const { explore } = setupExplore();
  const heroClip = findAnimationClipFor('hero', 'move', explore.heroVisualTemplate.visual.animationClipKeys);
  const enemyVisual = explore.enemies[0].visual;
  const enemyClip = findAnimationClipFor('enemy', 'move', enemyVisual?.animationClipKeys);
  assert.ok(heroClip && new Set(heroClip.frames.map(frame => frame.artKey)).size >= 2, '主角移动必须有两张不同帧');
  assert.ok(enemyClip && new Set(enemyClip.frames.map(frame => frame.artKey)).size >= 2, '机械鼠移动必须有两张不同帧');
});

test('任务32：后台紧凑 HUD 配置缩小顶部停靠区并移出主视野', () => {
  const standard = getExploreHudLayout(390, 844, 24);
  const compact = getExploreHudLayout(390, 844, 24, { layout: 'compact', showWaveNotice: false });
  assert.ok(compact.leftDock.w < standard.leftDock.w);
  assert.ok(compact.leftDock.h < standard.leftDock.h);
  assert.ok(compact.leftDock.y < standard.leftDock.y);
});
