import { describe, expect, it } from 'vitest';
import source from './EntityListView.vue?raw';
import fieldSource from '../../components/art-resource/ArtResourceField.vue?raw';
import menuSource from '../../router/menu.ts?raw';
import routerSource from '../../router/index.ts?raw';

describe('EntityListView art preview', () => {
  it('renders a visual preview column for business content lists', () => {
    expect(source).toContain("title: '预览'");
    expect(source).toContain('previewArtKey(record)');
    expect(source).toContain('stagePreviewItems(record)');
  });

  it('uses one shared visual resource field in the editor drawer', () => {
    expect(source).toContain('<ArtResourceField');
    expect(fieldSource).toContain('选择已有资源');
    expect(fieldSource).toContain('前往图库上传图片');
    expect(fieldSource).not.toContain('替换当前图片');
    expect(fieldSource).toContain('解除绑定');
  });

  it('keeps business fields on Art Key binding instead of direct file upload', () => {
    expect(source).toContain('ArtResourceField');
    expect(source).not.toContain('uploadResourceVersion');
    expect(source).not.toContain('replaceCurrentImage');
  });

  it('lets every business preview resolve resources by Art Key when the shared list is incomplete', () => {
    expect(source).toContain(':art-key="previewArtKey(record)"');
    expect(source).toContain(':art-key="getPath(editor, field.path)"');
    expect(fieldSource).toContain('contentApi.resource(modelValue)');
    expect(fieldSource).toContain('resolvedResource');
  });

  it('does not label failed resource requests as missing assets', () => {
    expect(fieldSource).toContain('loadError');
    expect(fieldSource).toContain('加载失败');
    expect(source).toContain('loadResources failed');
  });

  it('adds task25 animation orchestration and scene preview entry points', () => {
    expect(menuSource).toContain('动作编排');
    expect(routerSource).toContain('/content/animations');
    expect(source).toContain('AnimationBindingField');
    expect(source).toContain('SceneArtPreview');
    expect(source).toContain('openScenePreview(record)');
  });

  it('surfaces campaign reference protection instead of swallowing delete conflicts', () => {
    expect(source).toContain('CONTENT_REFERENCE_EXISTS');
    expect(source).toContain('该内容被章节地图引用，禁止删除。');
  });
});
