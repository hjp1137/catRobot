import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, drawButton, drawPanel, drawTitle, pollButtonTap } from './UIWidgets';
import { Theme } from '../render/Theme';
import { circle, text, verticalGradient } from '../render/DrawUtils';
import { drawStarRow } from '../render/StarRenderer';
import { getDefaultContentRegistry } from '../content/registry/ContentRegistry';
import { findPublishedStageProgression } from '../progression/StageProgressionRepository';
import { STAGE_PROGRESSION_SNAPSHOT } from '../content/generated/stageProgressionSnapshot';
import { ResourceManager } from '../core/ResourceManager';
import type { StageRewardEntry, StageRewardPool } from '../content/models/StageProgression';

export class CampaignStageDetailUI {
  private startBtn!:Button;private backBtn!:Button;
  constructor(private ctx:IContext,private game:GameManager){this.layout();}
  private layout(){const w=this.ctx.canvasWidth,h=this.ctx.canvasHeight,bw=w*.72,x=(w-bw)/2;this.startBtn={id:'start',label:'开始挑战',x,y:h-116,w:bw,h:44,color:Theme.color.orange};this.backBtn={id:'back',label:'返回章节地图',x,y:h-64,w:bw,h:42,color:Theme.color.grayDark};}
  handleClick(){this.layout();const hit=pollButtonTap(this.ctx,[this.startBtn,this.backBtn]);if(hit?.id==='start')this.game.beginCampaignNode();else if(hit?.id==='back')this.game.returnToStageSelect();}
  render(){this.layout();const node=this.game.currentCampaignNode;if(!node)return;const stage=getDefaultContentRegistry().getStage(node.stageId);const legacy=stage.legacyStageId??stage.id;const progress=this.game.player.stageProgress[legacy];const progression=findPublishedStageProgression(stage.id);const c=this.ctx.canvas,w=this.ctx.canvasWidth,h=this.ctx.canvasHeight;
    const background=getDefaultContentRegistry().getBackground(stage.backgroundThemeId);const bg=ResourceManager.getInstance().getImageByArtKey(background.art.floorArtKey);if(bg)c.drawImage(bg,0,0,w,h);else{c.fillStyle=verticalGradient(c,0,0,w,h,Theme.color.bgDeep,Theme.color.bgMid);c.fillRect(0,0,w,h);}c.fillStyle='rgba(1,10,16,.8)';c.fillRect(0,0,w,h);
    drawPanel(c,18,38,w-36,h-182,{border:node.type==='boss'?Theme.color.red:Theme.color.cyan,borderSize:2});drawTitle(c,node.name,node.description??this.game.currentCampaignChapter?.subtitle,{x:w/2,y:76,w});
    let y=130;text(c,stage.mode==='explore'?'自由地图关卡':'固定屏关卡（仅调试）',w/2,y,{align:'center',color:Theme.color.orange,font:Theme.font.bodyBold});y+=34;text(c,`推荐战力 ${node.recommendedPower||progression?.recommendedPower||0} · 当前 ${this.game.totalPower}`,w/2,y,{align:'center',color:this.game.totalPower<(node.recommendedPower||0)?Theme.color.red:Theme.color.cyan});y+=34;
    text(c,'历史最佳',36,y,{color:Theme.color.gray,font:Theme.font.small});drawStarRow(c,130,y+2,progress?.bestStars??0,9,Theme.color.gold);text(c,progress?.bestClearTimeSec!=null?`最快 ${progress.bestClearTimeSec.toFixed(1)} 秒`:'尚未通关',w-36,y,{align:'right',color:Theme.color.gray,font:Theme.font.small});y+=34;
    text(c,'关卡目标',36,y,{color:Theme.color.cyan,font:Theme.font.bodyBold});y+=25;const objectives=progression?.objectives.filter(item=>item.enabled)??stage.objectives?.map((item,index)=>({id:`legacy_${index}`,displayText:`${friendlyObjective(item.type)} ${item.required}`,required:true}))??[];for(const item of objectives.slice(0,4)){text(c,`${item.required?'◆':'◇'} ${item.displayText}`,44,y,{color:item.required?Theme.color.white:Theme.color.gray,font:Theme.font.small});y+=21;}
    y+=8;text(c,'奖励预览',36,y,{color:Theme.color.gold,font:Theme.font.bodyBold});y+=25;const rewards=rewardRows(progression?.rewardPools??[]);if(!rewards.length)text(c,'奖励以正式关卡配置为准',44,y,{color:Theme.color.gray,font:Theme.font.small});for(const {pool,item} of rewards.slice(0,4)){const catalog=STAGE_PROGRESSION_SNAPSHOT.rewardCatalog.find(entry=>entry.type===item.rewardType&&entry.refId===item.rewardRefId);const claimed=pool.group==='first-clear'&&progress?.firstClearRewardClaimed;const icon=ResourceManager.getInstance().getImageByArtKey(catalog?.iconArtKey);if(icon)c.drawImage(icon,42,y-3,20,20);else circle(c,52,y+7,7,Theme.color.gold);text(c,`${catalog?.name??friendlyReward(item.rewardType,item.rewardRefId)} × ${item.minQuantity}${item.maxQuantity!==item.minQuantity?`-${item.maxQuantity}`:''} · ${claimed?'已领取':pool.name}`,70,y,{color:claimed?Theme.color.gray:Theme.color.white,font:Theme.font.small});y+=23;}
    drawButton(c,this.startBtn);drawButton(c,this.backBtn);
  }
}
function friendlyObjective(type:string){return({defeat:'击败敌人',resource:'收集资源',chest:'开启宝箱'} as any)[type]??'完成目标';}
function friendlyReward(type:string,id:string){if(id==='gold')return'金币';if(id==='parts')return'机甲零件';if(id==='enhanceStone')return'强化石';return({equipment:'装备',rune:'符文',material:'材料',currency:'货币'} as any)[type]??'奖励';}
function rewardRows(pools:StageRewardPool[]):Array<{pool:StageRewardPool;item:StageRewardEntry}>{const rows:Array<{pool:StageRewardPool;item:StageRewardEntry}>=[];for(const pool of pools)for(const item of pool.entries)if(item.enabled)rows.push({pool,item});return rows;}
