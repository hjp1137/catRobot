/**
 * EquipmentCalc —— 装备/符文属性计算与穿戴逻辑（任务9）
 * ------------------------------------------------------------------
 * 纯函数（穿戴/卸下修改 player 引用），易测。
 * 上限保护：cooldownReduction≤0.5, damageReduction≤0.7, poisonResist≤0.8。
 */
import { PlayerData } from './PlayerData';
import {
  EquipmentSlot, EquipmentStats, EquipmentBaseConfig,
  getEquipmentConfig, RARITY_COLOR,
  EQUIPMENT_SETS, EquipmentSetStats,
} from './EquipmentConfig';
import { EquipmentInstance } from './EquipmentData';
import {
  RuneConfig, RuneEffect, RuneInstance, getRuneConfig, MAX_EQUIPPED_RUNES,
} from './RuneConfig';
import { MECHA_CONFIGS } from './MechaConfig';
import { getMechaStats } from './MechaConfig';

/** 战斗综合属性（机甲基础 + 装备 + 符文） */
export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  power: number;
  skillDamageBonus: number;
  damageReduction: number;
  poisonResist: number;
  fireResist: number;
  cooldownReduction: number;
  shieldDurationBonus: number;
}

// ---------- 装备穿戴 ----------
/** 取所有已穿戴装备实例 */
export function getEquippedItems(player: PlayerData): EquipmentInstance[] {
  const inv = player.equipmentInventory;
  const result: EquipmentInstance[] = [];
  for (const slot of Object.keys(inv.equipped) as EquipmentSlot[]) {
    const uid = inv.equipped[slot];
    if (!uid) continue;
    const item = inv.items.find(i => i.uid === uid);
    if (item) result.push(item);
  }
  return result;
}

/** 取某槽位当前穿戴的装备实例 */
export function getEquippedInSlot(player: PlayerData, slot: EquipmentSlot): EquipmentInstance | null {
  const uid = player.equipmentInventory.equipped[slot];
  if (!uid) return null;
  return player.equipmentInventory.items.find(i => i.uid === uid) ?? null;
}

/**
 * 穿戴装备（同槽位替换旧装备）。
 * @returns true 成功；false uid 不存在
 */
export function equipItem(player: PlayerData, uid: string): boolean {
  const item = player.equipmentInventory.items.find(i => i.uid === uid);
  if (!item) return false;
  const cfg = getEquipmentConfig(item.configId);
  if (!cfg) return false;
  player.equipmentInventory.equipped[cfg.slot] = uid;
  return true;
}

/** 卸下某槽位装备 */
export function unequipSlot(player: PlayerData, slot: EquipmentSlot): void {
  delete player.equipmentInventory.equipped[slot];
}

// ---------- 符文装备 ----------
export function getEquippedRunes(player: PlayerData): RuneInstance[] {
  return player.equippedRunes
    .map(uid => player.runeInventory.find(r => r.uid === uid))
    .filter((r): r is RuneInstance => !!r);
}

/** 装备符文（最多 MAX_EQUIPPED_RUNES 个） */
export function equipRune(player: PlayerData, uid: string): boolean {
  const rune = player.runeInventory.find(r => r.uid === uid);
  if (!rune) return false;
  if (player.equippedRunes.includes(uid)) return false; // 已装备
  if (player.equippedRunes.length >= MAX_EQUIPPED_RUNES) return false;
  player.equippedRunes.push(uid);
  return true;
}

/** 卸下符文 */
export function unequipRune(player: PlayerData, uid: string): void {
  player.equippedRunes = player.equippedRunes.filter(u => u !== uid);
}

// ---------- 属性计算 ----------
/** 累加穿戴装备属性 */
export function getEquipmentStats(player: PlayerData): EquipmentStats {
  const out: EquipmentStats = {};
  for (const item of getEquippedItems(player)) {
    const cfg = getEquipmentConfig(item.configId);
    if (!cfg) continue;
    const s = cfg.baseStats;
    const level = item.level ?? 0;
    const factor = 1 + level * 0.08;
    out.hp = (out.hp ?? 0) + (s.hp ?? 0) * factor;
    out.attack = (out.attack ?? 0) + (s.attack ?? 0) * factor;
    out.skillDamageBonus = (out.skillDamageBonus ?? 0) + (s.skillDamageBonus ?? 0) * factor;
    out.damageReduction = (out.damageReduction ?? 0) + (s.damageReduction ?? 0) * factor;
    out.poisonResist = (out.poisonResist ?? 0) + (s.poisonResist ?? 0) * factor;
    out.fireResist = (out.fireResist ?? 0) + (s.fireResist ?? 0) * factor;
    out.cooldownReduction = (out.cooldownReduction ?? 0) + (s.cooldownReduction ?? 0) * factor;
  }
  return out;
}

/** 累加符文效果 */
export function getRuneEffects(player: PlayerData): RuneEffect {
  const out: RuneEffect = {};
  for (const rune of getEquippedRunes(player)) {
    const cfg = getRuneConfig(rune.configId);
    if (!cfg) continue;
    const e = cfg.effect;
    out.skillDamageBonus = (out.skillDamageBonus ?? 0) + (e.skillDamageBonus ?? 0);
    out.shieldDurationBonus = (out.shieldDurationBonus ?? 0) + (e.shieldDurationBonus ?? 0);
    out.poisonResist = (out.poisonResist ?? 0) + (e.poisonResist ?? 0);
    out.fireResist = (out.fireResist ?? 0) + (e.fireResist ?? 0);
  }
  return out;
}

