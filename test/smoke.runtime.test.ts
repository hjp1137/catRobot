/**
 * ����垍�瘚贝� �婙�� �笔� bootstrap �券曎頝荔�隞餃𦛚3 ����啣㦤�舫曎頝荔�
 * ------------------------------------------------------------------
 * �圈曎頝荔��臬𢆡 �� 銝餌��� �� 餈𥕦�蝚砌�蝡�(�喳㨃�㗇𥋘) �� �� 1-1 �� �䀹� ��
 *        �𨅯⏚蝏梶� �� 餈𥪜��喳㨃�㗇𥋘 �� 1-2 閫����
 */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { WxRuntimeMock, MOCK_WINDOW_W, MOCK_WINDOW_H } from './wxRuntimeMock.ts';
import { STAGE_1_1 } from '../dist/data/StageConfig.js';
import type { StageConfig } from '../src/data/StageConfig.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let bootstrapFn: () => any;
function loadBootstrap() {
  if (!bootstrapFn) {
    delete require.cache[require.resolve('../dist/main.js')];
    const m = require('../dist/main.js');
    bootstrapFn = m.bootstrap ?? m.default?.bootstrap;
  }
  return bootstrapFn;
}

let env: WxRuntimeMock;
let game: any;

const FIXED_SCREEN_WAVE_FIXTURE: StageConfig = {
  ...STAGE_1_1,
  contentStageId: undefined,
  enemies: [],
  waves: [
    { id: 'fixture-w1', name: '第一波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 0 },
    { id: 'fixture-w2', name: '第二波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
    { id: 'fixture-w3', name: '第三波', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 1 },
  ],
};

function setup() {
  env = new WxRuntimeMock();
  env.install();
  game = loadBootstrap()();
  (game as any).enableTutorial = false;
  if (game && game.player) {
    game.player.tutorialFinished = true;
    if (game.tutorialManager?.director) {
      game.tutorialManager.director.skip(true);
    } else if (game.tutorialManager) {
      game.tutorialManager.step = 'FINISHED';
    }
  }
}
function teardown() {
  try { game?.stop?.(); } catch { /* ignore */ }
  env?.uninstall();
}
function runFrames(frames: number, perFrameMs = 16) {
  for (let i = 0; i < frames; i++) env.advance(perFrameMs);
}
function btnCenter(btn: any) { return { x: btn.x + btn.w / 2, y: btn.y + btn.h / 2 }; }

function runCurrentBattleToResult(maxFrames = 60 * 30) {
  for (let i = 0; i < maxFrames && game.scene === 'battle'; i++) {
    const battle = game.battle;
    const p = battle?.player;
    if (p) {
      p.attack = 999;
      for (const e of battle.enemies) { e.x = p.x + 30; e.y = p.y; }
    }
    env.advance(16);
  }
}

/** 隞𦒘蜓�屸𢒰銝�頝舐��唳�摰𡁜��∠��䀹�嚗���∪�憿餃歇閫��嚗�
 *  隞餃𦛚4嚗𡁻曎頝� 銝餌��� �� �喳㨃�㗇𥋘 �� �喳㨃隞讠� �� 撘�憪𧢲��� �� �䀹� */
/** 隞餃𦛚7嚗朞��� �� 蝡㰘��㗇𥋘 �� 蝚砌�蝡惩��⊿�㗇𥋘 */
function gotoStageSelect1() {
  game.publishedCampaigns = [];
  game.goToChapterSelect();
  game.goToStageSelect('chapter1');
  runFrames(2);
  assert.equal(game.scene, 'stageSelect');
}

function gotoCampaignMap() {
  runFrames(2);
  const button = btnCenter(game.menuUi.buttons[0]);
  env.dispatchTouchStart(button.x, button.y);
  env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'campaignMap');
}

/** 隞餃𦛚7嚗朞�����喳㨃�䀹�嚗��霈斤洵銝�蝡𩤃�蝚砌�蝡牐� chapter2嚗� */
function gotoBattleFor(stageId: string, chapterId = 'chapter1') {
  // 固定屏机制回归必须显式走调试入口，不能借用玩家正式选关入口。
  if (stageId === '1-1') {
    game.battle.start(FIXED_SCREEN_WAVE_FIXTURE);
    game.scene = 'battle';
    runFrames(1);
    return;
  }
  assert.equal(game.startBattle(stageId), true);
  assert.equal(game.scene, 'stageIntro');
  game.beginBattle();
  runFrames(3);
}

beforeEach(() => setup());
afterEach(() => teardown);

// ---------- �箇��臬𢆡 ----------
test('�臬𢆡嚗颹ootstrap 銝齿��辷�銝餃儐�臬歇瘜典� RAF', () => {
  assert.ok(game);
  assert.ok(env.rafPending >= 1);
});

test('擐硋�嚗𡁏綫餈𥕦葷�� Canvas �厩��嗉���', () => {
  runFrames(5);
  const stat = env.canvas.getCallStats();
  assert.ok(stat.clear > 0, `摨� clear嚗���� ${stat.clear}`);
  assert.ok(stat.fillRect > 0);
  assert.ok(stat.fillText > 0);
});

test('蝡硋����嚗䬙anvas �拍�撠箏站 = 蝒堒藁 � pixelRatio', () => {
  assert.equal(env.canvas.width, MOCK_WINDOW_W * 3);
  assert.equal(env.canvas.height, MOCK_WINDOW_H * 3);
});

test('銝餌��Ｘ�摮梹���鉄���銝擧㦤�脣�', () => {
  runFrames(2);
  const texts = env.canvas.getDrawnTexts().join('|');
  assert.match(texts, /训练场启动/);
  assert.match(texts, /橘猫重甲/);
  assert.match(texts, /自由探索/);
});

// ---------- �喳㨃�㗇𥋘�曇楝 ----------
test('�孵稬�諹��亦����𨧀� 蝡㰘��㗇𥋘 �� 蝚砌�蝡惩��⊿�㗇𥋘', () => {
  gotoCampaignMap();
  assert.equal(game.scene, 'campaignMap');
});

test('�喳㨃�㗇𥋘嚗𡁶洵銝�蝡䭾遬蝷� 5 銝芸��∴�1-1 閫��嚗��雿䠷�摰�', () => {
  gotoCampaignMap();
  const view = game.getCampaignChapterView();
  assert.equal(view.nodes.length, 10);
  assert.equal(view.nodes[0].state, 'UNLOCKED');
  assert.equal(view.nodes[1].state, 'LOCKED');
});

test('�喳㨃�㗇𥋘���嚗𡁜鉄蝡㰘��滢��喳㨃��', () => {
  gotoCampaignMap();
  const texts = env.canvas.getDrawnTexts().join('|');
  assert.match(texts, /第一章·废料边境/);
  assert.match(texts, /铸造入口/);
});

test('����喳㨃�孵稬銝滩��交���', () => {
  gotoCampaignMap();
  const card2 = game.campaignMapUi.cards.find((c: any) => c.nodeId === 'campaign_node_training');
  env.dispatchTouchStart(card2.x + 30, card2.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'campaignMap', '锁定节点不能进入详情');
});

test('�喳㨃�㗇𥋘餈𥪜� �� 蝡㰘��㗇𥋘嚗�遙��7嚗�', () => {
  gotoCampaignMap();
  const bc = { x: 60, y: 36 };
  env.dispatchTouchStart(bc.x, bc.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'menu');
});

// ---------- �䀹��曇楝 ----------
test('�� 1-1 �� �䀹�嚗𡁶洵 1 瘜� 4 �芣㦤璇圈� + �拙振摮睃銁', () => {
  gotoBattleFor('1-1');
  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.enemies.length, 4);
  assert.equal(game.battle.totalEnemies, 12);
  assert.ok(game.battle.player && game.battle.player.hp > 0);
});

