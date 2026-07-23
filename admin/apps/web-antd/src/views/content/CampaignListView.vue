<template>
  <section class="campaign-page">
    <header><div><small>CAMPAIGN CONTROL</small><h1>主线战役</h1><p>MySQL 草稿配置，不会进入当前正式版本。</p></div><a-button type="primary" @click="edit()">新建战役</a-button></header>
    <a-alert message="正式小游戏仍使用 R000007；本页变更仅标记草稿脏状态。" type="warning" show-icon />
    <div class="campaign-grid">
      <article v-for="row in rows" :key="row.id" class="campaign-card">
        <div class="status"><a-tag :color="row.enabled?'cyan':'default'">{{ row.enabled?'启用':'停用' }}</a-tag><span>v{{ row.contentVersion }}</span></div>
        <h2>{{ row.name }}</h2><p>{{ row.subtitle || '尚未填写副标题' }}</p>
        <dl><div><dt>章节</dt><dd>{{ row.chapterCount }}</dd></div><div><dt>节点</dt><dd>{{ row.nodeCount }}</dd></div><div><dt>状态</dt><dd>草稿待发布</dd></div></dl>
        <a-space wrap><a-button @click="edit(row)">编辑</a-button><a-button @click="clone(row)">复制</a-button><a-button type="primary" @click="router.push(`/content/campaigns/${row.id}/chapters`)">章节管理</a-button><a-button @click="toggle(row)">{{ row.enabled?'停用':'启用' }}</a-button><a-popconfirm title="确认删除？" @confirm="remove(row)"><a-button danger>删除</a-button></a-popconfirm></a-space>
      </article>
      <a-empty v-if="!rows.length" description="尚无战役草稿" />
    </div>
    <a-drawer v-model:open="open" title="战役配置" width="520" @close="draft=blank()">
      <a-form layout="vertical"><a-form-item label="ID"><a-input v-model:value="draft.id" :disabled="!!draft.rowVersion" /></a-form-item><a-form-item label="名称"><a-input v-model:value="draft.name" /></a-form-item><a-form-item label="副标题"><a-input v-model:value="draft.subtitle" /></a-form-item><a-form-item label="说明"><a-textarea v-model:value="draft.description" /></a-form-item><a-form-item label="封面 Art Key"><ArtResourceField v-model="draft.coverArtKey" label="战役封面" resource-type="campaign" /></a-form-item><a-form-item label="排序"><a-input-number v-model:value="draft.order" /></a-form-item><a-switch v-model:checked="draft.enabled" checked-children="启用" un-checked-children="停用" /></a-form>
      <template #extra><a-button type="primary" @click="save">保存草稿</a-button></template>
    </a-drawer>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { contentApi } from '../../api/content';
import ArtResourceField from '../../components/art-resource/ArtResourceField.vue';
import { runCampaignMutation } from './campaignMutationErrors';
const router=useRouter(); const rows=ref<any[]>([]); const open=ref(false); const draft=ref<any>(blank());
function blank(){return{id:'',name:'',subtitle:'',description:'',coverArtKey:'',order:0,enabled:true,schemaVersion:1,contentVersion:1};}
async function load(){rows.value=await contentApi.campaigns();}
function edit(row?:any){draft.value=row?copy(row):blank();open.value=true;}
const reportMutationError=(text:string)=>message.error(text);
async function save(){await runCampaignMutation(()=>contentApi.saveCampaign(draft.value),reportMutationError,async()=>{message.success('战役草稿已保存');open.value=false;await load();});}
async function clone(row:any){await runCampaignMutation(()=>contentApi.cloneCampaign(row.id,`${row.id}_copy`),reportMutationError,async()=>{message.success('战役已复制');await load();});}
async function toggle(row:any){await runCampaignMutation(()=>contentApi.enableCampaign(row.id,!row.enabled,row.rowVersion),reportMutationError,load);}
async function remove(row:any){await runCampaignMutation(()=>contentApi.removeCampaign(row.id,row.rowVersion),reportMutationError,async()=>{message.success('战役已删除');await load();});}
onMounted(load);
function copy<T>(value:T):T{return JSON.parse(JSON.stringify(value));}
</script>

<style scoped>
.campaign-page{display:grid;gap:18px}.campaign-page>header{display:flex;justify-content:space-between;align-items:end}.campaign-page h1{font-size:30px;margin:4px 0}.campaign-page small{color:#39d0bd;letter-spacing:2px}.campaign-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:16px}.campaign-card{padding:20px;background:linear-gradient(145deg,#0e2130,#132c3a);border:1px solid #315366;border-radius:4px;box-shadow:0 12px 30px #00101855}.campaign-card h2{color:#eafcff;margin:12px 0 4px}.campaign-card p{color:#8ea9b8}.status{display:flex;justify-content:space-between;color:#6f8997}.campaign-card dl{display:flex;gap:28px;padding:12px 0;border-top:1px solid #284656}.campaign-card dl div{display:grid}.campaign-card dt{color:#7893a1}.campaign-card dd{margin:0;color:#fff;font-size:18px}
</style>
