import { describe, expect, it } from 'vitest';
import fieldSource from './ArtResourceField.vue?raw';
import { resourceStatusBlocked, resourceStatusColor } from './artResourceUi';

describe('ArtResourceField draft fallback warning', () => {
  it('keeps a published fallback preview usable while exposing the draft warning', () => {
    const row = {
      status: 'physical', thumbnailUrl: '/content/resources/map.floor/thumbnail',
      draftVersionStatus: 'Missing',
      draftWarning: '草稿版本 Missing，当前展示发布版本',
      fallbackReason: 'draft-version-missing',
    };

    expect(resourceStatusBlocked(row)).toBe(false);
    expect(resourceStatusColor(row)).toBe('green');
    expect(row.thumbnailUrl).toBeTruthy();
    expect(fieldSource).toContain('resolvedResource?.draftWarning');
  });
});
