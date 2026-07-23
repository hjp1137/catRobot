import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import { BATTLE_ASSET_DIRECTORIES, BATTLE_ASSETS } from '../dist/config/BattleAssets.js';

function setup() {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  game.setBattle(battle);
  battle.start({ ...STAGE_1_1, enemies: [{ enemyId: 'mouse', count: 1 }], waves: undefined });
  for (let i = 0; i < 3; i++) { ctx.advance(0.016); battle.update(0.016); }
  return { ctx, battle };
}

test('任务12：普攻命中生成弹道、伤害数字和命中反馈', () => {
  const { ctx, battle } = setup();
  const enemy = battle.enemies[0];
  enemy.x = battle.player.x + 40;
  enemy.y = battle.player.y;

  ctx.advance(0.7);
  battle.update(0.7);
  ctx.advance(0.1);
  battle.update(0.1);

  const snap = battle.feedback.snapshot();
  assert.ok(snap.projectiles >= 1, '普攻应产生可见弹道');
  assert.ok(snap.damageNumbers >= 1, '命中应产生伤害数字');
  assert.ok(snap.impacts >= 1, '命中应产生爆点反馈');
});

test('任务12：击杀敌人生成死亡爆炸和金币掉落', () => {
  const { ctx, battle } = setup();
  (ctx as any).random = () => 0.1;
  battle.player.attack = 999;
  const enemy = battle.enemies[0];
  enemy.x = battle.player.x + 40;
  enemy.y = battle.player.y;

  ctx.advance(0.7);
  battle.update(0.7);
  ctx.advance(0.1);
  battle.update(0.1);

  const snap = battle.feedback.snapshot();
  assert.ok(snap.explosions >= 1, '敌人死亡应有爆炸/消失反馈');
  assert.ok(snap.drops >= 1, '敌人死亡应有金币掉落表现');
});

test('任务12：战斗素材目录与资源键集中配置', () => {
  assert.ok(BATTLE_ASSET_DIRECTORIES.includes('assets/images/player'));
  assert.equal(BATTLE_ASSETS.player.idle.resourceKey, 'player_mecha');
  assert.equal(BATTLE_ASSETS.drops.coin.resourceKey, 'coin');
  assert.equal(BATTLE_ASSETS.effects.explosion.resourceKey, 'skill_roar');
});
