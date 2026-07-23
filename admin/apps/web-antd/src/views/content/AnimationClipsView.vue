<template>
  <a-card title="动作编排">
    <div class="toolbar">
      <a-input-search v-model:value="keyword" placeholder="搜索 Clip Key 或名称" style="width: 260px" />
      <a-select v-model:value="targetType" allow-clear :options="targetOptions" placeholder="对象" style="width: 120px" />
      <a-select v-model:value="state" allow-clear :options="stateOptions" placeholder="动作" style="width: 120px" />
      <a-button type="primary" @click="open(template())">新增动作片段</a-button>
    </div>
    <a-table row-key="clipKey" :columns="columns" :data-source="filtered" :pagination="{ pageSize: 10 }">
      <template #bodyCell="{ column, record }">
        <AnimationClipPreview v-if="column.key === 'preview'" :clip="record" :resources="resources" :thumbs="thumbs" playing />
        <a-tag v-else-if="column.key === 'enabled'" :color="record.enabled ? 'green' : 'default'">{{ record.enabled ? '启用' : '禁用' }}</a-tag>
        <span v-else-if="column.key === 'frames'">{{ record.frames?.length ?? 0 }} 帧</span>
        <a-space v-else-if="column.key === 'actions'">
          <a-button size="small" @click="open(record)">编辑</a-button>
          <a-button size="small" danger @click="remove(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
  <a-drawer v-model:open="drawer" title="动作片段编辑" width="820">
    <a-form v-if="editor" layout="vertical">
      <a-form-item label="Clip Key"><a-input v-model:value="editor.clipKey" :disabled="Boolean(editor.rowVersion)" /></a-form-item>
      <a-form-item label="中文名称"><a-input v-model:value="editor.name" /></a-form-item>
      <a-space wrap>
        <a-select v-model:value="editor.targetType" :options="targetOptions" style="width: 140px" />
        <a-select v-model:value="editor.state" :options="stateOptions" style="width: 140px" />
        <a-select v-model:value="editor.playMode" :options="playOptions" style="width: 160px" />
        <a-input-number v-model:value="editor.defaultFrameDurationMs" addon-after="ms" :min="1" />
        <a-switch v-model:checked="editor.enabled" checked-children="启用" un-checked-children="禁用" />
      </a-space>
      <div class="preview-panel">
        <AnimationClipPreview
          :clip="editor"
          :resources="resources"
          :thumbs="thumbs"
          :playing="previewPlaying"
          :speed="previewSpeed"
          :reset-seq="previewResetSeq"
          :step-seq="previewStepSeq"
          :step-delta="previewStepDelta"
        />
        <a-space wrap>
          <a-button size="small" @click="previewPlaying = true">播放</a-button>
          <a-button size="small" @click="previewPlaying = false">暂停</a-button>
          <a-button size="small" @click="previewPlaying = true">恢复</a-button>
          <a-button size="small" @click="resetPreview">重置</a-button>
          <a-button size="small" @click="stepPreview(-1)">上一帧</a-button>
          <a-button size="small" @click="stepPreview(1)">下一帧</a-button>
          <a-select v-model:value="previewSpeed" :options="speedOptions" style="width: 130px" placeholder="预览速度" />
        </a-space>
      </div>
      <a-alert
        v-for="warning in editorWarnings"
        :key="warning"
        type="warning"
        show-icon
        :message="warning"
      />
      <div class="frames">
        <div v-for="(frame, index) in editor.frames" :key="index" class="frame-row">
          <span>#{{ index }}</span>
          <ArtResourceSelector v-model="frame.artKey" :resource-type="editor.targetType === 'hero' ? 'player' : editor.targetType" />
          <a-input-number v-model:value="frame.durationMs" addon-after="ms" :min="1" />
          <a-input-number v-model:value="frame.offsetX" addon-after="X" />
          <a-input-number v-model:value="frame.offsetY" addon-after="Y" />
          <a-input-number v-model:value="frame.scale" addon-after="scale" :min="0.1" :step="0.1" />
          <a-switch v-model:checked="frame.flipX" checked-children="翻转" un-checked-children="正向" />
          <a-input v-model:value="frame.note" placeholder="帧备注" />
          <a-button size="small" @click="move(index, -1)">上移</a-button>
          <a-button size="small" @click="move(index, 1)">下移</a-button>
          <a-button size="small" @click="moveTo(index, 0)">移至首位</a-button>
          <a-button size="small" @click="moveTo(index, editor.frames.length - 1)">移至末位</a-button>
          <a-button size="small" @click="copyFrame(index)">复制</a-button>
          <a-button size="small" danger :disabled="editor.frames.length <= 1" @click="editor.frames.splice(index, 1)">删除</a-button>
          <a-tag v-for="warning in frameWarnings(frame, index)" :key="warning" color="orange">{{ warning }}</a-tag>
        </div>
      </div>
      <a-space><a-button @click="addFrame">添加帧</a-button><a-button type="primary" @click="save">保存</a-button></a-space>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { contentApi } from '../../api/content';
import ArtResourceSelector from '../../components/ArtResourceSelector/ArtResourceSelector.vue';
import AnimationClipPreview from '../../components/animation/AnimationClipPreview.vue';

