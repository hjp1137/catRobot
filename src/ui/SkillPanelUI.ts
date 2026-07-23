import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle, drawResourceHeader } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, circle } from '../render/DrawUtils';
import { DEFAULT_SKILL_IDS } from '../data/SkillConfig';
import { getSkillUpgradePreview } from '../data/SkillUpgrade';
import type { SkillUpgradePreview } from '../data/SkillUpgrade';
import { getSkillLevel } from '../data/SkillUpgrade';

interface SkillCardLayout {
  skillId: string;
  x: number; y: number; w: number; h: number;
  upgradeBtn: Button;
}

export class SkillPanelUI {
  private backBtn!: Button;
  private cards: SkillCardLayout[] = [];
  private toast = '';
  private toastTimer = 0;

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.canvasWidth;
    this.backBtn = { id: 'back', label: '返回车库', x: 16, y: 16, w: 90, h: 44, color: Theme.color.grayDark };
    const cardW = w - 40;
    const cardH = 180;
    const gap = 14;
    const startY = 120;
    const btnW = cardW - 32;
    this.cards = DEFAULT_SKILL_IDS.map((id, i) => {
      const x = 20, y = startY + i * (cardH + gap);
      return {
        skillId: id, x, y, w: cardW, h: cardH,
        upgradeBtn: { id: 'up_' + id, label: '升级', x: x + 16, y: y + cardH - 58, w: btnW, h: 44, color: Theme.color.orange },
      };
    });
  }

  handleClick(): void {
    this.layout();
    const backHit = pollButtonTap(this.ctx, [this.backBtn]);
    if (backHit) { this.game.backToMenu(); return; }
    const { tapX, tapY } = this.ctx.input;
    if (tapX === null || tapY === null) return;
    for (const card of this.cards) {
      const b = card.upgradeBtn;
      if (tapX >= b.x && tapX <= b.x + b.w && tapY >= b.y && tapY <= b.y + b.h) {
        const preview = getSkillUpgradePreview(this.game.player, card.skillId);
        if (preview?.isMaxLevel) { this.setToast('技能已满级'); return; }
        if (!preview?.cost) { this.setToast('技能已满级'); return; }
        if (this.game.player.gold < preview.cost.gold) { this.setToast('金币不足'); return; }
        if (this.game.player.parts < preview.cost.parts) { this.setToast('零件不足'); return; }
        const r = this.game.doUpgradeSkill(card.skillId);
        if (r.ok) {
          this.setToast(`${preview.config.name} 升级到 Lv.${(r as any).newLevel}`);
        } else {
          this.setToast('升级失败');
        }
        this.ctx.input.consumeTap();
        return;
      }
    }
  }

  private setToast(msg: string) { this.toast = msg; this.toastTimer = 2; }

  render(): void {
    this.layout();
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;

    c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
    c.fillRect(0, 0, w, h);

    drawTitle(c, '技能养成', undefined, { x: w / 2, y: 60, w });
    
    // 资源栏
    const p = this.game.player;
    drawResourceHeader(c, w, 82, [
      { type: 'coin', amount: p.gold },
      { type: 'part', amount: p.parts }
    ]);

    // 返回按钮
    drawButton(c, this.backBtn);

    // 技能卡片
    for (const card of this.cards) {
      const preview = getSkillUpgradePreview(this.game.player, card.skillId);
      if (preview) this.drawCard(c, card, preview);
    }

    // toast
    if (this.toastTimer > 0) {
      this.toastTimer -= 1 / 60;
      text(c, this.toast, w / 2, h - 40, { color: Theme.color.orange, align: 'center', font: Theme.font.bodyBold });
    }
  }

  private drawCard(c: ICanvas2D, card: SkillCardLayout, preview: SkillUpgradePreview): void {
    const accent = preview.isMaxLevel ? Theme.color.gold : Theme.color.cyan;
    
    drawPanel(c, card.x, card.y, card.w, card.h, {
      border: accent,
      borderSize: 1.5
    });

    const lvl = getSkillLevel(this.game.player, card.skillId);
    // 名称 + 等级
    text(c, preview.config.name, card.x + 16, card.y + 14, { font: Theme.font.bodyBold, color: Theme.color.white });
    text(c, `Lv.${lvl} / ${preview.config.maxLevel}`, card.x + card.w - 16, card.y + 14,
      { font: Theme.font.bodyBold, color: accent, align: 'right' });

    // 当前效果
    const cur = preview.currentEffect;
    let y = card.y + 42;
    text(c, '当前：' + this.fmt(cur, preview.config.type), card.x + 16, y, { color: Theme.color.gray, font: Theme.font.small });
    y += 20;
    if (preview.nextEffect) {
      text(c, '下级：' + this.fmt(preview.nextEffect, preview.config.type), card.x + 16, y,
        { color: Theme.color.green, font: Theme.font.small });
      y += 20;
      // 消耗
      if (preview.cost) {
        circle(c, card.x + 24, y + 7, 5, Theme.color.gold);
        text(c, `${preview.cost.gold}`, card.x + 34, y + 3, { color: Theme.color.gold, font: Theme.font.small });
        circle(c, card.x + 90, y + 7, 5, Theme.color.cyan);
        text(c, `${preview.cost.parts}`, card.x + 100, y + 3, { color: Theme.color.cyan, font: Theme.font.small });
      }
    }

    // 升级按钮
    const b = card.upgradeBtn;
    if (preview.isMaxLevel || !preview.cost) {
      b.label = '已满级';
      b.disabled = true;
      b.color = Theme.color.grayDark;
    } else {
      const enough = this.game.player.gold >= preview.cost.gold && this.game.player.parts >= preview.cost.parts;
      b.label = enough ? '升级' : '资源不足';
      b.disabled = !enough;
      b.color = enough ? Theme.color.orange : Theme.color.grayDark;
    }
    drawButton(c, b);
  }

  private fmt(e: { damage?: number; range?: number; cooldown?: number; duration?: number; damageReduction?: number }, type: string): string {
    if (type === 'damage') {
      return `伤害${e.damage}，范围${e.range}，冷却${e.cooldown?.toFixed(1)}s`;
    }
    return `持续${e.duration?.toFixed(1)}s，减伤${Math.round((e.damageReduction ?? 0) * 100)}%，冷却${e.cooldown?.toFixed(1)}s`;
  }
}
