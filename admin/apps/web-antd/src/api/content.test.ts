import { describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('./client', () => ({ api: apiMock }));

import { contentApi } from './content';

describe('contentApi.resources', () => {
  it('unwraps the paged resource response for list consumers', async () => {
    apiMock.get.mockResolvedValueOnce({ data: { items: [{ art_key: 'map.trainingGround.overhead' }], page: 1 } });

    await expect(contentApi.resources()).resolves.toEqual([{ art_key: 'map.trainingGround.overhead' }]);
  });
});
