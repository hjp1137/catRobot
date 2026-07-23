/**
 * BossRenderer —— Boss 技能效果绘制（任务4）
 * ------------------------------------------------------------------
 * drawShockwave：震荡冲击的预警红圈（脉动）+ 释放扩散环。
 * 输入 ShockwaveRenderState（来自 BossSkill.getRenderState）。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { ShockwaveRenderState } from '../battle/BossSkill';
import { SHOCKWAVE } from '../battle/BossSkill';

/** 绘制震荡冲击效果（warning 红圈预警 / blast 扩散环） */
export function drawShockwave(c: ICanvas2D, state: ShockwaveRenderState): void {
  c.save();
  if (state.phase === 'warning') {
    // 预警红圈：随进度脉动 + 填充渐深
    const pulse = 0.3 + 0.3 * Math.sin(state.warningProgress * Math.PI * 6);
    c.globalAlpha = pulse;
    c.fillStyle = Theme.color.redBright;
    c.beginPath();
    c.arc(state.cx, state.cy, state.radius * (0.3 + state.warningProgress * 0.7), 0, Math.PI * 2);
    c.fill();
    // 描边
    c.globalAlpha = 0.8;
    c.strokeStyle = Theme.color.red;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(state.cx, state.cy, state.radius, 0, Math.PI * 2);
    c.stroke();
  } else if (state.phase === 'blast') {
    // 扩散环：从中心向外扩散
    const ringR = state.radius * (0.5 + state.blastProgress * 0.8);
    c.globalAlpha = 1 - state.blastProgress;
    c.strokeStyle = Theme.color.gold;
    c.lineWidth = 4 * (1 - state.blastProgress * 0.5);
    c.beginPath();
    c.arc(state.cx, state.cy, ringR, 0, Math.PI * 2);
    c.stroke();
    // 内部闪光
    c.globalAlpha = (1 - state.blastProgress) * 0.4;
    c.fillStyle = Theme.color.gold;
    c.beginPath();
    c.arc(state.cx, state.cy, state.radius * 0.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/** 导出 SHOCKWAVE 常量供外部（测试/UI）引用 */
export { SHOCKWAVE };
