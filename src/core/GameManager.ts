/**
 * GameManager —— 游戏总控
 * ------------------------------------------------------------------
 * 职责：
 *  1. 持有 IContext、SaveManager、EventManager、PlayerData
 *  2. 维护场景状态机：MENU → BATTLE → RESULT → MENU
 *  3. 驱动 requestAnimationFrame 主循环，把 dt 派发给当前场景
 *  4. 暴露跨场景动作：startBattle / finishBattle / returnToMenu / tryUpgrade
 *
 * 不直接绘制/移动，而是把工作委托给 BattleManager / MainUI 等。
 */
import { IContext } from '../engine/IContext';
import { SaveManager } from './SaveManager';
import { EventManager, EVT } from './EventManager';
import { PlayerData } from '../data/PlayerData';
import { MECHA_CONFIGS, getMechaStats } from '../data/MechaConfig';
import { getStageById } from '../data/StageConfig';
import { tryUpgrade, UpgradeResult } from '../data/Upgrade';
import { applyClear, isUnlocked, ClearResult } from '../chapter/ProgressManager';
import { tryUpgradeSkill, SkillUpgradeResult } from '../data/SkillUpgrade';
import { calculateTotalPower } from '../data/PowerCalc';
import {
  calculatePlayerBattleStats, equipItem, unequipSlot, equipRune, unequipRune,
} from '../data/EquipmentCalc';
import {
  generateEquipmentInstance,
} from '../data/EquipmentHelper';
import {
  generateRuneInstance,
} from '../data/RuneHelper';
import { rollLoot } from '../data/Loot';
import { getEquipmentConfig as getEquipmentConfigPub } from '../data/EquipmentConfig';
import { getRuneConfig as getRuneConfigPub } from '../data/RuneConfig';
import {
  tryEnhanceEquipment, tryDisassembleEquipment, EnhanceResult, DisassembleResult,
  toggleEquipmentLock, ToggleLockResult
} from '../data/EquipmentEnhance';
import { findPublishedStageProgression, resolvePublishedStageProgressions } from '../progression/StageProgressionRepository';
import { applyDefaultStageUnlocks, reconcilePublishedStageUnlocks, settleStageRun } from '../progression/StageSettlementService';
import type { StageRunResult, StageSettlement } from '../progression/StageSettlementModels';
import { getDefaultContentRegistry } from '../content/registry/ContentRegistry';
import { resolvePublishedCampaigns } from '../campaign/CampaignRepository';
import { buildChapterProgress, markUnlockPresented, nextCampaignNode } from '../campaign/CampaignProgressService';
import type { CampaignDefinition, CampaignStageNodeDefinition } from '../content/models/Campaign';
import type { StageDefinition } from '../content/models/StageDefinition';
import { createFormalExploreStage } from '../explore/FormalStageExploreAdapter';

export type Scene = 'menu' | 'chapterSelect' | 'campaignMap' | 'campaignStageDetail' | 'stageSelect' | 'stageIntro' | 'battle' | 'explore' | 'result' | 'skillPanel' | 'equipmentPanel';

export interface BattleOutcome {
  win: boolean;
  stageId: string;
  /** 战斗用时（秒） */
  elapsedSec: number;
  /** 结束时玩家血量比例 */
  hpRatio: number;
  /** ProgressManager 计算后的结算详情（胜利才有；失败为 null） */
  clearResult: ClearResult | null;
  /** 任务9/10：掉落信息（装备/符文名称品质；胜利才有） */
  loot: {
    equipmentName?: string;
    equipmentRarity?: string;
    equipmentConfigId?: string;
    runeName?: string;
    runeRarity?: string;
    runeConfigId?: string;
    fullBagConverted?: boolean;
    convertedStones?: number;
    tutorialEquipmentName?: string;
    tutorialEquipmentRarity?: string;
    tutorialEquipmentConfigId?: string;
    tutorialFullBagConverted?: boolean;
    tutorialConvertedStones?: number;
  } | null;
  /** 任务10：强化石奖励数 */
  enhanceStoneReward?: number;
  contentStageId?: string;
  run?: StageRunResult;
  settlement?: StageSettlement;
}

export type StageResult = 'victory' | 'defeat' | 'aborted';

