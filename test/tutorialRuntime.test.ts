import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EventManager } from '../dist/core/EventManager.js';
import { TutorialSnapshotRepository } from '../dist/tutorial/TutorialSnapshotRepository.js';
import { computeTutorialSnapshotChecksum } from '../dist/tutorial/TutorialSnapshotChecksum.js';
import { TutorialTargetRegistry } from '../dist/tutorial/TutorialTargetRegistry.js';
import { TutorialInputLimiter } from '../dist/tutorial/TutorialInputLimiter.js';
import { TutorialDirector } from '../dist/tutorial/TutorialDirector.js';
import { TutorialFeatureService } from '../dist/tutorial/TutorialFeatureService.js';
import { TutorialRuntimeController } from '../dist/tutorial/TutorialRuntimeController.js';
import { registerGameTutorialTargets } from '../dist/tutorial/GameTutorialTargetResolver.js';
import { createTutorialController } from '../dist/tutorial/createTutorialController.js';
import { TutorialManager } from '../dist/core/TutorialManager.js';
import { GameManager } from '../dist/core/GameManager.js';
import { MockContext } from '../dist/engine/MockContext.js';
import { MainUI } from '../dist/ui/MainUI.js';
import { ResultUI } from '../dist/ui/ResultUI.js';
import { BattleManager } from '../dist/battle/BattleManager.js';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';

test('无声明、checksum错误安全回退；正式声明加载', () => {
  const snapshot = fixture();
  assert.equal(new TutorialSnapshotRepository({}, snapshot).mode, 'LEGACY_FALLBACK');
  assert.equal(new TutorialSnapshotRepository(declaration('wrong'), snapshot).mode, 'LEGACY_FALLBACK');
  assert.equal(new TutorialSnapshotRepository(declaration(snapshot.checksum), snapshot).mode, 'PUBLISHED');
  assert.equal(new TutorialSnapshotRepository({ ...declaration(snapshot.checksum), releaseId: 'other' }, snapshot).mode,
    'LEGACY_FALLBACK');
  assert.equal(new TutorialSnapshotRepository(declaration(snapshot.checksum),
    { ...snapshot, flowCount: 99 }).mode, 'LEGACY_FALLBACK');
});

test('小游戏纯函数checksum与发布端SHA-256稳定JSON算法一致', () => {
  const snapshot = fixture(), payload = { ...snapshot, checksum: '' };
  const expected = createHash('sha256').update(JSON.stringify(sortKeys(payload), null, 2)).digest('hex');
  assert.equal(computeTutorialSnapshotChecksum(snapshot), expected);
});

test('首次玩家启动Flow，已完成玩家不重复启动', () => {
  const first = harness(); first.director.start();
  assert.equal(first.director.debug().state, 'WAITING_TRIGGER');
  const done = harness({ completedFlowIds: ['flow'] }); done.director.start();
  assert.equal(done.director.debug().state, 'IDLE');
  const legacyDone = harness(); legacyDone.player.tutorialFinished = true; legacyDone.director.start();
  assert.equal(legacyDone.director.debug().state, 'IDLE');
});

test('触发后解析UI目标并只允许目标输入，完成后恢复输入', () => {
  const h = harness(); h.targets.register('ui', 'home.campaign', () => ({ x: 10, y: 20, width: 80, height: 40 }));
  let completedEvent = ''; h.events.on('tutorial-step-completed', payload => { completedEvent = payload.stepId; });
  h.director.start(); h.events.emit('page.home');
  assert.equal(h.director.debug().state, 'WAITING_ACTION');
  assert.deepEqual(h.director.debug().target?.bounds, { x: 10, y: 20, width: 80, height: 40 });
  assert.equal(h.input.allows('home.campaign'), true); assert.equal(h.input.allows('home.equipment'), false);
  h.events.emit('target.clicked', { targetId: 'home.campaign' });
  assert.equal(h.input.isRestricted(), false); assert.equal(h.director.debug().stepId, 'move'); assert.equal(completedEvent, 'home');
});

