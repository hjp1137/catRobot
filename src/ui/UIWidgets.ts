/**
 * UI 通用工具：按钮绘制 / 文本绘制 / tap 命中检测 / 高级面板与资源条
 * ------------------------------------------------------------------
 * 所有 UI 都在 Canvas 上手绘（MVP 无 DOM），按钮命中靠 input.tap。
 * render() 期间不处理点击；点击由 MainUI/ResultUI 的 handleClick 在
 * 主循环之外（或 update 之前）统一消费。
 */
import { IContext, ICanvas2D, IGradient } from '../engine/IContext';
import { Theme } from '../render/Theme';
import { fillRoundRect, strokeRoundRect, verticalGradient, text, circle, star } from '../render/DrawUtils';
import { ResourceManager } from '../core/ResourceManager';
import { SoundManager } from '../core/SoundManager';

export interface Button {
  id: string;
  label: string;
  x: number; y: number; w: number; h: number;
  color: string;
  disabled?: boolean;
}

/** 统一且带科技感的按钮绘制，支持微弱的呼吸高亮动画与 disabled 态 */
export function drawButton(c: ICanvas2D, b: Button, time?: number): void {
  c.save();
  // 1. 投影
  fillRoundRect(c, b.x + 2, b.y + 3, b.w, b.h, Theme.radius.md, 'rgba(0,0,0,0.3)');
  
  // 2. 渐变填充背景 (从 b.color 向深色/面板底色过渡，disabled 使用灰色)
  const c1 = b.disabled ? Theme.color.grayDark : b.color;
  const c2 = b.disabled ? '#333333' : '#1a1f2c';
  const bgGrad = verticalGradient(c, 0, b.y, 0, b.y + b.h, c1, c2);
  fillRoundRect(c, b.x, b.y, b.w, b.h, Theme.radius.md, bgGrad);
  
  // 3. 边框 (与主色匹配)
  strokeRoundRect(c, b.x, b.y, b.w, b.h, Theme.radius.md, b.disabled ? '#555555' : b.color, 1.5);
  
  // 4. 呼吸高亮动效 (使用可选的 time 因子)
  if (time !== undefined && !b.disabled) {
    const pulse = 0.05 + 0.05 * Math.sin(time * 3);
    c.save();
    c.globalAlpha = pulse;
    fillRoundRect(c, b.x, b.y, b.w, b.h, Theme.radius.md, '#ffffff');
    c.restore();
  }
  
  // 5. 顶边缘微弱高光
  c.save();
  c.globalAlpha = 0.12;
  fillRoundRect(c, b.x + 2, b.y + 2, b.w - 4, 4, 2, '#ffffff');
  c.restore();
  
  // 6. 文本居中
  text(c, b.label, b.x + b.w / 2, b.y + b.h / 2, {
    color: b.disabled ? Theme.color.gray : Theme.color.white,
    align: 'center',
    baseline: 'middle',
    font: Theme.font.bodyBold
  });
  c.restore();
}

