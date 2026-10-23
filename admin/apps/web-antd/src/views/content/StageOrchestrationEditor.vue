<template>
  <div class="orchestration-page" :data-editor-ready="editorReady" @keydown="onKeydown">
    <header class="page-head"><div><small>CONTENT / STAGE ORCHESTRATION</small><h1>关卡可视化编排台</h1><p>{{ orchestration.layout.sceneMode==='exploration'?'自由地图':'固定屏（仅调试）' }} · {{ stageId }} · rowVersion {{ orchestration.rowVersion }}</p></div>
      <a-space wrap><a-button @click="goBack">返回关卡列表</a-button><a-button :disabled="!canUndo" @click="undo">撤销</a-button><a-button :disabled="!canRedo" @click="redo">重做</a-button><a-button @click="validate">校验</a-button><a-button type="primary" :disabled="previewSource !== 'draft'" @click="save">保存草稿</a-button></a-space>
    </header>
    <div class="source-bar">
      <a-radio-group :value="previewSource" button-style="solid" @change="changeSource"><a-radio-button value="draft">草稿预览</a-radio-button><a-radio-button value="published">已发布预览</a-radio-button></a-radio-group>
      <b>{{ previewSource === 'draft' ? '数据来源：MySQL 草稿' : `数据来源：正式快照 ${publishedStatus?.releaseVersion ?? '-'}` }}</b>
      <span>{{ dirty ? '● 有未保存修改' : '✓ 已与服务器同步' }}</span>
    </div>
    <a-alert v-if="conflict" class="conflict" type="error" show-icon message="CONTENT_CONFLICT：远端草稿已更新，本地修改未被覆盖" :description="`本地 rowVersion ${conflict.localRowVersion} / 远端 ${conflict.remoteRowVersion}`"><template #action><a-button danger @click="reloadDraft">重新加载远端（将丢弃本地修改）</a-button></template></a-alert>
    <a-alert v-if="previewSource === 'published' && !publishedStatus?.enabled" type="warning" show-icon message="当前正式版本未启用关卡编排" description="运行时使用旧关卡逻辑；R000007 不显示 MySQL 草稿三波。" />
    <a-alert v-if="previewSource === 'published' && !publishedProgressionStatus?.enabled" type="warning" show-icon message="当前正式版本未启用目标奖励" description="运行时使用旧进度逻辑；R000007 不显示 MySQL 草稿奖励。" />
    <a-tabs v-model:active-key="activeWorkspace" class="workspace-tabs">
      <a-tab-pane key="scene" tab="基础编排">
        <a-card v-if="activeOrchestration.layout.sceneMode === 'exploration'" class="hud-config" size="small" title="自由探索 HUD（发布后生效）">
          <a-button v-if="!activeOrchestration.layout.exploreHud" :disabled="readonly" @click="enableTacticalHud">启用战术终端</a-button>
          <div v-else class="hud-fields">
            <label>布局<a-radio-group v-model:value="activeOrchestration.layout.exploreHud.layout" :disabled="readonly" @change="recordChange"><a-radio-button value="standard">标准</a-radio-button><a-radio-button value="compact">紧凑</a-radio-button><a-radio-button value="tactical">战术终端</a-radio-button></a-radio-group></label>
            <label>主题<a-select v-model:value="activeOrchestration.layout.exploreHud.theme" :disabled="readonly" :options="hudThemes" @change="recordChange"/></label>
            <label>技能舱形状<a-select v-model:value="activeOrchestration.layout.exploreHud.skillButtonShape" :disabled="readonly" :options="skillShapes" @change="recordChange"/></label>
            <label>按钮尺寸<a-input-number v-model:value="activeOrchestration.layout.exploreHud.skillButtonSize" :min="56" :max="88" :disabled="readonly" @change="recordChange"/></label>
            <label>按钮间距<a-input-number v-model:value="activeOrchestration.layout.exploreHud.skillButtonGap" :min="8" :max="36" :disabled="readonly" @change="recordChange"/></label>
            <label>右侧边距<a-input-number v-model:value="activeOrchestration.layout.exploreHud.skillButtonRight" :min="12" :max="48" :disabled="readonly" @change="recordChange"/></label>
            <label>底部边距<a-input-number v-model:value="activeOrchestration.layout.exploreHud.skillButtonBottom" :min="16" :max="72" :disabled="readonly" @change="recordChange"/></label>
            <label>面板透明度<a-input-number v-model:value="activeOrchestration.layout.exploreHud.panelOpacity" :min="0.35" :max="0.95" :step="0.05" :disabled="readonly" @change="recordChange"/></label>
            <a-checkbox v-model:checked="activeOrchestration.layout.exploreHud.showSkillLabels" :disabled="readonly" @change="recordChange">显示技能标签</a-checkbox>
            <a-checkbox v-model:checked="activeOrchestration.layout.exploreHud.showWaveNotice" :disabled="readonly" @change="recordChange">显示波次遮罩</a-checkbox>
          </div>
        </a-card>
        <div class="editor-grid">
      <aside class="object-panel"><header><b>场景对象</b><a-switch v-model:checked="showGrid" size="small" checked-children="网格" /></header>
        <div class="add-row"><a-button block :disabled="readonly" @click="addLayer">＋ 图层</a-button><a-button block :disabled="readonly" @click="addCollision">＋ 阻挡区</a-button><a-button block :disabled="readonly" @click="addEnemySpawn">＋ 敌人出生点</a-button></div>
        <h3>图层</h3><button v-for="layer in activeOrchestration.layers" :key="layer.id" :class="{ active:selected===`layer:${layer.id}` }" @click="selected=`layer:${layer.id}`"><i class="layer-dot"></i><span>{{ layer.name }}<small>{{ layer.artKey ?? (layer.type === 'collision' ? '阻挡区：角色/敌人/常规弹道' : '-') }}</small></span><em>{{ layer.enabled ? 'ON' : 'OFF' }}</em></button>
        <h3>出生点</h3><button v-for="point in activeOrchestration.spawnPoints" :key="point.id" :class="{ active:selected===`spawn:${point.id}` }" @click="selected=`spawn:${point.id}`"><i :class="point.type"></i><span>{{ point.name }}<small>X {{ point.x }} / Y {{ point.y }}</small></span></button>
        <div class="grid-control"><span>网格吸附</span><a-switch v-model:checked="snapGrid" size="small"/><a-input-number v-model:value="gridSize" :min="1" :max="100" size="small"/></div>
      </aside>
      <main class="canvas-column">
        <div v-if="selectedObject?.type === 'collision'" class="canvas-tools"><span>阻挡区：{{ selectedObject.name }}（拖动框内移动，拖动边角缩放）</span><a-button size="small" :type="collisionDrawMode ? 'primary' : 'default'" :disabled="readonly" @click="collisionDrawMode = !collisionDrawMode">{{ collisionDrawMode ? '正在框选…' : '框选区域' }}</a-button></div>
        <StageSceneCanvas :orchestration="activeOrchestration" :selected="selected" :art-urls="artUrls" :art-statuses="artStatuses" :hero-art-key="heroArtKey" :enemy-art-keys="enemyArtKeys" :show-grid="showGrid" :grid-size="snapGrid ? gridSize : 1" :editable="!readonly" :draw-mode="collisionDrawMode" @select="selected=$event" @point-move="movePoint" @collision-draw="drawCollision" @collision-transform="drawCollision" @draw-complete="collisionDrawMode = false" @art-error="markArtError" />
        <StagePreviewPanel :snapshot="previewSnapshot" :published-fallback="previewSource==='published' && !publishedStatus?.enabled" @start="preview('start')" @pause="preview('pause')" @resume="preview('resume')" @reset="preview('reset')" @defeat-one="preview('defeatOne')" @defeat-wave="preview('defeatWave')" @skip="preview('skipWait')" @hero-dead="preview('heroDead')" @speed="setPreviewSpeed" />
      </main>
      <aside class="property-panel"><StageInspector :object="selectedObject" :kind="selectedKind" :resources="resources" :references="selectedReferences" :dirty="dirty" :meta="meta" @change="recordChange" @remove="removeSelected" @duplicate="duplicateSelected" /></aside>
        </div>
      </a-tab-pane>
      <a-tab-pane key="waves" tab="波次与生成条目">
        <StageWaveEditor v-if="previewSource === 'draft'" :waves="orchestration.waves" :spawn-points="orchestration.spawnPoints" :enemies="catalogs.enemies" @change="recordChange" />
        <section v-else class="published-legacy"><b>已发布内容</b><span>{{ publishedStatus?.visuals?.stage?.name ?? stageId }}</span><span>Release {{ publishedStatus?.releaseVersion }}</span><span>{{ publishedStatus?.enabled ? `${activeOrchestration.waves.length} 波正式编排` : '旧关卡逻辑回退（无草稿波次）' }}</span></section>
      </a-tab-pane>
      <a-tab-pane key="progression" tab="目标与奖励">
        <StageProgressionEditor :model="activeProgression" :catalog="rewardCatalog" :stages="catalogs.stages" :readonly="readonly" @change="recordChange" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { contentApi } from '../../api/content';
