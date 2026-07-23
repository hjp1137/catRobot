<template>
  <section class="tutorial-list">
    <header><div><small>TUTORIAL CONTROL</small><h1>新手引导</h1><p>MySQL 草稿编排与正式 Tutorial Snapshot 分区管理。</p></div><a-button type="primary" @click="createOpen=true">新建 Flow</a-button></header>
    <a-alert :message="releaseMessage" type="warning" show-icon />
    <div class="filters"><a-input-search v-model:value="query" placeholder="搜索 Flow" allow-clear/><a-select v-model:value="enabledFilter"><a-select-option value="all">全部状态</a-select-option><a-select-option value="enabled">仅启用</a-select-option><a-select-option value="disabled">仅停用</a-select-option></a-select><span>删除引用保护已启用</span></div>
    <div class="flow-grid">
      <article v-for="row in filtered" :key="row.id"><div class="rail"></div><div class="status"><a-tag :color="row.enabled?'cyan':'default'">{{ row.enabled?'启用':'停用' }}</a-tag><b>草稿待发布</b></div><h2>{{ row.name }}</h2><code>{{ row.id }}</code><p>{{ row.description || '尚未填写流程说明' }}</p>
        <dl><div><dt>步骤</dt><dd>{{ row.stepCount }}</dd></div><div><dt>起始条件</dt><dd>{{ conditionLabel(row) }}</dd></div><div><dt>可跳过</dt><dd>{{ row.skippable?'是':'否' }}</dd></div><div><dt>更新</dt><dd>{{ date(row.updatedAt) }}</dd></div></dl>
        <a-space wrap><a-button type="primary" @click="router.push(`/content/tutorials/${row.id}/editor`)">编辑</a-button><a-button @click="clone(row)">复制</a-button><a-button @click="toggle(row)">{{ row.enabled?'停用':'启用' }}</a-button><a-popconfirm title="删除前将检查步骤与功能规则引用。" @confirm="remove(row)"><a-button danger>删除</a-button></a-popconfirm></a-space>
      </article><a-empty v-if="!filtered.length" description="没有匹配的 Flow" />
    </div>
    <a-drawer v-model:open="createOpen" title="创建引导 Flow" width="500"><a-form layout="vertical"><a-form-item label="Flow ID"><a-input v-model:value="draft.id" placeholder="tutorial.flow.id"/></a-form-item><a-form-item label="名称"><a-input v-model:value="draft.name"/></a-form-item><a-form-item label="说明"><a-textarea v-model:value="draft.description"/></a-form-item><a-form-item label="可跳过"><a-switch v-model:checked="draft.skippable"/></a-form-item><a-form-item label="允许教学重放"><a-switch v-model:checked="draft.allowReplay"/></a-form-item></a-form><template #extra><a-button type="primary" @click="createFlow">创建并编辑</a-button></template></a-drawer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { contentApi } from '../../api/content';
