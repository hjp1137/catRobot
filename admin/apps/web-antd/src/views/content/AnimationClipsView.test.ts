import { describe, expect, it } from 'vitest';
import source from './AnimationClipsView.vue?raw';
import previewSource from '../../components/animation/AnimationClipPreview.vue?raw';

describe('AnimationClipsView task25.1 controls', () => {
  it('exposes playback, stepping, speed, order and duration controls', () => {
    expect(source).toContain('暂停');
    expect(source).toContain('恢复');
    expect(source).toContain('重置');
    expect(source).toContain('上一帧');
    expect(source).toContain('下一帧');
    expect(source).toContain('预览速度');
    expect(source).toContain('移至首位');
    expect(source).toContain('移至末位');
    expect(source).toContain('frame.durationMs');
  });

  it('shows play modes and frame warnings in the editor', () => {
    expect(source).toContain('loop');
    expect(source).toContain('once');
    expect(source).toContain('hold-last-frame');
    expect(source).toContain('Missing Art Key');
    expect(source).toContain('Invalid资源');
    expect(previewSource).toContain('currentFrameIndex');
    expect(previewSource).toContain('totalDurationMs');
  });
});
