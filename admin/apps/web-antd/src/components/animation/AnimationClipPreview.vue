<template>
  <div class="clip-preview">
    <ArtResourceThumb
      :art-key="currentFrame?.artKey"
      :resource="resourceFor(currentFrame?.artKey)"
      :thumb="thumbFor(currentFrame?.artKey)"
      small
    />
    <div class="clip-meta">
      <strong>{{ clip?.name ?? '未绑定动作片段' }}</strong>
      <span>{{ clip?.clipKey ?? clip?.key ?? '-' }}</span>
      <span>{{ frames.length }} 帧 / {{ durationText }} / #{{ currentFrameIndex + 1 }}</span>
      <span>{{ currentTimeMs }}ms / {{ totalDurationMs }}ms</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import ArtResourceThumb from '../art-resource/ArtResourceThumb.vue';

const props = defineProps<{
  clip?: any;
  resources?: any[];
  thumbs?: Record<string, string>;
  playing?: boolean;
  speed?: number;
  resetSeq?: number;
  stepSeq?: number;
  stepDelta?: number;
}>();

const index = ref(0);
let timer: number | undefined;
const frames = computed(() => [...(props.clip?.frames ?? [])].sort((a, b) => a.order - b.order));
const currentFrame = computed(() => frames.value[index.value] ?? frames.value[0]);
const currentFrameIndex = computed(() => index.value);
const totalDurationMs = computed(() => frames.value.reduce((sum, frame) => sum + frameDuration(frame), 0));
const currentTimeMs = computed(() => frames.value.slice(0, index.value).reduce((sum, frame) => sum + frameDuration(frame), 0));
const durationText = computed(() => `${frames.value.reduce((sum, frame) => sum + frameDuration(frame), 0)}ms`);

watch(() => [props.clip?.clipKey ?? props.clip?.key, props.playing, props.speed, frames.value.length] as const, () => {
  stop();
  index.value = 0;
  if (!props.playing || frames.value.length <= 1) return;
  timer = window.setInterval(() => {
    advanceFrame();
  }, Math.max(40, frameDuration(currentFrame.value) / (props.speed ?? 1)));
}, { immediate: true });

watch(() => props.resetSeq, () => { index.value = 0; });
watch(() => props.stepSeq, () => stepFrame(props.stepDelta ?? 1));
onBeforeUnmount(stop);

function stop() {
  if (timer !== undefined) window.clearInterval(timer);
  timer = undefined;
}

function frameDuration(frame?: any) {
  return frame?.durationMs ?? props.clip?.defaultFrameDurationMs ?? (props.clip?.defaultFps ? 1000 / props.clip.defaultFps : 120);
}

function advanceFrame() {
  if (!frames.value.length) return;
  if (index.value < frames.value.length - 1) {
    index.value += 1;
    return;
  }
  if (props.clip?.playMode === 'once') {
    index.value = 0;
    stop();
    return;
  }
  if (props.clip?.playMode === 'hold-last-frame') {
    stop();
    return;
  }
  index.value = 0;
}

function stepFrame(delta: number) {
  if (!frames.value.length) return;
  stop();
  index.value = Math.max(0, Math.min(frames.value.length - 1, index.value + delta));
}

function resourceFor(artKey?: string) {
  return props.resources?.find(item => (item.art_key ?? item.artKey) === artKey);
}

function thumbFor(artKey?: string) {
  return artKey ? props.thumbs?.[artKey] : undefined;
}
</script>

<style scoped>
.clip-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.clip-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 12px;
  color: #475569;
}

.clip-meta strong,
.clip-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
