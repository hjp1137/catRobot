import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, drawButton, drawPanel, drawTitle, pollButtonTap } from './UIWidgets';
import { Theme } from '../render/Theme';
import { circle, text, verticalGradient } from '../render/DrawUtils';
import { drawStarRow } from '../render/StarRenderer';
import { ResourceManager } from '../core/ResourceManager';

interface NodeCard { nodeId: string; x: number; y: number; r: number }

export class CampaignMapUI {
  public cards: NodeCard[] = [];
  public toast = '';
  public lockedDetail?: any;
  private backBtn!: Button;
  private unlockStartedAt?: number;
  constructor(private ctx: IContext, private game: GameManager) { this.layout(); }

  private layout(): void {
    const view=this.game.getCampaignChapterView(),w=this.ctx.canvasWidth,h=this.ctx.canvasHeight;
    this.backBtn={id:'back',label:'返回车库',x:16,y:16,w:90,h:40,color:Theme.color.grayDark};
    const cw=view?.chapter.canvasWidth||1000,ch=view?.chapter.canvasHeight||600;
    this.cards=(view?.nodes??[]).map(node=>({nodeId:node.id,x:24+(node.x/cw)*(w-48),y:132+(node.y/ch)*(h-238),r:28}));
  }

  handleClick(): void {
    this.layout(); if(pollButtonTap(this.ctx,[this.backBtn])){this.game.backToMenu();return;}
    const{x,y}={x:this.ctx.input.tapX,y:this.ctx.input.tapY};
    if(x==null||y==null)return;
    for(const card of this.cards){if(Math.hypot(x-card.x,y-card.y)>card.r+10)continue;this.ctx.input.consumeTap();
      const item=this.game.getCampaignChapterView()?.nodes.find(node=>node.id===card.nodeId);if(!item)return;
      if(item.state==='LOCKED'){this.lockedDetail=item.lockDetail;this.toast=item.lockDetail?.enterHint??'当前节点尚未解锁，无法进入';return;}
      this.lockedDetail=undefined;this.toast='';this.game.openCampaignNode(item.id);return;}
  }

  render(): void {
    this.layout();const c=this.ctx.canvas,w=this.ctx.canvasWidth,h=this.ctx.canvasHeight,time=this.ctx.now();
    const view=this.game.getCampaignChapterView();if(!view)return;
    const bg=ResourceManager.getInstance().getImageByArtKey(view.chapter.backgroundArtKey);
    if(bg)c.drawImage(bg,0,0,w,h);else{c.fillStyle=verticalGradient(c,0,0,w,h,'#07131c','#102d3a');c.fillRect(0,0,w,h);}
    c.fillStyle='rgba(2,12,18,.72)';c.fillRect(0,0,w,h);drawTitle(c,view.chapter.name,view.chapter.subtitle,{x:w/2,y:58,w});drawButton(c,this.backBtn,time);
    const byId=new Map(this.cards.map(card=>[card.nodeId,card]));
    for(const path of view.connections){const from=byId.get(path.fromNodeId),to=byId.get(path.toNodeId);if(!from||!to)continue;c.save();c.strokeStyle=path.state==='completed'?Theme.color.gold:path.state==='locked'?Theme.color.grayDark:Theme.color.cyanDark;c.lineWidth=path.state==='completed'?6:3;c.setLineDash?.(path.state==='locked'?[8,8]:[]);c.beginPath();c.moveTo(from.x,from.y);c.lineTo(to.x,to.y);c.stroke();c.restore();}
    let hasNew=false;
    for(const card of this.cards){const item=view.nodes.find(node=>node.id===card.nodeId);if(!item)continue;hasNew ||= item.state==='NEWLY_UNLOCKED';this.drawNode(c,card,item,time);}
    if(hasNew){this.unlockStartedAt??=time;if(time-this.unlockStartedAt>1.2){this.game.consumeCampaignUnlocks();this.unlockStartedAt=undefined;}}else this.unlockStartedAt=undefined;
    drawPanel(c,16,h-86,w-32,58,{border:Theme.color.cyanDark});text(c,`章节星数 ${view.totalStars} / ${view.nodes.length*3}`,30,h-72,{color:Theme.color.gold,font:Theme.font.bodyBold});text(c,view.completed?view.chapter.completionText:'选择已解锁节点查看关卡详情',30,h-48,{color:Theme.color.gray,font:Theme.font.small});
    if(this.toast)text(c,this.toast,w/2,h-112,{color:Theme.color.orange,align:'center',font:Theme.font.bodyBold});
    if(this.lockedDetail)this.drawLockedDetail(c,w,h);
  }

  private drawLockedDetail(c:ICanvas2D,w:number,h:number):void{
    const detail=this.lockedDetail,panelW=Math.min(360,w-32),x=w-panelW-16,y=Math.max(96,h-280);
    drawPanel(c,x,y,panelW,150,{border:Theme.color.orange});
    text(c,`${detail.nodeName} · ${detail.status}`,x+16,y+14,{color:Theme.color.orange,font:Theme.font.bodyBold});
    text(c,detail.reason,x+16,y+42,{color:Theme.color.white,font:Theme.font.small});
    text(c,`前置关卡：${detail.prerequisiteName}`,x+16,y+68,{color:Theme.color.gray,font:Theme.font.small});
    text(c,`所需星级 ${detail.requiredStars} · 当前星级 ${detail.currentStars} · 解锁进度 ${detail.progressText}`,x+16,y+94,{color:Theme.color.gold,font:Theme.font.small});
    text(c,detail.enterHint,x+16,y+122,{color:Theme.color.orange,font:Theme.font.small});
  }

  private drawNode(c:ICanvas2D,card:NodeCard,item:any,time:number):void{
    const palette:any={LOCKED:Theme.color.grayDark,UNLOCKED:Theme.color.cyan,CLEARED:'#78a9bd',THREE_STAR:Theme.color.gold,NEWLY_UNLOCKED:Theme.color.orange};
    const pulse=item.state==='NEWLY_UNLOCKED'?1+Math.sin(time*8)*.14:1;c.save();c.translate(card.x,card.y);c.scale(pulse,pulse);circle(c,0,0,card.r,palette[item.state]);circle(c,0,0,card.r-6,'#102531');text(c,item.isStart?'始':item.isEnd?'终':String(item.order),0,0,{align:'center',baseline:'middle',color:palette[item.state],font:Theme.font.bodyBold});c.restore();
    text(c,item.name,card.x,card.y+36,{align:'center',color:item.state==='LOCKED'?Theme.color.gray:Theme.color.white,font:Theme.font.small});if(item.stars)drawStarRow(c,card.x,card.y+54,item.stars,6,Theme.color.gold);
  }
}
