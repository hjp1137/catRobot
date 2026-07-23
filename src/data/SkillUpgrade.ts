/**
 * SkillUpgrade —— 技能养成纯逻辑（任务6）
 * ------------------------------------------------------------------
 * 提供：等级查询、效果查询、升级预览、升级尝试。
 * 纯函数（除 tryUpgradeSkill 修改 player 引用外），易测。
 */
import { PlayerData } from './PlayerData';
import {
  SkillConfig, SkillLevelEffect, SkillUpgradeCost,
  getSkillConfig, getSkillEffect, getSkillUpgradeCost,
} from './SkillConfig';

/** 升级预览（供 UI 展示当前/下级/消耗） */
export interface SkillUpgradePreview {
  skillId: string;
  config: SkillConfig;
  currentLevel: number;
  currentEffect: SkillLevelEffect;
  nextLevel: number | null;       // null = 已满级
  nextEffect: SkillLevelEffect | null;
  cost: SkillUpgradeCost | null;  // null = 已满级
  isMaxLevel: boolean;
}

export type SkillUpgradeResult =
  | { ok: true; oldLevel: number; newLevel: number; costGold: number; costParts: number }
  | { ok: false; reason: 'not_found' | 'not_unlocked' | 'max_level' | 'not_enough_gold' | 'not_enough_parts' };

/** 取玩家某技能等级（钳制 1..maxLevel，缺省 1） */
export function getSkillLevel(player: PlayerData, skillId: string): number {
  const cfg = getSkillConfig(skillId);
  if (!cfg) return 1;
  const lv = player.skillLevels[skillId] ?? 1;
  return Math.max(1, Math.min(cfg.maxLevel, Math.floor(lv)));
}

/** 取玩家某技能当前等级的效果 */
export function getSkillEffectForPlayer(player: PlayerData, skillId: string): SkillLevelEffect | undefined {
  return getSkillEffect(skillId, getSkillLevel(player, skillId));
}

/** 升级预览 */
export function getSkillUpgradePreview(player: PlayerData, skillId: string): SkillUpgradePreview | null {
  const cfg = getSkillConfig(skillId);
  if (!cfg) return null;
  const currentLevel = getSkillLevel(player, skillId);
  const currentEffect = getSkillEffect(skillId, currentLevel)!;
  const isMax = currentLevel >= cfg.maxLevel;
  const nextLevel = isMax ? null : currentLevel + 1;
  const nextEffect = nextLevel ? getSkillEffect(skillId, nextLevel) ?? null : null;
  const cost = getSkillUpgradeCost(skillId, currentLevel);
  return {
    skillId, config: cfg, currentLevel, currentEffect,
    nextLevel, nextEffect, cost, isMaxLevel: isMax,
  };
}

/**
 * 尝试升级。成功则修改 player（扣费 + 等级 +1）。
 * 不在此处落盘（由 GameManager 调用后 SaveManager.save）。
 */
export function tryUpgradeSkill(player: PlayerData, skillId: string): SkillUpgradeResult {
  const cfg = getSkillConfig(skillId);
  if (!cfg) return { ok: false, reason: 'not_found' };
  if (!player.unlockedSkillIds.includes(skillId)) return { ok: false, reason: 'not_unlocked' };
  const oldLevel = getSkillLevel(player, skillId);
  if (oldLevel >= cfg.maxLevel) return { ok: false, reason: 'max_level' };
  const cost = getSkillUpgradeCost(skillId, oldLevel);
  if (!cost) return { ok: false, reason: 'max_level' };
  if (player.gold < cost.gold) return { ok: false, reason: 'not_enough_gold' };
  if (player.parts < cost.parts) return { ok: false, reason: 'not_enough_parts' };
  // 扣费 + 升级
  player.gold -= cost.gold;
  player.parts -= cost.parts;
  player.skillLevels[skillId] = oldLevel + 1;
  return { ok: true, oldLevel, newLevel: oldLevel + 1, costGold: cost.gold, costParts: cost.parts };
}