export class GameManager {
  public readonly ctx: IContext;
  public readonly save: SaveManager;
  public readonly events: EventManager;
  public player: PlayerData;
  public scene: Scene = 'menu';

  // 当前局战斗结果（result 场景读取）
  public lastOutcome: BattleOutcome | null = null;
  public stageResult: StageResult | null = null;
  public stageExitReason: 'user-quit' | null = null;
  private playerBeforeActiveStage: PlayerData | null = null;
  /** 固定屏只保留给显式调试入口；玩家关卡选择始终走正式自由地图入口。 */
  private stageEntrySource: 'debug' | 'formal' = 'debug';
  private freeMapStageRunSeq = 0;

  public menuUi: any = null;
  public battle: any = null;
  public explore: any = null;
  public resultUi: any = null;
  public stageSelectUi: any = null;
  public stageIntroUi: any = null;
  public skillPanelUi: any = null;
  public chapterSelectUi: any = null;
  public equipmentPanelUi: any = null;
  public campaignMapUi: any = null;
  public campaignStageDetailUi: any = null;
  public publishedCampaigns: CampaignDefinition[] = resolvePublishedCampaigns();
  public currentCampaignNodeId?: string;
  /** 任务7：当前选中章节（关卡选择显示用） */
  public currentChapterId = 'chapter1';
  public tutorialManager: any = null;
  private featureUnlockService: {
    isUnlocked(featureId: string): boolean;
    consumeNextNotice?(): { notice: string } | null;
  } | null = null;

  private rafId = 0;
  private lastTs = 0;
  private running = false;

  constructor(ctx: IContext) {
    this.ctx = ctx;
    this.save = new SaveManager(ctx.storage);
    this.events = new EventManager();
    this.player = this.save.load();
    const publishedProgressions = resolvePublishedStageProgressions();
    const mapStageId = (id: string) => this.mapContentStageId(id);
    const restoredUnlocks = applyDefaultStageUnlocks(this.player, publishedProgressions, mapStageId)
      .concat(reconcilePublishedStageUnlocks(this.player, publishedProgressions, mapStageId));
    if (restoredUnlocks.length) this.save.save(this.player);
  }

  setTutorialManager(tm: any): void {
    this.tutorialManager = tm;
  }

  setFeatureUnlockService(service: {
    isUnlocked(featureId: string): boolean;
    consumeNextNotice?(): { notice: string } | null;
  } | null): void {
    this.featureUnlockService = service;
  }

  isFeatureUnlocked(featureId: string): boolean {
    return !this.featureUnlockService || this.featureUnlockService.isUnlocked(featureId);
  }

  getFeatureLockReason(featureId: string): string {
    return this.isFeatureUnlocked(featureId) ? '' : '功能未解锁，请完成新手引导。';
  }

  consumeFeatureUnlockNotice(): string {
    return this.featureUnlockService?.consumeNextNotice?.()?.notice ?? '';
  }

  // ---------- 属性派生 ----------
  get mechaConfig() { return MECHA_CONFIGS[this.player.mechaId] ?? MECHA_CONFIGS.orange_cat; }
  get stats() { return getMechaStats(this.mechaConfig, this.player.level); }
  /** 任务6：总战力（含技能贡献），用于 UI 显示与推荐战力对比 */
  get totalPower(): number { return calculateTotalPower(this.player); }
  /** 任务9：战斗综合属性（含装备/符文加成） */
  get battleStats() { return calculatePlayerBattleStats(this.player); }

  /** 给 UI 注入控制器（避免 core 反向依赖 ui 包造成循环 import） */
  setMenuUi(ui: any): void { this.menuUi = ui; }
  setResultUi(ui: any): void { this.resultUi = ui; }
  setBattle(b: any): void { this.battle = b; }
  setExplore(e: any): void { this.explore = e; }
  setStageSelectUi(ui: any): void { this.stageSelectUi = ui; }
  setStageIntroUi(ui: any): void { this.stageIntroUi = ui; }
  setSkillPanelUi(ui: any): void { this.skillPanelUi = ui; }
  setChapterSelectUi(ui: any): void { this.chapterSelectUi = ui; }
  setEquipmentPanelUi(ui: any): void { this.equipmentPanelUi = ui; }
  setCampaignMapUi(ui: any): void { this.campaignMapUi = ui; }
  setCampaignStageDetailUi(ui: any): void { this.campaignStageDetailUi = ui; }

