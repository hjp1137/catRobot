<template>
  <a-card title="美术资源">
    <div class="toolbar">
      <a-input-search v-model:value="keyword" placeholder="搜索 Art Key 或名称" style="width: 280px" @search="load" />
      <a-tabs v-model:active-key="category" size="small" @change="resetPage"><a-tab-pane v-for="item in categories" :key="item" :tab="`${item} (${categoryCounts[item] ?? 0})`" /></a-tabs>
      <a-select v-model:value="packName" allow-clear placeholder="资源包" style="width: 180px" @change="load">
        <a-select-option v-for="item in packOptions" :key="item" :value="item">{{ item }}</a-select-option>
      </a-select>
      <a-select v-model:value="status" allow-clear placeholder="资源状态" style="width: 160px" @change="load">
        <a-select-option value="physical">Physical</a-select-option>
        <a-select-option value="virtual">Virtual</a-select-option>
        <a-select-option value="missing">Missing</a-select-option>
        <a-select-option value="fallback">Fallback</a-select-option>
      </a-select>
      <a-segmented v-model:value="quick" :options="quickTabs" />
      <a-segmented v-model:value="viewMode" :options="viewOptions" />
      <a-button type="primary" @click="openCreate">新增 Art Key</a-button>
    </div>
    <a-alert v-if="rows.some(isDraftChanged)" type="warning" show-icon message="存在草稿资源变更，需完整校验并发布后才会进入小游戏。" />
    <div v-if="viewMode === 'gallery'" class="resource-gallery">
      <ArtResourcePreviewCard
        v-for="record in rows"
        :key="record.art_key"
        :resource="record"
        :thumb="thumbs[record.art_key]"
        @detail="openDetail"
        @preview="openOriginal"
        @copy="copy"
      />
    </div>
    <a-table v-else row-key="art_key" :data-source="rows" :columns="columns" :pagination="false">
      <template #bodyCell="{ column, record }">
        <ArtResourceThumb v-if="column.key === 'thumb'" :resource="record" :thumb="thumbs[record.art_key]" @preview="openOriginal(record)" />
        <a-space v-else-if="column.key === 'versions'" direction="vertical" size="small">
          <a-tag>草稿 v{{ record.currentDraftVersion?.version_no ?? '-' }}</a-tag>
          <a-tag color="green">发布 v{{ record.publishedVersion?.version_no ?? '-' }}</a-tag>
        </a-space>
        <a-tag v-else-if="column.key === 'status'" :color="statusColor(record)">{{ record.status ?? record.resource_status }}</a-tag>
        <a-tag v-else-if="column.key === 'validation'">{{ record.displayVersion?.validation_status ?? record.currentDraftVersion?.validation_status ?? '-' }}</a-tag>
        <a-space v-else-if="column.key === 'actions'">
          <a-button size="small" @click="openDetail(record)">详情</a-button>
          <a-button size="small" @click="openOriginal(record)">查看原图</a-button>
          <a-button size="small" @click="chooseFromLibrary(record)">从图库选择</a-button>
          <a-button size="small" @click="copy(record.art_key)">复制</a-button>
        </a-space>
      </template>
    </a-table>
  </a-card>
  <a-pagination :current="page" :page-size="pageSize" :total="total" :page-size-options="['24','48','96']" show-size-changer @change="changePage" @show-size-change="changeSize" />
  <a-drawer v-model:open="createOpen" title="新建美术资源" width="560">
    <a-form layout="vertical">
      <a-form-item label="Art Key"><a-input v-model:value="form.artKey" /></a-form-item>
      <a-form-item label="资源类型"><a-select v-model:value="form.resourceType" :options="resourceTypes.map(value => ({ value, label: value }))" /></a-form-item>
      <a-form-item label="资源包"><a-input v-model:value="form.packName" /></a-form-item>
      <a-space>
        <a-form-item label="建议宽"><a-input-number v-model:value="form.expectedWidth" /></a-form-item>
        <a-form-item label="建议高"><a-input-number v-model:value="form.expectedHeight" /></a-form-item>
      </a-space>
      <a-form-item label="尺寸策略"><a-radio-group v-model:value="form.dimensionPolicy"><a-radio-button value="exact">exact</a-radio-button><a-radio-button value="recommended">recommended</a-radio-button><a-radio-button value="free">free</a-radio-button></a-radio-group></a-form-item>
      <a-form-item label="Fallback Art Key"><a-input v-model:value="form.fallbackArtKey" /></a-form-item>
      <a-form-item><a-checkbox v-model:checked="form.requiredAlpha">要求透明通道</a-checkbox></a-form-item>
      <a-alert type="info" message="Art Key 创建后，请从图库选择原图或派生版本建立草稿。" />
      <a-button type="primary" @click="create">创建 Art Key</a-button>
    </a-form>
  </a-drawer>
  <a-drawer v-model:open="detailOpen" :title="detail?.art_key" width="860">
    <div v-if="detail" class="compare">
      <VersionCard title="当前已发布" :version="detail.publishedVersion" :url="previewUrl(detail, detail.publishedVersion)" />
      <VersionCard title="当前草稿" :version="detail.currentDraftVersion" :url="previewUrl(detail, detail.currentDraftVersion)" />
    </div>
    <a-card v-if="references.total" size="small" class="refs" title="资源引用详情">
      <template #extra>共 {{ references.total }} 处</template>
      <a-tag v-for="item in references.summary" :key="item.label">{{ item.label }} {{ item.count }}</a-tag>
      <a-table row-key="id" :data-source="references.items" :columns="referenceColumns" size="small" :pagination="false" />
    </a-card>
    <a-table row-key="id" :data-source="versions" :columns="versionColumns" size="small" :pagination="false">
      <template #bodyCell="{ column, record }">
        <img v-if="column.key === 'thumb'" class="thumb" :src="versionThumbs[record.id]" @click="openVersionOriginal(record)" />
        <a-space v-else-if="column.key === 'actions'">
          <a-button size="small" @click="openVersionOriginal(record)">查看原图</a-button>
          <a-button size="small" @click="selectDraft(record)">设为草稿</a-button>
          <a-button v-if="record.validation_status !== 'published'" size="small" danger @click="deleteVersion(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>
  </a-drawer>
  <a-modal v-model:open="previewOpen" title="查看原图" width="820" :footer="null">
    <img v-if="previewImage" class="original-preview" :src="previewImage" />
  </a-modal>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { contentApi } from '../../api/content';
