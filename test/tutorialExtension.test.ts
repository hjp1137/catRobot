import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockContext } from '../dist/engine/MockContext.js';
import { GameManager } from '../dist/core/GameManager.js';
import { TutorialManager } from '../dist/core/TutorialManager.js';
import { ResourceManager } from '../dist/core/ResourceManager.js';
import { EquipmentPanelUI } from '../dist/ui/EquipmentPanelUI.js';
import { SAVE_KEY } from '../dist/data/PlayerData.js';
import { SaveManager } from '../dist/core/SaveManager.js';
import { WxRuntimeMock } from './wxRuntimeMock.ts';
import { WxGameContext } from '../dist/engine/WxGameContext.js';
import { ResultUI } from '../dist/ui/ResultUI.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

test('新手引导自愈：已通关未装备，启动时恢复到TUTORIAL_EQUIP', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  (game as any).enableTutorial = true;
  
  // 设置 1-1 已通关但没有穿戴任何装备
  game.player.stageProgress['1-1'] = { cleared: true, bestStars: 3 };
  game.player.equipmentInventory.equipped = {};
  
  const tm = new TutorialManager(ctx, game);
  assert.equal(tm.getStep(), 'TUTORIAL_EQUIP');
});

test('新手引导：老存档迁移防御与异常数据容错', () => {
  // 1. 空白旧档 (无成长无通关) -> tutorialFinished 依然是 false
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, JSON.stringify({}));
    const game = new GameManager(ctx);
    const tm = new TutorialManager(ctx, game);
    assert.equal(game.player.tutorialFinished, false);
  }

  // 2. 有关卡进度旧档 -> 自动迁移为 true
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, JSON.stringify({
      stageProgress: { '1-1': { cleared: true, bestStars: 3 } }
    }));
    const game = new GameManager(ctx);
    assert.equal(game.player.tutorialFinished, true);
  }

  // 3. 有机甲成长旧档 -> 自动迁移为 true
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, JSON.stringify({
      level: 5
    }));
    const game = new GameManager(ctx);
    assert.equal(game.player.tutorialFinished, true);
  }

  // 4. 非法类型字段防错 -> 自愈为 boolean 
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, JSON.stringify({
      tutorialFinished: "invalid_string_value",
      level: 2
    }));
    const game = new GameManager(ctx);
    // 有成长属性，判定为 true
    assert.strictEqual(game.player.tutorialFinished, true);
  }

  // 5. 非法类型字段防错 (无成长) -> 自愈为 false
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, JSON.stringify({
      tutorialFinished: 12345
    }));
    const game = new GameManager(ctx);
    assert.strictEqual(game.player.tutorialFinished, false);
  }

  // 6. 存档严重损坏 (非合法JSON格式) -> 回退默认，不报错崩溃
  {
    const ctx = new MockContext();
    ctx.storage.set(SAVE_KEY, "{ damaged_json_string_no_close");
    const game = new GameManager(ctx);
    assert.ok(game.player);
    assert.equal(game.player.level, 1);
    assert.equal(game.player.tutorialFinished, false);
  }

  // 7. 保存后重启状态保持一致
  {
    const ctx = new MockContext();
    let game = new GameManager(ctx);
    (game as any).enableTutorial = true;
    const tm = new TutorialManager(ctx, game);
    
    // 模拟点击右上角跳过按钮
    const w = ctx.canvasWidth;
    ctx.input.tapX = w - 40;
    ctx.input.tapY = 30;
    const intercepted = tm.handleInput();
    assert.ok(intercepted);
    assert.equal(game.player.tutorialFinished, true, '跳过按钮点击后应当置为 true');

    // 重启
    game = new GameManager(ctx);
    assert.equal(game.player.tutorialFinished, true, '重启后跳过状态应当正确保持为已完成');
  }
});