  // ---------- 场景切换 ----------
  private switchScene(next: Scene): void {
    this.scene = next;
    this.tutorialManager?.restoreStep?.();
    this.events.emit(EVT.SCENE_CHANGED, next);
  }

  /** 任务7：主界面 → 章节选择 */
  goToChapterSelect(): void {
    if (!this.isFeatureUnlocked('feature.campaign')) return;
    if (!this.hasPublishedCampaign) { this.switchScene('chapterSelect'); return; }
    const progress = this.player.campaignProgress;
    const campaign = this.publishedCampaigns.find(item => item.id === progress.currentCampaignId) ?? this.publishedCampaigns[0];
    const chapter = campaign.chapters.find(item => item.id === progress.currentChapterId)
      ?? campaign.chapters.find(item => item.id === campaign.defaultChapterId) ?? campaign.chapters[0];
    if (!chapter) { this.switchScene('chapterSelect'); return; }
    progress.currentCampaignId = campaign.id; progress.currentChapterId = chapter.id;
    this.save.save(this.player); this.switchScene('campaignMap');
  }

  get hasPublishedCampaign(): boolean { return this.publishedCampaigns.some(item => item.enabled && item.chapters.some(chapter => chapter.enabled)); }

  get currentCampaign(): CampaignDefinition | undefined {
    return this.publishedCampaigns.find(item => item.id === this.player.campaignProgress.currentCampaignId) ?? this.publishedCampaigns[0];
  }

  get currentCampaignChapter() {
    const campaign = this.currentCampaign;
    return campaign?.chapters.find(item => item.id === this.player.campaignProgress.currentChapterId)
      ?? campaign?.chapters.find(item => item.id === campaign.defaultChapterId) ?? campaign?.chapters[0];
  }

  get currentCampaignNode(): CampaignStageNodeDefinition | undefined {
    return this.currentCampaignChapter?.nodes.find(item => item.id === this.currentCampaignNodeId);
  }

  getCampaignChapterView() {
    const chapter = this.currentCampaignChapter;
    return chapter ? buildChapterProgress(chapter, this.player, id => this.mapContentStageId(id), (fromId, toId) => {
      const rule = findPublishedStageProgression(fromId)?.unlockRules.find(item => item.enabled && item.nextStageId === toId);
      return rule?.type === 'prerequisite-stars' ? Math.max(1, rule.requiredStars) : 1;
    }) : undefined;
  }

  openCampaignNode(nodeId: string): boolean {
    const node = this.getCampaignChapterView()?.nodes.find(item => item.id === nodeId);
    if (!node || node.state === 'LOCKED') return false;
    this.currentCampaignNodeId = node.id; this.player.campaignProgress.recentStageId = node.stageId;
    this.save.save(this.player); this.switchScene('campaignStageDetail'); return true;
  }

  beginCampaignNode(): boolean {
    const node = this.currentCampaignNode; if (!node) return false;
    const stage = getDefaultContentRegistry().getStage(node.stageId);
    this.startFreeMapStage(stage); return true;
  }

  consumeCampaignUnlocks(): void {
    for (const node of this.currentCampaignChapter?.nodes ?? []) {
      if (this.player.campaignProgress.newlyUnlockedNodeIds.includes(node.id)) markUnlockPresented(this.player, node.id);
    }
    this.save.save(this.player);
  }

  /** 任务7：章节选择 → 某章节的关卡选择 */
  goToStageSelect(chapterId?: string): void {
    if (chapterId) this.currentChapterId = chapterId;
    this.switchScene('stageSelect');
  }

  /** 关卡选择 → 返回章节选择 */
  backToChapterSelect(): void {
    this.switchScene('chapterSelect');
  }

  /** 关卡选择界面 → 返回主界面 */
  backToMenu(): void {
    this.switchScene('menu');
  }

  /** 任务6：主界面 → 技能养成界面 */
  goToSkillPanel(): void {
    if (!this.isFeatureUnlocked('feature.skills')) return;
    this.switchScene('skillPanel');
  }

  /** 任务6：技能养成 → 升级技能 */
  doUpgradeSkill(skillId: string): SkillUpgradeResult {
    const r = tryUpgradeSkill(this.player, skillId);
    if (r.ok) {
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    }
    return r;
  }

