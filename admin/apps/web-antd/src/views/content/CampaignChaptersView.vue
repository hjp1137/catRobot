<template>
  <section class="chapters-page">
    <header><a-button @click="router.push('/content/campaigns')">← 战役列表</a-button><div><small>CHAPTER ROUTE</small><h1>{{ campaign?.name || campaignId }}</h1><p>章节目录与路线图入口</p></div><a-button type="primary" @click="edit()">新建章节</a-button></header>
    <div class="chapter-list">
      <article v-for="row in rows" :key="row.id">
        <div class="chapter-no">{{ String(row.chapterNo).padStart(2,'0') }}</div>
        <div class="chapter-copy"><a-tag :color="row.enabled?'cyan':'default'">{{ row.enabled?'启用':'停用' }}</a-tag><h2>{{ row.name }}</h2><p>{{ row.subtitle || row.description || '未填写章节说明' }}</p><div class="route-meta"><span>节点 {{ row.nodeCount }}</span><span>起始节点 {{ row.startNode || '未配置' }}</span><span>终点节点 {{ row.endNode || '未配置' }}</span></div></div>
        <a-space direction="vertical"><a-button type="primary" @click="router.push(`/content/chapters/${row.id}/map`)">编辑地图</a-button><a-button @click="edit(row)">编辑</a-button><a-button @click="clone(row)">复制</a-button><a-space><a-button :disabled="row===rows[0]" @click="move(row,-1)">上移</a-button><a-button :disabled="row===rows[rows.length-1]" @click="move(row,1)">下移</a-button></a-space><a-button @click="toggle(row)">{{ row.enabled?'停用':'启用' }}</a-button><a-popconfirm title="确认删除空章节？" @confirm="remove(row)"><a-button danger>删除</a-button></a-popconfirm></a-space>
      </article>
      <a-empty v-if="!rows.length" description="请新建第一章" />
    </div>
    <a-modal v-model:open="open" title="章节配置" ok-text="保存草稿" @ok="save">
      <a-form layout="vertical"><a-form-item label="ID"><a-input v-model:value="draft.id" :disabled="!!draft.rowVersion" /></a-form-item><a-form-item label="章节序号"><a-input-number v-model:value="draft.chapterNo" :min="1" /></a-form-item><a-form-item label="名称"><a-input v-model:value="draft.name" /></a-form-item><a-form-item label="副标题"><a-input v-model:value="draft.subtitle" /></a-form-item><a-form-item label="说明"><a-textarea v-model:value="draft.description" /></a-form-item><a-form-item label="背景 Art Key"><ArtResourceField v-model="draft.backgroundArtKey" label="章节背景" resource-type="background" /></a-form-item><a-form-item label="通关文案"><a-input v-model:value="draft.completionText" /></a-form-item></a-form>
    </a-modal>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { message } from 'ant-design-vue'; import { useRoute,useRouter } from 'vue-router';
import { contentApi } from '../../api/content'; import ArtResourceField from '../../components/art-resource/ArtResourceField.vue';
import { runCampaignMutation } from './campaignMutationErrors';
const route=useRoute(),router=useRouter(),campaignId=String(route.params.campaignId);const rows=ref<any[]>([]),campaign=ref<any>(),open=ref(false),draft=ref<any>(blank());
function blank(){return{id:'',chapterNo:rows.value.length+1,name:'',subtitle:'',description:'',backgroundArtKey:'',canvasWidth:1000,canvasHeight:600,viewportX:0,viewportY:0,enabled:true,completionText:''};}
async function load(){[campaign.value,rows.value]=await Promise.all([contentApi.campaign(campaignId),contentApi.campaignChapters(campaignId)]);}
function edit(row?:any){draft.value=row?copy(row):blank();open.value=true;}
const reportMutationError=(text:string)=>message.error(text);
async function save(){await runCampaignMutation(async()=>{if(draft.value.rowVersion)await contentApi.updateCampaignChapter(draft.value.id,draft.value);else await contentApi.createCampaignChapter(campaignId,draft.value);},reportMutationError,async()=>{message.success('章节草稿已保存');open.value=false;await load();});}
async function clone(row:any){await runCampaignMutation(()=>contentApi.cloneCampaignChapter(row.id,`${row.id}_copy_${Date.now()}`),reportMutationError,async()=>{message.success('章节已复制');await load();});}
async function move(row:any,delta:number){const current=rows.value.findIndex(item=>item.id===row.id),target=current+delta;if(target<0||target>=rows.value.length)return;const ordered=[...rows.value];[ordered[current],ordered[target]]=[ordered[target],ordered[current]];await runCampaignMutation(()=>contentApi.reorderCampaignChapters(campaignId,ordered.map((item,index)=>({id:item.id,rowVersion:item.rowVersion,chapterNo:index+1}))),reportMutationError,load);}
async function toggle(row:any){await runCampaignMutation(()=>contentApi.enableCampaignChapter(row.id,!row.enabled,row.rowVersion),reportMutationError,load);}
async function remove(row:any){await runCampaignMutation(()=>contentApi.removeCampaignChapter(row.id,row.rowVersion),reportMutationError,async()=>{message.success('章节已删除');await load();});}onMounted(load);
function copy<T>(value:T):T{return JSON.parse(JSON.stringify(value));}
</script>

<style scoped>
.chapters-page{display:grid;gap:18px}.chapters-page>header{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center}.chapters-page h1{margin:2px 0;font-size:28px}.chapters-page small{color:#edb34e;letter-spacing:2px}.chapter-list{display:grid;gap:14px}.chapter-list article{display:grid;grid-template-columns:92px 1fr auto;gap:20px;align-items:center;padding:20px;background:#0d202d;border:1px solid #315164;border-left:4px solid #eeb44c}.chapter-no{font-size:46px;font-weight:800;color:#284b5d}.chapter-copy h2{margin:8px 0 3px;color:#f2fbff}.chapter-copy p{color:#8ca6b5}.route-meta{display:flex;gap:18px;color:#66d5c4}
</style>
