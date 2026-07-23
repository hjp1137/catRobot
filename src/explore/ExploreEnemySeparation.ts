import type { EnemyMouse } from '../enemy/EnemyMouse';
import { clampValue } from './WorldTransform';

export function separateExploreEnemies(enemies: EnemyMouse[], worldWidth: number, worldHeight: number): void {
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (a.dead) continue;
    for (let j = i + 1; j < enemies.length; j++) pushPair(a, enemies[j]);
    a.x = clampValue(a.x, a.radius, worldWidth - a.radius);
    a.y = clampValue(a.y, a.radius, worldHeight - a.radius);
  }
}

function pushPair(a: EnemyMouse, b: EnemyMouse): void {
  if (b.dead) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 0.001;
  const min = Math.max((a.radius + b.radius) * 1.12, 36);
  if (dist >= min) return;
  const push = (min - dist) * 0.5;
  const ux = dx / dist;
  const uy = dy / dist;
  a.x -= ux * push;
  a.y -= uy * push;
  b.x += ux * push;
  b.y += uy * push;
}
