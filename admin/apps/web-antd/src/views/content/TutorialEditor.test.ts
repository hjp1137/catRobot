import { describe, expect, it } from 'vitest';
import apiSource from '../../api/content.ts?raw';
import routerSource from '../../router/index.ts?raw';
import menuSource from '../../router/menu.ts?raw';
import listSource from './TutorialFlowListView.vue?raw';
import editorSource from './TutorialFlowEditor.vue?raw';
import previewSource from './tutorial-editor/TutorialPreviewPanel.vue?raw';
import { TutorialPreviewSimulator } from './tutorial-editor/TutorialPreviewSimulator';

describe('tutorial admin contract', () => {
  it('registers dedicated routes, menu and complete draft/published APIs', () => {
    expect(routerSource).toContain('/content/tutorials/:flowId/editor');
    expect(menuSource).toContain('新手引导');
    for (const method of ['tutorialFlows', 'tutorialFlow', 'createTutorialFlow',
      'saveTutorialFlow', 'saveTutorialOrchestration', 'removeTutorialFlow',
      'tutorialTargets', 'tutorialFeatures', 'publishedTutorial']) {
      expect(apiSource).toContain(method);
    }
  });

  it('keeps list CRUD, filters and reference protection visible', () => {
    for (const label of ['新建 Flow', '复制', '启用', '停用', '删除', '搜索 Flow',
      '草稿待发布', '引用保护']) expect(listSource).toContain(label);
    expect(listSource).toContain('CONTENT_REFERENCE_EXISTS');
  });

  it('exposes linear editing, target diagnostics, validation and isolation', () => {
    for (const label of ['新增步骤', '复制步骤', '上移', '下移', '下一步骤', '跳过分支',
      '触发条件', '完成条件', '引导箭头 Art Key', '备用目标', 'Missing', '单步预览', '完整 Flow 预览',
      '未保存', '完整校验', '草稿', '已发布']) expect(editorSource).toContain(label);
    for (const label of ['全新玩家', '已完成前3步', '战斗中断恢复', '已通关1-1',
      '已完成全部引导', '已跳过引导', '不写入真实玩家存档']) expect(previewSource).toContain(label);
    expect(previewSource).toContain('模拟 Missing 回退');
    expect(editorSource).toContain('LEGACY_FALLBACK');
    expect(editorSource).toContain('disposePreview');
    expect(editorSource).toContain('onBeforeRouteLeave');
  });
});

describe('TutorialPreviewSimulator', () => {
  const steps = [{ id: 'a', title: '欢迎', body: '打开主线', targetId: 'home.campaign' },
    { id: 'b', title: '章节', body: '选择第一章', targetId: 'campaign.chapter.1' }];

  it('supports single/full preview without writing player progress', () => {
    const simulator = new TutorialPreviewSimulator(steps);
    expect(simulator.previewStep('b').stepId).toBe('b');
    expect(simulator.startFlow('fresh').stepId).toBe('a');
    expect(simulator.next().stepId).toBe('b');
    expect(simulator.next().state).toBe('COMPLETED');
    expect(simulator.snapshot.persisted).toBe(false);
  });

  it('dispose clears timers, highlight and session state', () => {
    const simulator = new TutorialPreviewSimulator(steps);
    simulator.startFlow('interrupted');
    const disposed = simulator.dispose();
    expect(disposed).toMatchObject({ state: 'DISPOSED', stepId: null, highlightedTargetId: null });
    expect(simulator.debug().timerCount).toBe(0);
  });

  it('marks missing semantic targets and safe fallback', () => {
    const simulator = new TutorialPreviewSimulator([{ ...steps[0], targetId: 'missing.target' }], ['home.campaign']);
    expect(simulator.startFlow('fresh')).toMatchObject({ state: 'MISSING_TARGET', fallback: 'skip-step' });
  });
});
