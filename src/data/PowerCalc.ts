/**
 * PowerCalc —— 战力计算（任务6 扩展，含技能贡献）
 * ------------------------------------------------------------------
 * 总战力 = 基础战力（生命+攻击×10）+ 技能战力（各技能等级×20）
 * 技能等级越高战力越高，机甲升级战力也提升。
 */
import { PlayerData } from './PlayerData';
import { MECHA_CONFIGS } from './MechaConfig';
import { getMechaStats } from './MechaConfig';
import { DEFAULT_SKILL_IDS } from './SkillConfig';
import { getSkillLevel } from './SkillUpgrade';
import { getEquipmentPower, getRunePower } from './EquipmentCalc';

/** 单技能对战力的贡献系数 */
export const SKILL_POWER_PER_LEVEL = 20;

/** 基础战力（机甲生命+攻击） */
export function calculateBasePower(player: PlayerData): number {
  const cfg = MECHA_CONFIGS[player.mechaId] ?? MECHA_CONFIGS.orange_cat;
  const s = getMechaStats(cfg, player.level);
  return s.maxHp + s.attack * 10;
}

/** 技能战力（各已解锁技能等级×系数之和） */
export function calculateSkillPower(player: PlayerData): number {
  let sum = 0;
  for (const id of DEFAULT_SKILL_IDS) {
    if (player.unlockedSkillIds.includes(id)) {
      sum += getSkillLevel(player, id) * SKILL_POWER_PER_LEVEL;
    }
  }
  return sum;
}

/** 任务9：装备战力（穿戴装备 power 之和） */
export function calculateEquipmentPower(player: PlayerData): number {
  return getEquipmentPower(player);
}

/** 任务9：符文战力（装备符文 power 之和） */
export function calculateRunePower(player: PlayerData): number {
  return getRunePower(player);
}

/** 总战力 = 基础 + 技能 + 装备 + 符文 */
export function calculateTotalPower(player: PlayerData): number {
  return calculateBasePower(player) + calculateSkillPower(player)
    + calculateEquipmentPower(player) + calculateRunePower(player);
}
