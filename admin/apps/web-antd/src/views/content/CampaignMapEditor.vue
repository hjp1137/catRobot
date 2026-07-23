<template>
  <section class="map-page">
    <header><a-button @click="router.back()">← 章节列表</a-button><div><small>CAMPAIGN MAP / MYSQL DRAFT</small><h1>{{ model.chapter.name || chapterId }}</h1></div><a-space><a-button @click="undo">撤销</a-button><a-button @click="redo">重做</a-button><a-button @click="toggleSource">{{ readonly?'返回草稿':'正式只读' }}</a-button><a-button type="primary" :disabled="readonly" @click="save">保存草稿</a-button></a-space></header>
    <a-alert v-if="readonly" message="正式只读：当前 R000007 未声明 Campaign Snapshot，显示旧入口回退，不读取 MySQL 草稿。" type="warning" show-icon />
    <a-alert v-if="conflict" type="error" show-icon :message="conflict" description="远端 rowVersion 已变化，本地保存已停止。"><template #action><a-button size="small" @click="reloadDraft">重新加载远端草稿</a-button></template></a-alert>
    <div class="toolbar"><a-button :disabled="readonly" @click="addNode">＋ 新建节点</a-button><a-button :disabled="readonly||!selectedNode" @click="beginConnect">↗ 新建连线</a-button><a-button danger :disabled="readonly||!selection" @click="removeSelected">删除所选</a-button><a-divider type="vertical"/><span>进度预览</span><a-select v-model:value="preset" :options="presets.map(value=>({value,label:value}))" style="width:190px"/><a-tag color="cyan">不写入真实玩家存档</a-tag></div>
    <main>
      <div class="canvas-shell">
        <svg class="map-canvas" :style="mapStyle" :viewBox="`0 0 ${model.chapter.canvasWidth||1000} ${model.chapter.canvasHeight||600}`" @click.self="selection=''">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#244150" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>
          <g v-for="edge in model.connections" :key="edge.id" :data-edge-id="edge.id" class="edge" :class="{selected:selection===edge.id}" @click.stop="selection=edge.id"><line :x1="node(edge.fromNodeId)?.x" :y1="node(edge.fromNodeId)?.y" :x2="node(edge.toNodeId)?.x" :y2="node(edge.toNodeId)?.y"/><circle :cx="node(edge.toNodeId)?.x" :cy="node(edge.toNodeId)?.y" r="5"/></g>
          <g v-for="item in model.nodes" :key="item.id" :data-node-id="item.id" class="node" :class="[state(item.id).toLowerCase(),{selected:selection===item.id}]" :transform="`translate(${item.x},${item.y})`" @click.stop="pickNode(item)" @pointerdown="dragStart($event,item)"><circle r="34"/><text text-anchor="middle" y="5">{{ item.isStart?'始':item.isEnd?'终':item.order }}</text><text class="name" text-anchor="middle" y="56">{{ item.name }}</text><text class="state" text-anchor="middle" y="74">{{ state(item.id) }}</text></g>
        </svg>
      </div>
      <aside><h3>属性面板</h3><template v-if="selectedNode">
        <section class="lock-detail"><div><b>当前预览状态</b><a-tag :color="selectedPreviewState==='LOCKED'?'orange':'cyan'">{{ selectedPreviewState }}</a-tag></div>
          <a-alert v-if="selectedPreviewState==='LOCKED'" message="锁定节点不可进入" description="预览模式只展示锁定原因，不会跳转到 Stage。" type="warning" show-icon/>
          <h4>完整锁定条件</h4><ul><li v-for="item in lockConditions" :key="item.id" :class="{ok:item.satisfied}">{{ item.satisfied?'✓':'○' }} 通关 {{ item.name }}（当前 {{ item.state }}）</li><li v-if="!lockConditions.length" class="ok">✓ 起始节点默认开放</li></ul>
          <a-button type="primary" block :disabled="selectedPreviewState==='LOCKED'" @click="previewEnter">进入节点</a-button>
        </section>
        <a-form layout="vertical" @change="record"><a-form-item label="节点名称"><a-input v-model:value="selectedNode.name"/></a-form-item><a-form-item label="关联 Stage"><a-select v-model:value="selectedNode.stageId" :options="stages.map(x=>({value:x.id,label:`${x.name} · ${x.mode==='explore'?'自由地图':'仅调试（固定屏）'}`,disabled:x.mode!=='explore'}))" show-search/></a-form-item><a-form-item label="节点类型"><a-select v-model:value="selectedNode.type" :options="nodeTypes"/></a-form-item><a-space><a-form-item label="精确 X"><a-input-number v-model:value="selectedNode.x"/></a-form-item><a-form-item label="精确 Y"><a-input-number v-model:value="selectedNode.y"/></a-form-item></a-space><a-form-item label="推荐战力"><a-input-number v-model:value="selectedNode.recommendedPower"/></a-form-item><a-form-item label="图标 Art Key"><ArtResourceField v-model="selectedNode.iconArtKey" label="节点图标" resource-type="icon"/></a-form-item><a-checkbox v-model:checked="selectedNode.isStart">起始节点</a-checkbox><a-checkbox v-model:checked="selectedNode.isEnd">终点节点</a-checkbox><p class="reference">Stage ID：{{ selectedNode.stageId }}<br/>当前引用状态：{{ stages.find(x=>x.id===selectedNode.stageId)?.mode==='explore'?'自由地图有效草稿引用':'固定屏仅调试，正式节点不可保存' }}</p></a-form>
      </template><template v-else-if="selectedEdge"><a-descriptions bordered :column="1" size="small"><a-descriptions-item label="起始节点">{{ node(selectedEdge.fromNodeId)?.name }}</a-descriptions-item><a-descriptions-item label="目标节点">{{ node(selectedEdge.toNodeId)?.name }}</a-descriptions-item><a-descriptions-item label="是否单向">{{ selectedEdge.oneWay?'是':'否' }}</a-descriptions-item><a-descriptions-item label="路径样式">{{ selectedEdge.pathType }}</a-descriptions-item><a-descriptions-item label="启用状态">{{ selectedEdge.enabled?'启用':'停用' }}</a-descriptions-item><a-descriptions-item label="当前解锁依赖关系">通关 {{ node(selectedEdge.fromNodeId)?.name }} 后解锁</a-descriptions-item></a-descriptions></template><template v-else><a-empty description="选择节点或连线"/></template></aside>
    </main>
  </section>
  <a-modal v-model:open="leaveOpen" title="未保存的地图修改" ok-text="放弃修改并离开" cancel-text="继续编辑" @ok="discardAndLeave">
    <p>存在未保存的章节地图修改，离开后本次调整不会写入远程 MySQL 草稿。</p>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { onBeforeRouteLeave,useRoute,useRouter } from 'vue-router';
