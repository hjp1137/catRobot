/**
 * StatusEffect —— 玩家状态效果管理（任务7 毒液）
 * ------------------------------------------------------------------
 * 当前仅 poison。毒液：持续期间每 tickInterval 秒造成 damagePerTick 伤害。
 * 伤害走 player.takeDamage → 自动受重甲护盾减免。
 *
 * 重复施加毒液：取较高 damagePerTick + 刷新 duration（不无限叠加）。
 */
import type { PlayerMecha } from './PlayerMecha';

export type StatusEffectType = 'poison' | 'burn';

export interface RuntimeStatusEffect {
  type: StatusEffectType;
  remaining: number;
  tickInterval: number;
  tickTimer: number;
  damagePerTick: number;
}

export class StatusEffectManager {
  private effects = new Map<StatusEffectType, RuntimeStatusEffect>();

  /** 施加毒液：重复命中取较高伤害 + 刷新持续 */
  applyPoison(duration: number, damagePerTick: number, tickInterval = 1): void {
    const existing = this.effects.get('poison');
    if (existing) {
      existing.remaining = Math.max(existing.remaining, duration);
      existing.damagePerTick = Math.max(existing.damagePerTick, damagePerTick);
    } else {
      this.effects.set('poison', {
        type: 'poison', remaining: duration, tickInterval, tickTimer: tickInterval, damagePerTick,
      });
    }
  }

  /** 任务13：施加燃烧：重复命中取较高伤害 + 刷新持续 */
  applyBurn(duration: number, damagePerTick: number, tickInterval = 1): void {
    const existing = this.effects.get('burn');
    if (existing) {
      existing.remaining = Math.max(existing.remaining, duration);
      existing.damagePerTick = Math.max(existing.damagePerTick, damagePerTick);
    } else {
      this.effects.set('burn', {
        type: 'burn', remaining: duration, tickInterval, tickTimer: tickInterval, damagePerTick,
      });
    }
  }

  /** 每帧推进：tick 计时 → 对玩家造成伤害 */
  update(dt: number, player: PlayerMecha): void {
    if (player.dead) { this.clear(); return; }

    // 处理毒液
    const p = this.effects.get('poison');
    if (p) {
      p.remaining -= dt;
      p.tickTimer -= dt;
      if (p.tickTimer <= 0) {
        p.tickTimer += p.tickInterval;
        const resist = player.poisonResist;
        player.takeDamage(p.damagePerTick * (1 - resist));
      }
      if (p.remaining <= 0) {
        this.effects.delete('poison');
      }
    }

    // 任务13：处理燃烧（毒液与燃烧可同时存在，火抗有 0% 到 80% 上限控制）
    const b = this.effects.get('burn');
    if (b) {
      b.remaining -= dt;
      b.tickTimer -= dt;
      if (b.tickTimer <= 0) {
        b.tickTimer += b.tickInterval;
        let resist = player.fireResist;
        resist = Math.max(0, Math.min(0.8, resist));
        player.takeDamage(b.damagePerTick * (1 - resist));
      }
      if (b.remaining <= 0) {
        this.effects.delete('burn');
      }
    }
  }

  clear(): void { this.effects.clear(); }

  has(type: StatusEffectType): boolean { return this.effects.has(type); }

  getPoison(): RuntimeStatusEffect | undefined { return this.effects.get('poison'); }

  getBurn(): RuntimeStatusEffect | undefined { return this.effects.get('burn'); }
}
