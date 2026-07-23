export type RuntimeAnimationState = 'idle' | 'move' | 'attack' | 'hit' | 'death';

export function resolveHeroAnimationState(hero: {
  dead?: boolean;
  hitFlash?: number;
  attackFlash?: number;
  ctx?: { input?: { moveX: number; moveY: number } };
}): RuntimeAnimationState {
  if (hero.dead) return 'death';
  if ((hero.hitFlash ?? 0) > 0) return 'hit';
  if ((hero.attackFlash ?? 0) > 0) return 'attack';
  const input = hero.ctx?.input;
  if (input && (input.moveX !== 0 || input.moveY !== 0)) return 'move';
  return 'idle';
}

export function resolveEnemyAnimationState(enemy: {
  dead?: boolean;
  hitFlash?: number;
  isAttacking?: boolean;
  isMoving?: boolean;
}): RuntimeAnimationState {
  if (enemy.dead) return 'death';
  if ((enemy.hitFlash ?? 0) > 0) return 'hit';
  if (enemy.isAttacking) return 'attack';
  if (enemy.isMoving) return 'move';
  return 'idle';
}
