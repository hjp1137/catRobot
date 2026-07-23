<template>
  <section class="progression-editor" :class="{ readonly }" @change="emit('change')"><header><div><small>STAGE PROGRESSION</small><h2>目标与奖励</h2></div><a-tag color="orange">{{ readonly ? '正式只读' : 'MySQL 草稿' }}</a-tag></header>
    <a-tabs>
      <a-tab-pane key="objectives" tab="关卡目标">
        <div v-for="(item,index) in model.objectives" :key="item.id" class="row-card">
          <a-space wrap><a-input v-model:value="item.name" placeholder="目标名称"/><a-select v-model:value="item.type" :options="objectiveTypes"/><a-switch v-model:checked="item.required" checked-children="必需" un-checked-children="附加"/><a-switch v-model:checked="item.starEligible" checked-children="计星" un-checked-children="不计星"/></a-space>
          <a-space wrap><a-input v-model:value="item.displayText" placeholder="显示文案"/><a-input-number v-if="paramKey(item.type)" v-model:value="item.params[paramKey(item.type)]" :min="0"/><a-input-number v-model:value="item.order" :min="0"/><a-tag v-if="objectiveReferenced(item.id)" color="orange">奖励引用中</a-tag><a-button danger :disabled="readonly||objectiveReferenced(item.id)" @click="remove(model.objectives,index)">删除</a-button></a-space>
        </div><a-button :disabled="readonly" @click="addObjective">＋ 新增目标</a-button>
      </a-tab-pane>
      <a-tab-pane key="rewards" tab="奖励配置">
        <div v-for="(pool,poolIndex) in model.rewardPools" :key="pool.id" class="row-card">
          <a-space wrap><a-input v-model:value="pool.name"/><a-select v-model:value="pool.group" :options="rewardGroups"/><a-select v-if="pool.group==='objective-bonus'" v-model:value="pool.objectiveId" :options="objectiveOptions" placeholder="关联目标"/><a-button danger :disabled="readonly" @click="remove(model.rewardPools,poolIndex)">删除奖励池</a-button></a-space>
          <div v-for="(entry,index) in pool.entries" :key="entry.id" class="reward-row"><ArtResourceThumb small :art-key="rewardIconArtKey(entry)"/><a-select :value="rewardKey(entry)" show-search :options="catalogOptions" @change="selectReward(entry,$event)"/><a-input-number v-model:value="entry.minQuantity" :min="1"/><span>—</span><a-input-number v-model:value="entry.maxQuantity" :min="entry.minQuantity"/><a-input-number v-model:value="entry.probability" :min="0" :max="1" :step="0.1"/><a-tag :color="catalogEntry(entry) ? 'green' : 'red'">{{ catalogEntry(entry) ? '引用有效' : 'Missing / Invalid' }}</a-tag><a-button danger :disabled="readonly" @click="remove(pool.entries,index)">删除</a-button></div>
          <a-button :disabled="readonly" @click="addReward(pool)">＋ 奖励条目</a-button>
        </div><a-button :disabled="readonly" @click="addPool">＋ 奖励池</a-button>
      </a-tab-pane>
      <a-tab-pane key="unlocks" tab="解锁配置">
        <a-form layout="inline"><a-form-item label="推荐战力"><a-input-number v-model:value="model.recommendedPower" :min="0" :disabled="readonly"/></a-form-item></a-form>
        <div v-for="(rule,index) in model.unlockRules" :key="rule.id" class="row-card"><a-space wrap><a-select v-model:value="rule.type" :options="unlockTypes"/><a-select v-model:value="rule.prerequisiteStageId" :options="stageOptions" placeholder="前置关卡"/><a-input-number v-model:value="rule.requiredStars" :min="0" :max="3"/><a-select v-model:value="rule.nextStageId" :options="stageOptions" placeholder="下一关"/><a-button danger :disabled="readonly" @click="remove(model.unlockRules,index)">删除</a-button></a-space></div><a-button :disabled="readonly" @click="addRule">＋ 解锁规则</a-button>
      </a-tab-pane>
    </a-tabs>
    <a-alert type="info" show-icon message="结算预览仅模拟" description="不写入玩家正式存档，不发放真实奖励。"/>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import ArtResourceThumb from '../../../components/art-resource/ArtResourceThumb.vue';
