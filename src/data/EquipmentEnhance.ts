import { PlayerData } from './PlayerData';
import { EquipmentInstance } from './EquipmentData';
import { EquipmentRarity, EquipmentSlot, getEquipmentConfig } from './EquipmentConfig';

export interface EnhanceCost {
  gold: number;
  enhanceStone: number;
}

export interface EnhanceResult {
  ok: boolean;
  reason?: 'not_found' | 'max_level' | 'not_enough_gold' | 'not_enough_material' | 'invalid_config';
  oldLevel?: number;
  newLevel?: number;
  costGold?: number;
  costEnhanceStone?: number;
}

export interface DisassembleReward {
  enhanceStone: number;
}
export interface DisassembleResult {
  ok: boolean;
  reason?: 'not_found' | 'equipped' | 'locked' | 'invalid_config';
  rewardEnhanceStone?: number;
  removedItemUid?: string;
}

export const BASE_COSTS: Record<number, EnhanceCost> = {
  0: { gold: 50, enhanceStone: 2 },
  1: { gold: 80, enhanceStone: 3 },
  2: { gold: 120, enhanceStone: 5 },
  3: { gold: 180, enhanceStone: 8 },
  4: { gold: 260, enhanceStone: 12 },
  5: { gold: 360, enhanceStone: 18 },
  6: { gold: 480, enhanceStone: 25 },
  7: { gold: 640, enhanceStone: 35 },
  8: { gold: 820, enhanceStone: 48 },
  9: { gold: 1050, enhanceStone: 65 },
};

export const RARITY_MULTIPLIERS: Record<EquipmentRarity, number> = {
  common: 1.0,
  rare: 1.3,
  epic: 1.8,
};

export function getEquipmentEnhanceLevel(item: EquipmentInstance): number {
  return item.level ?? 0;
}

export function getMaxEnhanceLevel(_item: EquipmentInstance): number {
  return 10;
}

export function getEnhanceCost(item: EquipmentInstance): EnhanceCost {
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { gold: 0, enhanceStone: 0 };
  const base = BASE_COSTS[item.level ?? 0];
  if (!base) return { gold: 0, enhanceStone: 0 };
  const mult = RARITY_MULTIPLIERS[cfg.rarity] ?? 1.0;
  return {
    gold: Math.floor(base.gold * mult),
    enhanceStone: Math.floor(base.enhanceStone * mult),
  };
}

export function canEnhanceEquipment(playerData: PlayerData, equipmentUid: string): boolean {
  const item = playerData.equipmentInventory.items.find(i => i.uid === equipmentUid);
  if (!item) return false;
  const maxLv = getMaxEnhanceLevel(item);
  const currentLevel = getEquipmentEnhanceLevel(item);
  if (currentLevel >= maxLv) return false;
  const cost = getEnhanceCost(item);
  if (playerData.gold < cost.gold) return false;
  if (!playerData.materials || playerData.materials.enhanceStone < cost.enhanceStone) return false;
  return true;
}

export function tryEnhanceEquipment(playerData: PlayerData, equipmentUid: string): EnhanceResult {
  const item = playerData.equipmentInventory.items.find(i => i.uid === equipmentUid);
  if (!item) return { ok: false, reason: 'not_found' };
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { ok: false, reason: 'invalid_config' };
  const currentLevel = getEquipmentEnhanceLevel(item);
  const maxLv = getMaxEnhanceLevel(item);
  if (currentLevel >= maxLv) return { ok: false, reason: 'max_level' };
  const cost = getEnhanceCost(item);
  if (playerData.gold < cost.gold) return { ok: false, reason: 'not_enough_gold' };
  if (!playerData.materials || playerData.materials.enhanceStone < cost.enhanceStone) {
    return { ok: false, reason: 'not_enough_material' };
  }
  // 扣减资源
  playerData.gold -= cost.gold;
  playerData.materials.enhanceStone -= cost.enhanceStone;
  const oldLevel = item.level ?? 0;
  item.level = oldLevel + 1;
  return {
    ok: true,
    oldLevel,
    newLevel: item.level,
    costGold: cost.gold,
    costEnhanceStone: cost.enhanceStone,
  };
}

