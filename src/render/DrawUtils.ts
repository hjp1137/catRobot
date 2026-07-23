/**
 * DrawUtils —— 原子绘制工具
 * ------------------------------------------------------------------
 * 圆角矩形 / 渐变填充 / 描边面板 / 文本 / 血条 / 星形 / 能量环。
 * 所有方法纯函数，接收 ICanvas2D，健壮处理异常参数（不抛错，便于测试）。
 */
import { ICanvas2D, IGradient } from '../engine/IContext';
import { Theme } from './Theme';

/** 圆角矩形路径（不填充不描边，仅描路径，调用方决定 fill/stroke） */
export function roundRectPath(c: ICanvas2D, x: number, y: number, w: number, h: number, r: number): void {
  // 防御：负值或退化尺寸
  if (w <= 0 || h <= 0) return;
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + rr, y);
  c.lineTo(x + w - rr, y);
  c.arc(x + w - rr, y + rr, rr, -Math.PI / 2, 0);
  c.lineTo(x + w, y + h - rr);
  c.arc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2);
  c.lineTo(x + rr, y + h);
  c.arc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI);
  c.lineTo(x, y + rr);
  c.arc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5);
  c.closePath();
}

/** 填充圆角矩形 */
export function fillRoundRect(c: ICanvas2D, x: number, y: number, w: number, h: number, r: number, fill: string | IGradient): void {
  roundRectPath(c, x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}

/** 描边圆角矩形 */
export function strokeRoundRect(c: ICanvas2D, x: number, y: number, w: number, h: number, r: number, color: string, lineWidth = 1): void {
  roundRectPath(c, x, y, w, h, r);
  c.strokeStyle = color;
  c.lineWidth = lineWidth;
  c.stroke();
}

/** 垂直渐变（顶 c1 → 底 c2） */
export function verticalGradient(c: ICanvas2D, x: number, y: number, w: number, h: number, c1: string, c2: string): IGradient {
  const g = c.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}

/** 文本（含字体/颜色/对齐） */
export function text(c: ICanvas2D, t: string, x: number, y: number, opts: { font?: string; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline } = {}): void {
  c.save();
  c.font = opts.font ?? Theme.font.body;
  c.fillStyle = opts.color ?? Theme.color.white;
  c.textAlign = opts.align ?? 'left';
  c.textBaseline = opts.baseline ?? 'top';
  c.fillText(t, x, y);
  c.restore();
}

/**
 * 血条 —— 带背景框 + 渐变填充 + 危险态变色
 * @param danger 生命比例低于此值时变红（默认 0.3）
 */
export function healthBar(c: ICanvas2D, x: number, y: number, w: number, h: number, ratio: number, opts: { danger?: number; showText?: string; color?: string } = {}): void {
  const r = Math.max(0, Math.min(1, ratio));
  const danger = opts.danger ?? 0.3;
  // 背景
  fillRoundRect(c, x, y, w, h, h / 2, Theme.color.bgDeep);
  // 填充色：危险态变红，或者指定特定的颜色，否则绿
  const color = opts.color ?? (r <= danger ? Theme.color.red : Theme.color.green);
  if (r > 0) {
    fillRoundRect(c, x, y, w * r, h, h / 2, color);
  }
  // 描边
  strokeRoundRect(c, x, y, w, h, h / 2, 'rgba(255,255,255,0.15)', 1);
  // 文字
  if (opts.showText) {
    text(c, opts.showText, x + w / 2, y + h / 2, { color: Theme.color.white, align: 'center', baseline: 'middle', font: Theme.font.small });
  }
}

/** 星形（n 角星），用于结算装饰 */
export function star(c: ICanvas2D, cx: number, cy: number, outerR: number, innerR: number, points: number, color: string): void {
  if (outerR <= 0 || points < 3) return;
  c.save();
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath();
  c.fill();
  c.restore();
}

/** 能量环（圆环描边，可旋转偏移用于动效） */
export function energyRing(c: ICanvas2D, cx: number, cy: number, radius: number, color: string, alpha: number, rotation: number): void {
  if (radius <= 0) return;
  c.save();
  c.globalAlpha = alpha;
  c.strokeStyle = color;
  c.lineWidth = 2;
  c.beginPath();
  // 画一段弧（带 rotation 偏移制造转动感）
  c.arc(cx, cy, radius, rotation, rotation + Math.PI * 1.4);
  c.stroke();
  c.restore();
}

/** 圆 */
export function circle(c: ICanvas2D, cx: number, cy: number, r: number, fill: string | IGradient): void {
  if (r <= 0) return;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

/** 三角形（用于耳朵等） */
export function triangle(c: ICanvas2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, fill: string): void {
  c.beginPath();
  c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
