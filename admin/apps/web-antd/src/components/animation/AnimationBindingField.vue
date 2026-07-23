<template>
  <section class="animation-binding">
    <div class="head">
      <strong>{{ label }}</strong>
      <a-radio-group v-model:value="mode" size="small">
        <a-radio-button value="static">静态图片</a-radio-button>
        <a-radio-button value="clip">动作片段</a-radio-button>
      </a-radio-group>
    </div>
    <ArtResourceField
      v-if="mode === 'static'"
      :label="`${label}静态图`"
      :model-value="modelValue"
      :resource-type="resourceType"
      :art-key="modelValue"
      :resource="resource"
      :thumb="thumb"
      :required="required"
      @update:modelValue="$emit('update:modelValue', $event)"
      @view-versions="$emit('viewVersions', $event)"
      @preview="$emit('preview', $event)"
    />
    <div v-else class="clip-panel">
      <a-select
        show-search
        allow-clear
        :value="clipKey"
        :options="clipOptions"
        style="width: 100%"
        @change="updateClip"
      />
      <AnimationClipPreview
        :clip="selectedClip"
        :resources="resources"
        :thumbs="thumbs"
        playing
      />
      <a-space>
        <a-button size="small" :disabled="!clipKey" @click="$emit('editClip', clipKey)">编辑动作片段</a-button>
        <a-button size="small" danger :disabled="!clipKey" @click="$emit('update:clipKey', undefined)">解除绑定</a-button>
      </a-space>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import ArtResourceField from '../art-resource/ArtResourceField.vue';
import AnimationClipPreview from './AnimationClipPreview.vue';
import { contentApi } from '../../api/content';

const props = defineProps<{
  label: string;
  state: string;
  targetType: 'enemy' | 'hero';
  modelValue?: string;
  clipKey?: string;
  resourceType?: string;
  resource?: any;
  thumb?: string;
  resources?: any[];
  thumbs?: Record<string, string>;
  required?: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value?: string];
  'update:clipKey': [value?: string];
  viewVersions: [artKey?: string];
  preview: [artKey?: string];
  editClip: [clipKey?: string];
}>();
const clips = ref<any[]>([]);
const mode = ref(props.clipKey ? 'clip' : 'static');
const clipOptions = computed(() => clips.value
  .filter(clip => clip.targetType === props.targetType && clip.state === props.state)
  .map(clip => ({ value: clip.clipKey ?? clip.key, label: `${clip.name} / ${clip.clipKey ?? clip.key}` })));
const selectedClip = computed(() => clips.value.find(clip => (clip.clipKey ?? clip.key) === props.clipKey));

function updateClip(value?: string): void {
  emit('update:clipKey', value);
}

watch(() => props.clipKey, value => { if (value) mode.value = 'clip'; });
watch(mode, value => { if (value === 'static' && props.clipKey) emit('update:clipKey', undefined); });

onMounted(async () => {
  clips.value = await contentApi.animationClips().catch(() => []);
});
</script>

<style scoped>
.animation-binding,
.clip-panel { display: flex; flex-direction: column; gap: 10px; }

.head { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
</style>
