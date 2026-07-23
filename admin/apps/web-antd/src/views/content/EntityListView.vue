<template>
  <a-card :title="title">
    <div class="toolbar">
      <a-input-search v-model:value="keyword" placeholder="搜索 ID 或名称" style="width: 260px" />
      <a-button type="primary" @click="open(template())">新增</a-button>
    </div>
    <a-table row-key="id" :columns="columns" :data-source="filtered" :pagination="{ pageSize: 10 }">
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'preview'" class="preview-cell">
          <template v-if="kind === 'stages'">
            <ArtResourceThumb
              v-for="item in stagePreviewItems(record).slice(0, 4)"
              :key="item.key"
              small
              :art-key="item.artKey"
              :resource="resourceForKey(item.artKey)"
              :thumb="thumbForKey(item.artKey)"
              @preview="openResourcePreview(item.artKey)"
            />
            <span v-if="stagePreviewItems(record).length > 4" class="more">+{{ stagePreviewItems(record).length - 4 }}</span>
          </template>
          <ArtResourceThumb
            v-else
            small
            :art-key="previewArtKey(record)"
            :resource="resourceForKey(previewArtKey(record))"
            :thumb="thumbForKey(previewArtKey(record))"
            @preview="openResourcePreview(previewArtKey(record))"
          />
        </div>
        <a-tag v-else-if="column.key === 'enabled'" :color="record.enabled ? 'green' : 'default'">{{ record.enabled ? '启用' : '禁用' }}</a-tag>
        <a-tag v-else-if="column.key === 'stageMode' && kind === 'stages'" :color="record.mode === 'explore' ? 'cyan' : 'orange'">{{ record.mode === 'explore' ? '自由地图' : '固定屏（仅调试）' }}</a-tag>
        <a-space v-else-if="column.key === 'actions'">
          <a-button size="small" @click="open(record)">编辑</a-button>
          <a-button v-if="kind === 'stages'" size="small" @click="openScenePreview(record)">场景预览</a-button>
          <a-button v-if="kind === 'stages'" size="small" @click="router.push(`/content/stages/${record.id}/editor`)">可视化编排</a-button>
          <a-button size="small" @click="clone(record)">复制</a-button>
          <a-button size="small" @click="toggle(record)">{{ record.enabled ? '禁用' : '启用' }}</a-button>
          <a-button size="small" danger @click="remove(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
  <a-drawer v-model:open="drawer" :title="editor?.id ? '编辑内容' : '新增内容'" width="720" @close="editor = null">
    <a-form v-if="editor" layout="vertical">
      <a-form-item label="ID"><a-input v-model:value="editor.id" :disabled="Boolean(editor.rowVersion)" /></a-form-item>
      <a-form-item label="名称"><a-input v-model:value="editor.name" /></a-form-item>
      <a-form-item label="描述"><a-textarea v-model:value="editor.description" /></a-form-item>
      <a-form-item v-for="field in artFields" :key="field.path" :label="field.label">
        <AnimationBindingField
          v-if="field.state"
          :label="field.label"
          :state="field.state"
          :target-type="kind === 'heroes' ? 'hero' : 'enemy'"
          :model-value="getPath(editor, field.path)"
          :clip-key="getPath(editor, `visual.animationClipKeys.${field.state}`)"
          :resource-type="field.type"
          :resource="resourceForKey(getPath(editor, field.path))"
          :thumb="thumbForKey(getPath(editor, field.path))"
          :resources="artResources"
          :thumbs="thumbs"
          :required="field.required"
          @update:modelValue="value => setPath(editor, field.path, value)"
          @update:clip-key="value => setPath(editor, `visual.animationClipKeys.${field.state}`, value)"
          @view-versions="goResourceVersions"
          @preview="openResourcePreview"
          @edit-clip="goAnimationClip"
        />
        <ArtResourceField
          v-else
          :label="field.label"
          :model-value="getPath(editor, field.path)"
          :resource-type="field.type"
          :art-key="getPath(editor, field.path)"
          :resource="resourceForKey(getPath(editor, field.path))"
          :thumb="thumbForKey(getPath(editor, field.path))"
          :required="field.required"
          @update:modelValue="value => setPath(editor, field.path, value)"
          @view-versions="goResourceVersions"
          @preview="openResourcePreview"
        />
      </a-form-item>
      <div v-if="kind === 'stages'" class="stage-summary">
        <span>资源引用</span>
        <ArtResourceThumb
          v-for="item in stagePreviewItems(editor)"
          :key="item.key"
          small
          :art-key="item.artKey"
          :resource="resourceForKey(item.artKey)"
          :thumb="thumbForKey(item.artKey)"
          @preview="openResourcePreview(item.artKey)"
        />
      </div>
      <a-form-item label="启用"><a-switch v-model:checked="editor.enabled" /></a-form-item>
      <a-form-item label="配置 JSON"><a-textarea v-model:value="jsonText" :rows="14" /></a-form-item>
      <a-space>
        <a-button type="primary" @click="save">保存</a-button>
        <a-button @click="drawer = false">取消</a-button>
      </a-space>
    </a-form>
  </a-drawer>
  <SceneArtPreview
    :open="scenePreviewOpen"
    :stage="scenePreviewStage"
    :enemies="enemies"
    :backgrounds="backgrounds"
    :heroes="heroes"
    :resources="artResources"
    :thumbs="thumbs"
    @close="scenePreviewOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import ArtResourceField from '../../components/art-resource/ArtResourceField.vue';
