import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, star, circle } from '../render/DrawUtils';
import { drawStarRow } from '../render/StarRenderer';
import { CHAPTER_1, getChapterById } from '../chapter/ChapterConfig';
import { getStageById } from '../data/StageConfig';
import { isUnlocked, isCleared, getProgress } from '../chapter/ProgressManager';

interface StageCard {
  stageId: string;
  x: number; y: number; w: number; h: number;
}

export class StageSelectUI {
  private backBtn!: Button;
  private cards: StageCard[] = [];

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
  }

  /** 任务7：按当前选中章节布局（currentChapterId 可变，每次 render 前刷新） */
  private layout(): void {
    const w = this.ctx.canvasWidth;
    this.backBtn = {
      id: 'back', label: '返回章节',
      x: 16, y: 16, w: 90, h: 44, color: Theme.color.grayDark,
    };
    const chapter = getChapterById(this.game.currentChapterId) ?? CHAPTER_1;
    const cardW = w - 40;
    const cardH = 70;
    const gap = 12;
    const startY = 110;
    this.cards = chapter.stageIds.map((id, i) => ({
      stageId: id,
      x: 20, y: startY + i * (cardH + gap), w: cardW, h: cardH,
    }));
  }

  handleClick(): void {
    this.layout();
    const backHit = pollButtonTap(this.ctx, [this.backBtn]);
    if (backHit) { this.game.backToChapterSelect(); return; }
    const { tapX, tapY } = this.ctx.input;
    if (tapX === null || tapY === null) return;
    for (const card of this.cards) {
      if (tapX >= card.x && tapX <= card.x + card.w && tapY >= card.y && tapY <= card.y + card.h) {
        if (isUnlocked(this.game.player, card.stageId)) {
          this.ctx.input.consumeTap();
          this.game.openFormalStage(card.stageId);
        }
        return;
      }
    }
  }

  render(): void {
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    this.layout();
    const chapter = getChapterById(this.game.currentChapterId) ?? CHAPTER_1;

    // 背景
    c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
    c.fillRect(0, 0, w, h);

    // 标题
    drawTitle(c, chapter.name, chapter.subtitle ?? undefined, { x: w / 2, y: 60, w });

    // 返回按钮
    drawButton(c, this.backBtn);

    // 关卡卡片
    for (const card of this.cards) {
      const stage = getStageById(card.stageId);
      if (!stage) continue;
      const unlocked = isUnlocked(this.game.player, card.stageId);
      const cleared = isCleared(this.game.player, card.stageId);
      const progress = getProgress(this.game.player, card.stageId);
      const lowPower = this.game.totalPower < stage.recommendedPower;
      this.drawCard(c, card, stage.name, stage.recommendedPower, stage.rewardGold, stage.rewardParts,
        unlocked, cleared, progress.bestStars, lowPower, !!stage.isBossStage);
      if (progress.lastResult) {
        const summary = progress.lastResult === 'victory'
          ? `最近胜利${progress.bestClearTimeSec != null ? ` · 最快${progress.bestClearTimeSec.toFixed(1)}秒` : ''}`
          : '最近挑战失败';
        text(c, summary, card.x + 160, card.y + 60,
          { color: progress.lastResult === 'victory' ? Theme.color.green : Theme.color.gray, font: Theme.font.small });
      }
    }
  }

  private drawCard(
    c: ICanvas2D, card: StageCard, name: string, recPower: number, gold: number, parts: number,
    unlocked: boolean, cleared: boolean, bestStars: number, lowPower: boolean, isBoss: boolean,
  ): void {
    const accent = isBoss ? Theme.color.redBright
      : !unlocked ? Theme.color.grayDark : cleared ? Theme.color.gold : Theme.color.cyan;
    
    drawPanel(c, card.x, card.y, card.w, card.h, {
      border: accent,
      borderSize: unlocked ? 2 : 1
    });

    // 任务4：Boss 关标识
    if (isBoss) {
      text(c, '☠ BOSS', card.x + card.w - 16, card.y + 14,
        { color: Theme.color.redBright, align: 'right', font: Theme.font.small });
    }

    // 关卡名 + 推荐战力
    text(c, name, card.x + 16, card.y + 14, { font: Theme.font.bodyBold, color: unlocked ? Theme.color.white : Theme.color.gray });
    const powerColor = lowPower && unlocked ? Theme.color.red : Theme.color.gray;
    text(c, `推荐战力 ${recPower}${lowPower && unlocked ? ' (不足)' : ''}`, card.x + 16, card.y + 38,
      { font: Theme.font.small, color: powerColor });

    // 奖励
    circle(c, card.x + card.w - 130, card.y + 22, 5, Theme.color.gold);
    text(c, `${gold}`, card.x + card.w - 120, card.y + 18, { color: Theme.color.gold, font: Theme.font.small });
    circle(c, card.x + card.w - 80, card.y + 22, 5, Theme.color.cyan);
    text(c, `${parts}`, card.x + card.w - 70, card.y + 18, { color: Theme.color.cyan, font: Theme.font.small });

    // 状态标签
    if (!unlocked) {
      text(c, '🔒 锁定', card.x + card.w - 24, card.y + 44, { color: Theme.color.gray, align: 'right', font: Theme.font.small });
    } else if (cleared) {
      // 星级
      drawStarRow(c, card.x + card.w - 70, card.y + 44, bestStars, 8, Theme.color.gold);
      text(c, '挑战', card.x + card.w - 24, card.y + 44, { color: Theme.color.cyan, align: 'right', font: Theme.font.small });
    } else {
      text(c, '挑战 ▶', card.x + card.w - 24, card.y + 44, { color: Theme.color.gold, align: 'right', font: Theme.font.bodyBold });
    }
  }
}
