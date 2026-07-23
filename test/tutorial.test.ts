import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { TutorialManager } from '../dist/core/TutorialManager.js';
import { SAVE_KEY } from '../dist/data/PlayerData.js';

test('新手引导：初始状态及跳过', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  (game as any).enableTutorial = true;
  const tm = new TutorialManager(ctx, game);

  assert.ok(tm.isActive());
  assert.equal(tm.getStep(), 'TUTORIAL_START');

  // 模拟点击右上角的跳过按钮
  ctx.input.tapX = ctx.canvasWidth - 50;
  ctx.input.tapY = 20;

  const intercepted = tm.handleInput();
  assert.ok(intercepted);
  assert.equal(tm.getStep(), 'FINISHED');
  assert.ok(!tm.isActive());
  assert.ok(game.player.tutorialFinished);

  // 验证保存盘已写入
  const saveStr = ctx.storage.get(SAVE_KEY);
  assert.ok(saveStr);
  const saved = JSON.parse(saveStr);
  assert.ok(saved.tutorialFinished);
});

test('新手引导：已完成存档直接跳过', () => {
  const ctx = new MockContext();
  ctx.storage.set(SAVE_KEY, JSON.stringify({ tutorialFinished: true }));
  const game = new GameManager(ctx);
  const tm = new TutorialManager(ctx, game);

  assert.ok(!tm.isActive());
  assert.equal(tm.getStep(), 'FINISHED');
});

test('新手引导：场景跳转驱动状态机推进', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  (game as any).enableTutorial = true;
  const tm = new TutorialManager(ctx, game);

  assert.equal(tm.getStep(), 'TUTORIAL_START');

  // 主页进入章节
  game.scene = 'chapterSelect';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'CHAPTER_SELECT');

  // 选择第一章
  game.scene = 'stageSelect';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'STAGE_SELECT');

  // 选择1-1
  game.scene = 'stageIntro';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'STAGE_INTRO');

  // 开始战斗
  game.scene = 'battle';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'BATTLE_MOVE');
});

test('新手引导：局内交互与 1-1 强制掉落与穿戴', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  (game as any).enableTutorial = true;
  const tm = new TutorialManager(ctx, game);

  // 1. 推进到 BATTLE_MOVE
  game.scene = 'chapterSelect'; tm.update(0.1);
  game.scene = 'stageSelect'; tm.update(0.1);
  game.scene = 'stageIntro'; tm.update(0.1);
  game.scene = 'battle'; tm.update(0.1);
  assert.equal(tm.getStep(), 'BATTLE_MOVE');

  // 2. 模拟移动 1.5 秒
  (ctx as any).playerMoved = true;
  tm.update(1.0);
  assert.equal(tm.getStep(), 'BATTLE_MOVE'); // 还没到 1.5 秒

  (ctx as any).playerMoved = true;
  tm.update(0.6);
  assert.equal(tm.getStep(), 'BATTLE_CANNON'); // 到了 1.5 秒

  // 3. 模拟使用喵能炮
  game.setBattle({
    player: {
      skillState: {
        get(id: string) {
          if (id === 'meow_cannon') return { cdRemaining: 5 };
          if (id === 'heavy_shield') return { cdRemaining: 0 };
          return null;
        }
      }
    }
  });
  tm.update(0.1);
  assert.equal(tm.getStep(), 'BATTLE_SHIELD');

  // 4. 模拟使用重甲护盾
  game.setBattle({
    player: {
      skillState: {
        get(id: string) {
          if (id === 'meow_cannon') return { cdRemaining: 4.9 };
          if (id === 'heavy_shield') return { cdRemaining: 8 };
          return null;
        }
      }
    }
  });
  tm.update(0.1);
  assert.equal(tm.getStep(), 'BATTLE_FIGHT');

  // 5. 战斗胜利
  game.lastOutcome = { win: true, stageId: '1-1', elapsedSec: 10, hpRatio: 1, loot: null };
  game.scene = 'result';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'RESULT_BACK');

  // 6. 返回车库
  game.scene = 'menu';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'TUTORIAL_EQUIP');

  // 7. 进入装备舱
  game.scene = 'equipmentPanel';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'EQUIP_SELECT');

  // 8. 选中第一件装备
  game.equipmentPanelUi = {
    selectedItem: { uid: 'rusty_1', configId: 'rusty_claw' },
    selectedIsEquipped: false
  };
  tm.update(0.1);
  assert.equal(tm.getStep(), 'EQUIP_WEAR');

  // 9. 穿戴装备
  game.player.equipmentInventory.equipped['weapon'] = 'rusty_1';
  tm.update(0.1);
  assert.equal(tm.getStep(), 'FINISHED');
});