  /**
   * 任务4：从关卡选择界面进入「关卡介绍」。
   * 校验：未解锁关卡拒绝（返回 false）。实际战斗由 beginBattle 触发。
   */
  startBattle(stageId: string): boolean {
    return this.openStageIntro(stageId, 'debug');
  }

  /** 玩家从章节/关卡选择进入的正式入口。 */
  openFormalStage(stageId: string): boolean {
    return this.openStageIntro(stageId, 'formal');
  }

  private openStageIntro(stageId: string, source: 'debug' | 'formal'): boolean {
    const stage = getStageById(stageId);
    if (!stage) { this.ctx.log('unknown stage', stageId); return false; }
    if (!isUnlocked(this.player, stageId)) { this.ctx.log('stage locked', stageId); return false; }
    this.player.selectedStageId = stageId;
    this.stageEntrySource = source;
    this.lastOutcome = null;
    this.switchScene('stageIntro');
    return true;
  }

  /** 任务4：从关卡介绍真正进入战斗 */
  beginBattle(): void {
    const id = this.player.selectedStageId;
    const stage = id ? getStageById(id) : undefined;
    if (!stage) { this.ctx.log('no selected stage'); return; }
    this.lastOutcome = null;
    this.stageResult = null; this.stageExitReason = null;
    this.battle?.start(stage);
    this.switchScene('battle');
    this.events.emit('stage.started', { stageId: id });
    this.events.emit('stage-started', { stageId: id });
  }

  /** 关卡介绍页的统一开始动作：正式入口不能回落到固定屏。 */
  beginSelectedStage(): boolean {
    if (this.stageEntrySource !== 'formal') {
      this.beginBattle();
      return this.scene === 'battle';
    }
    const legacyStageId = this.player.selectedStageId;
    const legacyStage = legacyStageId ? getStageById(legacyStageId) : undefined;
    if (!legacyStage) {
      this.ctx.log('formal stage missing legacy config', legacyStageId);
      return false;
    }
    const contentStage = getDefaultContentRegistry().listStages()
      .find(item => item.legacyStageId === legacyStageId || item.id === legacyStageId);
    this.startFreeMapStage(createFormalExploreStage(legacyStage, contentStage));
    return true;
  }

  startExploreTraining(): void {
    if (!this.isFeatureUnlocked('feature.exploration')) return;
    const stage = getDefaultContentRegistry().getStage('stage_explore_training_01');
    this.player.tutorialFinished = true;
    this.startFreeMapStage(stage);
  }

  startFreeMapStage(stage: StageDefinition): void {
    this.playerBeforeActiveStage = JSON.parse(JSON.stringify(this.player)) as PlayerData;
    this.lastOutcome = null; this.stageResult = null; this.stageExitReason = null;
    this.player.selectedStageId = stage.legacyStageId ?? stage.id;
    this.explore?.start(stage);
    this.switchScene('explore');
    this.events.emit('stage.started', { stageId: stage.id, runtimeMode: 'free-map' });
    this.events.emit('stage-started', { stageId: stage.id, runtimeMode: 'free-map' });
  }

  abortCurrentStage(): void {
    if (this.scene !== 'battle' && this.scene !== 'explore') return;
    if (this.scene === 'battle') this.battle?.abort?.();
    else this.explore?.clear?.();
    if (this.playerBeforeActiveStage) this.player = this.playerBeforeActiveStage;
    this.playerBeforeActiveStage = null;
    this.lastOutcome = null; this.stageResult = 'aborted'; this.stageExitReason = 'user-quit';
    (this.ctx.input as any).reset?.();
    this.switchScene(this.hasPublishedCampaign ? 'campaignMap' : 'stageSelect');
  }

  pauseCurrentStage(): void {
    if (this.scene === 'battle') this.battle?.pause?.();
    else if (this.scene === 'explore') this.explore?.pause?.();
  }

  resumeCurrentStage(): void {
    if (this.scene === 'battle') this.battle?.resume?.();
    else if (this.scene === 'explore') this.explore?.resume?.();
  }

  get isCurrentStagePaused(): boolean {
    return this.scene === 'battle' ? Boolean(this.battle?.paused) : Boolean(this.explore?.paused);
  }