import StageSceneCanvas from './stage-editor/StageSceneCanvas.vue';
import StageInspector from './stage-editor/StageInspector.vue';
import StageWaveEditor from './stage-editor/StageWaveEditor.vue';
import StagePreviewPanel from './stage-editor/StagePreviewPanel.vue';
import StageProgressionEditor from './stage-editor/StageProgressionEditor.vue';
import { StageEditorSession, keyboardDelta } from './stage-editor/StageEditorSession';
import { loadStageArtUrls } from './stage-editor/StageArtLoader';
import { StagePreviewSimulator, type PreviewSnapshot } from './stage-editor/StagePreviewSimulator';

const route = useRoute(); const router = useRouter();
const stageId = String(route.params.stageId || 'stage_battle_1_1');
const blank = () => ({ rowVersion: 0, layout: { canvasWidth: 750, canvasHeight: 1334, sceneMode: 'fixed-screen', backgroundThemeId: '', heroSpawnPointId: 'hero_start', battleArea: { x: 0, y: 160, width: 750, height: 980 }, enabled: true }, layers: [], spawnPoints: [], waves: [], completionRule: { type: 'all-waves-cleared' }, failureRule: { type: 'hero-dead' } });
const orchestration = reactive<any>(blank());
const publishedView = reactive<any>(blank());
const progression = reactive<any>({ rowVersion: 0, recommendedPower: 0, victoryText: '', failureText: '', objectives: [], rewardPools: [], unlockRules: [] });
const publishedProgression = reactive<any>({ recommendedPower: 0, objectives: [], rewardPools: [], unlockRules: [] });
const rewardCatalog = ref<any[]>([]); const publishedProgressionStatus = ref<any>();
const catalogs = reactive<any>({ enemies: [], backgrounds: [], heroes: [], stages: [] });
const resources = ref<any[]>([]); const publishedStatus = ref<any>();
const artUrls = reactive<Record<string, string>>({}); const artStatuses = reactive<Record<string, string>>({});
const selected = ref(''); const previewSource = ref<'draft'|'published'>('draft');
const activeWorkspace = ref('scene');
const showGrid = ref(true); const snapGrid = ref(true); const gridSize = ref(10);
const collisionDrawMode = ref(false);
const dirty = ref(false); const conflict = ref<any>();
const editorReady = ref(false);
const session = ref<StageEditorSession>();
let simulator = new StagePreviewSimulator(blank());
const previewSnapshot = ref<PreviewSnapshot>(simulator.snapshot);
let timer: number | undefined;
const hudThemes = [{ value: 'legacy', label: '经典' }, { value: 'industrial', label: '工业战术' }];
const skillShapes = [{ value: 'circle', label: '圆形' }, { value: 'hex', label: '六边形' }];

