/**
 * MechaRenderer —— 橘猫重甲绘制
 * ------------------------------------------------------------------
 * Q版机甲猫：猫头 + 猫耳 + 圆形驾驶舱 + 机甲肩甲 + 能量核心 + 喷射脚。
 * 可选动效参数：
 *  - floatOffset: 主界面浮动（像素）
 *  - hitFlash: 受击闪烁（秒），>0 时叠加白色高光
 *  - attackFlash: 攻击闪光（秒），>0 时画炮口能量线
 *  - facing: 朝向 -1左/0中/1右（炮口朝向）
 *
 * 不含位置/碰撞逻辑，纯绘制。半径用 radius 控制整体大小。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { circle, triangle, energyRing } from './DrawUtils';
import { hitFlashAlpha, attackFlashAlpha } from './Effects';
import { ResourceManager } from '../core/ResourceManager';
import { BATTLE_VISUAL_TUNING } from '../config/BattleAssets';
import type { ArtResourceKey } from '../assets/ArtResourceKeys';

export interface MechaDrawOptions {
  cx: number;
  cy: number;
  radius: number;
  floatOffset?: number;
  floatOffset2?: number; // 兼容可能存在的额外参数
  hitFlash?: number;
  attackFlash?: number;
  facing?: number; // -1 | 0 | 1
  showRings?: boolean; // 主界面展示用：画能量环装饰
  battleFocus?: boolean;
  shadowScale?: number;
  time?: number;
  artKey?: ArtResourceKey;
}

export function drawMecha(c: ICanvas2D, o: MechaDrawOptions): void {
  const { cx, radius: r } = o;
  const cy = o.cy + (o.floatOffset ?? 0);
  const facing = o.facing ?? 0;
  const time = o.time ?? 0;

  const shadowScale = Math.max(0, o.shadowScale ?? 1);
  if (o.battleFocus && shadowScale > 0) {
    const pulse = 0.18 + 0.06 * ((Math.sin(time * 5) + 1) / 2);
    c.save();
    c.globalAlpha = BATTLE_VISUAL_TUNING.playerFocusAlpha;
    circle(c, cx, cy + r * 0.72, r * 0.95 * shadowScale, 'rgba(255, 172, 64, 0.45)');
    c.globalAlpha = 1;
    energyRing(c, cx, cy + r * 0.72, r * 1.05 * shadowScale, Theme.color.gold, pulse, time * 2.2);
    c.restore();
  }

  const rm = ResourceManager.getInstance();
  const img = rm.getImageByArtKey(o.artKey) ?? rm.getImage('player_mecha');
  if (img) {
    c.save();
    if (o.showRings) {
      energyRing(c, cx, cy, r * 1.8, Theme.color.cyan, 0.25, time * 1.5);
      energyRing(c, cx, cy, r * 2.2, Theme.color.orange, 0.15, -time * 1.2);
    }
    c.translate(cx, cy);
    if (facing === -1) {
      c.scale(-1, 1);
    }
    c.drawImage(img, -r, -r, r * 2, r * 2);
    c.restore();

    // 攻击能量线与受击闪烁
    const cannonX = cx + facing * r * 0.75;
    const cannonY = cy + r * 0.1;
    const af = attackFlashAlpha(o.attackFlash ?? 0);
    if (af > 0) {
      c.save();
      c.globalAlpha = af;
      c.strokeStyle = Theme.color.gold;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(cannonX, cannonY);
      c.lineTo(cannonX + facing * r * 2.5, cannonY);
      c.stroke();
      c.restore();
    }
    const hf = hitFlashAlpha(o.hitFlash ?? 0);
    if (hf > 0) {
      c.save();
      c.globalAlpha = hf;
      circle(c, cx, cy, r, Theme.color.white);
      c.restore();
    }
    return;
  }

  c.save();

  // 能量环装饰（主界面展示）
  if (o.showRings) {
    energyRing(c, cx, cy, r * 1.8, Theme.color.cyan, 0.25, time * 1.5);
    energyRing(c, cx, cy, r * 2.2, Theme.color.orange, 0.15, -time * 1.2);
  }

  // 喷射脚（两个小梯形，橙红渐变感）
  triangle(c, cx - r * 0.5, cy + r * 0.7, cx - r * 0.15, cy + r * 0.7, cx - r * 0.4, cy + r * 1.1, Theme.color.orangeDark);
  triangle(c, cx + r * 0.15, cy + r * 0.7, cx + r * 0.5, cy + r * 0.7, cx + r * 0.4, cy + r * 1.1, Theme.color.orangeDark);

  // 机甲肩甲（左右两个深色弧块）
  circle(c, cx - r * 0.75, cy + r * 0.1, r * 0.4, Theme.color.bgPanelLight);
  circle(c, cx + r * 0.75, cy + r * 0.1, r * 0.4, Theme.color.bgPanelLight);

  // 炮口（朝向侧的肩甲上）
  const cannonX = cx + facing * r * 0.75;
  const cannonY = cy + r * 0.1;
  circle(c, cannonX, cannonY, r * 0.2, Theme.color.grayDark);
  // 攻击闪光：炮口能量线
  const af = attackFlashAlpha(o.attackFlash ?? 0);
  if (af > 0) {
    c.save();
    c.globalAlpha = af;
    c.strokeStyle = Theme.color.gold;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(cannonX, cannonY);
    c.lineTo(cannonX + facing * r * 2.5, cannonY);
    c.stroke();
    c.restore();
  }

  // 猫耳（两个三角形，橙色 + 内耳粉色高光）
  triangle(c, cx - r * 0.7, cy - r * 0.5, cx - r * 0.35, cy - r * 0.5, cx - r * 0.6, cy - r * 1.05, Theme.color.orange);
  triangle(c, cx + r * 0.35, cy - r * 0.5, cx + r * 0.7, cy - r * 0.5, cx + r * 0.6, cy - r * 1.05, Theme.color.orange);
  triangle(c, cx - r * 0.6, cy - r * 0.55, cx - r * 0.45, cy - r * 0.55, cx - r * 0.55, cy - r * 0.85, Theme.color.redBright);
  triangle(c, cx + r * 0.45, cy - r * 0.55, cx + r * 0.6, cy - r * 0.55, cx + r * 0.55, cy - r * 0.85, Theme.color.redBright);

  // 猫头主体（橙色圆）
  circle(c, cx, cy, r, Theme.color.orange);
  // 头部阴影（底部半圆深橙，营造立体感）
  c.save();
  c.fillStyle = Theme.color.orangeDark;
  c.globalAlpha = 0.35;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI);
  c.closePath();
  c.fill();
  c.restore();

  // 驾驶舱（青蓝色圆，带高光）
  circle(c, cx, cy - r * 0.05, r * 0.42, Theme.color.cyanDark);
  circle(c, cx, cy - r * 0.05, r * 0.3, Theme.color.cyan);
  // 驾驶舱高光
  c.save();
  c.globalAlpha = 0.6;
  circle(c, cx - r * 0.1, cy - r * 0.15, r * 0.1, Theme.color.white);
  c.restore();

  // 能量核心（中心金色小点）
  circle(c, cx, cy + r * 0.45, r * 0.12, Theme.color.gold);

  // 眼睛（两个小白点 + 黑瞳，可爱感）—— 驾驶舱下方
  circle(c, cx - r * 0.2, cy + r * 0.2, r * 0.08, Theme.color.white);
  circle(c, cx + r * 0.2, cy + r * 0.2, r * 0.08, Theme.color.white);

  // 受击闪烁：整体叠加白色高光
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save();
    c.globalAlpha = hf;
    circle(c, cx, cy, r, Theme.color.white);
    c.restore();
  }

  c.restore();
}
