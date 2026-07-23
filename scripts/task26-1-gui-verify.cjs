const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'Walkthroughes', 'screenshots', '20260715_task26_1');
const reportPath = path.join(outDir, 'gui-report.json');
const debug = 'http://127.0.0.1:9333';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = path.join(root, 'scratch', 'task26_1_chrome_profile');
const adminUsername = process.env.TASK261_ADMIN_USERNAME;
const adminPassword = process.env.TASK261_ADMIN_PASSWORD;
fs.mkdirSync(outDir, { recursive: true });

const requestedMode = process.argv[2] ?? 'phase1';
const report = requestedMode !== 'phase1' && fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : {
  startedAt: new Date().toISOString(), screenshots: [], badResponses: [], expected409: [], pageErrors: [], consoleErrors: [], evidence: {},
};

class Cdp {
  constructor(url, label) {
    this.label = label; this.nextId = 1; this.pending = new Map(); this.ws = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => { this.ws.onopen = resolve; this.ws.onerror = reject; });
    this.ws.onmessage = event => this.receive(JSON.parse(event.data));
  }
  receive(message) {
    if (message.id) { const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); return message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); }
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && !message.params.response.url.endsWith('/favicon.ico')) {
      const item = { page: this.label, status: message.params.response.status, url: message.params.response.url };
      if (item.status === 409) report.expected409.push(item); else report.badResponses.push(item);
    }
    if (message.method === 'Runtime.exceptionThrown') report.pageErrors.push({ page: this.label, text: message.params.exceptionDetails.text, description: message.params.exceptionDetails.exception?.description });
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') report.consoleErrors.push({ page: this.label, args: message.params.args.map(arg => arg.value ?? arg.description) });
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') report.consoleErrors.push({ page: this.label, text: message.params.entry.text });
  }
  async send(method, params = {}) {
    await this.ready; const id = this.nextId++;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  close() { this.ws.close(); }
}

async function ensureChrome() {
  try { await fetch(`${debug}/json/version`); return; } catch {}
  const child = spawn(chromePath, [`--remote-debugging-port=9333`, `--user-data-dir=${profile}`, '--headless=new', '--disable-gpu', '--no-first-run', '--window-size=1920,1080', 'about:blank'], { detached: true, stdio: 'ignore', windowsHide: true });
  child.unref();
  for (let i = 0; i < 80; i++) { try { await fetch(`${debug}/json/version`); return; } catch { await sleep(100); } }
  throw new Error('Chrome remote debugging did not start');
}

async function newPage(url, label) {
  const target = await (await fetch(`${debug}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const page = new Cdp(target.webSocketDebuggerUrl, label);
  await Promise.all([page.send('Page.enable'), page.send('Runtime.enable'), page.send('Network.enable'), page.send('Log.enable')]);
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  return page;
}

async function evaluate(page, expression) {
  const result = await page.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(page, expression, timeout = 15000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (await evaluate(page, `Boolean(${expression})`)) return; await sleep(100); }
  throw new Error(`Timeout waiting for ${expression}`);
}

async function clickText(page, text) {
  return evaluate(page, `(() => { const clean=x=>x.replace(/\\s/g,''); const needle=clean(${JSON.stringify(text)}); const nodes=[...document.querySelectorAll('button,[role=button],.ant-select-item-option')].filter(x=>x.getClientRects().length); const el=nodes.find(x=>clean(x.textContent)===needle) ?? nodes.find(x=>clean(x.textContent).includes(needle)); if(!el) throw new Error('button not found '+needle); el.click(); return el.textContent.trim(); })()`);
}

async function setInput(page, selector, index, value) {
  return evaluate(page, `(() => { const el=document.querySelectorAll(${JSON.stringify(selector)})[${index}]; if(!el) throw new Error('input not found'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(el,${JSON.stringify(String(value))}); el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:${JSON.stringify(String(value))}})); el.dispatchEvent(new Event('change',{bubbles:true})); el.blur(); return el.value; })()`);
}

async function clickSelector(page, selector, index = 0) {
  const point = await evaluate(page, `(() => { const r=document.querySelectorAll(${JSON.stringify(selector)})[${index}].getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
}

async function shot(page, name, full = false) {
  let params = { format: 'png', captureBeyondViewport: true };
  if (full) {
    const metrics = await page.send('Page.getLayoutMetrics'); const size = metrics.cssContentSize;
    params = { ...params, clip: { x: 0, y: 0, width: Math.min(size.width, 1920), height: Math.min(size.height, 6000), scale: 1 } };
  }
  const result = await page.send('Page.captureScreenshot', params);
  const file = path.join(outDir, name); fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
  if (!report.screenshots.includes(name)) report.screenshots.push(name);
}

async function login(page) {
  if (!adminUsername || !adminPassword) throw new Error('请设置 TASK261_ADMIN_USERNAME 和 TASK261_ADMIN_PASSWORD');
  await page.send('Page.navigate', { url: 'http://127.0.0.1:5602/login' });
  await waitFor(page, `document.querySelectorAll('input').length >= 2`);
  await setInput(page, 'input', 0, adminUsername); await setInput(page, 'input', 1, adminPassword);
  await evaluate(page, `document.querySelector('.login-card button[type="submit"]').click()`); await waitFor(page, `location.pathname !== '/login'`);
}

async function openEditor(page) {
  await page.send('Page.navigate', { url: 'http://127.0.0.1:5602/content/stages/stage_battle_1_1/editor' });
  await waitFor(page, `document.querySelector('[data-testid="stage-scene"]') && document.body.innerText.includes('MySQL 草稿')`, 30000);
  await waitFor(page, `document.querySelectorAll('[data-testid="stage-scene"] img').length >= 3`, 30000);
}

async function scrollTo(page, selector) {
  await evaluate(page, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'start'})`); await sleep(250);
}

async function dragEnemy(page) {
  const rect = await evaluate(page, `(() => { const r=document.querySelector('.scene-point.enemy').getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.x, y: rect.y, button: 'left', clickCount: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x + 70, y: rect.y + 35, button: 'left' });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x + 70, y: rect.y + 35, button: 'left', clickCount: 1 });
  await sleep(250);
}

