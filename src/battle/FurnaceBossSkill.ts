import { PlayerMecha } from '../player/PlayerMecha';

export interface LavaPool {
  cx: number;
  cy: number;
  radius: number;
  phase: 'warning' | 'active';
  timer: number;
  tickTimer: number;
}

export interface FurnaceSkillRenderState {
  phase: 'warning' | 'blast';
  cx: number;
  cy: number;
  radius: number;
  progress: number;
}

export interface FissureRenderState {
  phase: 'warning' | 'blast';
  bx: number; by: number; // boss起点
  tx: number; ty: number; // 目标终点
  width: number;
  progress: number;
}

export class FurnaceBossSkill {
  private roarPhase: 'idle' | 'warning' | 'blast' | 'cooldown' = 'idle';
  private roarTimer = 0;
  private roarCx = 0;
  private roarCy = 0;
  private roarHit = false;

  private fissurePhase: 'idle' | 'warning' | 'blast' | 'cooldown' = 'idle';
  private fissureTimer = 0;
  private fissureBx = 0; private fissureBy = 0;
  private fissureTx = 0; private fissureTy = 0;
  private fissureHit = false;

  private summonTriggered = false;
  private lavaPools: LavaPool[] = [];
  private poolSpawnTimer = 0;
  private disabled = false;

  public onSummon: ((count: number) => void) | null = null;

  constructor(private bossRef: { x: number; y: number; hp: number; maxHp: number; dead: boolean }) {}

  update(dt: number, player: PlayerMecha): void {
    if (this.disabled) return;
    if (this.bossRef.dead) {
      this.clearAll();
      this.disabled = true;
      return;
    }
    this.tryPhaseTwo(dt, player);
    this.updateRoar(dt, player);
    this.updateFissure(dt, player);
  }

  private tryPhaseTwo(dt: number, player: PlayerMecha): void {
    const ratio = this.bossRef.maxHp > 0 ? this.bossRef.hp / this.bossRef.maxHp : 1;
    if (ratio >= 0.5) return;

    if (!this.summonTriggered) {
      this.summonTriggered = true;
      this.onSummon?.(2);
    }

    this.poolSpawnTimer += dt;
    if (this.poolSpawnTimer >= 6.0) {
      this.poolSpawnTimer = 0;
      this.lavaPools.push({
        cx: player.x, cy: player.y, radius: 37.5,
        phase: 'warning', timer: 0, tickTimer: 0,
      });
    }

    this.lavaPools = this.lavaPools.filter(pool => {
      pool.timer += dt;
      if (pool.phase === 'warning') {
        if (pool.timer >= 1.0) {
          pool.phase = 'active';
          pool.timer = 0;
          pool.tickTimer = 0;
        }
      } else {
        pool.tickTimer += dt;
        if (pool.tickTimer >= 0.5) {
          pool.tickTimer -= 0.5;
          const dist = Math.hypot(player.x - pool.cx, player.y - pool.cy);
          if (dist <= pool.radius + player.radius) {
            player.takeDamage(3);
            player.statusEffects.applyBurn(3, 3, 1);
          }
        }
        if (pool.timer >= 4.0) return false;
      }
      return true;
    });
  }

  private updateRoar(dt: number, player: PlayerMecha): void {
    this.roarTimer += dt;
    switch (this.roarPhase) {
      case 'idle':
        if (this.roarTimer >= 8.0) {
          this.roarPhase = 'warning';
          this.roarTimer = 0;
          this.roarCx = player.x;
          this.roarCy = player.y;
          this.roarHit = false;
        }
        break;
      case 'warning':
        if (this.roarTimer >= 1.2) {
          this.roarPhase = 'blast';
          this.roarTimer = 0;
        }
        break;
      case 'blast':
        if (!this.roarHit) {
          this.roarHit = true;
          const dist = Math.hypot(player.x - this.roarCx, player.y - this.roarCy);
          if (dist <= 85) {
            player.takeDamage(15);
            player.statusEffects.applyBurn(3, 3, 1);
          }
        }
        if (this.roarTimer >= 0.4) {
          this.roarPhase = 'cooldown';
          this.roarTimer = 0;
        }
        break;
      case 'cooldown':
        if (this.roarTimer >= 8.0) {
          this.roarPhase = 'warning';
          this.roarTimer = 0;
          this.roarCx = player.x;
          this.roarCy = player.y;
          this.roarHit = false;
        }
        break;
    }
  }

