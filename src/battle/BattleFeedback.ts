import { ICanvas2D } from '../engine/IContext';
import { ResourceManager } from '../core/ResourceManager';
import { BATTLE_ASSETS, BATTLE_VISUAL_TUNING } from '../config/BattleAssets';
import { Theme } from '../render/Theme';
import { circle, energyRing, text } from '../render/DrawUtils';
export interface BattleHitFeedback {
  kind: 'basic' | 'skill';
  fromX: number; fromY: number; toX: number; toY: number;
  damage: number; killed: boolean; targetRadius: number;
}
export interface BattleFeedbackSnapshot {
  projectiles: number; damageNumbers: number; impacts: number;
  explosions: number; drops: number; collectedDrops: number;
}
type Fx = {
  x: number; y: number; age: number; life: number; fromX?: number; fromY?: number;
  toX?: number; toY?: number; kind?: 'basic' | 'skill'; value?: number;
  critical?: boolean; radius?: number; collected?: boolean; bob?: number;
};
type FeedbackPoint = { x: number; y: number };
type FeedbackProjector = (point: FeedbackPoint) => FeedbackPoint;
const FEEDBACK_LIMITS = {
  projectiles: 36,
  damageNumbers: 48,
  impacts: 48,
  explosions: 24,
  drops: 32,
} as const;

export class BattleFeedback {
  private projectiles: Fx[] = [];
  private damageNumbers: Fx[] = [];
  private impacts: Fx[] = [];
  private explosions: Fx[] = [];
  private drops: Fx[] = [];
  private collectedDrops = 0;
  private seed = 1;
  reset(): void {
    this.projectiles = []; this.damageNumbers = []; this.impacts = [];
    this.explosions = []; this.drops = []; this.collectedDrops = 0;
    this.seed = 1;
  }
  recordHit(hit: BattleHitFeedback): void {
    const dropRoll = this.random();
    const jitter = (this.random() - 0.5) * 14;
    this.projectiles.push({ fromX: hit.fromX, fromY: hit.fromY, toX: hit.toX, toY: hit.toY, x: hit.fromX, y: hit.fromY, kind: hit.kind, age: 0, life: 0.34 });
    this.damageNumbers.push({ x: hit.toX + jitter, y: hit.toY - hit.targetRadius - 10, value: Math.max(1, Math.round(hit.damage)), critical: hit.kind === 'skill', age: 0, life: 0.82 });
    this.impacts.push({ x: hit.toX, y: hit.toY, age: 0, life: 0.24 });
    if (!hit.killed) { this.enforceLimits(); return; }
    this.explosions.push({ x: hit.toX, y: hit.toY, radius: hit.targetRadius * 1.75, age: 0, life: 0.48 });
    if (dropRoll < 0.65) {
      this.drops.push({ x: hit.toX + jitter, y: hit.toY - 8, age: 0, life: 7.5, collected: false, bob: this.random() * Math.PI * 2 });
    }
    this.enforceLimits();
  }
  update(dt: number, playerX: number, playerY: number): void {
    for (const fx of [...this.projectiles, ...this.damageNumbers, ...this.impacts, ...this.explosions, ...this.drops]) fx.age += dt;
    for (const d of this.drops) {
      if (d.collected || d.age < 0.45) continue;
      const dx = playerX - d.x, dy = playerY - d.y, dist = Math.hypot(dx, dy);
      if (dist < 18) { d.collected = true; this.collectedDrops++; continue; }
      const pull = Math.min(1, dt * 3);
      d.x += dx * pull; d.y += dy * pull;
    }
    this.projectiles = this.live(this.projectiles);
    this.damageNumbers = this.live(this.damageNumbers);
    this.impacts = this.live(this.impacts);
    this.explosions = this.live(this.explosions);
    this.drops = this.live(this.drops).filter(f => !f.collected);
  }
  render(c: ICanvas2D, project: FeedbackProjector = p => p): void {
    const rm = ResourceManager.getInstance();
    c.save();
    for (const p of this.projectiles) {
      const t = Math.min(1, p.age / p.life);
      const from = project({ x: p.fromX!, y: p.fromY! });
      const to = project({ x: p.toX!, y: p.toY! });
      const x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
      c.strokeStyle = p.kind === 'skill' ? Theme.color.gold : Theme.color.cyan;
      c.lineWidth = p.kind === 'skill' ? BATTLE_VISUAL_TUNING.projectileVisualWidth + 1 : BATTLE_VISUAL_TUNING.projectileVisualWidth;
      c.beginPath(); c.moveTo(from.x, from.y); c.lineTo(x, y); c.stroke();
      circle(c, x, y, p.kind === 'skill' ? 6 : BATTLE_VISUAL_TUNING.projectileCoreRadius, Theme.color.white);
    }
    for (const i of this.impacts) {
      const a = Math.max(0, 1 - i.age / i.life);
      const p = project(i);
      c.globalAlpha = a; energyRing(c, p.x, p.y, 8 + 12 * (1 - a), Theme.color.gold, 0.8, i.age * 10);
    }
    c.globalAlpha = 1;
    for (const e of this.explosions) {
      const p = project(e);
      const t = e.age / e.life;
      c.globalAlpha = 1 - t; circle(c, p.x, p.y, e.radius! * (0.4 + t), Theme.color.orange);
      energyRing(c, p.x, p.y, e.radius! * (0.8 + t), Theme.color.redBright, 0.9, t * 4);
    }
    c.globalAlpha = 1;
    for (const d of this.drops) {
      const p = project({ x: d.x, y: d.y + Math.sin(d.age * 6 + d.bob!) * 3 });
      const img = rm.getImage(BATTLE_ASSETS.drops.coin.resourceKey);
      if (img) c.drawImage(img, p.x - 10, p.y - 10, 20, 20); else circle(c, p.x, p.y, 8, Theme.color.gold);
    }
    for (const n of this.damageNumbers) {
      const t = n.age / n.life;
      const p = project({ x: n.x, y: n.y - t * BATTLE_VISUAL_TUNING.damageTextRise });
      text(c, `-${n.value}`, p.x, p.y, {
        color: n.critical ? Theme.color.gold : Theme.color.cyan,
        align: 'center',
        font: n.critical ? BATTLE_VISUAL_TUNING.skillDamageFont : BATTLE_VISUAL_TUNING.basicDamageFont,
      });
    }
    c.restore();
  }
  snapshot(): BattleFeedbackSnapshot {
    return { projectiles: this.projectiles.length, damageNumbers: this.damageNumbers.length, impacts: this.impacts.length, explosions: this.explosions.length, drops: this.drops.length, collectedDrops: this.collectedDrops };
  }
  private enforceLimits(): void {
    this.projectiles = this.keepLatest(this.projectiles, FEEDBACK_LIMITS.projectiles);
    this.damageNumbers = this.keepLatest(this.damageNumbers, FEEDBACK_LIMITS.damageNumbers);
    this.impacts = this.keepLatest(this.impacts, FEEDBACK_LIMITS.impacts);
    this.explosions = this.keepLatest(this.explosions, FEEDBACK_LIMITS.explosions);
    this.drops = this.keepLatest(this.drops, FEEDBACK_LIMITS.drops);
  }
  private keepLatest(items: Fx[], max: number): Fx[] {
    return items.length <= max ? items : items.slice(items.length - max);
  }
  private live(items: Fx[]): Fx[] { return items.filter(f => f.age < f.life); }
  private random(): number { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }
}