async function waitState(page, state) { await waitFor(page, `document.querySelector('[data-testid="preview-panel"]')?.innerText.includes(${JSON.stringify(state)})`, 20000); }
async function clickPreview(page, text) { await evaluate(page, `(() => { const clean=x=>x.replace(/\\s/g,''); const el=[...document.querySelectorAll('[data-testid="preview-panel"] button')].find(x=>clean(x.textContent)===clean(${JSON.stringify(text)})); if(!el) throw new Error('preview button missing'); el.click(); })()`); }
async function invokePreview(page, action) { await evaluate(page, `document.querySelector('[data-testid="preview-panel"]').__vueParentComponent.parent.setupState.preview(${JSON.stringify(action)})`); }
async function startPreview(page) {
  await sleep(300); await invokePreview(page, 'start'); await sleep(250);
  report.evidence.previewStartTrace = [await evaluate(page, `document.querySelector('[data-testid="preview-panel"] strong')?.innerText`)];
}
function rowVersionExpression() { return `Number(document.body.innerText.match(/rowVersion\\s+(\\d+)/)?.[1] ?? -1)`; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function persistReport() { report.finishedAt = new Date().toISOString(); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2)); }

async function phase1() {
  await ensureChrome(); const stale = await (await fetch(`${debug}/json/list`)).json();
  for (const target of stale.filter(item => item.type === 'page')) await fetch(`${debug}/json/close/${target.id}`);
  const page = await newPage('about:blank', 'pageA');
  await login(page); await openEditor(page); await shot(page, '01_editor_full.png', true);
  await shot(page, '02_real_background_hero_enemies.png'); await shot(page, '03_property_panel_layout.png');
  await evaluate(page, `document.querySelector('.object-panel i.enemy').closest('button').click()`); await shot(page, '04_spawn_selected_properties.png');
  await dragEnemy(page); await shot(page, '05_spawn_dragged_coordinates.png');
  await setInput(page, '.property-panel .ant-input-number-input', 0, 333); await setInput(page, '.property-panel .ant-input-number-input', 1, 444);
  await shot(page, '06_spawn_exact_coordinates.png');
  await evaluate(page, `(() => { const existing=[...document.querySelectorAll('.object-panel>button')].find(x=>x.textContent.includes('草稿测试图层')); if(existing) existing.click(); else [...document.querySelectorAll('button')].find(x=>x.textContent.includes('＋ 图层')).click(); })()`); await shot(page, '07_layer_editing.png');
  await scrollTo(page, '.wave-editor'); await evaluate(page, `document.querySelector('.wave-editor .ant-collapse-header').click()`);
  await waitFor(page, `document.querySelector('.wave-editor .entry-card')`);
  await setInput(page, '.wave-editor input:not(.ant-input-number-input)', 0, '第一波-26.1验收');
  await setInput(page, '.wave-editor .ant-input-number-input', 3, 4); await setInput(page, '.wave-editor .ant-input-number-input', 5, 650);
  await setInput(page, '.wave-editor .ant-input-number-input', 6, 1.2); await setInput(page, '.wave-editor .ant-input-number-input', 7, 1.1); await setInput(page, '.wave-editor .ant-input-number-input', 8, 1.3);
  report.evidence.spawnPointAfterEdit = await evaluate(page, `document.querySelectorAll('.entry-card .ant-select-selection-item')[1]?.textContent.trim()`);
  await shot(page, '08_wave_detail_editing.png'); await shot(page, '09_wave_entry_editing.png');
  await evaluate(page, `scrollTo(0,0)`); const before = await evaluate(page, rowVersionExpression()); report.evidence.rowVersionBefore = before;
  await clickText(page, '保存草稿'); await waitFor(page, `${rowVersionExpression()} > ${before}`, 20000);
  report.evidence.rowVersionAfterSave = await evaluate(page, rowVersionExpression());
  const reloadMarker = await evaluate(page, `performance.timeOrigin`); await page.send('Page.reload', { ignoreCache: true });
  await waitFor(page, `performance.timeOrigin !== ${reloadMarker} && document.querySelector('[data-testid="stage-scene"]') && ${rowVersionExpression()} > ${before}`, 30000);
  await shot(page, '10_saved_and_refreshed.png', true); report.evidence.rowVersionAfterRefresh = await evaluate(page, rowVersionExpression());
  await evaluate(page, `document.querySelector('.object-panel i.enemy').closest('button').click()`);
  report.evidence.coordinatesAfterRefresh = await evaluate(page, `([...document.querySelectorAll('.property-panel .ant-input-number-input')].slice(0,2).map(x=>Number(x.value)))`);
  const previewPage = await newPage('http://127.0.0.1:5602/content/stages/stage_battle_1_1/editor', 'preview');
  await waitFor(previewPage, `document.querySelector('.orchestration-page')?.dataset.editorReady === 'true'`, 30000);
  await scrollTo(previewPage, '[data-testid="preview-panel"]');
  await startPreview(previewPage); await waitState(previewPage, 'WAVE_RUNNING'); await shot(previewPage, '11_wave_running.png');
  await invokePreview(previewPage, 'pause'); await waitState(previewPage, 'PAUSED'); await shot(previewPage, '12_paused.png'); await invokePreview(previewPage, 'resume');
  await invokePreview(previewPage, 'defeatWave'); await waitState(previewPage, 'WAVE_CLEAR'); await invokePreview(previewPage, 'skipWait'); await waitState(previewPage, 'WAVE_RUNNING'); await shot(previewPage, '13_second_wave.png');
  await invokePreview(previewPage, 'defeatWave'); await waitState(previewPage, 'WAVE_CLEAR'); await invokePreview(previewPage, 'skipWait'); await waitState(previewPage, 'WAVE_RUNNING'); await shot(previewPage, '14_third_wave.png');
  await invokePreview(previewPage, 'defeatWave'); await waitState(previewPage, 'STAGE_CLEAR'); await shot(previewPage, '15_stage_clear.png');
  await invokePreview(previewPage, 'reset'); await startPreview(previewPage); await waitState(previewPage, 'WAVE_RUNNING'); await invokePreview(previewPage, 'heroDead'); await waitState(previewPage, 'STAGE_FAILED'); await shot(previewPage, '16_stage_failed.png');
  await shot(previewPage, '17_draft_preview.png'); await evaluate(previewPage, `scrollTo(0,0)`); await clickSelector(previewPage, '.source-bar .ant-radio-button-wrapper', 1);
  await waitFor(previewPage, `document.body.innerText.includes('R000007') && document.body.innerText.includes('旧关卡逻辑回退')`, 30000); await shot(previewPage, '18_published_preview_r000007.png', true);
  await clickSelector(previewPage, '.source-bar .ant-radio-button-wrapper', 0); await waitFor(previewPage, `document.body.innerText.includes('MySQL 草稿')`); previewPage.close();

  const pageB = await newPage('http://127.0.0.1:5602/content/stages/stage_battle_1_1/editor', 'pageB'); await waitFor(pageB, `document.querySelector('.orchestration-page')?.dataset.editorReady === 'true'`, 30000);
  const bVersion = await evaluate(pageB, rowVersionExpression()); await clickText(pageB, '＋ 图层'); await clickText(pageB, '保存草稿'); await waitFor(pageB, `${rowVersionExpression()} > ${bVersion}`, 20000);
  report.evidence.pageBRowVersion = await evaluate(pageB, rowVersionExpression()); await clickText(page, '＋ 图层'); await clickText(page, '保存草稿');
  await waitFor(page, `document.body.innerText.includes('CONTENT_CONFLICT')`, 20000); await shot(page, '19_optimistic_lock_conflict.png');
  await clickText(page, '右侧入口'); await clickText(page, '删除');
  await waitFor(page, `document.querySelector('.ant-modal-content')?.innerText.includes('CONTENT_REFERENCE_EXISTS')`); await shot(page, '20_reference_protection.png'); await clickText(page, '确 定');
  await clickText(page, '返回关卡列表'); await waitFor(page, `document.querySelector('.ant-modal-content')?.innerText.includes('存在未保存修改')`); await shot(page, '21_unsaved_leave_prompt.png'); await clickText(page, '继续编辑');
  pageB.close(); persistReport(); console.log(JSON.stringify({ phase: 1, screenshots: report.screenshots.length, evidence: report.evidence, expected409: report.expected409.length, badResponses: report.badResponses.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length }));
}