const readonly = computed(() => previewSource.value === 'published');
const activeOrchestration = computed(() => readonly.value ? publishedView : orchestration);
const activeProgression = computed(() => readonly.value ? publishedProgression : progression);
const selectedKind = computed(() => selected.value.startsWith('layer:') ? 'layer' : selected.value.startsWith('spawn:') ? 'spawn' : undefined);
const selectedObject = computed(() => selectedKind.value === 'layer' ? activeOrchestration.value.layers.find((x: any) => x.id === selected.value.slice(6)) : selectedKind.value === 'spawn' ? activeOrchestration.value.spawnPoints.find((x: any) => x.id === selected.value.slice(6)) : undefined);
const selectedReferences = computed(() => selectedKind.value !== 'spawn' ? [] : orchestration.waves.flatMap((wave: any) => wave.entries.filter((entry: any) => entry.spawnPointId === selectedObject.value?.id).map((entry: any) => ({ waveName: wave.name, entryId: entry.id, enemyTemplateId: entry.enemyTemplateId }))));
const meta = computed(() => ({ stageId, mode: activeOrchestration.value.layout.sceneMode, source: readonly.value ? '正式发布快照' : 'MySQL 草稿', releaseVersion: publishedStatus.value?.releaseVersion, checksum: publishedStatus.value?.checksum, rowVersion: orchestration.rowVersion }));
const canUndo = computed(() => !readonly.value && Boolean(session.value?.canUndo));
const canRedo = computed(() => !readonly.value && Boolean(session.value?.canRedo));
const heroArtKey = computed(() => activeVisuals().hero?.visual?.idleArtKey ?? 'player.mechaCat.idle');
const enemyArtKeys = computed(() => Object.fromEntries(activeOrchestration.value.spawnPoints.filter((p: any) => p.type === 'enemy').map((point: any) => [point.id, enemyArtFor(point.id)])));

