<template>
  <section class="art-field">
    <div class="head">
      <strong>{{ label }}</strong>
      <a-tag :color="loadError ? 'red' : resourceStatusColor(resolvedResource)">{{ loadError ? '加载失败' : resolvedResource?.status ?? resolvedResource?.resource_status ?? 'missing' }}</a-tag>
      <a-tag v-if="isDraftChanged(resolvedResource)" color="gold">草稿未发布</a-tag>
    </div>
    <div class="main">
      <ArtResourceThumb :art-key="modelValue" :resource="resolvedResource" :thumb="resolvedThumb" :load-error="loadError" @preview="$emit('preview', modelValue)" />
      <div class="meta">
        <code>{{ modelValue || '未绑定 Art Key' }}</code>
        <span>草稿 v{{ resolvedResource?.draftVersion?.version_no ?? resolvedResource?.currentDraftVersion?.version_no ?? '-' }} / 发布 v{{ resolvedResource?.publishedVersion?.version_no ?? '-' }}</span>
        <span>{{ resourceSize(resolvedResource) }} / {{ version?.mime_type ?? '-' }}</span>
        <span v-if="loadError" class="error-text">资源请求加载失败，请重新登录或刷新后重试。</span>
      </div>
    </div>
    <a-space wrap>
      <a-button size="small" @click="choosing = !choosing">选择已有资源</a-button>
      <a-button size="small" @click="goLibrary">前往图库上传图片</a-button>
      <a-button size="small" :disabled="!modelValue" @click="$emit('viewVersions', modelValue)">跳转美术资源</a-button>
      <a-button size="small" :disabled="!modelValue" @click="$emit('viewVersions', modelValue)">查看版本</a-button>
      <a-button size="small" danger :disabled="required || !modelValue" @click="$emit('update:modelValue', undefined)">解除绑定</a-button>
    </a-space>
    <a-alert v-if="required && !modelValue" type="warning" show-icon message="必填字段不可解除绑定。" />
    <a-alert v-if="resolvedResource?.draftWarning" type="warning" show-icon :message="resolvedResource.draftWarning" />
    <ArtResourceSelector
      v-if="choosing"
      :model-value="modelValue"
      :resource-type="resourceType"
      @update:modelValue="selectExisting"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ArtResourceSelector from '../ArtResourceSelector/ArtResourceSelector.vue';
import ArtResourceThumb from './ArtResourceThumb.vue';
import { currentVersion, isDraftChanged, resourceSize, resourceStatusColor, type ArtResourceRow } from './artResourceUi';
import { contentApi } from '../../api/content';
import { useRouter } from 'vue-router';

const props = defineProps<{ label: string; modelValue?: string; resourceType?: string; artKey?: string; resource?: ArtResourceRow; thumb?: string; required?: boolean }>();
const emit = defineEmits<{
  'update:modelValue': [value?: string];
  viewVersions: [artKey?: string];
  preview: [artKey?: string];
}>();
const choosing = ref(false);
const router = useRouter();
const fallbackResource = ref<ArtResourceRow>();
const fallbackThumb = ref('');
const loadError = ref(false);
const resolvedResource = computed(() => props.resource ?? fallbackResource.value);
const resolvedThumb = computed(() => props.thumb ?? fallbackThumb.value);
const version = computed(() => currentVersion(resolvedResource.value));

watch(() => [props.modelValue, props.resource, props.thumb] as const, ([modelValue, resource, thumb]) => {
  if (!modelValue) {
    fallbackResource.value = undefined;
    fallbackThumb.value = '';
    loadError.value = false;
    return;
  }
  if (resource && !thumb) {
    void resolveThumb(modelValue, resource);
    return;
  }
  if (resource) {
    fallbackResource.value = undefined;
    fallbackThumb.value = '';
    loadError.value = false;
    return;
  }
  void resolveResource(modelValue);
}, { immediate: true });

async function resolveResource(modelValue: string) {
  try {
    const resource = await contentApi.resource(modelValue);
    if (props.resource || props.modelValue !== modelValue) return;
    fallbackResource.value = resource;
    loadError.value = false;
    await resolveThumb(modelValue, resource);
  } catch {
    if (props.modelValue === modelValue) {
      fallbackResource.value = undefined;
      fallbackThumb.value = '';
      loadError.value = true;
    }
  }
}

async function resolveThumb(modelValue: string, resource: ArtResourceRow) {
  try {
    const thumb = resource.thumbnailUrl ? await contentApi.resourceBlobUrl(resource.thumbnailUrl) : '';
    if (props.modelValue === modelValue) {
      fallbackThumb.value = thumb;
      loadError.value = false;
    }
  } catch {
    if (props.modelValue === modelValue) {
      fallbackThumb.value = '';
      loadError.value = true;
    }
  }
}

function selectExisting(value?: string) {
  emit('update:modelValue', value);
  choosing.value = false;
}

function goLibrary() { router.push('/content/image-library'); }
</script>

<style scoped>
.art-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: #f8fbfd;
  border: 1px solid #dce4ee;
  border-radius: 8px;
}

.head,
.main {
  display: flex;
  gap: 10px;
  align-items: center;
}

.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  color: #475569;
  font-size: 12px;
}

code {
  color: #0f172a;
  white-space: normal;
  word-break: break-all;
}

.error-text {
  color: #cf1322;
}
</style>