import ArtResourceThumb from '../../components/art-resource/ArtResourceThumb.vue';
import AnimationBindingField from '../../components/animation/AnimationBindingField.vue';
import SceneArtPreview from '../../components/animation/SceneArtPreview.vue';
import { currentVersion, previewArtKey as pickPreviewArtKey } from '../../components/art-resource/artResourceUi';
import { contentApi } from '../../api/content';

const route = useRoute();
const router = useRouter();
const rows = ref<any[]>([]);
const artResources = ref<any[]>([]);
const thumbs = ref<Record<string, string>>({});
const enemies = ref<any[]>([]);
const backgrounds = ref<any[]>([]);
const heroes = ref<any[]>([]);
const keyword = ref('');
const drawer = ref(false);
const editor = ref<any>(null);
const scenePreviewOpen = ref(false);
const scenePreviewStage = ref<any>(null);
const jsonText = ref('');
const kind = computed(() => String(route.params.kind));
const titleMap: Record<string, string> = { enemies: '敌人管理', backgrounds: '背景主题', heroes: '主角表现', stages: '关卡配置' };
const title = computed(() => titleMap[kind.value] ?? kind.value);
const columns = [
  { title: '预览', key: 'preview', width: 140 },
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '运行模式', key: 'stageMode' },
  { title: '启用状态', key: 'enabled' },
  { title: '版本', dataIndex: 'rowVersion' },
  { title: '更新时间', dataIndex: 'updatedAt' },
  { title: '操作', key: 'actions', width: 260 },
];
const filtered = computed(() => rows.value.filter(row => `${row.id} ${row.name}`.includes(keyword.value)));
const artFields = computed(() => {
  if (kind.value === 'backgrounds') return [
    ['art.backgroundArtKey', '背景图', 'background', true],
    ['art.floorArtKey', '地板', 'map', true],
    ['art.lineArtKey', '网格线', 'map', true],
    ['art.boundaryArtKey', '边界', 'map', true],
    ['art.zoneMarkArtKey', '区域标识', 'map', true],
  ].map(field);
  if (kind.value === 'heroes') return [
    ['visual.iconArtKey', '头像', 'player', true],
    ['visual.idleArtKey', '待机', 'player', true, 'idle'],
    ['visual.moveArtKey', '移动', 'player', true, 'move'],
    ['visual.attackArtKey', '攻击', 'player', true, 'attack'],
    ['visual.hitArtKey', '受击', 'player', true, 'hit'],
    ['visual.deathArtKey', '死亡', 'player', true, 'death'],
    ['skills.shieldIconArtKey', '护盾图标', 'ui'],
    ['skills.cannonIconArtKey', '炮击图标', 'ui'],
    ['skills.shieldEffectArtKey', '护盾特效', 'effect'],
    ['skills.cannonEffectArtKey', '炮击特效', 'effect'],
  ].map(field);
  if (kind.value === 'enemies') return [
    ['visual.iconArtKey', '图标', 'enemy', true],
    ['visual.idleArtKey', '待机', 'enemy', true, 'idle'],
    ['visual.moveArtKey', '移动', 'enemy', true, 'move'],
    ['visual.attackArtKey', '攻击', 'enemy', true, 'attack'],
    ['visual.hitArtKey', '受击', 'enemy', true, 'hit'],
    ['visual.deathArtKey', '死亡', 'enemy', true, 'death'],
    ['visual.eliteAuraArtKey', '精英光环', 'effect'],
  ].map(field);
  return [];
});

