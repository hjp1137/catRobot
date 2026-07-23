import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle } from './UIWidgets';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, star, circle } from '../render/DrawUtils';
import { getStageById, StageConfig, StageWaveConfig } from '../data/StageConfig';
import { ENEMY_CONFIGS } from '../data/EnemyConfig';
import { findPublishedStageProgression } from '../progression/StageProgressionRepository';

export class StageIntroUI {
  private startBtn!: Button;
  private backBtn!: Button;

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
  }

  private layout(): void {
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    this.startBtn = {
      id: 'start', label: '开始挑战',
      x: (w - w * 0.7) / 2, y: h - 114, w: w * 0.7, h: 44, color: Theme.color.orange,
    };
    this.backBtn = {
      id: 'back', label: '返回关卡选择',
      x: (w - w * 0.7) / 2, y: h - 60, w: w * 0.7, h: 44, color: Theme.color.grayDark,
    };
  }

  private get stage(): StageConfig | undefined {
    const id = this.game.player.selectedStageId;
    return id ? getStageById(id) : undefined;
  }

  handleClick(): void {
    this.layout();
    const hit = pollButtonTap(this.ctx, [this.startBtn, this.backBtn]);
    if (!hit) return;
    if (hit.id === 'start') {
      const id = this.game.player.selectedStageId;
      if (id) this.game.beginSelectedStage();
    } else if (hit.id === 'back') {
      this.game.returnToStageSelect();
    }
  }

  render(): void {
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const stage = this.stage;
    if (!stage) { return; }
    this.layout();

    // 背景
    c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
    c.fillRect(0, 0, w, h);

    const accent = stage.isBossStage ? Theme.color.red : Theme.color.cyan;
    const isBoss = !!stage.isBossStage;

    // 面板
    const panelW = w - 40;
    const panelH = h - 180; // 动态面板高度适配
    const panelX = 20, panelY = 60;
    drawPanel(c, panelX, panelY, panelW, panelH, { border: accent, borderSize: 2 });

    // 标题
    drawTitle(c, stage.name, stage.subtitle ?? undefined, { x: w / 2, y: panelY + 40, w });

    // Boss 关标识
    if (isBoss) {
      text(c, '⚠ BOSS 关 ⚠', w / 2, panelY + 128, { color: Theme.color.redBright, align: 'center', font: Theme.font.bodyBold });
    }

    // 推荐战力（任务6：用总战力对比）
    const lowPower = this.game.totalPower < stage.recommendedPower;
    text(c, `推荐战力 ${stage.recommendedPower}${lowPower ? '（不足，挑战较难）' : ''}`, w / 2, panelY + 160,
      { color: lowPower ? Theme.color.red : Theme.color.cyan, align: 'center', font: Theme.font.body });

    // 敌人信息（波次或单波）
    const waves = this.collectWaves(stage);
    let y = panelY + 200;
    if (waves.length > 1) {
      text(c, `共 ${waves.length} 波`, w / 2, y, { color: Theme.color.gold, align: 'center', font: Theme.font.bodyBold });
      y += 26;
    }
    for (let i = 0; i < waves.length; i++) {
      const wave = waves[i];
      const label = waves.length > 1 ? `第${i + 1}波 ${wave.name ?? ''}` : '敌人';
      text(c, label, panelX + 30, y, { color: Theme.color.white, font: Theme.font.body });
      const desc = wave.enemies.map(e => {
        const cfg = ENEMY_CONFIGS[e.enemyId];
        return `${cfg?.name ?? e.enemyId}×${e.count}`;
      }).join('  ');
      text(c, desc, panelX + 30, y + 20, { color: Theme.color.gray, font: Theme.font.small });
      y += 46;
    }

    const progression = findPublishedStageProgression(stage.contentStageId);
    if (progression) {
      text(c, '关卡目标', panelX + 30, y, { color: Theme.color.cyan, font: Theme.font.bodyBold });
      y += 24;
      for (const objective of progression.objectives.filter(item => item.enabled).slice(0, 4)) {
        text(c, `${objective.required ? '★' : '☆'} ${objective.displayText}`, panelX + 36, y,
          { color: objective.required ? Theme.color.white : Theme.color.gray, font: Theme.font.small });
        y += 20;
      }
    }

    // 奖励
    const rewardY = panelY + panelH - 70;
    text(c, '通关奖励', panelX + 30, rewardY, { color: Theme.color.gray, font: Theme.font.small });
    if (progression) {
      const previews = progression.rewardPools.reduce((items, pool) => items.concat(pool.entries.filter(item => item.enabled)), [] as typeof progression.rewardPools[number]['entries'])
        .slice(0, 3).map(item => `${item.rewardRefId}×${item.minQuantity}-${item.maxQuantity}`);
      text(c, previews.join('  ') || '无', panelX + 36, rewardY + 25, { color: Theme.color.gold, font: Theme.font.small });
    } else {
      circle(c, panelX + 50, rewardY + 28, 8, Theme.color.gold);
      text(c, `${stage.rewardGold} 金币`, panelX + 64, rewardY + 22, { color: Theme.color.gold, font: Theme.font.bodyBold });
      circle(c, panelX + 180, rewardY + 28, 8, Theme.color.cyan);
      text(c, `${stage.rewardParts} 零件`, panelX + 194, rewardY + 22, { color: Theme.color.cyan, font: Theme.font.bodyBold });
    }

    // 按钮
    drawButton(c, this.startBtn);
    drawButton(c, this.backBtn);
  }

  /** 收集波次（单波关卡也统一为数组） */
  private collectWaves(stage: StageConfig): StageWaveConfig[] {
    if (stage.waves && stage.waves.length > 0) return stage.waves;
    return [{ id: 'single', enemies: stage.enemies } as StageWaveConfig];
  }
}
