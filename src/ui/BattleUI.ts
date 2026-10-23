import { IContext, ICanvas2D } from '../engine/IContext';
import type { BattleFeedback } from '../battle/BattleFeedback';
import type { EnemyMouse } from '../enemy/EnemyMouse';
import type { PlayerMecha, SkillUseResult } from '../player/PlayerMecha';
import { text, fillRoundRect, strokeRoundRect, healthBar, circle } from '../render/DrawUtils';
import { Theme } from '../render/Theme';
import { DEFAULT_SKILL_IDS, getSkillConfig } from '../data/SkillConfig';
import type { RuntimeSkillState } from '../player/SkillState';
import { ResourceManager } from '../core/ResourceManager';
import { drawPanel } from './UIWidgets';
import { BATTLE_VISUAL_TUNING, getBattleHudSafeTop as resolveBattleHudSafeTop } from '../config/BattleAssets';
import { worldToScreen } from '../explore/WorldTransform';
import type { HeroVisualTemplate } from '../content/models/HeroVisualTemplate';
import type { GameManager } from '../core/GameManager';
import type { ExploreHudConfig } from '../content/models/StageOrchestration';

export interface SkillButton {
  skillId: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  hitR: number;
  shape: 'circle' | 'hex';
  showLabel: boolean;
}
export interface BattleHudSource {
  player: PlayerMecha | null;
  stage: { name: string };
  feedback: BattleFeedback;
  aliveEnemies: number;
  currentWaveEnemyTotal: number;
  totalEnemies: number;
  currentBoss: EnemyMouse | null;
  waveMessage: string | null;
  waveProgress: string;
  hudStatus?: string;
  objectiveHudText?: string;
  isExploreObjectiveCompleted?: boolean;
  coinCollected?: number;
  isEnded: boolean;
  getPlayerSkillStates(): RuntimeSkillState[];
  usePlayerSkill(skillId: string): SkillUseResult;
  getGuideTarget?(): any;
  nextActionText?: string;
  killGoalNoticeVisible?: boolean;
  completionNoticeVisible?: boolean;
  objective?: any;
  heroVisualTemplate?: HeroVisualTemplate;
  exploreHud?: ExploreHudConfig;
}

export function getBattleHudSafeTop(info: ReturnType<IContext['getSystemInfo']>): number {
  return resolveBattleHudSafeTop(info);
}

export function getBattleSkillButtonLayout(w: number, h: number, config?: ExploreHudConfig): SkillButton[] {
  const configuredSize = clampNumber(config?.skillButtonSize, 56, 88);
  const r = configuredSize ? configuredSize / 2 : Math.max(36, Math.min(40, w * 0.1));
  const rightPad = clampNumber(config?.skillButtonRight, 12, 48) ?? Math.max(20, w * 0.052);
  const bottomPad = clampNumber(config?.skillButtonBottom, 16, 72) ?? Math.max(24, h * 0.034);
  const cy = h - bottomPad - r;
  const gap = clampNumber(config?.skillButtonGap, 8, 36) ?? Math.max(18, r * 0.42);
  const hitR = r + 8;
  const shape = config?.skillButtonShape ?? 'circle';
  const showLabel = config?.showSkillLabels ?? false;
  return [
    { skillId: 'meow_cannon', label: '火力', cx: w - rightPad - r, cy, r, hitR, shape, showLabel },
    { skillId: 'heavy_shield', label: '护盾', cx: w - rightPad - r * 3 - gap, cy, r, hitR, shape, showLabel },
  ];
}

export interface ExploreHudLayout {
  topPanelHeight: 0;
  title: { x: number; y: number };
  leftDock: { x: number; y: number; w: number; h: number };
  rightDock: { x: number; y: number; w: number; h: number };
  exit: { x: number; y: number; w: number; h: number };
  panelOpacity: number;
}

