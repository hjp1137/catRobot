import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveDirectionalAnimationState } from '../dist/animation/AnimationRuntime.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { drawExploreScene } from '../dist/explore/ExploreRenderer.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';

const read = (name: string) => JSON.parse(fs.readFileSync(`content-store/published/${name}`, 'utf8'));

test('任务35.1：第一关主角和敌人均绑定前后方向移动 Clip', () => {
  const content = read('content.snapshot.json');
  const targets = [
    content.heroVisuals.find((item: any) => item.id === 'hero_mecha_cat_default'),
    content.enemies.find((item: any) => item.id === 'enemy_scrap_mouse_01'),
    content.enemies.find((item: any) => item.id === 'enemy_scrap_guard_elite_01'),
  ];

  for (const target of targets) {
    assert.ok(target, '第一关角色模板必须存在');
    assertDirectionalClip(content, target.visual.animationClipKeys.moveDown, `${target.id} 向前`);
    assertDirectionalClip(content, target.visual.animationClipKeys.moveUp, `${target.id} 向后`);
  }
});

function assertDirectionalClip(content: any, clipKey: string, label: string): void {
  assert.ok(clipKey, `${label}必须配置独立 Clip`);
  const clip = content.animationClips.find((item: any) => item.key === clipKey);
  assert.ok(clip, `${label} Clip 必须进入正式快照`);
  assert.equal(clip.frames.length, 6, `${label}必须包含 6 帧`);
  assert.equal(new Set(clip.frames.map((frame: any) => frame.artKey)).size, 6, `${label}帧不得复用`);
}

test('任务35.1：移动向量选择前后剪辑且其他动作不受影响', () => {
  const bindings = { move: 'side', moveUp: 'up', moveDown: 'down' };
  assert.equal(resolveDirectionalAnimationState('move', 0, -1, bindings), 'moveUp');
  assert.equal(resolveDirectionalAnimationState('move', 0, 1, bindings), 'moveDown');
  assert.equal(resolveDirectionalAnimationState('move', -1, 0.2, bindings), 'move');
  assert.equal(resolveDirectionalAnimationState('attack', 0, -1, bindings), 'attack');
  assert.equal(resolveDirectionalAnimationState('move', 0, -1, { move: 'side' }), 'move');
});

test('任务35.1：探索渲染按主角纵向移动切换正式方向帧', async () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const scene = new ExploreScene(ctx, game);
  game.setExplore(scene);
  scene.start();
  const resources = ResourceManager.getInstance();
  resources.resetForTest();
  await resources.loadAll(ctx);
  scene.player.attackCooldown = 999;

  ctx.input.simulateMove(0, 1);
  scene.update(0.12);
  drawExploreScene(ctx.canvas, scene, 0.12);
  assert.ok(ctx.canvas.calls.some(call => call.includes('player_mechaCat_run_down_phase')));

  ctx.canvas.calls.length = 0;
  ctx.input.simulateMove(0, -1);
  scene.update(0.12);
  drawExploreScene(ctx.canvas, scene, 0.24);
  assert.ok(ctx.canvas.calls.some(call => call.includes('player_mechaCat_run_up_phase')));
});

test('任务35.1：探索敌人巡逻方向切换前后移动帧', async () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const scene = new ExploreScene(ctx, game);
  game.setExplore(scene);
  scene.start();
  const resources = ResourceManager.getInstance();
  resources.resetForTest();
  await resources.loadAll(ctx);
  const enemy = scene.enemies.find(item => item.contentTemplateId === 'enemy_scrap_mouse_01')!;
  enemy.animationState = 'move';
  enemy.exploreState = 'patrol';
  enemy.patrolTargetX = enemy.x;
  enemy.patrolTargetY = enemy.y + 100;
  drawExploreScene(ctx.canvas, scene, 0.1);
  assert.ok(ctx.canvas.calls.some(call => call.includes('enemy_scrapMouse_run_down_phase')));

  ctx.canvas.calls.length = 0;
  enemy.patrolTargetY = enemy.y - 100;
  drawExploreScene(ctx.canvas, scene, 0.2);
  assert.ok(ctx.canvas.calls.some(call => call.includes('enemy_scrapMouse_run_up_phase')));
});