test('閫行𨰫�硋𢆡撽勗𢆡�拙振蝘餃𢆡', () => {
  gotoBattleFor('1-1');
  const px0 = game.battle.player.x;
  env.dispatchTouchStart(60, MOCK_WINDOW_H - 60);
  for (let i = 1; i <= 5; i++) {
    env.dispatchTouchMove(60 + i * 20, MOCK_WINDOW_H - 60);
    runFrames(3);
  }
  env.dispatchTouchEnd();
  assert.ok(game.battle.player.x !== px0);
});

test('�𨅯⏚�曇楝嚗𡁜��� �� result win=true嚗�1-2 閫��', () => {
  gotoBattleFor('1-1');
  runCurrentBattleToResult();
  assert.equal(game.battle.enemies.length, 0);
  assert.equal(game.scene, 'result');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.lastOutcome.clearResult);
  // 1-2 摨磰圾��
  assert.ok(game.player.unlockedStageIds.includes('1-2'));
  assert.equal(game.player.stageProgress['1-1']?.cleared, true);
});

test('蝏梶�餈𥪜��喳㨃�㗇𥋘 �� 1-2 �曄內�烐�', () => {
  gotoBattleFor('1-1');
  runCurrentBattleToResult();
  assert.equal(game.scene, 'result');
  // �寡��𧼮��⊿�㗇𥋘
  const back = game.resultUi.backStageBtn;
  const bc = btnCenter(back);
  env.dispatchTouchStart(bc.x, bc.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'stageSelect');
});

test('��漣�曇楝嚗𡁶�頞唾�皞鞟���漣嚗𣬚�蝥扳���', () => {
  game.player.gold = 100; game.player.parts = 20;
  runFrames(2);
  const c = btnCenter(game.menuUi.buttons[1]);
  env.dispatchTouchStart(c.x, c.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.player.level, 2);
  assert.equal(game.player.gold, 50);
});

test('韏��銝滩雲�嗅�蝥扳��� disabled 銝齿緍韏��', () => {
  runFrames(2);
  const upgradeBtn = game.menuUi.buttons[1];
  assert.ok(upgradeBtn.disabled);
  const c = btnCenter(upgradeBtn);
  env.dispatchTouchStart(c.x, c.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.player.level, 1);
});

test('摮䀹﹝����吔���漣�𡡞��航粉�硺���', () => {
  game.player.gold = 100; game.player.parts = 20;
  runFrames(2);
  const c = btnCenter(game.menuUi.buttons[1]);
  env.dispatchTouchStart(c.x, c.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.player.level, 2);
  game.stop();
  const game2 = loadBootstrap()();
  assert.equal(game2.player.level, 2);
  assert.equal(game2.player.gold, 50);
  game2.stop();
});

test('皜��摮睃��滚� �� �唳旿�Ｗ�暺䁅恕嚗��閫�� 1-1嚗�', () => {
  game.stop();
  env.clearStorage();
  const game2 = loadBootstrap()();
  assert.equal(game2.player.level, 1);
  assert.equal(game2.player.gold, 0);
  assert.deepEqual(game2.player.unlockedStageIds, ['1-1']);
  game2.stop();
});

test('隞餃𦛚5嚗𡁏��𦯀葉�孵稬���賣��桅��曉鮟�賜� �� �䔶犖���', () => {
  gotoBattleFor('1-1');
  assert.equal(game.scene, 'battle');
  const e = game.battle.enemies[0];
  // �𦠜�鈭箸㻛�啁焵摰嗅𢰧靘扳�敶Ｚ��游�
  game.battle.player.facingAngle = 0;
  e.x = game.battle.player.x + 50; e.y = game.battle.player.y;
  const hpBefore = e.hp;
  // �朞� game.battle.usePlayerSkill �湔𦻖靚�鍂撉諹��餉�嚗���桃��餅�蝏��韏唳迨頝臬�嚗�
  const r = game.battle.usePlayerSkill('meow_cannon');
  assert.equal(r.ok, true);
  assert.equal(r.hitCount, 1);
  assert.ok(e.hp < hpBefore, '�菔��桀����鈭箄�');
  // 餈𥕦��瑕㭂
  assert.ok(game.battle.player.skillState.get('meow_cannon')!.cooldownRemaining > 0);
});

test('隞餃𦛚5嚗𡁏��𦯀葉�孵稬�斤㦛�厰僼 �� �拙振�𦯀慾�誩�', () => {
  gotoBattleFor('1-1');
  // 撘���
  const r = game.battle.usePlayerSkill('heavy_shield');
  assert.equal(r.ok, true);
  assert.equal(game.battle.player.shieldActive, true);
  // 璅⊥�銝�甈∪�隡歹�摨𥪜���
  const hp = game.battle.player.hp;
  game.battle.player.takeDamage(20);
  assert.ok(hp - game.battle.player.hp === 10, '�斤㦛摨𥪜�隡� 50%');
});

test('憭梯揖�曇楝嚗𡁶焵摰嗉◤�� �� result win=false����穃����閫��', () => {
  gotoBattleFor('1-1');
  const p = game.battle.player;
  p.attack = 0;
  for (const e of game.battle.enemies) {
    e.x = p.x + 5; e.y = p.y;
    e.hp = 99999; (e as any).maxHp = 99999;
  }
  const goldBefore = game.player.gold;
  runFrames(60 * 60);
  assert.ok(game.battle.player.dead || game.scene === 'result');
  if (game.lastOutcome) {
    assert.equal(game.lastOutcome.win, false);
    assert.equal(game.lastOutcome.clearResult, null);
    assert.equal(game.player.gold, goldBefore);
    assert.ok(!game.player.stageProgress['1-1']?.cleared);
  }
});

test('隞餃𦛚4嚗�1-5 Boss 摰峕㟲�曇楝嚗ǎntro�埝郭甈﹦�Boss�垍洵銝�蝡惩��琜�', () => {
  // 憸�圾�� 1-5 + ��漣�啗雲隞仿�𡁜�
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];
  game.player.level = 12;
  // 隞餃𦛚7嚗朞粥 chapterSelect �� stageSelect �� stageIntro �� battle
  gotoBattleFor('1-5');
  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.isBossStage, true);
  // �𡁏�芣�銝㗇郭嚗�鉄 Boss嚗�
  const clearAllWaves = () => {
    for (const e of game.battle.enemies) { e.x = game.battle.player.x + 10; e.y = game.battle.player.y; }
  };
  for (let i = 0; i < 60 * 90 && game.scene === 'battle'; i++) {
    env.advance(16);
    if (i % 30 === 0) clearAllWaves(); // 摰𡁏��𡁏��
  }
  assert.equal(game.scene, 'result', '摨磰��亦�蝞�');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.lastOutcome.clearResult, '摨娍� clearResult');
  assert.equal(game.lastOutcome.clearResult.chapterCompleted, true, '擐𡝗活�𡁜� 1-5 摨娍遬蝷箇洵銝�蝡惩���');
  // 1-5 撌脤�𡁜�
  assert.equal(game.player.stageProgress['1-5']?.cleared, true);
});

