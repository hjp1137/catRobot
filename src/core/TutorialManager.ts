import { IContext, ICanvas2D } from '../engine/IContext';
import { GameManager } from './GameManager';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, text } from '../render/DrawUtils';
import { ResourceManager } from './ResourceManager';
import { TUTORIAL_FEATURES, TUTORIAL_STATIC_TARGETS } from '../tutorial/TutorialCatalog';

export type TutorialStep =
  | 'TUTORIAL_START'      // 主页：高亮“进入章节”
  | 'CHAPTER_SELECT'     // 章节选择：高亮第一章
  | 'STAGE_SELECT'       // 关卡选择：高亮 1-1
  | 'STAGE_INTRO'        // 关卡介绍：高亮“开始挑战”
  | 'BATTLE_MOVE'        // 局内：移动指引
  | 'BATTLE_CANNON'      // 局内：高亮喵能炮，指引释放
  | 'BATTLE_SHIELD'      // 局内：高亮重甲护盾，指引释放
  | 'BATTLE_FIGHT'       // 局内：自由战斗（不拦截）
  | 'RESULT_BACK'        // 结算：高亮“返回车库”
  | 'TUTORIAL_EQUIP'     // 主页：高亮“装备舱”
  | 'EQUIP_SELECT'       // 装备舱：高亮背包第一件装备
  | 'EQUIP_WEAR'         // 装备详情：高亮穿戴按钮
  | 'FINISHED';          // 已结束

export class TutorialManager {
  public static readonly SHARED_CATALOG = Object.freeze({
    features: TUTORIAL_FEATURES,
    targets: TUTORIAL_STATIC_TARGETS,
  });
  private step: TutorialStep = 'TUTORIAL_START';
  private accumulatedMoveTime = 0;
  private currentTip = '';

  constructor(
    private ctx: IContext,
    private game: GameManager
  ) {
    this.initStep();
  }

  private initStep(): void {
    const finished = !!this.game.player.tutorialFinished;
    if (finished) {
      this.step = 'FINISHED';
    } else {
      this.restoreStep();
    }
  }

  public restoreStep(): void {
    const player = this.game.player;
    if (player.tutorialFinished) {
      this.step = 'FINISHED';
      return;
    }
    const forceEnable = !!(this.game as any).enableTutorial;
    if (!forceEnable) {
      this.step = 'FINISHED';
      return;
    }

    const scene = this.game.scene;
    const hasCleared1_1 = !!player.stageProgress['1-1']?.cleared;

    if (hasCleared1_1) {
      const equipped = Object.keys(player.equipmentInventory.equipped).length > 0;
      if (equipped) {
        this.finishTutorial();
        return;
      }

      if (scene === 'equipmentPanel') {
        const ui = this.game.equipmentPanelUi;
        if (ui && (ui as any).selectedItem && !(ui as any).selectedIsEquipped) {
          this.step = 'EQUIP_WEAR';
        } else {
          this.step = 'EQUIP_SELECT';
        }
      } else {
        this.step = 'TUTORIAL_EQUIP';
      }
    } else {
      if (this.isCombatScene(scene)) {
        const states = this.combatRuntime()?.player?.skillState;
        if (states) {
          const cannon = states.get('meow_cannon');
          const shield = states.get('heavy_shield');
          if (cannon && cannon.cdRemaining > 0) {
            if (shield && shield.cdRemaining > 0) {
              this.step = 'BATTLE_FIGHT';
            } else {
              this.step = 'BATTLE_SHIELD';
            }
          } else {
            this.step = 'BATTLE_CANNON';
          }
        } else {
          this.step = 'BATTLE_MOVE';
          this.accumulatedMoveTime = 0;
        }
      } else if (scene === 'stageIntro') {
        this.step = 'STAGE_INTRO';
      } else if (scene === 'stageSelect') {
        this.step = 'STAGE_SELECT';
      } else if (scene === 'chapterSelect') {
        this.step = 'CHAPTER_SELECT';
      } else if (scene === 'result') {
        const outcome = this.game.lastOutcome;
        if (outcome && outcome.win) {
          this.step = 'RESULT_BACK';
        } else {
          this.step = 'BATTLE_MOVE';
          this.accumulatedMoveTime = 0;
        }
      } else {
        this.step = 'TUTORIAL_START';
      }
    }
  }


  public isActive(): boolean {
    return this.step !== 'FINISHED';
  }

  public getStep(): TutorialStep {
    return this.step;
  }

