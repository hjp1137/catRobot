import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TutorialManager } from '../dist/core/TutorialManager.js';
import { TUTORIAL_FEATURES, TUTORIAL_STATIC_TARGETS } from '../shared/tutorial-catalog/index.js';

test('游戏运行时教程目录与共享目录数据保持一致', () => {
  assert.deepEqual((TutorialManager as any).SHARED_CATALOG.features, TUTORIAL_FEATURES);
  assert.deepEqual((TutorialManager as any).SHARED_CATALOG.targets, TUTORIAL_STATIC_TARGETS);
  assert.ok(TUTORIAL_STATIC_TARGETS.some(target => target[1] === 'battle.enemy'));
  assert.ok(Object.isFrozen(TUTORIAL_FEATURES));
  assert.ok(Object.isFrozen(TUTORIAL_FEATURES[0]));
  assert.ok(Object.isFrozen(TUTORIAL_STATIC_TARGETS[0]));
  assert.ok(TUTORIAL_FEATURES.every(feature => typeof feature.id === 'string' &&
    typeof feature.name === 'string' && typeof feature.safeOnSkip === 'boolean'));
  assert.ok(TUTORIAL_STATIC_TARGETS.every(target => (target[0] === 'ui' || target[0] === 'canvas') &&
    target.length === 3 && target.every(value => typeof value === 'string')));
});

test('小游戏运行时使用可直接解析的教程目录单文件', () => {
  const root = process.cwd();
  assert.ok(fs.existsSync(path.join(root, 'src/tutorial/TutorialCatalog.ts')));
  assert.match(fs.readFileSync(path.join(root, 'src/core/TutorialManager.ts'), 'utf8'), /\.\.\/tutorial\/TutorialCatalog/);
  for (const file of ['src/tutorial/GameTutorialTargetResolver.ts', 'src/tutorial/TutorialFeatureService.ts']) {
    assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /\.\/TutorialCatalog/);
  }
});