watch(kind, load);
watch(editor, value => { jsonText.value = value ? JSON.stringify(value, null, 2) : ''; });
onMounted(load);

async function load() {
  if (!kind.value) return;
  try {
    rows.value = await contentApi.list(kind.value);
    await loadResources();
    if (kind.value === 'stages') await loadStageLookups();
  } catch (error) {
    console.warn('load content failed', error);
    rows.value = [];
  }
}

async function loadResources() {
  let resources: any[] = [];
  try {
    resources = await contentApi.resources();
  } catch (error) {
    console.warn('loadResources failed', error);
    artResources.value = [];
    thumbs.value = {};
    return;
  }
  artResources.value = resources;
  const next: Record<string, string> = {};
  await Promise.all(artResources.value.map(async item => {
    const key = resourceKey(item);
    if (!key) return;
    if (!item.thumbnailUrl) return;
    try {
      next[key] = await contentApi.resourceBlobUrl(item.thumbnailUrl);
    } catch {
      next[key] = '';
    }
  }));
  thumbs.value = next;
}

async function loadStageLookups() {
  [enemies.value, backgrounds.value, heroes.value] = await Promise.all([
    contentApi.list('enemies'),
    contentApi.list('backgrounds'),
    contentApi.list('heroes'),
  ]);
}

function open(item: any) {
  editor.value = JSON.parse(JSON.stringify(item));
  drawer.value = true;
}

function resourceForKey(artKey?: string) {
  const key = normalizeArtKey(artKey);
  if (!key) return undefined;
  return artResources.value.find(item => resourceKey(item) === key);
}

function thumbForKey(artKey?: string) {
  const key = normalizeArtKey(artKey);
  return key ? thumbs.value[key] : undefined;
}

function previewArtKey(row: any) {
  return pickPreviewArtKey(kind.value, row);
}

function stagePreviewItems(row: any) {
  const items: { key: string; artKey?: string }[] = [];
  const bg = backgrounds.value.find(item => item.id === row.backgroundThemeId);
  const hero = heroes.value.find(item => item.id === row.heroVisualTemplateId);
  if (bg) items.push({ key: `bg:${bg.id}`, artKey: pickPreviewArtKey('backgrounds', bg) });
  if (hero) items.push({ key: `hero:${hero.id}`, artKey: pickPreviewArtKey('heroes', hero) });
  const enemyIds = new Set<string>();
  for (const wave of row.waves ?? []) for (const group of wave.groups ?? []) enemyIds.add(group.enemyTemplateId);
  for (const group of row.exploration?.spawnGroups ?? []) enemyIds.add(group.enemyTemplateId);
  for (const id of enemyIds) {
    const enemy = enemies.value.find(item => item.id === id);
    items.push({ key: `enemy:${id}`, artKey: enemy ? pickPreviewArtKey('enemies', enemy) : undefined });
  }
  return items;
}

async function save() {
  try {
    const body = {
      ...JSON.parse(jsonText.value),
      id: editor.value.id,
      name: editor.value.name,
      description: editor.value.description,
      enabled: editor.value.enabled,
      visual: editor.value.visual,
      art: editor.value.art,
      skills: editor.value.skills,
    };
    await contentApi.save(kind.value, body);
    drawer.value = false;
    await load();
    message.success('已保存');
  } catch (error: any) {
    message.error(error?.response?.status === 409 ? '该内容已被其他操作修改，请刷新后重试。' : '保存失败');
  }
}