import { contentApi } from '../../api/content';
import ArtResourceField from '../../components/art-resource/ArtResourceField.vue';
import { CampaignProgressPreview } from './campaign/CampaignProgressPreview';
const route=useRoute(),router=useRouter(),chapterId=String(route.params.chapterId);
const model=reactive<any>(blank()),stages=ref<any[]>([]),selection=ref(''),preset=ref('全部未通关'),readonly=ref(false),connecting=ref('');
const dirty=ref(false),conflict=ref(''),backgroundUrl=ref(''),leaveOpen=ref(false);
const history=ref<any[]>([]),future=ref<any[]>([]),draftBackup=ref<any>();
const pendingRoute=ref('');
const presets=['全部未通关','仅起点解锁','1-1已通关一星','1-1已通关三星','全部通关'];
const nodeTypes=[{value:'normal',label:'普通战斗'},{value:'boss',label:'Boss'},{value:'exploration',label:'探索'},{value:'story',label:'剧情'}];
const selectedNode=computed(()=>model.nodes.find((x:any)=>x.id===selection.value));
const selectedEdge=computed(()=>model.connections.find((x:any)=>x.id===selection.value));
const preview=computed(()=>new CampaignProgressPreview({chapters:[model]},preset.value));
const selectedPreviewState=computed(()=>selectedNode.value?preview.value.state(selectedNode.value.id):'LOCKED');
const lockConditions=computed(()=>model.connections.filter((edge:any)=>edge.enabled!==false&&edge.toNodeId===selectedNode.value?.id).map((edge:any)=>{const source=node(edge.fromNodeId);const sourceState=preview.value.state(edge.fromNodeId);return{id:edge.id,name:source?.name??edge.fromNodeId,state:sourceState,satisfied:['CLEARED','THREE_STAR'].includes(sourceState)};}));
const mapStyle=computed(()=>backgroundUrl.value?{backgroundImage:`linear-gradient(#06131a88,#06131a88),url(${backgroundUrl.value})`}:undefined);
function blank(){return{rowVersion:0,chapter:{name:'',canvasWidth:1000,canvasHeight:600,enabled:true},nodes:[],connections:[]};}
function copy<T>(value:T):T{return JSON.parse(JSON.stringify(value));}
function assign(value:any){Object.keys(model).forEach(key=>delete model[key]);Object.assign(model,copy(value));}
async function loadBackground(){const key=model.chapter.backgroundArtKey;if(!key){backgroundUrl.value='';return;}const resource=await contentApi.resource(key).catch(()=>undefined);backgroundUrl.value=resource?.originalUrl?await contentApi.resourceBlobUrl(resource.originalUrl).catch(()=>''):'';}
function snapshot(){history.value.push(copy(model));if(history.value.length>40)history.value.shift();future.value=[];dirty.value=true;}
function node(id:string){return model.nodes.find((x:any)=>x.id===id);}
function state(id:string){return preview.value.state(id);}
function previewEnter(){if(selectedPreviewState.value==='LOCKED')return;message.success(`预览可进入：${selectedNode.value?.name}`);}
function record(){if(!readonly.value)snapshot();}
function addNode(){snapshot();const order=model.nodes.length+1;model.nodes.push({id:`node_${Date.now()}`,stageId:stages.value[0]?.id??'',name:`关卡节点 ${order}`,x:160+order*90,y:300,type:'normal',isStart:order===1,isEnd:false,order,recommendedPower:0,enabled:true});}
function beginConnect(){connecting.value=selectedNode.value?.id??'';message.info('请选择目标节点');}
function pickNode(item:any){if(connecting.value&&connecting.value!==item.id){snapshot();model.connections.push({id:`path_${Date.now()}`,fromNodeId:connecting.value,toNodeId:item.id,pathType:'normal',oneWay:true,order:model.connections.length+1,enabled:true});connecting.value='';}selection.value=item.id;}
function removeSelected(){snapshot();model.nodes=model.nodes.filter((x:any)=>x.id!==selection.value);model.connections=model.connections.filter((x:any)=>x.id!==selection.value&&x.fromNodeId!==selection.value&&x.toNodeId!==selection.value);selection.value='';}
function undo(){const value=history.value.pop();if(!value)return;future.value.push(copy(model));assign(value);}
function redo(){const value=future.value.pop();if(!value)return;history.value.push(copy(model));assign(value);}
function dragStart(event:PointerEvent,item:any){if(readonly.value)return;snapshot();const svg=(event.currentTarget as SVGGElement).ownerSVGElement!;const move=(e:PointerEvent)=>{const rect=svg.getBoundingClientRect();item.x=Math.round((e.clientX-rect.left)*model.chapter.canvasWidth/rect.width/10)*10;item.y=Math.round((e.clientY-rect.top)*model.chapter.canvasHeight/rect.height/10)*10;};const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);}
async function save(){try{const saved=await contentApi.saveCampaignMap(chapterId,copy(model));assign(saved);history.value=[];dirty.value=false;conflict.value='';message.success('章节地图草稿已保存');}catch(error:any){if(error?.response?.status===409){conflict.value=`CONTENT_CONFLICT：本地 v${model.rowVersion} 与远端版本冲突`;return;}message.error(error?.response?.data?.message??'地图保存失败');}}
async function reloadDraft(){assign(await contentApi.campaignMap(chapterId));await loadBackground();dirty.value=false;conflict.value='';history.value=[];future.value=[];}
async function toggleSource(){if(!readonly.value){draftBackup.value=copy(model);const formal=await contentApi.publishedCampaigns();const chapter=formal.campaigns?.flatMap((x:any)=>x.chapters??[]).find((x:any)=>x.id===chapterId);assign(chapter?{rowVersion:0,chapter,nodes:chapter.nodes??[],connections:chapter.connections??[]}:blank());readonly.value=true;}else{assign(draftBackup.value);readonly.value=false;}await loadBackground();}
onMounted(async()=>{const [map,stageRows]=await Promise.all([contentApi.campaignMap(chapterId),contentApi.list('stages')]);assign(map);stages.value=stageRows;await loadBackground();});
async function discardAndLeave(){dirty.value=false;leaveOpen.value=false;const target=pendingRoute.value;pendingRoute.value='';if(target)await router.push(target);}
onBeforeRouteLeave(to=>{if(!dirty.value)return true;pendingRoute.value=to.fullPath;leaveOpen.value=true;return false;});
</script>