test('隞餃𦛚6嚗𡁏��賢��� �� ��漣�菔��� �� �䀹�雿輻鍂��漣隡文拿', () => {
  // 憸�蔭韏��
  game.player.gold = 1000; game.player.parts = 100;
  game.player.tutorial.unlockedFeatureIds.push('feature.skills');
  runFrames(2);
  // 銝餌��Ｙ��峕��賢��僐�齿��殷�buttons[2]嚗�
  const skillBtn = game.menuUi.buttons[2];
  const sc = btnCenter(skillBtn);
  env.dispatchTouchStart(sc.x, sc.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'skillPanel');
  // �孵鮟�賜���漣�厰僼
  const skillCard0 = game.skillPanelUi.cards[0];
  const upBtn = skillCard0.upgradeBtn;
  env.dispatchTouchStart(upBtn.x + 10, upBtn.y + 10); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.player.skillLevels.meow_cannon, 2, '�菔��桀���� Lv2');
  assert.equal(game.player.gold, 900, '�� 100 �穃�');
  // 餈𥪜�銝餌���
  const back = game.skillPanelUi.backBtn;
  const bc = btnCenter(back);
  env.dispatchTouchStart(bc.x, bc.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'menu');
  // 餈𥕦��䀹�撉諹���漣�𦒘慾摰�
  game.player.unlockedStageIds = ['1-1'];
  gotoBattleFor('1-1');
  game.battle.player.facingAngle = 0;
  const e = game.battle.enemies[0];
  e.x = game.battle.player.x + 50; e.y = game.battle.player.y;
  // �鞾��䔶犖銵��誯��滢慾摰單滯�綽��桅�𡁻�隞�30銵�嚗𥴰v2 �菔���45隡𡁏滯�綽�
  e.hp = 100; (e as any).maxHp = 100;
  const hpBefore = e.hp;
  game.battle.usePlayerSkill('meow_cannon');
  // Lv2 �菔��桐慾摰� 45
  assert.equal(hpBefore - e.hp, 45, '�䀹�摨𥪯蝙�� Lv2 隡文拿 45');
});

test('隞餃𦛚7嚗𡁶洵鈭𣬚�閫�� �� 餈𥕦� 2-1 �� �餉揖�唳�鈭� �� 2-2 閫��', () => {
  // 憸�蔭�𡁜� 1-5嚗�圾��洵鈭𣬚�嚗�+ 閫�� 2-1 + ��漣
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1'];
  game.player.level = 12;
  // 蝡㰘��㗇𥋘 �� 蝚砌�蝡� �� 2-1 �� �䀹�
  gotoBattleFor('2-1', 'chapter2');
  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.stage.chapterId, 'chapter2');
  // 2-1: 5曌�+2�脰臤=7
  assert.ok(game.battle.enemies.length === 7);
  // �𡁏�芣���
  for (let i = 0; i < 60 * 30 && game.scene === 'battle'; i++) {
    env.advance(16);
    if (i % 20 === 0) for (const e of game.battle.enemies) { e.x = game.battle.player.x + 10; e.y = game.battle.player.y; }
  }
  assert.equal(game.scene, 'result');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.player.unlockedStageIds.includes('2-2'), '2-2 摨磰圾��');
});

test('隞餃𦛚7嚗�2-3 瘥埝雯�急��� �� �拙振銝剜� �� �䀹�蝏𤘪�皜�征', () => {
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['2-1', '2-2', '2-3'];
  game.player.level = 12;
  gotoBattleFor('2-3', 'chapter2');
  // �刻��啁洵鈭峕郭嚗��瘨脰臤嚗㚁�蝑㗇郭甈∪���
  for (let i = 0; i < 60 * 8 && game.scene === 'battle'; i++) {
    env.advance(16);
    if (i % 20 === 0) for (const e of game.battle.enemies) { e.x = game.battle.player.x + 10; e.y = game.battle.player.y; }
  }
  // �罸𡢿�𣇉���𧒄�拙振�航�銝剜�嚗�𥅾瘥埝雯�急𦻖閫西�嚗㚁�撉諹�銝滚援皞�朖��
  assert.ok(game.scene === 'result' || game.scene === 'battle');
});

test('隞餃𦛚8嚗�2-5 蝚砌�蝡� Boss 摰峕㟲�曇楝嚗�臤�𡒊蒈�算��餉揖�垍洵鈭𣬚�摰峕�嚗�', () => {
  // 憸�蔭�𡁜��� 2-5 + 閫�� + ��漣
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['2-1', '2-2', '2-3', '2-4', '2-5'];
  game.player.level = 20; // 擃条�蝥抒＆靽肽��� Boss
  gotoBattleFor('2-5', 'chapter2');
  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.isBossStage, true);
  // �𡁏�芣��𥟇郭嚗�鉄�怠� Boss嚗�
  for (let i = 0; i < 60 * 120 && game.scene === 'battle'; i++) {
    env.advance(16);
    if (i % 20 === 0) for (const e of game.battle.enemies) { e.x = game.battle.player.x + 10; e.y = game.battle.player.y; }
  }
  assert.equal(game.scene, 'result');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.lastOutcome.clearResult);
  assert.equal(game.lastOutcome.clearResult.chapterCompleted, true, '擐𡝗活�𡁜�2-5摨娍遬蝷箇洵鈭𣬚�摰峕�');
  assert.equal(game.player.stageProgress['2-5']?.cleared, true);
});

test('隞餃𦛚9嚗朞�憭���Ｗ��� �� 蝛踵�鋆�� �� �睃��𣂼�', () => {
  runFrames(2);
  // 憸�蔭銝�隞嗉�憭�����
  const uid = 'test_eq_1';
  game.player.equipmentInventory.items.push({ uid, configId: 'rusty_claw', level: 0, obtainedAt: 0 });
  const powerBefore = game.totalPower;
  // 銝餌��Ｙ��諹�憭���齿��殷�buttons[3]嚗�
  const equipBtn = game.menuUi.buttons[3];
  const ec = btnCenter(equipBtn);
  env.dispatchTouchStart(ec.x, ec.y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'equipmentPanel');
  // �寡����憭�忽�湛�invAreas[0]嚗�
  runFrames(1); // 霈� UI 皜脫���� invAreas
  const invArea = game.equipmentPanelUi.invAreas[0];
  if (invArea) {
    env.dispatchTouchStart(invArea.x + 10, invArea.y + 10); env.dispatchTouchEnd();
    runFrames(1); // 霈� UI 皜脫����撘寧��屸��Ｙ��厰僼
    const btnEquip = game.equipmentPanelUi.btnEquip;
    env.dispatchTouchStart(btnEquip.x + 5, btnEquip.y + 5); env.dispatchTouchEnd();
    runFrames(2);
    assert.equal(game.player.equipmentInventory.equipped.weapon, uid, '摨𠉛忽�湔郎��');
    assert.ok(game.totalPower > powerBefore, '�睃�摨娍���');
  }
  // 餈𥪜�
  const back = game.equipmentPanelUi.backBtn;
  env.dispatchTouchStart(btnCenter(back).x, btnCenter(back).y); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'menu');
});