  public update(dt: number): void {
    if (!this.isActive()) return;
    this.runStateTransition(dt);
  }

  private runStateTransition(dt: number): void {
    const scene = this.game.scene;
    const player = this.game.player;

    switch (this.step) {
      case 'TUTORIAL_START':
        if (scene === 'chapterSelect') this.step = 'CHAPTER_SELECT';
        break;
      case 'CHAPTER_SELECT':
        if (scene === 'stageSelect') this.step = 'STAGE_SELECT';
        else if (scene === 'menu') this.step = 'TUTORIAL_START';
        break;
      case 'STAGE_SELECT':
        if (scene === 'stageIntro') this.step = 'STAGE_INTRO';
        else if (scene === 'chapterSelect') this.step = 'CHAPTER_SELECT';
        break;
      case 'STAGE_INTRO':
        if (this.isCombatScene(scene)) {
          this.step = 'BATTLE_MOVE';
          this.accumulatedMoveTime = 0;
        } else if (scene === 'stageSelect') {
          this.step = 'STAGE_SELECT';
        }
        break;
      case 'BATTLE_MOVE':
        if (this.isCombatScene(scene)) {
          if ((this.ctx as any).playerMoved) {
            this.accumulatedMoveTime += dt;
            (this.ctx as any).playerMoved = false;
          }
          if (this.accumulatedMoveTime >= 1.5) {
            this.step = 'BATTLE_CANNON';
          }
        } else {
          this.step = 'STAGE_SELECT';
        }
        break;
      case 'BATTLE_CANNON':
        if (this.isCombatScene(scene)) {
          const state = this.combatRuntime()?.player?.skillState?.get('meow_cannon');
          if (state && state.cdRemaining > 0) {
            this.step = 'BATTLE_SHIELD';
          }
        } else {
          this.step = 'STAGE_SELECT';
        }
        break;
      case 'BATTLE_SHIELD':
        if (this.isCombatScene(scene)) {
          const state = this.combatRuntime()?.player?.skillState?.get('heavy_shield');
          if (state && state.cdRemaining > 0) {
            this.step = 'BATTLE_FIGHT';
          }
        } else {
          this.step = 'STAGE_SELECT';
        }
        break;
      case 'BATTLE_FIGHT':
        if (scene === 'result') {
          const outcome = this.game.lastOutcome;
          if (outcome && outcome.win) {
            this.step = 'RESULT_BACK';
          } else {
            this.step = 'BATTLE_MOVE';
            this.accumulatedMoveTime = 0;
          }
        }
        break;
      case 'RESULT_BACK':
        if (scene === 'menu') {
          this.step = 'TUTORIAL_EQUIP';
        }
        break;
      case 'TUTORIAL_EQUIP':
        if (scene === 'equipmentPanel') {
          this.step = 'EQUIP_SELECT';
        }
        break;
      case 'EQUIP_SELECT':
        if (scene === 'equipmentPanel' && this.game.equipmentPanelUi) {
          const ui = this.game.equipmentPanelUi;
          if ((ui as any).selectedItem && !(ui as any).selectedIsEquipped) {
            this.step = 'EQUIP_WEAR';
          }
        } else if (scene === 'menu') {
          this.step = 'TUTORIAL_EQUIP';
        }
        break;
      case 'EQUIP_WEAR':
        if (scene === 'equipmentPanel' && this.game.equipmentPanelUi) {
          const ui = this.game.equipmentPanelUi;
          // 当选中装备变为空（已穿戴弹窗自动关闭）或者装备被装备上，流转至完成
          const equipped = Object.keys(player.equipmentInventory.equipped).length > 0;
          if (!(ui as any).selectedItem || equipped) {
            this.finishTutorial();
          }
        } else if (scene === 'menu') {
          this.step = 'TUTORIAL_EQUIP';
        }
        break;
    }
  }

  private finishTutorial(): void {
    this.step = 'FINISHED';
    this.game.player.tutorialFinished = true;
    this.game.save.save(this.game.player);
    this.game.events.emit('player.data.changed');
  }

  private isCombatScene(scene: string): boolean {
    return scene === 'battle' || scene === 'explore';
  }

  private combatRuntime(): any {
    return this.game.scene === 'explore' ? this.game.explore : this.game.battle;
  }

