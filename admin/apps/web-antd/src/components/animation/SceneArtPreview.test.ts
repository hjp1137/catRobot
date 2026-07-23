import { describe, expect, it } from 'vitest';
import source from './SceneArtPreview.vue?raw';

describe('SceneArtPreview task25.1 controls', () => {
  it('separates draft and published preview controls', () => {
    expect(source).toContain('草稿预览');
    expect(source).toContain('已发布预览');
    expect(source).toContain('previewMode');
    expect(source).toContain('数据来源');
    expect(source).toContain('Animation Manifest');
  });

  it('exposes playback, action, scale and speed controls', () => {
    expect(source).toContain('选择敌人');
    expect(source).toContain('播放');
    expect(source).toContain('暂停');
    expect(source).toContain('恢复');
    expect(source).toContain('重置');
    expect(source).toContain('画面缩放');
    expect(source).toContain('播放速度');
  });
});
