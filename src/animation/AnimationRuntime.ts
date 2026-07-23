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
