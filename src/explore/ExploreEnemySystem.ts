import type { IContext } from '../engine/IContext';
import type { PlayerMecha } from '../player/PlayerMecha';
import { EnemyMouse } from '../enemy/EnemyMouse';
import type { ExploreSpawnPointConfig } from './ExploreContentConfig';
import { TRAINING_GROUND_CONTENT } from './ExploreContentConfig';
import { clampWorldPoint } from './WorldTransform';
import { separateExploreEnemies } from './ExploreEnemySeparation';
import { getDefaultContentRegistry } from '../content/registry/ContentRegistry';
import { createEnemyConfigFromTemplate } from '../content/adapters/EnemyTemplateAdapter';
import type { ExplorationStageConfig } from '../content/models/StageDefinition';
export interface ExploreSpawnPoint extends ExploreSpawnPointConfig {
  elapsedMs: number;
}

export function createExploreSpawnPoints(exploration?: ExplorationStageConfig): ExploreSpawnPoint[] {
  const groups = exploration?.spawnGroups ?? TRAINING_GROUND_CONTENT.spawnPoints.map(point => ({
    id: point.id, enemyTemplateId: point.enemyTemplateId,
    spawnPoint: { x: point.x, y: point.y, radius: point.radius }, initialCount: point.initialCount,
    maxAlive: point.maxAlive, respawnInterval: point.intervalMs, active: point.active,
  }));
  return groups.map(group => ({
    id: group.id, x: group.spawnPoint.x, y: group.spawnPoint.y, radius: group.spawnPoint.radius,
    enemyTemplateId: group.enemyTemplateId,
    enemyType: 'mouse', maxAlive: group.maxAlive, intervalMs: group.respawnInterval,
    initialCount: group.initialCount, active: group.active, elapsedMs: group.respawnInterval,
  }));
}

export function seedExploreEnemies(
  ctx: IContext, player: PlayerMecha, spawns: ExploreSpawnPoint[], worldWidth: number, worldHeight: number,
): EnemyMouse[] {
  const enemies: EnemyMouse[] = [];
  for (const sp of spawns) {
    for (let i = 0; i < sp.initialCount; i++) {
      const enemy = spawnAtPoint(ctx, player, sp, worldWidth, worldHeight, i);
      if (enemy) enemies.push(enemy);
    }
  }
  return enemies;
}

export function updateExploreSpawns(
  ctx: IContext, player: PlayerMecha, enemies: EnemyMouse[], spawns: ExploreSpawnPoint[],
  worldWidth: number, worldHeight: number, dt: number, paused: boolean,
): number {
  if (paused) return 0;
  let spawned = 0;
  for (const sp of spawns) {
    if (!sp.active) continue;
    sp.elapsedMs += dt * 1000;
    const alive = enemies.filter(e => !e.dead && e.spawnPointId === sp.id).length;
    if (alive >= sp.maxAlive || sp.elapsedMs < sp.intervalMs) continue;
    const enemy = spawnAtPoint(ctx, player, sp, worldWidth, worldHeight, alive + spawned);
    if (!enemy) continue;
    enemies.push(enemy);
    sp.elapsedMs = 0;
    spawned++;
  }
  return spawned;
}

export function updateExploreEnemyAI(
  enemies: EnemyMouse[], player: PlayerMecha, worldWidth: number, worldHeight: number, dt: number,
): void {
  const ai = TRAINING_GROUND_CONTENT.enemyAI;
  for (const e of enemies) {
    if (e.dead) { e.exploreState = 'dead'; continue; }
    const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    if (distToPlayer <= ai.attackRange) { e.exploreState = 'attack'; e.update(dt, player); }
    else if (distToPlayer <= ai.alertRadius) { e.exploreState = 'chase'; e.update(dt, player); }
    else if (e.exploreState === 'chase' && distToPlayer > ai.chaseGiveUpRadius) e.exploreState = 'alert';
    else patrolEnemy(e, dt);
    const p = clampWorldPoint(e, worldWidth, worldHeight, e.radius);
    e.x = p.x; e.y = p.y;
  }
  separateExploreEnemies(enemies, worldWidth, worldHeight);
}

function spawnAtPoint(
  ctx: IContext, player: PlayerMecha, sp: ExploreSpawnPoint, worldWidth: number, worldHeight: number, index: number,
): EnemyMouse | null {
  const template = getDefaultContentRegistry().getEnemy(sp.enemyTemplateId);
  const cfg = createEnemyConfigFromTemplate(template);
  const angle = (index * 2.399 + ctx.random() * 0.7) % (Math.PI * 2);
  const radius = sp.radius * (0.35 + ctx.random() * 0.55);
  let p = clampWorldPoint({ x: sp.x + Math.cos(angle) * radius, y: sp.y + Math.sin(angle) * radius },
    worldWidth, worldHeight, cfg.radius);
  if (Math.hypot(p.x - player.x, p.y - player.y) < TRAINING_GROUND_CONTENT.enemyAI.playerSpawnSafeRadius) {
    p = clampWorldPoint({ x: sp.x, y: sp.y }, worldWidth, worldHeight, cfg.radius);
  }
  if (Math.hypot(p.x - player.x, p.y - player.y) < TRAINING_GROUND_CONTENT.enemyAI.playerSpawnSafeRadius) return null;
  const e = new EnemyMouse(ctx, cfg, p.x, p.y);
  e.spawnPointId = sp.id; e.homeX = sp.x; e.homeY = sp.y; e.exploreState = 'patrol';
  pickPatrolTarget(e);
  return e;
}

function patrolEnemy(e: EnemyMouse, dt: number): void {
  e.exploreState = e.exploreState === 'idle' ? 'idle' : 'patrol';
  const dx = e.patrolTargetX - e.x, dy = e.patrolTargetY - e.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 8) { pickPatrolTarget(e); return; }
  e.x += dx / dist * e.speed * 0.34 * dt;
  e.y += dy / dist * e.speed * 0.34 * dt;
}

function pickPatrolTarget(e: EnemyMouse): void {
  const seed = (e.homeX * 13 + e.homeY * 7 + e.x * 3 + e.y) % 360;
  const angle = seed / 360 * Math.PI * 2;
  const radius = TRAINING_GROUND_CONTENT.enemyAI.patrolRadius * 0.72;
  e.patrolTargetX = e.homeX + Math.cos(angle) * radius;
  e.patrolTargetY = e.homeY + Math.sin(angle) * radius;
}
