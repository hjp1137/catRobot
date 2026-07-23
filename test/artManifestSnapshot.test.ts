import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ART_MANIFEST_SNAPSHOT } from '../dist/assets/generated/artManifestSnapshot.js';
import { getArtPath, getArtResource } from '../dist/assets/ArtResourceResolver.js';

test('任务24：游戏端优先读取已发布 Art Manifest Snapshot', () => {
  const entry = ART_MANIFEST_SNAPSHOT.resources['enemy.scrapMouse.normal'];
  assert.ok(entry, '发布快照应包含当前内容引用的废料鼠资源');
  assert.equal(entry.releaseVersion, undefined);
  assert.match(ART_MANIFEST_SNAPSHOT.releaseVersion, /^R\d{6}$/);
  assert.equal(entry.path, `assets/art-releases/${ART_MANIFEST_SNAPSHOT.releaseVersion}/enemies/enemy_scrapMouse_normal.png`);
  assert.equal(getArtPath('enemy.scrapMouse.normal'), entry.path);
  assert.equal(getArtResource('enemy.scrapMouse.normal').path, entry.path);
});
