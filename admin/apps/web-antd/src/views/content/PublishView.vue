<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-card title="草稿状态">
      <a-descriptions :column="4" bordered size="small">
        <a-descriptions-item label="草稿修订">{{ status?.state?.draft_revision ?? 0 }}</a-descriptions-item>
        <a-descriptions-item label="发布修订">{{ status?.state?.published_revision ?? 0 }}</a-descriptions-item>
        <a-descriptions-item label="未发布修改">{{ status?.state?.draft_dirty ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="当前版本">{{ status?.release?.release_version ?? '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card title="校验与发布">
      <a-space>
        <a-button @click="validate">执行完整校验</a-button>
        <a-button type="primary" :disabled="validation && !validation.valid" @click="publish">发布到游戏配置</a-button>
      </a-space>
      <a-table v-if="validation" row-key="field" size="small" :columns="issueColumns" :data-source="validation.errors" />
    </a-card>
    <a-card title="历史版本">
      <a-table row-key="id" :columns="releaseColumns" :data-source="releases">
        <template #bodyCell="{ column, record }">
          <a-button v-if="column.key === 'restore'" size="small" @click="restore(record.id)">恢复为草稿</a-button>
        </template>
      </a-table>
    </a-card>
  </a-space>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { contentApi } from '../../api/content';

const status = ref<any>(null);
const validation = ref<any>(null);
const releases = ref<any[]>([]);
const issueColumns = ['entityType', 'entityId', 'field', 'message', 'suggestion'].map(x => ({ title: x, dataIndex: x }));
const releaseColumns = [
  { title: '发布版本', dataIndex: 'release_version' },
  { title: '状态', dataIndex: 'status' },
  { title: 'Checksum', dataIndex: 'snapshot_checksum' },
  { title: '发布时间', dataIndex: 'published_at' },
  { title: '操作', key: 'restore' },
];

async function reload() {
  status.value = await contentApi.publishStatus();
  releases.value = await contentApi.releases();
}

async function validate() {
  validation.value = await contentApi.validate();
}

async function publish() {
  const result = await contentApi.publish();
  message.success(`发布成功：${result.releaseVersion}`);
  await reload();
}

async function restore(id: string) {
  await contentApi.restore(id);
  message.success('已恢复为草稿');
  await reload();
}

onMounted(reload);
</script>
