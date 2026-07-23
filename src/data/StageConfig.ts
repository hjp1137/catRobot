/**
 * 关卡配置表（任务3 扩展为多关卡）
 * ------------------------------------------------------------------
 * 配置驱动：BattleManager 根据 stage.enemies[] 生成不同类型与数量的敌人。
 * 解锁链通过 unlockAfter 表达：通关 unlockAfter 指向的关卡后解锁本关。
 *
 * 兼容旧导出：STAGE_1_1 / STAGE_CONFIGS / FIRST_STAGE_ID 保留，旧测试不破坏。
 *
 * @deprecated 任务21 后，新内容请优先写入 src/content/data/stages.ts。
 */
import { createLegacyStageConfigFromContent } from '../content/adapters/LegacyStageConfigAdapter';

export interface StageEnemyConfig {
  /** 引用 EnemyConfig.id */
  enemyId: string;
  /** 任务21：新内容主数据源引用 */
  enemyTemplateId?: string;
  count: number;
  /** 任务13：出生组，用于形成多方向包围感 */
  spawnGroup?: 'around_player' | 'left_right' | 'top' | 'default';
  /** 任务21：模板基础数值上的运行时倍率 */
  levelMultiplier?: number;
}

/** 任务4：波次配置 */
export interface StageWaveConfig {
  id: string;
  name?: string;
  /** 此波敌人组成 */
  enemies: StageEnemyConfig[];
  /** 上一波清空后到本波生成的延迟（秒） */
  spawnDelay?: number;
  /** 波次切换提示文字 */
  message?: string;
}

export interface StageConfig {
  id: string;
  chapterId: string;
  name: string;
  subtitle?: string;
  /** 推荐战力（仅提示，不强制） */
  recommendedPower: number;
  /** 单波敌人组成（与 waves 二选一；无 waves 时视为单波） */
  enemies: StageEnemyConfig[];
  /** 任务4：多波次配置（Boss 关用） */
  waves?: StageWaveConfig[];
  rewardGold: number;
  rewardParts: number;
  /** 通关此关卡后解锁本关；首关无此字段 */
  unlockAfter?: string;
  /** 任务4：是否 Boss 关 */
  isBossStage?: boolean;
  /** 敌人生成区域边距（兼容旧字段） */
  spawnMargin: number;
  /** 任务21：由 StageDefinition 适配而来 */
  contentStageId?: string;
  backgroundThemeId?: string;
  heroVisualTemplateId?: string;
}

/** 第一章：废弃训练场 —— 5 关 */
export const STAGE_1_1: StageConfig = createLegacyStageConfigFromContent('stage_battle_1_1', {
  id: '1-1', chapterId: 'chapter1', name: '训练场启动', subtitle: '初次出击',
  recommendedPower: 100,
  rewardGold: 50, rewardParts: 5, spawnMargin: 60,
});

export const STAGE_1_2: StageConfig = {
  id: '1-2', chapterId: 'chapter1', name: '锈蚀通道', subtitle: '深入腹地',
  recommendedPower: 130, unlockAfter: '1-1',
  enemies: [{ enemyId: 'mouse', count: 5 }],
  rewardGold: 70, rewardParts: 7, spawnMargin: 60,
};

export const STAGE_1_3: StageConfig = {
  id: '1-3', chapterId: 'chapter1', name: '废料堆伏击', subtitle: '小心包围',
  recommendedPower: 160, unlockAfter: '1-2',
  enemies: [{ enemyId: 'mouse', count: 6 }],
  rewardGold: 90, rewardParts: 9, spawnMargin: 60,
};

export const STAGE_1_4: StageConfig = {
  id: '1-4', chapterId: 'chapter1', name: '能源仓警报', subtitle: '鼠群狂涌',
  recommendedPower: 200, unlockAfter: '1-3',
  enemies: [{ enemyId: 'mouse', count: 7 }],
  rewardGold: 120, rewardParts: 12, spawnMargin: 60,
};

export const STAGE_1_5: StageConfig = {
  id: '1-5', chapterId: 'chapter1', name: '鼠王前哨', subtitle: '机械鼠王正在训练场核心区等待挑战者',
  recommendedPower: 300, unlockAfter: '1-4',
  isBossStage: true,
  // 兼容字段：单波视图（实际走 waves）
  enemies: [],
  // 任务4：三波次推进，最终鼠王 Boss 登场
  waves: [
    { id: '1-5-w1', name: '前哨巡逻', message: '前哨巡逻鼠群出现！', enemies: [{ enemyId: 'mouse', count: 4 }], spawnDelay: 0 },
    { id: '1-5-w2', name: '强化守卫', message: '强化机械鼠加入战斗！', enemies: [{ enemyId: 'elite_mouse', count: 2 }], spawnDelay: 1.2 },
    { id: '1-5-w3', name: '鼠王登场', message: '机械鼠王登场！', enemies: [{ enemyId: 'mecha_rat_king', count: 1 }], spawnDelay: 1.5 },
  ],
  rewardGold: 220, rewardParts: 22, spawnMargin: 60,
};