import ArtResourcePreviewCard from '../../components/art-resource/ArtResourcePreviewCard.vue';
import ArtResourceThumb from '../../components/art-resource/ArtResourceThumb.vue';
import { checksumShort, fileSize, isDraftChanged as draftChanged, resourceSize, resourceStatusColor } from '../../components/art-resource/artResourceUi';

const route = useRoute();
const router = useRouter();
const rows = ref<any[]>([]);
const versions = ref<any[]>([]);
const references = ref({ total: 0, summary: [] as any[], items: [] as any[] });
const detail = ref<any>(null);
const keyword = ref('');
const category = ref('全部');
const categories = ['全部', '角色与敌人', '场景与地图', '界面资源', '特效', '掉落与道具', '其他'];
const categoryCounts = ref<Record<string, number>>({});
const page = ref(1);
const pageSize = ref(24);
const total = ref(0);
const packName = ref<string>();
const status = ref<string>();
const quick = ref('全部');
const viewMode = ref<'gallery' | 'table'>('gallery');
const createOpen = ref(false);
const detailOpen = ref(false);
const previewOpen = ref(false);
const previewImage = ref('');
const thumbs = ref<Record<string, string>>({});
const versionThumbs = ref<Record<string, string>>({});
const resourceTypes = ['player', 'enemy', 'background', 'map', 'ui', 'icon', 'effect', 'drop', 'placeholder'];
const quickTabs = ['全部', '已发布', '有草稿变更', '校验异常', '未被引用'];
const viewOptions = [{ label: '图库视图', value: 'gallery' }, { label: '表格视图', value: 'table' }];
const form = ref({ artKey: '', resourceType: 'enemy', packName: 'training_ground_v1', expectedWidth: 64, expectedHeight: 64, dimensionPolicy: 'recommended', requiredAlpha: true, fallbackArtKey: 'placeholder.image' });
const columns = [
  { title: '缩略图', key: 'thumb', width: 72 },
  { title: 'Art Key', dataIndex: 'art_key' },
  { title: '资源类型', dataIndex: 'resource_type' },
  { title: '资源包', dataIndex: 'pack_name' },
  { title: '版本', key: 'versions' },
  { title: '校验', key: 'validation' },
  { title: '状态', key: 'status' },
  { title: '尺寸', customRender: ({ record }: any) => resourceSize(record) },
  { title: '操作', key: 'actions', width: 260 },
];
const versionColumns = [
  { title: '缩略图', key: 'thumb', width: 72 },
  { title: '版本号', dataIndex: 'version_no' },
  { title: '状态', dataIndex: 'validation_status' },
  { title: '尺寸', customRender: ({ record }: any) => `${record.actual_width}x${record.actual_height}` },
  { title: '文件大小', customRender: ({ record }: any) => fileSize(record.size_bytes) },
  { title: 'checksum', dataIndex: 'checksum', ellipsis: true },
  { title: '上传时间', dataIndex: 'created_at' },
  { title: '操作', key: 'actions', width: 260 },
];
const referenceColumns = [
  { title: '类型', dataIndex: 'typeLabel' }, { title: '名称', dataIndex: 'name' },
  { title: '字段', dataIndex: 'field' }, { title: '状态', dataIndex: 'status' },
];
const packOptions = computed(() => [...new Set(rows.value.map(row => row.pack_name).filter(Boolean))]);
const filtered = computed(() => rows.value.filter(row => {
  const haystack = `${row.art_key} ${row.display_name ?? ''} ${row.name ?? ''}`.toLowerCase();
  if (!haystack.includes(keyword.value.toLowerCase())) return false;
  if (quick.value === '已发布') return Boolean(row.published_version_id ?? row.publishedVersion);
  if (quick.value === '有草稿变更') return isDraftChanged(row);
  if (quick.value === '校验异常') return row.status === 'invalid' || ['invalid', 'warning'].includes(row.currentDraftVersion?.validation_status);
  return true;
}));
const VersionCard = defineComponent({
  props: { title: String, version: Object, url: String },
  setup(props) {
    return () => h('div', { class: 'version-card' }, [
      h('h3', props.title),
      props.url ? h('img', { class: 'preview', src: props.url }) : h('div', { class: 'empty-preview' }, '-'),
      h('p', `v${(props.version as any)?.version_no ?? '-'} / ${(props.version as any)?.validation_status ?? '-'}`),
      h('p', `${(props.version as any)?.actual_width ?? '-'}x${(props.version as any)?.actual_height ?? '-'}`),
      h('p', `MIME ${(props.version as any)?.mime_type ?? '-'}`),
      h('p', `文件大小 ${fileSize((props.version as any)?.size_bytes)}`),
      h('p', `checksum ${checksumShort((props.version as any)?.checksum)}`),
    ]);
  },
});

