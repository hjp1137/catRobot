/**
 * SkillState —— 局内技能时间状态（任务5）
 * ------------------------------------------------------------------
 * 只管「时间状态」：冷却剩余、激活剩余。不直接造成伤害/减伤（由
 * PlayerMecha/BattleManager 在判定时查询 isActive）。
 *
 * 纯逻辑、易测：update(dt) 衰减；use() 进入冷却/激活；canUse() 查询。
 * 新战斗 = 新 PlayerMecha = 新 SkillState，天然重置。
 */
import { SkillConfig, getSkillEffect } from '../data/SkillConfig';

export interface RuntimeSkillState {
  skillId: string;
  /** 冷却剩余（秒） */
  cooldownRemaining: number;
  /** 激活剩余（秒，护盾类用） */
  activeRemaining: number;
  /** 是否处于激活态（护盾持续中） */
  isActive: boolean;
}

export interface SkillUseInternalResult {
  ok: boolean;
  /** 进入激活态（护盾）/ 触发瞬发（伤害） */
  activated: boolean;
}

export class SkillState {
  private states = new Map<string, RuntimeSkillState>();
  private configs: Map<string, SkillConfig>;
  /** 任务6：技能等级（决定 cooldown/duration） */
  private skillLevels: Record<string, number>;
  /** 任务9：冷却缩减（0~0.5） */
  private cooldownReduction: number;

  constructor(configs: SkillConfig[], skillLevels?: Record<string, number>, cooldownReduction = 0) {
    this.configs = new Map(configs.map(c => [c.id, c]));
    this.skillLevels = skillLevels ?? {};
    this.cooldownReduction = Math.min(0.5, Math.max(0, cooldownReduction));
    this.reset();
  }

  reset(): void {
    this.states.clear();
    for (const cfg of this.configs.values()) {
      this.states.set(cfg.id, {
        skillId: cfg.id,
        cooldownRemaining: 0,
        activeRemaining: 0,
        isActive: false,
      });
    }
  }

  canUse(skillId: string): boolean {
    const s = this.states.get(skillId);
    if (!s) return false;
    return s.cooldownRemaining <= 0;
  }

  /**
   * 释放技能：进入冷却；护盾类进入激活态。
   * 任务6：cooldown/duration 按当前技能等级 effect 读取。
   * 不在此处造成伤害（伤害判定在 PlayerMecha.useSkill）。
   */
  use(skillId: string): SkillUseInternalResult {
    const cfg = this.configs.get(skillId);
    const s = this.states.get(skillId);
    if (!cfg || !s) return { ok: false, activated: false };
    if (s.cooldownRemaining > 0) return { ok: false, activated: false };
    const level = this.skillLevels[skillId] ?? 1;
    const effect = getSkillEffect(skillId, level);
    // 任务9：冷却乘以 (1 - cooldownReduction)
    const baseCd = effect?.cooldown ?? cfg.effects[0].cooldown ?? 0;
    s.cooldownRemaining = baseCd * (1 - this.cooldownReduction);
    // 护盾类：进入激活态（按等级 effect duration + 任务9 符文 shieldDurationBonus 由外部传入）
    if (cfg.type === 'shield') {
      const dur = effect?.duration ?? cfg.effects[0].duration ?? 0;
      if (dur > 0) {
        s.activeRemaining = dur;
        s.isActive = true;
        return { ok: true, activated: true };
      }
    }
    // 伤害类：瞬发，无激活态
    return { ok: true, activated: false };
  }

  update(dt: number): void {
    for (const s of this.states.values()) {
      if (s.cooldownRemaining > 0) s.cooldownRemaining = Math.max(0, s.cooldownRemaining - dt);
      if (s.activeRemaining > 0) {
        s.activeRemaining = Math.max(0, s.activeRemaining - dt);
        if (s.activeRemaining <= 0) s.isActive = false;
      }
    }
  }

  get(skillId: string): RuntimeSkillState | undefined {
    return this.states.get(skillId);
  }

  /** 任务6：取技能等级（供 PlayerMecha 读 effect） */
  getLevel(skillId: string): number {
    return this.skillLevels[skillId] ?? 1;
  }

  /** 护盾是否激活（供 PlayerMecha.takeDamage 查询减伤） */
  isShieldActive(skillId: string): boolean {
    return !!this.states.get(skillId)?.isActive;
  }

  /** 列出所有技能状态（供 UI） */
  list(): RuntimeSkillState[] {
    return Array.from(this.states.values());
  }
}
