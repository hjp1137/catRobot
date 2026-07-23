/**
 * PollutionBossSkill —— 污染核心虫后技能（任务8）
 * ------------------------------------------------------------------
 * 三机制（各自独立状态机）：
 *  1. 毒液领域 ToxicField：idle(7s)→warning(1s,预警圈不伤)→active(4s,玩家在boss半径内每tick伤害)→cooldown
 *  2. 污染喷发 Eruption：锁定技能开始时玩家位置，idle(9s)→warning(1.2s)→blast(65内14伤害+poison)
 *  3. 召唤：hp<50% 召唤2毒液虫，每场1次（onSummon 回调）
 *
 * 所有伤害走 player.takeDamage → 自动受重甲护盾减免。
 * boss dead → disable，状态停止。
 */
import { PlayerMecha } from '../player/PlayerMecha';

// 毒液领域参数
export const TOXIC_FIELD = {
  cooldownSec: 7,
  warningSec: 1,
  activeSec: 4,
  radius: 110,
  damagePerTick: 4,
  tickInterval: 1,
};
// 污染喷发参数
export const ERUPTION = {
  cooldownSec: 9,
  warningSec: 1.2,
  radius: 65,
  damage: 14,
  poisonDuration: 3,
  poisonDamagePerTick: 3,
  poisonTickInterval: 1,
};
// 召唤参数
export const QUEEN_SUMMON = {
  hpRatioThreshold: 0.5,
  count: 2,
};

type FieldPhase = 'idle' | 'warning' | 'active' | 'cooldown';
type EruptionPhase = 'idle' | 'warning' | 'blast' | 'cooldown';

export interface FieldRenderState {
  phase: 'warning' | 'active';
  cx: number; cy: number; radius: number;
  progress: number; // warning/active 进度 0~1
}
export interface EruptionRenderState {
  phase: 'warning' | 'blast';
  cx: number; cy: number; radius: number;
  progress: number;
}

export class PollutionBossSkill {
  // 毒液领域
  private fieldPhase: FieldPhase = 'idle';
  private fieldTimer = 0;
  private fieldTickTimer = 0;
  // 污染喷发
  private eruptionPhase: EruptionPhase = 'idle';
  private eruptionTimer = 0;
  private eruptionCx = 0;
  private eruptionCy = 0;
  private eruptionHit = false;
  // 召唤
  private summonTriggered = false;
  public onSummon: ((count: number) => void) | null = null;

  private disabled = false;

  constructor(private bossRef: { x: number; y: number; hp: number; maxHp: number; dead: boolean }) {}

  update(dt: number, player: PlayerMecha): void {
    if (this.disabled) return;
    if (this.bossRef.dead) {
      this.disabled = true;
      return;
    }
    this.trySummon();
    this.updateField(dt, player);
    this.updateEruption(dt, player);
  }

  // ---- 毒液领域 ----
  private updateField(dt: number, player: PlayerMecha): void {
    this.fieldTimer += dt;
    switch (this.fieldPhase) {
      case 'idle':
        if (this.fieldTimer >= TOXIC_FIELD.cooldownSec) { this.fieldPhase = 'warning'; this.fieldTimer = 0; }
        break;
      case 'warning':
        // 预警不伤害
        if (this.fieldTimer >= TOXIC_FIELD.warningSec) { this.fieldPhase = 'active'; this.fieldTimer = 0; this.fieldTickTimer = 0; }
        break;
      case 'active':
        // 玩家在 boss 半径内 → 每 tick 伤害（走 takeDamage 受护盾减免）
        this.fieldTickTimer += dt;
        if (this.fieldTickTimer >= TOXIC_FIELD.tickInterval) {
          this.fieldTickTimer -= TOXIC_FIELD.tickInterval;
          const d = Math.hypot(player.x - this.bossRef.x, player.y - this.bossRef.y);
          if (d <= TOXIC_FIELD.radius) {
            player.takeDamage(TOXIC_FIELD.damagePerTick);
          }
        }
        if (this.fieldTimer >= TOXIC_FIELD.activeSec) { this.fieldPhase = 'cooldown'; this.fieldTimer = 0; }
        break;
      case 'cooldown':
        if (this.fieldTimer >= TOXIC_FIELD.cooldownSec) { this.fieldPhase = 'idle'; this.fieldTimer = 0; }
        break;
    }
  }