export function getAccumulatedEnhanceStoneSpent(configId: string, level: number): number {
  const cfg = getEquipmentConfig(configId);
  if (!cfg) return 0;
  const mult = RARITY_MULTIPLIERS[cfg.rarity] ?? 1.0;
  let totalSpent = 0;
  for (let lv = 0; lv < level; lv++) {
    const base = BASE_COSTS[lv];
    if (base) {
      totalSpent += Math.floor(base.enhanceStone * mult);
    }
  }
  return totalSpent;
}

const BASE_DISASSEMBLE_REWARDS: Record<EquipmentRarity, number> = {
  common: 2,
  rare: 6,
  epic: 18,
};

export function getDisassembleReward(item: EquipmentInstance): DisassembleReward {
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { enhanceStone: 0 };
  const baseReward = BASE_DISASSEMBLE_REWARDS[cfg.rarity] ?? 0;
  const currentLevel = item.level ?? 0;
  const spent = getAccumulatedEnhanceStoneSpent(item.configId, currentLevel);
  const refund = Math.floor(spent * 0.5);
  return { enhanceStone: baseReward + refund };
}

export function tryDisassembleEquipment(playerData: PlayerData, equipmentUid: string): DisassembleResult {
  const inv = playerData.equipmentInventory;
  const idx = inv.items.findIndex(i => i.uid === equipmentUid);
  if (idx === -1) return { ok: false, reason: 'not_found' };
  const item = inv.items[idx];
  // 检查是否已穿戴
  const isEquipped = Object.values(inv.equipped).includes(equipmentUid);
  if (isEquipped) return { ok: false, reason: 'equipped' };
  if (item.locked) return { ok: false, reason: 'locked' };
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { ok: false, reason: 'invalid_config' };
  const reward = getDisassembleReward(item);
  // 移除装备
  inv.items.splice(idx, 1);
  // 增加强化石
  if (!playerData.materials) {
    playerData.materials = { enhanceStone: 0 };
  }
  playerData.materials.enhanceStone += reward.enhanceStone;
  return {
    ok: true,
    rewardEnhanceStone: reward.enhanceStone,
    removedItemUid: equipmentUid,
  };
}

const RARITY_ORDER: Record<EquipmentRarity, number> = {
  epic: 3,
  rare: 2,
  common: 1,
};

const SLOT_ORDER: Record<EquipmentSlot, number> = {
  weapon: 3,
  armor: 2,
  core: 1,
};

export function sortEquipmentItems(items: EquipmentInstance[]): EquipmentInstance[] {
  return [...items].sort((a, b) => {
    const cfgA = getEquipmentConfig(a.configId);
    const cfgB = getEquipmentConfig(b.configId);
    if (!cfgA || !cfgB) return 0;
    const rA = RARITY_ORDER[cfgA.rarity] ?? 0;
    const rB = RARITY_ORDER[cfgB.rarity] ?? 0;
    if (rA !== rB) return rB - rA;
    const sA = SLOT_ORDER[cfgA.slot] ?? 0;
    const sB = SLOT_ORDER[cfgB.slot] ?? 0;
    if (sA !== sB) return sB - sA;
    const lA = a.level ?? 0;
    const lB = b.level ?? 0;
    if (lA !== lB) return lB - lA;
    return b.obtainedAt - a.obtainedAt;
  });
}

export interface ToggleLockResult {
  ok: boolean;
  reason?: 'not_found' | 'invalid_config';
  nextData?: PlayerData;
  equipmentUid?: string;
  locked?: boolean;
}

export function toggleEquipmentLock(playerData: PlayerData, equipmentUid: string): ToggleLockResult {
  const item = playerData.equipmentInventory.items.find(i => i.uid === equipmentUid);
  if (!item) return { ok: false, reason: 'not_found' };
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { ok: false, reason: 'invalid_config' };
  item.locked = !item.locked;
  return {
    ok: true,
    equipmentUid,
    locked: item.locked,
    nextData: playerData,
  };
}

export function setEquipmentLocked(playerData: PlayerData, equipmentUid: string, locked: boolean): ToggleLockResult {
  const item = playerData.equipmentInventory.items.find(i => i.uid === equipmentUid);
  if (!item) return { ok: false, reason: 'not_found' };
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return { ok: false, reason: 'invalid_config' };
  item.locked = locked;
  return {
    ok: true,
    equipmentUid,
    locked,
    nextData: playerData,
  };
}

export function isEquipmentLocked(playerData: PlayerData, equipmentUid: string): boolean {
  const item = playerData.equipmentInventory.items.find(i => i.uid === equipmentUid);
  if (!item) return false;
  return !!item.locked;
}

