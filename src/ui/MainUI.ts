/**
 * 主界面 UI
 * ------------------------------------------------------------------
 * 显示：标题、机甲名、等级、战力、金币、零件、升级消耗预览
 * 按钮：开始战斗、升级机甲
 * 升级失败：显示「资源不足，无法升级」提示（2 秒淡出）
 *
 * 任务2：重写为有主题感的主页 —— 渐变背景 + 标题装饰线 + 橘猫机甲展示 +
 * 圆角信息卡 + 呼吸按钮。布局坐标与按钮命中区域保持兼容（按钮 id/逻辑不变）。
 */
import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { Button, pollButtonTap, drawButton, drawPanel, drawTitle } from './UIWidgets';
import { getUpgradeCost } from '../data/Upgrade';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, star, circle } from '../render/DrawUtils';
import { drawMecha } from '../render/MechaRenderer';
import { floatY, breathe, panelScale } from '../render/Effects';
import { ResourceManager } from '../core/ResourceManager';

export class MainUI {
  private buttons: Button[] = [];
  private guiBattleButton: Button | null = null;
  private guiExploreButton: Button | null = null;
  private toast = '';
  private toastTimer = 0;

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {
    this.layout();
    // 监听升级结果：失败弹 toast
    this.game.events.on('upgrade.result', (r: any) => {
      if (!r.ok) {
        this.toast = r.reason === 'gold' ? '金币不足，无法升级' : '机甲零件不足，无法升级';
        this.toastTimer = 2;
      } else {
        this.toast = `升级成功！Lv.${r.newLevel}`;
        this.toastTimer = 2;
      }
    });
  }

  /** 计算按钮布局（竖屏：两个按钮居中靠下） */
  private layout(): void {
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const btnW = w * 0.7;
    const btnH = 44;
    const gap = 6;
    const x = (w - btnW) / 2;
    const y0 = Math.max(340, h - 210);
    this.buttons = [
      { id: 'battle', label: this.game.hasPublishedCampaign ? '主线战役' : '进入章节', x, y: y0, w: btnW, h: btnH, color: '#ff8c1a' },
      { id: 'upgrade', label: '升级机甲', x, y: y0 + (btnH + gap), w: btnW, h: btnH, color: '#3a8' },
      { id: 'skill', label: '技能养成', x, y: y0 + (btnH + gap) * 2, w: btnW, h: btnH, color: '#4fd1e0' },
      { id: 'equip', label: '装备舱', x, y: y0 + (btnH + gap) * 3, w: btnW, h: btnH, color: '#c060e0' },
    ];
    const featureByButton: Record<string, string> = {
      battle: 'feature.campaign', skill: 'feature.skills', equip: 'feature.equipment',
    };
    for (const item of this.buttons) {
      const featureId = featureByButton[item.id];
      if (featureId && !this.game.isFeatureUnlocked(featureId)) {
        item.disabled = true; item.label = `${item.label}（未解锁）`;
      }
    }
    this.guiBattleButton = this.isGuiQuickEntryEnabled()
      ? { id: 'guiBattle', label: '战斗测试', x: 18, y: 86, w: 108, h: 34, color: Theme.color.orange }
      : null;
    this.guiExploreButton = this.isGuiQuickEntryEnabled()
      ? { id: 'guiExplore', label: '自由探索', x: 134, y: 86, w: 126, h: 34, color: Theme.color.cyan }
      : null;
  }

  /** 由 main 每帧调用：处理点击（必须在 render 前，且每帧调一次） */
  handleClick(): void {
    this.layout(); // 确保点击命中框使用最新的分辨率布局
    if (this.handleGuiQuickExploreClick()) return;
    if (this.handleGuiQuickBattleClick()) return;
    const hit = pollButtonTap(this.ctx, this.buttons);
    if (!hit) return;
    if (hit.id === 'battle') this.game.goToChapterSelect();
    else if (hit.id === 'upgrade') this.game.doUpgrade();
    else if (hit.id === 'skill') this.game.goToSkillPanel();
    else if (hit.id === 'equip') this.game.goToEquipmentPanel();
  }

