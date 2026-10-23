/**
 * 第二章新敌人绘制（任务7）
 * ------------------------------------------------------------------
 * 机械甲虫（椭圆金属壳+分段背甲+青眼）
 * 毒液机械虫（绿紫身体+毒液罐+污染光晕）
 * drawEnemy 分发：按 variant 调对应绘制。
 */
import { ICanvas2D } from '../engine/IContext';
import { Theme } from './Theme';
import { circle, triangle } from './DrawUtils';
import { hitFlashAlpha } from './Effects';
import { EnemyVariant } from '../data/EnemyConfig';
import { drawEnemyMouse, EnemyDrawOptions } from './EnemyRenderer';
import { drawPollutionQueen } from './Chapter2BossRenderer';
import { drawFurnaceGuardBody } from './Chapter3BossRenderer';
import { ResourceManager } from '../core/ResourceManager';
import { resolveAssetKey } from '../core/AssetResolver';

/** 机械甲虫：椭圆金属壳 + 分段背甲 + 青电子眼 */
function drawBeetle(c: ICanvas2D, o: EnemyDrawOptions): void {
  const { cx, cy, radius: r } = o;
  const dirX = o.dirX ?? 1;
  c.save();
  // 污染光晕（弱）
  c.save();
  c.globalAlpha = 0.15;
  circle(c, cx, cy, r * 1.4, '#8a9a4a');
  c.restore();
  // 椭圆金属壳（横向拉长；Mock 无 ellipse 时回退圆）
  c.fillStyle = '#5a6b3a';
  c.beginPath();
  if (c.ellipse) c.ellipse(cx, cy, r * 1.2, r * 0.85, 0, 0, Math.PI * 2);
  else c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath();
  c.fill();
  // 分段背甲（3 条横线）
  c.strokeStyle = '#3a4a2a';
  c.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    c.beginPath();
    c.moveTo(cx + i * r * 0.4, cy - r * 0.7);
    c.lineTo(cx + i * r * 0.4, cy + r * 0.7);
    c.stroke();
  }
  // 短腿（4 条）
  c.strokeStyle = '#3a4a2a';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - r * 0.9, cy - r * 0.5); c.lineTo(cx - r * 1.3, cy - r * 0.9);
  c.moveTo(cx - r * 0.9, cy + r * 0.5); c.lineTo(cx - r * 1.3, cy + r * 0.9);
  c.moveTo(cx + r * 0.9, cy - r * 0.5); c.lineTo(cx + r * 1.3, cy - r * 0.9);
  c.moveTo(cx + r * 0.9, cy + r * 0.5); c.lineTo(cx + r * 1.3, cy + r * 0.9);
  c.stroke();
  // 青电子眼（朝向方向）
  circle(c, cx + dirX * r * 0.6, cy - r * 0.2, r * 0.18, '#4fd1e0');
  // 血条
  if (o.showBar !== false) {
    drawMiniBar(c, cx, cy, r, o.hpRatio);
  }
  // 受击闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save();
    c.globalAlpha = hf;
    c.beginPath();
    if (c.ellipse) c.ellipse(cx, cy, r * 1.2, r * 0.85, 0, 0, Math.PI * 2);
    else c.arc(cx, cy, r, 0, Math.PI * 2);
    c.closePath();
    c.fillStyle = Theme.color.white;
    c.fill();
    c.restore();
  }
  c.restore();
}

/** 毒液机械虫：绿紫身体 + 毒液罐 + 污染光晕（精英更强） */
function drawToxicBug(c: ICanvas2D, o: EnemyDrawOptions, isElite: boolean): void {
  const { cx, cy, radius: r } = o;
  const dirX = o.dirX ?? 1;
  const bodyColor = isElite ? '#2a5a3a' : '#3a8a4a';
  const glowColor = isElite ? '#a060e0' : '#5fe068';
  c.save();
  // 污染光晕（精英更强）
  c.save();
  c.globalAlpha = isElite ? 0.4 : 0.25;
  circle(c, cx, cy, r * (isElite ? 1.7 : 1.4), glowColor);
  c.restore();
  // 身体
  circle(c, cx, cy, r, bodyColor);
  // 底部阴影
  c.save();
  c.globalAlpha = 0.35;
  circle(c, cx, cy + r * 0.35, r * 0.85, '#1a3a2a');
  c.restore();
  // 毒液罐（背部，普通1个/精英2个，绿色发光球）
  const tankCount = isElite ? 2 : 1;
  for (let i = 0; i < tankCount; i++) {
    const tx = cx + (i - (tankCount - 1) / 2) * r * 0.6;
    circle(c, tx, cy - r * 0.4, r * 0.22, '#5fe068');
    c.save();
    c.globalAlpha = 0.6;
    circle(c, tx - r * 0.05, cy - r * 0.45, r * 0.08, Theme.color.white);
    c.restore();
  }
  // 尖鼻（朝向）
  triangle(c,
    cx + dirX * r * 0.6 - r * 0.2, cy,
    cx + dirX * r * 0.6 + r * 0.2, cy,
    cx + dirX * r * 1.1, cy,
    '#1a3a2a');
  // 红电子眼
  circle(c, cx + dirX * r * 0.3 - r * 0.18, cy - r * 0.05, r * 0.1, Theme.color.redBright);
  circle(c, cx + dirX * r * 0.3 + r * 0.18, cy - r * 0.05, r * 0.1, Theme.color.redBright);
  // 血条
  if (o.showBar !== false) {
    drawMiniBar(c, cx, cy, r, o.hpRatio);
  }
  // 受击闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save();
    c.globalAlpha = hf;
    circle(c, cx, cy, r, Theme.color.white);
    c.restore();
  }
  c.restore();
}

