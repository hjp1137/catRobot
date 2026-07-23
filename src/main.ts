/**
 * 游戏入口（生产）
 * ------------------------------------------------------------------
 * 在微信小游戏 / 浏览器环境下：
 *  1. 构建 IContext（WxGameContext 内部会自动判定 wx 或 DOM）
 *  2. 创建 GameManager 与各 UI/Battle 控制器并互相注入
 *  3. 启动主循环
 *
 * 编译后由 game.js -> dist/main.js 引导。本文件不引入任何 Node-only API。
 */
import { WxGameContext } from './engine/WxGameContext';
import { GameManager } from './core/GameManager';
import { ResourceManager } from './core/ResourceManager';
import { BattleManager } from './battle/BattleManager';
import { MainUI } from './ui/MainUI';
import { BattleUI } from './ui/BattleUI';
import { ResultUI } from './ui/ResultUI';
import { StageSelectUI } from './ui/StageSelectUI';
import { StageIntroUI } from './ui/StageIntroUI';
import { SkillPanelUI } from './ui/SkillPanelUI';
import { ChapterSelectUI } from './ui/ChapterSelectUI';
import { EquipmentPanelUI } from './ui/EquipmentPanelUI';
import { CampaignMapUI } from './ui/CampaignMapUI';
import { CampaignStageDetailUI } from './ui/CampaignStageDetailUI';
import { getBattleTestState } from './debug/BattleTestProbe';
import { ExploreScene } from './explore/ExploreScene';
import { getExploreTestState } from './debug/ExploreTestProbe';
import { getContentTestState } from './debug/ContentTestProbe';

import { createTutorialController } from './tutorial/createTutorialController';

