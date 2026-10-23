import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { drawExploreScene } from '../dist/explore/ExploreRenderer.js';
import { updateExploreEnemyAI } from '../dist/explore/ExploreEnemySystem.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';
import { projectileHitsTerrain } from '../dist/explore/ExploreTerrain.js';
import { findAnimationClipFor } from '../dist/animation/AnimationManifestRepository.js';
import {
  resolveExploreActionArtKey,
  resolveExploreHeroArtKey,
  resolveExploreMotionPose,
} from '../dist/explore/ExploreMotionVisuals.js';

function setupExplore() {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  return { ctx, explore };
}

test('探索移动角色与机械鼠使用清晰可辨的视觉尺寸', async () => {
  const { ctx, explore } = setupExplore();
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  const heroClip = findAnimationClipFor('hero', 'move', explore.heroVisualTemplate.visual.animationClipKeys)!;
  const enemyClip = findAnimationClipFor('enemy', 'move', explore.enemies[0].visual?.animationClipKeys)!;
  await Promise.all([...heroClip.frames, ...enemyClip.frames].map(frame => rm.loadArtKey(frame.artKey, ctx)));
  explore.player.attackCooldown = 999;
  ctx.input.simulateMove(1, 0);
  explore.update(0.02);
  drawExploreScene(ctx.canvas, explore, 0.02);
  const calls = ctx.canvas.calls.filter(call => call.startsWith('drawImage:'));
  const hero = calls.find(call => /,116,116$/.test(call)) ?? '';
  const enemy = calls.find(call => /,96,96$/.test(call)) ?? '';
  assert.match(hero, /,116,116$/, '主角绘制盒应至少为 116px');
  assert.match(enemy, /,96,96$/, '机械鼠绘制盒应至少为 96px');
});

test('探索移动循环后台发布的多帧且不叠加缩放旋转', async () => {
  const { ctx, explore } = setupExplore();
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  const clip = findAnimationClipFor('hero', 'move', explore.heroVisualTemplate.visual.animationClipKeys)!;
  await Promise.all(clip.frames.map(frame => rm.loadArtKey(frame.artKey, ctx)));
  explore.player.attackCooldown = 999;
  ctx.input.simulateMove(1, 0);
  for (let index = 0; index < clip.frames.length; index++) {
    explore.update(0.14);
    drawExploreScene(ctx.canvas, explore, index * 0.14);
  }
  const heroFrames = ctx.canvas.calls
    .filter(call => /,116,116$/.test(call))
    .map(call => call.slice('drawImage:'.length, call.lastIndexOf(':')));
  assert.ok(new Set(heroFrames).size >= 6, '探索移动必须播放后台发布的多帧跑步循环');
  assert.equal(ctx.canvas.calls.includes('rotate'), false);
});

test('探索自动射击使用后台发布的攻击帧', async () => {
  const { ctx, explore } = setupExplore();
  const rm = ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(ctx);
  explore.player.animationState = 'attack';
  explore.player.attackFlash = 0.1;
  drawExploreScene(ctx.canvas, explore, 0.1);
  const heroCalls = ctx.canvas.calls.filter(call => call.startsWith('drawImage:'));
  assert.ok(heroCalls.some(call => call.includes('player_mechaCat_attack')));
});

test('探索动作选择不映射任何固定素材键', () => {
  assert.equal(resolveExploreActionArtKey('move', 'enemy.scrapMouse.normal', 'enemy.scrapMouse.stepRight'),
    'enemy.scrapMouse.stepRight');
  assert.equal(resolveExploreHeroArtKey('move', true, 0.2, 'player.mechaCat.idle', 'player.mechaCat.stepLeft'),
    'player.mechaCat.stepLeft');
  assert.deepEqual(resolveExploreMotionPose(true, 0.2, 1, 'hero'),
    { offsetY: 0, rotation: 0, scaleX: 1, scaleY: 1 });
});

test('机械鼠巡逻分支推进移动动画状态', () => {
  const { explore } = setupExplore();
  const enemy = explore.enemies[0];
  enemy.x = 100;
  enemy.y = 100;
  enemy.homeX = 100;
  enemy.homeY = 100;
  enemy.patrolTargetX = 220;
  enemy.patrolTargetY = 100;
  explore.player.x = 1200;
  explore.player.y = 1200;
  updateExploreEnemyAI([enemy], explore.player, explore.worldWidth, explore.worldHeight, 0.1);
  assert.equal(enemy.isMoving, true);
  assert.equal(enemy.animationState, 'move');
});

test('机械鼠未发现角色时每只都从可通行位置持续巡逻', () => {
  const { explore } = setupExplore();
  explore.player.x = 100;
  explore.player.y = 2700;
  explore.player.attackRange = 0;
  for (const spawn of explore.spawnPoints) spawn.active = false;

  const blocked = explore.enemies.filter(enemy => projectileHitsTerrain(
    enemy, enemy, explore.terrainObstacles, enemy.radius,
  ));
  assert.deepEqual(blocked.map(enemy => enemy.spawnPointId), [], '敌人不得出生在发布阻挡区内部');

  const starts = new Map(explore.enemies.map(enemy => [enemy, { x: enemy.x, y: enemy.y }]));
  for (let i = 0; i < 50; i++) explore.update(0.1);
  for (const enemy of explore.enemies) {
    const start = starts.get(enemy)!;
    assert.ok(Math.hypot(enemy.x - start.x, enemy.y - start.y) > 10,
      `${enemy.spawnPointId} 未发现角色时应产生实际巡逻位移`);
  }
});