/** 头顶小血条（新敌人共用） */
function drawMiniBar(c: ICanvas2D, cx: number, cy: number, r: number, ratio: number): void {
  const bw = r * 2.4;
  const x = cx - bw / 2;
  const y = cy - r * 1.8;
  c.fillStyle = '#000';
  c.globalAlpha = 0.5;
  c.fillRect(x - 1, y - 1, bw + 2, 6);
  c.globalAlpha = 1;
  c.fillStyle = ratio <= 0.4 ? Theme.color.red : Theme.color.green;
  c.fillRect(x, y, bw * Math.max(0, Math.min(1, ratio)), 4);
}

/** 熔岩甲虫：亮橙色椭圆背甲 + 红色火光边缘 */
function drawFireBeetle(c: ICanvas2D, o: EnemyDrawOptions): void {
  const { cx, cy, radius: r } = o;
  c.save();
  // 红色火光边缘
  c.save();
  c.globalAlpha = 0.25;
  circle(c, cx, cy, r * 1.35, '#ff3300');
  c.restore();
  // 亮橙色身体
  c.fillStyle = '#ff6600';
  c.beginPath();
  if (c.ellipse) c.ellipse(cx, cy, r * 1.15, r * 0.9, 0, 0, Math.PI * 2);
  else c.arc(cx, cy, r, 0, Math.PI * 2);
  c.closePath();
  c.fill();
  // 短脚（红色，4条）
  c.strokeStyle = '#990000';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - r * 0.9, cy - r * 0.4); c.lineTo(cx - r * 1.3, cy - r * 0.7);
  c.moveTo(cx - r * 0.9, cy + r * 0.4); c.lineTo(cx - r * 1.3, cy + r * 0.7);
  c.moveTo(cx + r * 0.9, cy - r * 0.4); c.lineTo(cx + r * 1.3, cy - r * 0.7);
  c.moveTo(cx + r * 0.9, cy + r * 0.4); c.lineTo(cx + r * 1.3, cy + r * 0.7);
  c.stroke();
  // 黄色复眼
  circle(c, cx + (o.dirX ?? 1) * r * 0.5, cy - r * 0.2, r * 0.15, '#ffcc00');
  // 血条
  if (o.showBar !== false) {
    drawMiniBar(c, cx, cy, r, o.hpRatio);
  }
  // 受击闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save(); c.globalAlpha = hf; c.fillStyle = Theme.color.white;
    circle(c, cx, cy, r, Theme.color.white); c.restore();
  }
  c.restore();
}

/** 烈焰行者：迅猛的三角形身体 + 尾部黄色焰焰效果 */
function drawBlazeHound(c: ICanvas2D, o: EnemyDrawOptions): void {
  const { cx, cy, radius: r } = o;
  const dirX = o.dirX ?? 1;
  c.save();
  // 红色火焰焰光
  c.save();
  c.globalAlpha = 0.25;
  circle(c, cx - dirX * r * 0.2, cy, r * 1.4, '#ff1a1a');
  c.restore();
  // 尖锐身体 (三角形)
  triangle(c,
    cx - dirX * r * 0.7, cy - r * 0.6,
    cx - dirX * r * 0.7, cy + r * 0.6,
    cx + dirX * r * 0.9, cy,
    '#cc0000');
  // 黄色火纹 eye
  circle(c, cx + dirX * r * 0.3, cy - r * 0.1, r * 0.15, '#ffea00');
  // 血条
  if (o.showBar !== false) {
    drawMiniBar(c, cx, cy, r, o.hpRatio);
  }
  // 受击闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save(); c.globalAlpha = hf; c.fillStyle = Theme.color.white;
    circle(c, cx, cy, r, Theme.color.white); c.restore();
  }
  c.restore();
}

