import type { ArtResourceKey } from '../../assets/ArtResourceKeys';
import type { AnimationClipBindings } from './AnimationClip';

export interface HeroVisualConfig {
  iconArtKey?: ArtResourceKey;
  idleArtKey: ArtResourceKey;
  moveArtKey?: ArtResourceKey;
  attackArtKey?: ArtResourceKey;
  hitArtKey?: ArtResourceKey;
  deathArtKey?: ArtResourceKey;
  displayScale: number;
  collisionRadius: number;
  shadowScale?: number;
  animationClipKeys?: AnimationClipBindings;
}

export interface HeroSkillVisualConfig {
  shieldIconArtKey: ArtResourceKey;
  cannonIconArtKey: ArtResourceKey;
  shieldEffectArtKey?: ArtResourceKey;
  cannonEffectArtKey?: ArtResourceKey;
}

export interface HeroVisualTemplate {
  id: string;
  name: string;
  description?: string;
  visual: HeroVisualConfig;
  skills: HeroSkillVisualConfig;
  enabled: boolean;
  version: number;
}
