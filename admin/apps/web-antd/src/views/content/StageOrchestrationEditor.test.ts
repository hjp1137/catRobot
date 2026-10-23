import { describe, expect, it } from 'vitest';
import menuSource from '../../router/menu.ts?raw';
import routerSource from '../../router/index.ts?raw';
import apiSource from '../../api/content.ts?raw';
import editorSource from './StageOrchestrationEditor.vue?raw';
import canvasSource from './stage-editor/StageSceneCanvas.vue?raw';
import inspectorSource from './stage-editor/StageInspector.vue?raw';
import previewSource from './stage-editor/StagePreviewPanel.vue?raw';
import waveSource from './stage-editor/StageWaveEditor.vue?raw';
import progressionSource from './stage-editor/StageProgressionEditor.vue?raw';
import appSource from '../../App.vue?raw';


describe('StageOrchestrationEditor', () => {
  it('adds task26 visual orchestration route and API methods', () => {
    expect(menuSource).toContain('关卡编排');
    expect(routerSource).toContain('/content/stages/:stageId/editor');
    expect(apiSource).toContain('stageOrchestration');
    expect(apiSource).toContain('saveStageOrchestration');
  });

  it('edits objectives, reward references and unlocks with published isolation', () => {
    expect(editorSource).toContain('StageProgressionEditor');
    expect(apiSource).toContain('saveStageProgression');
    expect(apiSource).toContain('publishedStageProgression');
    expect(progressionSource).toContain('新增目标');
    expect(progressionSource).toContain('Missing / Invalid');
    expect(progressionSource).toContain('不写入玩家正式存档');
    expect(progressionSource).toContain('ArtResourceThumb');
    expect(progressionSource).toContain('rewardIconArtKey');
  });

  it('contains editor workspace, wave timeline and preview controls', () => {
    expect(editorSource).toContain('保存草稿');
    expect(previewSource).toContain('战斗预览状态');
    expect(editorSource).toContain('网格吸附');
    expect(editorSource).toContain('敌人出生点');
    expect(canvasSource).toContain("point.type === 'hero'");
    expect(previewSource).toContain('WAVE_RUNNING');
    expect(previewSource).toContain('STAGE_CLEAR');
    expect(previewSource).toContain('STAGE_FAILED');
    expect(editorSource).toContain('数据来源');
    expect(waveSource).toContain('波次与生成条目');
  });

  it('renders real art and supports direct scene editing', () => {
    expect(editorSource).toContain('StageSceneCanvas');
    expect(editorSource).toContain('resourceBlobUrl');
    expect(editorSource).toContain('@point-move');
    expect(inspectorSource).toContain('精确坐标');
    expect(inspectorSource).toContain('键盘微调');
    expect(canvasSource).toContain('Missing / Invalid');
  });

  it('keeps collision layers visible and supports rectangle drawing on the real canvas size', () => {
    expect(canvasSource).toContain('collision-draw');
    expect(canvasSource).toContain('logicalRectFromPoints');
    expect(canvasSource).toContain("visible.type === 'collision' ? 1 : visible.opacity");
    expect(editorSource).toContain('@collision-draw');
    expect(editorSource).toContain('框选区域');
  });

  it('moves and resizes selected collision rectangles through canvas controls', () => {
    expect(canvasSource).toContain('collision-transform');
    expect(canvasSource).toContain('transformLogicalRect');
    expect(canvasSource).toContain('collision-handle');
    expect(editorSource).toContain('@collision-transform');
    expect(editorSource).toContain('拖动框内移动');
  });

  it('exposes editable layers, waves, entries and session history', () => {
    expect(editorSource).toContain('StageInspector');
    expect(editorSource).toContain('StageWaveEditor');
    expect(editorSource).toContain('撤销');
    expect(editorSource).toContain('重做');
    expect(editorSource).toContain('beforeunload');
    expect(editorSource).toContain('onBeforeRouteLeave');
  });

  it('uses executable preview and published isolation APIs', () => {
    expect(editorSource).toContain('StagePreviewPanel');
    expect(editorSource).toContain('StagePreviewSimulator');
    expect(apiSource).toContain('publishedStageOrchestration');
    expect(editorSource).toContain('当前正式版本未启用关卡编排');
    expect(editorSource).toContain('CONTENT_CONFLICT');
    expect(editorSource).toContain('data-editor-ready');
  });

  it('destroys draft simulation and exposes an empty legacy fallback on source switch', () => {
    expect(editorSource).toContain('simulator.dispose()');
    expect(editorSource).toContain("'LEGACY_FALLBACK'");
    expect(editorSource).toContain('await loadDraft()');
    expect(previewSource).toContain('publishedFallback');
    expect(previewSource).toContain('LEGACY_FALLBACK');
  });

  it('places wave and progression editors in the top workspace tabs with a light shell', () => {
    expect(editorSource).toContain('v-model:active-key="activeWorkspace"');
    expect(editorSource).toContain('class="workspace-tabs"');
    expect(editorSource).toContain('tab="基础编排"');
    expect(editorSource).toContain('tab="波次与生成条目"');
    expect(editorSource).toContain('tab="目标与奖励"');
    expect(editorSource).toContain('background:linear-gradient(145deg,#fbfcff,#eef3fb)');
    expect(appSource).toContain('theme="light"');
  });

  it('overrides the default dark Ant Design header in the light theme', () => {
    expect(appSource).toContain('class="top light-header"');
  });

  it('exposes the tactical HUD and skill dock configuration from the backend editor', () => {
    expect(editorSource).toContain('战术终端');
    expect(editorSource).toContain('skillButtonShape');
    expect(editorSource).toContain('skillButtonSize');
    expect(editorSource).toContain('skillButtonGap');
    expect(editorSource).toContain('showSkillLabels');
    expect(editorSource).toContain('panelOpacity');
  });
});
