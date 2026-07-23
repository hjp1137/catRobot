/**
 * 章节配置（任务7 扩展第二章）
 * ------------------------------------------------------------------
 * 章节解锁由 unlockAfterStageId 的 stageProgress.cleared 推导（不新增存档字段）。
 * 第一章默认解锁；第二章通关 1-5 后解锁。
 *
 * 兼容：沿用任务3 的 chapter1 id（StageConfig.chapterId='chapter1'）。
 */
import { PlayerData } from '../data/PlayerData';

export type ChapterTheme = 'training' | 'sewer' | 'factory';

export interface ChapterConfig {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  theme: ChapterTheme;
  /** 通关此关卡后解锁本章节；无则默认解锁 */
  unlockAfterStageId?: string;
  stageIds: string[];
}

/** 第一章：废弃训练场 */
export const CHAPTER_1: ChapterConfig = {
  id: 'chapter1',
  name: '第一章：废弃训练场',
  subtitle: '机甲驾驶员的第一次出击',
  description: '清理失控的机械鼠群，击败机械鼠王。',
  theme: 'training',
  stageIds: ['1-1', '1-2', '1-3', '1-4', '1-5'],
};

/** 第二章：霓虹下水道（任务7 新增） */
export const CHAPTER_2: ChapterConfig = {
  id: 'chapter2',
  name: '第二章：霓虹下水道',
  subtitle: '深入城市地下，寻找污染源头',
  description: '机械鼠王被击败后，霓虹下水道涌出新型机械生物。',
  theme: 'sewer',
  unlockAfterStageId: '1-5',
  stageIds: ['2-1', '2-2', '2-3', '2-4', '2-5'],
};

/** 第三章：熔火工厂（任务13 新增） */
export const CHAPTER_3: ChapterConfig = {
  id: 'chapter3',
  name: '第三章：熔火工厂',
  subtitle: '红莲火雨中的齿轮炼狱',
  description: '这里是熔火工厂，满地岩浆与极高温度的火焰敌人。',
  theme: 'factory',
  unlockAfterStageId: '2-5',
  stageIds: ['3-1', '3-2', '3-3', '3-4', '3-5'],
};

export const CHAPTER_CONFIGS: Record<string, ChapterConfig> = {
  chapter1: CHAPTER_1,
  chapter2: CHAPTER_2,
  chapter3: CHAPTER_3,
};

export function getAllChapters(): ChapterConfig[] {
  return [CHAPTER_1, CHAPTER_2, CHAPTER_3];
}

export function getChapterById(id: string): ChapterConfig | undefined {
  return CHAPTER_CONFIGS[id];
}

/** 章节是否解锁：无 unlockAfterStageId 恒解锁；否则需该关已 cleared */
export function isChapterUnlocked(player: PlayerData, chapterId: string): boolean {
  const ch = CHAPTER_CONFIGS[chapterId];
  if (!ch) return false;
  if (!ch.unlockAfterStageId) return true;
  return !!player.stageProgress[ch.unlockAfterStageId]?.cleared;
}

/** 已解锁章节列表 */
export function getUnlockedChapters(player: PlayerData): ChapterConfig[] {
  return getAllChapters().filter(c => isChapterUnlocked(player, c.id));
}

/** 第一章（默认入口） */
export const FIRST_CHAPTER_ID = 'chapter1';
