import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { inspectArtFile, planTask29Cleanup } = require(path.resolve('scripts/task29_1-maintenance-lib.cjs'));

test('任务29.1清理计划只包含已归档GUI Campaign及其关联行，正式数据和历史快照不在范围内', () => {
  const plan = planTask29Cleanup({
    campaigns: [
      { id: 'campaign_main_01', deleted_at: null },
      { id: 'campaign_task29_gui', deleted_at: new Date() },
      { id: 'campaign_task29_gui_copy', deleted_at: new Date() },
    ],
    chapters: [
      { id: 'chapter_main', campaign_id: 'campaign_main_01' },
      { id: 'chapter_gui', campaign_id: 'campaign_task29_gui' },
    ],
    nodes: [{ id: 'node_gui', chapter_id: 'chapter_gui' }],
    connections: [{ id: 'edge_gui', chapter_id: 'chapter_gui' }],
    releaseReferences: [{ releaseId: 'R000007', campaignId: 'campaign_main_01' }],
  });
  assert.deepEqual(plan, {
    campaignIds: ['campaign_task29_gui', 'campaign_task29_gui_copy'], chapterIds: ['chapter_gui'],
    nodeIds: ['node_gui'], connectionIds: ['edge_gui'], releaseReferences: [],
  });
});

test('任务29.1以Sharp读取原图并返回真实透明通道与checksum', async () => {
  const metadata = await inspectArtFile('assets/art-packs/training_ground_v1/maps/map_training_ground_tile_floor_01.png');
  assert.equal(metadata.width, 800);
  assert.equal(metadata.height, 1200);
  assert.equal(metadata.mimeType, 'image/png');
  assert.equal(metadata.hasAlpha, true);
  assert.match(metadata.checksum, /^[a-f0-9]{64}$/);
});
