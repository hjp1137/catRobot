/**
 * BossSkill —— 机械鼠王技能（任务4）
 * ------------------------------------------------------------------
 * 震荡冲击 Shockwave：状态机 idle → warning(预警红圈) → blast(范围伤害+扩散环) → cooldown
 *   - 冷却 5s，预警 1s，伤害 12，范围 90px
 *   - blast 瞬间判定一次：玩家在中心半径内 → takeDamage（本 blast 只判一次）
 * 召唤小鼠 Summon：boss hp<50% 且本场未触发过 → 召唤 2 只机械鼠，每场最多 1 次
 *   - 通过 onSummon 回调通知 BattleManager 生成（不在 Skill 内直接 spawn）
 *
 * 纯逻辑 + 可测：update 推进状态，render 数据由 getter 暴露给渲染层。
 */
import { PlayerMecha } from '../player/PlayerMecha';

export type ShockwavePhase = 'idle' | 'warning' | 'blast' | 'cooldown';

/** 技能参数（集中，便于调优与测试） */
export const SHOCKWAVE = {
  cooldownSec: 5,
  warningSec: 1,
  damage: 12,
  radius: 90,
  blastSec: 0.3, // blast 持续（视觉扩散环），伤害在进入 blast 瞬间判定
};

/** 召唤参数 */
export const SUMMON = {
  hpRatioThreshold: 0.5, // boss 血量低于此比例触发
  count: 2,
  maxTriggersPerBattle: 1,
};

export interface ShockwaveRenderState {
  phase: ShockwavePhase;
  /** 中心坐标 */
  cx: number;
  cy: number;
  radius: number;
  /** warning 进度 0~1（用于脉动） */
  warningProgress: number;
  /** blast 扩散进度 0~1（用于扩散环） */
  blastProgress: number;
}

export class BossSkill {
  private phase: ShockwavePhase = 'idle';
  private phaseTimer = 0;
  /** 中心：blast 判定时锁定为当时 boss 位置 */
  private blastCx = 0;
  private blastCy = 0;
  /** 本次 blast 是否已造成伤害（防止重复） */
  private blastHit = false;

  /** 召唤：是否已触发过 */
  private summonTriggered = false;
  /** 召唤回调（BattleManager 注入） */
  public onSummon: ((count: number) => void) | null = null;

  /** boss 死亡后停止 */
  private disabled = false;

  constructor(private bossRef: { x: number; y: number; hp: number; maxHp: number; dead: boolean }) {}

  /** 每帧推进 */
  update(dt: number, player: PlayerMecha): void {
    if (this.disabled || this.bossRef.dead) {
      this.disabled = this.bossRef.dead;
      return;
    }
    // 召唤判定（优先，独立于 shockwave 状态）
    this.trySummon();

    this.phaseTimer += dt;
    switch (this.phase) {
      case 'idle':
        if (this.phaseTimer >= SHOCKWAVE.cooldownSec) {
          this.enterPhase('warning');
        }
        break;
      case 'warning':
        // 预警期间不伤害玩家
        if (this.phaseTimer >= SHOCKWAVE.warningSec) {
          // 进入 blast：锁定中心为当前 boss 位置
          this.blastCx = this.bossRef.x;
          this.blastCy = this.bossRef.y;
          this.blastHit = false;
          this.enterPhase('blast');
        }
        break;
      case 'blast':
        // 进入瞬间判定一次伤害
        if (!this.blastHit) {
          this.blastHit = true;
          const d = Math.hypot(player.x - this.blastCx, player.y - this.blastCy);
          if (d <= SHOCKWAVE.radius) {
            player.takeDamage(SHOCKWAVE.damage);
          }
        }
        if (this.phaseTimer >= SHOCKWAVE.blastSec) {
          this.enterPhase('cooldown');
        }
        break;
      case 'cooldown':
        // cooldown 复用 cooldownSec，结束后回 idle
        if (this.phaseTimer >= SHOCKWAVE.cooldownSec) {
          this.enterPhase('idle');
        }
        break;
    }
  }

  private enterPhase(p: ShockwavePhase): void {
    this.phase = p;
    this.phaseTimer = 0;
  }

  private trySummon(): void {
    if (this.summonTriggered) return;
    const ratio = this.bossRef.maxHp > 0 ? this.bossRef.hp / this.bossRef.maxHp : 1;
    if (ratio < SUMMON.hpRatioThreshold) {
      this.summonTriggered = true;
      this.onSummon?.(SUMMON.count);
    }
  }

  /** 给渲染层读 */
  getRenderState(): ShockwaveRenderState | null {
    if (this.phase === 'idle' || this.phase === 'cooldown') return null;
    if (this.phase === 'warning') {
      // 中心跟随 boss（预警期间）
      return {
        phase: 'warning',
        cx: this.bossRef.x, cy: this.bossRef.y,
        radius: SHOCKWAVE.radius,
        warningProgress: Math.min(1, this.phaseTimer / SHOCKWAVE.warningSec),
        blastProgress: 0,
      };
    }
    // blast
    return {
      phase: 'blast',
      cx: this.blastCx, cy: this.blastCy,
      radius: SHOCKWAVE.radius,
      warningProgress: 1,
      blastProgress: Math.min(1, this.phaseTimer / SHOCKWAVE.blastSec),
    };
  }

  get currentPhase(): ShockwavePhase { return this.phase; }
  get hasSummoned(): boolean { return this.summonTriggered; }
  get isDisabled(): boolean { return this.disabled; }
}