  /** 自由地图满足正式章节目标后复用既有结算、奖励和解锁链。 */
  finishFreeMapStage(stageId: string, hpRatio: number, elapsedSec: number): boolean {
    if (this.scene !== 'explore' || !getStageById(stageId)) return false;
    const run = this.createFreeMapStageRun(stageId, hpRatio, elapsedSec);
    this.explore?.clear?.();
    this.finishBattle({ win: true, stageId, contentStageId: run?.contentStageId, run, hpRatio, elapsedSec, clearResult: null, loot: null });
    return true;
  }

  private createFreeMapStageRun(stageId: string, hpRatio: number, elapsedSec: number): StageRunResult | undefined {
    const contentStageId = this.explore?.activeStageId;
    if (!contentStageId || !findPublishedStageProgression(contentStageId)) return undefined;
    const waveCount = this.explore?.stageWaves?.length || 1;
    const objective = this.explore?.objective;
    const clearedWaves = objective?.enemyKills >= objective?.enemyKillsRequired
      ? waveCount : Math.min(waveCount, (this.explore?.currentStageWave ?? 0) + 1);
    const endedAt = this.ctx.now();
    const heroMaxHp = this.explore?.player?.maxHp ?? 0;
    return {
      stageRunId: `${contentStageId}:${Math.floor(endedAt * 1000)}:${++this.freeMapStageRunSeq}`,
      stageId, contentStageId, victory: true,
      startedAt: Math.max(0, endedAt - elapsedSec), endedAt, elapsedSec,
      clearedWaves, totalWaves: waveCount, defeatedEnemies: objective?.enemyKills ?? 0,
      heroRemainingHp: heroMaxHp * hpRatio, heroMaxHp,
    };
  }

  /** 战斗结束后由 BattleManager 调用 */
  finishBattle(outcome: BattleOutcome): void {
    this.playerBeforeActiveStage = null;
    this.stageResult = outcome.win ? 'victory' : 'defeat'; this.stageExitReason = null;
    this.lastOutcome = outcome;
    const progression = findPublishedStageProgression(outcome.contentStageId);
    if (progression && outcome.run) {
      const playerBeforeSettlement = JSON.parse(JSON.stringify(this.player)) as PlayerData;
      outcome.settlement = settleStageRun(this.player, progression, outcome.run, {
        random: () => this.ctx.random(), now: () => this.ctx.now(),
        mapStageId: id => this.mapContentStageId(id),
      });
      outcome.clearResult = null;
      outcome.loot = null;
      outcome.enhanceStoneReward = 0;
      if (outcome.settlement.victory) this.syncCampaignUnlocks();
      if (!this.save.save(this.player)) {
        this.player = playerBeforeSettlement;
        outcome.win = false;
        outcome.settlement = { ...outcome.settlement, victory: false, stars: 0, grantedRewards: [],
          rewardsGranted: false, unlockedStageIds: [], failureReason: 'save-failed' };
        this.ctx.log('stage settlement save failed', outcome.run.stageRunId);
      }
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
      if (outcome.settlement.victory) {
        this.events.emit('stage.cleared', { stageId: outcome.stageId });
        this.events.emit('stage-cleared', { stageId: outcome.stageId });
      }
      this.switchScene('result');
      if (outcome.settlement.rewardsGranted) {
        this.events.emit('reward.claimed', { rewards: outcome.settlement.grantedRewards });
        this.events.emit('reward-granted', { rewards: outcome.settlement.grantedRewards });
      }
      return;
    }
    if (outcome.win) {
      // 委托 ProgressManager：星级 + 首通/重复奖励 + 解锁下一关（已写入 player）
      const stage = getStageById(outcome.stageId);
      if (stage) {
        const result = applyClear(this.player, {
          stage,
          hpRatio: outcome.hpRatio,
          elapsedSec: outcome.elapsedSec,
          nowSec: this.ctx.now(),
        });
        outcome.clearResult = result;
        this.syncCampaignUnlocks();
      }
      
      // 任务10：胜利结算额外掉落强化石
      let stoneQty = 0;
      if (stage) {
        const isBoss = !!stage.isBossStage;
        const isCh2 = stage.chapterId === 'chapter2';
        if (!isCh2) {
          stoneQty = isBoss 
            ? Math.floor(this.ctx.random() * 5) + 4 // 4~8
            : Math.floor(this.ctx.random() * 3) + 1; // 1~3
        } else {
          stoneQty = isBoss 
            ? Math.floor(this.ctx.random() * 8) + 8 // 8~15
            : Math.floor(this.ctx.random() * 5) + 4; // 4~8
        }
      }
      outcome.enhanceStoneReward = stoneQty;
      if (!this.player.materials) {
        this.player.materials = { enhanceStone: 0 };
      }
      this.player.materials.enhanceStone += stoneQty;

      // 任务9/10：装备/符文掉落与满包折算
      outcome.loot = this.rollAndApplyLoot(outcome.stageId);
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    } else {
      // 失败：不发奖、不解锁、不记录通关、不掉落
      outcome.clearResult = null;
      outcome.loot = null;
    }
    if (outcome.win) {
      this.events.emit('stage.cleared', { stageId: outcome.stageId });
      this.events.emit('stage-cleared', { stageId: outcome.stageId });
    }
    this.switchScene('result');
    if (outcome.win) {
      this.events.emit('reward.claimed', { clearResult: outcome.clearResult, loot: outcome.loot });
      this.events.emit('reward-granted', { clearResult: outcome.clearResult, loot: outcome.loot });
    }
  }

