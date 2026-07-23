/**
 * 机械鼠敌人实体
 * ------------------------------------------------------------------
 * 行为：
 *  - 每帧朝玩家方向直线移动（简单追踪，无寻路）
 *  - 接触玩家（圆心距 < 两半径之和）后，每 attackInterval 秒造成 attack 伤害
 *  - hp 归 0 → dead=true，由 BattleManager 移除
 *
 * 接触伤害逻辑写在 EnemyMouse 内（知道自己的攻击节奏），
 * 但「是否真接触」依赖玩家坐标，故 update 由 BattleManager 把 player 传入。
 */
import { IContext } from '../engine/IContext';
import { EnemyConfig, EnemyVariant } from '../data/EnemyConfig';
import { PlayerMecha } from '../player/PlayerMecha';
import { BossSkill } from '../battle/BossSkill';
import { PollutionBossSkill } from '../battle/PollutionBossSkill';
import { FurnaceBossSkill } from '../battle/FurnaceBossSkill';
import type { ExploreEnemyState } from '../explore/ExploreContentConfig';
import type { EnemyBehaviorType, EnemyVisualConfig } from '../content/models/EnemyTemplate';
import { FrameSequencePlayer } from '../animation/FrameSequencePlayer';
import { resolveEnemyAnimationState, type RuntimeAnimationState } from '../animation/AnimationStateResolver';

const HIT_REACTION_SECONDS = 0.18;

export class EnemyMouse {
  public x: number;
  public y: number;
  public hp: number;
  public readonly maxHp: number;
  public readonly attack: number;
  public readonly radius: number;
  public readonly speed: number;
  public readonly color: string;
  public dead = false;
  public readonly name: string;
  public readonly contentTemplateId: string;
  public readonly visual: EnemyVisualConfig | undefined;
  public readonly behaviorType: EnemyBehaviorType | undefined;
  /** 任务7：毒液配置（接触攻击时施加） */
  public readonly poisonOnHit: import('../data/EnemyConfig').PoisonConfig | undefined;
  /** 任务13：燃烧配置（接触攻击时施加） */
  public readonly burnOnHit: import('../data/EnemyConfig').BurnConfig | undefined;
  /** 任务3/4：敌人变体（normal/elite/boss） */
  public readonly variant: EnemyVariant;
  /** 任务4：Boss 专属技能（仅 boss variant 创建） */
  public readonly bossSkill: BossSkill | null;
  /** 任务8：第二章 Boss 专属技能（仅 chapter2_boss variant 创建） */
  public readonly pollutionSkill: PollutionBossSkill | null;
  /** 任务14：第三章 Boss 专属技能（仅 chapter3_boss variant 创建） */
  public readonly furnaceSkill: FurnaceBossSkill | null;
  public spawnPointId = '';
  public exploreState: ExploreEnemyState = 'idle';
  public homeX = 0;
  public homeY = 0;
  public patrolTargetX = 0;
  public patrolTargetY = 0;
  public isMoving = false;
  public isAttacking = false;
  public readonly animationPlayer = new FrameSequencePlayer();
  public animationState: RuntimeAnimationState = 'idle';

  /** 任务2：受击闪烁（仅渲染状态，不影响逻辑） */
  public hitFlash = 0;
  private hitReactionRemaining = 0;

  private attackTimer = 0; // 攻击间隔累积
  private readonly attackInterval: number;