/** 自由地图不占用顶部场景：标题居中，状态与操作分别停靠在左右。 */
export function getExploreHudLayout(w: number, _h: number, safeTop: number, config?: ExploreHudConfig): ExploreHudLayout {
  const compact = config?.layout === 'compact';
  const tactical = config?.layout === 'tactical';
  const dockW = tactical ? Math.min(118, Math.max(96, w * 0.29)) : compact ? Math.min(96, Math.max(78, w * 0.24)) : Math.min(112, Math.max(88, w * 0.28));
  const dockH = tactical ? 24 : compact ? 20 : 24;
  const sideY = safeTop + (tactical ? 34 : compact ? 26 : 42);
  return {
    topPanelHeight: 0,
    title: { x: w / 2, y: safeTop + (tactical ? 12 : compact ? 7 : 10) },
    leftDock: { x: 16, y: sideY, w: dockW, h: dockH },
    rightDock: { x: w - 16 - dockW, y: sideY, w: dockW, h: dockH },
    exit: { x: w - (tactical ? 70 : 62), y: sideY + dockH + (compact ? 5 : 8), w: tactical ? 54 : 46, h: compact ? 24 : 28 },
    panelOpacity: clampNumber(config?.panelOpacity, 0.35, 0.95) ?? 0.62,
  };
}

function clampNumber(value: number | undefined, min: number, max: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : undefined;
}