<style scoped>
.map-page{display:grid;gap:14px}.map-page>header{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center}.map-page h1{margin:2px 0;color:#f3fbff}.map-page small{color:#53d8c4;letter-spacing:2px}.toolbar{display:flex;gap:10px;align-items:center;padding:10px 14px;background:#102735;border:1px solid #315365}.map-page main{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:14px}.canvas-shell{height:640px;padding:12px;background:#07151e;border:1px solid #315365;overflow:hidden}.map-canvas{width:100%;height:100%;background:radial-gradient(circle at 30% 20%,#153447,#081821);background-size:cover;background-position:center}.edge line{stroke:#486d7e;stroke-width:5}.edge circle{fill:#eab04b}.edge.selected line{stroke:#5ff1da;stroke-width:8}.node{cursor:pointer}.node circle{fill:#173747;stroke:#6a91a3;stroke-width:4}.node text{fill:#eafcff;font-weight:700;pointer-events:none}.node .name{fill:#dbeaf1;font-size:16px}.node .state{fill:#87a6b5;font-size:10px}.node.unlocked circle{fill:#155b60;stroke:#59e0ca}.node.cleared circle{fill:#2b5368;stroke:#9bbdcb}.node.three_star circle{fill:#84611e;stroke:#ffd166}.node.newly_unlocked circle{fill:#7b3f1d;stroke:#ffae4a;filter:drop-shadow(0 0 12px #ff9d38)}.node.locked{opacity:.55}.node.selected circle{stroke:#fff;stroke-width:7}.map-page aside{padding:16px;background:#0d202d;border:1px solid #315365;overflow:auto}.map-page aside h3{color:#5ee1ce;border-bottom:1px solid #315365;padding-bottom:12px}.reference{padding:10px;color:#7edbcd;background:#102c38;border-left:3px solid #57dbc7}
.lock-detail{display:grid;gap:9px;margin-bottom:14px;padding:12px;background:#091923;border:1px solid #315365}.lock-detail>div{display:flex;align-items:center;justify-content:space-between}.lock-detail h4{margin:2px 0;color:#ffbd6b}.lock-detail ul{display:grid;gap:5px;margin:0;padding:0;list-style:none;color:#f0a164}.lock-detail li.ok{color:#65d7c2}
@media(max-width:1100px){.map-page main{grid-template-columns:1fr}.map-page>header{grid-template-columns:1fr}.canvas-shell{height:520px}}
</style>
