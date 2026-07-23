/**
 * 升级系统 —— 公式集中在此，便于后续扩展为多资源/多分支升级
 *
 * 规则（任务文档暂定）：
 *   升级消耗金币 = 当前等级 × 50
 *   升级消耗零件 = 当前等级 × 5
 *
 * 升级后属性由 MechaConfig 的 hpGrowth/atkGrowth 派生（见 MechaConfig.ts），
 * 故升级只改 level，不改 maxHp/attack 字段。
 */

export interface UpgradeCost {
  gold: number;
  parts: number;
}

/** 计算从 currentLevel 升级到 currentLevel+1 所需消耗 */
export function getUpgradeCost(currentLevel: number): UpgradeCost {
  return {
    gold: currentLevel * 50,
    parts: currentLevel * 5,
  };
}

export type UpgradeResult =
  | { ok: true; newLevel: number; cost: UpgradeCost }
  | { ok: false; reason: 'gold' | 'parts'; cost: UpgradeCost };

/**
 * 尝试升级。资源足够则扣减并返回新等级；否则返回缺哪种资源。
 * 注意：本函数会 **修改传入的 player 引用**（gold/parts/level）。
 */
export function tryUpgrade(
  player: { level: number; gold: number; parts: number },
): UpgradeResult {
  const cost = getUpgradeCost(player.level);
  if (player.gold < cost.gold) return { ok: false, reason: 'gold', cost };
  if (player.parts < cost.parts) return { ok: false, reason: 'parts', cost };
  player.gold -= cost.gold;
  player.parts -= cost.parts;
  player.level += 1;
  return { ok: true, newLevel: player.level, cost };
}