onMounted(async () => {
  await loadDraft();
  window.addEventListener('beforeunload', beforeunload);
  timer = window.setInterval(() => {
    if (!['READY', 'PAUSED', 'STAGE_CLEAR', 'STAGE_FAILED'].includes(previewSnapshot.value.state)) previewSnapshot.value = simulator.tick(100);
  }, 100);
});
onBeforeUnmount(() => { window.removeEventListener('beforeunload', beforeunload); if (timer) window.clearInterval(timer); simulator.dispose(); releaseArtUrls(); });
onBeforeRouteLeave((_to, _from, next) => {
  if (!dirty.value) return next();
  Modal.confirm({ title: '存在未保存修改', content: '离开关卡编排页会丢失当前本地修改。', okText: '确认离开', cancelText: '继续编辑', onOk: () => next(), onCancel: () => next(false) });
});

async function loadDraft() {
  editorReady.value = false;
  const [data, progressionData, rewardRows, enemies, backgrounds, heroes, stages, resourceRows] = await Promise.all([
    contentApi.stageOrchestration(stageId), contentApi.stageProgression(stageId), contentApi.rewardDefinitions(),
    contentApi.list('enemies'), contentApi.list('backgrounds'), contentApi.list('heroes'), contentApi.list('stages'), contentApi.resources(),
  ]);
  assign(orchestration, data); assign(progression, progressionData); rewardCatalog.value = rewardRows;
  Object.assign(catalogs, { enemies, backgrounds, heroes, stages }); resources.value = resourceRows;
  session.value = new StageEditorSession(data); dirty.value = false; conflict.value = undefined; selected.value = '';
  await hydrateDraftArt(); resetSimulator(); editorReady.value = true;
}

async function loadPublished() {
  editorReady.value = false;
  const [data, progressionData] = await Promise.all([contentApi.publishedStageOrchestration(stageId), contentApi.publishedStageProgression(stageId)]);
  publishedStatus.value = data;
  assign(publishedView, data.enabled ? data.orchestration : legacyOrchestration(data.visuals));
  publishedProgressionStatus.value = progressionData;
  assign(publishedProgression, progressionData.enabled ? progressionData.progression : { recommendedPower: 0, objectives: [], rewardPools: [], unlockRules: [] });
  await hydratePublishedArt(data.visuals?.artResources ?? []); selected.value = '';
  resetSimulator(data.enabled ? 'READY' : 'LEGACY_FALLBACK'); editorReady.value = true;
}