  public mapContentStageId(contentStageId: string): string {
    try { return getDefaultContentRegistry().getStage(contentStageId).legacyStageId ?? contentStageId; }
    catch { return contentStageId; }
  }

  /** 任务9/10：掷骰掉落并写入背包（含满包折算） */
  private rollAndApplyLoot(stageId: string): {
    equipmentName?: string;
    equipmentRarity?: string;
    equipmentConfigId?: string;
    runeName?: string;
    runeRarity?: string;
    runeConfigId?: string;
    fullBagConverted?: boolean;
    convertedStones?: number;
    tutorialEquipmentName?: string;
    tutorialEquipmentRarity?: string;
    tutorialEquipmentConfigId?: string;
    tutorialFullBagConverted?: boolean;
    tutorialConvertedStones?: number;
  } | null {
    let loot = rollLoot(stageId, this.ctx.random(), this.ctx.random(), this.ctx.random());
    const result: any = {};
    let hasNormalLoot = false;

    if (loot) {
      if (loot.equipmentConfigId) {
        const cfg = getEquipmentConfigPub(loot.equipmentConfigId);
        if (cfg) {
          hasNormalLoot = true;
          const items = this.player.equipmentInventory.items;
          if (items.length >= 60) {
            // 满包折算为强化石（普通 2, 优秀 6, 史诗 18）
            const baseRewards: Record<string, number> = { common: 2, rare: 6, epic: 18 };
            const converted = baseRewards[cfg.rarity] ?? 2;
            if (!this.player.materials) this.player.materials = { enhanceStone: 0 };
            this.player.materials.enhanceStone += converted;
            result.equipmentName = cfg.name;
            result.equipmentRarity = cfg.rarity;
            result.equipmentConfigId = loot.equipmentConfigId;
            result.fullBagConverted = true;
            result.convertedStones = converted;
          } else {
            const inst = generateEquipmentInstance(loot.equipmentConfigId, this.ctx.now());
            items.push(inst);
            result.equipmentName = cfg.name;
            result.equipmentRarity = cfg.rarity;
            result.equipmentConfigId = loot.equipmentConfigId;
          }
        }
      }
      if (loot.runeConfigId) {
        hasNormalLoot = true;
        const inst = generateRuneInstance(loot.runeConfigId, this.ctx.now());
        this.player.runeInventory.push(inst);
        const cfg = getRuneConfigPub(loot.runeConfigId);
        if (cfg) {
          result.runeName = cfg.name;
          result.runeRarity = cfg.rarity;
          result.runeConfigId = loot.runeConfigId;
        }
      }
    }

    // 独立额外引导装备保底掉落，不覆盖本次正常装备/符文掉落
    const isFirstTime1_1 = !!this.lastOutcome?.clearResult?.firstClear;
    if (stageId === '1-1' && isFirstTime1_1 && !this.player.tutorialFinished) {
      const tutorialCfgId = 'rusty_claw';
      const cfg = getEquipmentConfigPub(tutorialCfgId);
      if (cfg) {
        const items = this.player.equipmentInventory.items;
        if (items.length >= 60) {
          const baseRewards: Record<string, number> = { common: 2, rare: 6, epic: 18 };
          const converted = baseRewards[cfg.rarity] ?? 2;
          if (!this.player.materials) this.player.materials = { enhanceStone: 0 };
          this.player.materials.enhanceStone += converted;
          result.tutorialEquipmentName = cfg.name;
          result.tutorialEquipmentRarity = cfg.rarity;
          result.tutorialEquipmentConfigId = tutorialCfgId;
          result.tutorialFullBagConverted = true;
          result.tutorialConvertedStones = converted;
        } else {
          const inst = generateEquipmentInstance(tutorialCfgId, this.ctx.now());
          items.push(inst);
          result.tutorialEquipmentName = cfg.name;
          result.tutorialEquipmentRarity = cfg.rarity;
          result.tutorialEquipmentConfigId = tutorialCfgId;
        }
      }
    }

    const hasTutorialLoot = !!result.tutorialEquipmentConfigId;
    if (!hasNormalLoot && !hasTutorialLoot) return null;
    return result;
  }

