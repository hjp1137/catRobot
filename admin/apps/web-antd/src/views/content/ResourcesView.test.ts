import { describe, expect, it } from 'vitest';
import source from './ResourcesView.vue?raw';

describe('ResourcesView visual gallery', () => {
  it('defaults to gallery mode while preserving table mode', () => {
    expect(source).toContain("ref<'gallery' | 'table'>('gallery')");
    expect(source).toContain('图库视图');
    expect(source).toContain('表格视图');
    expect(source).toContain('resource-gallery');
  });

  it('shows draft and published image comparison metadata', () => {
    expect(source).toContain('当前已发布');
    expect(source).toContain('当前草稿');
    expect(source).toContain('文件大小');
    expect(source).toContain('查看原图');
  });

  it('uses backend paging, Chinese category tabs and the image library chooser', () => {
    expect(source).toContain('pageSize');
    expect(source).toContain('categoryCounts');
    expect(source).toContain('角色与敌人');
    expect(source).toContain('从图库选择');
    expect(source).not.toContain('createResourceWithVersion');
    expect(source).not.toContain('替换图片');
  });

  it('accepts the normalized resource array returned by the shared API client', () => {
    expect(source).toContain('contentApi.resourcesPage');
    expect(source).toContain('rows.value = result.items');
  });
});
