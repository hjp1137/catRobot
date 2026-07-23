import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text } from '../render/DrawUtils';
import { getAllChapters, isChapterUnlocked } from '../chapter/ChapterConfig';
import type { ChapterConfig } from '../chapter/ChapterConfig';
import { ResourceManager } from '../core/ResourceManager';

interface ChapterCard { chapterId: string; x: number; y: number; w: number; h: number; }

export class ChapterSelectUI {
  private backBtn!: Button;
  private cards: ChapterCard[] = [];

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.canvasWidth;
    this.backBtn = { id: 'back', label: '返回车库', x: 16, y: 16, w: 90, h: 44, color: Theme.color.grayDark };
    const chapters = getAllChapters();
    const cardW = w - 40;
    const cardH = 110;
    const gap = 16;
    const startY = 130;
    this.cards = chapters.map((ch, i) => ({
      chapterId: ch.id,
      x: 20, y: startY + i * (cardH + gap), w: cardW, h: cardH,
    }));
  }

  handleClick(): void {
    this.layout();
    const backHit = pollButtonTap(this.ctx, [this.backBtn]);
    if (backHit) { this.game.backToMenu(); return; }
    const { tapX, tapY } = this.ctx.input;
    if (tapX === null || tapY === null) return;
    for (const card of this.cards) {
      if (tapX >= card.x && tapX <= card.x + card.w && tapY >= card.y && tapY <= card.y + card.h) {
        if (isChapterUnlocked(this.game.player, card.chapterId)) {
          this.ctx.input.consumeTap();
          this.game.goToStageSelect(card.chapterId);
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

    c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
    c.fillRect(0, 0, w, h);

    drawTitle(c, '章节选择', undefined, { x: w / 2, y: 60, w });

    // 返回按钮
    drawButton(c, this.backBtn);

    const chapters = getAllChapters();
    for (let i = 0; i < chapters.length; i++) {
      this.drawCard(c, this.cards[i], chapters[i]);
    }
  }

  private drawCard(c: ICanvas2D, card: ChapterCard, ch: ChapterConfig): void {
    const unlocked = isChapterUnlocked(this.game.player, ch.id);
    let accent: string = Theme.color.grayDark;
    if (unlocked) {
      if (ch.theme === 'sewer') {
        accent = '#a060e0';
      } else if (ch.theme === 'factory') {
        accent = '#ff5500';
      } else {
        accent = Theme.color.cyan;
      }
    }

    drawPanel(c, card.x, card.y, card.w, card.h, {
      border: accent,
      borderSize: unlocked ? 2 : 1
    });

    // 章节名
    text(c, ch.name, card.x + 16, card.y + 16, { font: Theme.font.titleSmall, color: unlocked ? Theme.color.white : Theme.color.gray });
    if (ch.subtitle) {
      text(c, ch.subtitle, card.x + 16, card.y + 46, { font: Theme.font.small, color: unlocked ? (ch.theme === 'factory' ? '#ff8844' : Theme.color.cyan) : Theme.color.gray });
    }
    // 关卡数
    text(c, `${ch.stageIds.length} 个关卡`, card.x + 16, card.y + 70, { font: Theme.font.small, color: Theme.color.gray });

    // 绘制第三章 Icon
    if (ch.theme === 'factory') {
      const rm = ResourceManager.getInstance();
      const img = rm.getImage('chapter3_icon');
      const iconSize = 48;
      const iconX = card.x + card.w - 150;
      const iconY = card.y + card.h / 2 - iconSize / 2;
      if (rm.isLoaded('chapter3_icon') && img) {
        c.drawImage(img, iconX, iconY, iconSize, iconSize);
      } else {
        c.save();
        c.fillStyle = '#ff5500';
        c.beginPath();
        c.moveTo(iconX + iconSize / 2, iconY + 5);
        c.lineTo(iconX + iconSize - 10, iconY + iconSize / 2);
        c.lineTo(iconX + iconSize - 5, iconY + iconSize - 5);
        c.lineTo(iconX + iconSize / 2, iconY + iconSize - 10);
        c.lineTo(iconX + 5, iconY + iconSize - 5);
        c.lineTo(iconX + 10, iconY + iconSize / 2);
        c.closePath();
        c.fill();
        c.restore();
      }
    }

    // 状态
    if (!unlocked) {
      text(c, '🔒 锁定（通关前一章末关解锁）', card.x + card.w - 16, card.y + card.h / 2,
        { color: Theme.color.gray, align: 'right', baseline: 'middle', font: Theme.font.small });
    } else {
      text(c, '进入 ▶', card.x + card.w - 16, card.y + card.h / 2,
        { color: accent, align: 'right', baseline: 'middle', font: Theme.font.bodyBold });
    }
  }
}