const router=useRouter(); const rows=ref<any[]>([]); const query=ref(''); const enabledFilter=ref('all'); const createOpen=ref(false); const published=ref<any>(); const draft=ref(blank());
const filtered=computed(()=>rows.value.filter(row=>(!query.value||`${row.name} ${row.id}`.toLowerCase().includes(query.value.toLowerCase()))&&(enabledFilter.value==='all'||row.enabled===(enabledFilter.value==='enabled'))));
const releaseMessage=computed(()=>published.value?.mode==='LEGACY_FALLBACK'?`R000007 · LEGACY_FALLBACK：当前正式版本未启用新手引导`:`正式引导：${published.value?.releaseVersion??'读取中'}`);
function blank(){return{id:'',name:'',description:'',campaignId:null,startStepId:null,endStepId:null,startCondition:{type:'app-first-launch'},audience:{newPlayer:true},playerCondition:{},skipUnlockFeatures:['feature.campaign'],skippable:true,allowReplay:true,priority:0,enabled:false,schemaVersion:1,contentVersion:1};}
async function load(){[rows.value,published.value]=await Promise.all([contentApi.tutorialFlows(),contentApi.publishedTutorial()]);}
async function createFlow(){try{const created=await contentApi.createTutorialFlow(draft.value);message.success('Flow 草稿已创建');createOpen.value=false;draft.value=blank();await router.push(`/content/tutorials/${created.id}/editor`);}catch(error:any){fail(error);}}
async function clone(row:any){try{const source=await contentApi.tutorialFlow(row.id);const suffix=`copy${Date.now()}`;const id=`${row.id}.${suffix}`;const created=await contentApi.createTutorialFlow({...source.flow,id,name:`${row.name} 副本`,startStepId:null,endStepId:null,enabled:false,rowVersion:undefined});const ids=Object.fromEntries(source.steps.map((step:any)=>[step.id,`${step.id}.${suffix}`]));const steps=source.steps.map((step:any)=>({...step,id:ids[step.id],flowId:id,nextStepId:ids[step.nextStepId]??null,skipStepId:ids[step.skipStepId]??null,rowVersion:0}));const transitions=source.transitions.map((item:any,index:number)=>({...item,id:`${item.id}.${suffix}`,flowId:id,fromStepId:ids[item.fromStepId],toStepId:ids[item.toStepId],rowVersion:0,order:index}));await contentApi.saveTutorialOrchestration(id,{flow:{...created,startStepId:ids[source.flow.startStepId]??steps[0]?.id,endStepId:ids[source.flow.endStepId]??steps.at(-1)?.id},steps,transitions,unlockRules:source.unlockRules.map((rule:any,index:number)=>({...rule,id:`${rule.id}.${suffix}`,flowId:id,stepId:ids[rule.stepId]??null,rowVersion:0,order:index}))});message.success('Flow 已复制');await load();}catch(error:any){fail(error);}}
async function toggle(row:any){try{await contentApi.saveTutorialFlow(row.id,{...row,enabled:!row.enabled});await load();}catch(error:any){fail(error);}}
async function remove(row:any){try{await contentApi.removeTutorialFlow(row.id,row.rowVersion);message.success('Flow 已删除');await load();}catch(error:any){const data=error?.response?.data;if(data?.code==='CONTENT_REFERENCE_EXISTS')return message.error('CONTENT_REFERENCE_EXISTS：存在步骤或功能规则引用，无法删除');fail(error);}}
function fail(error:any){message.error(error?.response?.data?.message??error?.response?.data?.code??'操作失败');} function conditionLabel(row:any){return row.startCondition?.type??Object.keys(row.startCondition??{})[0]??'未设置';} function date(value:string){return value?new Date(value).toLocaleString('zh-CN'):'-';}
onMounted(load);
</script>

<style scoped>
.tutorial-list{display:grid;gap:18px;color:#dcebed}.tutorial-list>header{display:flex;align-items:end;justify-content:space-between;padding:18px 2px;border-bottom:1px solid #294858}.tutorial-list h1{margin:4px 0;font-size:30px}.tutorial-list small{color:#55d9c6;font:700 10px Consolas,monospace;letter-spacing:.22em}.tutorial-list p{color:#7ea0ad}.filters{display:grid;grid-template-columns:minmax(240px,420px) 150px 1fr;gap:10px;align-items:center}.filters span{justify-self:end;color:#7096a3}.flow-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(390px,1fr));gap:15px}.flow-grid article{position:relative;overflow:hidden;padding:20px 20px 18px 25px;background:linear-gradient(145deg,#0b1c28,#112c38);border:1px solid #315363;box-shadow:0 14px 32px #00101855}.rail{position:absolute;inset:0 auto 0 0;width:5px;background:linear-gradient(#5ae1c8,#2d6478)}.status{display:flex;justify-content:space-between}.status b{color:#ffbd69;font:11px Consolas,monospace}.flow-grid h2{margin:12px 0 2px;color:#f0fbfa}.flow-grid code{color:#58b9c6}.flow-grid dl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 0;border-top:1px solid #284654}.flow-grid dt{color:#7094a1;font-size:11px}.flow-grid dd{margin:3px 0;color:#fff;word-break:break-word}.tutorial-list :deep(.ant-empty-description){color:#7898a4}
</style>