// ---------- 第二章：霓虹下水道（任务7） ----------
export const STAGE_2_1: StageConfig = {
  id: '2-1', chapterId: 'chapter2', name: '下水道入口', subtitle: '霓虹管道深处传来异响',
  recommendedPower: 320, unlockAfter: '1-5',
  enemies: [{ enemyId: 'mouse', count: 5 }, { enemyId: 'mechanical_beetle', count: 2 }],
  rewardGold: 240, rewardParts: 24, spawnMargin: 60,
};

export const STAGE_2_2: StageConfig = {
  id: '2-2', chapterId: 'chapter2', name: '霓虹排水渠', subtitle: '污水反光中潜伏着甲虫群',
  recommendedPower: 380, unlockAfter: '2-1',
  enemies: [{ enemyId: 'mechanical_beetle', count: 5 }, { enemyId: 'elite_mouse', count: 2 }],
  rewardGold: 300, rewardParts: 30, spawnMargin: 60,
};

export const STAGE_2_3: StageConfig = {
  id: '2-3', chapterId: 'chapter2', name: '废液处理池', subtitle: '污染废液正在制造新的机械虫群',
  recommendedPower: 450, unlockAfter: '2-2',
  enemies: [],
  waves: [
    { id: '2-3-w1', name: '机械虫群', message: '机械甲虫从管道中涌出！', enemies: [{ enemyId: 'mechanical_beetle', count: 3 }], spawnDelay: 0 },
    { id: '2-3-w2', name: '毒液污染', message: '毒液机械虫出现！小心持续伤害！', enemies: [{ enemyId: 'toxic_mecha_bug', count: 4 }], spawnDelay: 1.2 },
  ],
  rewardGold: 360, rewardParts: 36, spawnMargin: 60,
};

export const STAGE_2_4: StageConfig = {
  id: '2-4', chapterId: 'chapter2', name: '失控泵站', subtitle: '毒液虫群正在侵蚀泵站核心',
  recommendedPower: 530, unlockAfter: '2-3',
  enemies: [{ enemyId: 'elite_mouse', count: 3 }, { enemyId: 'toxic_mecha_bug', count: 5 }],
  rewardGold: 450, rewardParts: 45, spawnMargin: 60,
};

export const STAGE_2_5: StageConfig = {
  id: '2-5', chapterId: 'chapter2', name: '污染核心前哨', subtitle: '星核污染正在孕育新的机械虫后',
  recommendedPower: 700, unlockAfter: '2-4',
  isBossStage: true, // 任务8：升级为第二章 Boss 关
  enemies: [],
  // 任务8：四波次推进，最终污染核心虫后 Boss 登场
  waves: [
    { id: '2-5-w1', name: '污染虫群', message: '机械甲虫群封锁通道！', enemies: [{ enemyId: 'mechanical_beetle', count: 4 }], spawnDelay: 0 },
    { id: '2-5-w2', name: '毒液扩散', message: '毒液机械虫涌入战场！', enemies: [{ enemyId: 'toxic_mecha_bug', count: 4 }], spawnDelay: 1.2 },
    { id: '2-5-w3', name: '精英护卫', message: '精英毒液机械虫护卫登场！', enemies: [{ enemyId: 'elite_toxic_bug', count: 1 }, { enemyId: 'toxic_mecha_bug', count: 2 }], spawnDelay: 1.5 },
    { id: '2-5-w4', name: '虫后登场', message: '污染核心虫后登场！', enemies: [{ enemyId: 'pollution_core_queen', count: 1 }], spawnDelay: 1.8 },
  ],
  rewardGold: 720, rewardParts: 72, spawnMargin: 60,
};

// ---------- 第三章：熔火工厂（任务13） ----------
export const STAGE_3_1: StageConfig = {
  id: '3-1', chapterId: 'chapter3', name: '熔工厂大门', subtitle: '这里是红莲火雨中的齿轮炼狱',
  recommendedPower: 800, unlockAfter: '2-5',
  enemies: [{ enemyId: 'fire_beetle', count: 5 }],
  rewardGold: 800, rewardParts: 80, spawnMargin: 60,
};

export const STAGE_3_2: StageConfig = {
  id: '3-2', chapterId: 'chapter3', name: '灼热走廊', subtitle: '热浪滚滚，小心里面的熔岩甲虫和烈焰行者',
  recommendedPower: 950, unlockAfter: '3-1',
  enemies: [{ enemyId: 'fire_beetle', count: 4 }, { enemyId: 'blaze_hound', count: 3 }],
  rewardGold: 950, rewardParts: 95, spawnMargin: 60,
};