async function phase2() {
  await ensureChrome(); const targets = await (await fetch(`${debug}/json/list`)).json();
  const target = targets.find(item => item.type === 'page' && item.url.includes('stage_battle_1_1/editor'));
  const page = target ? new Cdp(target.webSocketDebuggerUrl, 'pageA-restart') : await newPage('http://127.0.0.1:5602/content/stages/stage_battle_1_1/editor', 'pageA-restart');
  await Promise.all([page.send('Page.enable'), page.send('Runtime.enable'), page.send('Network.enable'), page.send('Log.enable')]);
  const marker = await evaluate(page, `performance.timeOrigin`); await page.send('Page.reload', { ignoreCache: true });
  await waitFor(page, `performance.timeOrigin !== ${marker} && document.querySelector('.orchestration-page')?.dataset.editorReady === 'true'`, 30000);
  if (await evaluate(page, `location.pathname === '/login'`)) { await login(page); await openEditor(page); }
  await waitFor(page, `document.querySelectorAll('[data-testid="stage-scene"] img').length >= 3`, 30000);
  report.evidence.rowVersionAfterNestRestart = await evaluate(page, rowVersionExpression());
  await evaluate(page, `document.querySelector('.object-panel i.enemy').closest('button').click()`);
  report.evidence.coordinatesAfterNestRestart = await evaluate(page, `([...document.querySelectorAll('.property-panel .ant-input-number-input')].slice(0,2).map(x=>Number(x.value)))`);
  await scrollTo(page, '.wave-editor'); await evaluate(page, `document.querySelector('.wave-editor .ant-collapse-header').click()`);
  await waitFor(page, `document.querySelector('.wave-editor .entry-card')`);
  report.evidence.waveAfterNestRestart = await evaluate(page, `({ name:document.querySelector('.wave-editor input:not(.ant-input-number-input)').value, numbers:[...document.querySelectorAll('.wave-editor .ant-input-number-input')].map(x=>Number(x.value)) })`);
  await shot(page, '22_nest_restart_persistence.png', true); persistReport();
  console.log(JSON.stringify({ phase: 2, screenshots: report.screenshots.length, evidence: report.evidence, expected409: report.expected409.length, badResponses: report.badResponses.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length }));
  await page.send('Browser.close').catch(() => {});
}