test('新手引导与ResultUI：固定三组分辨率/DPR生产物理与逻辑适配及越界校验测试', async () => {
  const configs = [
    { w: 320, h: 568, dpr: 1, name: 'iPhone SE' },
    { w: 375, h: 667, dpr: 2, name: 'iPhone 6/7/8' },
    { w: 414, h: 896, dpr: 3, name: 'iPhone XR' }
  ];

  for (const cfg of configs) {
    // 1. 初始化生产微信上下文模拟器
    const mock = new WxRuntimeMock();
    mock.windowWidth = cfg.w;
    mock.windowHeight = cfg.h;
    mock.pixelRatio = cfg.dpr;
    
    mock.install();

    try {
      const ctx = new WxGameContext();
      
      // 断言原始 Canvas 物理尺寸、逻辑尺寸以及坐标映射
      assert.equal(ctx.canvasWidth, cfg.w, '逻辑宽度应与配置一致');
      assert.equal(ctx.canvasHeight, cfg.h, '逻辑高度应与配置一致');
      assert.equal((ctx.canvas as any).canvas.width, cfg.w * cfg.dpr, 'Canvas 物理宽度应为 逻辑宽 * DPR');
      assert.equal((ctx.canvas as any).canvas.height, cfg.h * cfg.dpr, 'Canvas 物理高度应为 逻辑高 * DPR');

      const game = new GameManager(ctx);
      (game as any).enableTutorial = true;
      const tm = new TutorialManager(ctx, game);

      const stepOrder = [
        'TUTORIAL_START',
        'CHAPTER_SELECT',
        'STAGE_SELECT',
        'STAGE_INTRO',
        'BATTLE_MOVE',
        'BATTLE_CANNON',
        'BATTLE_SHIELD',
        'BATTLE_FIGHT',
        'RESULT_BACK',
        'TUTORIAL_EQUIP',
        'EQUIP_SELECT',
        'EQUIP_WEAR'
      ];

      const lw = cfg.w;
      const lh = cfg.h;

      // 遍历所有关键引导步骤，断言各种框框绝不超出逻辑 Canvas 视口，且数据一致
      for (const step of stepOrder) {
        (tm as any).step = step;
        
        const hitArea = tm.getTargetArea();

        // 记录真实绘制调用的包围盒
        let currentPath = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        const updatePathBounds = (x: number, y: number) => {
          currentPath.minX = Math.min(currentPath.minX, x);
          currentPath.maxX = Math.max(currentPath.maxX, x);
          currentPath.minY = Math.min(currentPath.minY, y);
          currentPath.maxY = Math.max(currentPath.maxY, y);
        };
        const updatePathBoundsArc = (cx: number, cy: number, r: number) => {
          currentPath.minX = Math.min(currentPath.minX, cx - r);
          currentPath.maxX = Math.max(currentPath.maxX, cx + r);
          currentPath.minY = Math.min(currentPath.minY, cy - r);
          currentPath.maxY = Math.max(currentPath.maxY, cy + r);
        };

        let filledPaths: { x: number, y: number, w: number, h: number }[] = [];
        let strokedPaths: { x: number, y: number, w: number, h: number }[] = [];
        let drawImageCalls: { src: string, x: number, y: number, w: number, h: number }[] = [];
        let fillRectCalls: { x: number, y: number, w: number, h: number }[] = [];
        let fillTextCalls: { text: string, x: number, y: number }[] = [];
        let hasArcCalled = false;

        const originBeginPath = (ctx.canvas as any).beginPath;
        const originMoveTo = (ctx.canvas as any).moveTo;
        const originLineTo = (ctx.canvas as any).lineTo;
        const originArc = (ctx.canvas as any).arc;
        const originFill = (ctx.canvas as any).fill;
        const originStroke = (ctx.canvas as any).stroke;
        const originDrawImage = (ctx.canvas as any).drawImage;
        const originFillRect = (ctx.canvas as any).fillRect;

        (ctx.canvas as any).beginPath = () => {
          currentPath = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
          originBeginPath.call(ctx.canvas);
        };
        (ctx.canvas as any).moveTo = (x: number, y: number) => {
          updatePathBounds(x, y);
          originMoveTo.call(ctx.canvas, x, y);
        };
        (ctx.canvas as any).lineTo = (x: number, y: number) => {
          updatePathBounds(x, y);
          originLineTo.call(ctx.canvas, x, y);
        };
        (ctx.canvas as any).arc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number, anticlockwise?: boolean) => {
          updatePathBoundsArc(cx, cy, r);
          hasArcCalled = true;
          originArc.call(ctx.canvas, cx, cy, r, startAngle, endAngle, anticlockwise);
        };
        (ctx.canvas as any).fill = () => {
          if (currentPath.minX !== Infinity) {
            filledPaths.push({
              x: currentPath.minX,
              y: currentPath.minY,
              w: currentPath.maxX - currentPath.minX,
              h: currentPath.maxY - currentPath.minY
            });
          }
          originFill.call(ctx.canvas);
        };
        (ctx.canvas as any).stroke = () => {
          if (currentPath.minX !== Infinity) {
            strokedPaths.push({
              x: currentPath.minX,
              y: currentPath.minY,
              w: currentPath.maxX - currentPath.minX,
              h: currentPath.maxY - currentPath.minY
            });
          }
          originStroke.call(ctx.canvas);
        };
        (ctx.canvas as any).drawImage = (image: any, ...args: any[]) => {
          const src = image?.src || 'unknown';
          let x = 0, y = 0, w = 0, h = 0;
          if (args.length === 4) {
            [x, y, w, h] = args;
          } else if (args.length === 2) {
            [x, y] = args;
          } else if (args.length === 8) {
            [,,,, x, y, w, h] = args;
          }
          drawImageCalls.push({ src, x, y, w, h });
          originDrawImage.call(ctx.canvas, image, ...args);
        };
        (ctx.canvas as any).fillRect = (x: number, y: number, w: number, h: number) => {
          fillRectCalls.push({ x, y, w, h });
          originFillRect.call(ctx.canvas, x, y, w, h);
        };
        const originFillText = (ctx.canvas as any).fillText;
        (ctx.canvas as any).fillText = (text: string, x: number, y: number) => {
          fillTextCalls.push({ text, x, y });
          if (originFillText) {
            originFillText.call(ctx.canvas, text, x, y);
          }
        };

        // 无高亮框的情况：BATTLE_MOVE 和 BATTLE_FIGHT
        if (step === 'BATTLE_MOVE' || step === 'BATTLE_FIGHT') {
          assert.equal(hitArea, null, `[${step}] 命中区域应当为 null（不拦截输入）`);
          // 验证不拦截行为
          (ctx.input as any).tapX = 100;
          (ctx.input as any).tapY = 100;
          assert.equal(tm.handleInput(), false, `[${step}] 不拦截，应当返回 false 放行输入`);
          
          // 渲染不崩溃测试
          tm.render();
          
          // 即使无高亮框也应当渲染跳过按钮
          const skipBtnPath = filledPaths.find(p => Math.abs(p.w - 70) < 2 && Math.abs(p.h - 44) < 2);
          assert.ok(skipBtnPath, `[${step}] 即使无高亮框也应当渲染跳过按钮`);

          // BATTLE_MOVE 绘制细节断言
          if (step === 'BATTLE_MOVE') {
            const rm = ResourceManager.getInstance();
            const moveStatus = (rm as any).statuses.get('ui_tutorial_move');
            if (moveStatus === 'LOADED') {
              const hasMoveImg = drawImageCalls.some(c => c.src.includes('ui_tutorial_move'));
              assert.ok(hasMoveImg, 'BATTLE_MOVE 状态下应绘制移动指引图片');
            } else {
              assert.ok(fillRectCalls.length > 0 || filledPaths.length > 0, 'BATTLE_MOVE 加载失败应触发 Canvas 兜底绘制');
            }
          }

          // BATTLE_FIGHT 绘制细节断言
          if (step === 'BATTLE_FIGHT') {
            const hasFightText = fillTextCalls.some(c => c.text.includes('很好，击退余下的全部敌人，取得最终的胜利！'));
            assert.ok(hasFightText, 'BATTLE_FIGHT 状态下应绘制对应的提示文本');
          }
          continue;
        }

        // 有高亮框的情况：
        assert.ok(hitArea, `[${step}] 应当有命中/视觉高亮数据`);

        // 命中热区/高亮框越界检查
        if (hitArea.type === 'rect') {
          assert.ok(hitArea.x >= 0, `[${step}] 矩形 x 不应为负数`);
          assert.ok(hitArea.x + hitArea.w <= lw, `[${step}] 矩形右边缘超出逻辑宽`);
          assert.ok(hitArea.y >= 0, `[${step}] 矩形 y 不应为负数`);
          assert.ok(hitArea.y + hitArea.h <= lh, `[${step}] 矩形底边缘超出逻辑高`);
        } else if (hitArea.type === 'circle') {
          assert.ok(hitArea.cx - hitArea.r >= 0, `[${step}] 圆形左边缘超出逻辑宽`);
          assert.ok(hitArea.cx + hitArea.r <= lw, `[${step}] 圆形右边缘超出逻辑宽`);
          assert.ok(hitArea.cy - hitArea.r >= 0, `[${step}] 圆形顶边缘超出逻辑高`);
          assert.ok(hitArea.cy + hitArea.r <= lh, `[${step}] 圆形底边缘超出逻辑高`);
        }

        // 调用 render 渲染，收集绘制调用数据
        tm.render();

        // 验证特定提示文本输出与已收集的 drawImage 资源绘制
        const expectedTip = (tm as any).getTipText();
        if (expectedTip) {
          const hasText = fillTextCalls.some(c => c.text.includes(expectedTip));
          assert.ok(hasText, `[${step}] 应当实际输出对应的提示文本: ${expectedTip}`);
        }

        const rm = ResourceManager.getInstance();
        const arrowStatus = (rm as any).statuses.get('ui_tutorial_arrow');
        if (arrowStatus === 'LOADED') {
          const hasArrow = drawImageCalls.some(c => c.src.includes('ui_tutorial_arrow'));
          assert.ok(hasArrow, `[${step}] 应当绘制引导箭头图片`);
        }

        // 1. 验证蒙层绘制与高亮框边界共享
        if (hitArea.type === 'rect') {
          // 上、下、左、右四个 fillRect 蒙版
          const hasTopMask = fillRectCalls.some(r => r.x === 0 && r.y === 0 && r.w === lw && Math.abs(r.h - hitArea.y) < 1);
          const hasBottomMask = fillRectCalls.some(r => r.x === 0 && Math.abs(r.y - (hitArea.y + hitArea.h)) < 1 && r.w === lw && Math.abs(r.h - (lh - (hitArea.y + hitArea.h))) < 1);
          assert.ok(hasTopMask, `[${step}] 应当有基于 hitArea.y=${hitArea.y} 划分的顶部遮罩蒙层`);
          assert.ok(hasBottomMask, `[${step}] 应当有基于 hitArea.y+h=${hitArea.y + hitArea.h} 划分的底部遮罩蒙层`);

          // 并且霓虹边框圆角矩形的描边物理边界应当与 hitArea 对齐
          const borderPath = strokedPaths.find(p => Math.abs(p.w - (hitArea.w + 4)) < 2 && Math.abs(p.h - (hitArea.h + 4)) < 2);
          assert.ok(borderPath, `[${step}] 应当有与 hitArea 物理对齐的霓虹边框圆角矩形描边`);
        } else if (hitArea.type === 'circle') {
          // 蒙版和圆形霓虹边框对齐检查
          const hasTopMask = fillRectCalls.some(r => r.x === 0 && r.y === 0 && r.w === lw && Math.abs(r.h - (hitArea.cy - hitArea.r)) < 1);
          assert.ok(hasTopMask, `[${step}] 圆形高亮应当有顶部遮罩蒙层`);

          // 霓虹边框圆形描边 (arc) 应该和 hitArea 一致
          assert.ok(hasArcCalled, `[${step}] 应当调用 arc 方法绘制霓虹圆形`);
        }

        // 2. 验证跳过按钮的真实物理绘制坐标
        const skipBtnPath = filledPaths.find(p => Math.abs(p.w - 70) < 2 && Math.abs(p.h - 44) < 2 && Math.abs(p.y - 15) < 2);
        assert.ok(skipBtnPath, `[${step}] 应当在物理上正确绘制跳过按钮`);
        assert.ok(skipBtnPath.x + skipBtnPath.w <= lw, `[${step}] 跳过按钮物理右边界不应溢出`);

        // 3. 验证文案提示框的物理边界
        const textTipPath = filledPaths.find(p => Math.abs(p.w - lw * 0.86) < 2 && Math.abs(p.h - 56) < 2);
        assert.ok(textTipPath, `[${step}] 应当正确绘制文案提示框底图`);
        assert.ok(textTipPath.x >= 0 && textTipPath.x + textTipPath.w <= lw, `[${step}] 文案提示框 x 物理越界`);
        assert.ok(textTipPath.y >= 0 && textTipPath.y + textTipPath.h <= lh, `[${step}] 文案提示框 y 物理越界`);
      }

      // 验证战败结算 UI (ResultUI) 重试框/视觉框/命中框数据一致且不越界
      game.lastOutcome = {
        win: false,
        stageId: '1-1',
        elapsedSec: 30,
        hpRatio: 0.0,
        clearResult: null,
        loot: null
      };
      game.player.selectedStageId = '1-1';

      const resultUI = new ResultUI(ctx, game);
      // 调用 render 触发布局计算
      resultUI.render();

      const retryBtn = (resultUI as any).retryBtn;
      assert.ok(retryBtn, '战败时重新挑战按钮应当存在');
      // 命中框数据 (用于 handleClick)
      assert.equal(retryBtn.id, 'retry');
      // 视觉不越界断言
      assert.ok(retryBtn.x >= 0, '重试按钮 x 应当大于等于 0');
      assert.ok(retryBtn.x + retryBtn.w <= lw, `重试按钮右边界 ${retryBtn.x + retryBtn.w} 不得超出逻辑宽 ${lw}`);
      assert.ok(retryBtn.y >= 0, '重试按钮 y 应当大于等于 0');
      assert.ok(retryBtn.y + retryBtn.h <= lh, `重试按钮底边界 ${retryBtn.y + retryBtn.h} 不得超出逻辑高 ${lh}`);

      // 验证视觉按钮对象与点击命中对象为同一数据
      const { pollButtonTap } = await import('../dist/ui/UIWidgets.js');
      const clickX = retryBtn.x + retryBtn.w / 2;
      const clickY = retryBtn.y + retryBtn.h / 2;
      (ctx.input as any).tapX = clickX;
      (ctx.input as any).tapY = clickY;
      
      const hitObj = pollButtonTap(ctx, [retryBtn]);
      assert.strictEqual(hitObj, retryBtn, '点击命中返回的数据对象应当就是 retryBtn 实例本身');

      // 重新设置点击坐标，以便 handleClick 内部的 pollButtonTap 能够再次命中
      (ctx.input as any).tapX = clickX;
      (ctx.input as any).tapY = clickY;

      resultUI.handleClick();

      // 重试之后游戏主状态应当重新开始战斗，且在战斗场景中
      assert.equal(game.scene, 'battle', '点击重试之后场景应当切换到 battle');
    } finally {
      mock.uninstall();
    }
  }
});