/** 累加穿戴的套装效果 */
export function getEquipmentSetEffects(player: PlayerData): EquipmentSetStats {
  const out: EquipmentSetStats = {};
  const items = getEquippedItems(player);
  const setCounts: Record<string, number> = {};
  for (const item of items) {
    const cfg = getEquipmentConfig(item.configId);
    if (cfg && cfg.setId) {
      setCounts[cfg.setId] = (setCounts[cfg.setId] ?? 0) + 1;
    }
  }
  for (const [setId, count] of Object.entries(setCounts)) {
    const setCfg = EQUIPMENT_SETS[setId];
    if (!setCfg) continue;
    if (count >= 2) {
      const s2 = setCfg.stats2;
      out.hp = (out.hp ?? 0) + (s2.hp ?? 0);
      out.attack = (out.attack ?? 0) + (s2.attack ?? 0);
      out.skillDamageBonus = (out.skillDamageBonus ?? 0) + (s2.skillDamageBonus ?? 0);
      out.damageReduction = (out.damageReduction ?? 0) + (s2.damageReduction ?? 0);
      out.poisonResist = (out.poisonResist ?? 0) + (s2.poisonResist ?? 0);
      out.fireResist = (out.fireResist ?? 0) + (s2.fireResist ?? 0);
      out.cooldownReduction = (out.cooldownReduction ?? 0) + (s2.cooldownReduction ?? 0);
    }
    if (count >= 3) {
      const s3 = setCfg.stats3;
      out.hp = (out.hp ?? 0) + (s3.hp ?? 0);
      out.attack = (out.attack ?? 0) + (s3.attack ?? 0);
      out.skillDamageBonus = (out.skillDamageBonus ?? 0) + (s3.skillDamageBonus ?? 0);
      out.damageReduction = (out.damageReduction ?? 0) + (s3.damageReduction ?? 0);
      out.poisonResist = (out.poisonResist ?? 0) + (s3.poisonResist ?? 0);
      out.fireResist = (out.fireResist ?? 0) + (s3.fireResist ?? 0);
      out.cooldownReduction = (out.cooldownReduction ?? 0) + (s3.cooldownReduction ?? 0);
    }
  }
  return out;
}

/** 装备战力 = 各穿戴装备 power（含强化加成）之和 + 套装额外战力 */
export function getEquipmentPower(player: PlayerData): number {
  let sum = 0;
  for (const item of getEquippedItems(player)) {
    const cfg = getEquipmentConfig(item.configId);
    if (cfg) {
      const growth = { common: 5, rare: 8, epic: 12 }[cfg.rarity] ?? 0;
      sum += cfg.power + (item.level ?? 0) * growth;
    }
  }
  const items = getEquippedItems(player);
  const setCounts: Record<string, number> = {};
  for (const item of items) {
    const cfg = getEquipmentConfig(item.configId);
    if (cfg && cfg.setId) {
      setCounts[cfg.setId] = (setCounts[cfg.setId] ?? 0) + 1;
    }
  }
  for (const [setId, count] of Object.entries(setCounts)) {
    const setCfg = EQUIPMENT_SETS[setId];
    if (!setCfg) continue;
    if (count >= 2) sum += setCfg.power2;
    if (count >= 3) sum += setCfg.power3;
  }
  return sum;
}

/** 符文战力 = 各装备符文 power 之和 */
export function getRunePower(player: PlayerData): number {
  let sum = 0;
  for (const rune of getEquippedRunes(player)) {
    const cfg = getRuneConfig(rune.configId);
    if (cfg) sum += cfg.power;
  }
  return sum;
}

/**
 * 计算玩家战斗综合属性（机甲基础 + 装备 + 符文 + 套装）。
 * 含上限保护。
 */
export function calculatePlayerBattleStats(player: PlayerData): PlayerBattleStats {
  const cfg = MECHA_CONFIGS[player.mechaId] ?? MECHA_CONFIGS.orange_cat;
  const base = getMechaStats(cfg, player.level);
  const eq = getEquipmentStats(player);
  const rune = getRuneEffects(player);
  const setEff = getEquipmentSetEffects(player);
  return {
    maxHp: base.maxHp + (eq.hp ?? 0) + (setEff.hp ?? 0),
    attack: base.attack + (eq.attack ?? 0) + (setEff.attack ?? 0),
    power: 0, // 由 PowerCalc 统一算
    skillDamageBonus: (eq.skillDamageBonus ?? 0) + (rune.skillDamageBonus ?? 0) + (setEff.skillDamageBonus ?? 0),
    damageReduction: Math.min(0.7, (eq.damageReduction ?? 0) + (setEff.damageReduction ?? 0)),
    poisonResist: Math.min(0.8, (eq.poisonResist ?? 0) + (rune.poisonResist ?? 0) + (setEff.poisonResist ?? 0)),
    fireResist: Math.min(0.8, (eq.fireResist ?? 0) + (rune.fireResist ?? 0) + (setEff.fireResist ?? 0)),
    cooldownReduction: Math.min(0.5, (eq.cooldownReduction ?? 0) + (setEff.cooldownReduction ?? 0)),
    shieldDurationBonus: rune.shieldDurationBonus ?? 0,
  };
}

/** 取某技能的总伤害加成比例（装备+符文，0~1） */
export function getSkillDamageBonusForSkill(player: PlayerData, _skillId: string): number {
  // 当前所有 skillDamageBonus 都对喵能炮生效
  return calculatePlayerBattleStats(player).skillDamageBonus;
}
