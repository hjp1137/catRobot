export interface ExploreTerrainObstacle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  kind: 'machine' | 'crate' | 'barrier';
}

type Point = { x: number; y: number };

function overlapsCircle(point: Point, radius: number, obstacle: ExploreTerrainObstacle): boolean {
  const x = Math.max(obstacle.x, Math.min(point.x, obstacle.x + obstacle.w));
  const y = Math.max(obstacle.y, Math.min(point.y, obstacle.y + obstacle.h));
  return Math.hypot(point.x - x, point.y - y) < radius;
}

export function resolveExploreTerrainMove(
  from: Point,
  target: Point,
  radius: number,
  obstacles: readonly ExploreTerrainObstacle[] = [],
): Point {
  let x = target.x;
  if (projectileHitsTerrain(from, { x, y: from.y }, obstacles, radius)) x = from.x;
  let y = target.y;
  if (projectileHitsTerrain({ x, y: from.y }, { x, y }, obstacles, radius)) y = from.y;
  return { x, y };
}

export function projectileHitsTerrain(
  from: Point,
  to: Point,
  obstacles: readonly ExploreTerrainObstacle[] = [],
  radius = 3,
): boolean {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / Math.max(4, radius)));
  for (let step = 1; step <= steps; step++) {
    const ratio = step / steps;
    const point = { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
    if (obstacles.some(obstacle => overlapsCircle(point, radius, obstacle))) return true;
  }
  return false;
}
