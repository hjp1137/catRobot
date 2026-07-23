/**
 * render 层单测（任务2）
 * ------------------------------------------------------------------
 * 覆盖：
 *  1. DrawUtils 健壮性：负值/零尺寸/异常参数不抛错
 *  2. MechaRenderer / EnemyRenderer / BackgroundRenderer 调用不抛错
 *  3. Theme 常量完备性
 *  4. Effects 动效函数返回合法区间
 *  5. 链路：MainUI 按钮命中区域未失效、战斗可进入、结算可返回（已在冒烟覆盖，此处补 render 调用次数）
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { Theme } from '../dist/render/Theme.js';
import {
  fillRoundRect, strokeRoundRect, roundRectPath, verticalGradient,
  text, healthBar, star, energyRing, circle, triangle,
} from '../dist/render/DrawUtils.js';
import { breathe, floatY, hitFlashAlpha, attackFlashAlpha, panelScale } from '../dist/render/Effects.js';
import { drawMecha } from '../dist/render/MechaRenderer.js';
import { drawEnemyMouse } from '../dist/render/EnemyRenderer.js';
import { drawTrainingBackground, drawAttackRange } from '../dist/render/BackgroundRenderer.js';

function ctx() { return new MockContext(); }

// ---------- Theme ----------
test('Theme：颜色/字体/圆角常量完备', () => {
  assert.ok(Theme.color.orange && Theme.color.bgDeep);
  assert.ok(Theme.font.title && Theme.font.body);
  assert.ok(Theme.radius.md > 0);
});

// ---------- DrawUtils 健壮性 ----------
test('roundRectPath：负尺寸/零尺寸不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => roundRectPath(c.canvas, 0, 0, -10, -10, 5));
  assert.doesNotThrow(() => roundRectPath(c.canvas, 0, 0, 0, 0, 5));
});

test('fillRoundRect/strokeRoundRect：正常调用不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => fillRoundRect(c.canvas, 0, 0, 100, 50, 8, '#fff'));
  assert.doesNotThrow(() => strokeRoundRect(c.canvas, 0, 0, 100, 50, 8, '#fff', 2));
});

test('verticalGradient：返回带 addColorStop 的对象', () => {
  const c = ctx();
  const g = verticalGradient(c.canvas, 0, 0, 0, 100, '#000', '#fff');
  assert.equal(typeof g.addColorStop, 'function');
});

test('healthBar：ratio 越界不抛错（0/1/负/超1）', () => {
  const c = ctx();
  assert.doesNotThrow(() => healthBar(c.canvas, 0, 0, 100, 10, 0));
  assert.doesNotThrow(() => healthBar(c.canvas, 0, 0, 100, 10, 1));
  assert.doesNotThrow(() => healthBar(c.canvas, 0, 0, 100, 10, -5));
  assert.doesNotThrow(() => healthBar(c.canvas, 0, 0, 100, 10, 5, { showText: 'X' }));
});

test('star/circle/triangle/energyRing：零/负半径不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => star(c.canvas, 0, 0, 0, 0, 5, '#fff'));
  assert.doesNotThrow(() => star(c.canvas, 0, 0, 10, 2, 2, '#fff')); // points<3
  assert.doesNotThrow(() => circle(c.canvas, 0, 0, -5, '#fff'));
  assert.doesNotThrow(() => triangle(c.canvas, 0, 0, 1, 1, 2, 2, '#fff'));
  assert.doesNotThrow(() => energyRing(c.canvas, 0, 0, -3, '#fff', 0.5, 0));
});

test('text：空字符串/缺失 opts 不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => text(c.canvas, '', 0, 0));
  assert.doesNotThrow(() => text(c.canvas, 'hello', 10, 10, { font: Theme.font.body }));
});

// ---------- Effects ----------
test('Effects：返回值在合法区间', () => {
  for (let t = 0; t < 10; t += 0.3) {
    const b = breathe(t);
    assert.ok(b >= 0 && b <= 1, `breathe=${b}`);
    const fy = floatY(t);
    assert.ok(fy >= -10 && fy <= 10, `floatY=${fy}`);
  }
  assert.equal(hitFlashAlpha(0), 0);
  assert.ok(hitFlashAlpha(0.1) > 0 && hitFlashAlpha(0.1) <= 1);
  assert.equal(attackFlashAlpha(0), 0);
  assert.ok(attackFlashAlpha(0.1) > 0);
  // panelScale: progress 0→0.8, 1→1.0（ease-out），越界钳制
  assert.ok(Math.abs(panelScale(0) - 0.8) < 0.01);
  assert.ok(Math.abs(panelScale(1) - 1.0) < 0.01);
  assert.ok(Math.abs(panelScale(-1) - 0.8) < 0.01);
  assert.ok(Math.abs(panelScale(2) - 1.0) < 0.01);
});

// ---------- Renderer 调用不抛错 ----------
test('drawMecha：默认/带动效参数不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => drawMecha(c.canvas, { cx: 100, cy: 100, radius: 30 }));
  assert.doesNotThrow(() => drawMecha(c.canvas, { cx: 100, cy: 100, radius: 30, floatOffset: 4, hitFlash: 0.1, attackFlash: 0.1, facing: 1, showRings: true, time: 1 }));
  assert.doesNotThrow(() => drawMecha(c.canvas, { cx: 100, cy: 100, radius: 0 })); // 零半径
});

test('drawEnemyMouse：默认/带朝向不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => drawEnemyMouse(c.canvas, { cx: 50, cy: 50, radius: 14, hpRatio: 0.5 }));
  assert.doesNotThrow(() => drawEnemyMouse(c.canvas, { cx: 50, cy: 50, radius: 14, hpRatio: 0.5, hitFlash: 0.1, dirX: -1, dirY: 0.5, showBar: false }));
  assert.doesNotThrow(() => drawEnemyMouse(c.canvas, { cx: 50, cy: 50, radius: 0, hpRatio: 0 }));
});

test('drawTrainingBackground：正常/零尺寸不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => drawTrainingBackground(c.canvas, 375, 667, 1.5));
  assert.doesNotThrow(() => drawTrainingBackground(c.canvas, 0, 0, 0));
  assert.doesNotThrow(() => drawTrainingBackground(c.canvas, -10, -10, 0));
});

test('drawAttackRange：正常/零范围不抛错', () => {
  const c = ctx();
  assert.doesNotThrow(() => drawAttackRange(c.canvas, 100, 100, 120, 1));
  assert.doesNotThrow(() => drawAttackRange(c.canvas, 100, 100, 0, 1));
});

// ---------- 渲染确实产生绘制调用 ----------
test('drawMecha/drawEnemyMouse 产生 fill 调用', () => {
  const c = ctx();
  const before = c.canvas.calls.length;
  drawMecha(c.canvas, { cx: 100, cy: 100, radius: 30, showRings: true, time: 1 });
  drawEnemyMouse(c.canvas, { cx: 50, cy: 50, radius: 14, hpRatio: 0.5 });
  assert.ok(c.canvas.calls.length > before, '应有绘制调用');
});