test('Canvas目标、暂停恢复和缺失目标超时回退', () => {
  const h = harness(); h.targets.register('ui', 'home.campaign', () => ({ x: 10, y: 20, width: 80, height: 40 }));
  h.targets.register('canvas', 'battle.move-zone', () => ({ x: 0, y: 300, width: 200, height: 200 }));
  h.director.start(); h.events.emit('page.home'); h.events.emit('target.clicked', { targetId: 'home.campaign' });
  h.events.emit('battle.ready'); assert.equal(h.director.debug().target?.type, 'canvas');
  h.director.pause(); assert.equal(h.director.debug().state, 'PAUSED'); h.director.resume();
  assert.equal(h.director.debug().state, 'WAITING_ACTION');
  h.targets.unregister('canvas', 'battle.move-zone'); h.director.invalidateTarget(); h.clock.value = 6_000; h.director.update();
  assert.equal(h.director.debug().state, 'COMPLETED'); assert.equal(h.input.isRestricted(), false);
});

test('跳过仅解锁安全功能，不发奖励或改关卡；重玩不重复解锁', () => {
  const h = harness(); const before = JSON.stringify(h.player.stageProgress);
  h.director.start(); assert.equal(h.director.skip(true), true);
  assert.deepEqual(h.player.tutorial.skippedFlowIds, ['flow']);
  assert.equal(h.player.tutorialFinished, true);
  assert.equal(h.features.isUnlocked('feature.campaign'), true);
  assert.equal(JSON.stringify(h.player.stageProgress), before);
  const unlocks = h.player.tutorial.unlockedFeatureIds.length;
  h.director.replay('flow'); h.director.skip(true);
  assert.equal(h.player.tutorial.unlockedFeatureIds.length, unlocks);
});

test('Director销毁解除监听和输入限制', () => {
  const h = harness(); h.director.start(); h.events.emit('page.home'); h.director.dispose();
  assert.equal(h.director.debug().state, 'DISPOSED'); assert.equal(h.input.isRestricted(), false);
  h.events.emit('target.clicked', { targetId: 'home.campaign' });
  assert.equal(h.director.debug().state, 'DISPOSED');
});

test('运行控制器把场景映射为统一事件并拦截目标外点击', () => {
  const h = harness(); h.targets.register('ui', 'home.campaign', () => ({ x: 10, y: 20, width: 80, height: 40 }));
  const inputState: any = { tapX: 200, tapY: 200, consumeTap() { this.tapX = null; this.tapY = null; } };
  const ctx: any = { input: inputState, canvasWidth: 375, canvasHeight: 667, now: () => 0 };
  const game: any = { events: h.events, scene: 'menu' };
  let canonicalSceneEvent = false; h.events.on('app-first-launch', () => { canonicalSceneEvent = true; });
  const controller = new TutorialRuntimeController(ctx, game, h.director, h.input);
  h.director.start(); h.events.emit('scene.changed', 'menu');
  assert.equal(canonicalSceneEvent, true);
  assert.equal(h.director.debug().state, 'WAITING_ACTION');
  assert.equal(controller.handleInput(), true); assert.equal(inputState.tapX, null);
  inputState.tapX = 30; inputState.tapY = 30;
  assert.equal(controller.handleInput(), false); assert.equal(h.director.debug().stepId, 'move');
  controller.dispose();
});

test('生产菜单事件启动欢迎步骤，进入战役地图后推进主线入口步骤', () => {
  const h = harness(), first = h.director as any;
  first.d.snapshot.flows[0].steps[0].triggerType = 'app.ready';
  first.d.snapshot.flows[0].steps[0].completionType = 'dialog.acknowledged';
  first.d.snapshot.flows[0].steps[1].triggerType = 'page.campaign';
  h.targets.register('ui', 'home.campaign', () => ({ x: 10, y: 20, width: 80, height: 40 }));
  h.targets.register('canvas', 'battle.move-zone', () => ({ x: 0, y: 0, width: 20, height: 20 }));
  const inputState: any = { tapX: 30, tapY: 30, consumeTap() { this.tapX = null; this.tapY = null; } };
  const game: any = { events: h.events, scene: 'menu' };
  const controller = new TutorialRuntimeController({ input: inputState, canvasWidth: 375, canvasHeight: 667 } as any,
    game, h.director, h.input);
  controller.start(); assert.equal(h.director.debug().state, 'WAITING_ACTION');
  controller.handleInput(); assert.equal(h.director.debug().stepId, 'move');
  game.scene = 'campaignMap'; h.events.emit('scene.changed', 'campaignMap');
  assert.equal(h.director.debug().state, 'WAITING_ACTION'); controller.dispose();
});

