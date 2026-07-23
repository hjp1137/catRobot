import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { ORANGE_CAT } from '../dist/data/MechaConfig.js';
import { ENEMY_CONFIGS } from '../dist/data/EnemyConfig.js';
import { PlayerMecha } from '../dist/player/PlayerMecha.js';
import { EnemyMouse } from '../dist/enemy/EnemyMouse.js';

test('任务25.1：主角受击进入hit并按输入恢复move', () => {
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 120);

  ctx.input.simulateMove(1, 0);
  player.takeDamage(1);
  assert.equal(player.animationState, 'hit');
  player.update(0.05, []);
  assert.equal(player.animationState, 'hit');
  player.update(0.2, []);
  assert.equal(player.animationState, 'move');
});

test('任务25.1：主角hit期间死亡立即转death', () => {
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 120, 120);

  player.takeDamage(1);
  player.takeDamage(9999);

  assert.equal(player.dead, true);
  assert.equal(player.animationState, 'death');
});

test('任务25.1：敌人受击进入hit并在仍追击时恢复move', () => {
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 320, 120);
  const enemy = new EnemyMouse(ctx, ENEMY_CONFIGS.mouse, 120, 120);

  enemy.takeDamage(1);
  assert.equal(enemy.animationState, 'hit');
  enemy.update(0.05, player);
  assert.equal(enemy.animationState, 'hit');
  enemy.update(0.2, player);
  assert.equal(enemy.animationState, 'move');
});

test('任务25.1：敌人连续受击重启hit且死亡优先', () => {
  const ctx = new MockContext();
  const player = new PlayerMecha(ctx, ORANGE_CAT, 1, 320, 120);
  const enemy = new EnemyMouse(ctx, ENEMY_CONFIGS.mouse, 120, 120);

  enemy.takeDamage(1);
  enemy.update(0.14, player);
  enemy.takeDamage(1);
  enemy.update(0.05, player);
  assert.equal(enemy.animationState, 'hit');
  enemy.takeDamage(9999);
  assert.equal(enemy.animationState, 'death');
});
