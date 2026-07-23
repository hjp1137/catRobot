/**
 * 玩家持久化数据（任务3 扩展进度系统）
 * ------------------------------------------------------------------
 * 设计原则：
 *  - 只存「会变化且不可由配置派生」的字段
 *  - 关卡进度独立存于 stageProgress / unlockedStageIds
 *  - maxHp/attack/power 仍由 MechaConfig + level 实时派生
 *
 * 旧存档（无进度字段）由 SaveManager.migrate 自动补默认值。
 */
export interface StageProgress {
  /** 是否通关过 */
  cleared: boolean;
  /** 历史最高星级（1~3） */
  bestStars: number;
  /** 通关次数 */
  clearCount: number;
  /** 首次通关时间戳（秒） */
  firstClearedAt?: number;
  /** 最近一次通关时间戳（秒） */
  lastClearedAt?: number;
  /** 最佳通关时间（秒，越低越好） */
  bestClearTimeSec?: number;
  /** 历史最高剩余生命比例 */
  bestHealthRatio?: number;
  firstClearRewardClaimed?: boolean;
  firstThreeStarRewardClaimed?: boolean;
  claimedObjectiveRewardIds?: string[];
  lastAttemptAt?: number;
  lastResult?: 'victory' | 'failure';
  lastFailureReason?: string;
}

export interface TutorialProgressData {
  schemaVersion: 1;
  startedFlowIds: string[];
  currentFlowId?: string;
  currentStepId?: string;
  completedStepIds: string[];
  completedFlowIds: string[];
  skippedFlowIds: string[];
  unlockedFeatureIds: string[];
  pendingUnlockNoticeIds: string[];
  updatedAt: number;
  recoveryCount: number;
}

export interface PlayerData {
  /** 存档版本 */
  version: number;
  /** 当前装备机甲 id */
  mechaId: string;
  /** 机甲等级 */
  level: number;
  /** 金币 */
  gold: number;
  /** 机甲零件 */
  parts: number;
  /** 关卡进度：stageId → StageProgress */
  stageProgress: Record<string, StageProgress>;
  /** 已解锁关卡 id 列表 */
  unlockedStageIds: string[];
  /** 当前选中的关卡（进入战斗用） */
  selectedStageId?: string;
  /** 任务6：已解锁技能 id 列表 */
  unlockedSkillIds: string[];
  /** 任务6：技能等级 skillId → level */
  skillLevels: Record<string, number>;
  /** 任务9：装备背包与穿戴 */
  equipmentInventory: import('./EquipmentData').EquipmentInventory;
  /** 任务9：符文背包 */
  runeInventory: import('./RuneConfig').RuneInstance[];
  /** 任务9：已装备符文 uid 列表（最多 2） */
  equippedRunes: string[];
  /** 任务10：强化材料背包 */
  materials: {
    enhanceStone: number;
  };
  /** 任务17：新手引导是否已完成 */
  tutorialFinished?: boolean;
  /** 任务29：正式Tutorial运行进度，沿用同一玩家存档。 */
  tutorial: TutorialProgressData;
  /** 任务27：已结算运行ID，保证同一局奖励最多一次 */
  settledStageRunIds: string[];
  /** 任务28：沿用本存档保存战役定位、解锁表现与章节汇总 */
  campaignProgress: import('../content/models/Campaign').CampaignProgressData;
}

export const SAVE_KEY = 'mecha_save_v1';
export const SAVE_VERSION = 4;

/** 单关卡默认进度 */
export function createDefaultStageProgress(): StageProgress {
  return { cleared: false, bestStars: 0, clearCount: 0 };
}

/** 全新初始存档：默认解锁 1-1，技能默认全解锁等级1 */
export function createDefaultPlayerData(): PlayerData {
  return {
    version: SAVE_VERSION,
    mechaId: 'orange_cat',
    level: 1,
    gold: 0,
    parts: 0,
    stageProgress: {},
    unlockedStageIds: ['1-1'],
    unlockedSkillIds: ['meow_cannon', 'heavy_shield'],
    skillLevels: { meow_cannon: 1, heavy_shield: 1 },
    equipmentInventory: { items: [], equipped: {} },
    runeInventory: [],
    equippedRunes: [],
    materials: {
      enhanceStone: 0,
    },
    tutorialFinished: false,
    tutorial: createDefaultTutorialProgress(),
    settledStageRunIds: [],
    campaignProgress: {
      newlyUnlockedNodeIds: [], playedUnlockNodeIds: [], completedChapterIds: [],
      chapterStars: {}, claimedChapterRewardIds: [],
    },
  };
}

export function createDefaultTutorialProgress(): TutorialProgressData {
  return {
    schemaVersion: 1, startedFlowIds: [], currentFlowId: undefined, currentStepId: undefined,
    completedStepIds: [], completedFlowIds: [], skippedFlowIds: [], unlockedFeatureIds: [],
    pendingUnlockNoticeIds: [], updatedAt: 0, recoveryCount: 0,
  };
}
