import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LocalContentRepository } from '../dist/content/repositories/LocalContentRepository.js';
import { ENEMY_TEMPLATES } from '../dist/content/data/enemies.js';
import { BACKGROUND_THEMES } from '../dist/content/data/backgrounds.js';
import { HERO_VISUAL_TEMPLATES } from '../dist/content/data/heroes.js';
import { STAGE_DEFINITIONS } from '../dist/content/data/stages.js';

function createSnapshot() {
  const enemies = JSON.parse(JSON.stringify(ENEMY_TEMPLATES));
  const heroes = JSON.parse(JSON.stringify(HERO_VISUAL_TEMPLATES));
  enemies[0].stats.maxHp = 123;
  enemies[0].visual.idleArtKey = 'enemy.scrapBug.normal';
  for (const enemy of enemies) delete enemy.visual.animationClipKeys;
  for (const hero of heroes) delete hero.visual.animationClipKeys;
  return {
    schemaVersion: 1,
    releaseId: 'rel_test_snapshot',
    releaseVersion: 'R000123',
    generatedAt: '2026-07-12T00:00:00.000Z',
    checksum: 'test-checksum',
    enemies,
    backgrounds: JSON.parse(JSON.stringify(BACKGROUND_THEMES)),
    heroVisuals: heroes,
    stages: JSON.parse(JSON.stringify(STAGE_DEFINITIONS)),
  };
}

test('任务22：LocalContentRepository 优先读取发布快照', async () => {
  const repo = new LocalContentRepository({ snapshot: createSnapshot() });
  const enemies = await repo.loadEnemies();

  assert.equal(enemies[0].stats.maxHp, 123);
  assert.equal(enemies[0].visual.idleArtKey, 'enemy.scrapBug.normal');
  assert.equal(repo.getRepositorySource(), 'mysql-published-snapshot');
  assert.equal(repo.getSnapshotMeta()?.releaseVersion, 'R000123');
});

test('任务22：无发布快照时回退内置默认配置', async () => {
  const repo = new LocalContentRepository({ snapshot: null });
  const enemies = await repo.loadEnemies();

  assert.equal(enemies[0].stats.maxHp, 30);
  assert.equal(repo.getRepositorySource(), 'built-in-default');
  assert.equal(repo.getSnapshotMeta(), null);
});

test('任务25.1：旧发布快照缺 animationClips 时不回退内置样例', () => {
  const repo = new LocalContentRepository({ snapshot: createSnapshot() });
  const content = repo.getContentData();

  assert.deepEqual(content.animationClips, []);
});

test('任务22：非法发布快照不得静默回退', async () => {
  const badSnapshot = { ...createSnapshot(), enemies: [] };
  const repo = new LocalContentRepository({ snapshot: badSnapshot });

  await assert.rejects(
    () => repo.loadEnemies(),
    /CONTENT_SNAPSHOT.*enemies/,
  );
});