test('运行控制器跳过需要二次确认并清理输入', () => {
  const h = harness(), inputState: any = { tapX: 330, tapY: 30, consumeTap() { this.tapX = null; this.tapY = null; } };
  const ctx: any = { input: inputState, canvasWidth: 375, canvasHeight: 667 };
  const controller = new TutorialRuntimeController(ctx, { events: h.events, scene: 'menu' } as any, h.director, h.input);
  h.director.start(); assert.equal(controller.handleInput(), true); assert.notEqual(h.director.debug().state, 'SKIPPED');
  inputState.tapX = 330; inputState.tapY = 30; assert.equal(controller.handleInput(), true);
  assert.equal(h.director.debug().state, 'SKIPPED'); assert.equal(h.input.isRestricted(), false); controller.dispose();
});

test('生产语义目标使用逻辑坐标解析UI与Canvas对象', () => {
  const targets = new TutorialTargetRegistry(); const ctx: any = { canvasWidth: 375, canvasHeight: 667 };
  const game: any = { scene: 'menu', menuUi: { buttons: [{ id: 'battle', x: 20, y: 100, w: 160, h: 44 }] }, battle: null };
  const dispose = registerGameTutorialTargets(ctx, game, targets);
  assert.deepEqual(targets.resolve('ui', 'home.campaign')?.bounds, { x: 20, y: 100, width: 160, height: 44 });
  game.scene = 'battle'; game.battle = { enemies: [{ x: 200, y: 180, radius: 24 }] }; targets.invalidate();
  assert.deepEqual(targets.resolve('canvas', 'battle.enemy')?.bounds, { x: 176, y: 156, width: 48, height: 48 });
  assert.deepEqual(targets.resolve('canvas', 'battle.move-zone')?.bounds, { x: 0, y: 333.5, width: 187.5, height: 333.5 });
  const resultGame: any = { lastOutcome: { win: true }, currentCampaignNodeId: 'node-1',
    canChallengeNextStage: () => false };
  game.scene = 'result'; game.resultUi = new ResultUI(ctx, resultGame); targets.invalidate();
  assert.deepEqual(targets.resolve('ui', 'result.continue')?.bounds, { x: 56.25, y: 545, width: 262.5, height: 44 });
  dispose(); assert.equal(targets.resolve('ui', 'home.campaign'), null);
});

test('生产工厂在R7回退旧流程，声明正式快照时启用Director', () => {
  const ctx = new MockContext(), game = new GameManager(ctx);
  const legacy = createTutorialController(ctx, game, {}, null);
  assert.equal(legacy instanceof TutorialManager, true);
  const snapshot = fixture(); const runtime = createTutorialController(ctx, game, declaration(snapshot.checksum), snapshot);
  assert.equal(runtime instanceof TutorialRuntimeController, true); runtime.dispose?.();
});

test('旧版已完成玩家启用正式快照时不重跑且保留全部既有入口', () => {
  const ctx = new MockContext(), game: any = new GameManager(ctx); game.player.tutorialFinished = true;
  const snapshot = fixture(); const runtime: any = createTutorialController(ctx, game, declaration(snapshot.checksum), snapshot);
  assert.equal(runtime.director.debug().state, 'IDLE');
  for (const feature of ['feature.campaign', 'feature.equipment', 'feature.skills', 'feature.runes',
    'feature.strengthen', 'feature.decompose', 'feature.exploration']) assert.equal(game.isFeatureUnlocked(feature), true);
  runtime.dispose();
});

test('功能目录默认仅开放主线，解锁通知只消费一次并持久化', () => {
  const h = harness(); let saves = 0; const features = new TutorialFeatureService(h.player, () => { saves++; });
  features.unlockDefaults(); assert.equal(features.isUnlocked('feature.campaign'), true);
  assert.equal(features.isUnlocked('feature.equipment'), false);
  assert.equal(features.unlock('feature.equipment'), true); assert.equal(features.unlock('feature.equipment'), false);
  assert.equal(features.consumeNotice('feature.equipment'), true); assert.equal(features.consumeNotice('feature.equipment'), false);
  assert.equal(saves, 3);
});

