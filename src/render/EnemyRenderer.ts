/**
 * EnemyRenderer —— 机械鼠绘制
 * ------------------------------------------------------------------
 * 金属身体 + 尖鼻子 + 红电子眼 + 天线 + 红色血条。
 * 受击 hitFlash >0 时叠加红色闪烁。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { EnemyVariant } from '../data/EnemyConfig';
import { circle, triangle, healthBar } from './DrawUtils';
import { hitFlashAlpha } from './Effects';
import type { ArtResourceKey } from '../assets/ArtResourceKeys';

export interface EnemyDrawOptions {
  cx: number;
  cy: number;
  radius: number;
  hpRatio: number;
  hitFlash?: number;
  showBar?: boolean;
  /** 朝向玩家的方向（用于鼻子朝向），单位向量 */
  dirX?: number;
  dirY?: number;
  /** 任务3：敌人变体，elite 视觉更强 */
  variant?: EnemyVariant;
  /** 任务16：状态特效（毒液/燃烧等） */
  statusEffects?: Set<string> | any;
  /** 任务21：内容模板指定的美术 Key */
  artKey?: ArtResourceKey;
  shadowScale?: number;
}

export function drawEnemyMouse(c: ICanvas2D, o: EnemyDrawOptions): void {
  const { cx, cy, radius: r } = o;
  const dirX = o.dirX ?? 1;
  const dirY = o.dirY ?? 0;
  const isElite = o.variant === 'elite';
  const isBoss = o.variant === 'boss';

  // 任务4：boss 用暗红金属 + 大红眼 + 王冠 + 能量核心
  const bodyColor = isBoss ? '#4a2030' : isElite ? Theme.color.grayDark : Theme.color.grayBlue;
  const eyeColor = isBoss ? Theme.color.redBright : isElite ? Theme.color.redBright : Theme.color.red;
  const eyeR = isBoss ? r * 0.18 : isElite ? r * 0.16 : r * 0.12;

  c.save();

  // elite/boss 外层红光晕（boss 更大更亮，警示感）
  if (isElite || isBoss) {
    c.save();
    c.globalAlpha = isBoss ? 0.4 : 0.25;
    circle(c, cx, cy, r * (isBoss ? 1.6 : 1.4), Theme.color.redBright);
    c.restore();
  }

  // 任务4：boss 专属 —— 头顶王冠（金色三角齿）
  if (isBoss) {
    const crownY = cy - r * 1.3;
    c.save();
    c.fillStyle = Theme.color.gold;
    // 王冠底座
    c.fillRect(cx - r * 0.5, crownY, r, r * 0.18);
    // 三个尖齿
    triangle(c, cx - r * 0.5, crownY, cx - r * 0.35, crownY, cx - r * 0.42, crownY - r * 0.3, Theme.color.gold);
    triangle(c, cx - r * 0.1, crownY, cx + r * 0.1, crownY, cx, crownY - r * 0.4, Theme.color.gold);
    triangle(c, cx + r * 0.35, crownY, cx + r * 0.5, crownY, cx + r * 0.42, crownY - r * 0.3, Theme.color.gold);
    c.restore();
  }

  // 任务4：boss 背部能量核心（红色脉动圆，体后）
  if (isBoss) {
    c.save();
    c.globalAlpha = 0.6;
    circle(c, cx, cy + r * 0.5, r * 0.25, Theme.color.redBright);
    c.globalAlpha = 0.9;
    circle(c, cx, cy + r * 0.5, r * 0.12, Theme.color.gold);
    c.restore();
  }

  // 天线（头顶一根 + 红色端点）
  c.strokeStyle = Theme.color.grayDark;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx, cy - r * 0.7);
  c.lineTo(cx + dirX * 2, cy - r * 1.4);
  c.stroke();
  circle(c, cx + dirX * 2, cy - r * 1.4, r * 0.18, Theme.color.red);

  // 机械尾线与短爪，强化小型机械怪轮廓
  const px = -dirY;
  const py = dirX;
  c.strokeStyle = isElite ? Theme.color.redBright : Theme.color.grayDark;
  c.lineWidth = Math.max(1.5, r * 0.12);
  c.beginPath();
  c.moveTo(cx - dirX * r * 0.8, cy - dirY * r * 0.8);
  c.lineTo(cx - dirX * r * 1.35 + px * r * 0.25, cy - dirY * r * 1.35 + py * r * 0.25);
  c.stroke();
  c.strokeStyle = '#263047';
  c.lineWidth = Math.max(1.2, r * 0.1);
  c.beginPath();
  c.moveTo(cx - px * r * 0.75, cy - py * r * 0.75);
  c.lineTo(cx - px * r * 1.1, cy - py * r * 1.1);
  c.moveTo(cx + px * r * 0.75, cy + py * r * 0.75);
  c.lineTo(cx + px * r * 1.1, cy + py * r * 1.1);
  c.stroke();

  // 小耳朵（两个深灰圆，后侧）
  circle(c, cx - r * 0.6, cy - r * 0.5, r * 0.3, Theme.color.grayDark);
  circle(c, cx + r * 0.6, cy - r * 0.5, r * 0.3, Theme.color.grayDark);

  // 身体（elite 更深）
  circle(c, cx, cy, r, bodyColor);
  c.strokeStyle = isElite ? Theme.color.redBright : '#9aa7c4';
  c.lineWidth = isElite ? 2 : 1.4;
  c.beginPath();
  c.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = '#263047';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - r * 0.45, cy - r * 0.25);
  c.lineTo(cx + r * 0.45, cy - r * 0.25);
  c.moveTo(cx - r * 0.35, cy + r * 0.18);
  c.lineTo(cx + r * 0.35, cy + r * 0.18);
  c.stroke();
  // 底部阴影
  c.save();
  c.globalAlpha = 0.35;
  circle(c, cx, cy + r * 0.35, r * 0.85, Theme.color.grayDark);
  c.restore();

  if (isElite) {
    c.save();
    c.globalAlpha = 0.86;
    circle(c, cx, cy - r * 0.52, r * 0.14, Theme.color.gold);
    c.restore();
  }

  // 尖鼻子（朝玩家方向的三角形）
  const noseX = cx + dirX * r * 1.0;
  const noseY = cy + dirY * r * 1.0;
  const perpX = -dirY * r * 0.25;
  const perpY = dirX * r * 0.25;
  triangle(c,
    cx + dirX * r * 0.6 + perpX, cy + dirY * r * 0.6 + perpY,
    cx + dirX * r * 0.6 - perpX, cy + dirY * r * 0.6 - perpY,
    noseX, noseY,
    Theme.color.grayDark);

  // 红色电子眼（elite 更大更亮）
  circle(c, cx + dirX * r * 0.3 - r * 0.22, cy - r * 0.05, eyeR, eyeColor);
  circle(c, cx + dirX * r * 0.3 + r * 0.22, cy - r * 0.05, eyeR, eyeColor);
  // 眼睛高光
  c.save();
  c.globalAlpha = 0.7;
  circle(c, cx + dirX * r * 0.3 - r * 0.22, cy - r * 0.08, r * 0.04, Theme.color.white);
  circle(c, cx + dirX * r * 0.3 + r * 0.22, cy - r * 0.08, r * 0.04, Theme.color.white);
  c.restore();

  // 受击红色闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save();
    c.globalAlpha = hf;
    circle(c, cx, cy, r, Theme.color.redBright);
    c.restore();
  }

  // 血条（头顶）
  if (o.showBar !== false) {
    const bw = r * 2.4;
    healthBar(c, cx - bw / 2, cy - r * 1.8, bw, 4, o.hpRatio, { danger: 0.4 });
  }

  c.restore();
}