async function clone(row: any) {
  const newId = `${row.id}_copy`;
  await contentApi.clone(kind.value, row.id, newId);
  await load();
}

async function toggle(row: any) {
  if (row.enabled) {
    Modal.confirm({ title: '禁用确认', content: '禁用前请确认关卡引用。', onOk: () => contentApi.disable(kind.value, row.id).then(load) });
  } else {
    await contentApi.enable(kind.value, row.id);
    await load();
  }
}

async function remove(row: any) {
  Modal.confirm({
    title: '删除确认',
    onOk: async () => {
      try {
        await contentApi.remove(kind.value, row.id);
        await load();
      } catch (error: any) {
        if (error?.response?.data?.code === 'CONTENT_REFERENCE_EXISTS') {
          message.error('该内容被章节地图引用，禁止删除。');
          return;
        }
        message.error('删除失败');
      }
    },
  });
}

function goResourceVersions(artKey?: string) {
  if (!artKey) return;
  router.push({ path: '/content/resources', query: { artKey } });
}

function goAnimationClip(clipKey?: string) {
  router.push({ path: '/content/animations', query: clipKey ? { clipKey } : undefined });
}

function openScenePreview(row: any) {
  scenePreviewStage.value = row;
  scenePreviewOpen.value = true;
}

async function openResourcePreview(artKey?: string) {
  const key = normalizeArtKey(artKey);
  if (!key) return;
  const resource = resourceForKey(key) ?? await contentApi.resource(key).catch(() => undefined);
  if (!resource?.originalUrl) return;
  window.open(await contentApi.resourceBlobUrl(resource.originalUrl), '_blank');
}

function resourceKey(item: any): string | undefined {
  return normalizeArtKey(item?.art_key ?? item?.artKey);
}

function normalizeArtKey(value?: string): string | undefined {
  const key = String(value ?? '').trim();
  return key || undefined;
}

function template() {
  if (kind.value === 'backgrounds') return { id: '', name: '', art: {}, rendering: { mode: 'cover' }, enabled: true, version: 1 };
  if (kind.value === 'heroes') return { id: '', name: '', visual: { idleArtKey: '', displayScale: 1, collisionRadius: 24 }, skills: { shieldIconArtKey: '', cannonIconArtKey: '' }, enabled: true, version: 1 };
  if (kind.value === 'stages') return { id: '', name: '', mode: 'fixed-battle', heroVisualTemplateId: '', backgroundThemeId: '', waves: [], enabled: true, version: 1 };
  return { id: '', name: '', category: 'normal', behaviorType: 'melee', visual: { idleArtKey: '', displayScale: 1, collisionRadius: 14 }, stats: { maxHp: 1, attack: 0, defense: 0, moveSpeed: 60 }, combat: { attackInterval: 1, attackRange: 40, detectRadius: 300, chaseRadius: 500 }, enabled: true, version: 1 };
}

function field([path, label, type, required, state]: (string | boolean)[]) {
  return { path: String(path), label: String(label), type: String(type), required: Boolean(required), state: state ? String(state) : undefined };
}

function getPath(target: any, dotted: string) {
  return dotted.split('.').reduce((value, key) => value?.[key], target);
}

function setPath(target: any, dotted: string, value?: string) {
  const keys = dotted.split('.');
  const last = keys.pop() as string;
  const parent = keys.reduce((obj, key) => {
    obj[key] ??= {};
    return obj[key];
  }, target);
  parent[last] = value;
  jsonText.value = JSON.stringify(target, null, 2);
}
</script>

<style scoped>
.preview-cell,
.stage-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
}

.stage-summary {
  padding: 10px;
  margin-bottom: 12px;
  background: #f8fbfd;
  border: 1px solid #dce4ee;
  border-radius: 8px;
}

.stage-summary span,
.more {
  color: #475569;
  font-size: 12px;
}
</style>
