<template>
  <section class="wave-editor" data-testid="wave-editor">
    <header><div><b>波次与生成条目</b><small>{{ waves.length }} 波 / {{ entryCount }} 条目</small></div><a-button type="primary" ghost @click="addWave">新增波次</a-button></header>
    <a-collapse accordion>
      <a-collapse-panel v-for="(wave, wi) in waves" :key="wave.id" :header="`${wave.order}. ${wave.name}`">
        <div class="wave-fields">
          <label>名称<a-input v-model:value="wave.name" @change="changed" /></label>
          <label>开始条件<a-select v-model:value="wave.startTrigger.type" :options="triggerOptions" @change="changed" /></label>
          <label>开始延迟 ms<a-input-number v-model:value="wave.startDelayMs" :min="0" @change="changed" /></label>
          <label>同时存活上限<a-input-number v-model:value="wave.maxAlive" :min="1" @change="changed" /></label>
          <label>完成延迟 ms<a-input-number v-model:value="wave.completionDelayMs" :min="0" @change="changed" /></label>
          <label>完成条件<a-select v-model:value="wave.completionRule.type" :options="completionOptions" @change="changed" /></label>
        </div>
        <a-space class="wave-actions"><a-button size="small" :disabled="wi === 0" @click="move(wi,-1)">上移</a-button><a-button size="small" :disabled="wi === waves.length-1" @click="move(wi,1)">下移</a-button><a-button size="small" @click="copyWave(wi)">复制波次</a-button><a-button size="small" danger @click="removeWave(wi)">删除</a-button><a-checkbox v-model:checked="wave.enabled" @change="changed">启用</a-checkbox></a-space>
        <div v-for="(entry, ei) in wave.entries" :key="entry.id" class="entry-card">
          <div class="entry-head"><b>条目 {{ ei + 1 }}</b><a-space><a-button size="small" :disabled="ei===0" @click="moveEntry(wave,ei,-1)">↑</a-button><a-button size="small" :disabled="ei===wave.entries.length-1" @click="moveEntry(wave,ei,1)">↓</a-button><a-button size="small" danger @click="wave.entries.splice(ei,1); changed()">删除</a-button></a-space></div>
          <div class="entry-fields">
            <label>敌人模板<a-select v-model:value="entry.enemyTemplateId" show-search :options="enemyOptions" @change="changed" /></label>
            <label>出生点<a-select v-model:value="entry.spawnPointId" :options="spawnOptions" @change="changed" /></label>
            <label>数量<a-input-number v-model:value="entry.count" :min="1" @change="changed" /></label>
            <label>初始延迟<a-input-number v-model:value="entry.initialDelayMs" :min="0" @change="changed" /></label>
            <label>生成间隔<a-input-number v-model:value="entry.spawnIntervalMs" :min="0" @change="changed" /></label>
            <label>强度倍率<a-input-number v-model:value="entry.levelMultiplier" :min="0.1" :step="0.1" @change="changed" /></label>
            <label>血量倍率<a-input-number v-model:value="entry.hpMultiplier" :min="0.1" :step="0.1" @change="changed" /></label>
            <label>攻击倍率<a-input-number v-model:value="entry.attackMultiplier" :min="0.1" :step="0.1" @change="changed" /></label>
          </div>
          <a-checkbox v-model:checked="entry.elite" @change="changed">精英</a-checkbox><a-checkbox v-model:checked="entry.enabled" @change="changed">启用</a-checkbox>
        </div>
        <a-button block @click="addEntry(wave)">新增生成条目</a-button>
      </a-collapse-panel>
    </a-collapse>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ waves: any[]; spawnPoints: any[]; enemies: any[] }>();
const emit = defineEmits<{ change: [] }>();
const entryCount = computed(() => props.waves.reduce((sum, wave) => sum + wave.entries.length, 0));
const enemyOptions = computed(() => props.enemies.map(item => ({ label: `${item.name} · ${item.id}`, value: item.id })));
const spawnOptions = computed(() => props.spawnPoints.filter(item => item.type === 'enemy').map(item => ({ label: item.name, value: item.id })));
const triggerOptions = [{ label: '关卡开始', value: 'stage-start' }, { label: '上一波清场', value: 'previous-wave-cleared' }];
const completionOptions = [{ label: '全部敌人清除', value: 'all-enemies-cleared' }];
function changed() { normalize(); emit('change'); }
function normalize() { props.waves.forEach((wave, index) => { wave.order = index + 1; }); }
function move(index: number, delta: number) { const next = index + delta; [props.waves[index], props.waves[next]] = [props.waves[next], props.waves[index]]; changed(); }
function moveEntry(wave: any, index: number, delta: number) { const next = index + delta; [wave.entries[index], wave.entries[next]] = [wave.entries[next], wave.entries[index]]; changed(); }
function copyWave(index: number) { const copy = JSON.parse(JSON.stringify(props.waves[index])); copy.id = `wave_${Date.now()}`; copy.name += ' 副本'; copy.entries.forEach((x: any) => x.id = `entry_${Date.now()}_${Math.random().toString(36).slice(2,5)}`); props.waves.splice(index + 1, 0, copy); changed(); }
function removeWave(index: number) { props.waves.splice(index, 1); changed(); }
function addWave() { props.waves.push({ id: `wave_${Date.now()}`, order: props.waves.length + 1, name: `第${props.waves.length + 1}波`, startTrigger: { type: props.waves.length ? 'previous-wave-cleared' : 'stage-start' }, startDelayMs: 0, maxAlive: 4, completionRule: { type: 'all-enemies-cleared' }, completionDelayMs: 500, enabled: true, entries: [] }); changed(); }
function addEntry(wave: any) { wave.entries.push({ id: `entry_${Date.now()}`, enemyTemplateId: props.enemies[0]?.id, spawnPointId: props.spawnPoints.find(x => x.type === 'enemy')?.id, count: 1, initialDelayMs: 0, spawnIntervalMs: 500, elite: false, levelMultiplier: 1, hpMultiplier: 1, attackMultiplier: 1, enabled: true }); changed(); }
</script>

<style scoped>
.wave-editor { min-width:0; padding:16px; background:#0a151f; border:1px solid #263d4d; }.wave-editor header,.entry-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }.wave-editor header { margin-bottom:12px; }.wave-editor header small { display:block; color:#6f98aa; }.wave-fields,.entry-fields { display:grid; grid-template-columns:repeat(6,minmax(130px,1fr)); gap:10px; }.entry-fields { grid-template-columns:repeat(4,minmax(150px,1fr)); }.wave-fields label,.entry-fields label { display:grid; gap:4px; min-width:0; color:#8eb0bd; font-size:12px; }.wave-actions { margin:12px 0; }.entry-card { margin:10px 0; padding:12px; background:#101f2a; border-left:3px solid #ff9b4a; }.entry-head { margin-bottom:10px; }
@media (max-width:1500px) { .wave-fields { grid-template-columns:repeat(3,minmax(130px,1fr)); }.entry-fields { grid-template-columns:repeat(3,minmax(140px,1fr)); } }
</style>
