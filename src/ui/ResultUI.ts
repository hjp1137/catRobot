import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, star, circle } from '../render/DrawUtils';
import { drawStarRow } from '../render/StarRenderer';
import { getStageById } from '../data/StageConfig';
import { ResourceManager } from '../core/ResourceManager';
import { RARITY_COLOR } from '../data/EquipmentConfig';
import { resolveAssetKey } from '../core/AssetResolver';

export class ResultUI {
  private backStageBtn!: Button;
  private backMenuBtn!: Button;
  private retryBtn!: Button;
  private nextBtn!: Button;
  private appearTime = 0;

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const btnW = w * 0.7;
    const btnX = (w - btnW) / 2;
    const o = this.game.lastOutcome;
    
    if (o && !o.win) {
      this.retryBtn = {
        id: 'retry', label: '重新挑战',
        x: btnX, y: h - 176, w: btnW, h: 44, color: Theme.color.orange,
      };
      this.backStageBtn = {
        id: 'backStage', label: this.game.currentCampaignNodeId ? '返回章节地图' : '返回关卡选择',
        x: btnX, y: h - 122, w: btnW, h: 44, color: Theme.color.cyan,
      };
      this.backMenuBtn = {
        id: 'backMenu', label: '返回车库',
        x: btnX, y: h - 68, w: btnW, h: 44, color: Theme.color.grayDark,
      };
    } else {
      this.retryBtn = {
        id: 'retry', label: '再次挑战', x: btnX, y: h - 176, w: btnW, h: 44, color: Theme.color.cyan,
      };
      this.nextBtn = {
        id: 'next', label: '下一关', x: btnX, y: h - 230, w: btnW, h: 44, color: Theme.color.orange,
        disabled: !this.game.canChallengeNextStage(),
      };
      this.backStageBtn = {
        id: 'backStage', label: this.game.currentCampaignNodeId ? '返回章节地图' : '返回关卡选择',
        x: btnX, y: h - 122, w: btnW, h: 44, color: Theme.color.orange,
      };
      this.backMenuBtn = {
        id: 'backMenu', label: '返回车库',
        x: btnX, y: h - 68, w: btnW, h: 44, color: Theme.color.grayDark,
      };
    }
  }

  getTutorialContinueButton(): Button {
    this.layout(); return this.backStageBtn;
  }

  handleClick(): void {
    this.layout();
    const o = this.game.lastOutcome;
    const btns = (o && !o.win) ? [this.retryBtn, this.backStageBtn, this.backMenuBtn]
      : [this.nextBtn, this.retryBtn, this.backStageBtn, this.backMenuBtn];
    const hit = pollButtonTap(this.ctx, btns);
    if (!hit) return;
    if (hit.id === 'retry') {
      this.game.beginSelectedStage();
    } else if (hit.id === 'next') {
      this.game.challengeNextStage();
    } else if (hit.id === 'backStage') {
      this.game.returnToStageSelect();
    } else if (hit.id === 'backMenu') {
      this.game.returnToMenu();
    }
  }

  render(): void {
    this.layout();
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const o = this.game.lastOutcome;
    if (!o) return;

    this.appearTime = Math.min(0.4, this.appearTime + 1 / 60);
    const scale = 0.85 + 0.15 * (this.appearTime / 0.4);

    // 蒙层
    c.fillStyle = 'rgba(0,0,0,0.72)';
    c.fillRect(0, 0, w, h);

    const win = o.win;
    const accent = win ? Theme.color.gold : Theme.color.red;
    const titleColor = win ? Theme.color.gold : Theme.color.redBright;
    const stage = getStageById(o.stageId);

    const panelW = w * 0.84;
    const panelH = 400;
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2 - 30;
    c.save();
    const cx = w / 2, cy = panelY + panelH / 2;
    c.translate(cx, cy); c.scale(scale, scale); c.translate(-cx, -cy);

    drawPanel(c, panelX, panelY, panelW, panelH, {
      border: accent,
      borderSize: 2
    });
    star(c, panelX + 30, panelY + 30, 6, 2, 4, accent);
    star(c, panelX + panelW - 30, panelY + 30, 6, 2, 4, accent);

    // 标题 + 关卡名
    text(c, win ? '战斗胜利' : '战斗失败', w / 2, panelY + 56, { color: titleColor, align: 'center', font: Theme.font.big });
    text(c, stage ? stage.name : o.stageId, w / 2, panelY + 104, { color: Theme.color.gray, align: 'center', font: Theme.font.body });

    if (o.settlement) {
      this.renderProgressionSettlement(c, o, panelY);
    } else if (win && o.clearResult) {
      const cr = o.clearResult;
      // 星级（本次获得的星）
      text(c, '本次评价', w / 2, panelY + 142, { color: Theme.color.cyan, align: 'center', font: Theme.font.small });
      drawStarRow(c, w / 2, panelY + 160, cr.stars, 16, Theme.color.gold);
      // 历史最高
      const prevBest = cr.previousBestStars;
      const curBest = Math.max(prevBest, cr.stars);
      text(c, cr.firstClear ? '首次通关！' : `历史最高 ${curBest} 星`, w / 2, panelY + 198,
        { color: cr.firstClear ? Theme.color.gold : Theme.color.gray, align: 'center', font: Theme.font.small });

      // 奖励
      const rewardY = panelY + 215;
      const rm = ResourceManager.getInstance();
      const coinImg = rm.getImage('coin');
      const partImg = rm.getImage('part');
      const stoneImg = rm.getImage('stone');

      // 金币
      if (coinImg) {
        c.drawImage(coinImg, w / 2 - 106, rewardY - 2, 32, 32);
      } else {
        circle(c, w / 2 - 90, rewardY + 14, 16, Theme.color.gold);
        text(c, 'G', w / 2 - 90, rewardY + 14, { color: Theme.color.bgDeep, align: 'center', baseline: 'middle', font: Theme.font.bodyBold });
      }
      text(c, `+${cr.gold}`, w / 2 - 90, rewardY + 40, { color: Theme.color.gold, align: 'center', font: Theme.font.titleSmall });
      
      // 零件
      if (partImg) {
        c.drawImage(partImg, w / 2 - 16, rewardY - 2, 32, 32);
      } else {
        circle(c, w / 2, rewardY + 14, 16, Theme.color.cyan);
        text(c, 'P', w / 2, rewardY + 14, { color: Theme.color.bgDeep, align: 'center', baseline: 'middle', font: Theme.font.bodyBold });
      }
      text(c, `+${cr.parts}`, w / 2, rewardY + 40, { color: Theme.color.cyan, align: 'center', font: Theme.font.titleSmall });

      // 强化石
      const stoneReward = o.enhanceStoneReward ?? 0;
      if (stoneImg) {
        c.drawImage(stoneImg, w / 2 + 74, rewardY - 2, 32, 32);
      } else {
        circle(c, w / 2 + 90, rewardY + 14, 16, '#c060e0');
        text(c, 'S', w / 2 + 90, rewardY + 14, { color: Theme.color.bgDeep, align: 'center', baseline: 'middle', font: Theme.font.bodyBold });
      }
      text(c, `+${stoneReward}`, w / 2 + 90, rewardY + 40, { color: '#c060e0', align: 'center', font: Theme.font.titleSmall });

      text(c, cr.firstClear ? '首通奖励' : '重复挑战奖励', w / 2, rewardY + 64, { color: Theme.color.gray, align: 'center', font: Theme.font.small });

      // 任务9/10：装备/符文掉落显示与背包满折算
      if (o.loot) {
        let lootY = panelY + 296;
        if (o.loot.equipmentName) {
          const suffix = o.loot.fullBagConverted
            ? ` (背包已满已转化为强化石 +${o.loot.convertedStones})`
            : '';
          const str = `🎁 获得装备：${o.loot.equipmentName}${suffix}`;
          text(c, str, w / 2 + 10, lootY,
            { color: o.loot.fullBagConverted ? Theme.color.redBright : Theme.color.gold, align: 'center', baseline: 'middle', font: Theme.font.small });
          
          const iconSize = 16;
          const textW = c.measureText(str).width;
          const iconX = w / 2 - textW / 2 - 8;
          const iconY = lootY - iconSize / 2;
          
          const configId = o.loot.equipmentConfigId || '';
          const imgKey = resolveAssetKey('equip', configId);
          const img = rm.getImage(imgKey);
          if (img) {
            c.drawImage(img, iconX, iconY, iconSize, iconSize);
          } else {
            const rarity = o.loot.equipmentRarity || 'common';
            const accentColor = (RARITY_COLOR as any)[rarity] || Theme.color.grayDark;
            c.fillStyle = accentColor;
            c.fillRect(iconX, iconY, iconSize, iconSize);
            c.strokeStyle = '#ffffff';
            c.lineWidth = 1;
            c.strokeRect(iconX, iconY, iconSize, iconSize);
          }
          lootY += 20;
        }
        if (o.loot.tutorialEquipmentName) {
          const suffix = (o.loot as any).tutorialFullBagConverted
            ? ` (背包已满已转化为强化石 +${(o.loot as any).tutorialConvertedStones})`
            : '';
          const str = `🎁 引导额外装备：${o.loot.tutorialEquipmentName}${suffix}`;
          text(c, str, w / 2 + 10, lootY,
            { color: (o.loot as any).tutorialFullBagConverted ? Theme.color.redBright : Theme.color.gold, align: 'center', baseline: 'middle', font: Theme.font.small });
          
          const iconSize = 16;
          const textW = c.measureText(str).width;
          const iconX = w / 2 - textW / 2 - 8;
          const iconY = lootY - iconSize / 2;
          
          const configId = (o.loot as any).tutorialEquipmentConfigId || '';
          const imgKey = resolveAssetKey('equip', configId);
          const img = rm.getImage(imgKey);
          if (img) {
            c.drawImage(img, iconX, iconY, iconSize, iconSize);
          } else {
            const rarity = (o.loot as any).tutorialEquipmentRarity || 'common';
            const accentColor = (RARITY_COLOR as any)[rarity] || Theme.color.grayDark;
            c.fillStyle = accentColor;
            c.fillRect(iconX, iconY, iconSize, iconSize);
            c.strokeStyle = '#ffffff';
            c.lineWidth = 1;
            c.strokeRect(iconX, iconY, iconSize, iconSize);
          }
          lootY += 20;
        }
        if (o.loot.runeName) {
          const str = `🔮 获得符文：${o.loot.runeName}`;
          text(c, str, w / 2 + 10, lootY,
            { color: Theme.color.cyan, align: 'center', baseline: 'middle', font: Theme.font.small });
          
          const iconSize = 16;
          const textW = c.measureText(str).width;
          const iconX = w / 2 - textW / 2 - 8;
          const iconY = lootY - iconSize / 2;
          
          const configId = o.loot.runeConfigId || '';
          const imgKey = resolveAssetKey('rune', configId);
          const img = rm.getImage(imgKey);
          if (img) {
            c.drawImage(img, iconX, iconY, iconSize, iconSize);
          } else {
            c.fillStyle = '#4fd1e0';
            c.beginPath();
            c.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI*2);
            c.fill();
            c.strokeStyle = '#ffffff';
            c.lineWidth = 1;
            c.stroke();
          }
        }
      }

      // 任务4/8/10/14：章节完成或解锁新关卡提示
      if (cr.chapterCompleted) {
        const isChapter2 = o.stageId === '2-5';
        const isChapter3 = o.stageId === '3-5';
        const title = isChapter3
          ? '★ 第三章完成 · 星核觉醒 ★'
          : isChapter2
          ? '★ 第二章完成！★'
          : '★ 第一章完成！★';
        const msg = isChapter3
          ? '熔火工厂核心已重构 · 橘猫机甲迎来觉醒新纪元'
          : isChapter2
          ? '霓虹下水道污染源已清除 · 更深处的星核信号正在苏醒'
          : '废弃训练场已清理 · 新的区域即将开放';
        text(c, title, w / 2, panelY + 342,
          { color: Theme.color.gold, align: 'center', font: Theme.font.titleSmall });
        text(c, msg, w / 2, panelY + 366,
          { color: Theme.color.cyan, align: 'center', font: Theme.font.small });
      } else if (cr.unlockedNextId) {
        const next = getStageById(cr.unlockedNextId);
        text(c, `🔓 解锁新关卡：${next ? next.name : cr.unlockedNextId}`, w / 2, panelY + 355,
          { color: Theme.color.green, align: 'center', font: Theme.font.bodyBold });
      }
    } else {
      text(c, '机甲受损，请升级后再战', w / 2, panelY + 180, { color: Theme.color.gray, align: 'center', font: Theme.font.body });
    }

    c.restore();

    // 按钮（不缩放）
    if (o.win) drawButton(c, this.nextBtn);
    drawButton(c, this.retryBtn);
    drawButton(c, this.backStageBtn);
    drawButton(c, this.backMenuBtn);
  }

  private renderProgressionSettlement(c: ICanvas2D, o: NonNullable<GameManager['lastOutcome']>, panelY: number): void {
    const settlement = o.settlement!;
    const w = this.ctx.canvasWidth;
    text(c, settlement.victory ? '本次评价' : `失败：${settlement.failureReason ?? '未完成关卡'}`,
      w / 2, panelY + 132, { color: settlement.victory ? Theme.color.cyan : Theme.color.red, align: 'center', font: Theme.font.small });
    drawStarRow(c, w / 2, panelY + 154, settlement.stars, 16, Theme.color.gold);
    let y = panelY + 190;
    for (const objective of settlement.objectiveResults.slice(0, 4)) {
      const mark = objective.completed ? '✓' : '○';
      text(c, `${mark} ${objective.displayText}`, w / 2, y,
        { color: objective.completed ? Theme.color.green : Theme.color.gray, align: 'center', font: Theme.font.small });
      y += 22;
    }
    const rewards = settlement.grantedRewards.map(item => `${item.rewardRefId}×${item.quantity}`).join('  ');
    text(c, rewards ? `奖励 ${rewards}` : '本次无新增奖励', w / 2, y + 10,
      { color: rewards ? Theme.color.gold : Theme.color.gray, align: 'center', font: Theme.font.small });
    if (settlement.unlockedStageIds.length) text(c, `🔓 解锁 ${settlement.unlockedStageIds.join('、')}`, w / 2, y + 38,
      { color: Theme.color.green, align: 'center', font: Theme.font.bodyBold });
  }
}
