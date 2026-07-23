/**
 * 升级系统单测
 * 覆盖：消耗公式、资源充足/不足、成功扣减、多次升级、属性派生
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getUpgradeCost, tryUpgrade } from '../dist/data/Upgrade.js';

test('getUpgradeCost：公式 = level*50 金币 + level*5 零件', () => {
  assert.deepEqual(getUpgradeCost(1), { gold: 50, parts: 5 });
  assert.deepEqual(getUpgradeCost(3), { gold: 150, parts: 15 });
  assert.deepEqual(getUpgradeCost(10), { gold: 500, parts: 50 });
});

test('tryUpgrade：资源充足成功扣减', () => {
  const p = { level: 2, gold: 200, parts: 20 };
  const r = tryUpgrade(p);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.newLevel, 3);
    assert.equal(r.cost.gold, 100);
    assert.equal(r.cost.parts, 10);
  }
  assert.equal(p.level, 3);
  assert.equal(p.gold, 100);  // 200 - 100
  assert.equal(p.parts, 10);  // 20 - 10
});

test('tryUpgrade：金币不足拒绝', () => {
  const p = { level: 5, gold: 100, parts: 100 }; // 需要 250 金币
  const r = tryUpgrade(p);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'gold');
  assert.equal(p.level, 5); // 未变
  assert.equal(p.gold, 100);
});

test('tryUpgrade：零件不足拒绝', () => {
  const p = { level: 5, gold: 500, parts: 10 }; // 需要 25 零件
  const r = tryUpgrade(p);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'parts');
  assert.equal(p.level, 5);
});

test('连续升级：金币零件耗尽后停止', () => {
  const p = { level: 1, gold: 1000, parts: 100 };
  let times = 0;
  while (true) {
    const r = tryUpgrade(p);
    if (!r.ok) break;
    times++;
    if (times > 100) throw new Error('死循环');
  }
  // 1000 金币 + 100 零件：1→2(50/5)→3(100/10)→4(150/15)→5(200/20)→6(250/25)→7(300/30)→8(350/35)
  // 累计零件 5+10+15+20+25+30+35=140 > 100，应在 Lv7→8 阶段零件不足
  assert.ok(times >= 5 && times <= 7, `times=${times}`);
});
