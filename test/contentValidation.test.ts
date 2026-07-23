import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalContentRepository } from '../dist/content/repositories/LocalContentRepository.js';
import { validateContentData } from '../dist/content/validation/ContentValidator.js';

async function loadContent() {
  const repo = new LocalContentRepository();
  return repo.getContentData();
}

test('任务21：默认本地内容配置通过完整校验', async () => {
  const result = validateContentData(await loadContent());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('任务21：启用关卡不得引用禁用敌人模板', async () => {
  const content = await loadContent();
  content.enemies = content.enemies.map(enemy =>
    enemy.id === 'enemy_scrap_mouse_01' ? { ...enemy, enabled: false } : enemy,
  );

  const result = validateContentData(content);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error =>
    error.file === 'src/content/data/stages.ts' &&
    error.objectId === 'stage_battle_1_1' &&
    error.field.includes('enemyTemplateId') &&
    error.reason.includes('禁用'),
  ));
});

test('任务21：配置校验报告具体对象字段和原因', async () => {
  const content = await loadContent();
  content.stages = content.stages.map(stage =>
    stage.id === 'stage_explore_training_01'
      ? { ...stage, backgroundThemeId: 'missing_background' }
      : stage,
  );

  const result = validateContentData(content);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error =>
    error.objectId === 'stage_explore_training_01' &&
    error.field === 'backgroundThemeId' &&
    error.reason.includes('missing_background'),
  ));
});
