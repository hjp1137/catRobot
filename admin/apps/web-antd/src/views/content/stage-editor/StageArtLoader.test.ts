import { describe, expect, it } from 'vitest';
import { loadStageArtUrls } from './StageArtLoader';

describe('loadStageArtUrls', () => {
  it('uses the original image when a thumbnail is temporarily unavailable', async () => {
    const result = await loadStageArtUrls({
      artKeys: ['map.trainingGround.floor'],
      resolveResource: async () => ({ thumbnailUrl: '/thumb', originalUrl: '/original' }),
      fetchBlobUrl: async url => {
        if (url === '/thumb') throw new Error('temporary thumbnail failure');
        return 'blob:original';
      },
    });

    expect(result.urls['map.trainingGround.floor']).toBe('blob:original');
    expect(result.failedKeys).toEqual([]);
  });

  it('limits simultaneous resource requests', async () => {
    let active = 0;
    let maximum = 0;
    const result = await loadStageArtUrls({
      artKeys: ['a', 'b', 'c', 'd', 'e'],
      concurrency: 2,
      resolveResource: async key => ({ thumbnailUrl: `/${key}` }),
      fetchBlobUrl: async url => {
        active += 1;
        maximum = Math.max(maximum, active);
        await new Promise(resolve => setTimeout(resolve, 5));
        active -= 1;
        return `blob:${url}`;
      },
    });

    expect(maximum).toBeLessThanOrEqual(2);
    expect(Object.keys(result.urls)).toHaveLength(5);
  });
});
