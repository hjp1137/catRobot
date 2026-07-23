/**
 * 星级绘制工具
 * ------------------------------------------------------------------
 * drawStarRow：横向绘制 filled/empty 星（用于关卡卡片与结算）。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { star } from './DrawUtils';

/**
 * @param cx 行中心 x
 * @param y  行顶部 y
 * @param filled 已获得的星数（0~3）
 * @param size 单星外径
 */
export function drawStarRow(c: ICanvas2D, cx: number, y: number, filled: number, size: number, fillColor: string, total = 3): void {
  const gap = size * 1.4;
  const startX = cx - (gap * (total - 1)) / 2;
  for (let i = 0; i < total; i++) {
    const x = startX + i * gap + size / 2;
    const col = i < filled ? fillColor : Theme.color.grayDark;
    star(c, x, y + size / 2, size / 2, size / 4, 5, col);
  }
}
