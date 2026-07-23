/**
 * 机甲配置表
 * ------------------------------------------------------------------
 * 未来扩展：新增机甲只需在 MECHA_CONFIGS 里加一项 + 配置解锁条件。
 * 派生属性（maxHp/attack/power）按当前等级实时计算，不入存档。
 */

export interface MechaConfig {
  id: string;
  name: string;
  /** 基础生命值（等级 1） */
  baseHp: number;
  /** 每级生命成长 */
  hpGrowth: number;
  /** 基础攻击力（等级 1） */
  baseAtk: number;
  /** 每级攻击成长 */
  atkGrowth: number;
  /** 移动速度（像素/秒） */
  speed: number;
  /** 自动攻击范围（像素半径） */
  attackRange: number;
  /** 自动攻击冷却（秒） */
  attackCooldown: number;
  /** 渲染颜色（占位美术用） */
  color: string;
}

/** 橘猫重甲 —— MVP 默认机甲
 * 平衡说明（任务1.1 修正）：baseHp 100→120、attackCooldown 0.8→0.6，
 * 使 Lv1 站桩对 4 只机械鼠可险胜，走位则更轻松。详见
 * Walkthroughes/20260618_任务1.1_...成果说明.md「问题3」。 */
export const ORANGE_CAT: MechaConfig = {
  id: 'orange_cat',
  name: '橘猫重甲',
  baseHp: 120,
  hpGrowth: 20,
  baseAtk: 10,
  atkGrowth: 5,
  speed: 200,
  attackRange: 360,
  attackCooldown: 0.65,
  color: '#ff8c1a',
};

/** 机甲配置注册表 */
export const MECHA_CONFIGS: Record<string, MechaConfig> = {
  orange_cat: ORANGE_CAT,
};

/** 战力公式：生命 + 攻击 * 10 */
export function computePower(maxHp: number, attack: number): number {
  return maxHp + attack * 10;
}

/** 取某机甲在某等级下的完整战斗属性 */
export function getMechaStats(cfg: MechaConfig, level: number) {
  const maxHp = cfg.baseHp + (level - 1) * cfg.hpGrowth;
  const attack = cfg.baseAtk + (level - 1) * cfg.atkGrowth;
  return {
    maxHp,
    attack,
    power: computePower(maxHp, attack),
  };
}
