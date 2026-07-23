<template>
  <section class="preview-panel" data-testid="preview-panel">
    <header><div><small>战斗预览状态</small><strong :class="snapshot.state">{{ snapshot.state }}</strong></div><a-radio-group :value="snapshot.speed" button-style="solid" @change="$emit('speed', $event.target.value)"><a-radio-button :value="1">1×</a-radio-button><a-radio-button :value="2">2×</a-radio-button><a-radio-button :value="4">4×</a-radio-button></a-radio-group></header>
    <div v-if="!publishedFallback" class="telemetry">
      <span><small>当前波次</small>{{ snapshot.waveIndex < 0 ? '-' : snapshot.waveIndex + 1 }}</span><span><small>波次名称</small>{{ snapshot.waveName }}</span>
      <span><small>已生成</small>{{ snapshot.spawned }}</span><span><small>存活</small>{{ snapshot.alive }}</span><span><small>剩余</small>{{ snapshot.remaining }}</span>
      <span><small>下一波倒计时</small>{{ snapshot.waitMs }} ms</span><span><small>当前生成条目</small>{{ snapshot.currentEntry }}</span><span><small>当前速度</small>{{ snapshot.speed }}×</span>
    </div>
    <a-space v-if="!publishedFallback" wrap class="controls">
      <a-button type="primary" :disabled="snapshot.state !== 'READY'" @click="$emit('start')">开始</a-button>
      <a-button :disabled="!['PREPARING','WAVE_RUNNING','WAVE_CLEAR'].includes(snapshot.state)" @click="$emit('pause')">暂停</a-button>
      <a-button :disabled="snapshot.state !== 'PAUSED'" @click="$emit('resume')">恢复</a-button>
      <a-button @click="$emit('reset')">重置</a-button><a-button @click="$emit('defeat-one')">击败一个敌人</a-button>
      <a-button @click="$emit('defeat-wave')">击败当前波全部敌人</a-button><a-button @click="$emit('skip')">跳过等待 / 下一波</a-button>
      <a-button danger @click="$emit('hero-dead')">模拟主角死亡</a-button>
    </a-space>
    <div v-if="snapshot.settlement && !publishedFallback" class="settlement"><b>仅模拟 · {{ snapshot.settlement.victory ? `${snapshot.settlement.stars} 星胜利` : '失败结算' }}</b><span v-for="item in snapshot.settlement.objectives" :key="item.id">{{ item.completed ? '✓' : '○' }} {{ item.text }}</span><span>奖励：{{ snapshot.settlement.rewards.join('、') || '无' }}</span><span>解锁：{{ snapshot.settlement.unlocks.join('、') || '无' }}</span><small>不写入玩家正式存档，不发放真实奖励</small></div>
    <a-alert v-if="publishedFallback" type="warning" show-icon message="LEGACY_FALLBACK"
      description="当前正式版本：R000007；当前版本未启用关卡编排；运行时继续使用旧关卡逻辑；无可供本编辑器模拟的正式波次数据。" />
  </section>
</template>

<script setup lang="ts">
import type { PreviewSnapshot } from './StagePreviewSimulator';
defineProps<{ snapshot: PreviewSnapshot; publishedFallback?: boolean }>();
defineEmits<{ start: []; pause: []; resume: []; reset: []; 'defeat-one': []; 'defeat-wave': []; skip: []; 'hero-dead': []; speed: [value: number] }>();
</script>

<style scoped>
.preview-panel { padding:14px 16px; background:linear-gradient(135deg,#0d1c28,#101a23); border:1px solid #2d4858; }.preview-panel header { display:flex; justify-content:space-between; align-items:center; }.preview-panel header small,.telemetry small { display:block; color:#7193a0; font-size:10px; text-transform:uppercase; }.preview-panel strong { display:block; margin-top:2px; color:#55e0ca; font:800 22px Consolas,monospace; }.preview-panel strong.STAGE_CLEAR { color:#ffd15c; }.preview-panel strong.STAGE_FAILED { color:#ff6974; }.preview-panel strong.PAUSED { color:#8ca4ff; }.telemetry { display:grid; grid-template-columns:repeat(8,minmax(80px,1fr)); gap:8px; margin:12px 0; }.telemetry span { padding:8px; color:#e6f2f4; background:#07121aaa; border-bottom:2px solid #2a6570; }.controls { margin-bottom:12px; }
.settlement{display:grid;gap:5px;padding:12px;color:#bad1d7;background:#071219;border:1px solid #355466}.settlement b{color:#ffd15c}.settlement small{color:#ffae68}
@media(max-width:1500px){.telemetry{grid-template-columns:repeat(4,1fr)}}
</style>
