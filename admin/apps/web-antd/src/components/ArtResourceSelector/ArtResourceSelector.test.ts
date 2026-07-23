import { describe, expect, it } from 'vitest';
import source from './ArtResourceSelector.vue?raw';

describe('ArtResourceSelector visual selection', () => {
  it('searches by art key and resource display name', () => {
    expect(source).toContain('searchText');
    expect(source).toContain('item.display_name');
    expect(source).toContain('resourceStatusBlocked');
  });

  it('keeps missing or invalid resources visually blocked', () => {
    expect(source).toContain("resource_status === 'missing'");
    expect(source).toContain("validation_status === 'invalid'");
    expect(source).toContain('不可选择');
  });

  it('loads thumbnails from the unified backend summary URL', () => {
    expect(source).toContain('thumbnailUrl');
    expect(source).toContain('resourceBlobUrl');
  });

  it('uses paged search and routes missing-image work to the library', () => {
    expect(source).toContain("resources({ page");
    expect(source).toContain('/content/image-library');
    expect(source).not.toContain('上传新资源');
  });

  it('consumes the normalized resource array without dereferencing items', () => {
    expect(source).toContain('resources.value = result;');
    expect(source).not.toContain('resources.value = result.items;');
  });
});