  public getTargetArea(): any {
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const btnW = w * 0.7;
    const btnX = (w - btnW) / 2;
    const btnH = 44;
    const gap = 6;
    const y0 = Math.max(340, h - 210);

    switch (this.step) {
      case 'TUTORIAL_START':
        return { type: 'rect', x: btnX, y: y0, w: btnW, h: btnH };
      case 'CHAPTER_SELECT':
        return { type: 'rect', x: 20, y: 130, w: w - 40, h: 110 };
      case 'STAGE_SELECT':
        return { type: 'rect', x: 20, y: 110, w: w - 40, h: 70 };
      case 'STAGE_INTRO':
        return { type: 'rect', x: btnX, y: h - 114, w: btnW, h: 44 };
      case 'BATTLE_CANNON': {
        const r = 30;
        return { type: 'circle', cx: w - 50 - r, cy: h - 60 - r, r };
      }
      case 'BATTLE_SHIELD': {
        const r = 30;
        return { type: 'circle', cx: w - 50 - r * 2 - 16, cy: h - 60 - r, r };
      }
      case 'RESULT_BACK':
        return { type: 'rect', x: btnX, y: h - 68, w: btnW, h: 44 };
      case 'TUTORIAL_EQUIP':
        return { type: 'rect', x: btnX, y: y0 + (btnH + gap) * 3, w: btnW, h: btnH };
      case 'EQUIP_SELECT': {
        return { type: 'rect', x: 20, y: 352, w: w - 40, h: 44 };
      }
      case 'EQUIP_WEAR': {
        const dialogW = Math.min(320, w - 40);
        const dialogX = (w - dialogW) / 2;
        const dialogH = 350;
        const dialogY = (h - dialogH) / 2;
        const btnW1 = (dialogW - 40 - 12) / 3;
        const btnY1 = dialogY + dialogH - 112;
        return { type: 'rect', x: dialogX + 20, y: btnY1, w: btnW1, h: 44 };
      }
      default:
        return null;
    }
  }

  public handleInput(): boolean {
    const { tapX, tapY } = this.ctx.input;
    if (tapX === null || tapY === null) return false;

    if (this.game.scene === 'menu' && this.game.menuUi?.handleGuiQuickBattleClick?.()) {
      return true;
    }

    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;

    // 1. 检查跳过按钮命中
    const skipW = 70;
    const skipH = 44;
    const skipX = w - skipW - 15;
    const skipY = 15;
    if (tapX >= skipX && tapX <= skipX + skipW && tapY >= skipY && tapY <= skipY + skipH) {
      this.finishTutorial();
      this.ctx.input.consumeTap();
      return true;
    }

    // 2. 检查特定状态的拦截
    if (this.step === 'BATTLE_MOVE' || this.step === 'BATTLE_FIGHT' || this.step === 'FINISHED') {
      return false; // 放行
    }

    const area = this.getTargetArea();
    if (!area) return false;

    let hit = false;
    if (area.type === 'rect') {
      hit = tapX >= area.x && tapX <= area.x + area.w && tapY >= area.y && tapY <= area.y + area.h;
    } else if (area.type === 'circle') {
      hit = Math.hypot(tapX - area.cx, tapY - area.cy) <= area.r;
    }

    if (hit) {
      return false; // 命中了高亮区，放行！
    } else {
      // 没命中高亮区，拦截！消费 tap 以防穿透！
      this.ctx.input.consumeTap();
      return true;
    }
  }

