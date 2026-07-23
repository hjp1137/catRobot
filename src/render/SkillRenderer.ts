/**
 * SkillRenderer —— 玩家技能视觉特效（任务5）
 * ------------------------------------------------------------------
 * drawMeowCannonEffect：橙黄能量光束（朝向方向扇形）+ 炮口闪光圆。
 * drawShieldEffect：蓝色半透明护盾环（呼吸）+ 受击蓝闪。
 * 全部基于 time/计时器，不读 Date.now，测试稳定。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { MEOW_CANNON, getSkillEffect } from '../data/SkillConfig';

/**
 * 喵能炮释放特效。
 * @param flash 剩余特效时长（秒），>0 才画；用于淡出
 * 任务6：range/halfAngle 按玩家当前技能等级 effect 读取
 */
export function drawMeowCannonEffect(
  c: ICanvas2D, cx: number, cy: number, facingAngle: number, flash: number, level = 1,
): void {
  if (flash <= 0) return;
  const effect = getSkillEffect(MEOW_CANNON.id, level);
  const range = effect?.range ?? 120;
  const halfAngle = effect?.halfAngle ?? Math.PI / 4;
  // 淡出 alpha
  const alpha = Math.max(0, Math.min(1, flash / 0.25));
  c.save();
  c.globalAlpha = alpha * 0.8;
  c.fillStyle = Theme.color.gold;
  // 扇形填充
  c.beginPath();
  c.moveTo(cx, cy);
  c.arc(cx, cy, range, facingAngle - halfAngle, facingAngle + halfAngle);
  c.closePath();
  c.fill();
  // 外缘亮线
  c.globalAlpha = alpha;
  c.strokeStyle = Theme.color.orange;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(cx, cy, range, facingAngle - halfAngle, facingAngle + halfAngle);
  c.stroke();
  // 炮口闪光圆
  c.fillStyle = Theme.color.white;
  c.beginPath();
  c.arc(cx, cy, 14, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/**
 * 重甲护盾特效。
 * @param active 是否激活
 * @param activeRemaining 激活剩余（秒，用于呼吸/淡出）
 * @param hitFlash 受击蓝闪计时
 * @param time 当前时间（呼吸用）
 */
export function drawShieldEffect(
  c: ICanvas2D, cx: number, cy: number, radius: number,
  active: boolean, activeRemaining: number, hitFlash: number, time: number,
): void {
  if (!active) return;
  const breathe = (Math.sin(time * 4) + 1) / 2;
  c.save();
  // 护盾环（蓝色半透明，呼吸）
  c.globalAlpha = 0.25 + 0.15 * breathe;
  c.strokeStyle = Theme.color.cyan;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
  c.stroke();
  // 内层填充
  c.globalAlpha = 0.1 + 0.05 * breathe;
  c.fillStyle = Theme.color.cyan;
  c.beginPath();
  c.arc(cx, cy, radius * 1.7, 0, Math.PI * 2);
  c.fill();
  // 受击蓝闪
  if (hitFlash > 0) {
    c.globalAlpha = Math.min(0.6, hitFlash * 3);
    c.fillStyle = Theme.color.white;
    c.beginPath();
    c.arc(cx, cy, radius * 1.9, 0, Math.PI * 2);
    c.fill();
  }
  // 激活即将结束时的闪烁警告（最后 0.5s）
  if (activeRemaining > 0 && activeRemaining < 0.5) {
    c.globalAlpha = 0.5 * ((Math.sin(time * 20) + 1) / 2);
    c.strokeStyle = Theme.color.white;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, cy, radius * 1.8, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();
}
