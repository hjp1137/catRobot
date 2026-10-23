import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalContentRepository } from '../dist/content/repositories/LocalContentRepository.js';
import { ContentRegistry } from '../dist/content/registry/ContentRegistry.js';

test('任务21：LocalContentRepository 加载首批内容模板', async () => {
  const repo = new LocalContentRepository();
  const enemies = await repo.loadEnemies();
  const backgrounds = await repo.loadBackgrounds();
  const heroes = await repo.loadHeroVisuals();
  const stages = await repo.loadStages();

  assert.equal(enemies.length, 5);
  assert.equal(backgrounds.length, 2);
  assert.equal(heroes.length, 1);
  assert.equal(stages.length, 11);
  assert.ok(enemies.some(e => e.id === 'enemy_scrap_mouse_01'));
  assert.ok(stages.some(s => s.id === 'stage_explore_training_01'));
  assert.ok(enemies.some(e => e.id === 'enemy_scrap_mouse_king_01'));
  assert.ok(stages.some(s => s.id === 'stage_ch1_10'));
});

test('任务21：ContentRegistry 集中查询模板并冻结配置对象', async () => {
  const registry = await ContentRegistry.load(new LocalContentRepository());
  const mouse = registry.getEnemy('enemy_scrap_mouse_01');
  const bg = registry.getBackground('background_training_ground_v1');
  const hero = registry.getHeroVisual('hero_mecha_cat_default');
  const stage = registry.getStage('stage_battle_1_1');

  assert.equal(mouse.stats.maxHp, 30);
  assert.equal(mouse.visual.idleArtKey, 'enemy.scrapMouse.normal');
  assert.equal(bg.art.floorArtKey, 'map.trainingGround.floor');
  assert.equal(hero.skills.cannonIconArtKey, 'ui.skill.cannon');
  assert.equal(stage.backgroundThemeId, 'background_training_ground_v1');
  assert.equal(registry.listEnemies().length, 5);
  assert.equal(Object.isFrozen(mouse), true);
});

test('任务21：ContentRegistry 缺失模板输出明确错误', async () => {
  const registry = await ContentRegistry.load(new LocalContentRepository());
  assert.throws(
    () => registry.getEnemy('missing_enemy'),
    /ContentRegistry.*enemy.*missing_enemy/,
  );
  assert.throws(
    () => registry.getStage('missing_stage'),
    /ContentRegistry.*stage.*missing_stage/,
  );
});