async function load() {
  const result = await contentApi.resourcesPage({ page: page.value, pageSize: pageSize.value, category: category.value, packName: packName.value, status: status.value, keyword: keyword.value || undefined });
  rows.value = result.items;
  total.value = result.total;
  categoryCounts.value = result.categoryCounts ?? {};
  await loadThumbs();
}

async function loadThumbs() {
  const next: Record<string, string> = {};
  await Promise.all(rows.value.map(async row => {
    if (!row.thumbnailUrl) return;
    try {
      next[row.art_key] = await contentApi.resourceBlobUrl(row.thumbnailUrl);
    } catch {
      next[row.art_key] = '';
    }
  }));
  thumbs.value = next;
}

function openCreate() {
  form.value = { artKey: '', resourceType: 'enemy', packName: 'training_ground_v1', expectedWidth: 64, expectedHeight: 64, dimensionPolicy: 'recommended', requiredAlpha: true, fallbackArtKey: 'placeholder.image' };
  createOpen.value = true;
}

async function create() {
  await contentApi.createResource(form.value);
  createOpen.value = false;
  await load();
  message.success('已创建 Art Key，请从图库选择图片建立草稿版本');
}

function chooseFromLibrary(row: any) { router.push({ path: '/content/image-library', query: { artKey: row.art_key } }); }
function resetPage() { page.value = 1; void load(); }
function changePage(next: number) { page.value = next; void load(); }
function changeSize(_current: number, size: number) { pageSize.value = size; page.value = 1; void load(); }

