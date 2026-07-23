import { describe, expect, it } from 'vitest';
import source from './ArtResourceThumb.vue?raw';

describe('ArtResourceThumb loading and chrome', () => {
  it('does not render status text tags over the thumbnail image', () => {
    expect(source).not.toContain('class="state"');
    expect(source).not.toContain('class="draft"');
    expect(source).not.toContain('<a-tag');
  });

  it('uses a non-missing loading state while an Art Key is resolving', () => {
    expect(source).toContain('isResolving');
    expect(source).toContain('loading');
    expect(source).not.toContain("'Missing'");
  });

  it('deduplicates resolved, failed, and in-flight Art Key requests across animation frames', () => {
    expect(source).toContain('resourceCache');
    expect(source).toContain('failedArtKeys');
    expect(source).toContain('resourceRequests');
  });
});
