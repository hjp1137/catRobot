import type { ArtResourceKey } from '../assets/ArtResourceKeys';

export interface ExploreMotionPose {
  offsetY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export function getExplorePlayerVisualRadius(configuredRadius: number): number {
  return Math.max(58, configuredRadius);
}

export function getExploreEnemyVisualRadius(configuredRadius: number): number {
  return Math.max(48, configuredRadius);
}

export function resolveExploreActionArtKey(
  _state: string,
  moveArtKey: ArtResourceKey | undefined,
  animatedArtKey: ArtResourceKey | undefined,
): ArtResourceKey | undefined {
  return animatedArtKey ?? moveArtKey;
}

export function resolveExploreHeroArtKey(
  _state: string,
  _moving: boolean,
  _time: number,
  idleArtKey: ArtResourceKey | undefined,
  animatedArtKey: ArtResourceKey | undefined,
): ArtResourceKey | undefined {
  return animatedArtKey ?? idleArtKey;
}

export function resolveExploreMotionPose(
  _moving: boolean,
  _time: number,
  _facing: number,
  _target: 'hero' | 'enemy',
): ExploreMotionPose {
  return { offsetY: 0, rotation: 0, scaleX: 1, scaleY: 1 };
}
