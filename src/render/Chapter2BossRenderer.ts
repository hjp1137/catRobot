/**
 * Chapter2BossRenderer —— 污染核心虫后视觉 + 技能效果（任务8）
 * ------------------------------------------------------------------
 * drawPollutionQueen：大体型 + 紫绿核心 + 腹部能量囊 + 多足 + 毒液罐 + 复合眼 + 污染光晕
 * drawToxicField：毒液领域预警/active 圆
 * drawEruption：污染喷发预警/爆发圆
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { circle, triangle } from './DrawUtils';
import { FieldRenderState, EruptionRenderState } from '../battle/PollutionBossSkill';

/** 污染核心虫后绘制（在 Chapter2EnemyRenderer.drawEnemy 中调用） */
export function drawPollutionQueen(c: ICanvas2D, o: {
  cx: number; cy: number; radius: number; hpRatio: number; hitFlash?: number; dirX?: number;
}): void {
  const { cx, cy, radius: r } = o;
  const dirX = o.dirX ?? 1;
  c.save();
  // 污染光晕（强）
  c.save();
  c.globalAlpha = 0.4;
  circle(c, cx, cy, r * 1.8, '#a060e0');
  c.restore();
  // 多足（6 条，左右各 3）
  c.strokeStyle = '#3a1a5a';
  c.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const offY = (i - 1) * r * 0.4;
    c.beginPath(); c.moveTo(cx - r * 0.6, cy + offY); c.lineTo(cx - r * 1.5, cy + offY - r * 0.3); c.stroke();
    c.beginPath(); c.moveTo(cx + r * 0.6, cy + offY); c.lineTo(cx + r * 1.5, cy + offY - r * 0.3); c.stroke();
  }
  // 腹部能量囊（大椭圆，紫色发光）
  c.fillStyle = '#5a2a8a';
  c.beginPath();
  if (c.ellipse) c.ellipse(cx, cy + r * 0.2, r * 1.1, r * 0.9, 0, 0, Math.PI * 2);
  else c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath(); c.fill();
  // 核心（紫绿）
  circle(c, cx, cy, r * 0.6, '#4a2a6a');
  circle(c, cx, cy, r * 0.4, '#a060e0');
  c.save(); c.globalAlpha = 0.7; circle(c, cx, cy, r * 0.2, '#5fe068'); c.restore();
  // 双毒液罐（背部）
  circle(c, cx - r * 0.4, cy - r * 0.5, r * 0.22, '#5fe068');
  circle(c, cx + r * 0.4, cy - r * 0.5, r * 0.22, '#5fe068');
  // 头部复合眼（朝向，红绿）
  circle(c, cx + dirX * r * 0.5 - r * 0.2, cy - r * 0.2, r * 0.14, '#ff4040');
  circle(c, cx + dirX * r * 0.5 + r * 0.2, cy - r * 0.2, r * 0.14, '#5fe068');
  // 王冠感（顶部尖刺）
  triangle(c, cx - r * 0.3, cy - r * 0.6, cx - r * 0.1, cy - r * 0.6, cx - r * 0.2, cy - r * 0.95, '#a060e0');
  triangle(c, cx + r * 0.1, cy - r * 0.6, cx + r * 0.3, cy - r * 0.6, cx + r * 0.2, cy - r * 1.0, '#a060e0');
  // 受击闪烁
  if ((o.hitFlash ?? 0) > 0) {
    c.save();
    c.globalAlpha = Math.min(1, (o.hitFlash ?? 0) * 4);
    circle(c, cx, cy, r, Theme.color.white);
    c.restore();
  }
  c.restore();
}

/** 毒液领域绘制（warning 紫绿预警圈脉动 / active 持续领域填充） */
export function drawToxicField(c: ICanvas2D, s: FieldRenderState): void {
  c.save();
  if (s.phase === 'warning') {
    const pulse = 0.3 + 0.3 * Math.sin(s.progress * Math.PI * 6);
    c.globalAlpha = pulse;
    c.strokeStyle = '#a060e0';
    c.lineWidth = 2;
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = pulse * 0.3;
    c.fillStyle = '#5fe068';
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.fill();
  } else {
    // active：持续绿紫领域
    c.globalAlpha = 0.2 + 0.1 * Math.sin(s.progress * Math.PI * 8);
    c.fillStyle = '#5fe068';
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.5;
    c.strokeStyle = '#a060e0';
    c.lineWidth = 2;
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
  }
  c.restore();
}

/** 污染喷发绘制（warning 目标预警圈 / blast 爆发扩散） */
export function drawEruption(c: ICanvas2D, s: EruptionRenderState): void {
  c.save();
  if (s.phase === 'warning') {
    const pulse = 0.4 + 0.3 * Math.sin(s.progress * Math.PI * 8);
    c.globalAlpha = pulse;
    c.fillStyle = '#a060e0';
    c.beginPath(); c.arc(s.cx, s.cy, s.radius * (0.4 + s.progress * 0.6), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.8;
    c.strokeStyle = '#ff4040';
    c.lineWidth = 2;
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
  } else {
    // blast：扩散环
    const ringR = s.radius * (0.6 + s.progress * 0.8);
    c.globalAlpha = 1 - s.progress;
    c.strokeStyle = '#5fe068';
    c.lineWidth = 4 * (1 - s.progress * 0.5);
    c.beginPath(); c.arc(s.cx, s.cy, ringR, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = (1 - s.progress) * 0.5;
    c.fillStyle = '#a060e0';
    c.beginPath(); c.arc(s.cx, s.cy, s.radius * 0.7, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
