import type { ArtResourceKey } from '../../assets/ArtResourceKeys';

export type AnimationTargetType = 'enemy' | 'hero' | 'effect';
export type AnimationActionState = 'idle' | 'move' | 'attack' | 'hit' | 'death' | string;
export type AnimationPlayMode = 'loop' | 'once' | 'hold-last-frame';

export interface AnimationFrameDefinition {
  id?: string;
  order: number;
  artKey: ArtResourceKey;
  durationMs?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  flipX?: boolean;
  note?: string;
}

export interface AnimationClipDefinition {
  id?: string;
  key: string;
  name?: string;
  targetType: AnimationTargetType;
  state: AnimationActionState;
  defaultFps?: number;
  defaultFrameDurationMs?: number;
  loop: boolean;
  playMode: AnimationPlayMode;
  endBehavior?: AnimationPlayMode;
  enabled?: boolean;
  version?: number;
  frames: AnimationFrameDefinition[];
}

export type AnimationClipBindings = Partial<Record<AnimationActionState, string>>;
