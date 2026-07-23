<template>
  <a-drawer :open="open" title="场景预览" width="760" @close="$emit('close')">
    <div class="toolbar">
      <a-radio-group v-model:value="previewMode" button-style="solid">
        <a-radio-button value="draft">草稿预览</a-radio-button>
        <a-radio-button value="published">已发布预览</a-radio-button>
      </a-radio-group>
      <a-select v-model:value="selectedEnemyId" :options="enemyOptions" placeholder="选择敌人" style="width: 180px" />
      <a-select v-model:value="heroState" :options="stateOptions" style="width: 120px" />
      <a-select v-model:value="enemyState" :options="stateOptions" style="width: 120px" />
      <a-button size="small" @click="playing = true">播放</a-button>
      <a-button size="small" @click="playing = false">暂停</a-button>
      <a-button size="small" @click="playing = true">恢复</a-button>
      <a-button size="small" @click="resetPreview">重置</a-button>
      <a-select v-model:value="sceneScale" :options="scaleOptions" style="width: 120px" placeholder="画面缩放" />
      <a-select v-model:value="playSpeed" :options="speedOptions" style="width: 120px" placeholder="播放速度" />
    </div>
    <section class="stage-preview" :style="{ transform: `scale(${sceneScale})` }">
      <ArtResourceThumb class="bg" :art-key="backgroundArtKey" :resource="resourceFor(backgroundArtKey)" :thumb="thumbFor(backgroundArtKey)" />
      <div class="floor">floor / near layer</div>
      <div class="actor hero">
        <AnimationClipPreview :clip="heroClip" :resources="resources" :thumbs="thumbs" :playing="playing" :speed="playSpeed" :reset-seq="resetSeq" />
        <span>主角：{{ hero?.name ?? '-' }}</span>
      </div>
      <div class="actor enemy">
        <AnimationClipPreview :clip="enemyClip" :resources="resources" :thumbs="thumbs" :playing="playing" :speed="playSpeed" :reset-seq="resetSeq" />
        <span>敌人：{{ enemy?.name ?? '-' }}</span>
      </div>
    </section>
    <a-descriptions size="small" bordered :column="2" class="info">
      <a-descriptions-item label="当前预览模式">{{ previewMode === 'draft' ? '草稿预览' : '已发布预览' }}</a-descriptions-item>
      <a-descriptions-item label="当前关卡">{{ stage?.legacyStageId ?? stage?.id ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="当前背景">{{ background?.name ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="当前敌人">{{ enemy?.name ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="当前主角">{{ hero?.name ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="当前敌人Clip">{{ enemyClip?.clipKey ?? enemyClip?.key ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="当前主角Clip">{{ heroClip?.clipKey ?? heroClip?.key ?? '-' }}</a-descriptions-item>
      <a-descriptions-item label="数据来源">{{ dataSourceText }}</a-descriptions-item>
      <a-descriptions-item label="Art Manifest">{{ previewMode === 'published' ? 'R000007' : 'MySQL草稿资源版本' }}</a-descriptions-item>
      <a-descriptions-item label="Animation Manifest">{{ animationManifestText }}</a-descriptions-item>
    </a-descriptions>
    <a-alert type="info" show-icon message="预览展示图层顺序与动作片段播放，不模拟完整战斗和出生点。" />
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ArtResourceThumb from '../art-resource/ArtResourceThumb.vue';
import AnimationClipPreview from './AnimationClipPreview.vue';
import { contentApi } from '../../api/content';

const props = defineProps<{
  open: boolean;
  stage?: any;
  enemies: any[];
  backgrounds: any[];
  heroes: any[];
  resources: any[];
  thumbs: Record<string, string>;
}>();
defineEmits<{ close: [] }>();

const clips = ref<any[]>([]);
const publishedClips = ref<any[]>([]);
const publishedMeta = ref<any>();
const previewMode = ref<'draft' | 'published'>('draft');
const playing = ref(true);
const playSpeed = ref(1);
const sceneScale = ref(1);
const resetSeq = ref(0);
const heroState = ref('idle');
const enemyState = ref('idle');
const selectedEnemyId = ref('');
const stateOptions = ['idle', 'move', 'attack', 'hit', 'death'].map(value => ({ value, label: value }));
const speedOptions = [0.5, 1, 1.5, 2].map(value => ({ value, label: `${value}x` }));
const scaleOptions = [0.5, 1, 1.5, 2].map(value => ({ value, label: `${value}x` }));
const hero = computed(() => props.heroes.find(item => item.id === props.stage?.heroVisualTemplateId));
const background = computed(() => props.backgrounds.find(item => item.id === props.stage?.backgroundThemeId));
const enemy = computed(() => props.enemies.find(item => item.id === (selectedEnemyId.value || enemyIds.value[0])));
const enemyOptions = computed(() => enemyIds.value.map(id => ({ value: id, label: props.enemies.find(item => item.id === id)?.name ?? id })));
const enemyIds = computed(() => {
  const ids = new Set<string>();
  for (const wave of props.stage?.waves ?? []) for (const group of wave.groups ?? []) ids.add(group.enemyTemplateId);
  for (const group of props.stage?.exploration?.spawnGroups ?? []) ids.add(group.enemyTemplateId);
  return [...ids];
});
const backgroundArtKey = computed(() => background.value?.art?.floorArtKey ?? background.value?.art?.backgroundArtKey);
const heroClip = computed(() => clipFor('hero', heroState.value, hero.value?.visual?.animationClipKeys));
const enemyClip = computed(() => clipFor('enemy', enemyState.value, enemy.value?.visual?.animationClipKeys));
const currentClips = computed(() => previewMode.value === 'draft' ? clips.value : publishedClips.value);
const dataSourceText = computed(() => previewMode.value === 'draft' ? 'MySQL草稿动画与草稿资源' : '已发布Animation Snapshot与Art Manifest');
const animationManifestText = computed(() => previewMode.value === 'published' ? (publishedMeta.value?.releaseVersion ?? '无已发布快照') : 'MySQL草稿');

onMounted(async () => {
  clips.value = await contentApi.animationClips().catch(() => []);
  const published = await contentApi.publishedAnimationClips().catch(() => ({ clips: [] }));
  publishedMeta.value = published;
  publishedClips.value = published.clips ?? published;
  selectedEnemyId.value = enemyIds.value[0] ?? '';
});

function clipFor(targetType: string, state: string, bindings?: Record<string, string>) {
  return currentClips.value.find(clip => (clip.clipKey ?? clip.key) === bindings?.[state])
    ?? currentClips.value.find(clip => clip.targetType === targetType && clip.state === state);
}

function resetPreview() { resetSeq.value++; }

function resourceFor(artKey?: string) {
  return props.resources.find(item => (item.art_key ?? item.artKey) === artKey);
}

function thumbFor(artKey?: string) {
  return artKey ? props.thumbs[artKey] : undefined;
}
</script>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.stage-preview { position: relative; min-height: 360px; overflow: hidden; border: 1px solid #dce4ee; border-radius: 8px; background: #0b1220; transform-origin: top left; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.55; }
.floor { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px; background: rgba(15, 23, 42, 0.72); color: #cbd5e1; }
.actor { position: absolute; width: 220px; padding: 10px; background: rgba(248, 251, 253, 0.92); border: 1px solid #dce4ee; border-radius: 8px; }
.hero { left: 18%; bottom: 62px; }
.enemy { right: 14%; bottom: 118px; }
.actor span { display: block; margin-top: 6px; color: #475569; font-size: 12px; }
.info { margin-top: 12px; }
</style>