async function hydrateDraftArt() {
  const keys = neededArtKeys(orchestration, catalogs);
  const result = await loadStageArtUrls({
    artKeys: keys,
    resolveResource: async artKey => {
      const resource = resources.value.find(row => row.art_key === artKey) ?? await contentApi.resource(artKey);
      artStatuses[artKey] = resource.status ?? resource.resource_status;
      return resource;
    },
    fetchBlobUrl: contentApi.resourceBlobUrl,
    concurrency: 4,
  });
  Object.assign(artUrls, result.urls);
  for (const artKey of result.failedKeys) artStatuses[artKey] = 'missing';
}

async function hydratePublishedArt(entries: any[]) {
  await Promise.all(entries.map(async entry => {
    try {
      artUrls[entry.artKey] = await contentApi.resourceBlobUrl(contentApi.resourcePreviewUrl(entry.artKey, entry.versionId));
      artStatuses[entry.artKey] = 'physical';
    } catch { artStatuses[entry.artKey] = 'invalid'; }
  }));
}

async function changeSource(event: any) {
  previewSnapshot.value = simulator.dispose();
  previewSource.value = event.target.value;
  if (previewSource.value === 'published') await loadPublished();
  else await loadDraft();
}

async function save() {
  try {
    const saved = await contentApi.saveStageOrchestration(stageId, copy(orchestration));
    const savedProgression = await contentApi.saveStageProgression(stageId, copy(progression));
    assign(orchestration, saved); session.value?.markSaved(saved); dirty.value = false; conflict.value = undefined;
    assign(progression, savedProgression);
    message.success(`编排草稿已保存，rowVersion ${saved.rowVersion}`);
  } catch (error: any) {
    const data = error?.response?.data;
    if (data?.code === 'CONTENT_CONFLICT') { conflict.value = data; message.error('保存冲突：本地修改已保留'); return; }
    message.error(data?.message ?? '保存失败');
  }
}

async function validate() {
  try {
    const result = await contentApi.validate();
    if (result.valid) message.success(`校验通过：${result.errors?.length ?? 0} error / ${result.warnings?.length ?? 0} warning`);
    else message.error(`校验失败：${result.errors?.length ?? 0} 项错误`);
  } catch { message.error('校验请求失败'); }
}

function recordChange() {
  session.value?.commit(copy(orchestration)); dirty.value = Boolean(session.value?.dirty); resetSimulator();
}
function undo() { if (session.value?.canUndo) { assign(orchestration, session.value.undo()); dirty.value = session.value.dirty; resetSimulator(); } }
function redo() { if (session.value?.canRedo) { assign(orchestration, session.value.redo()); dirty.value = session.value.dirty; resetSimulator(); } }
function movePoint(payload: { id: string; x: number; y: number }) { const point = orchestration.spawnPoints.find((x: any) => x.id === payload.id); if (!point || readonly.value) return; point.x = payload.x; point.y = payload.y; recordChange(); }
function drawCollision(payload: { id: string; x: number; y: number; width: number; height: number }) {
  const layer = orchestration.layers.find((item: any) => item.id === payload.id);
  if (!layer || layer.type !== 'collision' || readonly.value) return;
  Object.assign(layer, payload); recordChange();
}
function onKeydown(event: KeyboardEvent) {
  const delta = keyboardDelta(event.key, event.shiftKey, (event.target as HTMLElement)?.tagName);
  const point = selectedKind.value === 'spawn' ? selectedObject.value : undefined;
  if (!delta || !point || readonly.value) return;
  point.x = clamp(point.x + delta.x, 0, orchestration.layout.canvasWidth); point.y = clamp(point.y + delta.y, 0, orchestration.layout.canvasHeight);
  event.preventDefault(); recordChange();
}

