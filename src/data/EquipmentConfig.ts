/**
 * 装备配置（任务9）
 * ------------------------------------------------------------------
 * 3 槽位（weapon/armor/core）× 3 品质（common/rare/epic）= 9 件装备。
 * 装备属性通过配置读取，战斗逻辑不硬编码。
 */
export type EquipmentSlot = 'weapon' | 'armor' | 'core';
export type EquipmentRarity = 'common' | 'rare' | 'epic';

/** 装备属性加成（百分比类用 0~1 小数） */
export interface EquipmentStats {
  hp?: number;
  attack?: number;
  /** 技能伤害加成 0~1 */
  skillDamageBonus?: number;
  /** 减伤 0~1 */
  damageReduction?: number;
  /** 毒液抗性 0~1 */
  poisonResist?: number;
  /** 火焰抗性 0~1 */
  fireResist?: number;
  /** 冷却缩减 0~1 */
  cooldownReduction?: number;
}

export interface EquipmentBaseConfig {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  description: string;
  baseStats: EquipmentStats;
  /** 装备战力贡献 */
  power: number;
  /** 装备关联的套装 ID（可选） */
  setId?: string;
}

/** 套装配置定义 */
export interface EquipmentSetStats {
  hp?: number;
  attack?: number;
  skillDamageBonus?: number;
  damageReduction?: number;
  poisonResist?: number;
  fireResist?: number;
  cooldownReduction?: number;
}

export interface EquipmentSetConfig {
  id: string;
  name: string;
  stats2: EquipmentSetStats; // 2件套效果
  stats3: EquipmentSetStats; // 3件套效果
  power2: number; // 2件套战力
  power3: number; // 3件套战力
}

export const EQUIPMENT_SETS: Record<string, EquipmentSetConfig> = {
  lava_suit: {
    id: 'lava_suit',
    name: '熔岩套装',
    stats2: { fireResist: 0.15, attack: 5 },
    stats3: { skillDamageBonus: 0.10, cooldownReduction: 0.05 },
    power2: 30,
    power3: 50,
  },
};


/** 品质 → 颜色（UI 用） */
export const RARITY_COLOR: Record<EquipmentRarity, string> = {
  common: '#9aa0a6',
  rare: '#4fd1e0',
  epic: '#c060e0',
};

/** 品质 → 中文名 */
export const RARITY_NAME: Record<EquipmentRarity, string> = {
  common: '普通',
  rare: '优秀',
  epic: '史诗',
};

/** 槽位 → 中文名 */
export const SLOT_NAME: Record<EquipmentSlot, string> = {
  weapon: '武器',
  armor: '装甲',
  core: '核心',
};

// ---------- 武器 ----------
const RUSTY_CLAW: EquipmentBaseConfig = {
  id: 'rusty_claw', name: '锈蚀猫爪炮', slot: 'weapon', rarity: 'common',
  description: '生锈的猫爪型炮口，聊胜于无。', baseStats: { attack: 5 }, power: 15,
};
const NEON_BLASTER: EquipmentBaseConfig = {
  id: 'neon_blaster', name: '霓虹喵能炮', slot: 'weapon', rarity: 'rare',
  description: '霓虹能量加持的喵能炮。', baseStats: { attack: 10, skillDamageBonus: 0.05 }, power: 40,
};
const STARCORE_CANNON: EquipmentBaseConfig = {
  id: 'starcore_cannon', name: '星核重炮', slot: 'weapon', rarity: 'epic',
  description: '以星核碎片驱动的重型炮。', baseStats: { attack: 18, skillDamageBonus: 0.12 }, power: 90,
};

// ---------- 装甲 ----------
const PATCHED_ARMOR: EquipmentBaseConfig = {
  id: 'patched_armor', name: '拼装重甲', slot: 'armor', rarity: 'common',
  description: '东拼西凑的装甲板。', baseStats: { hp: 30 }, power: 15,
};
const ALLOY_ARMOR: EquipmentBaseConfig = {
  id: 'alloy_armor', name: '合金猫甲', slot: 'armor', rarity: 'rare',
  description: '轻量合金制成的猫甲。', baseStats: { hp: 60, damageReduction: 0.03 }, power: 40,
};
const SEWER_GUARD: EquipmentBaseConfig = {
  id: 'sewer_guard', name: '下水道防护甲', slot: 'armor', rarity: 'epic',
  description: '针对毒液污染强化的防护甲。', baseStats: { hp: 90, poisonResist: 0.2 }, power: 90,
};

// ---------- 核心 ----------
const SMALL_CORE: EquipmentBaseConfig = {
  id: 'small_core', name: '小型能量核心', slot: 'core', rarity: 'common',
  description: '基础能量核心。', baseStats: { cooldownReduction: 0.02 }, power: 20,
};
const NEON_CORE: EquipmentBaseConfig = {
  id: 'neon_core', name: '霓虹能量核心', slot: 'core', rarity: 'rare',
  description: '霓虹能量稳定输出的核心。', baseStats: { cooldownReduction: 0.05 }, power: 45,
};
const STARCORE_FRAGMENT: EquipmentBaseConfig = {
  id: 'starcore_fragment', name: '星核碎片核心', slot: 'core', rarity: 'epic',
  description: '蕴含星核力量的碎片核心。', baseStats: { cooldownReduction: 0.08, skillDamageBonus: 0.08 }, power: 95,
};

// ---------- 熔岩套装 (第三章装备) ----------
const LAVA_CANNON: EquipmentBaseConfig = {
  id: 'lava_cannon', name: '熔岩重炮', slot: 'weapon', rarity: 'epic',
  description: '以熔岩核心能量激发的灼热重炮。', baseStats: { attack: 22, fireResist: 0.05 }, power: 100, setId: 'lava_suit',
};
const LAVA_ARMOR: EquipmentBaseConfig = {
  id: 'lava_armor', name: '熔岩防护甲', slot: 'armor', rarity: 'epic',
  description: '由高温硬化熔岩板拼装的超强防护甲。', baseStats: { hp: 110, fireResist: 0.10 }, power: 100, setId: 'lava_suit',
};
const LAVA_CORE: EquipmentBaseConfig = {
  id: 'lava_core', name: '熔岩能量核心', slot: 'core', rarity: 'epic',
  description: '熔炉守卫同款的聚能核心。', baseStats: { cooldownReduction: 0.06, fireResist: 0.05 }, power: 105, setId: 'lava_suit',
};

export const EQUIPMENT_CONFIGS: Record<string, EquipmentBaseConfig> = {
  rusty_claw: RUSTY_CLAW, neon_blaster: NEON_BLASTER, starcore_cannon: STARCORE_CANNON,
  patched_armor: PATCHED_ARMOR, alloy_armor: ALLOY_ARMOR, sewer_guard: SEWER_GUARD,
  small_core: SMALL_CORE, neon_core: NEON_CORE, starcore_fragment: STARCORE_FRAGMENT,
  lava_cannon: LAVA_CANNON, lava_armor: LAVA_ARMOR, lava_core: LAVA_CORE,
};


export function getEquipmentConfig(id: string): EquipmentBaseConfig | undefined {
  return EQUIPMENT_CONFIGS[id];
}

/** 按槽位 + 品质筛选装备 id（掉落用） */
export function getEquipmentIdsBySlot(slot: EquipmentSlot): string[] {
  return Object.values(EQUIPMENT_CONFIGS).filter(e => e.slot === slot).map(e => e.id);
}
