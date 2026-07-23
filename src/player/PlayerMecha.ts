/**
 * 玩家机甲实体
 * ------------------------------------------------------------------
 * 行为：
 *  - 按 input.moveX/moveY 移动，速度 = mechaConfig.speed
 *  - 屏幕边界夹取（不超出画布）
 *  - 自动攻击：每 attackCooldown 秒扫描半径内最近敌人，造成 attack 伤害
 *  - 受伤：takeDamage，hp 归 0 → dead=true（由 BattleManager 判负）
 *  - 任务5：主动技能（喵能炮扇形伤害 / 重甲护盾减伤），朝向管理
 *
 * 与具体平台解耦：只接收 ctx.input，不直接读 wx/键盘。
 */
import { IContext } from '../engine/IContext';
import { MechaConfig } from '../data/MechaConfig';
import { EnemyMouse } from '../enemy/EnemyMouse';
import { SkillState } from './SkillState';
import { StatusEffectManager } from './StatusEffect';
import { DEFAULT_SKILL_IDS, getSkillConfig, getSkillEffect, HEAVY_SHIELD } from '../data/SkillConfig';
import type { PlayerBattleStats } from '../data/EquipmentCalc';
import { SoundManager } from '../core/SoundManager';
import type { BattleHitFeedback } from '../battle/BattleFeedback';
import { FrameSequencePlayer } from '../animation/FrameSequencePlayer';
import { resolveHeroAnimationState, type RuntimeAnimationState } from '../animation/AnimationStateResolver';
import { projectileHitsTerrain, type ExploreTerrainObstacle } from '../explore/ExploreTerrain';

/** 任务5：技能释放结果 */
export interface SkillUseResult {
  ok: boolean;
  reason?: 'cooldown' | 'not_found';
  /** 命中敌人数（喵能炮） */
  hitCount?: number;
  /** 总造成伤害（喵能炮） */
  damageDealt?: number;
}

export interface ActiveProjectileView {
  x: number; y: number; fromX: number; fromY: number;
  targetX: number; targetY: number; kind: 'basic';
}

export interface MovementBounds {
  minX: number; minY: number; maxX: number; maxY: number;
}

interface ActiveProjectile extends ActiveProjectileView {
  target: EnemyMouse | null;
  damage: number;
  speed: number;
  age: number;
  maxAge: number;
  targetRadius: number;
}

const AUTO_ATTACK_CONFIG = {
  enabled: true,
  projectileSpeed: 720,
  maxFlightSec: 1.2,
  maxProjectiles: 36,
} as const;
const HIT_REACTION_SECONDS = 0.18;

export class PlayerMecha {
  public x: number;
  public y: number;
  public hp: number;
  public maxHp: number;
  public attack: number;
  public readonly radius = 18;
  public readonly color: string;
  public dead = false;
  /** 任务9：装备/符文加成 */
  public damageReduction = 0;
  public poisonResist = 0;
  public fireResist = 0;
  public skillDamageBonus = 0;
  public shieldDurationBonus = 0;
  public attackCooldown: number;
  public attackRange: number;
  public speed: number;
  public movementBounds: MovementBounds | null = null;

  /** 任务2：渲染状态（受击闪烁/攻击闪光），不影响碰撞与战斗逻辑 */
  public hitFlash = 0;
  public attackFlash = 0;
  /** 最近一次自动攻击命中的目标方向（用于炮口朝向），-1左/1右 */
  public facing = 0;

  /** 任务5：朝向角（弧度），默认 0=右；移动/攻击时更新。喵能炮判定用 */
  public facingAngle = 0;
  /** 任务5：局内技能状态 */
  public readonly skillState: SkillState;
  /** 任务5：喵能炮释放特效计时（秒），>0 时 render 画能量光束 */
  public meowCannonFlash = 0;
  /** 任务5：护盾受击蓝色闪烁计时 */
  public shieldHitFlash = 0;
  /** 任务7：状态效果（毒液等） */
  public readonly statusEffects = new StatusEffectManager();
  public readonly animationPlayer = new FrameSequencePlayer();
  public animationState: RuntimeAnimationState = 'idle';
  private hitReactionRemaining = 0;

