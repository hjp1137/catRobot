import { describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('./client', () => ({ api: apiMock }));

import { contentApi } from './content';

describe('contentApi.resources', () => {
  it('unwraps the paged resource response for list consumers', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { items: [{ art_key: 'map.trainingGround.overhead' }], page: 1 } });

    await expect(contentApi.resources()).resolves.toEqual([{ art_key: 'map.trainingGround.overhead' }]);
  });

  it('preserves paging metadata for the resource management page', async () => {
    const page = { items: [{ art_key: 'player.mechaCat.attack' }], total: 92, categoryCounts: { 全部: 92 } };
    apiMock.get.mockResolvedValueOnce({ data: page });
    await expect(contentApi.resourcesPage()).resolves.toEqual(page);
  });

  it('allows enough time for atomic snapshot publishing', async () => {
    const post = vi.fn().mockResolvedValue({ data: { releaseVersion: 'R000020' } });
    (apiMock as any).post = post;
    await contentApi.publish();
    expect(post).toHaveBeenCalledWith('/content/publish', undefined, { timeout: 60000 });
  });
});