  private updateFissure(dt: number, player: PlayerMecha): void {
    this.fissureTimer += dt;
    switch (this.fissurePhase) {
      case 'idle':
        if (this.fissureTimer >= 10.0) {
          this.fissurePhase = 'warning';
          this.fissureTimer = 0;
          this.fissureBx = this.bossRef.x;
          this.fissureBy = this.bossRef.y;
          
          const dx = player.x - this.fissureBx;
          const dy = player.y - this.fissureBy;
          const dist = Math.hypot(dx, dy);
          const ux = dist > 0 ? dx / dist : 0;
          const uy = dist > 0 ? dy / dist : 0;

          this.fissureTx = this.fissureBx + ux * 300;
          this.fissureTy = this.fissureBy + uy * 300;
          this.fissureHit = false;
        }
        break;
      case 'warning':
        if (this.fissureTimer >= 1.5) {
          this.fissurePhase = 'blast';
          this.fissureTimer = 0;
        }
        break;
      case 'blast':
        if (!this.fissureHit) {
          this.fissureHit = true;
          const bx = this.fissureBx, by = this.fissureBy;
          const tx = this.fissureTx, ty = this.fissureTy;
          const dx = tx - bx, dy = ty - by;
          const lenSq = dx * dx + dy * dy;
          if (lenSq > 0) {
            const t = ((player.x - bx) * dx + (player.y - by) * dy) / lenSq;
            if (t >= 0 && t <= 1) {
              const projX = bx + t * dx;
              const projY = by + t * dy;
              const dist = Math.hypot(player.x - projX, player.y - projY);
              if (dist <= 25 + player.radius) {
                player.takeDamage(18);
                player.statusEffects.applyBurn(4, 3, 1);
              }
            }
          }
        }
        if (this.fissureTimer >= 0.4) {
          this.fissurePhase = 'cooldown';
          this.fissureTimer = 0;
        }
        break;
      case 'cooldown':
        if (this.fissureTimer >= 10.0) {
          this.fissurePhase = 'warning';
          this.fissureTimer = 0;
          this.fissureBx = this.bossRef.x;
          this.fissureBy = this.bossRef.y;
          
          const dx = player.x - this.fissureBx;
          const dy = player.y - this.fissureBy;
          const dist = Math.hypot(dx, dy);
          const ux = dist > 0 ? dx / dist : 0;
          const uy = dist > 0 ? dy / dist : 0;

          this.fissureTx = this.fissureBx + ux * 300;
          this.fissureTy = this.fissureBy + uy * 300;
          this.fissureHit = false;
        }
        break;
    }
  }

  getRoarRenderState(): FurnaceSkillRenderState | null {
    if (this.roarPhase === 'warning') {
      return { phase: 'warning', cx: this.roarCx, cy: this.roarCy, radius: 85, progress: Math.min(1, this.roarTimer / 1.2) };
    }
    if (this.roarPhase === 'blast') {
      return { phase: 'blast', cx: this.roarCx, cy: this.roarCy, radius: 85, progress: Math.min(1, this.roarTimer / 0.4) };
    }
    return null;
  }

  getFissureRenderState(): FissureRenderState | null {
    if (this.fissurePhase === 'warning') {
      return { phase: 'warning', bx: this.fissureBx, by: this.fissureBy, tx: this.fissureTx, ty: this.fissureTy, width: 50, progress: Math.min(1, this.fissureTimer / 1.5) };
    }
    if (this.fissurePhase === 'blast') {
      return { phase: 'blast', bx: this.fissureBx, by: this.fissureBy, tx: this.fissureTx, ty: this.fissureTy, width: 50, progress: Math.min(1, this.fissureTimer / 0.4) };
    }
    return null;
  }

  getLavaPools(): LavaPool[] {
    return this.lavaPools;
  }

  get hasSummoned(): boolean { return this.summonTriggered; }
  get isDisabled(): boolean { return this.disabled; }
  get currentRoarPhase(): string { return this.roarPhase; }
  get currentFissurePhase(): string { return this.fissurePhase; }

  stop(): void {
    this.disabled = true;
    this.clearAll();
  }

  clear(): void {
    this.clearAll();
  }

  private clearAll(): void {
    this.lavaPools = [];
    this.roarPhase = 'idle';
    this.fissurePhase = 'idle';
  }
}