  constructor(
    private ctx: IContext,
    cfg: EnemyConfig,
    x: number,
    y: number,
  ) {
    this.x = x; this.y = y;
    this.maxHp = cfg.maxHp; this.hp = cfg.maxHp;
    this.attack = cfg.attack;
    this.attackInterval = cfg.attackInterval;
    this.speed = cfg.speed;
    this.radius = cfg.radius;
    this.color = cfg.color;
    this.name = cfg.name;
    this.variant = cfg.variant;
    this.contentTemplateId = cfg.contentTemplateId ?? '';
    this.visual = cfg.visual;
    this.behaviorType = cfg.behaviorType;
    this.poisonOnHit = cfg.poisonOnHit;
    this.burnOnHit = cfg.burnOnHit;
    // 任务4：boss 持有技能；任务8：chapter2_boss 持有污染技能；任务14：chapter3_boss 持有熔炉技能
    this.bossSkill = cfg.variant === 'boss' ? new BossSkill(this) : null;
    this.pollutionSkill = cfg.variant === 'chapter2_boss' ? new PollutionBossSkill(this) : null;
    this.furnaceSkill = cfg.variant === 'chapter3_boss' ? new FurnaceBossSkill(this) : null;
  }

  update(dt: number, player: PlayerMecha): void {
    if (this.dead || player.dead) {
      this.animationState = resolveEnemyAnimationState(this);
      this.animationPlayer.update(dt);
      return;
    }
    // 任务2：衰减受击闪烁（仅视觉）
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.hitReactionRemaining > 0) this.hitReactionRemaining = Math.max(0, this.hitReactionRemaining - dt);
    // 任务4：boss 技能推进（震荡冲击/召唤）；任务8：第二章 boss 污染技能；任务14：第三章 boss 熔炉技能
    if (this.bossSkill) this.bossSkill.update(dt, player);
    if (this.pollutionSkill) this.pollutionSkill.update(dt, player);
    if (this.furnaceSkill) this.furnaceSkill.update(dt, player);
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    const touchDist = this.radius + player.radius;

    if (dist > touchDist) {
      // 朝玩家移动
      const inv = dist > 0 ? 1 / dist : 0;
      this.x += dx * inv * this.speed * dt;
      this.y += dy * inv * this.speed * dt;
      this.isMoving = true;
      this.isAttacking = false;
    } else {
      // 已接触：定期造成伤害
      this.isMoving = false;
      this.isAttacking = true;
      this.attackTimer += dt;
      if (this.attackTimer >= this.attackInterval) {
        this.attackTimer = 0;
        player.takeDamage(this.attack);
        // 任务7：毒液敌人接触攻击施加毒液
        if (this.poisonOnHit) {
          player.statusEffects.applyPoison(
            this.poisonOnHit.duration, this.poisonOnHit.damagePerTick, this.poisonOnHit.tickInterval,
          );
        }
        // 任务13：火焰敌人接触攻击施加燃烧
        if (this.burnOnHit) {
          player.statusEffects.applyBurn(
            this.burnOnHit.duration, this.burnOnHit.damagePerTick, this.burnOnHit.tickInterval,
          );
        }
      }
    }
    this.animationState = resolveEnemyAnimationState({ ...this, hitFlash: Math.max(this.hitFlash, this.hitReactionRemaining) });
    this.animationPlayer.update(dt);
  }

  takeDamage(dmg: number): void {
    if (this.dead) return;
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      if (this.furnaceSkill) {
        this.furnaceSkill.stop();
      }
      if (this.pollutionSkill) {
        this.pollutionSkill.stop();
      }
      this.animationState = 'death';
      this.hitReactionRemaining = 0;
    } else {
      this.registerHit();
    }
  }

  /** 任务2：被命中时触发受击闪烁（仅渲染状态）。由 PlayerMecha.autoAttack 调用。 */
  registerHit(): void {
    if (!this.dead) {
      this.hitFlash = HIT_REACTION_SECONDS;
      this.hitReactionRemaining = HIT_REACTION_SECONDS;
      this.animationState = 'hit';
      this.animationPlayer.reset();
    }
  }

  get hpRatio(): number { return this.maxHp > 0 ? this.hp / this.maxHp : 0; }
  /** 任务4：是否 Boss */
  get isBoss(): boolean { return this.variant === 'boss' || this.variant === 'chapter2_boss' || this.variant === 'chapter3_boss'; }
}
