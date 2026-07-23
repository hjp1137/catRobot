/**
 * Effects —— 基于时间的轻量动效工具
 * ------------------------------------------------------------------
 * 关键设计：所有动效接收 `time`（秒）参数，**不读 Date.now / ctx.now**，
 * 由调用方传入。这样：
 *  - MockContext.now() 可控，测试稳定
 *  - 不引入复杂状态机
 *
 * 用途：主界面机甲浮动、按钮呼吸、受击闪烁透明度等。
 */

/** 正弦呼吸：返回 [0,1] 波动，speed 越快波动越快 */
export function breathe(time: number, speed = 2, phase = 0): number {
  return (Math.sin(time * speed + phase) + 1) / 2;
}

/** 浮动位移：返回 [-amp, amp] 像素偏移 */
export function floatY(time: number, amp = 4, speed = 2): number {
  return Math.sin(time * speed) * amp;
}

/**
 * 受击闪烁透明度：hitFlash 从 1 衰减到 0。
 * @param hitFlash 剩余闪烁时长（秒），>0 时返回闪烁白覆盖透明度
 * @returns 0~1，用于 globalAlpha 叠加白色高光
 */
export function hitFlashAlpha(hitFlash: number): number {
  if (hitFlash <= 0) return 0;
  // 快速衰减 + 轻微闪烁
  return Math.max(0, Math.min(1, hitFlash * 4));
}

/** 攻击闪光长度（炮口能量线持续时间） */
export function attackFlashAlpha(attackFlash: number): number {
  if (attackFlash <= 0) return 0;
  return Math.max(0, Math.min(1, attackFlash * 5));
}

/** 面板出现缩放：从 0.8 → 1.0 的 ease-out，progress 0~1 */
export function panelScale(progress: number): number {
  const p = Math.max(0, Math.min(1, progress));
  return 0.8 + 0.2 * (1 - Math.pow(1 - p, 3));
}