/** 熔岩巨怪：巨大的暗红色岩石身体 + 裂缝流淌着的黄色/橙色熔岩 */
function drawMagmaGolem(c: ICanvas2D, o: EnemyDrawOptions): void {
  const { cx, cy, radius: r } = o;
  c.save();
  // 暗红庞大身躯
  c.fillStyle = '#660000';
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.strokeStyle = '#330000';
  c.lineWidth = 3;
  c.strokeRect(cx - r, cy - r, r * 2, r * 2);
  // 岩浆裂纹（多条金黄色十字斜线）
  c.strokeStyle = '#ffbb00';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - r * 0.6, cy - r * 0.6); c.lineTo(cx + r * 0.6, cy + r * 0.6);
  c.moveTo(cx - r * 0.5, cy + r * 0.5); c.lineTo(cx + r * 0.5, cy - r * 0.5);
  c.stroke();
  // 炽热红眼
  circle(c, cx + (o.dirX ?? 1) * r * 0.4, cy - r * 0.4, r * 0.18, '#ff2200');
  // 血条
  if (o.showBar !== false) {
    drawMiniBar(c, cx, cy, r, o.hpRatio);
  }
  // 受击闪烁
  const hf = hitFlashAlpha(o.hitFlash ?? 0);
  if (hf > 0) {
    c.save(); c.globalAlpha = hf; c.fillStyle = Theme.color.white;
    c.fillRect(cx - r, cy - r, r * 2, r * 2); c.restore();
  }
  c.restore();
}

/** 任务7/8/13/14：敌人绘制分发（按 variant） */
export function drawEnemy(c: ICanvas2D, o: EnemyDrawOptions): void {
  drawEnemyInternal(c, o);

  // 统一绘制状态特效（毒液）
  if (o.statusEffects?.has?.('poison')) {
    const res = ResourceManager.getInstance();
    const poisonImg = res.getImage('status_poison');
    const cx = o.cx;
    const cy = o.cy;
    const r = o.radius;
    if (res.isLoaded('status_poison') && poisonImg) {
      c.drawImage(poisonImg, cx - r, cy - r - 20, 14, 14);
    } else {
      // 兜底小紫圆
      c.save();
      c.fillStyle = '#a060e0';
      circle(c, cx - r + 7, cy - r - 13, 4, '#a060e0');
      c.restore();
    }
  }
}

function drawEnemyInternal(c: ICanvas2D, o: EnemyDrawOptions): void {
  const v: EnemyVariant | undefined = o.variant;

  // 优先使用加载好的敌人资源，加载失败则用 Canvas 程序化兜底
  const res = ResourceManager.getInstance();
  const imageKey = v ? resolveAssetKey('enemy', v) : 'enemy_rat';
  const templateImg = res.getImageByArtKey(o.artKey);

  if (templateImg || (!o.artKey && imageKey && res.isLoaded(imageKey))) {
    const img = templateImg ?? (!o.artKey ? res.getImage(imageKey) : null);
    if (img) {
      const { cx, cy, radius: r } = o;
      c.save();
      const shadowScale = Math.max(0, o.shadowScale ?? 1);
      if (shadowScale > 0) {
        c.fillStyle = 'rgba(0,0,0,0.3)';
        circle(c, cx, cy + r * 0.7, r * 0.9 * shadowScale, 'rgba(0,0,0,0.3)');
      }
      // 镜像朝向
      c.translate(cx, cy);
      if ((o.dirX ?? 1) < 0) {
        c.scale(-1, 1);
      }
      c.drawImage(img, -r, -r, r * 2, r * 2);
      c.restore();

      // 受击闪烁
      const hf = hitFlashAlpha(o.hitFlash ?? 0);
      if (hf > 0) {
        c.save();
        c.globalAlpha = hf;
        c.fillStyle = Theme.color.white;
        circle(c, cx, cy, r, Theme.color.white);
        c.restore();
      }
      
      // 血条 (Boss 专属血条在顶部 UI 渲染，小怪血条在此处渲染)
      if (o.showBar !== false && v !== 'chapter3_boss' && v !== 'chapter2_boss' && v !== 'boss') {
        drawMiniBar(c, cx, cy, r, o.hpRatio);
      }
      return;
    }
  }

  if (v === 'chapter3_boss') {
    drawFurnaceGuardBody(c, o.cx, o.cy, o.radius, o.hitFlash ?? 0, o.dirX ?? 1);
    return;
  }
  if (v === 'chapter2_boss') { drawPollutionQueen(c, o); return; }
  if (v === 'beetle') { drawBeetle(c, o); return; }
  if (v === 'toxic') { drawToxicBug(c, o, false); return; }
  if (v === 'elite_toxic') { drawToxicBug(c, o, true); return; }
  if (v === 'fire_normal') { drawFireBeetle(c, o); return; }
  if (v === 'fire_fast') { drawBlazeHound(c, o); return; }
  if (v === 'fire_elite') { drawMagmaGolem(c, o); return; }
  
  // 鼠类（normal/elite/boss）走原有绘制
  drawEnemyMouse(c, o);
}