test('旧教程管理器固定步骤回归（已由发布教程运行时替代）', () => {
  const mock = new WxRuntimeMock();
  mock.windowWidth = 375;
  mock.windowHeight = 812;
  mock.pixelRatio = 3;
  mock.install();

  try {
    // 1. 从生产 main.js 加载 bootstrap 并启动
    delete require.cache[require.resolve('../dist/main.js')];
    const m = require('../dist/main.js');
    const bootstrapFn = m.bootstrap ?? m.default?.bootstrap;
    const game = bootstrapFn();

    const tutorial = game.tutorialManager;
    assert.equal(tutorial.getStep(), 'tutorial.welcome');
    assert.ok(tutorial.getTargetArea(), '欢迎步骤应解析首页主线入口热区');
    game.events.emit('dialog.acknowledged', { targetId: 'home.campaign' });
    assert.equal(tutorial.getStep(), 'tutorial.openCampaign');
    game.goToChapterSelect();
    assert.equal(game.scene, 'campaignMap');
    assert.ok(tutorial.getTargetArea(), '战役步骤应在正式地图继续解析热区');
    game.stop();

  } finally {
    mock.uninstall();
  }
});

test('发布教程运行时：生产 bootstrap 可查询当前步骤并随真实场景推进', () => {
  const mock = new WxRuntimeMock();
  mock.windowWidth = 375;
  mock.windowHeight = 812;
  mock.pixelRatio = 3;
  mock.install();
  try {
    delete require.cache[require.resolve('../dist/main.js')];
    const module = require('../dist/main.js');
    const bootstrap = module.bootstrap ?? module.default?.bootstrap;
    const game = bootstrap();
    const tutorial = game.tutorialManager;

    assert.equal(tutorial.getStep(), 'tutorial.welcome');
    assert.ok(tutorial.getTargetArea(), '欢迎步骤应有主线入口热区');
    game.events.emit('dialog.acknowledged', { targetId: 'home.campaign' });
    assert.equal(tutorial.getStep(), 'tutorial.openCampaign');

    game.goToChapterSelect();
    assert.equal(game.scene, 'campaignMap');
    assert.equal(tutorial.getStep(), 'tutorial.openCampaign');
    assert.ok(tutorial.getTargetArea(), '主线入口步骤应在主线页解析热区');
    game.stop();
  } finally {
    mock.uninstall();
  }
});

