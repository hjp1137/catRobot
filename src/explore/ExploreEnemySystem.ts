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
import { projectileHitsTerrain, type ExploreTerrainObstacle } from './ExploreTerrain';
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
  obstacles: readonly ExploreTerrainObstacle[] = [],
): EnemyMouse[] {
  const enemies: EnemyMouse[] = [];
  for (const sp of spawns) {
    for (let i = 0; i < sp.initialCount; i++) {
      const enemy = spawnAtPoint(ctx, player, sp, worldWidth, worldHeight, i, obstacles);
      if (enemy) enemies.push(enemy);
    }
  }
  return enemies;
}

export function updateExploreSpawns(
  ctx: IContext, player: PlayerMecha, enemies: EnemyMouse[], spawns: ExploreSpawnPoint[],
  worldWidth: number, worldHeight: number, dt: number, paused: boolean,
  obstacles: readonly ExploreTerrainObstacle[] = [],
): number {
  if (paused) return 0;
  let spawned = 0;
  for (const sp of spawns) {
    if (!sp.active) continue;
    sp.elapsedMs += dt * 1000;
    const alive = enemies.filter(e => !e.dead && e.spawnPointId === sp.id).length;
    if (alive >= sp.maxAlive || sp.elapsedMs < sp.intervalMs) continue;
    const enemy = spawnAtPoint(ctx, player, sp, worldWidth, worldHeight, alive + spawned, obstacles);
    if (!enemy) continue;
    enemies.push(enemy);
    sp.elapsedMs = 0;
    spawned++;
  }
  return spawned;
}

export function updateExploreEnemyAI(
  enemies: EnemyMouse[], player: PlayerMecha, worldWidth: number, worldHeight: number, dt: number,
  obstacles: readonly ExploreTerrainObstacle[] = [],
): void {
  const ai = TRAINING_GROUND_CONTENT.enemyAI;
  for (const e of enemies) {
    if (e.dead) { e.exploreState = 'dead'; continue; }
    const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    if (distToPlayer <= ai.attackRange) { e.exploreState = 'attack'; e.update(dt, player); }
    else if (distToPlayer <= ai.alertRadius) { e.exploreState = 'chase'; e.update(dt, player); }
    else if (e.exploreState === 'chase' && distToPlayer > ai.chaseGiveUpRadius) {
      e.exploreState = 'alert';
      e.syncExploreMotionAnimation(dt, false);
    }
    else patrolEnemy(e, dt, obstacles);
    const p = clampWorldPoint(e, worldWidth, worldHeight, e.radius);
    e.x = p.x; e.y = p.y;
  }
  separateExploreEnemies(enemies, worldWidth, worldHeight);
}

function spawnAtPoint(
  ctx: IContext, player: PlayerMecha, sp: ExploreSpawnPoint, worldWidth: number, worldHeight: number, index: number,
  obstacles: readonly ExploreTerrainObstacle[],
): EnemyMouse | null {
  const template = getDefaultContentRegistry().getEnemy(sp.enemyTemplateId);
  const cfg = createEnemyConfigFromTemplate(template);
  const angle = (index * 2.399 + ctx.random() * 0.7) % (Math.PI * 2);
  const radius = sp.radius * (0.35 + ctx.random() * 0.55);
  const preferred = { x: sp.x + Math.cos(angle) * radius, y: sp.y + Math.sin(angle) * radius };
  const p = findWalkableSpawnPoint(preferred, angle, sp, player, cfg.radius, worldWidth, worldHeight, obstacles);
  if (!p) return null;
  const e = new EnemyMouse(ctx, cfg, p.x, p.y);
  e.spawnPointId = sp.id; e.homeX = sp.x; e.homeY = sp.y; e.exploreState = 'patrol';
  pickPatrolTarget(e, obstacles);
  return e;
}

function findWalkableSpawnPoint(
  preferred: { x: number; y: number }, baseAngle: number, sp: ExploreSpawnPoint, player: PlayerMecha,
  enemyRadius: number, worldWidth: number, worldHeight: number,
  obstacles: readonly ExploreTerrainObstacle[],
): { x: number; y: number } | null {
  const candidates = [preferred];
  for (const radiusScale of [0, 0.4, 0.65, 0.9, 1.15]) {
    for (let step = 0; step < 16; step++) {
      const angle = baseAngle + step * Math.PI / 8;
      candidates.push({
        x: sp.x + Math.cos(angle) * sp.radius * radiusScale,
        y: sp.y + Math.sin(angle) * sp.radius * radiusScale,
      });
    }
  }
  for (const candidate of candidates) {
    const point = clampWorldPoint(candidate, worldWidth, worldHeight, enemyRadius);
    const safeFromPlayer = Math.hypot(point.x - player.x, point.y - player.y)
      >= TRAINING_GROUND_CONTENT.enemyAI.playerSpawnSafeRadius;
    if (safeFromPlayer && !projectileHitsTerrain(point, point, obstacles, enemyRadius)) return point;
  }
  return null;
}

function patrolEnemy(e: EnemyMouse, dt: number, obstacles: readonly ExploreTerrainObstacle[]): void {
  e.exploreState = e.exploreState === 'idle' ? 'idle' : 'patrol';
  const dx = e.patrolTargetX - e.x, dy = e.patrolTargetY - e.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 8) {
    e.syncExploreMotionAnimation(dt, false);
    pickPatrolTarget(e, obstacles);
    return;
  }
  e.x += dx / dist * e.speed * 0.34 * dt;
  e.y += dy / dist * e.speed * 0.34 * dt;
  e.syncExploreMotionAnimation(dt, true);
}

function pickPatrolTarget(e: EnemyMouse, obstacles: readonly ExploreTerrainObstacle[]): void {
  const seed = (e.homeX * 13 + e.homeY * 7 + e.x * 3 + e.y) % 360;
  const baseAngle = seed / 360 * Math.PI * 2;
  for (const radiusScale of [0.72, 0.48]) {
    for (let step = 0; step < 12; step++) {
      const angle = baseAngle + step * Math.PI / 6;
      const radius = TRAINING_GROUND_CONTENT.enemyAI.patrolRadius * radiusScale;
      const target = { x: e.homeX + Math.cos(angle) * radius, y: e.homeY + Math.sin(angle) * radius };
      if (!projectileHitsTerrain(e, target, obstacles, e.radius)) {
        e.patrolTargetX = target.x; e.patrolTargetY = target.y;
        return;
      }
    }
  }
  e.patrolTargetX = e.x; e.patrolTargetY = e.y;
}
