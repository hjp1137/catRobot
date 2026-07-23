/**
 * 符文配置（任务9 符文 0.1）
 * ------------------------------------------------------------------
 * 轻量符文：3 种，影响技能/护盾/毒液抗性。
 * 规则：最多装备 2 个；同 configId 允许重复装备（效果叠加），见成果说明。
 */
import { EquipmentRarity } from './EquipmentConfig';

export interface RuneEffect {
  /** 关联技能 id（如 meow_cannon） */
  skillId?: string;
  /** 技能伤害加成 0~1 */
  skillDamageBonus?: number;
  /** 护盾持续时间加成（秒） */
  shieldDurationBonus?: number;
  /** 毒液抗性 0~1 */
  poisonResist?: number;
  /** 火焰抗性 0~1 */
  fireResist?: number;
}

export interface RuneConfig {
  id: string;
  name: string;
  rarity: EquipmentRarity;
  description: string;
  effect: RuneEffect;
  /** 符文战力贡献 */
  power: number;
}

export interface RuneInstance {
  uid: string;
  configId: string;
  obtainedAt: number;
}

const CANNON_RUNE_1: RuneConfig = {
  id: 'cannon_rune_1', name: '炮击符文', rarity: 'common',
  description: '喵能炮伤害 +5%', effect: { skillId: 'meow_cannon', skillDamageBonus: 0.05 }, power: 10,
};
const SHIELD_RUNE_1: RuneConfig = {
  id: 'shield_rune_1', name: '护盾符文', rarity: 'common',
  description: '重甲护盾持续 +0.5s', effect: { shieldDurationBonus: 0.5 }, power: 10,
};
const POISON_GUARD_RUNE: RuneConfig = {
  id: 'poison_guard_rune', name: '净化符文', rarity: 'rare',
  description: '毒液伤害 -15%', effect: { poisonResist: 0.15 }, power: 25,
};
const FIRE_GUARD_RUNE: RuneConfig = {
  id: 'fire_guard_rune', name: '避火符文', rarity: 'rare',
  description: '火焰伤害 -15%', effect: { fireResist: 0.15 }, power: 25,
};

export const RUNE_CONFIGS: Record<string, RuneConfig> = {
  cannon_rune_1: CANNON_RUNE_1,
  shield_rune_1: SHIELD_RUNE_1,
  poison_guard_rune: POISON_GUARD_RUNE,
  fire_guard_rune: FIRE_GUARD_RUNE,
};

export const MAX_EQUIPPED_RUNES = 2;

export function getRuneConfig(id: string): RuneConfig | undefined {
  return RUNE_CONFIGS[id];
}

export function generateRuneUid(): string {
  return 'rune_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);
}