  private attackTimer = 0; // 累计冷却
  private readonly config: MechaConfig;
  private readonly combatFeedback: BattleHitFeedback[] = [];
  private readonly projectiles: ActiveProjectile[] = [];

  constructor(
    private ctx: IContext,
    config: MechaConfig,
    level: number,
    startX: number,
    startY: number,
    /** 任务6：技能等级（决定技能效果）；缺省用等级1 */
    skillLevels?: Record<string, number>,
    /** 任务9：装备/符文战斗属性加成；缺省无加成 */
    battleStats?: PlayerBattleStats,
  ) {
    this.config = config;
    // 任务9：maxHp/attack 优先用 battleStats（含装备加成），否则按 level 算
    if (battleStats) {
      this.maxHp = battleStats.maxHp;
      this.attack = battleStats.attack;
      this.damageReduction = battleStats.damageReduction ?? 0;
      this.poisonResist = battleStats.poisonResist ?? 0;
      this.fireResist = battleStats.fireResist ?? 0;
      this.skillDamageBonus = battleStats.skillDamageBonus ?? 0;
      this.shieldDurationBonus = battleStats.shieldDurationBonus ?? 0;
      this.attackCooldown = (battleStats as any).attackInterval ?? config.attackCooldown;
      this.attackRange = (battleStats as any).attackRange ?? config.attackRange;
      this.speed = (battleStats as any).speed ?? config.speed;
    } else {
      this.maxHp = config.baseHp + (level - 1) * config.hpGrowth;
      this.attack = config.baseAtk + (level - 1) * config.atkGrowth;
      this.attackCooldown = config.attackCooldown;
      this.attackRange = config.attackRange;
      this.speed = config.speed;
    }
    this.hp = this.maxHp;
    this.color = config.color;
    // 任务5/6：初始化局内技能状态（默认全解锁），传入技能等级
    this.skillState = new SkillState(
      DEFAULT_SKILL_IDS.map(id => getSkillConfig(id)!).filter(Boolean),
      skillLevels,
      battleStats?.cooldownReduction ?? 0, // 任务9：冷却缩减
    );
    this.x = startX;
    this.y = startY;
  }