function addLayer() {
  orchestration.layers.push({ id: `layer_${Date.now()}`, name: '草稿测试图层', type: 'foreground', artKey: 'map.trainingGround.line', order: orchestration.layers.length, x: 0, y: 0, width: 750, height: 1334, scale: 1, opacity: .65, tiled: false, scrollsWithCamera: false, parallax: 0, enabled: true });
  selected.value = `layer:${orchestration.layers.at(-1).id}`; recordChange(); void hydrateDraftArt();
}
function addCollision() {
  const index = orchestration.layers.filter((x: any) => x.type === 'collision').length + 1;
  const layer = { id: `collision_${Date.now()}`, name: `阻挡区${index}`, type: 'collision', order: orchestration.layers.length, x: 0, y: 0, width: 120, height: 120, scale: 1, opacity: 0, tiled: false, scrollsWithCamera: true, parallax: 1, enabled: true };
  orchestration.layers.push(layer); selected.value = `layer:${layer.id}`; collisionDrawMode.value = true; recordChange();
}

function enableTacticalHud() {
  if (readonly.value) return;
  orchestration.layout.exploreHud = {
    layout: 'tactical', theme: 'industrial', showWaveNotice: false,
    skillButtonShape: 'hex', skillButtonSize: 68, skillButtonGap: 14,
    skillButtonRight: 18, skillButtonBottom: 24, showSkillLabels: true,
    panelOpacity: 0.82,
  };
  recordChange();
}
function addEnemySpawn() {
  const index = orchestration.spawnPoints.filter((p: any) => p.type === 'enemy').length + 1;
  const point = { id: `enemy_${Date.now()}`, name: `敌人出生点${index}`, type: 'enemy', x: 120 + index * 80, y: 360, facing: 'left', battleAreaId: 'main', enabled: true, note: '' };
  orchestration.spawnPoints.push(point); selected.value = `spawn:${point.id}`; recordChange();
}

async function removeSelected() {
  if (!selectedObject.value || readonly.value) return;
  if (selectedKind.value === 'spawn' && selectedReferences.value.length) {
    try { await contentApi.removeStageSpawnPoint(stageId, selectedObject.value.id); }
    catch (error: any) { showReferences(error?.response?.data); }
    return;
  }
  const collection = selectedKind.value === 'layer' ? orchestration.layers : orchestration.spawnPoints;
  collection.splice(collection.indexOf(selectedObject.value), 1); selected.value = ''; recordChange();
}

function duplicateSelected() {
  if (selectedKind.value !== 'spawn' || selectedObject.value?.type !== 'enemy') return;
  const copyPoint = { ...copy(selectedObject.value), id: `enemy_${Date.now()}`, name: `${selectedObject.value.name} 副本`, x: selectedObject.value.x + 20, y: selectedObject.value.y + 20 };
  orchestration.spawnPoints.push(copyPoint); selected.value = `spawn:${copyPoint.id}`; recordChange();
}

function showReferences(data: any) {
  const refs = data?.references ?? selectedReferences.value;
  Modal.error({ title: 'CONTENT_REFERENCE_EXISTS：无法删除出生点', content: refs.map((ref: any) => `${ref.waveName} / ${ref.entryId} / ${ref.enemyTemplateId ?? '-'} / ${ref.field ?? 'spawnPointId'}`).join('\n') });
}

function preview(action: 'start'|'pause'|'resume'|'reset'|'defeatOne'|'defeatWave'|'skipWait'|'heroDead') {
  previewSnapshot.value = simulator[action]();
}
function setPreviewSpeed(value: number) { previewSnapshot.value = simulator.setSpeed(value); }
function resetSimulator(state: 'READY' | 'LEGACY_FALLBACK' = 'READY') {
  simulator.dispose();
  simulator = new StagePreviewSimulator(activeOrchestration.value, state, activeProgression.value);
  previewSnapshot.value = simulator.snapshot;
}
function reloadDraft() { void loadDraft(); }
function goBack() { void router.push('/content/stages'); }
function markArtError(artKey: string) { artStatuses[artKey] = 'invalid'; }
function beforeunload(event: BeforeUnloadEvent) { if (dirty.value) { event.preventDefault(); event.returnValue = ''; } }

