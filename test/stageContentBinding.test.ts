import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { ExploreScene } from '../dist/explore/ExploreScene.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import { TRAINING_GROUND_CONTENT } from '../dist/explore/ExploreContentConfig.js';
import { getExploreTestState } from '../dist/debug/ExploreTestProbe.js';
import { createEnemyConfigFromTemplate } from '../dist/content/adapters/EnemyTemplateAdapter.js';

test('任务21：固定屏 1-1 波次通过 StageDefinition 绑定敌人模板', () => {
  const first = STAGE_1_1.waves![0].enemies[0] as any;
  const last = STAGE_1_1.waves![2].enemies[1] as any;

  assert.equal(STAGE_1_1.contentStageId, 'stage_battle_1_1');
  assert.equal(STAGE_1_1.backgroundThemeId, 'background_training_ground_v1');
  assert.equal(first.enemyTemplateId, 'enemy_scrap_mouse_01');
  assert.equal(last.enemyTemplateId, 'enemy_scrap_guard_elite_01');
});

test('任务21：BattleManager 创建敌人的数值和 Art Key 来自 EnemyTemplate', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  const battle = new BattleManager(ctx, game);
  battle.start(STAGE_1_1);
  ctx.advance(0.016);
  battle.update(0.016);

  const enemy: any = battle.enemies[0];
  assert.equal(enemy.contentTemplateId, 'enemy_scrap_mouse_01');
  assert.equal(enemy.maxHp, 39.6);
  assert.equal(enemy.attack, 5.2);
  assert.equal(enemy.visual.idleArtKey, 'enemy.scrapMouse.normal');
  assert.equal(battle.activeBackgroundThemeId, 'background_training_ground_v1');
  assert.equal(battle.activeHeroVisualTemplateId, 'hero_mecha_cat_default');
});

test('任务21：自由探索刷新组通过 StageDefinition 绑定模板', () => {
  const first = TRAINING_GROUND_CONTENT.spawnPoints[0] as any;
  const elite = TRAINING_GROUND_CONTENT.spawnPoints[3] as any;

  assert.equal(TRAINING_GROUND_CONTENT.stageDefinitionId, 'stage_explore_training_01');
  assert.equal(TRAINING_GROUND_CONTENT.backgroundThemeId, 'background_training_ground_v1');
  assert.equal(first.enemyTemplateId, 'enemy_scrap_mouse_01');
  assert.equal(elite.enemyTemplateId, 'enemy_scrap_guard_elite_01');
});

test('任务21：ExploreScene 探针暴露运行时内容模板绑定', () => {
  const ctx = new MockContext(390, 844);
  const game = new GameManager(ctx);
  const explore = new ExploreScene(ctx, game);
  game.setExplore(explore);
  explore.start();
  game.scene = 'explore';

  const enemy: any = explore.enemies[0];
  const state: any = getExploreTestState(game, explore, ctx);
  assert.equal(enemy.contentTemplateId, 'enemy_scrap_mouse_01');
  assert.equal(state.activeStageId, 'stage_explore_training_01');
  assert.equal(state.activeBackgroundThemeId, 'background_training_ground_v1');
  assert.equal(state.activeHeroVisualTemplateId, 'hero_mecha_cat_default');
  assert.ok(state.activeEnemyTemplateIds.includes('enemy_scrap_mouse_01'));
});

test('第一章第十节后台首领模板映射为机械鼠王运行时', () => {
  const config = createEnemyConfigFromTemplate({
    id: 'enemy_scrap_mouse_king_01', name: '机械鼠王', category: 'boss',
    behaviorType: 'melee', enabled: true, contentVersion: 1,
    stats: { maxHp: 220, attack: 7, defense: 4, moveSpeed: 55 },
    combat: { attackInterval: 1.6, attackRange: 52, detectRadius: 420, chaseRadius: 600, contactDamage: true },
    visual: { idleArtKey: 'enemy.scrapGuard.elite', displayScale: 1.45, collisionRadius: 32 },
    rewards: { coinMin: 10, coinMax: 18 }, tags: ['boss'],
  } as any);

  assert.equal(config.id, 'mecha_rat_king');
  assert.equal(config.variant, 'boss');
  assert.equal(config.contentTemplateId, 'enemy_scrap_mouse_king_01');
});
