<template>
  <section class="tutorial-preview" :data-state="snapshot.state">
    <header><div><small>PLAYER STATE LAB</small><h3>引导预演舱</h3></div><a-tag color="cyan">{{ sourceLabel }}</a-tag></header>
    <div class="scenario-row">
      <a-select :value="scenario" style="width:180px" @change="$emit('scenario', $event)">
        <a-select-option value="fresh">全新玩家</a-select-option>
        <a-select-option value="progressed">已完成前3步</a-select-option>
        <a-select-option value="interrupted">战斗中断恢复</a-select-option>
        <a-select-option value="cleared">已通关1-1</a-select-option>
        <a-select-option value="completed">已完成全部引导</a-select-option>
        <a-select-option value="skipped">已跳过引导</a-select-option>
      </a-select>
      <span>模拟态 · 不写入真实玩家存档</span>
    </div>
    <div class="device">
      <div class="scene"><b>第一章 · 废料边境</b><i>1-1</i><i>1-2</i><i>1-3</i></div>
      <div v-if="snapshot.highlightedTargetId" class="spotlight"></div>
      <div v-if="snapshot.state==='SHOWING'" class="guide-card">
        <em>STEP {{ snapshot.index + 1 }}/{{ snapshot.total }}</em><h4>{{ snapshot.title }}</h4><p>{{ snapshot.body }}</p><strong>↑</strong>
      </div>
      <div v-else-if="snapshot.state==='MISSING_TARGET'" class="missing"><b>Missing 目标</b><span>{{ snapshot.stepId }}</span><small>执行备用目标 / {{ snapshot.fallback }}</small></div>
      <div v-else-if="snapshot.state==='COMPLETED'" class="completed">FLOW COMPLETED<br><small>输入限制与高亮已清理</small></div>
      <div v-else class="standby">等待预览</div>
    </div>
    <footer><a-button @click="$emit('single')">单步预览</a-button><a-button type="primary" @click="$emit('full')">完整 Flow 预览</a-button><a-button @click="$emit('missing')">模拟 Missing 回退</a-button><a-button @click="$emit('next')">下一步</a-button><a-popconfirm title="再次确认跳过本次预览？" @confirm="$emit('skip')"><a-button danger>跳过</a-button></a-popconfirm></footer>
  </section>
</template>

<script setup lang="ts">
defineProps<{ snapshot: any; scenario: string; sourceLabel: string }>();
defineEmits(['scenario', 'single', 'full', 'missing', 'next', 'skip']);
</script>

<style scoped>
.tutorial-preview{padding:16px;background:#09151e;border:1px solid #284757;box-shadow:0 16px 40px #0007;color:#dcebed}.tutorial-preview header,.scenario-row,.tutorial-preview footer{display:flex;align-items:center;justify-content:space-between;gap:10px}.tutorial-preview h3{margin:2px 0;font-size:18px}.tutorial-preview small,.scenario-row span{color:#70a1ad;font:10px Consolas,monospace}.scenario-row{margin:12px 0}.device{position:relative;min-height:300px;overflow:hidden;background:radial-gradient(circle at 70% 20%,#315e58 0,#17302e 23%,#0b1b25 65%);border:1px solid #41616d}.scene{display:flex;gap:12px;padding:20px;color:#92b5b8}.scene i{display:grid;width:42px;height:42px;place-items:center;background:#183944;border:1px solid #66c8b5;border-radius:50%;font-style:normal}.spotlight{position:absolute;inset:0;background:radial-gradient(circle at 68% 28%,transparent 0 40px,#02080bd9 44px);animation:pulse 1.6s infinite}.guide-card{position:absolute;right:18px;bottom:20px;width:250px;padding:14px;background:#f3e8ca;color:#17242a;border-left:4px solid #f6a742;box-shadow:0 12px 30px #0008}.guide-card em{color:#a46316;font:10px Consolas,monospace}.guide-card h4{margin:4px 0}.guide-card p{margin:0}.guide-card strong{position:absolute;right:30px;top:-38px;color:#ffd56a;font-size:34px}.missing,.completed,.standby{position:absolute;inset:0;display:grid;place-content:center;gap:8px;text-align:center}.missing{color:#ffbd70;background:#140c09cc}.completed{color:#6de0c8;font:700 17px Consolas,monospace}.standby{color:#607f89}.tutorial-preview footer{justify-content:flex-start;margin-top:12px}@keyframes pulse{50%{filter:brightness(1.15)}}
</style>
