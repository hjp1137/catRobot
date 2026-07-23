/**
 * BackgroundRenderer —— 训练场背景
 * ------------------------------------------------------------------
 * 深色渐变底 + 科技网格 + 边缘暗角 + 地面分区线 + 能量节点装饰。
 * 性能：所有元素基于固定网格，无每帧复杂计算。time 用于节点微弱呼吸。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { verticalGradient, circle, energyRing } from './DrawUtils';
import { ResourceManager } from '../core/ResourceManager';
import { ART_PACKS } from '../assets/ArtManifest';
import type { BackgroundTheme } from '../content/models/BackgroundTheme';

export function drawBattleBackgroundDim(c: ICanvas2D, w: number, h: number): void {
  c.save();
  // 任务20：正式包启用时将暗化遮罩透明度调深为0.78，让战斗画面主题更聚焦
  const alpha = ART_PACKS.training_ground_v1.enabled ? 0.78 : 0.46;
  c.fillStyle = `rgba(2, 6, 14, ${alpha})`;
  c.fillRect(0, 0, w, h);
  c.restore();
}

export function drawBackgroundTheme(c: ICanvas2D, w: number, h: number, time: number, theme?: BackgroundTheme): void {
  if (!theme) { drawTrainingBackground(c, w, h, time); return; }
  const img = ResourceManager.getInstance().getImageByArtKey(theme.art.floorArtKey);
  if (img) {
    if (theme.rendering.mode === 'stretch' || theme.rendering.mode === 'cover') {
      c.drawImage(img, 0, 0, w, h);
    } else {
      const tw = theme.rendering.tileWidth ?? 256;
      const th = theme.rendering.tileHeight ?? 256;
      for (let x = 0; x < w + tw; x += tw) for (let y = 0; y < h + th; y += th) c.drawImage(img, x, y, tw, th);
    }
  } else {
    c.fillStyle = theme.colors?.base ?? '#07121d';
    c.fillRect(0, 0, w, h);
  }
  if (theme.rendering.showGrid) drawThemeGrid(c, w, h, theme.colors?.grid ?? Theme.color.grid);
  const alpha = theme.rendering.overlayOpacity ?? 0;
  if (alpha > 0) {
    c.fillStyle = theme.colors?.overlay ?? `rgba(2, 6, 14, ${alpha})`;
    c.fillRect(0, 0, w, h);
  }
}

function drawThemeGrid(c: ICanvas2D, w: number, h: number, color: string): void {
  c.save();
  c.strokeStyle = color;
  c.lineWidth = 1;
  for (let x = 0; x <= w; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y <= h; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.restore();
}

export function drawTrainingBackground(c: ICanvas2D, w: number, h: number, time: number): void {
  if (w <= 0 || h <= 0) return;

  const rm = ResourceManager.getInstance();
  const img = rm.getImage('main_bg');
  if (img) {
    c.drawImage(img, 0, 0, w, h);
    drawBattleBackgroundDim(c, w, h);
    return;
  }

  c.save();

  // 1. 垂直渐变底（深蓝黑 → 略亮）
  c.fillStyle = verticalGradient(c, 0, 0, w, h, Theme.color.bgDeep, Theme.color.bgMid);
  c.fillRect(0, 0, w, h);

  // 2. 科技网格（青色淡线）
  c.strokeStyle = Theme.color.grid;
  c.lineWidth = 1;
  const grid = 40;
  for (let x = 0; x <= w; x += grid) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
  }
  for (let y = 0; y <= h; y += grid) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
  }

  // 3. 地面分区线（中线下方一条青色亮线，强化战斗区）
  const groundY = h * 0.62;
  c.strokeStyle = 'rgba(79,209,224,0.25)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, groundY); c.lineTo(w, groundY);
  c.stroke();
  // 分区线下方虚线
  c.strokeStyle = 'rgba(79,209,224,0.1)';
  c.lineWidth = 1;
  c.setLineDash?.([6, 8]);
  c.beginPath();
  c.moveTo(0, groundY + 3); c.lineTo(w, groundY + 3);
  c.stroke();
  c.setLineDash?.([]);

  // 4. 能量节点（四角 + 中心，微弱呼吸圆）
  const nodeAlpha = 0.15 + 0.1 * ((Math.sin(time * 1.5) + 1) / 2);
  const nodes = [
    { x: w * 0.15, y: h * 0.25 },
    { x: w * 0.85, y: h * 0.25 },
    { x: w * 0.15, y: h * 0.85 },
    { x: w * 0.85, y: h * 0.85 },
  ];
  for (const n of nodes) {
    c.save();
    c.globalAlpha = nodeAlpha;
    circle(c, n.x, n.y, 6, Theme.color.cyan);
    c.restore();
  }

  // 5. 边缘暗角（四边渐暗，聚焦中心）
  // 用径向渐变模拟：中心透明 → 边缘深色
  const vignette = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  c.fillStyle = vignette;
  c.fillRect(0, 0, w, h);

  // 6. 训练场标题水印（极淡）
  c.save();
  c.globalAlpha = 0.08;
  c.fillStyle = Theme.color.cyan;
  c.font = Theme.font.title;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('TRAINING GROUND', w / 2, h * 0.15);
  c.restore();

  c.restore();
}

/**
 * 任务7：霓虹下水道背景（第二章）
 * 深蓝紫底 + 霓虹管线 + 污水反光波纹 + 绿/紫污染节点 + 警示灯。
 */
