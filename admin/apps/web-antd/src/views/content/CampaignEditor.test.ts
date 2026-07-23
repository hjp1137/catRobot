import { describe, expect, it } from 'vitest';
import routerSource from '../../router/index.ts?raw';
import menuSource from '../../router/menu.ts?raw';
import apiSource from '../../api/content.ts?raw';
import listSource from './CampaignListView.vue?raw';
import chapterSource from './CampaignChaptersView.vue?raw';
import mapSource from './CampaignMapEditor.vue?raw';

describe('campaign admin', () => {
  it('registers list, chapter and map routes with draft APIs', () => {
    expect(routerSource).toContain('/content/campaigns');
    expect(routerSource).toContain('/content/campaigns/:campaignId/chapters');
    expect(routerSource).toContain('/content/chapters/:chapterId/map');
    expect(menuSource).toContain('主线战役');
    expect(apiSource).toContain('saveCampaignMap');
  });

  it('keeps list actions and map editor acceptance controls visible', () => {
    for (const label of ['新建战役', '编辑', '复制', '章节管理', '启用', '停用', '删除']) expect(listSource).toContain(label);
    for (const label of ['新建章节', '编辑地图', '起始节点', '终点节点']) expect(chapterSource).toContain(label);
    for (const label of ['新建节点', '新建连线', '删除所选', '撤销', '重做', '保存草稿', '正式只读']) expect(mapSource).toContain(label);
    for (const label of ['全部未通关', '仅起点解锁', '1-1已通关一星', '1-1已通关三星', '全部通关']) expect(mapSource).toContain(label);
    expect(mapSource).toContain('不写入真实玩家存档');
    for (const label of ['精确 X', '精确 Y', '起始节点', '目标节点', '是否单向', '路径样式', '当前解锁依赖关系']) expect(mapSource).toContain(label);
    expect(mapSource).toContain('CONTENT_CONFLICT');
    expect(mapSource).toContain('onBeforeRouteLeave');
    expect(listSource).not.toContain('structuredClone(row)');
    expect(chapterSource).not.toContain('structuredClone(row)');
    expect(mapSource).not.toContain('structuredClone(model)');
    expect(mapSource).toContain('backgroundUrl');
    expect(mapSource).toContain('data-node-id');
    expect(mapSource).toContain('data-edge-id');
    expect(mapSource).toContain('leaveOpen');
    expect(mapSource).toContain('存在未保存的章节地图修改');
    expect(mapSource).toContain('discardAndLeave');
    for (const label of ['当前预览状态', '完整锁定条件', '锁定节点不可进入', '进入节点']) expect(mapSource).toContain(label);
  });

  it('exposes complete chapter clone, order, enable, disable and delete actions', () => {
    for (const method of [
      'cloneCampaignChapter', 'reorderCampaignChapters',
      'enableCampaignChapter', 'removeCampaignChapter',
    ]) expect(apiSource).toContain(method);
    for (const label of ['复制', '上移', '下移', '启用', '停用', '删除']) {
      expect(chapterSource).toContain(label);
    }
    expect(chapterSource).toContain('rowVersion');
    expect(chapterSource).toContain('runCampaignMutation');
  });

  it('passes client rowVersion and uses the shared structured conflict mapper', () => {
    for (const method of ['enableCampaign', 'removeCampaign', 'enableCampaignChapter', 'removeCampaignChapter']) {
      expect(apiSource).toMatch(new RegExp(`${method}:[\\s\\S]{0,220}rowVersion`));
    }
    expect(listSource).toContain('runCampaignMutation');
    expect(chapterSource).toContain('runCampaignMutation');
  });
});
