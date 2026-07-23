/**
 * 敌人配置表（任务7 扩展第二章敌人）
 * ------------------------------------------------------------------
 * - id：唯一标识，StageConfig.enemies[].enemyId 引用
 * - variant：render 层据此做视觉区分
 * - poisonOnHit：毒液敌人接触玩家时施加毒液（任务7）
 *
 * 未来扩展：新增敌人种类只需在 ENEMY_CONFIGS 登记。
 * @deprecated 任务21 后，新敌人请优先写入 src/content/data/enemies.ts。
 */
import type { EnemyBehaviorType, EnemyVisualConfig } from '../content/models/EnemyTemplate';

export type EnemyVariant = 'normal' | 'elite' | 'boss' | 'beetle' | 'toxic' | 'elite_toxic' | 'chapter2_boss' | 'fire_normal' | 'fire_fast' | 'fire_elite' | 'chapter3_boss';


/** 毒液配置（毒液敌人接触攻击时施加） */
export interface PoisonConfig {
  /** 毒液持续秒数 */
  duration: number;
  /** 每 tick 伤害 */
  damagePerTick: number;
  /** tick 间隔（秒） */
  tickInterval: number;
}

/** 燃烧配置（火焰敌人接触攻击时施加） */
export interface BurnConfig {
  /** 燃烧持续秒数 */
  duration: number;
  /** 每 tick 伤害 */
  damagePerTick: number;
  /** tick 间隔（秒） */
  tickInterval: number;
}

export interface EnemyConfig {
  id: string;
  name: string;
  maxHp: number;
  attack: number;
  /** 接触玩家后造成伤害的间隔（秒） */
  attackInterval: number;
  speed: number;
  /** 碰撞半径 */
  radius: number;
  color: string;
  variant: EnemyVariant;
  /** 任务7：毒液敌人接触玩家时施加毒液 */
  poisonOnHit?: PoisonConfig;
  /** 任务13：火焰敌人接触玩家时施加燃烧 */
  burnOnHit?: BurnConfig;
  /** 任务21：由 EnemyTemplate 适配而来的模板 ID */
  contentTemplateId?: string;
  /** 任务21：模板视觉配置，渲染层优先读取 Art Key */
  visual?: EnemyVisualConfig;
  behaviorType?: EnemyBehaviorType;
}

/** 机械鼠 —— 第一章基础敌人 */
export const MECHANICAL_MOUSE: EnemyConfig = {
  id: 'mouse',
  name: '机械鼠',
  maxHp: 30,
  attack: 3,
  attackInterval: 1.5,
  speed: 90,
  radius: 14,
  color: '#6b7a99',
  variant: 'normal',
};

/** 强化机械鼠 —— 第一章末尾强敌（1-5 第二波）*/
export const ELITE_MOUSE: EnemyConfig = {
  id: 'elite_mouse',
  name: '强化机械鼠',
  maxHp: 80,
  attack: 5,
  attackInterval: 1.8,
  speed: 80,
  radius: 18,
  color: '#3d4760',
  variant: 'elite',
};

/** 机械鼠王 —— 第一章 Boss（1-5 第三波）
 * 任务4：血厚压迫感强，拥有震荡冲击技能（见 BossSkill）。
 * maxHp 220 对 Lv1(120hp) 偏难，升级后可通。 */
export const MECHA_RAT_KING: EnemyConfig = {
  id: 'mecha_rat_king',
  name: '机械鼠王',
  maxHp: 220,
  attack: 7,
  attackInterval: 1.6,
  speed: 55,
  radius: 32,
  color: '#4a2030',
  variant: 'boss',
};

// ---------- 第二章敌人（任务7） ----------
/** 机械甲虫：比机械鼠血厚、移动较慢的硬甲单位 */
export const MECHANICAL_BEETLE: EnemyConfig = {
  id: 'mechanical_beetle',
  name: '机械甲虫',
  maxHp: 45,
  attack: 4,
  attackInterval: 1.4,
  speed: 75,
  radius: 16,
  color: '#5a6b3a',
  variant: 'beetle',
};

/** 毒液机械虫：接触攻击附带毒液持续伤害 */
export const TOXIC_MECHA_BUG: EnemyConfig = {
  id: 'toxic_mecha_bug',
  name: '毒液机械虫',
  maxHp: 55,
  attack: 3,
  attackInterval: 1.6,
  speed: 95,
  radius: 15,
  color: '#3a8a4a',
  variant: 'toxic',
  poisonOnHit: { duration: 3, damagePerTick: 2, tickInterval: 1 },
};

