/**
 * 玩家技能配置（任务6 重构为等级成长）
 * ------------------------------------------------------------------
 * 每个技能有 maxLevel 个等级的 effects（伤害/冷却/持续/减伤/范围）
 * 与 upgradeCosts（升到各级的消耗）。战斗效果由 getSkillEffect(id, level) 读取。
 *
 * 兼容：任务5 单值字段（damage/cooldown 等）移除，改用 effects[level-1]。
 */
export type SkillType = 'damage' | 'shield';

/** 单个等级的具体效果数值 */
export interface SkillLevelEffect {
  level: number;
  damage?: number;
  cooldown?: number;
  duration?: number;
  damageReduction?: number;
  range?: number;
  halfAngle?: number;
}

/** 升到 level 级所需的资源消耗 */
export interface SkillUpgradeCost {
  level: number;
  gold: number;
  parts: number;
}

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  maxLevel: number;
  /** 各等级效果（索引 0 = 等级 1） */
  effects: SkillLevelEffect[];
  /** 升到各级消耗（索引 0 = 升到等级 2 的消耗） */
  upgradeCosts: SkillUpgradeCost[];
}

/** 喵能炮：前方扇形范围伤害，5 级成长 */
export const MEOW_CANNON: SkillConfig = {
  id: 'meow_cannon',
  name: '喵能炮',
  description: '向前方释放能量炮，对扇形范围内敌人造成伤害',
  type: 'damage',
  maxLevel: 5,
  effects: [
    { level: 1, damage: 35, range: 120, cooldown: 6.0, halfAngle: Math.PI / 4 },
    { level: 2, damage: 45, range: 125, cooldown: 6.0, halfAngle: Math.PI / 4 },
    { level: 3, damage: 55, range: 130, cooldown: 5.5, halfAngle: Math.PI / 4 },
    { level: 4, damage: 70, range: 135, cooldown: 5.5, halfAngle: Math.PI / 4 },
    { level: 5, damage: 90, range: 140, cooldown: 5.0, halfAngle: Math.PI / 4 },
  ],
  upgradeCosts: [
    { level: 2, gold: 100, parts: 10 },
    { level: 3, gold: 180, parts: 18 },
    { level: 4, gold: 300, parts: 30 },
    { level: 5, gold: 500, parts: 50 },
  ],
};

/** 重甲护盾：持续减伤，5 级成长 */
export const HEAVY_SHIELD: SkillConfig = {
  id: 'heavy_shield',
  name: '重甲护盾',
  description: '展开护盾，持续期间受到伤害降低',
  type: 'shield',
  maxLevel: 5,
  effects: [
    { level: 1, duration: 4.0, damageReduction: 0.5, cooldown: 8.0 },
    { level: 2, duration: 4.2, damageReduction: 0.5, cooldown: 8.0 },
    { level: 3, duration: 4.5, damageReduction: 0.55, cooldown: 7.5 },
    { level: 4, duration: 4.8, damageReduction: 0.55, cooldown: 7.0 },
    { level: 5, duration: 5.0, damageReduction: 0.6, cooldown: 6.8 },
  ],
  upgradeCosts: [
    { level: 2, gold: 120, parts: 12 },
    { level: 3, gold: 220, parts: 22 },
    { level: 4, gold: 360, parts: 36 },
    { level: 5, gold: 560, parts: 56 },
  ],
};

export const SKILL_CONFIGS: Record<string, SkillConfig> = {
  meow_cannon: MEOW_CANNON,
  heavy_shield: HEAVY_SHIELD,
};

/** 默认解锁的技能 id */
export const DEFAULT_SKILL_IDS = ['meow_cannon', 'heavy_shield'];

export function getSkillConfig(id: string): SkillConfig | undefined {
  return SKILL_CONFIGS[id];
}

/**
 * 取技能在某等级的效果（level 钳制到 1..maxLevel）。
 * 任务6：战斗效果统一通过此函数读取，不再用单值字段。
 */
export function getSkillEffect(id: string, level: number): SkillLevelEffect | undefined {
  const cfg = SKILL_CONFIGS[id];
  if (!cfg) return undefined;
  const lv = Math.max(1, Math.min(cfg.maxLevel, Math.floor(level)));
  return cfg.effects[lv - 1];
}

/** 取升到 currentLevel+1 的消耗；满级返回 null */
export function getSkillUpgradeCost(id: string, currentLevel: number): SkillUpgradeCost | null {
  const cfg = SKILL_CONFIGS[id];
  if (!cfg) return null;
  if (currentLevel >= cfg.maxLevel) return null;
  return cfg.upgradeCosts.find(c => c.level === currentLevel + 1) ?? null;
}
