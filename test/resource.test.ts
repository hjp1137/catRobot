import assert from 'assert';
import { test, beforeEach } from 'node:test';
import { MockContext } from '../dist/engine/MockContext.js';
import { ResourceManager, IMAGE_RESOURCES } from '../dist/core/ResourceManager.js';
import { listAnimationClips } from '../dist/animation/AnimationManifestRepository.js';

test('ResourceManager Unit Tests', async (t) => {
  const rm = ResourceManager.getInstance();

  beforeEach(() => {
    rm.resetForTest();
  });

  await t.test('1. 初始状态为 PENDING', () => {
    assert.strictEqual(rm.getStatus('player_mecha'), 'PENDING');
    assert.strictEqual(rm.isLoaded('player_mecha'), false);
    assert.strictEqual(rm.isFailed('player_mecha'), false);
    assert.strictEqual(rm.getImage('player_mecha'), null);
  });

  await t.test('2. 加载成功流', async () => {
    const ctx = new MockContext();
    const loadPromise = rm.loadAll(ctx);
    // 延迟以让 MockImage 的 setTimeout 触发 onload
    await new Promise((resolve) => setTimeout(resolve, 10));
    await loadPromise;

    assert.strictEqual(rm.isLoaded('player_mecha'), true);
    assert.strictEqual(rm.isFailed('player_mecha'), false);
    assert.ok(rm.getImage('player_mecha'));
  });

  await t.test('3. 加载失败流与兜底', async () => {
    const ctx = new MockContext();
    const originalSrc = IMAGE_RESOURCES.player_mecha;
    // 带有 fail 的路径会让 MockImage 定时器里触发 onerror
    (IMAGE_RESOURCES as any).player_mecha = 'assets/player_mecha_fail.png';

    try {
      const loadPromise = rm.loadAll(ctx);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await loadPromise;

      assert.strictEqual(rm.isLoaded('player_mecha'), false);
      assert.strictEqual(rm.isFailed('player_mecha'), true);
      assert.strictEqual(rm.getImage('player_mecha'), null);
    } finally {
      (IMAGE_RESOURCES as any).player_mecha = originalSrc;
    }
  });

  await t.test('4. 重复加载处理', async () => {
    const ctx = new MockContext();
    const loadPromise1 = rm.loadAll(ctx);
    const loadPromise2 = rm.loadAll(ctx);
    await new Promise((resolve) => setTimeout(resolve, 10));
    await Promise.all([loadPromise1, loadPromise2]);
    assert.strictEqual(rm.isLoaded('player_mecha'), true);
  });

  await t.test('5. createImage 计数验证（并发与已加载重复加载不重复创建图片）', async () => {
    const ctx = new MockContext();
    let createCount = 0;
    const originalCreate = ctx.createImage;
    ctx.createImage = () => {
      createCount++;
      return originalCreate.call(ctx);
    };

    const animationKeys = listAnimationClips().flatMap(clip => clip.frames.map(frame => frame.artKey));
    const totalResources = new Set([...Object.keys(IMAGE_RESOURCES), ...animationKeys]).size;

    // 并发首次和第二次加载
    const loadPromise1 = rm.loadAll(ctx);
    const loadPromise2 = rm.loadAll(ctx);

    await new Promise((resolve) => setTimeout(resolve, 10));
    await Promise.all([loadPromise1, loadPromise2]);

    assert.strictEqual(createCount, totalResources, '首次创建数应等于资源总数');

    // 加载完成后再次调用不增加计数
    const loadPromise3 = rm.loadAll(ctx);
    await loadPromise3;

    assert.strictEqual(createCount, totalResources, '已加载资源再次加载时不应调用 createImage');
  });

  await t.test('6. 全部失败均落入 FAILED 且 Promise 收敛', async () => {
    const ctx = new MockContext();
    const originalPaths = { ...IMAGE_RESOURCES };
    for (const key of Object.keys(IMAGE_RESOURCES)) {
      (IMAGE_RESOURCES as any)[key] = `assets/${key}_fail.png`;
    }

    try {
      const loadPromise = rm.loadAll(ctx);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await loadPromise; // Promise 必须在此收敛

      for (const key of Object.keys(IMAGE_RESOURCES)) {
        assert.strictEqual(rm.getStatus(key), 'FAILED', `${key} 状态应为 FAILED`);
      }
    } finally {
      Object.assign(IMAGE_RESOURCES, originalPaths);
    }
  });
});