/** 精英毒液机械虫：血量更高，毒液更强 */
export const ELITE_TOXIC_BUG: EnemyConfig = {
  id: 'elite_toxic_bug',
  name: '精英毒液机械虫',
  maxHp: 140,
  attack: 5,
  attackInterval: 1.8,
  speed: 80,
  radius: 22,
  color: '#2a5a3a',
  variant: 'elite_toxic',
  poisonOnHit: { duration: 3, damagePerTick: 3, tickInterval: 1 },
};

/** 污染核心虫后 —— 第二章 Boss（任务8）
 * 血厚，拥有毒液领域/污染喷发技能（见 PollutionBossSkill），接触施加强毒液。 */
export const POLLUTION_CORE_QUEEN: EnemyConfig = {
  id: 'pollution_core_queen',
  name: '污染核心虫后',
  maxHp: 360,
  attack: 8,
  attackInterval: 1.8,
  speed: 18,
  radius: 38,
  color: '#4a2a6a',
  variant: 'chapter2_boss',
  poisonOnHit: { duration: 3, damagePerTick: 4, tickInterval: 1 },
};

// ---------- 第三章火焰敌人（任务13） ----------
/** 熔岩甲虫：普通火焰单位，燃烧持续伤害 */
export const FIRE_BEETLE: EnemyConfig = {
  id: 'fire_beetle',
  name: '熔岩甲虫',
  maxHp: 80,
  attack: 5,
  attackInterval: 1.4,
  speed: 85,
  radius: 16,
  color: '#ff6600',
  variant: 'fire_normal',
  burnOnHit: { duration: 3, damagePerTick: 3, tickInterval: 1 },
};

/** 烈焰行者：高速移动的火焰单位，较脆 */
export const BLAZE_HOUND: EnemyConfig = {
  id: 'blaze_hound',
  name: '烈焰行者',
  maxHp: 60,
  attack: 4,
  attackInterval: 1.2,
  speed: 120,
  radius: 15,
  color: '#ff3333',
  variant: 'fire_fast',
  burnOnHit: { duration: 3, damagePerTick: 2, tickInterval: 1 },
};

/** 熔岩巨怪：行动迟缓但生命值极高、伤害恐怖的精英单位 */
export const MAGMA_GOLEM: EnemyConfig = {
  id: 'magma_golem',
  name: '熔岩巨怪',
  maxHp: 200,
  attack: 8,
  attackInterval: 1.8,
  speed: 70,
  radius: 24,
  color: '#990000',
  variant: 'fire_elite',
  burnOnHit: { duration: 4, damagePerTick: 6, tickInterval: 1 },
};

/** 熔炉守卫 —— 第三章 Boss（3-5 最后一波）
 * 血厚，拥有熔岩咆哮/熔岩裂隙技能（见 FurnaceBossSkill），接触施加燃烧。 */
export const FURNACE_GUARD: EnemyConfig = {
  id: 'furnace_guard',
  name: '熔炉守卫',
  maxHp: 500,
  attack: 10,
  attackInterval: 1.5,
  speed: 40,
  radius: 38,
  color: '#ff3300',
  variant: 'chapter3_boss',
  burnOnHit: { duration: 4, damagePerTick: 4, tickInterval: 1 },
};

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  mouse: MECHANICAL_MOUSE,
  elite_mouse: ELITE_MOUSE,
  mecha_rat_king: MECHA_RAT_KING,
  mechanical_beetle: MECHANICAL_BEETLE,
  toxic_mecha_bug: TOXIC_MECHA_BUG,
  elite_toxic_bug: ELITE_TOXIC_BUG,
  pollution_core_queen: POLLUTION_CORE_QUEEN,
  fire_beetle: FIRE_BEETLE,
  blaze_hound: BLAZE_HOUND,
  magma_golem: MAGMA_GOLEM,
  furnace_guard: FURNACE_GUARD,
};

/** 取敌人配置；不存在时回退普通鼠（防御） */
export function getEnemyConfig(id: string): EnemyConfig {
  return ENEMY_CONFIGS[id] ?? MECHANICAL_MOUSE;
}
