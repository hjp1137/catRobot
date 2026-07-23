import type { ArtResourceKey } from '../../assets/ArtResourceKeys';
import type { AnimationClipBindings } from './AnimationClip';

export type EnemyCategory = 'normal' | 'elite' | 'boss';
export type EnemyBehaviorType = 'melee' | 'ranged' | 'charger' | 'patrol' | 'exploder';

export interface EnemyVisualConfig {
  iconArtKey?: ArtResourceKey;
  idleArtKey: ArtResourceKey;
  moveArtKey?: ArtResourceKey;
  attackArtKey?: ArtResourceKey;
  hitArtKey?: ArtResourceKey;
  deathArtKey?: ArtResourceKey;
  displayScale: number;
  collisionRadius: number;
  shadowScale?: number;
  eliteAuraArtKey?: ArtResourceKey;
  animationClipKeys?: AnimationClipBindings;
}

export interface EnemyStats {
  maxHp: number;
  attack: number;
  defense: number;
  moveSpeed: number;
}

export interface EnemyCombatConfig {
  attackInterval: number;
  attackRange: number;
  detectRadius: number;
  chaseRadius: number;
  projectileSpeed?: number;
  contactDamage?: boolean;
}

export interface EnemyRewardConfig {
  coinMin?: number;
  coinMax?: number;
  exp?: number;
  dropTableId?: string;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  description?: string;
  category: EnemyCategory;
  behaviorType: EnemyBehaviorType;
  visual: EnemyVisualConfig;
  stats: EnemyStats;
  combat: EnemyCombatConfig;
  rewards?: EnemyRewardConfig;
  tags?: string[];
  enabled: boolean;
  version: number;
}