function activeVisuals() {
  if (previewSource.value === 'published') {
    const visuals = publishedStatus.value?.visuals ?? {};
    const stage = visuals.stage;
    return { stage, hero: visuals.heroVisuals?.find((x: any) => x.id === stage?.heroVisualTemplateId), enemies: visuals.enemies ?? [], backgrounds: visuals.backgrounds ?? [] };
  }
  const stage = catalogs.stages.find((x: any) => x.id === stageId);
  return { stage, hero: catalogs.heroes.find((x: any) => x.id === stage?.heroVisualTemplateId), enemies: catalogs.enemies, backgrounds: catalogs.backgrounds };
}

function enemyArtFor(spawnPointId: string) {
  const entry = activeOrchestration.value.waves.flatMap((wave: any) => wave.entries ?? []).find((item: any) => item.spawnPointId === spawnPointId);
  return activeVisuals().enemies.find((enemy: any) => enemy.id === entry?.enemyTemplateId)?.visual?.idleArtKey ?? 'enemy.scrapMouse.normal';
}

function legacyOrchestration(visuals: any) {
  const stage = visuals?.stage; const background = visuals?.backgrounds?.find((item: any) => item.id === stage?.backgroundThemeId);
  const art = background?.art ?? {};
  const keys = [art.floorArtKey, art.lineArtKey, art.boundaryArtKey].filter(Boolean);
  return { ...blank(), layout: { ...blank().layout, backgroundThemeId: stage?.backgroundThemeId ?? '', sceneMode: stage?.mode ?? 'fixed-screen' },
    layers: keys.map((artKey: string, order: number) => ({ id: `published_${order}`, name: order ? '正式前景' : '正式背景', type: order ? 'foreground' : 'background', artKey, order, x: 0, y: 0, width: 750, height: 1334, scale: 1, opacity: order ? .5 : 1, enabled: true })),
    spawnPoints: [{ id: 'hero_start', name: '正式主角', type: 'hero', x: 375, y: 980, facing: 'right', enabled: true }, { id: 'legacy_enemy', name: '旧逻辑敌人', type: 'enemy', x: 560, y: 420, facing: 'left', enabled: true }], waves: [] };
}