export const STAGE_3_3: StageConfig = {
  id: '3-3', chapterId: 'chapter3', name: '废渣炼炉', subtitle: '小心被巨怪和行者包围',
  recommendedPower: 1100, unlockAfter: '3-2',
  enemies: [],
  waves: [
    { id: '3-3-w1', name: '前哨突袭', message: '烈焰行者袭来！', enemies: [{ enemyId: 'blaze_hound', count: 4 }], spawnDelay: 0 },
    { id: '3-3-w2', name: '巨怪夹击', message: '熔岩巨怪加入战斗！', enemies: [{ enemyId: 'magma_golem', count: 2 }], spawnDelay: 1.2 },
  ],
  rewardGold: 1100, rewardParts: 110, spawnMargin: 60,
};

export const STAGE_3_4: StageConfig = {
  id: '3-4', chapterId: 'chapter3', name: '高温调度室', subtitle: '废铁堆里的热量高得不正常',
  recommendedPower: 1300, unlockAfter: '3-3',
  enemies: [{ enemyId: 'fire_beetle', count: 5 }, { enemyId: 'magma_golem', count: 3 }],
  rewardGold: 1300, rewardParts: 130, spawnMargin: 60,
};

export const STAGE_3_5: StageConfig = {
  id: '3-5', chapterId: 'chapter3', name: '熔火核心前哨', subtitle: '熔炉守卫正在核心深处等待挑战者',
  recommendedPower: 1500, unlockAfter: '3-4',
  isBossStage: true,
  enemies: [],
  waves: [
    { id: '3-5-w1', name: '前哨守卫', message: '熔岩怪和甲虫袭来！', enemies: [{ enemyId: 'fire_beetle', count: 4 }], spawnDelay: 0 },
    { id: '3-5-w2', name: '行者突袭', message: '烈焰行者从四面八方涌来！', enemies: [{ enemyId: 'blaze_hound', count: 6 }], spawnDelay: 1.2 },
    { id: '3-5-w3', name: '精英汇聚', message: '熔岩巨怪前哨主力！', enemies: [{ enemyId: 'magma_golem', count: 3 }, { enemyId: 'blaze_hound', count: 2 }], spawnDelay: 1.5 },
    { id: '3-5-w4', name: '熔炉守卫登场', message: '熔炉守卫登场！', enemies: [{ enemyId: 'furnace_guard', count: 1 }], spawnDelay: 1.8 },
  ],
  rewardGold: 1800, rewardParts: 180, spawnMargin: 60,
};

/** 关卡注册表（按顺序） */
export const STAGE_CONFIGS: Record<string, StageConfig> = {
  '1-1': STAGE_1_1, '1-2': STAGE_1_2, '1-3': STAGE_1_3, '1-4': STAGE_1_4, '1-5': STAGE_1_5,
  '2-1': STAGE_2_1, '2-2': STAGE_2_2, '2-3': STAGE_2_3, '2-4': STAGE_2_4, '2-5': STAGE_2_5,
  '3-1': STAGE_3_1, '3-2': STAGE_3_2, '3-3': STAGE_3_3, '3-4': STAGE_3_4, '3-5': STAGE_3_5,
};

/** 第一章关卡的有序 id 列表 */
export const CHAPTER1_STAGE_IDS = ['1-1', '1-2', '1-3', '1-4', '1-5'];
/** 第二章关卡的有序 id 列表（任务7） */
export const CHAPTER2_STAGE_IDS = ['2-1', '2-2', '2-3', '2-4', '2-5'];
/** 第三章关卡的有序 id 列表（任务13） */
export const CHAPTER3_STAGE_IDS = ['3-1', '3-2', '3-3', '3-4', '3-5'];
/** 全章节关卡有序列表（跨章节下一关推导用） */
export const ALL_STAGE_ORDER = [...CHAPTER1_STAGE_IDS, ...CHAPTER2_STAGE_IDS, ...CHAPTER3_STAGE_IDS];

/** 默认入口关卡 */
export const FIRST_STAGE_ID = '1-1';

// ---------- 工具函数 ----------
export function getStageById(id: string): StageConfig | undefined {
  return STAGE_CONFIGS[id];
}

export function getAllStages(): StageConfig[] {
  return Object.values(STAGE_CONFIGS);
}

export function getChapterStages(chapterId: string): StageConfig[] {
  return getAllStages().filter(s => s.chapterId === chapterId);
}

export function getFirstStage(): StageConfig {
  return STAGE_CONFIGS[CHAPTER1_STAGE_IDS[0]];
}

/** 下一关 id（任务7：跨章节，1-5→2-1）；已是末关返回 null */
export function getNextStageId(stageId: string): string | null {
  const idx = ALL_STAGE_ORDER.indexOf(stageId);
  if (idx < 0 || idx >= ALL_STAGE_ORDER.length - 1) return null;
  return ALL_STAGE_ORDER[idx + 1];
}

/** 关卡总敌人数（用于 HUD 显示 X/Y；含 waves） */
export function getStageTotalEnemies(stage: StageConfig): number {
  const waves = stage.waves && stage.waves.length > 0
    ? stage.waves
    : [{ enemies: stage.enemies } as StageWaveConfig];
  return waves.reduce((sum, w) => sum + w.enemies.reduce((s, e) => s + e.count, 0), 0);
}
