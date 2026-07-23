<template>
  <article class="resource-card">
    <ArtResourceThumb :resource="resource" :thumb="thumb" @preview="$emit('preview', resource)" />
    <div class="body">
      <strong>{{ resource.display_name ?? resource.art_key }}</strong>
      <code>{{ resource.art_key }}</code>
      <div class="tags">
        <a-tag>{{ resource.resource_type }}</a-tag>
        <a-tag>{{ resource.pack_name ?? '-' }}</a-tag>
        <a-tag :color="resourceStatusColor(resource)">{{ resource.status ?? resource.resource_status }}</a-tag>
      </div>
      <small>草稿 v{{ resource.draftVersion?.version_no ?? resource.currentDraftVersion?.version_no ?? '-' }} / 发布 v{{ resource.publishedVersion?.version_no ?? '-' }}</small>
      <small>{{ resourceSize(resource) }} / {{ resource.updated_at ?? '-' }}</small>
    </div>
    <a-space class="ops" wrap>
      <a-button size="small" @click="$emit('detail', resource)">查看详情</a-button>
      <a-button size="small" @click="$emit('preview', resource)">查看原图</a-button>
      <a-upload :show-upload-list="false" :before-upload="emitUpload">
        <a-button size="small">替换图片</a-button>
      </a-upload>
      <a-button size="small" @click="$emit('copy', resource.art_key)">复制 Art Key</a-button>
    </a-space>
  </article>
</template>

<script setup lang="ts">
import ArtResourceThumb from './ArtResourceThumb.vue';
import { resourceSize, resourceStatusColor, type ArtResourceRow } from './artResourceUi';

const props = defineProps<{ resource: ArtResourceRow; thumb?: string }>();
const emit = defineEmits<{
  detail: [resource: ArtResourceRow];
  preview: [resource: ArtResourceRow];
  upload: [resource: ArtResourceRow, file: File];
  copy: [artKey: string];
}>();

function emitUpload(file: File) {
  emit('upload', props.resource, file);
  return false;
}
</script>

<style scoped>
.resource-card {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 10px;
  min-height: 164px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #dce4ee;
  border-radius: 8px;
}

.body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 5px;
}

strong,
code,
small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

code {
  color: #475569;
  font-size: 12px;
}

small {
  color: #64748b;
}

.tags,
.ops {
  grid-column: 1 / -1;
}
</style>