async function openDetail(row: any) {
  detail.value = await contentApi.resource(row.art_key);
  versions.value = await contentApi.resourceVersions(row.art_key);
  references.value = await contentApi.references('resources', row.art_key);
  versionThumbs.value = {};
  await Promise.all(versions.value.map(async item => {
    try {
      versionThumbs.value[item.id] = await contentApi.resourceBlob(row.art_key, item.id, 'thumbnail');
    } catch {
      versionThumbs.value[item.id] = '';
    }
  }));
  detailOpen.value = true;
}

async function openOriginal(row: any) {
  if (!row.originalUrl) return;
  previewImage.value = await contentApi.resourceBlobUrl(row.originalUrl);
  previewOpen.value = true;
}

async function openVersionOriginal(record: any) {
  if (!detail.value) return;
  previewImage.value = await contentApi.resourceBlob(detail.value.art_key, record.id, 'preview');
  previewOpen.value = true;
}

async function selectDraft(record: any) {
  if (!detail.value) return;
  await contentApi.selectDraftResourceVersion(detail.value.art_key, record.id);
  await openDetail(detail.value);
  await load();
  message.success('已设为当前草稿版本');
}

async function deleteVersion(record: any) {
  if (!detail.value) return;
  await contentApi.deleteResourceVersion(detail.value.art_key, record.id);
  await openDetail(detail.value);
  await load();
}

function previewUrl(row: any, version: any) {
  if (!version?.id) return '';
  return versionThumbs.value[version.id] ?? thumbs.value[row.art_key] ?? '';
}

function copy(value: string) {
  navigator.clipboard.writeText(value);
  message.success('已复制');
}

function setPath(target: any, dotted: string, value: string) {
  const keys = dotted.split('.');
  const last = keys.pop() as string;
  const parent = keys.reduce((obj, key) => {
    obj[key] ??= {};
    return obj[key];
  }, target);
  parent[last] = value;
}

function isDraftChanged(row: any) {
  return draftChanged(row);
}

function statusColor(row: any) {
  return resourceStatusColor(row);
}

onMounted(async () => {
  await load();
  const artKey = String(route.query.artKey ?? '');
  const target = rows.value.find(row => row.art_key === artKey);
  if (target) await openDetail(target);
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.resource-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background:
    linear-gradient(45deg, #d6dbe3 25%, transparent 25%),
    linear-gradient(-45deg, #d6dbe3 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d6dbe3 75%),
    linear-gradient(-45deg, transparent 75%, #d6dbe3 75%);
  background-color: #f8fafc;
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.compare {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.refs {
  margin-bottom: 12px;
}

.version-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.preview,
.empty-preview {
  width: 100%;
  height: 220px;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.original-preview {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.file-line {
  margin-top: 8px;
  color: #475569;
  font-size: 12px;
}

.create-preview {
  width: 180px;
  height: 180px;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
</style>