  public render(): void {
    if (!this.isActive()) return;

    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const time = this.ctx.now();

    c.save();

    // 1. 获取当前高亮区，并绘制拼图蒙层
    const area = this.getTargetArea();
    c.fillStyle = 'rgba(0, 0, 0, 0.65)';

    if (area) {
      if (area.type === 'rect') {
        const { x, y, w: aw, h: ah } = area;
        // 上
        c.fillRect(0, 0, w, y);
        // 下
        c.fillRect(0, y + ah, w, h - (y + ah));
        // 左
        c.fillRect(0, y, x, ah);
        // 右
        c.fillRect(x + aw, y, w - (x + aw), ah);

        // 绘制高亮霓虹边框
        c.strokeStyle = Theme.color.cyan;
        c.lineWidth = 2;
        strokeRoundRect(c, x - 2, y - 2, aw + 4, ah + 4, Theme.radius.sm, Theme.color.cyan, 2);
      } else if (area.type === 'circle') {
        const { cx, cy, r } = area;
        // 拼图包围圆形所在的正方形
        c.fillRect(0, 0, w, cy - r);
        c.fillRect(0, cy + r, w, h - (cy + r));
        c.fillRect(0, cy - r, cx - r, r * 2);
        c.fillRect(cx + r, cy - r, w - (cx + r), r * 2);

        // 绘制圆形霓虹边框
        c.strokeStyle = Theme.color.cyan;
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(cx, cy, r + 2, 0, Math.PI * 2);
        c.stroke();
      }
    } else {
      // 全屏半透
      c.fillRect(0, 0, w, h);
    }

    // 2. 绘制跳过按钮 (右上角)
    const skipW = 70;
    const skipH = 44;
    const skipX = w - skipW - 15;
    const skipY = 15;
    fillRoundRect(c, skipX, skipY, skipW, skipH, 4, 'rgba(0, 0, 0, 0.8)');
    strokeRoundRect(c, skipX, skipY, skipW, skipH, 4, Theme.color.gray, 1);
    text(c, '跳过', skipX + skipW / 2, skipY + skipH / 2, {
      color: Theme.color.white,
      align: 'center',
      baseline: 'middle',
      font: Theme.font.small
    });

    // 3. 绘制文字指引与箭头
    const tip = this.getTipText();
    if (tip && area) {
      let arrowX = 0;
      let arrowY = 0;
      let boxY = 0;

      if (area.type === 'rect') {
        const { x, y, w: aw, h: ah } = area;
        arrowX = x + aw / 2 - 16;
        arrowY = y - 42 + Math.sin(time * 6) * 6;
        boxY = y > h * 0.45 ? y - 110 : y + ah + 40;
      } else {
        const { cx, cy, r } = area;
        arrowX = cx - 16;
        arrowY = cy - r - 42 + Math.sin(time * 6) * 6;
        boxY = cy > h * 0.45 ? cy - r - 110 : cy + r + 40;
      }

      // 绘制跳动箭头
      const img = ResourceManager.getInstance().getImage('ui_tutorial_arrow');
      if (img) {
        c.drawImage(img, arrowX, arrowY, 32, 32);
      } else {
        // Canvas 三角形兜底
        c.fillStyle = Theme.color.orange;
        c.beginPath();
        c.moveTo(arrowX + 16, arrowY + 28);
        c.lineTo(arrowX + 6, arrowY + 12);
        c.lineTo(arrowX + 26, arrowY + 12);
        c.closePath();
        c.fill();
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1;
        c.stroke();
      }

      // 绘制文案底框 (自适应位置)
      const boxW = w * 0.86;
      const boxH = 56;
      const boxX = (w - boxW) / 2;
      fillRoundRect(c, boxX, boxY, boxW, boxH, Theme.radius.sm, 'rgba(10, 16, 26, 0.92)');
      strokeRoundRect(c, boxX, boxY, boxW, boxH, Theme.radius.sm, Theme.color.cyan, 1.2);

      // 绘制特定阶段的提示素材
      let iconImg: any = null;
      let isSkillStep = this.step === 'BATTLE_CANNON' || this.step === 'BATTLE_SHIELD';
      let isEquipStep = this.step === 'TUTORIAL_EQUIP' || this.step === 'EQUIP_SELECT' || this.step === 'EQUIP_WEAR';

      if (isSkillStep) {
        iconImg = ResourceManager.getInstance().getImage('ui_tutorial_skill');
      } else if (isEquipStep) {
        iconImg = ResourceManager.getInstance().getImage('ui_tutorial_equip');
      }

      if (iconImg) {
        c.drawImage(iconImg, boxX + 12, boxY + 12, 32, 32);
      } else if (isSkillStep) {
        // 技能提示素材加载失败：Canvas 圆形和加号兜底
        c.fillStyle = Theme.color.orange;
        c.beginPath();
        c.arc(boxX + 28, boxY + 28, 16, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.fillRect(boxX + 26, boxY + 18, 4, 20);
        c.fillRect(boxX + 18, boxY + 26, 20, 4);
      } else if (isEquipStep) {
        // 装备提示素材加载失败：Canvas 菱形兜底
        c.fillStyle = '#ff00ff';
        c.beginPath();
        c.moveTo(boxX + 28, boxY + 12);
        c.lineTo(boxX + 44, boxY + 28);
        c.lineTo(boxX + 28, boxY + 44);
        c.lineTo(boxX + 12, boxY + 28);
        c.closePath();
        c.fill();
      }

      const textX = (iconImg || isSkillStep || isEquipStep) ? boxX + 54 : w / 2;
      const textMaxW = (iconImg || isSkillStep || isEquipStep) ? boxW - 66 : boxW - 24;
      const textAlign = (iconImg || isSkillStep || isEquipStep) ? 'left' : 'center';

      // 绘制折行指引文字
      this.drawMultilineText(c, tip, textX, boxY + 12, textMaxW, 18, Theme.color.white, textAlign);
    } else if (tip && (this.step === 'BATTLE_MOVE' || this.step === 'BATTLE_FIGHT')) {
      // 局内移动/战斗指引：提示画在屏幕下方
      const boxW = w * 0.86;
      const boxH = 56;
      const boxX = (w - boxW) / 2;
      const boxY = h - 160;
      fillRoundRect(c, boxX, boxY, boxW, boxH, Theme.radius.sm, 'rgba(10, 16, 26, 0.92)');
      strokeRoundRect(c, boxX, boxY, boxW, boxH, Theme.radius.sm, Theme.color.cyan, 1.2);

      if (this.step === 'BATTLE_MOVE') {
        // 绘制移动提示素材或兜底
        const moveImg = ResourceManager.getInstance().getImage('ui_tutorial_move');
        if (moveImg) {
          c.drawImage(moveImg, boxX + 12, boxY + 12, 32, 32);
        } else {
          // 加载失败：十字箭头移动标兜底
          c.fillStyle = Theme.color.cyan;
          c.fillRect(boxX + 26, boxY + 12, 4, 32);
          c.fillRect(boxX + 12, boxY + 26, 32, 4);
        }

        this.drawMultilineText(c, tip, boxX + 54, boxY + 12, boxW - 66, 18, Theme.color.white, 'left');

        // 在摇杆中点 (60, h - 60) 处画一个手绘的滑动指示圈
        const rx = 60, ry = h - 60;
        c.strokeStyle = Theme.color.cyan;
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(rx, ry, 35, 0, Math.PI * 2);
        c.stroke();

        // 画指引箭头
        const arrowX = rx - 16;
        const arrowY = ry - 16 + Math.sin(time * 6) * 6;
        const img = ResourceManager.getInstance().getImage('ui_tutorial_arrow');
        if (img) {
          c.drawImage(img, arrowX, arrowY, 32, 32);
        }
      } else {
        // BATTLE_FIGHT 居中渲染提示文本
        this.drawMultilineText(c, tip, boxX + boxW / 2, boxY + 18, boxW - 24, 18, Theme.color.white, 'center');
      }
    }

    c.restore();
  }

  private getTipText(): string {
    switch (this.step) {
      case 'TUTORIAL_START':
        return '点击「进入章节」按钮，开启机甲训练之旅！';
      case 'CHAPTER_SELECT':
        return '选择「第一章：废弃训练场」，进入特训关卡！';
      case 'STAGE_SELECT':
        return '点击选择「第一关 1-1：新手特训」，开始第一场战斗！';
      case 'STAGE_INTRO':
        return '点击「开始挑战」按钮，立刻进入战场！';
      case 'BATTLE_MOVE':
        return '滑动左下角虚拟摇杆，控制喵喵机甲自由移动躲避弹幕！';
      case 'BATTLE_CANNON':
        return '「喵能炮」就绪！点击对正前方怪物发射追踪飞弹！';
      case 'BATTLE_SHIELD':
        return '注意！敌人射击，点击「重甲护盾」抵挡子弹伤害！';
      case 'BATTLE_FIGHT':
        return '很好，击退余下的全部敌人，取得最终的胜利！';
      case 'RESULT_BACK':
        return '特训大捷！点击「返回车库」整理你的胜利奖品。';
      case 'TUTORIAL_EQUIP':
        return '点击进入「装备舱」，看看你刚刚缴获了什么新装备！';
      case 'EQUIP_SELECT':
        return '点击你刚刚获得的「锈蚀猫爪炮」，查看装备详情！';
      case 'EQUIP_WEAR':
        return '点击「穿戴」，大幅强化喵喵机甲攻击力！';
      default:
        return '';
    }
  }

  private drawMultilineText(c: ICanvas2D, str: string, x: number, y: number, maxW: number, lineHeight: number, color: string, align: 'center' | 'left' | 'right' = 'center'): void {
    c.fillStyle = color;
    c.font = Theme.font.small;
    c.textAlign = align;
    c.textBaseline = 'top';

    const words = str.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = c.measureText(testLine);
      if (metrics.width > maxW && i > 0) {
        c.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    c.fillText(line, x, currentY);
  }
}
