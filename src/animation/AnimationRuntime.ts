import type { ArtResourceKey } from '../assets/ArtResourceKeys';
import type { FrameSequencePlayer } from './FrameSequencePlayer';
import { findAnimationClipFor } from './AnimationManifestRepository';

export function resolveAnimatedArtKey(options: {
  player: FrameSequencePlayer;
  targetType: 'enemy' | 'hero';
  state: string;
  bindings?: Partial<Record<string, string>>;
  fallbackArtKey?: ArtResourceKey;
}): ArtResourceKey | undefined {
  const clip = findAnimationClipFor(options.targetType, options.state, options.bindings);
  if (!clip) {
    options.player.setClip(null);
    return options.fallbackArtKey;
  }
  options.player.setAction(options.state, clip);
  return options.player.currentFrame()?.artKey ?? options.fallbackArtKey;
}

export function resolveDirectionalAnimationState(
  state: string,
  directionX: number,
  directionY: number,
  bindings?: Partial<Record<string, string>>,
): string {
  if (state !== 'move') return state;
  if (Math.abs(directionY) <= Math.abs(directionX)) return state;
  const directionalState = directionY < 0 ? 'moveUp' : 'moveDown';
  return bindings?.[directionalState] ? directionalState : state;
}
