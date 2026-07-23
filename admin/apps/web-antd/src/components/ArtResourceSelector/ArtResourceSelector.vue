<template>
  <div class="selector-line">
    <a-select
      show-search
      allow-clear
      :value="modelValue"
      :options="options"
      :filter-option="filterOption"
      @search="search"
      style="width: 100%"
      @change="(value?: string) => emit('update:modelValue', value)"
    >
      <template #option="{ label, status, pack, size, thumb, draft, published, disabled }">
        <span class="art-option" :class="{ disabled }">
          <img v-if="thumb" class="thumb" :src="thumb" />
          <span v-else class="thumb empty">无图</span>
          <span class="meta"><b>{{ label }}</b><small>{{ size }} / 草稿 v{{ draft }} / 发布 v{{ published }}</small></span>
          <a-tag>{{ pack }}</a-tag><a-tag>{{ status }}</a-tag>
          <a-tag v-if="disabled" color="red">不可选择</a-tag>
        </span>
      </template>
    </a-select>
    <a-button size="small" @click="goResources">前往图库</a-button>
  </div>
  <a-alert v-if="selectedDraftChanged" type="warning" show-icon message="当前选择含草稿版本，需发布后进入游戏。" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { contentApi } from '../../api/content';
import { resourceStatusBlocked } from '../art-resource/artResourceUi';

const props = defineProps<{ modelValue?: string; resourceType?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value?: string] }>();
const router = useRouter();
const resources = ref<any[]>([]);
const thumbs = ref<Record<string, string>>({});
const keyword = ref('');

const options = computed(() => resources.value
  .filter(item => !props.resourceType || item.resource_type === props.resourceType)
  .map(item => ({
    value: item.art_key,
    label: item.display_name ?? item.name ?? item.art_key,
    searchText: `${item.art_key} ${item.display_name ?? ''} ${item.name ?? ''}`,
    status: item.status ?? item.resource_status,
    disabled: item.resource_status === 'missing' || item.currentDraftVersion?.validation_status === 'invalid' || resourceStatusBlocked(item),
    pack: item.resourcePack ?? item.pack_name,
    thumb: thumbs.value[item.art_key],
    draft: item.draftVersion?.version_no ?? item.currentDraftVersion?.version_no ?? '-',
    published: item.publishedVersion?.version_no ?? '-',
    size: `${item.width ?? item.expected_width ?? '-'}x${item.height ?? item.expected_height ?? '-'}`,
  })));
const selectedDraftChanged = computed(() => {
  const row = resources.value.find(item => item.art_key === props.modelValue);
  return Boolean(row?.hasUnpublishedChange ?? (row?.current_draft_version_id && row.current_draft_version_id !== row.published_version_id));
});

function filterOption(input: string, option: any) {
  return String(option?.searchText ?? option?.label ?? '').toLowerCase().includes(input.toLowerCase());
}

async function load() {
  const result = await contentApi.resources({ page: 1, pageSize: 24, keyword: keyword.value || undefined, type: props.resourceType });
  resources.value = result;
  const next: Record<string, string> = {};
  await Promise.all(resources.value.map(async item => {
    if (!item.thumbnailUrl) return;
    try {
      next[item.art_key] = await contentApi.resourceBlobUrl(item.thumbnailUrl);
    } catch {
      next[item.art_key] = '';
    }
  }));
  thumbs.value = next;
}

function goResources() {
  router.push('/content/image-library');
}

function search(value: string) { keyword.value = value; void load(); }

onMounted(load);
</script>

<style scoped>
.selector-line {
  display: flex;
  gap: 8px;
}

.art-option {
  display: flex;
  align-items: center;
  gap: 6px;
}

.art-option.disabled {
  opacity: 0.5;
}

.thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid #d9d9d9;
}

.empty {
  color: #64748b;
  font-size: 11px;
}

.meta {
  display: flex;
  flex-direction: column;
  min-width: 220px;
}

.meta small {
  color: #64748b;
}
</style>
