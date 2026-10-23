import test from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';
import { listAnimationClips } from '../dist/animation/AnimationManifestRepository.js';

test('任务35：启动加载覆盖正式动画片段的全部帧资源', async () => {
  const context = new MockContext(390, 844);
  const manager = ResourceManager.getInstance();
  manager.resetForTest();

  await manager.loadAll(context);

  const keys = [...new Set(listAnimationClips().flatMap(clip => clip.frames.map(frame => frame.artKey)))];
  assert.ok(keys.length > 0);
  for (const key of keys) {
    assert.ok(manager.getImageByArtKey(key), `动画帧 ${key} 必须在启动阶段预加载`);
  }
});