  /** 每帧更新。enemies 由 BattleManager 传入。 */
  update(dt: number, enemies: EnemyMouse[], projectileBlockers: readonly ExploreTerrainObstacle[] = []): void {
    if (this.dead) {
      this.animationState = 'death';
      this.animationPlayer.update(dt);
      return;
    }
    this.move(dt);
    this.updateProjectiles(dt, projectileBlockers);
    this.autoAttack(dt, enemies);
    // 任务2/5：衰减渲染计时器（仅视觉，不影响逻辑）
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.hitReactionRemaining > 0) this.hitReactionRemaining = Math.max(0, this.hitReactionRemaining - dt);
    if (this.attackFlash > 0) this.attackFlash = Math.max(0, this.attackFlash - dt);
    if (this.meowCannonFlash > 0) this.meowCannonFlash = Math.max(0, this.meowCannonFlash - dt);
    if (this.shieldHitFlash > 0) this.shieldHitFlash = Math.max(0, this.shieldHitFlash - dt);
    // 任务5：技能时间状态衰减
    this.skillState.update(dt);
    // 任务7：状态效果（毒液）推进
    this.statusEffects.update(dt, this);
    this.animationState = resolveHeroAnimationState({ dead: this.dead, hitFlash: Math.max(this.hitFlash, this.hitReactionRemaining), attackFlash: this.attackFlash, ctx: this.ctx });
    this.animationPlayer.update(dt);
  }

  private move(dt: number): void {
    const ix = this.ctx.input.moveX;
    const iy = this.ctx.input.moveY;
    if (ix === 0 && iy === 0) return;
    (this.ctx as any).playerMoved = true;
    // 任务5：更新朝向角（移动方向）
    this.facingAngle = Math.atan2(iy, ix);
    this.facing = ix >= 0 ? 1 : -1;
    this.x += ix * this.speed * dt;
    this.y += iy * this.speed * dt;
    const bounds = this.movementBounds ?? {
      minX: this.radius,
      minY: this.radius,
      maxX: this.ctx.canvasWidth - this.radius,
      maxY: this.ctx.canvasHeight - this.radius,
    };
    if (this.x < bounds.minX) this.x = bounds.minX;
    if (this.x > bounds.maxX) this.x = bounds.maxX;
    if (this.y < bounds.minY) this.y = bounds.minY;
    if (this.y > bounds.maxY) this.y = bounds.maxY;
  }

  private autoAttack(dt: number, enemies: EnemyMouse[]): void {
    if (!AUTO_ATTACK_CONFIG.enabled) return;
    this.attackTimer += dt;
    if (this.attackTimer < this.attackCooldown) return;
    // 找最近敌人
    let nearest: EnemyMouse | null = null;
    let nearestDist = this.attackRange;
    for (const e of enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < nearestDist) { nearestDist = d; nearest = e; }
    }
    if (!nearest) return;
    this.attackTimer = 0;
    this.facingAngle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
    this.attackFlash = 0.12;
    this.facing = nearest.x >= this.x ? 1 : -1;
    this.spawnProjectile(nearest);
    SoundManager.getInstance().play('attack');
  }

  private spawnProjectile(target: EnemyMouse): void {
    this.projectiles.push({
      x: this.x, y: this.y, fromX: this.x, fromY: this.y,
      targetX: target.x, targetY: target.y, target,
      damage: this.attack,
      speed: AUTO_ATTACK_CONFIG.projectileSpeed,
      age: 0,
      maxAge: AUTO_ATTACK_CONFIG.maxFlightSec,
      kind: 'basic',
      targetRadius: target.radius,
    });
    if (this.projectiles.length > AUTO_ATTACK_CONFIG.maxProjectiles) {
      this.projectiles.splice(0, this.projectiles.length - AUTO_ATTACK_CONFIG.maxProjectiles);
    }
  }

  private updateProjectiles(dt: number, projectileBlockers: readonly ExploreTerrainObstacle[]): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      const target = p.target && !p.target.dead ? p.target : null;
      if (target) { p.targetX = target.x; p.targetY = target.y; p.targetRadius = target.radius; }
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      const travel = Math.min(dist, p.speed * dt);
      const next = { x: p.x + dx / dist * travel, y: p.y + dy / dist * travel };
      if (p.kind === 'basic' && projectileHitsTerrain(p, next, projectileBlockers)) {
        this.projectiles.splice(i, 1);
        continue;
      }
      const hit = dist <= p.speed * dt || (target && dist <= target.radius + 4);
      if (hit) {
        p.x = p.targetX; p.y = p.targetY;
        if (target) this.resolveProjectileHit(p, target);
        this.projectiles.splice(i, 1);
        continue;
      }
      if (p.age >= p.maxAge || dist <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }
      p.x = next.x;
      p.y = next.y;
    }
  }

  private resolveProjectileHit(projectile: ActiveProjectile, target: EnemyMouse): void {
    const hpBefore = target.hp;
    target.takeDamage(projectile.damage);
    target.registerHit();
    this.combatFeedback.push({
      kind: 'basic',
      fromX: projectile.fromX, fromY: projectile.fromY,
      toX: target.x, toY: target.y,
      damage: Math.min(projectile.damage, hpBefore),
      killed: target.dead,
      targetRadius: target.radius,
    });
  }

  takeDamage(dmg: number): void {
    if (this.dead) return;

    // 任务5/6：重甲护盾减伤（按当前等级 damageReduction；含普通敌人接触 + Boss 震荡冲击）
    let actual = dmg;
    if (this.shieldActive) {
      const level = this.skillState.getLevel(HEAVY_SHIELD.id);
      const effect = getSkillEffect(HEAVY_SHIELD.id, level);
      const reduction = effect?.damageReduction ?? 0.5;
      actual = dmg * (1 - reduction);
      this.shieldHitFlash = 0.2; // 护盾受击蓝闪
    }
    // 任务9：装备/符文伤害减免 + 毒液抗性（poison 走单独路径，此处是常规伤害减免）
    actual = actual * (1 - this.damageReduction);
    this.hp -= actual;
    // 任务2：受击闪烁（仅视觉）
    this.hitFlash = HIT_REACTION_SECONDS;
    this.hitReactionRemaining = HIT_REACTION_SECONDS;
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.statusEffects.clear();
      this.animationState = 'death';
      this.hitReactionRemaining = 0;
    } else {
      this.animationState = 'hit';
      this.animationPlayer.reset();
    }
  }

  /** 任务5：重甲护盾是否激活 */
  get shieldActive(): boolean {
    return this.skillState.isShieldActive(HEAVY_SHIELD.id);
  }

  /**
   * 任务5：释放主动技能。
   * 喵能炮：判定前方扇形范围敌人，造成 damage；返回命中数与总伤害。
   * 重甲护盾：仅激活（减伤在 takeDamage 查询），无命中。
   */
  useSkill(skillId: string, enemies: EnemyMouse[]): SkillUseResult {
    const cfg = getSkillConfig(skillId);
    if (!cfg) return { ok: false, reason: 'not_found' };
    if (!this.skillState.canUse(skillId)) return { ok: false, reason: 'cooldown' };

    const res = this.skillState.use(skillId);
    if (!res.ok) return { ok: false, reason: 'cooldown' };
    SoundManager.getInstance().play('attack');

    if (cfg.type === 'damage') {
      // 任务6：喵能炮伤害/范围/半角按当前等级 effect 读取
      this.meowCannonFlash = 0.25;
      const level = this.skillState.getLevel(skillId);
      const effect = getSkillEffect(skillId, level);
      // 任务9：装备/符文技能伤害加成
      const baseDamage = effect?.damage ?? cfg.effects[0].damage ?? 0;
      const damage = Math.round(baseDamage * (1 + this.skillDamageBonus));
      const range = effect?.range ?? cfg.effects[0].range ?? 0;
      const halfAngle = effect?.halfAngle ?? cfg.effects[0].halfAngle ?? Math.PI / 4;
      let hitCount = 0;
      let damageDealt = 0;
      for (const e of enemies) {
        if (e.dead) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > range + e.radius) continue;
        if (dist <= 0) {
          // 重叠，视为命中
        } else {
          const ang = Math.atan2(dy, dx);
          let diff = Math.abs(ang - this.facingAngle);
          if (diff > Math.PI) diff = Math.PI * 2 - diff;
          if (diff > halfAngle) continue;
        }
        const hpBefore = e.hp;
        e.takeDamage(damage);
        e.registerHit();
        this.combatFeedback.push({
          kind: 'skill', fromX: this.x, fromY: this.y, toX: e.x, toY: e.y,
          damage: Math.min(damage, hpBefore), killed: e.dead, targetRadius: e.radius,
        });
        hitCount++;
        damageDealt += damage;
      }
      return { ok: true, hitCount, damageDealt };
    }

    // 护盾：已激活。任务9：符文 shieldDurationBonus 加到持续时间
    if (cfg.type === 'shield') {
      const ss = this.skillState.get(HEAVY_SHIELD.id);
      if (ss && ss.isActive) {
        ss.activeRemaining += this.shieldDurationBonus;
      }
    }
    return { ok: true, hitCount: 0, damageDealt: 0 };
  }

  /** 给 UI 画血条用 */
  get hpRatio(): number { return this.maxHp > 0 ? this.hp / this.maxHp : 0; }

  drainCombatFeedback(): BattleHitFeedback[] {
    const events = this.combatFeedback.slice();
    this.combatFeedback.length = 0;
    return events;
  }

  get activeProjectileCount(): number {
    return this.projectiles.length;
  }

  getActiveProjectiles(): ActiveProjectileView[] {
    return this.projectiles.map(p => ({
      x: p.x, y: p.y, fromX: p.fromX, fromY: p.fromY,
      targetX: p.targetX, targetY: p.targetY, kind: p.kind,
    }));
  }

  clearActiveProjectiles(): void {
    this.projectiles.length = 0;
  }
}