/** 点是否落在按钮内 */
export function hitButton(b: Button, x: number, y: number): boolean {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

/** 基础文本绘制 (向后兼容) */
export function drawText(
  c: ICanvas2D, textContent: string, x: number, y: number,
  opts: { font?: string; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline } = {},
): void {
  text(c, textContent, x, y, opts);
}

/**
 * 消费一次 tap，遍历按钮列表返回被点中的那个（disabled 的不会命中）。
 * 命中后 tap 会被 consume，避免下一帧重复触发。
 */
export function pollButtonTap(ctx: IContext, buttons: Button[]): Button | null {
  const { tapX, tapY } = ctx.input;
  if (tapX === null || tapY === null) return null;
  for (const b of buttons) {
    if (!b.disabled && hitButton(b, tapX, tapY)) {
      ctx.input.consumeTap();
      SoundManager.getInstance().play('click');
      return b;
    }
  }
  return null;
}

/** 高级科技面板绘制，带四角高光和外层阴影 */
export function drawPanel(
  c: ICanvas2D, x: number, y: number, w: number, h: number,
  opts: { border?: string; bg?: string | IGradient; radius?: number; borderSize?: number } = {}
): void {
  const r = opts.radius ?? Theme.radius.lg;
  const border = opts.border ?? Theme.color.cyan;
  const borderSize = opts.borderSize ?? 2;
  const bg = opts.bg ?? verticalGradient(c, 0, y, 0, y + h, Theme.color.bgPanelLight, Theme.color.bgPanel);

  c.save();
  // 投影
  fillRoundRect(c, x + 4, y + 5, w, h, r, 'rgba(0,0,0,0.45)');
  // 填充背景
  fillRoundRect(c, x, y, w, h, r, bg);
  // 描边
  strokeRoundRect(c, x, y, w, h, r, border, borderSize);
  
  // 拐角科技装饰
  if (r > 0) {
    c.fillStyle = border;
    // 左上
    c.fillRect(x + r, y + 2, 8, 2);
    c.fillRect(x + 2, y + r, 2, 8);
    // 右上
    c.fillRect(x + w - r - 8, y + 2, 8, 2);
    c.fillRect(x + w - 4, y + r, 2, 8);
  }
  c.restore();
}

/** 高级大标题，自带两旁科技线和小星星点缀 */
export function drawTitle(
  c: ICanvas2D, titleText: string, subtitle?: string,
  opts: { x?: number; y?: number; w?: number; align?: CanvasTextAlign } = {}
): void {
  c.save();
  const tx = opts.x ?? 400; // 默认屏幕中心 (设计分辨率800×1200)
  const ty = opts.y ?? 40;
  const tw = opts.w ?? 800;
  const align = opts.align ?? 'center';

  // 1. 主标题
  text(c, titleText, tx, ty, { color: Theme.color.gold, align, baseline: 'middle', font: Theme.font.big });
  
  // 左右科技装饰线
  if (align === 'center') {
    const textW = c.measureText(titleText).width;
    const lineY = ty;
    const lineW = Math.max(20, (tw - textW) / 2 - 40);
    
    c.lineWidth = 1.5;
    // 左线
    const leftGrad = c.createLinearGradient(tx - textW / 2 - 10 - lineW, lineY, tx - textW / 2 - 10, lineY);
    leftGrad.addColorStop(0, 'rgba(212,175,55,0)');
    leftGrad.addColorStop(1, Theme.color.gold);
    c.strokeStyle = leftGrad;
    c.beginPath();
    c.moveTo(tx - textW / 2 - 10 - lineW, lineY);
    c.lineTo(tx - textW / 2 - 10, lineY);
    c.stroke();
    star(c, tx - textW / 2 - 15, lineY, 4, 1.5, 4, Theme.color.gold);

    // 右线
    const rightGrad = c.createLinearGradient(tx + textW / 2 + 10, lineY, tx + textW / 2 + 10 + lineW, lineY);
    rightGrad.addColorStop(0, Theme.color.gold);
    rightGrad.addColorStop(1, 'rgba(212,175,55,0)');
    c.strokeStyle = rightGrad;
    c.beginPath();
    c.moveTo(tx + textW / 2 + 10, lineY);
    c.lineTo(tx + textW / 2 + 10 + lineW, lineY);
    c.stroke();
    star(c, tx + textW / 2 + 15, lineY, 4, 1.5, 4, Theme.color.gold);
  }

  // 2. 副标题
  if (subtitle) {
    text(c, subtitle, tx, ty + 24, { color: Theme.color.cyan, align, baseline: 'middle', font: Theme.font.small });
  }

  c.restore();
}

/** 资源胶囊状态条，支持 coin、part 和 stone 优先以图片渲染，加载失败则走图形兜底 */
export function drawResourceHeader(
  c: ICanvas2D, w: number, y: number,
  resources: { type: 'coin' | 'part' | 'stone'; amount: number }[]
): void {
  c.save();
  const rm = ResourceManager.getInstance();
  const itemW = 90;
  const itemH = 24;
  const spacing = 12;
  const totalW = resources.length * itemW + (resources.length - 1) * spacing;
  let startX = (w - totalW) / 2;

  for (const item of resources) {
    // 胶囊背景
    fillRoundRect(c, startX, y, itemW, itemH, itemH / 2, 'rgba(10,14,26,0.65)');
    strokeRoundRect(c, startX, y, itemW, itemH, itemH / 2, 'rgba(79,209,224,0.3)', 1);

    // 图标与颜色
    const imgKey = item.type;
    const img = rm.getImage(imgKey);
    const iconX = startX + 4;
    const iconY = y + 2;
    const iconSize = 20;

    if (img) {
      c.drawImage(img, iconX, iconY, iconSize, iconSize);
    } else {
      // 兜底
      const fallbackColor = item.type === 'coin' ? Theme.color.gold : item.type === 'part' ? Theme.color.cyan : '#c060e0';
      const label = item.type === 'coin' ? 'G' : item.type === 'part' ? 'P' : 'S';
      c.save();
      c.fillStyle = fallbackColor;
      c.beginPath();
      c.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 - 1, 0, Math.PI * 2);
      c.fill();
      text(c, label, iconX + iconSize / 2, iconY + iconSize / 2, { color: Theme.color.bgDeep, align: 'center', baseline: 'middle', font: 'bold 11px sans-serif' });
      c.restore();
    }

    // 数值
    const textX = startX + itemW - 8;
    const textY = y + itemH / 2;
    const textColor = item.type === 'coin' ? Theme.color.gold : item.type === 'part' ? Theme.color.cyan : '#e0a0ff';
    text(c, item.amount.toString(), textX, textY, { color: textColor, align: 'right', baseline: 'middle', font: 'bold 11px sans-serif' });

    startX += itemW + spacing;
  }
  c.restore();
}

/** 状态标签徽章，用于已装备、锁定等标识 */
export function drawBadge(c: ICanvas2D, labelText: string, x: number, y: number, badgeColor: string): void {
  c.save();
  const textW = c.measureText(labelText).width;
  const padX = 6;
  const padY = 2;
  const w = textW + padX * 2;
  const h = 16;
  
  fillRoundRect(c, x - w / 2, y - h / 2, w, h, 4, badgeColor);
  strokeRoundRect(c, x - w / 2, y - h / 2, w, h, 4, '#ffffff', 1);
  text(c, labelText, x, y, { color: Theme.color.white, align: 'center', baseline: 'middle', font: 'bold 11px sans-serif' });
  c.restore();
}
