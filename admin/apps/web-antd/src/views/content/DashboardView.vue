<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-row :gutter="[12, 12]">
      <a-col v-for="card in cards" :key="card.label" :xs="12" :lg="6">
        <a-card size="small">
          <a-statistic :title="card.label" :value="card.value" />
        </a-card>
      </a-col>
    </a-row>
    <a-card title="草稿与发布">
      <a-descriptions :column="4" size="small" bordered>
        <a-descriptions-item label="草稿修订">{{ data?.state?.draft_revision ?? 0 }}</a-descriptions-item>
        <a-descriptions-item label="未发布修改">{{ data?.state?.draft_dirty ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="当前版本">{{ data?.release?.release_version ?? '-' }}</a-descriptions-item>
        <a-descriptions-item label="最近发布">{{ data?.release?.published_at ?? '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </a-space>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { contentApi } from '../../api/content';

const data = ref<any>(null);
const cards = computed(() => [
  { label: '敌人总数', value: data.value?.enemies ?? 0 },
  { label: '启用敌人', value: data.value?.enabledEnemies ?? 0 },
  { label: '背景主题', value: data.value?.backgrounds ?? 0 },
  { label: '主角表现', value: data.value?.heroes ?? 0 },
  { label: '固定屏关卡', value: data.value?.fixedStages ?? 0 },
  { label: '自由探索关卡', value: data.value?.exploreStages ?? 0 },
]);

onMounted(async () => {
  data.value = await contentApi.dashboard();
});
</script>