test('新手引导：四类引导素材成功加载渲染与加载失败兜底绘制测试', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  (game as any).enableTutorial = true;
  const tm = new TutorialManager(ctx, game);

  const rm = ResourceManager.getInstance();
  
  // 测试1：全加载成功情况下的 drawImage 调用
  {
    rm.resetForTest();
    (rm as any).statuses.set('ui_tutorial_arrow', 'LOADED');
    (rm as any).images.set('ui_tutorial_arrow', { src: 'mock_arrow' });
    (rm as any).statuses.set('ui_tutorial_move', 'LOADED');
    (rm as any).images.set('ui_tutorial_move', { src: 'mock_move' });
    (rm as any).statuses.set('ui_tutorial_skill', 'LOADED');
    (rm as any).images.set('ui_tutorial_skill', { src: 'mock_skill' });
    (rm as any).statuses.set('ui_tutorial_equip', 'LOADED');
    (rm as any).images.set('ui_tutorial_equip', { src: 'mock_equip' });

    const drawnImages: string[] = [];
    ctx.canvas.drawImage = (img: any) => {
      drawnImages.push(img.src);
    };

    // 1.1 BATTLE_MOVE 状态
    (tm as any).step = 'BATTLE_MOVE';
    tm.render();
    assert.ok(drawnImages.includes('mock_move'), '移动状态下应绘制 ui_tutorial_move 图片');

    // 1.2 BATTLE_CANNON 状态
    drawnImages.length = 0;
    (tm as any).step = 'BATTLE_CANNON';
    tm.render();
    assert.ok(drawnImages.includes('mock_skill'), '技能状态下应绘制 ui_tutorial_skill 图片');
    assert.ok(drawnImages.includes('mock_arrow'), '引导指示下应绘制 ui_tutorial_arrow 箭头图片');

    // 1.3 TUTORIAL_EQUIP 状态
    drawnImages.length = 0;
    (tm as any).step = 'TUTORIAL_EQUIP';
    tm.render();
    assert.ok(drawnImages.includes('mock_equip'), '装备状态下应绘制 ui_tutorial_equip 图片');
  }

  // 测试2：加载失败（兜底）情况下的 Canvas 路径绘制调用
  {
    rm.resetForTest(); // 所有图片都处于 PENDING，即未加载状态

    let drawImageCalled = false;
    ctx.canvas.drawImage = () => {
      drawImageCalled = true;
    };

    let pathMethodsCalled = 0;
    const trackPath = () => { pathMethodsCalled++; };
    ctx.canvas.beginPath = trackPath;
    ctx.canvas.moveTo = trackPath;
    ctx.canvas.lineTo = trackPath;
    ctx.canvas.arc = trackPath;
    ctx.canvas.fill = trackPath;
    ctx.canvas.fillRect = trackPath;

    // 2.1 BATTLE_MOVE 兜底
    drawImageCalled = false;
    pathMethodsCalled = 0;
    (tm as any).step = 'BATTLE_MOVE';
    tm.render();
    assert.strictEqual(drawImageCalled, false, '加载失败时，不应调用 drawImage');
    assert.ok(pathMethodsCalled > 0, '加载失败时，应调用 Canvas 路径绘图方法进行移动提示兜底');

    // 2.2 BATTLE_CANNON 兜底
    drawImageCalled = false;
    pathMethodsCalled = 0;
    (tm as any).step = 'BATTLE_CANNON';
    tm.render();
    assert.strictEqual(drawImageCalled, false, '加载失败时，不应调用 drawImage');
    assert.ok(pathMethodsCalled > 0, '加载失败时，应调用 Canvas 路径绘图方法进行技能和箭头提示兜底');

    // 2.3 TUTORIAL_EQUIP 兜底
    drawImageCalled = false;
    pathMethodsCalled = 0;
    (tm as any).step = 'TUTORIAL_EQUIP';
    tm.render();
    assert.strictEqual(drawImageCalled, false, '加载失败时，不应调用 drawImage');
    assert.ok(pathMethodsCalled > 0, '加载失败时，应调用 Canvas 路径绘图方法进行装备提示兜底');
  }
  
  // 恢复 ResourceManager 状态，不影响其他测试
  rm.resetForTest();
});