export function bootstrap(): GameManager {
  const ctx = new WxGameContext();
  ResourceManager.getInstance().loadAll(ctx);
  const game = new GameManager(ctx);

  const battle = new BattleManager(ctx, game);
  const battleUI = new BattleUI(ctx, battle, game);
  const explore = new ExploreScene(ctx, game);
  const exploreUI = new BattleUI(ctx, explore, game);
  const menuUI = new MainUI(ctx, game);
  const resultUI = new ResultUI(ctx, game);
  const stageSelectUI = new StageSelectUI(ctx, game);
  const stageIntroUI = new StageIntroUI(ctx, game);
  const skillPanelUI = new SkillPanelUI(ctx, game);
  const chapterSelectUI = new ChapterSelectUI(ctx, game);
  const equipmentPanelUI = new EquipmentPanelUI(ctx, game);
  const campaignMapUI = new CampaignMapUI(ctx, game);
  const campaignStageDetailUI = new CampaignStageDetailUI(ctx, game);

  game.setBattle(battle);
  game.setExplore(explore);
  game.setMenuUi(menuUI);
  game.setResultUi(resultUI);
  game.setStageSelectUi(stageSelectUI);
  game.setStageIntroUi(stageIntroUI);
  game.setSkillPanelUi(skillPanelUI);
  game.setChapterSelectUi(chapterSelectUI);
  game.setEquipmentPanelUi(equipmentPanelUI);
  game.setCampaignMapUi(campaignMapUI);
  game.setCampaignStageDetailUi(campaignStageDetailUI);
  const g: any = globalThis;
  g.__MEOW_GAME__ = game;
  g.__MEOW_BATTLE__ = battle;
  g.__MEOW_EXPLORE__ = explore;

  const tutorial = createTutorialController(ctx, game);
  game.setTutorialManager(tutorial);
  if (g.wx?.onHide) g.wx.onHide(() => tutorial.pause?.());
  if (g.wx?.onShow) g.wx.onShow(() => tutorial.resume?.());

  // 拦截 tick：在每帧 update 之前让 UI 处理点击，
  // 并在战斗场景之上叠加 BattleUI 渲染。
  const originalTick = game.tick.bind(game);
  // 任务5：键盘 1/2 快捷键（PC 调试；wx 无 DOM 键盘则自动跳过）
  if (g.document) {
    g.document.addEventListener('keydown', (e: any) => {
      const skillTarget = game.scene === 'battle' ? battle : game.scene === 'explore' ? explore : null;
      if (!skillTarget) return;
      if (e.code === 'Digit1' || e.code === 'Numpad1') skillTarget.usePlayerSkill('meow_cannon');
      else if (e.code === 'Digit2' || e.code === 'Numpad2') skillTarget.usePlayerSkill('heavy_shield');
    });
  }
  (game as any).tick = (dt: number) => {
    if (game.scene === 'menu' && (menuUI.handleGuiQuickExploreClick() || menuUI.handleGuiQuickBattleClick())) {
      originalTick(dt);
      if ((game as any).scene === 'battle') battleUI.render();
      if ((game as any).scene === 'explore') exploreUI.render();
      return;
    }

    // 任务17：新手引导拦截处理
    if (tutorial.isActive()) {
      tutorial.update(dt);
      const isIntercepted = tutorial.handleInput();
      if (!isIntercepted) {
        if (game.scene === 'menu') menuUI.handleClick();
        else if (game.scene === 'chapterSelect') chapterSelectUI.handleClick();
        else if (game.scene === 'campaignMap') campaignMapUI.handleClick();
        else if (game.scene === 'campaignStageDetail') campaignStageDetailUI.handleClick();
        else if (game.scene === 'stageSelect') stageSelectUI.handleClick();
        else if (game.scene === 'stageIntro') stageIntroUI.handleClick();
        else if (game.scene === 'skillPanel') skillPanelUI.handleClick();
        else if (game.scene === 'equipmentPanel') equipmentPanelUI.handleClick();
        else if (game.scene === 'result') resultUI.handleClick();

        if (game.scene === 'battle') { battleUI.handleStageExitInput(); battleUI.handleSkillInput(); }
        else if (game.scene === 'explore') { exploreUI.handleStageExitInput(); exploreUI.handleSkillInput(); }
      }
    } else {
      // 处理 UI 点击（消费 tap）
      if (game.scene === 'menu') menuUI.handleClick();
      else if (game.scene === 'chapterSelect') chapterSelectUI.handleClick();
      else if (game.scene === 'campaignMap') campaignMapUI.handleClick();
      else if (game.scene === 'campaignStageDetail') campaignStageDetailUI.handleClick();
      else if (game.scene === 'stageSelect') stageSelectUI.handleClick();
      else if (game.scene === 'stageIntro') stageIntroUI.handleClick();
      else if (game.scene === 'skillPanel') skillPanelUI.handleClick();
      else if (game.scene === 'equipmentPanel') equipmentPanelUI.handleClick();
      else if (game.scene === 'result') resultUI.handleClick();

      // 任务5：战斗场景处理技能按钮点击
      if (game.scene === 'battle') { battleUI.handleStageExitInput(); battleUI.handleSkillInput(); }
      else if (game.scene === 'explore') { exploreUI.handleStageExitInput(); exploreUI.handleSkillInput(); }
    }

    // 推进逻辑（原 tick 已包含 battle.update + render）
    originalTick(dt);
    // 战斗 HUD 叠加渲染
    if (game.scene === 'battle') battleUI.render();
    else if (game.scene === 'explore') exploreUI.render();
    if (g.__MEOW_GUI_AUTOMATION__) {
      g.__MEOW_BATTLE_TEST_STATE__ = getBattleTestState(game, battle, ctx);
    }
    if (game.scene === 'explore' && (g.__MEOW_GUI_AUTOMATION__ || ctx.getSystemInfo().platform === 'devtools')) {
      g.__MEOW_EXPLORE_TEST_STATE__ = getExploreTestState(game, explore, ctx);
    }
    if (g.__MEOW_GUI_AUTOMATION__ || ctx.getSystemInfo().platform === 'devtools') {
      g.__MEOW_CONTENT_TEST_STATE__ = getContentTestState(game, battle, explore);
    }

    // 任务17：新手引导叠加渲染
    if (tutorial.isActive()) {
      tutorial.render();
    }
  };

  game.start();
  return game;
}

// 注：自动引导从模块顶层移到 game.js（生产入口），避免 require 副作用，便于单测 import。
