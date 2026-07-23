/**
 * 装备/符文掉落（任务9）
 * ------------------------------------------------------------------
 * 关卡胜利后按 StageLootConfig 概率掉落装备/符文。
 * 使用注入的 random（0~1）保证可测。
 */
import { EquipmentRarity } from './EquipmentConfig';
import { EQUIPMENT_CONFIGS } from './EquipmentConfig';
import { RUNE_CONFIGS } from './RuneConfig';

export interface StageLootConfig {
  stageId: string;
  /** 装备掉落概率 0~1 */
  equipmentDropRate: number;
  /** 各品质权重（按权重随机选品质） */
  rarityWeights: Partial<Record<EquipmentRarity, number>>;
  /** 可能掉落的装备 id（再按品质筛选） */
  possibleEquipmentIds: string[];
  /** 符文掉落概率 0~1 */
  runeDropRate?: number;
  /** 可能掉落的符文 id */
  possibleRuneIds?: string[];
}

export interface LootResult {
  equipmentConfigId?: string;
  runeConfigId?: string;
}

/** 各关掉落配置（Boss 关高概率） */
export const STAGE_LOOT_CONFIGS: Record<string, StageLootConfig> = {
  // 第一章普通关
  '1-1': { stageId: '1-1', equipmentDropRate: 0.2, rarityWeights: { common: 90, rare: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core'] },
  '1-2': { stageId: '1-2', equipmentDropRate: 0.2, rarityWeights: { common: 90, rare: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core'] },
  '1-3': { stageId: '1-3', equipmentDropRate: 0.2, rarityWeights: { common: 90, rare: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core'] },
  '1-4': { stageId: '1-4', equipmentDropRate: 0.2, rarityWeights: { common: 90, rare: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core'] },
  // 第一章 Boss：高概率，含史诗
  '1-5': { stageId: '1-5', equipmentDropRate: 0.4, rarityWeights: { common: 70, rare: 25, epic: 5 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.2, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1'] },
  // 第二章普通关
  '2-1': { stageId: '2-1', equipmentDropRate: 0.35, rarityWeights: { common: 60, rare: 35, epic: 5 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.1, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1'] },
  '2-2': { stageId: '2-2', equipmentDropRate: 0.35, rarityWeights: { common: 60, rare: 35, epic: 5 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.1, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1'] },
  '2-3': { stageId: '2-3', equipmentDropRate: 0.35, rarityWeights: { common: 60, rare: 35, epic: 5 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.1, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune'] },
  '2-4': { stageId: '2-4', equipmentDropRate: 0.35, rarityWeights: { common: 60, rare: 35, epic: 5 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.1, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune'] },
  // 第二章 Boss：高概率，侧重优秀/史诗
  '2-5': { stageId: '2-5', equipmentDropRate: 0.6, rarityWeights: { rare: 70, epic: 30 },
    possibleEquipmentIds: ['neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment'],
    runeDropRate: 0.3, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune'] },
  // 第三章普通关与前哨（递增掉落概率，复用现有装备与符文池，3-5高于3-1至3-4，不使用Boss专属逻辑）
  '3-1': { stageId: '3-1', equipmentDropRate: 0.40, rarityWeights: { common: 50, rare: 40, epic: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment', 'lava_cannon', 'lava_armor', 'lava_core'],
    runeDropRate: 0.12, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune', 'fire_guard_rune'] },
  '3-2': { stageId: '3-2', equipmentDropRate: 0.42, rarityWeights: { common: 45, rare: 45, epic: 10 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment', 'lava_cannon', 'lava_armor', 'lava_core'],
    runeDropRate: 0.14, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune', 'fire_guard_rune'] },
  '3-3': { stageId: '3-3', equipmentDropRate: 0.44, rarityWeights: { common: 40, rare: 48, epic: 12 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment', 'lava_cannon', 'lava_armor', 'lava_core'],
    runeDropRate: 0.16, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune', 'fire_guard_rune'] },
  '3-4': { stageId: '3-4', equipmentDropRate: 0.46, rarityWeights: { common: 35, rare: 50, epic: 15 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment', 'lava_cannon', 'lava_armor', 'lava_core'],
    runeDropRate: 0.18, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune', 'fire_guard_rune'] },
  '3-5': { stageId: '3-5', equipmentDropRate: 0.50, rarityWeights: { common: 30, rare: 52, epic: 18 },
    possibleEquipmentIds: ['rusty_claw', 'patched_armor', 'small_core', 'neon_blaster', 'alloy_armor', 'neon_core', 'starcore_cannon', 'sewer_guard', 'starcore_fragment', 'lava_cannon', 'lava_armor', 'lava_core'],
    runeDropRate: 0.22, possibleRuneIds: ['cannon_rune_1', 'shield_rune_1', 'poison_guard_rune', 'fire_guard_rune'] },
};

export function getStageLootConfig(stageId: string): StageLootConfig | undefined {
  return STAGE_LOOT_CONFIGS[stageId];
}

/** 按权重随机选品质 */
function rollRarity(weights: Partial<Record<EquipmentRarity, number>>, r: number): EquipmentRarity {
  const entries = (Object.entries(weights) as [EquipmentRarity, number][])
    .filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let acc = 0;
  const roll = r * total;
  for (const [rar, w] of entries) {
    acc += w;
    if (roll <= acc) return rar;
  }
  return entries[0]?.[0] ?? 'common';
}

/**
 * 掷骰掉落。r1/r2/r3 为独立随机数（0~1），便于测试。
 * 返回 null 表示本次无掉落。
 */
export function rollLoot(stageId: string, r1: number, r2: number, r3: number): LootResult | null {
  const cfg = STAGE_LOOT_CONFIGS[stageId];
  if (!cfg) return null;
  const result: LootResult = {};
  // 装备掉落
  if (r1 < cfg.equipmentDropRate && cfg.possibleEquipmentIds.length > 0) {
    const rarity = rollRarity(cfg.rarityWeights, r2);
    const candidates = cfg.possibleEquipmentIds
      .map(id => EQUIPMENT_CONFIGS[id])
      .filter((e): e is NonNullable<typeof e> => !!e && e.rarity === rarity);
    if (candidates.length > 0) {
      const idx = Math.floor(r3 * candidates.length) % candidates.length;
      result.equipmentConfigId = candidates[idx].id;
    }
  }
  // 符文掉落（复用 r2/r3 已不影响装备判定，用新随机）
  if (cfg.runeDropRate && cfg.possibleRuneIds && cfg.possibleRuneIds.length > 0) {
    // 用 r1 的另一段判断符文（独立）：简单起见用 r2 判定符文掉落
    if (r2 < cfg.runeDropRate) {
      const idx = Math.floor(r3 * cfg.possibleRuneIds.length) % cfg.possibleRuneIds.length;
      result.runeConfigId = cfg.possibleRuneIds[idx];
    }
  }
  if (!result.equipmentConfigId && !result.runeConfigId) return null;
  return result;
}
