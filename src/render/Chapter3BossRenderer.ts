import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { circle } from './DrawUtils';
import { FurnaceSkillRenderState, FissureRenderState, LavaPool } from '../battle/FurnaceBossSkill';
import { ResourceManager } from '../core/ResourceManager';

/** 绘制熔炉守卫 Boss（程序化兜底） */
export function drawFurnaceGuardBody(c: ICanvas2D, cx: number, cy: number, r: number, hitFlash: number, dirX: number): void {
  c.save();
  // 熔岩光晕
  c.save(); c.globalAlpha = 0.35; circle(c, cx, cy, r * 1.6, '#ff4400'); c.restore();
  // 刺状边缘
  c.fillStyle = '#990000';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    c.beginPath();
    c.moveTo(cx + Math.cos(angle - 0.2) * r, cy + Math.sin(angle - 0.2) * r);
    c.lineTo(cx + Math.cos(angle) * r * 1.3, cy + Math.sin(angle) * r * 1.3);
    c.lineTo(cx + Math.cos(angle + 0.2) * r, cy + Math.sin(angle + 0.2) * r);
    c.fill();
  }
  // 熔炉主躯干
  circle(c, cx, cy, r, '#331100');
  circle(c, cx, cy, r * 0.8, '#ff3300');
  circle(c, cx, cy, r * 0.5, '#ffaa00');
  
  // 双眼
  circle(c, cx + dirX * r * 0.4 - r * 0.15, cy - r * 0.2, r * 0.12, '#ffffff');
  circle(c, cx + dirX * r * 0.4 + r * 0.15, cy - r * 0.2, r * 0.12, '#ffffff');
  circle(c, cx + dirX * r * 0.4 - r * 0.15, cy - r * 0.2, r * 0.06, '#ff0000');
  circle(c, cx + dirX * r * 0.4 + r * 0.15, cy - r * 0.2, r * 0.06, '#ff0000');

  if (hitFlash > 0) {
    c.save(); c.globalAlpha = Math.min(1, hitFlash * 4); circle(c, cx, cy, r, '#ffffff'); c.restore();
  }
  c.restore();
}

/** 绘制熔岩咆哮 */
export function drawLavaRoar(c: ICanvas2D, s: FurnaceSkillRenderState): void {
  c.save();
  const res = ResourceManager.getInstance();
  const imgLoaded = res.isLoaded('skill_roar');
  const img = imgLoaded ? res.getImage('skill_roar') : null;

  if (s.phase === 'warning') {
    const pulse = 0.35 + 0.25 * Math.sin(s.progress * Math.PI * 6);
    c.globalAlpha = pulse;
    c.fillStyle = '#ff3300';
    c.beginPath(); c.arc(s.cx, s.cy, s.radius * (0.3 + s.progress * 0.7), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.8;
    c.strokeStyle = '#ff9900'; c.lineWidth = 2;
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
  } else {
    if (img) {
      c.globalAlpha = 1 - s.progress;
      const size = s.radius * 2;
      c.drawImage(img, s.cx - size / 2, s.cy - size / 2, size, size);
    } else {
      const ringR = s.radius * (0.5 + s.progress * 0.8);
      c.globalAlpha = 1 - s.progress;
      c.strokeStyle = '#ffaa00'; c.lineWidth = 5 * (1 - s.progress * 0.5);
      c.beginPath(); c.arc(s.cx, s.cy, ringR, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = (1 - s.progress) * 0.4;
      c.fillStyle = '#ff3300';
      c.beginPath(); c.arc(s.cx, s.cy, s.radius * 0.6, 0, Math.PI * 2); c.fill();
    }
  }
  c.restore();
}

/** 绘制熔岩裂隙 */
export function drawLavaFissure(c: ICanvas2D, s: FissureRenderState): void {
  c.save();
  const dx = s.tx - s.bx;
  const dy = s.ty - s.by;
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);

  c.translate(s.bx, s.by);
  c.rotate(angle);

  const res = ResourceManager.getInstance();
  const imgLoaded = res.isLoaded('skill_fissure');
  const img = imgLoaded ? res.getImage('skill_fissure') : null;

  if (s.phase === 'warning') {
    const pulse = 0.3 + 0.25 * Math.sin(s.progress * Math.PI * 8);
    c.globalAlpha = pulse;
    c.fillStyle = 'rgba(255, 51, 0, 0.4)';
    c.fillRect(0, -s.width / 2, length, s.width);
    c.globalAlpha = 0.8;
    c.strokeStyle = '#ff9900'; c.lineWidth = 2;
    c.strokeRect(0, -s.width / 2, length, s.width);
  } else {
    if (img) {
      c.globalAlpha = 1 - s.progress;
      const steps = 3;
      for (let i = 0; i < steps; i++) {
        const px = (i + 0.5) * (length / steps);
        const size = s.width * 1.2;
        c.drawImage(img, px - size / 2, -size / 2, size, size);
      }
    } else {
      c.globalAlpha = 1 - s.progress;
      c.fillStyle = 'rgba(255, 153, 0, 0.7)';
      c.fillRect(0, -s.width / 2, length, s.width);
      c.strokeStyle = '#ffcc00'; c.lineWidth = 4;
      c.strokeRect(0, -s.width / 2, length, s.width);
    }
  }
  c.restore();
}

/** 绘制熔岩池 */
export function drawLavaPool(c: ICanvas2D, s: LavaPool): void {
  c.save();
  const res = ResourceManager.getInstance();
  const imgLoaded = res.isLoaded('status_burn');
  const img = imgLoaded ? res.getImage('status_burn') : null;

  if (s.phase === 'warning') {
    c.globalAlpha = 0.4;
    c.strokeStyle = '#ff3300'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
  } else {
    if (img) {
      c.globalAlpha = 0.6;
      circle(c, s.cx, s.cy, s.radius, '#ff3300');
      c.globalAlpha = 0.8;
      const size = s.radius * 1.5;
      c.drawImage(img, s.cx - size / 2, s.cy - size / 2, size, size);
    } else {
      c.globalAlpha = 0.6;
      circle(c, s.cx, s.cy, s.radius, '#ff3300');
      c.globalAlpha = 0.3;
      circle(c, s.cx, s.cy, s.radius * 0.8, '#ff9900');
      c.globalAlpha = 0.8;
      c.strokeStyle = '#ffaa00'; c.lineWidth = 2;
      c.beginPath(); c.arc(s.cx, s.cy, s.radius, 0, Math.PI * 2); c.stroke();
    }
  }
  c.restore();
}