const rows = ref<any[]>([]);
const resources = ref<any[]>([]);
const thumbs = ref<Record<string, string>>({});
const keyword = ref('');
const targetType = ref<string>();
const state = ref<string>();
const drawer = ref(false);
const editor = ref<any>();
const previewPlaying = ref(true);
const previewSpeed = ref(1);
const previewResetSeq = ref(0);
const previewStepSeq = ref(0);
const previewStepDelta = ref(1);
const targetOptions = ['enemy', 'hero', 'effect'].map(value => ({ value, label: value }));
const stateOptions = ['idle', 'move', 'attack', 'hit', 'death'].map(value => ({ value, label: value }));
const playOptions = ['loop', 'once', 'hold-last-frame'].map(value => ({ value, label: value }));
const speedOptions = [0.5, 1, 1.5, 2].map(value => ({ value, label: `${value}x` }));
const columns = [
  { title: '预览', key: 'preview', width: 260 },
  { title: 'Clip Key', dataIndex: 'clipKey' },
  { title: '名称', dataIndex: 'name' },
  { title: '帧数', key: 'frames' },
  { title: '启用', key: 'enabled' },
  { title: '操作', key: 'actions', width: 160 },
];
const filtered = computed(() => rows.value.filter(row => `${row.clipKey} ${row.name}`.includes(keyword.value)
  && (!targetType.value || row.targetType === targetType.value) && (!state.value || row.state === state.value)));
const editorWarnings = computed(() => {
  if (!editor.value) return [];
  const warnings = new Set<string>();
  if (!editor.value.frames?.length) warnings.add('空Clip');
  const orders = new Set<number>();
  const sizes = new Set<string>();
  for (const [index, frame] of (editor.value.frames ?? []).entries()) {
    for (const warning of frameWarnings(frame, index)) warnings.add(warning);
    if (orders.has(frame.order)) warnings.add('重复顺序');
    orders.add(frame.order);
    const resource = resourceFor(frame.artKey);
    const width = resource?.displayVersion?.actual_width ?? resource?.currentDraftVersion?.actual_width ?? resource?.publishedVersion?.actual_width;
    const height = resource?.displayVersion?.actual_height ?? resource?.currentDraftVersion?.actual_height ?? resource?.publishedVersion?.actual_height;
    if (width && height) sizes.add(`${width}x${height}`);
  }
  if (sizes.size > 1) warnings.add('帧尺寸不一致');
  return [...warnings];
});

onMounted(load);
async function load() { rows.value = await contentApi.animationClips(); await loadResources(); }
async function loadResources() {
  resources.value = await contentApi.resources();
  const next: Record<string, string> = {};
  await Promise.all(resources.value.map(async item => { if (item.thumbnailUrl) next[item.art_key] = await contentApi.resourceBlobUrl(item.thumbnailUrl).catch(() => ''); }));
  thumbs.value = next;
}
function open(row: any) {
  editor.value = JSON.parse(JSON.stringify(row));
  previewPlaying.value = true;
  resetPreview();
  drawer.value = true;
}
function template() { return { clipKey: '', name: '', targetType: 'enemy', state: 'idle', playMode: 'loop', loop: true, enabled: true, defaultFrameDurationMs: 120, frames: [{ order: 0, artKey: '' }] }; }
function addFrame() { editor.value.frames.push({ order: editor.value.frames.length, artKey: '', scale: 1, flipX: false }); }
function copyFrame(index: number) { editor.value.frames.splice(index + 1, 0, { ...editor.value.frames[index] }); normalize(); }
function move(index: number, delta: number) { const next = index + delta; if (next < 0 || next >= editor.value.frames.length) return; [editor.value.frames[index], editor.value.frames[next]] = [editor.value.frames[next], editor.value.frames[index]]; normalize(); }
function moveTo(index: number, target: number) { const [frame] = editor.value.frames.splice(index, 1); editor.value.frames.splice(target, 0, frame); normalize(); }
function normalize() { editor.value.frames.forEach((frame: any, index: number) => { frame.order = index; }); }
async function save() { normalize(); await contentApi.saveAnimationClip(editor.value); drawer.value = false; await load(); message.success('已保存'); }
function remove(row: any) { Modal.confirm({ title: '删除动作片段', onOk: () => contentApi.deleteAnimationClip(row.clipKey).then(load) }); }
function resetPreview() { previewResetSeq.value++; }
function stepPreview(delta: number) { previewPlaying.value = false; previewStepDelta.value = delta; previewStepSeq.value++; }
function resourceFor(artKey?: string) { return resources.value.find(item => (item.art_key ?? item.artKey) === artKey); }
function frameWarnings(frame: any, index: number) {
  const warnings: string[] = [];
  if (!frame.artKey) warnings.push('Missing Art Key');
  const resource = resourceFor(frame.artKey);
  if (frame.artKey && !resource) warnings.push('Invalid资源');
  if ((frame.durationMs ?? editor.value?.defaultFrameDurationMs ?? 1) <= 0) warnings.push('帧时长非法');
  if (frame.order !== index) warnings.push('重复顺序');
  if (resource?.enabled === false || resource?.resource_status === 'disabled') warnings.push('被禁用资源');
  return warnings;
}
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 12px; }
.preview-panel { display: flex; flex-direction: column; gap: 10px; margin: 14px 0; }
.frames { display: flex; flex-direction: column; gap: 8px; margin: 14px 0; }
.frame-row { display: grid; grid-template-columns: 36px minmax(180px, 1fr) 120px repeat(3, 96px) 92px minmax(120px, 1fr) repeat(6, 68px); gap: 8px; align-items: center; }
</style>