  render(): void {
    if (this.toastTimer <= 0) {
      const notice = this.game.consumeFeatureUnlockNotice();
      if (notice) { this.toast = notice; this.toastTimer = 3; }
    }
    this.layout(); // 参数化适配分辨率

    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const time = this.ctx.now();
    const p = this.game.player;
    const stats = this.game.stats;
    const cfg = this.game.mechaConfig;
    const cost = getUpgradeCost(p.level);

    const rm = ResourceManager.getInstance();
    const bgImg = rm.getImage('main_bg');

    // 1. 渐变背景（深蓝黑 → 略亮）或背景图片
    if (bgImg) {
      c.drawImage(bgImg, 0, 0, w, h);
    } else {
      c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
      c.fillRect(0, 0, w, h);
    }

    // 2. 顶部标题
    drawTitle(c, '喵喵机甲：星核觉醒', '第一章 · 训练场启动', { x: w / 2, y: 54, w });

    // 3. 机甲展示区（圆角面板 + 浮动机甲）
    const cardX = 20, cardY = 120, cardW = w - 40, cardH = 210;
    drawPanel(c, cardX, cardY, cardW, cardH, { border: Theme.color.cyanDark, borderSize: 1.5 });

    // 机甲展示（左侧，浮动 + 能量环）
    drawMecha(c, {
      cx: cardX + 70, cy: cardY + 95, radius: 38,
      floatOffset: floatY(time, 4, 2),
      showRings: true, time,
    });

    // 机甲信息（右侧）
    const infoX = cardX + 140;
    text(c, cfg.name, infoX, cardY + 24, { font: Theme.font.titleSmall, color: Theme.color.orange });
    text(c, `Lv.${p.level}`, infoX, cardY + 54, { font: Theme.font.bodyBold, color: Theme.color.gold });
    text(c, `战力 ${this.game.totalPower}`, infoX, cardY + 78, { font: Theme.font.body, color: Theme.color.cyan });

    // 属性条（卡片下半区）
    const attrY = cardY + 120;
    text(c, '生命', infoX, attrY, { color: Theme.color.gray, font: Theme.font.small });
    text(c, `${stats.maxHp}`, infoX + 50, attrY, { color: Theme.color.green, font: Theme.font.bodyBold });
    text(c, '攻击', infoX + 110, attrY, { color: Theme.color.gray, font: Theme.font.small });
    text(c, `${stats.attack}`, infoX + 160, attrY, { color: Theme.color.red, font: Theme.font.bodyBold });

    // 资源栏（金色金币 + 青色零件）
    const resY = cardY + 150;
    const coinImg = rm.getImage('coin');
    const partImg = rm.getImage('part');

    if (coinImg) {
      c.drawImage(coinImg, infoX - 1, resY, 14, 14);
    } else {
      circle(c, infoX + 6, resY + 7, 7, Theme.color.gold);
    }
    text(c, `${p.gold}`, infoX + 18, resY, { color: Theme.color.gold, font: Theme.font.bodyBold });

    if (partImg) {
      c.drawImage(partImg, infoX + 83, resY, 14, 14);
    } else {
      circle(c, infoX + 90, resY + 7, 7, Theme.color.cyan);
    }
    text(c, `${p.parts}`, infoX + 102, resY, { color: Theme.color.cyan, font: Theme.font.bodyBold });

    // 升级消耗预览
    text(c, `升级消耗：${cost.gold} 金币 / ${cost.parts} 零件`, cardX + 16, cardY + 178, { color: Theme.color.gray, font: Theme.font.small });
    // 任务6：技能等级摘要
    const mcLvl = p.skillLevels?.meow_cannon ?? 1;
    const hsLvl = p.skillLevels?.heavy_shield ?? 1;
    text(c, `技能：喵能炮 Lv.${mcLvl} · 重甲护盾 Lv.${hsLvl}`, cardX + 16, cardY + 196, { color: Theme.color.cyan, font: Theme.font.small });

    // 4. 更新升级按钮状态（兼容原逻辑：disabled/label）
    this.buttons[1].label =
      p.gold >= cost.gold && p.parts >= cost.parts ? '升级机甲' : '升级机甲 (资源不足)';
    this.buttons[1].disabled = !(p.gold >= cost.gold && p.parts >= cost.parts);

    // 5. 按钮（呼吸高亮）
    for (const b of this.buttons) drawButton(c, b, time);
    if (this.guiBattleButton) drawButton(c, this.guiBattleButton, time);
    if (this.guiExploreButton) drawButton(c, this.guiExploreButton, time);

    // 6. toast（升级结果提示）
    if (this.toastTimer > 0) {
      this.toastTimer -= 1 / 60;
      const isOk = this.toast.includes('成功');
      text(c, this.toast, w / 2, 500, { color: isOk ? Theme.color.green : Theme.color.orange, align: 'center', font: Theme.font.bodyBold });
    }

    // 7. 底部操作提示
    text(c, 'WASD / 方向键移动（PC） · 触摸拖动移动（手机）', w / 2, h - 28,
      { color: Theme.color.gray, align: 'center', font: Theme.font.small });
  }

  handleGuiQuickBattleClick(): boolean {
    this.layout();
    const quickHit = this.guiBattleButton ? pollButtonTap(this.ctx, [this.guiBattleButton]) : null;
    if (!quickHit) return false;
    this.game.player.tutorialFinished = true;
    if (!this.game.player.unlockedStageIds.includes('1-1')) this.game.player.unlockedStageIds.push('1-1');
    if (this.game.startBattle('1-1')) this.game.beginBattle();
    return true;
  }

  handleGuiQuickExploreClick(): boolean {
    this.layout();
    const quickHit = this.guiExploreButton ? pollButtonTap(this.ctx, [this.guiExploreButton]) : null;
    if (!quickHit) return false;
    this.game.startExploreTraining();
    return true;
  }

  private isGuiQuickEntryEnabled(): boolean {
    const g: any = globalThis;
    if (g.__MEOW_DISABLE_GUI_QUICK_ENTRY__) return false;
    const platform = (this.ctx.getSystemInfo() as any).platform;
    return g.__MEOW_GUI_AUTOMATION__ === true || platform === 'devtools';
  }

}