const props = defineProps<{ model:any; catalog:any[]; stages:any[]; readonly:boolean }>(); const emit = defineEmits<{ change:[] }>();
const objectiveTypes = ['clear-all-waves','survive-duration','hero-health-above','complete-within-duration','defeat-enemy-count'].map(value=>({value,label:value}));
const rewardGroups = ['first-clear','repeat-clear','first-three-star','objective-bonus'].map(value=>({value,label:value}));
const unlockTypes = ['default-unlocked','prerequisite-clear','prerequisite-stars'].map(value=>({value,label:value}));
const objectiveOptions = computed(()=>props.model.objectives.map((x:any)=>({value:x.id,label:x.name})));
const stageOptions = computed(()=>props.stages.map((x:any)=>({value:x.id,label:x.name})));
const catalogOptions = computed(()=>props.catalog.map((x:any)=>({value:`${x.reward_type??x.type}:${x.reward_ref_id??x.refId}`,label:`${x.name} · ${x.reward_type??x.type}`})));
function paramKey(type:string){return ({'survive-duration':'durationSec','hero-health-above':'minHealthRatio','complete-within-duration':'maxDurationSec','defeat-enemy-count':'count'} as any)[type]??'';}
function remove(list:any[],index:number){list.splice(index,1);emit('change');}
function addObjective(){props.model.objectives.push({id:`objective_${Date.now()}`,name:'新目标',type:'clear-all-waves',required:false,params:{},order:props.model.objectives.length,displayText:'完成目标',progressDisplay:'value',starEligible:true,enabled:true});emit('change');}
function addPool(){props.model.rewardPools.push({id:`pool_${Date.now()}`,name:'新奖励池',group:'repeat-clear',selectionMode:'all',enabled:true,entries:[]});emit('change');}
function addReward(pool:any){const item=props.catalog[0];pool.entries.push({id:`reward_${Date.now()}`,rewardType:item?.reward_type??'currency',rewardRefId:item?.reward_ref_id??'gold',minQuantity:1,maxQuantity:1,probability:1,guaranteed:true,enabled:true});emit('change');}
function addRule(){props.model.unlockRules.push({id:`rule_${Date.now()}`,type:'prerequisite-clear',requiredStars:1,enabled:true});emit('change');}
function catalogEntry(entry:any){return props.catalog.find((x:any)=>(x.reward_ref_id??x.refId)===entry.rewardRefId&&(x.reward_type??x.type)===entry.rewardType&&!['missing','invalid'].includes(x.referenceStatus));}
function rewardKey(entry:any){return `${entry.rewardType}:${entry.rewardRefId}`;}
function rewardIconArtKey(entry:any){const item=catalogEntry(entry);return item?.icon_art_key??item?.iconArtKey;}
function selectReward(entry:any,value:string){const [type,...ids]=value.split(':');entry.rewardType=type;entry.rewardRefId=ids.join(':');emit('change');}
function objectiveReferenced(id:string){return props.model.rewardPools.some((pool:any)=>pool.group==='objective-bonus'&&pool.objectiveId===id);}
</script>
<style scoped>.progression-editor{margin-top:14px;padding:18px;background:#09151f;border:1px solid #294756}.progression-editor>header{display:flex;justify-content:space-between}.progression-editor h2{margin:3px 0;color:#eef}.progression-editor small{color:#55d9c6}.row-card{display:grid;gap:10px;margin:10px 0;padding:12px;background:#102431;border-left:3px solid #55d9c6}.reward-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.reward-row :deep(.ant-select){min-width:220px}.readonly .row-card,.readonly :deep(.ant-form){pointer-events:none;opacity:.78}</style>
