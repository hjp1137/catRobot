/**
 * ProgressManager —— 关卡进度逻辑（纯函数，易测）
 * ------------------------------------------------------------------
 * 封装：解锁判断、星级计算、奖励规则、通关应用、下一关解锁。
 * 所有方法不直接读写存档，而是接收/返回数据，由 GameManager 调用后落盘。
 *
 * 星级规则：
 *   胜利基础 1 星；剩余血量 ≥50% 再 +1；通关用时 ≤60s 再 +1。上限 3 星。失败 0 星。
 *
 * 奖励规则：
 *   首次通关 100% 关卡奖励；重复通关 50%（向下取整）；失败不发。
 */
import { PlayerData, StageProgress, createDefaultStageProgress } from '../data/PlayerData';
import { StageConfig, getNextStageId, CHAPTER1_STAGE_IDS, CHAPTER2_STAGE_IDS, CHAPTER3_STAGE_IDS } from '../data/StageConfig';

/** 第一章末关 id（通关此关 = 第一章完成） */
export const LAST_CHAPTER1_STAGE_ID = CHAPTER1_STAGE_IDS[CHAPTER1_STAGE_IDS.length - 1];
/** 任务8：第二章末关 id（通关此关 = 第二章完成） */
export const LAST_CHAPTER2_STAGE_ID = CHAPTER2_STAGE_IDS[CHAPTER2_STAGE_IDS.length - 1];
/** 任务13：第三章末关 id（通关此关 = 第三章完成） */
export const LAST_CHAPTER3_STAGE_ID = CHAPTER3_STAGE_IDS[CHAPTER3_STAGE_IDS.length - 1];
/** 各章节末关 id → 章节完成 */
export const CHAPTER_LAST_STAGE_IDS = [LAST_CHAPTER1_STAGE_ID, LAST_CHAPTER2_STAGE_ID, LAST_CHAPTER3_STAGE_ID];

/** 星级阈值常量（便于测试与调优） */
export const STAR_HP_RATIO_THRESHOLD = 0.5;
export const STAR_TIME_THRESHOLD_SEC = 60;
export const MAX_STARS = 3;
export const REPEAT_REWARD_RATIO = 0.5;

export interface BattleClearInput {
  stage: StageConfig;
  /** 玩家剩余血量比例 0~1 */
  hpRatio: number;
  /** 战斗用时（秒） */
  elapsedSec: number;
  /** 当前时间戳（秒），用于记录通关时间 */
  nowSec: number;
}

export interface ClearResult {
  /** 本次获得的星级（1~3） */
  stars: number;
  /** 是否首次通关（决定首通奖励） */
  firstClear: boolean;
  /** 实际发放的金币（已按首通/重复计算） */
  gold: number;
  /** 实际发放的零件 */
  parts: number;
  /** 解锁的下一关 id（若已是末关或已解锁则为 null） */
  unlockedNextId: string | null;
  /** 历史最高星级（应用前） */
  previousBestStars: number;
  /** 任务4：是否首次完成第一章（首次通关 1-5 才为 true） */
  chapterCompleted: boolean;
}

/** 该关卡是否已解锁 */
export function isUnlocked(player: PlayerData, stageId: string): boolean {
  return player.unlockedStageIds.indexOf(stageId) >= 0;
}

/** 该关卡是否已通关 */
export function isCleared(player: PlayerData, stageId: string): boolean {
  return !!player.stageProgress[stageId]?.cleared;
}

/** 取关卡进度（不存在返回默认） */
export function getProgress(player: PlayerData, stageId: string): StageProgress {
  return player.stageProgress[stageId] ?? createDefaultStageProgress();
}

/**
 * 计算本次胜利的星级。
 * 失败场景调用方不应调用此函数（失败 0 星由调用方直接处理）。
 */
export function computeStars(hpRatio: number, elapsedSec: number): number {
  let stars = 1; // 胜利基础 1 星
  if (hpRatio >= STAR_HP_RATIO_THRESHOLD) stars += 1;
  if (elapsedSec <= STAR_TIME_THRESHOLD_SEC) stars += 1;
  return Math.max(1, Math.min(MAX_STARS, stars));
}

/** 取奖励：首通 100%，重复 50%（向下取整） */
export function getReward(stage: StageConfig, isFirstClear: boolean): { gold: number; parts: number } {
  if (isFirstClear) {
    return { gold: stage.rewardGold, parts: stage.rewardParts };
  }
  return {
    gold: Math.floor(stage.rewardGold * REPEAT_REWARD_RATIO),
    parts: Math.floor(stage.rewardParts * REPEAT_REWARD_RATIO),
  };
}

/**
 * 应用一次胜利结算到 player（**会修改 player 引用**）。
 * 返回结算详情。调用方负责落盘与发奖到 player.gold/parts（本函数已扣减到 player）。
 */
export function applyClear(player: PlayerData, input: BattleClearInput): ClearResult {
  const { stage, hpRatio, elapsedSec, nowSec } = input;
  const prev = getProgress(player, stage.id);
  const firstClear = !prev.cleared;
  const stars = computeStars(hpRatio, elapsedSec);
  const reward = getReward(stage, firstClear);

  // 更新进度（bestStars 只增不降）
  const newProgress: StageProgress = {
    cleared: true,
    bestStars: Math.max(prev.bestStars, stars),
    clearCount: prev.clearCount + 1,
    firstClearedAt: prev.firstClearedAt ?? nowSec,
    lastClearedAt: nowSec,
  };
  player.stageProgress[stage.id] = newProgress;

  // 发奖
  player.gold += reward.gold;
  player.parts += reward.parts;

  // 解锁下一关
  let unlockedNextId: string | null = null;
  const nextId = getNextStageId(stage.id);
  if (nextId && !isUnlocked(player, nextId)) {
    player.unlockedStageIds.push(nextId);
    unlockedNextId = nextId;
  }

  // 任务4：第一章完成判定 = 首次通关 1-5
  // 任务8：通用章节完成判定 = 首次通关任一章节末关（1-5 或 2-5）
  const chapterCompleted = firstClear && CHAPTER_LAST_STAGE_IDS.includes(stage.id);

  return {
    stars,
    firstClear,
    gold: reward.gold,
    parts: reward.parts,
    unlockedNextId,
    previousBestStars: prev.bestStars,
    chapterCompleted,
  };
}