export function drawSewerBackground(c: ICanvas2D, w: number, h: number, time: number): void {
  if (w <= 0 || h <= 0) return;

  const rm = ResourceManager.getInstance();
  const img = rm.getImage('sewer_bg');
  if (img) {
    c.drawImage(img, 0, 0, w, h);
    return;
  }

  c.save();

  // 1. 深蓝紫渐变底
  c.fillStyle = verticalGradient(c, 0, 0, w, h, '#0a0820', '#1a1040');
  c.fillRect(0, 0, w, h);

  // 2. 霓虹管线（垂直 + 横向，紫色/青色霓虹）
  const pipes = [
    { x: w * 0.2, color: 'rgba(120,80,200,0.25)' },
    { x: w * 0.55, color: 'rgba(80,200,220,0.2)' },
    { x: w * 0.85, color: 'rgba(120,80,200,0.25)' },
  ];
  for (const p of pipes) {
    c.strokeStyle = p.color;
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(p.x, 0); c.lineTo(p.x, h);
    c.stroke();
    // 管线高光
    c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(p.x - 2, 0); c.lineTo(p.x - 2, h);
    c.stroke();
  }

  // 3. 污水反光波纹（底部多条正弦波）
  const waveY = h * 0.7;
  c.strokeStyle = 'rgba(80,220,180,0.15)';
  c.lineWidth = 1.5;
  for (let layer = 0; layer < 3; layer++) {
    c.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = waveY + layer * 18 + Math.sin(x * 0.03 + time * 2 + layer) * 6;
      if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
  }

  // 4. 污染能量节点（绿/紫，呼吸）
  const nodeAlpha = 0.18 + 0.12 * ((Math.sin(time * 1.8) + 1) / 2);
  const nodes = [
    { x: w * 0.15, y: h * 0.3, color: '#5fe068' },
    { x: w * 0.5, y: h * 0.45, color: '#a060e0' },
    { x: w * 0.85, y: h * 0.3, color: '#5fe068' },
    { x: w * 0.3, y: h * 0.6, color: '#a060e0' },
  ];
  for (const n of nodes) {
    c.save();
    c.globalAlpha = nodeAlpha;
    circle(c, n.x, n.y, 7, n.color);
    c.restore();
  }

  // 5. 警示灯（顶部两侧红点慢闪）
  const warnAlpha = 0.2 + 0.3 * ((Math.sin(time * 3) + 1) / 2);
  c.save();
  c.globalAlpha = warnAlpha;
  circle(c, 30, 50, 5, '#ff4040');
  circle(c, w - 30, 50, 5, '#ff4040');
  c.restore();

  // 6. 暗角
  const vignette = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
  c.fillStyle = vignette;
  c.fillRect(0, 0, w, h);

  // 7. 下水道水印
  c.save();
  c.globalAlpha = 0.08;
  c.fillStyle = '#a060e0';
  c.font = Theme.font.title;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('NEON SEWER', w / 2, h * 0.15);
  c.restore();

  c.restore();
}

/** 玩家攻击范围环（淡橙色提示） */
export function drawAttackRange(c: ICanvas2D, cx: number, cy: number, range: number, time: number): void {
  if (range <= 0) return;
  c.save();
  // 外环
  c.strokeStyle = 'rgba(255,140,26,0.18)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.arc(cx, cy, range, 0, Math.PI * 2);
  c.stroke();
  // 内层呼吸能量环
  const pulse = 0.1 + 0.08 * ((Math.sin(time * 2) + 1) / 2);
  energyRing(c, cx, cy, range * 0.92, Theme.color.orange, pulse, time * 1.5);
  c.restore();
}

/**
 * 任务13：熔火工厂背景（第三章）
 * 暗红渐变底 + 岩浆流动河流 + 红色/橙色火光节点 + 暗角。
 */
export function drawFactoryBackground(c: ICanvas2D, w: number, h: number, time: number): void {
  if (w <= 0 || h <= 0) return;
  c.save();

  // 1. 暗红渐变底
  c.fillStyle = verticalGradient(c, 0, 0, w, h, '#1f0808', '#3f1010');
  c.fillRect(0, 0, w, h);

  // 2. 岩浆河流（底部波浪流动，橙色/红色渐变）
  const lavaY = h * 0.72;
  c.save();
  // 绘制多层岩浆流
  for (let layer = 0; layer < 2; layer++) {
    c.fillStyle = layer === 0 ? 'rgba(255, 60, 0, 0.2)' : 'rgba(255, 120, 0, 0.15)';
    c.beginPath();
    c.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = lavaY + layer * 20 + Math.sin(x * 0.02 + time * 1.5 + layer * Math.PI) * 10;
      c.lineTo(x, y);
    }
    c.lineTo(w, h);
    c.closePath();
    c.fill();
  }
  c.restore();

  // 3. 火光/熔岩节点（红橙色，呼吸）
  const nodeAlpha = 0.2 + 0.15 * ((Math.sin(time * 2.0) + 1) / 2);
  const nodes = [
    { x: w * 0.2, y: h * 0.25, color: '#ff3300' },
    { x: w * 0.75, y: h * 0.35, color: '#ff6600' },
    { x: w * 0.3, y: h * 0.55, color: '#ff9900' },
  ];
  for (const n of nodes) {
    c.save();
    c.globalAlpha = nodeAlpha;
    circle(c, n.x, n.y, 8, n.color);
    c.restore();
  }

  // 4. 岩浆河岸边警示线
  c.strokeStyle = 'rgba(255,100,0,0.3)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, lavaY - 10);
  c.lineTo(w, lavaY - 10);
  c.stroke();

  // 5. 暗角
  const vignette = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
  c.fillStyle = vignette;
  c.fillRect(0, 0, w, h);

  // 6. 熔火工厂水印
  c.save();
  c.globalAlpha = 0.08;
  c.fillStyle = '#ff3300';
  c.font = Theme.font.title;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('MOLTEN FACTORY', w / 2, h * 0.15);
  c.restore();

  c.restore();
}