  /** 任务9：主界面 → 装备界面 */
  goToEquipmentPanel(): void {
    if (!this.isFeatureUnlocked('feature.equipment')) return;
    this.switchScene('equipmentPanel');
  }

  /** 任务9：装备穿戴 */
  doEquipItem(uid: string): boolean {
    const ok = equipItem(this.player, uid);
    if (ok) {
      this.save.save(this.player); this.events.emit(EVT.PLAYER_DATA_CHANGED);
      this.events.emit('equipment.equipped', { uid });
      this.events.emit('equipment-equipped', { uid });
    }
    return ok;
  }
  doUnequipSlot(slot: 'weapon' | 'armor' | 'core'): void {
    unequipSlot(this.player, slot);
    this.save.save(this.player);
    this.events.emit(EVT.PLAYER_DATA_CHANGED);
  }
  
  /** 任务10：装备强化 */
  doEnhanceEquipment(uid: string): EnhanceResult {
    const r = tryEnhanceEquipment(this.player, uid);
    if (r.ok) {
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    }
    return r;
  }

  /** 任务10：装备分解 */
  doDisassembleEquipment(uid: string): DisassembleResult {
    const r = tryDisassembleEquipment(this.player, uid);
    if (r.ok) {
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    }
    return r;
  }

  /** 任务11：装备锁定/解锁 */
  doToggleEquipmentLock(uid: string): ToggleLockResult {
    const r = toggleEquipmentLock(this.player, uid);
    if (r.ok) {
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    }
    return r;
  }
  doEquipRune(uid: string): boolean {
    if (!this.isFeatureUnlocked('feature.runes')) return false;
    const ok = equipRune(this.player, uid);
    if (ok) { this.save.save(this.player); this.events.emit(EVT.PLAYER_DATA_CHANGED); }
    return ok;
  }
  doUnequipRune(uid: string): void {
    unequipRune(this.player, uid);
    this.save.save(this.player);
    this.events.emit(EVT.PLAYER_DATA_CHANGED);
  }

  /** 结算界面返回关卡选择（默认） */
  returnToStageSelect(): void {
    if (this.player.campaignProgress.currentCampaignId && this.hasPublishedCampaign) { this.switchScene('campaignMap'); return; }
    this.switchScene('stageSelect');
  }

  /** 从结算界面返回主界面 */
  returnToMenu(): void {
    this.switchScene('menu');
  }

  challengeNextStage(): boolean {
    const chapter = this.currentCampaignChapter;
    if (chapter && this.currentCampaignNodeId) {
      const next = nextCampaignNode(chapter, this.currentCampaignNodeId, this.player, id => this.mapContentStageId(id));
      if (!next) return false;
      this.currentCampaignNodeId = next.id; this.player.campaignProgress.recentStageId = this.mapContentStageId(next.stageId);
      this.lastOutcome = null; return this.beginCampaignNode();
    }
    const next = this.lastOutcome?.settlement?.unlockedStageIds[0]
      ?? this.lastOutcome?.clearResult?.unlockedNextId;
    if (!next || !isUnlocked(this.player, next) || !getStageById(next)) return false;
    this.player.selectedStageId = next;
    this.lastOutcome = null;
    this.stageEntrySource = 'formal';
    return this.beginSelectedStage();
  }