function neededArtKeys(value: any, data: any): string[] {
  const keys = new Set<string>(value.layers.map((layer: any) => layer.artKey).filter(Boolean));
  for (const hero of data.heroes) for (const key of Object.values(hero.visual ?? {})) if (typeof key === 'string' && key.includes('.')) keys.add(key);
  for (const enemy of data.enemies) for (const key of Object.values(enemy.visual ?? {})) if (typeof key === 'string' && key.includes('.')) keys.add(key);
  const stage = data.stages.find((item: any) => item.id === stageId); const background = data.backgrounds.find((item: any) => item.id === stage?.backgroundThemeId);
  for (const key of Object.values(background?.art ?? {})) if (typeof key === 'string' && key.includes('.')) keys.add(key);
  return [...keys];
}
function assign(target: any, source: any) { for (const key of Object.keys(target)) delete target[key]; Object.assign(target, copy(source)); }
function copy<T>(value: T): T { return JSON.parse(JSON.stringify(value)); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function releaseArtUrls() { for (const url of Object.values(artUrls)) if (url.startsWith('blob:')) URL.revokeObjectURL(url); }
</script>

<style scoped>
.orchestration-page { --ink:#172033; --muted:#63718a; min-width:0; padding:18px; color:var(--ink); background:linear-gradient(145deg,#fbfcff,#eef3fb); }
.page-head { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; margin-bottom:14px; padding:8px 2px 14px; border-bottom:1px solid #dbe3ef; }.page-head small { color:#365cc4; font:700 10px Consolas,monospace; letter-spacing:.22em; }.page-head h1 { margin:3px 0; color:#16213a; font:800 26px "Microsoft YaHei",sans-serif; letter-spacing:.04em; }.page-head p { margin:0; color:var(--muted); font:12px Consolas,monospace; }
.source-bar { display:flex; align-items:center; gap:18px; margin-bottom:12px; padding:10px 12px; color:#53627a; background:#fff; border:1px solid #d9e2f0; border-radius:8px; }.source-bar b { color:#23314a; }.source-bar span { margin-left:auto; color:#b66b10; }
.workspace-tabs { padding:4px 14px 16px; background:#fff; border:1px solid #d9e2f0; border-radius:10px; box-shadow:0 10px 26px #24457b12; }.hud-config { margin:8px 0 12px; color:#23314a; background:#fff; border-color:#d9e2f0; }.editor-grid { display:grid; grid-template-columns:250px minmax(480px,1fr) 350px; gap:14px; align-items:start; }.object-panel,.property-panel { min-width:0; padding:14px; background:#fff; border:1px solid #d9e2f0; border-radius:8px; box-shadow:0 8px 24px #24457b0d; }.object-panel { position:sticky; top:12px; max-height:calc(100vh - 40px); overflow:auto; }.property-panel { position:sticky; top:12px; }
.hud-fields{display:grid;grid-template-columns:repeat(5,minmax(130px,1fr));gap:12px;align-items:end}.hud-fields label{display:grid;gap:5px;color:#53627a;font-size:12px}.hud-fields :deep(.ant-select),.hud-fields :deep(.ant-input-number){width:100%}
.object-panel header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }.add-row { display:grid; gap:6px; }.object-panel h3 { margin:18px 0 6px; color:#61718d; font-size:11px; letter-spacing:.16em; text-transform:uppercase; }.object-panel>button { display:flex; width:100%; align-items:center; gap:8px; margin:3px 0; padding:8px; color:#25344e; text-align:left; background:transparent; border:1px solid transparent; border-radius:5px; cursor:pointer; }.object-panel>button:hover,.object-panel>button.active { color:#173f99; background:#edf3ff; border-color:#bbcffc; }.object-panel button span { min-width:0; flex:1; overflow:hidden; white-space:normal; word-break:break-word; }.object-panel button small { display:block; overflow:hidden; color:#73829a; font:10px Consolas,monospace; text-overflow:ellipsis; white-space:nowrap; }.object-panel button em { color:#16836d; font:9px Consolas,monospace; font-style:normal; }.object-panel i { width:10px; height:10px; flex:none; background:#28a99a; border-radius:50%; }.object-panel i.enemy { background:#e86d4d; }.object-panel i.layer-dot { border-radius:1px; background:#4278e6; }
.grid-control { display:grid; grid-template-columns:1fr auto 68px; gap:8px; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid #e5ebf4; color:#53627a; }.canvas-column { display:grid; min-width:0; grid-template-columns:minmax(360px,620px); justify-content:center; gap:14px; }.canvas-tools { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; color:#80550c; background:#fff8e8; border:1px solid #f0d694; border-radius:6px; font-size:12px; }.canvas-column :deep(.preview-panel) { width:min(100%,620px); }.published-legacy { display:flex; gap:24px; margin-top:8px; padding:18px; color:#42516a; background:#f7f9fd; border:1px solid #d9e2f0; border-radius:8px; }.published-legacy b { color:#a56b10; }
:deep(.ant-form-item-label>label),:deep(.ant-empty-description),:deep(.ant-descriptions-item-label),:deep(.ant-descriptions-item-content) { color:#3e4e67 !important; white-space:normal; word-break:normal; }.property-panel :deep(.ant-input),.property-panel :deep(.ant-input-number),.property-panel :deep(.ant-select-selector) { min-width:0; }
@media(max-width:1500px){.editor-grid{grid-template-columns:220px minmax(430px,1fr) 320px;gap:10px}.orchestration-page{padding:12px}.page-head{align-items:flex-start;flex-direction:column}.source-bar{flex-wrap:wrap}.source-bar span{margin-left:0}.property-panel{position:static}}
</style>
