import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { getStageTotalEnemies } from '../dist/data/StageConfig.js';
import { getBattleTestState } from '../dist/debug/BattleTestProbe.js';
import type { StageConfig } from '../src/data/StageConfig.js';
import { FIXED_SCREEN_SINGLE_ENEMY_STAGE, FIXED_SCREEN_WAVE_STAGE } from './fixtures/fixedScreenWaveFixture.ts';

function setup(stage: StageConfig = FIXED_SCREEN_SINGLE_ENEMY_STAGE) {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start(stage);
  game.scene = 'battle';
  ctx.advance(0.016);
  battle.update(0.016);
  return { ctx, game, battle };
}

test('任务13：固定屏波次夹具使用三波敌人配置', () => {
  assert.equal(FIXED_SCREEN_WAVE_STAGE.waves?.length, 3);
  assert.equal(FIXED_SCREEN_WAVE_STAGE.enemies.length, 0);
  assert.equal(getStageTotalEnemies(FIXED_SCREEN_WAVE_STAGE), 12);
});

test('任务13：普攻弹道飞行中不提前结算伤害，命中后才扣血', () => {
  const { ctx, battle } = setup();
  const enemy = battle.enemies[0];
  enemy.x = battle.player.x + 240;
  enemy.y = battle.player.y;
  battle.player.attackRange = 360;
  battle.player.attackCooldown = 0.65;
  const hpBefore = enemy.hp;

  ctx.advance(0.65);
  battle.update(0.65);

  assert.equal(enemy.hp, hpBefore);
  assert.equal(battle.activeProjectiles, 1);

  ctx.advance(0.4);
  battle.update(0.4);

  assert.ok(enemy.hp < hpBefore);
  assert.equal(battle.activeProjectiles, 0);
  assert.ok(battle.feedback.snapshot().damageNumbers >= 1);
});

test('任务13：固定屏夹具清完当前波后按延迟推进下一波', () => {
  const { ctx, battle } = setup(FIXED_SCREEN_WAVE_STAGE);
  assert.equal(battle.waveManager.totalWaves, 3);
  assert.equal(battle.enemies.length, 4);
  for (const enemy of battle.enemies) enemy.dead = true;

  ctx.advance(0.016);
  battle.update(0.016);
  assert.equal(battle.waveProgress, '2/3');
  assert.equal(battle.enemies.length, 0);

  ctx.advance(1.0);
  battle.update(1.0);
  assert.equal(battle.waveManager.currentWaveIndex, 1);
  assert.equal(battle.enemies.length, 4);
});

test('任务13：固定屏夹具探针暴露波次、飞行弹道和技能状态', () => {
  const { ctx, game, battle } = setup(FIXED_SCREEN_WAVE_STAGE);
  const enemy = battle.enemies[0];
  enemy.x = battle.player.x + 120;
  enemy.y = battle.player.y;
  battle.player.attackRange = 360;
  battle.player.attackCooldown = 0.65;

  ctx.advance(0.65);
  battle.update(0.65);
  battle.usePlayerSkill('heavy_shield');
  battle.player.facingAngle = 0;
  battle.usePlayerSkill('meow_cannon');

  const state = getBattleTestState(game, battle, ctx);
  assert.equal(state.stageId, FIXED_SCREEN_WAVE_STAGE.id);
  assert.equal(state.waveIndex, 1);
  assert.equal(state.waveTotal, 3);
  assert.equal(state.enemyAlive, battle.aliveEnemies);
  assert.equal(state.enemySpawned, 4);
  assert.ok(state.bullets >= 1);
  assert.equal(state.shieldActive, true);
  assert.equal(state.cannonCooldown, true);
  assert.equal(state.battleResult, null);
});