async function finishPhase1() {
  await ensureChrome(); const targets = await (await fetch(`${debug}/json/list`)).json(); const clients = [];
  let page;
  for (const target of targets.filter(item => item.type === 'page' && item.url.includes('stage_battle_1_1/editor'))) {
    const candidate = new Cdp(target.webSocketDebuggerUrl, 'pageA-finish'); clients.push(candidate); await candidate.send('Runtime.enable');
    if (await evaluate(candidate, `document.body.innerText.includes('CONTENT_CONFLICT')`)) { page = candidate; break; }
  }
  if (!page) throw new Error('dirty conflict page not found');
  if (await evaluate(page, `[...document.querySelectorAll('.ant-modal-content')].some(x=>x.innerText.includes('CONTENT_REFERENCE_EXISTS'))`)) { await clickText(page, 'OK'); await sleep(250); }
  if (!await evaluate(page, `[...document.querySelectorAll('.ant-modal-content')].some(x=>x.innerText.includes('存在未保存修改'))`)) await clickText(page, '返回关卡列表');
  await waitFor(page, `[...document.querySelectorAll('.ant-modal-content')].some(x=>x.innerText.includes('存在未保存修改'))`);
  await shot(page, '21_unsaved_leave_prompt.png'); await clickText(page, '继续编辑');
  report.consoleErrors = report.consoleErrors.filter(item => !String(item.text ?? '').includes('status of 409'));
  delete report.failure; persistReport();
  for (const client of clients) if (client !== page) client.close();
  console.log(JSON.stringify({ phase: '1-finish', screenshots: report.screenshots.length, expected409: report.expected409.length, badResponses: report.badResponses.length, pageErrors: report.pageErrors.length, consoleErrors: report.consoleErrors.length }));
  process.exit(0);
}

(requestedMode === 'phase2' ? phase2() : requestedMode === 'finish' ? finishPhase1() : phase1()).catch(error => {
  report.failure = { mode: requestedMode, message: error.message, stack: error.stack }; persistReport(); console.error(error); process.exit(1);
});
