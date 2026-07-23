<template>
  <section class="inspector" data-testid="stage-inspector">
    <header><span>属性检查器</span><a-tag :color="dirty ? 'orange' : 'green'">{{ dirty ? '未保存' : '已同步' }}</a-tag></header>
    <a-empty v-if="!object" description="选择图层或出生点进行编辑" />
    <a-form v-else layout="vertical" size="small" @change="$emit('change')">
      <a-form-item label="名称"><a-input v-model:value="object.name" /></a-form-item>
      <template v-if="kind === 'layer'">
        <a-form-item label="图层类型"><a-select v-model:value="object.type" :options="layerTypes" /></a-form-item>
        <a-form-item v-if="object.type !== 'collision'" label="Art Key"><a-select v-model:value="object.artKey" show-search :options="artOptions" /></a-form-item>
        <a-alert v-else type="info" show-icon message="阻挡区" description="此配置不渲染图片；角色、敌人与常规子弹均使用其矩形范围判定阻挡。" />
        <a-alert v-if="blocked" type="error" show-icon message="Missing / Invalid 资源不可保存" />
        <div class="form-grid"><a-form-item label="X"><a-input-number v-model:value="object.x" /></a-form-item><a-form-item label="Y"><a-input-number v-model:value="object.y" /></a-form-item></div>
        <div class="form-grid"><a-form-item label="宽"><a-input-number v-model:value="object.width" /></a-form-item><a-form-item label="高"><a-input-number v-model:value="object.height" /></a-form-item></div>
        <div class="form-grid"><a-form-item label="缩放"><a-input-number v-model:value="object.scale" :step="0.05" /></a-form-item><a-form-item label="透明度"><a-input-number v-model:value="object.opacity" :step="0.05" :min="0" :max="1" /></a-form-item></div>
        <div class="form-grid"><a-form-item label="顺序"><a-input-number v-model:value="object.order" /></a-form-item><a-form-item label="视差"><a-input-number v-model:value="object.parallax" :step="0.1" /></a-form-item></div>
        <a-checkbox v-model:checked="object.tiled">平铺</a-checkbox><a-checkbox v-model:checked="object.enabled">启用</a-checkbox>
      </template>
      <template v-else>
        <a-alert message="精确坐标与键盘微调" description="方向键 1 单位，Shift + 方向键 10 单位" show-icon />
        <div class="form-grid"><a-form-item label="X 精确坐标"><a-input-number v-model:value="object.x" /></a-form-item><a-form-item label="Y 精确坐标"><a-input-number v-model:value="object.y" /></a-form-item></div>
        <a-form-item label="类型"><a-input :value="object.type === 'hero' ? '主角' : '敌人'" disabled /></a-form-item>
        <a-form-item label="朝向"><a-select v-model:value="object.facing" :options="facingOptions" /></a-form-item>
        <a-form-item label="战斗区域"><a-input v-model:value="object.battleAreaId" /></a-form-item>
        <a-form-item label="备注"><a-textarea v-model:value="object.note" :rows="2" /></a-form-item>
        <a-checkbox v-model:checked="object.enabled">启用</a-checkbox>
        <div class="references"><b>引用波次</b><span v-if="!references.length">无</span><a-tag v-for="ref in references" :key="ref.entryId">{{ ref.waveName }} / {{ ref.entryId }} / {{ ref.enemyTemplateId }}</a-tag></div>
      </template>
      <a-space class="actions"><a-button v-if="kind === 'spawn' && object.type === 'enemy'" @click="$emit('duplicate')">复制</a-button><a-button danger @click="$emit('remove')">删除</a-button></a-space>
    </a-form>
    <a-descriptions v-if="!object" size="small" bordered :column="1">
      <a-descriptions-item label="关卡">{{ meta.stageId }}</a-descriptions-item><a-descriptions-item label="模式">{{ meta.mode }}</a-descriptions-item>
      <a-descriptions-item label="数据来源">{{ meta.source }}</a-descriptions-item><a-descriptions-item label="Release">{{ meta.releaseVersion || '-' }}</a-descriptions-item>
      <a-descriptions-item label="checksum">{{ meta.checksum || '-' }}</a-descriptions-item><a-descriptions-item label="rowVersion">{{ meta.rowVersion }}</a-descriptions-item>
    </a-descriptions>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ object?: any; kind?: 'layer'|'spawn'; resources: any[]; references: any[]; dirty: boolean; meta: any }>();
defineEmits<{ change: []; remove: []; duplicate: [] }>();
const artOptions = computed(() => props.resources.map(row => ({ label: `${row.art_key} · ${row.status ?? row.resource_status}`, value: row.art_key, disabled: ['missing', 'invalid'].includes(row.status ?? row.resource_status) })));
const blocked = computed(() => props.kind === 'layer' && ['missing', 'invalid'].includes(props.resources.find(row => row.art_key === props.object?.artKey)?.status));
const facingOptions = [{ label: '朝右', value: 'right' }, { label: '朝左', value: 'left' }, { label: '朝上', value: 'up' }, { label: '朝下', value: 'down' }];
const layerTypes = [{ label: '背景', value: 'background' }, { label: '远景', value: 'far' }, { label: '地面', value: 'ground' }, { label: '实体', value: 'entity' }, { label: '前景', value: 'foreground' }, { label: '叠加', value: 'overlay' }, { label: '阻挡区', value: 'collision' }];
</script>

<style scoped>
.inspector { min-width: 0; color: #d8e6e9; }.inspector header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-weight:700; letter-spacing:.04em; }.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }.references { display:grid; gap:6px; margin-top:12px; }.actions { margin-top:16px; }
</style>