  canChallengeNextStage(): boolean {
    const chapter = this.currentCampaignChapter;
    if (chapter && this.currentCampaignNodeId) return !!nextCampaignNode(chapter, this.currentCampaignNodeId, this.player, id => this.mapContentStageId(id));
    return !!(this.lastOutcome?.settlement?.unlockedStageIds[0] ?? this.lastOutcome?.clearResult?.unlockedNextId);
  }

  private syncCampaignUnlocks(): void {
    const chapter = this.currentCampaignChapter; if (!chapter || !this.currentCampaignNodeId) return;
    for (const path of chapter.connections.filter(item => item.enabled && item.fromNodeId === this.currentCampaignNodeId)) {
      const node = chapter.nodes.find(item => item.id === path.toNodeId && item.enabled); if (!node) continue;
      const stageId = this.mapContentStageId(node.stageId);
      if (this.player.unlockedStageIds.includes(stageId)
        && !this.player.campaignProgress.newlyUnlockedNodeIds.includes(node.id)
        && !this.player.campaignProgress.playedUnlockNodeIds.includes(node.id)) this.player.campaignProgress.newlyUnlockedNodeIds.push(node.id);
    }
    buildChapterProgress(chapter, this.player, id => this.mapContentStageId(id));
  }

  /** 主界面：尝试升级 */
  doUpgrade(): UpgradeResult {
    const r = tryUpgrade(this.player);
    if (r.ok) {
      this.save.save(this.player);
      this.events.emit(EVT.PLAYER_DATA_CHANGED);
    }
    this.events.emit(EVT.UPGRADE_RESULT, r);
    return r;
  }

  // ---------- 主循环 ----------
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTs = this.ctx.now();
    const g: any = globalThis;
    const frame = (ts: number) => {
      if (!this.running) return;
      const now = this.ctx.now();
      let dt = now - this.lastTs;
      this.lastTs = now;
      // 防止后台切回导致超大 dt 炸死实体
      if (dt > 0.1) dt = 0.1;
      this.tick(dt);
      this.rafId = g.requestAnimationFrame
        ? g.requestAnimationFrame(frame)
        : (g.setTimeout as any)(() => frame(ts), 16);
    };
    this.rafId = g.requestAnimationFrame
      ? g.requestAnimationFrame(frame)
      : (g.setTimeout as any)(() => frame(0), 16);
  }

  stop(): void {
    this.running = false;
    const g: any = globalThis;
    if (g.cancelAnimationFrame) g.cancelAnimationFrame(this.rafId);
    else if (g.clearTimeout) g.clearTimeout(this.rafId);
  }

  /** 单帧推进：先 update 再 render。测试中也直接调用此方法。 */
  tick(dt: number): void {
    if (this.scene === 'battle' && this.battle) {
      this.battle.update(dt);
    } else if (this.scene === 'explore' && this.explore) {
      this.explore.update(dt);
    }
    this.render();
  }

  private render(): void {
    const c = this.ctx.canvas;
    c.clearRect(0, 0, this.ctx.canvasWidth, this.ctx.canvasHeight);
    if (this.scene === 'menu' && this.menuUi) this.menuUi.render();
    else if (this.scene === 'chapterSelect' && this.chapterSelectUi) this.chapterSelectUi.render();
    else if (this.scene === 'campaignMap' && this.campaignMapUi) this.campaignMapUi.render();
    else if (this.scene === 'campaignStageDetail' && this.campaignStageDetailUi) this.campaignStageDetailUi.render();
    else if (this.scene === 'stageSelect' && this.stageSelectUi) this.stageSelectUi.render();
    else if (this.scene === 'stageIntro' && this.stageIntroUi) this.stageIntroUi.render();
    else if (this.scene === 'skillPanel' && this.skillPanelUi) this.skillPanelUi.render();
    else if (this.scene === 'equipmentPanel' && this.equipmentPanelUi) this.equipmentPanelUi.render();
    else if (this.scene === 'battle' && this.battle) this.battle.render();
    else if (this.scene === 'explore' && this.explore) this.explore.render();
    else if (this.scene === 'result' && this.resultUi) this.resultUi.render();
  }
}