test('GameManager锁定入口不跳转，解锁后立即可进入', () => {
  const game: any = new GameManager(new MockContext());
  let equipmentUnlocked = false;
  game.setFeatureUnlockService({ isUnlocked: (id: string) => id !== 'feature.equipment' || equipmentUnlocked });
  game.goToEquipmentPanel(); assert.equal(game.scene, 'menu');
  assert.match(game.getFeatureLockReason('feature.equipment'), /完成新手引导|未解锁/);
  equipmentUnlocked = true; game.goToEquipmentPanel(); assert.equal(game.scene, 'equipmentPanel');
});

test('锁定功能入口显示中文锁定状态', () => {
  const ctx = new MockContext(), game: any = new GameManager(ctx);
  game.setFeatureUnlockService({ isUnlocked: (id: string) => id === 'feature.campaign' });
  const ui: any = new MainUI(ctx, game); ui.render();
  const equipment = ui.buttons.find((item: any) => item.id === 'equip');
  const skills = ui.buttons.find((item: any) => item.id === 'skill');
  assert.equal(equipment.disabled, true); assert.match(equipment.label, /未解锁/);
  assert.equal(skills.disabled, true); assert.match(skills.label, /未解锁/);
});

test('功能解锁提示在首页只消费并显示一次', () => {
  const ctx = new MockContext(), game: any = new GameManager(ctx);
  let pending: any = { notice: '装备舱已解锁' }, consumeCount = 0;
  game.setFeatureUnlockService({
    isUnlocked: () => true,
    consumeNextNotice: () => { consumeCount++; const notice = pending; pending = null; return notice; },
  });
  const ui: any = new MainUI(ctx, game);
  ui.render(); ui.render();
  assert.equal(ui.toast, '装备舱已解锁');
  assert.equal(ui.toastTimer > 0, true);
  assert.equal(consumeCount, 1);
});

test('现有业务动作通过统一事件总线驱动Tutorial', () => {
  const game: any = new GameManager(new MockContext()); const received: string[] = [];
  for (const name of ['stage.started', 'stage-started', 'equipment.equipped', 'equipment-equipped']) {
    game.events.on(name, () => received.push(name));
  }
  game.setBattle({ start() {} }); game.startBattle('1-1'); game.beginBattle();
  game.player.equipmentInventory.items.push({ uid: 'tutorial-eq', configId: 'rusty_claw', level: 0, obtainedAt: 1 });
  assert.equal(game.doEquipItem('tutorial-eq'), true);
  assert.deepEqual(received, ['stage.started', 'stage-started', 'equipment.equipped', 'equipment-equipped']);
});

test('战斗移动、攻击、击敌和清波事件进入统一事件总线', () => {
  const ctx: any = new MockContext(), game: any = new GameManager(ctx), battle: any = new BattleManager(ctx, game);
  const received = new Set<string>();
  for (const name of ['battle.player-moved', 'player-moved', 'battle.attack-used', 'player-attacked',
    'battle.enemy-defeated', 'enemy-defeated', 'battle.wave-cleared', 'wave-cleared']) {
    game.events.on(name, () => received.add(name));
  }
  battle.start({ ...STAGE_1_1, enemies: [{ enemyId: 'mouse', count: 1 }], waves: undefined });
  for (let i = 0; i < 5; i++) { ctx.advance(.016); battle.update(.016); }
  ctx.input.simulateMove(1, 0); battle.enemies[0].x = battle.player.x + 20; battle.enemies[0].y = battle.player.y;
  for (let i = 0; i < 300 && !received.has('battle.wave-cleared'); i++) { ctx.advance(.1); battle.update(.1); }
  assert.deepEqual([...received].sort(), ['battle.attack-used', 'battle.enemy-defeated', 'battle.player-moved',
    'enemy-defeated', 'player-attacked', 'player-moved', 'battle.wave-cleared', 'wave-cleared'].sort());
});

test('胜利结算按顺序发送通关与奖励事件', () => {
  const game: any = new GameManager(new MockContext()), received: string[] = [];
  for (const name of ['stage.cleared', 'stage-cleared', 'reward.claimed', 'reward-granted']) {
    game.events.on(name, () => received.push(name));
  }
  game.player.selectedStageId = '1-1'; game.player.tutorialFinished = true;
  game.finishBattle({ win: true, stageId: '1-1', hpRatio: 1, elapsedSec: 2 });
  assert.deepEqual(received, ['stage.cleared', 'stage-cleared', 'reward.claimed', 'reward-granted']);
});