function traceSkillButton(c: ICanvas2D, btn: SkillButton, radius = btn.r): void {
  c.beginPath();
  if (btn.shape === 'circle') {
    c.arc(btn.cx, btn.cy, radius, 0, Math.PI * 2);
    return;
  }
  for (let index = 0; index < 6; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 3;
    const x = btn.cx + Math.cos(angle) * radius;
    const y = btn.cy + Math.sin(angle) * radius;
    if (index === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.closePath();
}

export class BattleUI {
  private skillButtons: SkillButton[] = [];
  private skillButtonFlash = new Map<string, number>();
  private exitConfirmVisible = false;

  constructor(
    private ctx: IContext,
    private battle: BattleHudSource,
    private game?: GameManager,
  ) {
    this.layout();
  }

  private layout(): void {
    this.skillButtons = getBattleSkillButtonLayout(
      this.ctx.canvasWidth,
      this.ctx.canvasHeight,
      this.battle.exploreHud,
    );
  }

  handleSkillInput(): void {
    if (this.exitConfirmVisible) return;
    this.layout();
    const { tapX, tapY } = this.ctx.input;
    if (tapX !== null && tapY !== null) {
      for (const btn of this.skillButtons) {
        const d = Math.hypot(tapX - btn.cx, tapY - btn.cy);
        if (d <= btn.hitR) {
          this.battle.usePlayerSkill(btn.skillId);
          this.skillButtonFlash.set(btn.skillId, this.ctx.now() + 0.18);
          this.ctx.input.consumeTap();
          return;
        }
      }
    }
  }

  handleStageExitInput(): void {
    if (!this.game || this.battle.isEnded) return;
    const w = this.ctx.canvasWidth; const safeTop = getBattleHudSafeTop(this.ctx.getSystemInfo());
    const exit = this.isExploreHud()
      ? getExploreHudLayout(w, this.ctx.canvasHeight, safeTop, this.battle.exploreHud).exit
      : { x: w - 68, y: safeTop + 32, w: 52, h: 28 };
    const tapX = this.ctx.input.tapX; const tapY = this.ctx.input.tapY;
    if (tapX == null || tapY == null) return;
    if (!this.exitConfirmVisible && tapX >= exit.x && tapX <= exit.x + exit.w && tapY >= exit.y && tapY <= exit.y + exit.h) {
      this.exitConfirmVisible = true; this.game.pauseCurrentStage(); this.ctx.input.consumeTap(); return;
    }
    if (!this.exitConfirmVisible) return;
    const panelX = 26; const panelY = this.ctx.canvasHeight * .34; const buttonY = panelY + 118;
    if (tapY >= buttonY && tapY <= buttonY + 38 && tapX >= panelX && tapX <= panelX + 148) {
      this.exitConfirmVisible = false; this.game.resumeCurrentStage(); this.ctx.input.consumeTap(); return;
    }
    if (tapY >= buttonY && tapY <= buttonY + 38 && tapX >= panelX + 160 && tapX <= panelX + 308) {
      this.exitConfirmVisible = false; this.ctx.input.consumeTap(); this.game.abortCurrentStage();
    }
  }

  render(): void {
    this.layout();
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const p = this.battle.player;
    if (!p) return;
    const safeTop = getBattleHudSafeTop(this.ctx.getSystemInfo());
    const isExploreHud = this.isExploreHud();
    const exploreLayout = isExploreHud ? getExploreHudLayout(w, h, safeTop, this.battle.exploreHud) : null;
    const tacticalHud = this.battle.exploreHud?.theme === 'industrial' || this.battle.exploreHud?.layout === 'tactical';
    const hudPanel = `rgba(7, 18, 29, ${exploreLayout?.panelOpacity ?? 0.62})`;

    // 顶部半透明信息条
    const barH = isExploreHud ? safeTop + 24 : safeTop + 54;
    if (!isExploreHud) {
      drawPanel(c, 0, 0, w, barH, {
        border: Theme.color.cyan,
        borderSize: 1.5,
        radius: 0
      });
    }
 
    // 关卡名
    if (exploreLayout) {
      if (tacticalHud) {
        fillRoundRect(c, w / 2 - 72, exploreLayout.title.y - 8, 144, 22, 3, hudPanel);
        strokeRoundRect(c, w / 2 - 72, exploreLayout.title.y - 8, 144, 22, 3, 'rgba(87, 235, 220, .65)', 1);
      }
      text(c, this.battle.stage.name, exploreLayout.title.x, exploreLayout.title.y, {
        color: Theme.color.gold, align: 'center', font: Theme.font.bodyBold,
      });
    } else {
      text(c, this.battle.stage.name, 16, safeTop + 6, { color: Theme.color.gold, font: Theme.font.bodyBold });
    }
 
    // 敌人剩余数
    const alive = this.battle.aliveEnemies;
    const total = this.battle.waveProgress ? this.battle.currentWaveEnemyTotal : this.battle.totalEnemies;
    if (isExploreHud) {
      const dock = exploreLayout!.rightDock;
      fillRoundRect(c, dock.x, dock.y, dock.w, dock.h, tacticalHud ? 3 : 4, hudPanel);
      strokeRoundRect(c, dock.x, dock.y, dock.w, dock.h, tacticalHud ? 3 : 4, tacticalHud ? 'rgba(255, 173, 67, .7)' : 'rgba(255, 255, 255, 0.15)', 1);
      circle(c, dock.x + 13, dock.y + dock.h / 2, 4, Theme.color.red);
      text(c, `存活 ${alive}`, dock.x + dock.w - 8, dock.y + dock.h / 2,
        { color: alive === 0 ? Theme.color.green : Theme.color.redBright, align: 'right', baseline: 'middle', font: Theme.font.small });
    } else {
      if (this.battle.hudStatus) {
        text(c, this.battle.hudStatus, w / 2, safeTop + 30, {
          color: this.battle.isExploreObjectiveCompleted ? Theme.color.green : Theme.color.cyan,
          align: 'center',
          font: Theme.font.small,
        });
      }
      circle(c, w - 94, safeTop + 14, 4, Theme.color.red);
      text(c, `敌人 ${alive}/${total}`, w - 16, safeTop + 6,
        { color: alive === 0 ? Theme.color.green : Theme.color.redBright, align: 'right', font: Theme.font.bodyBold });
    }
 
    // 玩家血条
    const bx = isExploreHud ? exploreLayout!.leftDock.x : 16;
    const by = isExploreHud ? exploreLayout!.leftDock.y : safeTop + 30;
    const bw = isExploreHud ? exploreLayout!.leftDock.w : Math.min(168, w * 0.42);
    const bh = isExploreHud ? 10 : 12;
    healthBar(c, bx, by, bw, bh, p.hpRatio, { danger: 0.3, showText: `${Math.ceil(p.hp)}/${p.maxHp}` });
 
    const collected = this.battle.coinCollected ?? this.battle.feedback.snapshot().collectedDrops;
    if (collected > 0) {
      text(c, `金币 +${collected}`, w - 16, isExploreHud ? exploreLayout!.exit.y + 34 : safeTop + 30,
        { color: Theme.color.gold, align: 'right', font: Theme.font.small });
    }
 
    if (isExploreHud) {
      const obj = this.battle.objective || {
        enemyKills: 0,
        enemyKillsRequired: 12,
        enemyKillGoalCompleted: false,
        resourcesCollected: 0,
        resourcesRequired: 3,
        resourceGoalCompleted: false,
        chestsOpened: 0,
        chestsRequired: 1,
        chestGoalCompleted: false,
        completed: false,
      };

      const isEnemyCompleted = obj.enemyKills >= obj.enemyKillsRequired;
      const isResourceCompleted = obj.resourcesCollected >= obj.resourcesRequired;
      const isChestCompleted = obj.chestsOpened >= obj.chestsRequired;
      const needsEnemy = obj.enemyKillsRequired > 0;
      const needsResource = obj.resourcesRequired > 0;
      const needsChest = obj.chestsRequired > 0;

      // 1. 左侧目标进度悬浮 Dock
      const leftDockX = exploreLayout!.leftDock.x;
      let leftDockY = exploreLayout!.leftDock.y + 18;
      const dockW = exploreLayout!.leftDock.w;
      const dockH = exploreLayout!.leftDock.h;
      const dockGap = 6;

      const drawDockItem = (textStr: string, isCompleted: boolean) => {
        const bgColor = isCompleted ? 'rgba(95, 224, 104, 0.16)' : hudPanel;
        const borderColor = isCompleted ? Theme.color.green : 'rgba(255, 255, 255, 0.15)';
        const textColor = isCompleted ? Theme.color.green : Theme.color.white;

        fillRoundRect(c, leftDockX, leftDockY, dockW, dockH, 4, bgColor);
        strokeRoundRect(c, leftDockX, leftDockY, dockW, dockH, 4, borderColor, 1);
        text(c, textStr, leftDockX + dockW / 2, leftDockY + dockH / 2, {
          color: textColor,
          align: 'center',
          baseline: 'middle',
          font: Theme.font.small,
        });
        leftDockY += dockH + dockGap;
      };

      const enemyText = isEnemyCompleted ? '敌√' : `敌 ${obj.enemyKills}/${obj.enemyKillsRequired}`;
      if (needsEnemy) drawDockItem(enemyText, isEnemyCompleted);

      const resourceText = isResourceCompleted ? '资√' : `资 ${obj.resourcesCollected}/${obj.resourcesRequired}`;
      if (needsResource) drawDockItem(resourceText, isResourceCompleted);

      const chestText = isChestCompleted ? '箱√' : `箱 ${obj.chestsOpened}/${obj.chestsRequired}`;
      if (needsChest) drawDockItem(chestText, isChestCompleted);

      // 2. 右侧导航悬浮 Dock
      const isAllCompleted = (!needsEnemy || isEnemyCompleted)
        && (!needsResource || isResourceCompleted) && (!needsChest || isChestCompleted);
      if (!isAllCompleted) {
        let navText = '完成';
        let navColor: string = Theme.color.green;
        let navBg = 'rgba(95, 224, 104, 0.12)';
        let navBorder: string = Theme.color.green;

        if (!isEnemyCompleted) {
          navText = '清敌';
          navColor = Theme.color.cyan;
          navBg = 'rgba(0, 240, 255, 0.08)';
          navBorder = 'rgba(0, 240, 255, 0.25)';
        } else if (needsResource && !isResourceCompleted) {
          navText = '找资源';
          navColor = Theme.color.cyan;
          navBg = 'rgba(0, 240, 255, 0.08)';
          navBorder = 'rgba(0, 240, 255, 0.25)';
        } else if (needsChest && !isChestCompleted) {
          navText = '开箱';
          navColor = Theme.color.cyan;
          navBg = 'rgba(0, 240, 255, 0.08)';
          navBorder = 'rgba(0, 240, 255, 0.25)';
        }

        const rightDockX = exploreLayout!.rightDock.x;
        const rightDockY = exploreLayout!.exit.y + exploreLayout!.exit.h + 8;
        fillRoundRect(c, rightDockX, rightDockY, dockW, dockH, 4, navBg);
        strokeRoundRect(c, rightDockX, rightDockY, dockW, dockH, 4, navBorder, 1);
        text(c, navText, rightDockX + dockW / 2, rightDockY + dockH / 2, {
          color: navColor,
          align: 'center',
          baseline: 'middle',
          font: Theme.font.small,
        });
      }
    } else {
      if (this.battle.objectiveHudText) {
        text(c, this.battle.objectiveHudText, w / 2, safeTop + 45, {
          color: this.battle.isExploreObjectiveCompleted ? Theme.color.green : Theme.color.white,
          align: 'center',
          font: Theme.font.small,
        });
      }
    }

    // 波次进度
    const waveProg = this.battle.waveProgress;
    if (waveProg && !isExploreHud) {
      text(c, `波次 ${waveProg}`, w / 2, safeTop + 6, { color: Theme.color.cyan, align: 'center', font: Theme.font.bodyBold });
    }

    // Boss 专属血条
    const boss = this.battle.currentBoss;
    let statusY = barH + 16;
    if (boss) {
      const bw = w - 48;
      const bx = 24;
      const by = barH + 10;
      const isCh2Boss = boss.variant === 'chapter2_boss';
      const isCh3Boss = boss.variant === 'chapter3_boss';
      const nameColor = isCh2Boss ? '#a060e0' : isCh3Boss ? '#ff3300' : Theme.color.redBright;
      const barColor = isCh3Boss ? '#ff5500' : undefined;
      text(c, `☠ ${boss.name}`, w / 2, by - 18, { color: nameColor, align: 'center', font: Theme.font.bodyBold });
      healthBar(c, bx, by, bw, 10, boss.hpRatio, { danger: 0.3, color: barColor });
      statusY = by + 22;
    }

    // 玩家状态 UI 提示
    if (p.statusEffects.has('poison')) {
      const poison = p.statusEffects.getPoison()!;
      const rm = ResourceManager.getInstance();
      const poisonImg = rm.getImage('status_poison');
      if (rm.isLoaded('status_poison') && poisonImg) {
        c.drawImage(poisonImg, 16, statusY - 12, 16, 16);
        text(c, `POISON ${Math.ceil(poison.remaining)}s`, 36, statusY, { color: '#5fe068', font: Theme.font.bodyBold });
      } else {
        text(c, `☠ POISON ${Math.ceil(poison.remaining)}s`, 16, statusY, { color: '#5fe068', font: Theme.font.bodyBold });
      }
      statusY += 20;
    }

    if (p.statusEffects.has('burn')) {
      const burn = p.statusEffects.getBurn()!;
      const rm = ResourceManager.getInstance();
      const burnImg = rm.getImage('status_burn');
      if (rm.isLoaded('status_burn') && burnImg) {
        c.drawImage(burnImg, 16, statusY - 12, 16, 16);
        text(c, `BURN ${Math.ceil(burn.remaining)}s`, 36, statusY, { color: '#ff5500', font: Theme.font.bodyBold });
      } else {
        text(c, `🔥 BURN ${Math.ceil(burn.remaining)}s`, 16, statusY, { color: '#ff5500', font: Theme.font.bodyBold });
      }
      statusY += 20;
    }

    // 波次切换提示
    const waveMsg = this.battle.waveMessage;
    if (waveMsg && (!isExploreHud || this.battle.exploreHud?.showWaveNotice !== false)) {
      const noticeY = Math.max(safeTop + 76, h * BATTLE_VISUAL_TUNING.waveNoticeYRatio);
      const noticeW = Math.min(w - 48, 248);
      const noticeH = 34;
      fillRoundRect(c, (w - noticeW) / 2, noticeY - noticeH / 2, noticeW, noticeH, 8, BATTLE_VISUAL_TUNING.waveNoticePanel);
      text(c, waveMsg, w / 2, noticeY, {
        color: Theme.color.gold,
        align: 'center',
        baseline: 'middle',
        font: Theme.font.bodyBold,
      });
    }

    // 虚拟摇杆占位
    const ix = this.ctx.input.moveX, iy = this.ctx.input.moveY;
    if (ix !== 0 || iy !== 0) {
      c.save();
      c.globalAlpha = 0.3;
      c.strokeStyle = Theme.color.cyan;
      c.lineWidth = 2;
      c.beginPath(); c.arc(60, h - 60, 40, 0, Math.PI * 2); c.stroke();
      c.fillStyle = Theme.color.cyan;
      c.beginPath(); c.arc(60 + ix * 20, h - 60 + iy * 20, 14, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    // 技能按钮
    if (!this.battle.isEnded) {
      const states = this.battle.getPlayerSkillStates();
      for (const btn of this.skillButtons) {
        this.drawSkillButton(c, btn, states);
      }
    }
    this.drawExitControl(c, w, h, safeTop, exploreLayout?.exit);

    // 任务16: 边缘方向指示器与公告提示
    if (isExploreHud) {
      if (this.battle.getGuideTarget) {
        const guideTarget = this.battle.getGuideTarget();
        if (guideTarget && guideTarget.type !== 'complete' && !guideTarget.visibleOnScreen) {
          const playerScreen = worldToScreen((this.battle as any).camera, p);
          const targetScreen = worldToScreen((this.battle as any).camera, { x: guideTarget.worldX, y: guideTarget.worldY });
          const px = playerScreen.x;
          const py = playerScreen.y;
          const tx = targetScreen.x;
          const ty = targetScreen.y;
          const minX = 20;
          const maxX = w - 20;
          const minY = barH + 10;
          const maxY = h - 30;

          const dx = tx - px;
          const dy = ty - py;
          let tMin = Infinity;
          if (dx < 0) {
            const t = (minX - px) / dx;
            if (t > 0 && t < tMin) tMin = t;
          } else if (dx > 0) {
            const t = (maxX - px) / dx;
            if (t > 0 && t < tMin) tMin = t;
          }
          if (dy < 0) {
            const t = (minY - py) / dy;
            if (t > 0 && t < tMin) tMin = t;
          } else if (dy > 0) {
            const t = (maxY - py) / dy;
            if (t > 0 && t < tMin) tMin = t;
          }
          let ax = px;
          let ay = py;
          if (isFinite(tMin)) {
            ax = px + tMin * dx;
            ay = py + tMin * dy;
          } else {
            ax = Math.max(minX, Math.min(maxX, tx));
            ay = Math.max(minY, Math.min(maxY, ty));
          }

          if (ax < 96 && ay < safeTop + 160) {
            ay = safeTop + 160;
          }
          if (ax > w - 96 && ay < safeTop + 100) {
            ay = safeTop + 100;
          }

          if (ax < 120 && ay > h - 120) {
            if (ax < minX + 20) ay = h - 120;
            else ax = 120;
          }
          if (ax > w - 120 && ay > h - 120) {
            if (ax > maxX - 20) ay = h - 120;
            else ax = w - 120;
          }

          const angle = Math.atan2(dy, dx);
          c.save();
          c.translate(ax, ay);
          c.rotate(angle);
          c.fillStyle = guideTarget.type === 'resource' ? Theme.color.cyan : guideTarget.type === 'chest' ? Theme.color.gold : Theme.color.redBright;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(-12, -8);
          c.lineTo(-12, 8);
          c.closePath();
          c.fill();
          c.restore();

          const norm = Math.hypot(dx, dy) || 1;
          const offsetDist = 28;
          const txLabel = ax - (dx / norm) * offsetDist;
          const tyLabel = ay - (dy / norm) * offsetDist;
          let labelColor: string = Theme.color.white;
          let labelName = '目标';
          if (guideTarget.type === 'resource') {
            labelColor = Theme.color.cyan;
            labelName = '资源';
          } else if (guideTarget.type === 'chest') {
            labelColor = Theme.color.gold;
            labelName = '宝箱';
          } else if (guideTarget.type === 'enemy') {
            labelColor = Theme.color.redBright;
            labelName = '敌人';
          }
          text(c, `${labelName} ${guideTarget.distance}`, txLabel, tyLabel, {
            color: labelColor,
            align: 'center',
            baseline: 'middle',
            font: Theme.font.small,
          });
        }
      }

      if (this.battle.killGoalNoticeVisible) {
        const noticeY = h * 0.35;
        const noticeW = Math.min(w - 48, 280);
        const noticeH = 44;
        fillRoundRect(c, (w - noticeW) / 2, noticeY - noticeH / 2, noticeW, noticeH, 8, 'rgba(10, 20, 36, 0.88)');
        c.save();
        c.strokeStyle = Theme.color.orange;
        c.lineWidth = 1.5;
        c.strokeRect((w - noticeW) / 2, noticeY - noticeH / 2, noticeW, noticeH);
        c.restore();
        text(c, '清剿完成，敌人刷新已停止', w / 2, noticeY, {
          color: Theme.color.orange,
          align: 'center',
          baseline: 'middle',
          font: Theme.font.bodyBold,
        });
      }

      if (this.battle.completionNoticeVisible) {
        const noticeY = h * 0.45;
        const noticeW = Math.min(w - 40, 300);
        const noticeH = 80;
        fillRoundRect(c, (w - noticeW) / 2, noticeY - noticeH / 2, noticeW, noticeH, 12, 'rgba(6, 18, 30, 0.94)');
        c.save();
        c.strokeStyle = Theme.color.gold;
        c.lineWidth = 2;
        c.strokeRect((w - noticeW) / 2, noticeY - noticeH / 2, noticeW, noticeH);
        c.restore();
        text(c, '★ 训练完成 ★', w / 2, noticeY - 14, {
          color: Theme.color.gold,
          align: 'center',
          baseline: 'middle',
          font: Theme.font.titleSmall,
        });
        text(c, '本轮训练目标已完成', w / 2, noticeY + 16, {
          color: Theme.color.white,
          align: 'center',
          baseline: 'middle',
          font: Theme.font.body,
        });
      }
    }
  }

  private isExploreHud(): boolean {
    return Boolean(this.battle.hudStatus || this.battle.objectiveHudText);
  }

  private drawExitControl(
    c: ICanvas2D, w: number, h: number, safeTop: number,
    exploreExit?: ExploreHudLayout['exit'],
  ): void {
    if (!this.game || this.battle.isEnded) return;
    const exit = exploreExit ?? { x: w - 68, y: safeTop + 32, w: 52, h: 28 };
    const tactical = this.battle.exploreHud?.theme === 'industrial' || this.battle.exploreHud?.layout === 'tactical';
    fillRoundRect(c, exit.x, exit.y, exit.w, exit.h, tactical ? 3 : 6, 'rgba(8, 19, 30, .88)');
    strokeRoundRect(c, exit.x, exit.y, exit.w, exit.h, tactical ? 3 : 6, tactical ? 'rgba(255, 173, 67, .72)' : Theme.color.gray, 1);
    text(c, tactical ? '撤离' : '退出', exit.x + exit.w / 2, exit.y + exit.h / 2, { color: tactical ? Theme.color.gold : Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small });
    if (!this.exitConfirmVisible) return;
    const panelX = 26; const panelY = h * .34; const panelW = w - 52; const buttonY = panelY + 118;
    fillRoundRect(c, panelX, panelY, panelW, 170, 10, 'rgba(5, 13, 23, .96)');
    strokeRoundRect(c, panelX, panelY, panelW, 170, 10, Theme.color.cyan, 1.5);
    text(c, '确定退出本关吗？', w / 2, panelY + 30, { color: Theme.color.gold, align: 'center', font: Theme.font.bodyBold });
    text(c, '本次关卡不会结算通关，也不会获得星级和关卡奖励。', w / 2, panelY + 60, { color: Theme.color.white, align: 'center', font: Theme.font.small });
    fillRoundRect(c, panelX, buttonY, 148, 38, 6, Theme.color.grayDark);
    fillRoundRect(c, panelX + 160, buttonY, 148, 38, 6, Theme.color.orange);
    text(c, '继续战斗', panelX + 74, buttonY + 19, { color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.bodyBold });
    text(c, '退出本关', panelX + 234, buttonY + 19, { color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.bodyBold });
  }

  private drawSkillButton(c: ICanvas2D, btn: SkillButton, states: RuntimeSkillState[]): void {
    const state = states.find(s => s.skillId === btn.skillId);
    const cfg = getSkillConfig(btn.skillId);
    const usable = state ? state.cooldownRemaining <= 0 : false;
    const isActive = state?.isActive ?? false;
    const isDamage = cfg?.type === 'damage';
    const baseColor = isActive ? Theme.color.cyan : isDamage ? Theme.color.orange : Theme.color.cyan;

    const rm = ResourceManager.getInstance();
    const imgKey = btn.skillId === 'meow_cannon' ? 'skill_cannon' : 'skill_shield';
    const artKey = btn.skillId === 'meow_cannon'
      ? this.battle.heroVisualTemplate?.skills.cannonIconArtKey
      : this.battle.heroVisualTemplate?.skills.shieldIconArtKey;
    const img = rm.getImageByArtKey(artKey) ?? rm.getImage(imgKey);
    const maxCooldown = cfg ? Math.max(...cfg.effects.map(e => e.cooldown ?? 0), 1) : 1;
    const cooldownRatio = state && state.cooldownRemaining > 0
      ? Math.max(0, Math.min(1, state.cooldownRemaining / maxCooldown))
      : 0;
    c.save();
    c.globalAlpha = isActive ? 0.5 : 0.28;
    c.fillStyle = baseColor;
    traceSkillButton(c, btn, btn.r + 7); c.fill();
    c.restore();
    const flashUntil = this.skillButtonFlash.get(btn.skillId) ?? 0;
    if (flashUntil > this.ctx.now()) {
      const t = Math.max(0, Math.min(1, (flashUntil - this.ctx.now()) / 0.18));
      c.save();
      c.globalAlpha = 0.35 + t * 0.35;
      c.strokeStyle = Theme.color.white;
      c.lineWidth = 3;
      c.beginPath(); c.arc(btn.cx, btn.cy, btn.r + 10 * (1 - t), 0, Math.PI * 2); c.stroke();
      c.restore();
    }
    if (img) {
      c.save();

      c.save();
      c.beginPath();
      traceSkillButton(c, btn);
      c.clip();
      c.drawImage(img, btn.cx - btn.r, btn.cy - btn.r, btn.r * 2, btn.r * 2);
      c.restore();

      c.strokeStyle = usable ? Theme.color.white : Theme.color.gray;
      c.lineWidth = 2;
      traceSkillButton(c, btn); c.stroke();

      if (!usable) {
        c.save();
        c.fillStyle = 'rgba(0, 0, 0, 0.6)';
        traceSkillButton(c, btn); c.fill();
        c.restore();
      }

      if (cooldownRatio > 0) {
        c.fillStyle = 'rgba(10, 14, 26, 0.72)';
        c.beginPath();
        c.moveTo(btn.cx, btn.cy);
        c.arc(btn.cx, btn.cy, btn.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownRatio);
        c.closePath();
        c.fill();
      }

      if (state && state.cooldownRemaining > 0) {
        text(c, Math.ceil(state.cooldownRemaining).toString(), btn.cx, btn.cy, {
          color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.titleSmall,
        });
      }
      if (btn.showLabel) {
        fillRoundRect(c, btn.cx - 24, btn.cy + btn.r - 6, 48, 16, 3, 'rgba(5, 14, 24, .9)');
        text(c, btn.label, btn.cx, btn.cy + btn.r + 2, {
          color: baseColor, align: 'center', baseline: 'middle', font: Theme.font.small,
        });
      }
      c.restore();
      return;
    }

    c.save();
    c.globalAlpha = 1;
    c.fillStyle = usable ? baseColor : Theme.color.grayDark;
    traceSkillButton(c, btn); c.fill();
    c.strokeStyle = usable ? Theme.color.white : Theme.color.gray;
    c.lineWidth = 2;
    traceSkillButton(c, btn); c.stroke();
    text(c, btn.label, btn.cx, btn.cy, {
      color: usable ? Theme.color.white : Theme.color.gray,
      align: 'center', baseline: 'middle', font: Theme.font.titleSmall,
    });
    if (state && state.cooldownRemaining > 0) {
      c.fillStyle = 'rgba(10, 14, 26, 0.72)';
      c.beginPath();
      c.moveTo(btn.cx, btn.cy);
      c.arc(btn.cx, btn.cy, btn.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownRatio);
      c.closePath();
      c.fill();
      text(c, Math.ceil(state.cooldownRemaining).toString(), btn.cx, btn.cy + 14, {
        color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.bodyBold,
      });
    }
    c.restore();
  }
}