test('装备与符文面板：列表点击热区高度满足44px最小移动端触控要求测试', () => {
  const ctx = new MockContext();
  const game = new GameManager(ctx);
  
  // 给玩家添加一些装备和符文，以便能够渲染出单行
  game.player.equipmentInventory.items.push({
    uid: 'test_eq_1',
    configId: 'rusty_claw',
    level: 1,
    enhancedLevel: 0,
    locked: false,
    slotType: 'weapon',
    baseAtk: 10,
    baseHp: 0,
    atkGrowth: 1,
    hpGrowth: 0,
    rarity: 'normal'
  });
  game.player.runeInventory.push({
    uid: 'test_rune_1',
    configId: 'cannon_rune_1',
    level: 1,
    enhancedLevel: 0,
    locked: false,
    rarity: 'normal'
  } as any);

  const ui = new EquipmentPanelUI(ctx, game);
  ui.render();

  // 1. 验证装备背包的列表单行点击热区高度 >= 44
  assert.ok(ui['invAreas'].length > 0, '应该至少渲染一个背包装备');
  for (const area of ui['invAreas']) {
    assert.ok(area.h >= 44, `背包装备 ${area.uid} 的热区高度为 ${area.h}px，小于 44px`);
  }

  // 2. 验证符文槽位的列表单行点击热区高度 >= 44
  assert.ok(ui['runeSlotAreas'].length > 0, '应该渲染符文槽位');
  for (const area of ui['runeSlotAreas']) {
    assert.ok(area.h >= 44, `符文槽位 ${area.index} 的热区高度为 ${area.h}px，小于 44px`);
  }

  // 3. 验证符文背包的列表单行点击热区高度 >= 44
  assert.ok(ui['runeAreas'].length > 0, '应该至少渲染一个符文背包项');
  for (const area of ui['runeAreas']) {
    assert.ok(area.h >= 44, `符文背包 ${area.uid} 的热区高度为 ${area.h}px，小于 44px`);
  }
});