  // ---- 污染喷发 ----
  private updateEruption(dt: number, player: PlayerMecha): void {
    this.eruptionTimer += dt;
    switch (this.eruptionPhase) {
      case 'idle':
        if (this.eruptionTimer >= ERUPTION.cooldownSec) {
          // 锁定当前玩家位置为目标
          this.eruptionCx = player.x;
          this.eruptionCy = player.y;
          this.eruptionPhase = 'warning';
          this.eruptionTimer = 0;
          this.eruptionHit = false;
        }
        break;
      case 'warning':
        // 预警不伤害
        if (this.eruptionTimer >= ERUPTION.warningSec) { this.eruptionPhase = 'blast'; this.eruptionTimer = 0; }
        break;
      case 'blast':
        // 爆发瞬间判定一次：范围内 14 伤害 + poison
        if (!this.eruptionHit) {
          this.eruptionHit = true;
          const d = Math.hypot(player.x - this.eruptionCx, player.y - this.eruptionCy);
          if (d <= ERUPTION.radius) {
            player.takeDamage(ERUPTION.damage);
            player.statusEffects.applyPoison(ERUPTION.poisonDuration, ERUPTION.poisonDamagePerTick, ERUPTION.poisonTickInterval);
          }
        }
        if (this.eruptionTimer >= 0.3) { this.eruptionPhase = 'cooldown'; this.eruptionTimer = 0; }
        break;
      case 'cooldown':
        if (this.eruptionTimer >= ERUPTION.cooldownSec) { this.eruptionPhase = 'idle'; this.eruptionTimer = 0; }
        break;
    }
  }

  private trySummon(): void {
    if (this.summonTriggered) return;
    const ratio = this.bossRef.maxHp > 0 ? this.bossRef.hp / this.bossRef.maxHp : 1;
    if (ratio < QUEEN_SUMMON.hpRatioThreshold) {
      this.summonTriggered = true;
      this.onSummon?.(QUEEN_SUMMON.count);
    }
  }

  // ---- 渲染状态 ----
  getFieldRenderState(): FieldRenderState | null {
    if (this.disabled) return null;
    if (this.fieldPhase === 'warning') {
      return { phase: 'warning', cx: this.bossRef.x, cy: this.bossRef.y, radius: TOXIC_FIELD.radius,
        progress: Math.min(1, this.fieldTimer / TOXIC_FIELD.warningSec) };
    }
    if (this.fieldPhase === 'active') {
      return { phase: 'active', cx: this.bossRef.x, cy: this.bossRef.y, radius: TOXIC_FIELD.radius,
        progress: Math.min(1, this.fieldTimer / TOXIC_FIELD.activeSec) };
    }
    return null;
  }

  getEruptionRenderState(): EruptionRenderState | null {
    if (this.disabled) return null;
    if (this.eruptionPhase === 'warning') {
      return { phase: 'warning', cx: this.eruptionCx, cy: this.eruptionCy, radius: ERUPTION.radius,
        progress: Math.min(1, this.eruptionTimer / ERUPTION.warningSec) };
    }
    if (this.eruptionPhase === 'blast') {
      return { phase: 'blast', cx: this.eruptionCx, cy: this.eruptionCy, radius: ERUPTION.radius,
        progress: Math.min(1, this.eruptionTimer / 0.3) };
    }
    return null;
  }

  stop(): void {
    this.disabled = true;
    this.fieldPhase = 'idle';
    this.eruptionPhase = 'idle';
  }

  get hasSummoned(): boolean { return this.summonTriggered; }
  get isDisabled(): boolean { return this.disabled; }
  get currentFieldPhase(): FieldPhase { return this.fieldPhase; }
  get currentEruptionPhase(): EruptionPhase { return this.eruptionPhase; }
}
