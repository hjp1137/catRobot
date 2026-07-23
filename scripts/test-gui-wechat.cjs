'use strict';
const fs = require('fs');
const path = require('path');
const automator = require('miniprogram-automator');

const root = path.resolve('.');
const autoPort = Number.parseInt(process.env.WECHAT_AUTOMATOR_PORT ?? '9420', 10);
if (!Number.isInteger(autoPort) || autoPort < 1 || autoPort > 65535) {
  throw new Error('WECHAT_AUTOMATOR_PORT 必须是 1-65535 的整数');
}
const outDir = path.join(root, 'Walkthroughes', 'screenshots', 'task16');
fs.mkdirSync(outDir, { recursive: true });

function writeReport(report) {
  fs.writeFileSync(path.join(outDir, 'gui-report.json'), JSON.stringify(report, null, 2), 'utf8');
}
async function shot(mp, file, note, report) {
  const p = path.join(outDir, file);
  await mp.screenshot({ path: p });
  report.screenshots.push({ file, path: p, note });
}
async function state(mp) {
  return await mp.evaluate(() => globalThis.__MEOW_EXPLORE_TEST_STATE__ || null);
}
async function enterExplore(mp) {
  return await mp.evaluate(() => {
    globalThis.__MEOW_GUI_AUTOMATION__ = true;
    const game = globalThis.__MEOW_GAME__;
    const explore = globalThis.__MEOW_EXPLORE__;
    if (!game || !explore) return { ok: false, reason: 'debug handles missing' };
    game.player.tutorialFinished = true;
    game.startExploreTraining();
    return { ok: game.scene === 'explore', scene: game.scene };
  });
}
async function step1(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    e.objective.enemyKills = 0;
    e.objective.enemyKillGoalCompleted = false;
    e.update(0.1); return true;
  });
}
async function step2(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    e.objective.enemyKills = e.objective.enemyKillsRequired;
    e.objective.enemyKillGoalCompleted = true;
    e.update(0.016);
    e.objective.resourcesCollected = 0;
    e.objective.resourceGoalCompleted = false;
    return true;
  });
}
async function step3(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    e.killGoalNoticeTimer = 0; e.update(0.1);
    e.player.x = 0; e.player.y = 0; e.update(0.1);
    return true;
  });
}
async function step4(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    const g = e.getGuideTarget();
    if (g && g.type === 'resource') { e.player.x = g.worldX; e.player.y = g.worldY; }
    e.update(0.1); return true;
  });
}
async function step5(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    e.objective.resourcesCollected = e.objective.resourcesRequired;
    e.objective.resourceGoalCompleted = true;
    e.objective.chestsOpened = 0;
    e.objective.chestGoalCompleted = false;
    e.update(0.1);
    const g = e.getGuideTarget();
    if (g && g.type === 'chest') { e.player.x = g.worldX; e.player.y = g.worldY; }
    e.update(0.1); return true;
  });
}
async function step6(mp) {
  return await mp.evaluate(() => {
    const e = globalThis.__MEOW_EXPLORE__; if (!e) return false;
    e.objective.chestsOpened = e.objective.chestsRequired;
    e.objective.chestGoalCompleted = true;
    e.objective.completed = true;
    e.update(0.016); return true;
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));

async function runGui() {
  const report = { autoPort, screenshots: [], states: [], failedStep: 'init', error: null, success: false };
  let mp;
  const timeoutId = setTimeout(() => {
    console.error('全局超时15s');
    report.error = '全局超时15s';
    writeReport(report);
    if (mp) try { mp.disconnect(); } catch (_) {}
    process.exit(1);
  }, 15000);
  try {
    console.log('[1/8] 正在连接自动化端口 ' + autoPort + ' ...');
    report.failedStep = 'connect';
    mp = await automator.connect({ wsEndpoint: `ws://127.0.0.1:${autoPort}` });
    console.log('[2/8] 连接成功，截取首页...');

    report.failedStep = 'enter_explore';
    await shot(mp, '01_home.png', '首页', report);
    const entered = await enterExplore(mp);
    if (!entered.ok) throw new Error('进入探索失败: ' + (entered.reason || entered.scene));
    await wait(1200);

    console.log('[3/8] 步骤1: 敌人引导...');
    report.failedStep = 'step1'; await step1(mp); await wait(200);
    report.states.push({ label: 'guide_enemy', value: await state(mp) });
    await shot(mp, '02_guide_enemy.png', '引导清理敌人', report);

    console.log('[4/8] 步骤2: 击败完成提示...');
    report.failedStep = 'step2'; await step2(mp); await wait(200);
    report.states.push({ label: 'kill_done', value: await state(mp) });
    await shot(mp, '03_kill_done.png', '击败完成', report);

    console.log('[5/8] 步骤3: 资源引导箭头...');
    report.failedStep = 'step3'; await step3(mp); await wait(200);
    report.states.push({ label: 'resource_arrow', value: await state(mp) });
    await shot(mp, '04_resource_arrow.png', '资源引导', report);

    console.log('[6/8] 步骤4: 资源拾取高亮...');
    report.failedStep = 'step4'; await step4(mp); await wait(200);
    report.states.push({ label: 'resource_collect', value: await state(mp) });
    await shot(mp, '05_resource_collect.png', '资源拾取', report);

    console.log('[7/8] 步骤5: 宝箱引导...');
    report.failedStep = 'step5'; await step5(mp); await wait(200);
    report.states.push({ label: 'chest_guide', value: await state(mp) });
    await shot(mp, '06_chest_guide.png', '宝箱引导', report);

    console.log('[8/8] 步骤6: 训练完成...');
    report.failedStep = 'step6'; await step6(mp); await wait(200);
    report.states.push({ label: 'completion', value: await state(mp) });
    await shot(mp, '07_completion.png', '训练完成', report);

    report.success = true;
    report.failedStep = 'none';
    console.log('全部步骤通过！');
  } catch (err) {
    report.error = err.message;
    console.error('出错:', err.message);
  } finally {
    writeReport(report);
    if (mp) try { mp.disconnect(); } catch (_) {}
  }
  clearTimeout(timeoutId);
  console.log(JSON.stringify({ ok: report.success, screenshots: report.screenshots.length, failedStep: report.failedStep, error: report.error }, null, 2));
  process.exit(report.success ? 0 : 1);
}

runGui();