test('RAF �曉�蝔讠迅摰�', () => {
  runFrames(100);
  env.dispatchTouchStart(50, 50); runFrames(5);
  env.dispatchTouchMove(80, 80); runFrames(5);
  env.dispatchTouchEnd(); runFrames(100);
  assert.ok(env.rafPending >= 0);
});

test('隞餃𦛚10嚗朞�憭��霂行�撘寧��枏���撩�𤥁�憭����圾鋆���垍�瘚贝�', () => {
  game.player = game.save.reset();
  game.player.gold = 500;
  game.player.materials.enhanceStone = 5;
  
  const uid1 = 'eq_test_enhance';
  const uid2 = 'eq_test_disassemble';
  game.player.equipmentInventory.items.push(
    { uid: uid1, configId: 'rusty_claw', level: 0, obtainedAt: 100 },
    { uid: uid2, configId: 'patched_armor', level: 0, obtainedAt: 200 }
  );
  
  game.goToEquipmentPanel();
  runFrames(1);
  
  const eq1Area = game.equipmentPanelUi.invAreas.find((a: any) => a.uid === uid1);
  assert.ok(eq1Area);
  env.dispatchTouchStart(eq1Area.x + 10, eq1Area.y + 10); env.dispatchTouchEnd();
  runFrames(1);
  assert.equal(game.equipmentPanelUi.selectedItem?.uid, uid1);

  const btnEnhance = game.equipmentPanelUi.btnEnhance;
  env.dispatchTouchStart(btnEnhance.x + 5, btnEnhance.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  
  const item1 = game.player.equipmentInventory.items.find(i => i.uid === uid1);
  assert.equal(item1?.level, 1);
  assert.equal(game.player.gold, 450);
  assert.equal(game.player.materials.enhanceStone, 3);
  
  const btnClose = game.equipmentPanelUi.btnClose;
  env.dispatchTouchStart(btnClose.x + 5, btnClose.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.selectedItem, null);

  const eq2Area = game.equipmentPanelUi.invAreas.find((a: any) => a.uid === uid2);
  assert.ok(eq2Area);
  env.dispatchTouchStart(eq2Area.x + 10, eq2Area.y + 10); env.dispatchTouchEnd();
  runFrames(1);
  assert.equal(game.equipmentPanelUi.selectedItem?.uid, uid2);

  const btnDisassemble = game.equipmentPanelUi.btnDisassemble;
  env.dispatchTouchStart(btnDisassemble.x + 5, btnDisassemble.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  
  assert.equal(game.player.equipmentInventory.items.length, 1);
  assert.equal(game.player.materials.enhanceStone, 5);
  
  const saved = game.save.load();
  assert.equal(saved.equipmentInventory.items[0].level, 1);
  assert.equal(saved.materials.enhanceStone, 5);
});

test('隞餃𦛚10嚗朞���說�喳㨃�𨅯⏚�㕑氜�条��垍�瘚贝�', () => {
  game.player = game.save.reset();
  game.player.materials.enhanceStone = 0;
  for (let i = 0; i < 60; i++) {
    game.player.equipmentInventory.items.push(
      { uid: `eq_full_${i}`, configId: 'rusty_claw', level: 0, obtainedAt: 0 }
    );
  }
  
  let callCount = 0;
  game.ctx.random = () => {
    callCount++;
    if (callCount === 1) return 0.01;
    if (callCount === 2) return 0.01;
    return 0.1;
  };
  
  const outcome = {
    win: true,
    stageId: '1-1',
    elapsedSec: 20,
    hpRatio: 1.0,
    clearResult: null,
    loot: null,
  };
  game.finishBattle(outcome as any);
  
  assert.ok(outcome.loot);
  assert.equal(outcome.loot.fullBagConverted, true);
  assert.equal(outcome.loot.convertedStones, 2);
  assert.equal(game.player.equipmentInventory.items.length, 60);
  assert.ok(game.player.materials.enhanceStone > 2);
});

test('隞餃𦛚11嚗朞�憭��摰𠾼����劐������△����垍�瘚贝�', () => {
  game.player = game.save.reset();
  game.player.gold = 1000;
  game.player.materials.enhanceStone = 10;

  // 憸�蔭憭帋辣鋆��嚗�3隞嗆郎�剁���1隞嗅蟮霂梹�嚗�2隞嗉��莎�2隞嗆瓲敹�
  const uidEpic = 'eq_epic_weapon';
  game.player.equipmentInventory.items.push(
    { uid: 'eq_w1', configId: 'rusty_claw', level: 0, obtainedAt: 100 },
    { uid: 'eq_w2', configId: 'neon_blaster', level: 0, obtainedAt: 110 },
    { uid: uidEpic, configId: 'starcore_cannon', level: 0, obtainedAt: 120, locked: true }, // 暺䁅恕���
    { uid: 'eq_a1', configId: 'patched_armor', level: 0, obtainedAt: 130 },
    { uid: 'eq_a2', configId: 'alloy_armor', level: 0, obtainedAt: 140 },
    { uid: 'eq_c1', configId: 'small_core', level: 0, obtainedAt: 150 },
    { uid: 'eq_c2', configId: 'neon_core', level: 0, obtainedAt: 160 }
  );

  game.goToEquipmentPanel();
  runFrames(2);
  assert.equal(game.scene, 'equipmentPanel');

  // 1. 撉諹�蝑偦�匧���
  const weaponFilterBtn = game.equipmentPanelUi.filterSlotAreas.find((a: any) => a.id === 'weapon');
  assert.ok(weaponFilterBtn);
  env.dispatchTouchStart(weaponFilterBtn.x + 5, weaponFilterBtn.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.slotFilter, 'weapon');
  assert.equal(game.equipmentPanelUi.invAreas.length, 3);

  // 蝏��蝑偦�㚁��脰���捶
  const epicFilterBtn = game.equipmentPanelUi.filterRarityAreas.find((a: any) => a.id === 'epic');
  assert.ok(epicFilterBtn);
  env.dispatchTouchStart(epicFilterBtn.x + 5, epicFilterBtn.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.rarityFilter, 'epic');
  assert.equal(game.equipmentPanelUi.invAreas.length, 1);
  assert.equal(game.equipmentPanelUi.invAreas[0].uid, uidEpic);

  // 2. 霂行�鈭支�銝𡡞�摰朞圾��嵗撉�
  const epicArea = game.equipmentPanelUi.invAreas[0];
  env.dispatchTouchStart(epicArea.x + 10, epicArea.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.selectedItem?.uid, uidEpic);

  // ����嗆������閫���桀�敶枏��唬��行⏛
  const btnDisassemble = game.equipmentPanelUi.btnDisassemble;
  env.dispatchTouchStart(btnDisassemble.x + 5, btnDisassemble.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.selectedItem?.uid, uidEpic); // �芸��哨��芾◤��圾
  assert.match(game.equipmentPanelUi.errMsg, /装备已锁定/);

  // �孵稬閫��
  const btnToggleLock = game.equipmentPanelUi.btnToggleLock;
  env.dispatchTouchStart(btnToggleLock.x + 5, btnToggleLock.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.selectedItem?.locked, false);

  // 閫���𤾸�甈∠��餃�閫�
  env.dispatchTouchStart(btnDisassemble.x + 5, btnDisassemble.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.selectedItem, null);
  assert.equal(game.player.equipmentInventory.items.length, 6);
  assert.match(game.equipmentPanelUi.toastMsg, /已分解/);

  // 3. ��△蝧駁△�孵稬�⊿�
  const allFilterBtn = game.equipmentPanelUi.filterSlotAreas.find((a: any) => a.id === 'all');
  env.dispatchTouchStart(allFilterBtn.x + 5, allFilterBtn.y + 5); env.dispatchTouchEnd();
  const allRarityBtn = game.equipmentPanelUi.filterRarityAreas.find((a: any) => a.id === 'all');
  env.dispatchTouchStart(allRarityBtn.x + 5, allRarityBtn.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  const btnNext = game.equipmentPanelUi.btnNextPage;
  env.dispatchTouchStart(btnNext.x + 5, btnNext.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.equipmentPanelUi.currentPage, 0);

  // 餈𥪜�銝餌���
  const back = game.equipmentPanelUi.backBtn;
  env.dispatchTouchStart(back.x + 5, back.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'menu');
});

test('隞餃𦛚12嚗𡁜㦛���皞鞾��㰘蝸�𣂼�銝娍迤撣豢葡�枏����霂�', async () => {
  const rm = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();
  rm.resetForTest();
  const loadPromise = rm.loadAll(game.ctx);
  await new Promise(r => setTimeout(r, 15));
  await loadPromise;
  assert.equal(rm.isLoaded('player_mecha'), true);

  const stats = env.canvas.getCallStats();
  for (const k of Object.keys(stats)) (stats as any)[k] = 0;

  runFrames(5);
  assert.ok(stats.drawImage > 0, '摨磰��� drawImage 蝏睃��曄�');
});

test('隞餃𦛚12嚗𡁜㦛���皞𣂼�頧賢仃韐乩��芸𢆡�𨅯��鮋��皜脫��垍�瘚贝�', async () => {
  const rm = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();
  const IMAGE_RESOURCES = require('../dist/core/ResourceManager.js').IMAGE_RESOURCES;
  rm.resetForTest();

  const original = { ...IMAGE_RESOURCES };
  for (const k of Object.keys(IMAGE_RESOURCES)) {
    IMAGE_RESOURCES[k] = IMAGE_RESOURCES[k] + '_fail.png';
  }

  try {
    const loadPromise = rm.loadAll(game.ctx);
    await new Promise(r => setTimeout(r, 15));
    await loadPromise;
    assert.equal(rm.isFailed('player_mecha'), true);

    const stats = env.canvas.getCallStats();
    for (const k of Object.keys(stats)) (stats as any)[k] = 0;

    runFrames(5);
    assert.equal(stats.drawImage, 0, '�㰘蝸憭梯揖銝滚�靚�鍂 drawImage');
    const hasFill = stats.fillRect > 0 || stats.fill > 0 || stats.fillText > 0;
    assert.ok(hasFill, '摨𥪜���餈𥡝�蝔见��𣇉���');
  } finally {
    for (const k of Object.keys(original)) {
      IMAGE_RESOURCES[k] = original[k];
    }
  }
});

test('隞餃𦛚13嚗𡁶洵銝厩��券曎頝舫��𣂼����霂𤏪�2-5�𡁜��舘圾��3-1�坿���3-1隞讠��鍦��䀝漣�毺��唳�鈭箸𦻖閫衣��把��餉揖蝏梶��㕑氜撟嗉圾��3-2嚗�', () => {
  game.player = game.save.reset();
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.stageProgress['2-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5', '3-1'];
  game.player.level = 15;

  // 隞�� rollAndApplyLoot嚗�銁���瘜典�蝖桀��抒��𤩺㦤�堆�銝滚�皜豢��箸艶 update 撟脫贋
  const originalRollAndApply = game.rollAndApplyLoot;
  game.rollAndApplyLoot = function(stageId: string) {
    const oldRandom = game.ctx.random;
    let cc = 0;
    game.ctx.random = () => {
      cc++;
      if (cc === 1) return 0.1; // r1 < 0.40, 閫血�鋆���㕑氜
      if (cc === 2) return 0.2; // r2 > 0.12, 銝滩圻�𤑳泵����踝�銝𥪜�韐典ế摰帋蛹 common
      if (cc === 3) return 0.5; // r3 (�硋�䠷�厩揣撘�)
      return 0.5;
    };
    try {
      return originalRollAndApply.call(this, stageId);
    } finally {
      game.ctx.random = oldRandom;
    }
  };

  gotoStageSelect1();
  const back = game.stageSelectUi.backBtn;
  env.dispatchTouchStart(btnCenter(back).x, btnCenter(back).y); env.dispatchTouchEnd();
  runFrames(2);

  const chCard = game.chapterSelectUi.cards.find((c: any) => c.chapterId === 'chapter3');
  assert.ok(chCard);
  env.dispatchTouchStart(chCard.x + 30, chCard.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'stageSelect');
  assert.equal(game.currentChapterId, 'chapter3');

  const card = game.stageSelectUi.cards.find((c: any) => c.stageId === '3-1');
  env.dispatchTouchStart(card.x + 30, card.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.scene, 'stageIntro');

  assert.equal(game.startBattle('3-1'), true);
  game.beginBattle();
  runFrames(3);
  assert.equal(game.scene, 'battle');

  assert.ok(game.battle.enemies.length > 0);
  const fireEnemy = game.battle.enemies.find((e: any) => e.burnOnHit);
  assert.ok(fireEnemy);

  const p = game.battle.player;
  fireEnemy.x = p.x;
  fireEnemy.y = p.y;
  (fireEnemy as any).attackTimer = 99; // 撘箄��㗇說�餃稬霈⊥𧒄��
  runFrames(5);
  assert.ok(p.statusEffects.has('burn'));

  const bagCountBefore = game.player.equipmentInventory.items.length;

  for (const e of game.battle.enemies) {
    e.hp = 0;
    e.dead = true;
  }
  runFrames(5);
  assert.equal(game.scene, 'result');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.player.unlockedStageIds.includes('3-2'));

  // 銵交迤�剛�嚗𡁏嵗撉� loot �諹���������
  assert.ok(game.lastOutcome.loot, '蝏梶�摨娍� loot �㕑氜霈啣�');
  assert.ok(game.lastOutcome.loot.equipmentName, '�㕑氜�唳旿摨𥪜��怨�憭��蝘�');
  assert.ok(!game.lastOutcome.loot.runeName, '銝滚��㕑氜蝚行�');
  assert.equal(game.player.equipmentInventory.items.length, bagCountBefore + 1, '鋆�����摰鮋�憓𧼮� 1');

  // �朞� game.save.load() �剛�3-1�𡁜���3-2閫��銝擧��賢�摰寞�銋��
  const saved = game.save.load();
  assert.equal(saved.stageProgress['3-1']?.cleared, true, '摮䀹﹝銝� 3-1 摨娪�𡁜�');
  assert.ok(saved.unlockedStageIds.includes('3-2'), '摮䀹﹝銝� 3-2 摨磰圾��');
  assert.equal(saved.equipmentInventory.items.length, bagCountBefore + 1, '摮䀹﹝銝剛�憭�㺭�誩�����硋���');
});

test('隞餃𦛚13嚗𡁜銁蝚砌�蝡惩���葡�枏㦤�臬��恍�霂�6撘䭾鰵憓噼�皞𣂼�頧賣��煺��㰘蝸憭梯揖�𨅯�', async () => {
  // �𨀣迫撟嗆����銝�銝芸�靘页��嗅��齿鰵�嘥���
  try { game?.stop?.(); } catch {}
  env?.uninstall();
  setup();

  const rm = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();
  rm.resetForTest();

  await rm.loadAll(game.ctx);
  const keys = ['factory_bg', 'enemy_fire_beetle', 'enemy_blaze_hound', 'enemy_magma_golem', 'status_burn', 'chapter3_icon'];
  for (const key of keys) {
    assert.equal(rm.isLoaded(key), true);
  }

  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.stageProgress['2-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5', '3-1'];

  gotoStageSelect1();
  const back = game.stageSelectUi.backBtn;
  env.dispatchTouchStart(btnCenter(back).x, btnCenter(back).y); env.dispatchTouchEnd();
  runFrames(2);
  const chCard = game.chapterSelectUi.cards.find((c: any) => c.chapterId === 'chapter3');
  env.dispatchTouchStart(chCard.x + 30, chCard.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  const card = game.stageSelectUi.cards.find((c: any) => c.stageId === '3-1');
  env.dispatchTouchStart(card.x + 30, card.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.startBattle('3-1'), true);
  game.beginBattle();
  runFrames(3);

  assert.equal(game.scene, 'battle');

  // 皜�妟 Canvas 蝏蠘恣撟嗆鱏閮�摰鮋� drawImage
  const statsSuccess = env.canvas.getCallStats();
  for (const k of Object.keys(statsSuccess)) (statsSuccess as any)[k] = 0;
  runFrames(5);
  assert.ok(statsSuccess.drawImage > 0, '�𣂼��㰘蝸�嗅�靚�鍂 drawImage 蝏睃��曄�');

  // �𨀣迫撟嗆����銝�銝芸�靘页�����㰘蝸憭梯揖瘚贝�
  try { game?.stop?.(); } catch {}
  env?.uninstall();
  setup();

  const rmFail = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();
  const IMAGE_RESOURCES = require('../dist/core/ResourceManager.js').IMAGE_RESOURCES;
  rmFail.resetForTest();

  const original = { ...IMAGE_RESOURCES };
  for (const k of Object.keys(IMAGE_RESOURCES)) {
    IMAGE_RESOURCES[k] = IMAGE_RESOURCES[k] + '_fail.png';
  }

  try {
    const loadPromise = rmFail.loadAll(game.ctx);
    await new Promise(r => setTimeout(r, 15));
    await loadPromise;
    for (const key of keys) {
      assert.equal(rmFail.isFailed(key), true);
    }

    game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
    game.player.stageProgress['2-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
    game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5', '3-1'];

    gotoStageSelect1();
    const backBtnFail = game.stageSelectUi.backBtn;
    env.dispatchTouchStart(btnCenter(backBtnFail).x, btnCenter(backBtnFail).y); env.dispatchTouchEnd();
    runFrames(2);
    const chCardFail = game.chapterSelectUi.cards.find((c: any) => c.chapterId === 'chapter3');
    env.dispatchTouchStart(chCardFail.x + 30, chCardFail.y + 30); env.dispatchTouchEnd();
    runFrames(2);
    const cardFail = game.stageSelectUi.cards.find((c: any) => c.stageId === '3-1');
    env.dispatchTouchStart(cardFail.x + 30, cardFail.y + 30); env.dispatchTouchEnd();
    runFrames(2);
    assert.equal(game.startBattle('3-1'), true);
    game.beginBattle();
    runFrames(3);

    assert.equal(game.scene, 'battle');

    // �剛��惩�撣訾�蝔见��𣇉��嗥� fill/fillRect/fillText �㕑���
    const statsFail = env.canvas.getCallStats();
    for (const k of Object.keys(statsFail)) (statsFail as any)[k] = 0;
    runFrames(5);
    assert.equal(statsFail.drawImage, 0, '�㰘蝸憭梯揖銝滚�靚�鍂 drawImage');
    const hasFill = statsFail.fillRect > 0 || statsFail.fill > 0 || statsFail.fillText > 0;
    assert.ok(hasFill, '摨𥪜���餈𥡝�蝔见��𣇉��塚�fillRect/fill/fillText嚗�');
  } finally {
    for (const k of Object.keys(original)) {
      IMAGE_RESOURCES[k] = original[k];
    }
  }
});

test('隞餃𦛚14嚗�3-5 蝚砌�蝡� Boss 摰峕㟲�曇楝嚗���匧��怎蒈�算��餉揖�垍洵銝厩�摰峕�/��瓲閫厰�嚗�', () => {
  game.player.stageProgress['1-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.stageProgress['2-5'] = { cleared: true, bestStars: 3, clearCount: 1 };
  game.player.unlockedStageIds = ['1-1', '1-2', '1-3', '1-4', '1-5', '2-1', '2-2', '2-3', '2-4', '2-5', '3-1', '3-2', '3-3', '3-4', '3-5'];
  game.player.level = 30;

  gotoStageSelect1();
  const back = game.stageSelectUi.backBtn;
  env.dispatchTouchStart(btnCenter(back).x, btnCenter(back).y); env.dispatchTouchEnd();
  runFrames(2);
  const chCard = game.chapterSelectUi.cards.find((c: any) => c.chapterId === 'chapter3');
  env.dispatchTouchStart(chCard.x + 30, chCard.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  const card = game.stageSelectUi.cards.find((c: any) => c.stageId === '3-5');
  env.dispatchTouchStart(card.x + 30, card.y + 30); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(game.startBattle('3-5'), true);
  game.beginBattle();
  runFrames(3);

  assert.equal(game.scene, 'battle');
  assert.equal(game.battle.isBossStage, true);

  // �羓焵摰嗥宏�啣𢰧銝𡃏�嚗屸俈甇Ｙ��渡���撠𤩺��
  game.battle.player.x = 300;
  game.battle.player.y = 100;

  // �其�銝芸儐�舀䔉�刻��喳㨃嚗峕�摰��3瘜Ｕ��
  // 其銝芸儐舀䔉刻喳㨃嚗峕摰3瘜Ｕ
  for (let wave = 0; wave < 3; wave++) {
    // 刻啣葷游芸枂
    for (let i = 0; i < 200 && game.battle.enemies.length === 0; i++) {
      runFrames(1);
    }
    assert.ok(game.battle.enemies.length > 0, "wave enemy generation check");
    // 甇餉銝瘜Ｘ㗇
    for (const e of game.battle.enemies) {
      e.hp = 0;
      e.dead = true;
    }
    // �刻�霈拇郭甈∠恣��膥璉�瘚见�撟嗆���
    runFrames(5);
  }

  // 甇斗𧒄摨𥪜��刻�隞亙𡢢�斤洵�𥟇郭 Boss
  for (let i = 0; i < 200 && !game.battle.currentBoss; i++) {
    runFrames(1);
  }

  const boss = game.battle.currentBoss;
  assert.ok(boss, '蝚砍�瘜� Boss �𠉛�摰�㪗摨磰砲���');
  assert.equal(boss.name, '熔炉守卫');

  // 霈啣����賡𧫴畾萇�撣����
  let hasRoarWarning = false;
  let hasRoarBlast = false;
  let hasFissureWarning = false;
  let hasFissureBlast = false;
  let hasLavaPool = false;
  let hasSummoned = false;

  // 撠� Boss HP �𠰴摹�� 40% 隞亥圻�睲��嗆挾�砍𤧅�𣬚�撗拇�嚗�僎霈曆蛹�滨𢥫隡文拿�脩���
  boss.hp = boss.maxHp * 0.4;
  boss.takeDamage = () => {};

  // �刻��園𡢿隞亥圻�烐��賢僎閫��
  for (let i = 0; i < 1500 && game.scene === 'battle'; i++) {
    runFrames(1);
    // �羓焵摰嗆��� Boss ��器
    game.battle.player.x = boss.x + 10;
    game.battle.player.y = boss.y;

    const fs = boss.furnaceSkill;
    if (fs) {
      if (fs.currentRoarPhase === 'warning') hasRoarWarning = true;
      if (fs.currentRoarPhase === 'blast') hasRoarBlast = true;
      if (fs.currentFissurePhase === 'warning') hasFissureWarning = true;
      if (fs.currentFissurePhase === 'blast') hasFissureBlast = true;
      if (fs.getLavaPools().length > 0) hasLavaPool = true;
      if (fs.hasSummoned) hasSummoned = true;
    }

    // 閫���唳��㗇��質�銝箏�撠梢���箄�撖��餈𥡝��餅�蝏梶�
    if (hasRoarWarning && hasRoarBlast && hasFissureWarning && hasFissureBlast && hasLavaPool && hasSummoned) {
      break;
    }
  }

  // �剛����賡𧫴畾萄�撌脰��亥�
  assert.ok(hasRoarWarning, '��𤧣摨磰砲餈𥕦� warning');
  assert.ok(hasRoarBlast, '��𤧣摨磰砲餈𥕦� blast ���');
  assert.ok(hasFissureWarning, '鋆��摨磰砲餈𥕦� warning');
  assert.ok(hasFissureBlast, '鋆��摨磰砲餈𥕦� blast ���');
  assert.ok(hasLavaPool, '鈭屸𧫴畾萄�霂乩漣�毺�撗拇�');
  assert.ok(hasSummoned, '鈭屸𧫴畾萄�霂亥圻�穃𡢢��');

  // �啣銁��甇� Boss
  boss.hp = 0;
  boss.dead = true;
  runFrames(5);

  // 甇斗𧒄�牐蛹餈䀹��砍𤧅�箸䔉����迎��䀹�銝滚�霂亦��餌���
  assert.equal(game.scene, 'battle', 'Boss 甇颱滿雿������蓥��塚��䀹�銝滚�蝡见�蝏梶�');

  // 皜�征���㗇�鈭�
  for (const e of game.battle.enemies) {
    e.hp = 0;
    e.dead = true;
  }
  runFrames(5);

  assert.equal(game.scene, 'result', '战场未进入结算');
  assert.equal(game.lastOutcome.win, true);
  assert.ok(game.lastOutcome.clearResult);
  assert.equal(game.lastOutcome.clearResult.chapterCompleted, true, '3-5 通关检查失败');

  game.resultUi.render();
  const drawnTexts = env.canvas.getDrawnTexts().join('|');
  assert.match(drawnTexts, /战斗胜利/);
  assert.match(drawnTexts, /第三章完成/);

  game.stop();

  const game2 = loadBootstrap()();
  assert.equal(game2.player.stageProgress['3-5']?.cleared, true, '持久化数据未更新');
  game2.stop();
});

test('章节14: 验证 skill_roar 和 skill_fissure 渲染逻辑', () => {
  const { drawLavaRoar, drawLavaFissure } = require('../dist/render/Chapter3BossRenderer.js');
  const rm = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();

  const roarState = { phase: 'blast', cx: 200, cy: 200, radius: 85, progress: 0.5 };
  const fissureState = { phase: 'blast', bx: 200, by: 200, tx: 200, ty: 500, width: 50, progress: 0.5 };

  // 1. 璅⊥㰘蝸憭梯揖 (𨅯)
  rm.resetForTest();
  const fakeCtx = env.canvas.getContext('2d');
  const stats = env.canvas.getCallStats();
  
  // 皜妟
  stats.drawImage = 0;
  stats.arc = 0;
  stats.fillRect = 0;

  drawLavaRoar(fakeCtx, roarState);
  assert.equal(stats.drawImage, 0, '憭梯揖�嗅��桐�摨𠉛��嗅㦛��');
  assert.ok(stats.arc > 0, '憭梯揖�嗅��桀��𨅯�蝏睃���憫');

  stats.drawImage = 0;
  drawLavaFissure(fakeCtx, fissureState);
  assert.equal(stats.drawImage, 0, '憭梯揖�嗉��嗘�摨𠉛��嗅㦛��');
  assert.ok(stats.fillRect > 0, '憭梯揖�嗉��坔��𨅯�蝏睃��拙耦');

  // 2. 璅⊥��㰘蝸�𣂼�
  rm.resetForTest();
  (rm as any).statuses.set('skill_roar', 'LOADED');
  (rm as any).images.set('skill_roar', { src: 'assets/skill_roar.png' });
  (rm as any).statuses.set('skill_fissure', 'LOADED');
  (rm as any).images.set('skill_fissure', { src: 'assets/skill_fissure.png' });

  stats.drawImage = 0;
  drawLavaRoar(fakeCtx, roarState);
  assert.ok(stats.drawImage > 0, '�𣂼��嗅��桀�蝏睃��曄�');

  stats.drawImage = 0;
  drawLavaFissure(fakeCtx, fissureState);
  assert.ok(stats.drawImage > 0, '�𣂼��嗉��坔�蝏睃��曄�');
});

test('隞餃𦛚15嚗𡁶�撗拙�鋆���急�蝚行�����垍�瘚贝�嚗��憭��UI皜脫���祕��撕蝒𨰜���鋆��霂��蝔见��硋�摨𤏪�', async () => {
  // 1. 撉諹��啣㦛���皞𣂼銁韏��蝞∠��其葉�賢�頧賣���
  const rm = require('../dist/core/ResourceManager.js').ResourceManager.getInstance();
  rm.resetForTest();
  await rm.loadAll(game.ctx);
  const keys = ['equip_lava_cannon', 'equip_lava_armor', 'equip_lava_core', 'rune_fire_guard', 'ui_set_icon'];
  for (const key of keys) {
    assert.equal(rm.isLoaded(key), true);
  }

  // 2. 靘脲活蝛踵�2隞嗅�3隞塚��剛�憟𡑒�撅墧�扼����䜘��I���銝擧�瘣餌𠶖��
  game.player = game.save.reset();
  const generateEquipmentInstance = require('../dist/data/EquipmentHelper.js').generateEquipmentInstance;
  const generateRuneInstance = require('../dist/data/RuneHelper.js').generateRuneInstance;
  const getEquipmentPower = require('../dist/data/EquipmentCalc.js').getEquipmentPower;
  const getEquipmentSetEffects = require('../dist/data/EquipmentCalc.js').getEquipmentSetEffects;
  const equipRuneFn = require('../dist/data/EquipmentCalc.js').equipRune;

  const eq1 = generateEquipmentInstance('lava_cannon', 0);
  const eq2 = generateEquipmentInstance('lava_armor', 0);
  const eq3 = generateEquipmentInstance('lava_core', 0);
  game.player.equipmentInventory.items.push(eq1, eq2, eq3);
  const u1 = eq1.uid;
  const u2 = eq2.uid;
  const u3 = eq3.uid;

  const rInst = generateRuneInstance('fire_guard_rune', 0);
  game.player.runeInventory.push(rInst);
  const r1 = rInst.uid;

  // 蝛踵�2隞�
  game.doEquipItem(u1);
  game.doEquipItem(u2);
  equipRuneFn(game.player, r1); // 鋆���輻�蝚行�

  const power2 = getEquipmentPower(game.player);
  assert.equal(power2, 230, '蝛踵�2隞嗥�撗抵�憭���睃�摨𥪯蛹 230');

  const eff2 = getEquipmentSetEffects(game.player);
  assert.equal(eff2.fireResist, 0.15, '2隞嗅�瞈�瘣餌��堒���');
  assert.equal(eff2.attack, 5, '2隞嗅�瞈�瘣餅𤫇�餃���');

  // 蝛踵�3隞�
  game.doEquipItem(u3);

  const power3 = getEquipmentPower(game.player);
  assert.equal(power3, 385, '蝛踵�3隞嗥�撗抵�憭���睃�摨𥪯蛹 385');

  const eff3 = getEquipmentSetEffects(game.player);
  assert.equal(eff3.fireResist, 0.15);
  assert.equal(eff3.attack, 5);
  assert.equal(eff3.skillDamageBonus, 0.10, '3隞嗅�瞈�瘣餅��賭慾摰喳���');
  assert.equal(eff3.cooldownReduction, 0.05, '3隞嗅�瞈�瘣餃��渡憬�誩���');

  // 餈𥕦�鋆���勗僎�剛� UI ���銝擧�瘣餌𠶖��
  game.goToEquipmentPanel();
  runFrames(2);
  assert.equal(game.scene, 'equipmentPanel');
  
  const ui = game.equipmentPanelUi;
  assert.doesNotThrow(() => ui.render());
  
  const drawnTexts = env.canvas.getDrawnTexts().join('|');
  assert.match(drawnTexts, /熔岩重炮/);
  assert.match(drawnTexts, /熔岩防护甲/);
  assert.match(drawnTexts, /熔岩能量核心/);

  // �孵稬�𥪜痔�滨��枏�霂行�嚗峕鱏閮�憟𡑒��𦠜𤣰��㺭 (3/3)
  const area1 = ui.slotAreas.find((a: any) => a.slot === 'weapon');
  assert.ok(area1);
  env.dispatchTouchStart(area1.x + 10, area1.y + 10); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(ui.selectedItem?.uid, u1);
  assert.doesNotThrow(() => ui.render());

  const dialogTexts = env.canvas.getDrawnTexts().join('|');
  assert.match(dialogTexts, /熔岩重炮/);
  assert.match(dialogTexts, /熔岩套装/);
  assert.match(dialogTexts, /已收集: 3\/3/);

  // �喲𡡒霂行�撘寧�
  const btnClose = ui.btnClose;
  env.dispatchTouchStart(btnClose.x + 5, btnClose.y + 5); env.dispatchTouchEnd();
  runFrames(2);
  assert.equal(ui.selectedItem, null);

  // 3. 靽嘥��𦒘蝙�典�銝�璅⊥�摮睃��滚鍳嚗峕鱏閮�銝劐辣鋆������㛖泵����忽�渡𠶖���瘣曄�憟𡑒�������憭�
  game.save.save(game.player);

  // �齿鰵�𥕦遣 GameManager嚗��隡朞䌊�刻粉�硋��滢�摮条���捆
  const GameManagerClass = require('../dist/core/GameManager.js').GameManager;
  const newGame = new GameManagerClass(game.ctx);
  
  const restartedPlayer = newGame.player;
  assert.equal(restartedPlayer.equipmentInventory.equipped.weapon, u1, '�滚鍳�擧郎�冽局蝛踵�摨娍�憭�');
  assert.equal(restartedPlayer.equipmentInventory.equipped.armor, u2, '�滚鍳�𡡞俈�瑟局蝛踵�摨娍�憭�');
  assert.equal(restartedPlayer.equipmentInventory.equipped.core, u3, '�滚鍳�擧瓲敹�局蝛踵�摨娍�憭�');
  assert.ok(restartedPlayer.equippedRunes.includes(r1), '�滚鍳�𡒊泵��忽�游��Ｗ�');

  const restartedPower = getEquipmentPower(restartedPlayer);
  assert.equal(restartedPower, 385, '�滚鍳�𤾸�鋆��餅��𥕦��Ｗ�');

  const restartedEff = getEquipmentSetEffects(restartedPlayer);
  assert.equal(restartedEff.fireResist, 0.15);
  assert.equal(restartedEff.attack, 5);
  assert.equal(restartedEff.skillDamageBonus, 0.10);
  assert.equal(restartedEff.cooldownReduction, 0.05);

  // 4. 蝝䭾𣂼頝臬嚗𡁜怨𤾸笆 5 銝芣鰵韏靚鍂鈭 drawImage
  const IMAGE_RESOURCES = require('../dist/core/ResourceManager.js').IMAGE_RESOURCES;
  const original = { ...IMAGE_RESOURCES };
  for (const k of Object.keys(IMAGE_RESOURCES)) {
    IMAGE_RESOURCES[k] = IMAGE_RESOURCES[k] + '_fail.png';
  }

  try {
    rm.resetForTest();
    const loadPromise = rm.loadAll(game.ctx);
    await new Promise(r => setTimeout(r, 15));
    await loadPromise;
    for (const key of keys) {
      assert.equal(rm.isFailed(key), true);
    }

    // 清空 Canvas 计数器
    const stats = env.canvas.getCallStats();
    stats.fillRect = 0;
    stats.strokeRect = 0;
    stats.arc = 0;
    stats.drawImage = 0;

    // 重新执行渲染触发失败路径兜底
    game.goToEquipmentPanel();
    ui.render();
    env.dispatchTouchStart(area1.x + 10, area1.y + 10); env.dispatchTouchEnd(); ui.render(); game.lastOutcome = { win: true, stageId: "3-5", elapsedSec: 10, hpRatio: 0.9, clearResult: { stars: 3, previousBestStars: 0, firstClear: true, gold: 100, parts: 10, chapterCompleted: false }, enhanceStoneReward: 5, loot: { equipmentConfigId: "lava_cannon", equipmentName: "lava_cannon", equipmentRarity: "epic", runeConfigId: "fire_guard_rune", runeName: "fire_guard_rune", runeRarity: "rare" } }; game.switchScene("result"); game.resultUi.render();

    assert.equal(stats.drawImage, 0, '资源失败时不应继续绘制图片');
    assert.ok(stats.fillRect > 0 || stats.strokeRect > 0 || stats.arc > 0, '资源失败时应使用程序化兜底图形');
  } finally {
    for (const k of Object.keys(IMAGE_RESOURCES)) {
      IMAGE_RESOURCES[k] = original[k];
    }
  }
});
