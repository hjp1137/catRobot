<template>
  <button
    class="art-thumb"
    :class="{ small, blocked: loadFailed || resourceStatusBlocked(resolvedResource), loading: isResolving }"
    type="button"
    :aria-label="thumbLabel"
    @click="$emit('preview')"
  >
    <img v-if="resolvedThumb" :src="resolvedThumb" loading="lazy" />
    <span v-else class="empty" aria-hidden="true"></span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { resourceStatusBlocked, type ArtResourceRow } from './artResourceUi';
import { contentApi } from '../../api/content';

const resourceCache = new Map<string, ArtResourceRow>();
const failedArtKeys = new Set<string>();
const resourceRequests = new Map<string, Promise<ArtResourceRow>>();
const thumbCache = new Map<string, string>();
const failedThumbKeys = new Set<string>();
const thumbRequests = new Map<string, Promise<string>>();

const props = defineProps<{ resource?: ArtResourceRow; thumb?: string; small?: boolean; artKey?: string; loadError?: boolean }>();
defineEmits<{ preview: [] }>();
const fallbackResource = ref<ArtResourceRow>();
const fallbackThumb = ref('');
const localLoadError = ref(false);
const resolvedResource = computed(() => props.resource ?? fallbackResource.value);
const resolvedThumb = computed(() => props.thumb ?? fallbackThumb.value);
const loadFailed = computed(() => Boolean(props.loadError || localLoadError.value));
const isResolving = computed(() => Boolean(props.artKey && !resolvedResource.value && !loadFailed.value));
const thumbLabel = computed(() => {
  if (!props.artKey) return '未绑定资源';
  if (loadFailed.value) return `${props.artKey} 加载失败`;
  if (isResolving.value) return `${props.artKey} 加载中`;
  return props.artKey;
});

watch(() => [props.artKey, props.resource, props.thumb] as const, ([artKey, resource, thumb]) => {
  if (!artKey) {
    fallbackResource.value = undefined;
    fallbackThumb.value = '';
    localLoadError.value = false;
    return;
  }
  if (resource && !thumb) {
    void resolveThumb(artKey, resource);
    return;
  }
  if (resource) {
    fallbackResource.value = undefined;
    fallbackThumb.value = '';
    localLoadError.value = false;
    return;
  }
  const cached = resourceCache.get(artKey);
  if (cached) {
    fallbackResource.value = cached;
    localLoadError.value = false;
    void resolveThumb(artKey, cached);
    return;
  }
  if (failedArtKeys.has(artKey)) {
    fallbackResource.value = undefined;
    fallbackThumb.value = '';
    localLoadError.value = true;
    return;
  }
  void resolveByArtKey(artKey);
}, { immediate: true });

async function resolveByArtKey(artKey: string) {
  try {
    let request = resourceRequests.get(artKey);
    if (!request) {
      request = contentApi.resource(artKey);
      resourceRequests.set(artKey, request);
    }
    const resource = await request;
    resourceCache.set(artKey, resource);
    failedArtKeys.delete(artKey);
    if (props.resource || props.artKey !== artKey) return;
    fallbackResource.value = resource;
    localLoadError.value = false;
    await resolveThumb(artKey, resource);
  } catch {
    failedArtKeys.add(artKey);
    if (props.artKey === artKey) {
      fallbackResource.value = undefined;
      fallbackThumb.value = '';
      localLoadError.value = true;
    }
  } finally {
    resourceRequests.delete(artKey);
  }
}

async function resolveThumb(artKey: string, resource: ArtResourceRow) {
  if (thumbCache.has(artKey)) {
    fallbackThumb.value = thumbCache.get(artKey) ?? '';
    return;
  }
  if (failedThumbKeys.has(artKey)) return;
  try {
    let request = thumbRequests.get(artKey);
    if (!request) {
      request = resource.thumbnailUrl ? contentApi.resourceBlobUrl(resource.thumbnailUrl) : Promise.resolve('');
      thumbRequests.set(artKey, request);
    }
    const thumb = await request;
    thumbCache.set(artKey, thumb);
    failedThumbKeys.delete(artKey);
    if (props.artKey === artKey) {
      fallbackThumb.value = thumb;
      localLoadError.value = false;
    }
  } catch {
    failedThumbKeys.add(artKey);
    if (props.artKey === artKey) {
      fallbackThumb.value = '';
      localLoadError.value = true;
    }
  } finally {
    thumbRequests.delete(artKey);
  }
}
</script>

<style scoped>
.art-thumb {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  padding: 0;
  overflow: hidden;
  cursor: zoom-in;
  background:
    linear-gradient(45deg, #d6dbe3 25%, transparent 25%),
    linear-gradient(-45deg, #d6dbe3 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d6dbe3 75%),
    linear-gradient(-45deg, transparent 75%, #d6dbe3 75%);
  background-color: #f8fafc;
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  border: 1px solid #cfd8e3;
  border-radius: 6px;
}

.art-thumb.small {
  width: 44px;
  height: 44px;
}

.art-thumb.blocked {
  border-color: #ffccc7;
}

.art-thumb.loading {
  border-color: #cfd8e3;
}

.art-thumb.loading::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: thumb-loading 1s linear infinite;
}

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.empty {
  width: 44%;
  height: 44%;
  border: 1px solid #c8d3df;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.52);
}

@keyframes thumb-loading {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
</style>