test('步骤切换按真实业务状态跳过已完成动作，避免重发奖励或重复装备', () => {
  const h = harness(), snapshot = fixture();
  h.targets.register('ui', 'home.campaign', () => ({ x: 0, y: 0, width: 10, height: 10 }));
  const director = new TutorialDirector({ snapshot, player: h.player, save: () => true, events: h.events,
    targets: h.targets, input: h.input, features: h.features, now: () => 0,
    isCompletionSatisfied: step => step.id === 'move' });
  director.start(); h.events.emit('page.home'); h.events.emit('target.clicked', { targetId: 'home.campaign' });
  assert.equal(director.debug().state, 'COMPLETED');
  assert.equal(h.player.tutorialFinished, true);
});

test('应用重启续接当前步骤，版本更新删除旧步骤时安全回到起点并记录恢复', () => {
  const resumed = harness({ currentFlowId: 'flow', currentStepId: 'move', startedFlowIds: ['flow'] });
  resumed.director.start(); assert.equal(resumed.director.debug().stepId, 'move');
  const changed = harness({ currentFlowId: 'flow', currentStepId: 'removed', startedFlowIds: ['flow'] });
  changed.director.start(); assert.equal(changed.director.debug().stepId, 'home');
  assert.equal(changed.player.tutorial.recoveryCount, 1);
});

function harness(progress: any = {}) {
  const events = new EventManager(), targets = new TutorialTargetRegistry(), input = new TutorialInputLimiter(), clock = { value: 0 };
  const player: any = { stageProgress: {}, equipmentInventory: { items: [], equipped: {} }, tutorial: {
    schemaVersion: 1, startedFlowIds: [], completedStepIds: [], completedFlowIds: [], skippedFlowIds: [],
    unlockedFeatureIds: [], recoveryCount: 0, updatedAt: 0, ...progress,
  } };
  const features = new TutorialFeatureService(player, () => {});
  const director = new TutorialDirector({ snapshot: fixture(), player, save: () => true, events, targets, input,
    features, now: () => clock.value });
  return { director, events, targets, input, player, features, clock };
}

function declaration(checksum: string) {
  return { releaseId: 'r8', tutorialSnapshotReleaseId: 'r8', tutorialSnapshotChecksum: checksum };
}

function sortKeys(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result: any, key) => {
    if (value[key] !== undefined) result[key] = sortKeys(value[key]); return result;
  }, {});
}

function fixture(): any {
  const steps = [
    { id: 'home', order: 1, triggerType: 'page.home', triggerConfig: {}, displayType: 'forced-action',
      targetType: 'ui', targetId: 'home.campaign', title: '主线', body: '打开主线', blockInput: true, force: true,
      completionType: 'target.clicked', completionConfig: {}, timeoutMs: 5000, fallbackAction: 'skip-step',
      nextStepId: 'move', skipStepId: null, terminal: false },
    { id: 'move', order: 2, triggerType: 'battle.ready', triggerConfig: {}, displayType: 'highlight-canvas',
      targetType: 'canvas', targetId: 'battle.move-zone', title: '移动', body: '移动机甲', blockInput: false, force: false,
      completionType: 'battle.player-moved', completionConfig: {}, timeoutMs: 5000, fallbackAction: 'skip-step',
      nextStepId: null, skipStepId: null, terminal: true },
  ];
  const flow = { id: 'flow', name: '首章教学', description: '', campaignId: null, startStepId: 'home', endStepId: 'move',
    skippable: true, allowReplay: true, skipUnlockFeatures: ['feature.campaign'], enabled: true, steps, transitions: [],
    unlockRules: [{ id: 'unlock', stepId: 'home', featureId: 'feature.campaign', unlockTrigger: 'step.complete',
      condition: {}, unlockOnSkip: true, order: 0, enabled: true }] };
  const snapshot: any = { schemaVersion: 1, releaseId: 'r8', releaseVersion: 'R000008', generatedAt: 'now', checksum: '',
    flowCount: 1, stepCount: 2, featureUnlockRuleCount: 1,
    referenceSummary: { campaignIds: [], stageIds: [], featureIds: ['feature.campaign'], artKeys: [],
      catalog: { campaignIds: [], stageIds: [], featureIds: ['feature.campaign'], artKeys: [] } }, flows: [flow] };
  snapshot.checksum = computeTutorialSnapshotChecksum(snapshot); return snapshot;
}
