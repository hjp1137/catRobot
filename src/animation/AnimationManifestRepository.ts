import type { AnimationClipDefinition } from '../content/models/AnimationClip';
import { ANIMATION_MANIFEST_SNAPSHOT } from '../assets/generated/animationManifestSnapshot';
import { CONTENT_SNAPSHOT } from '../content/generated/contentSnapshot';

export interface AnimationManifestRef {
  animationManifestReleaseId?: string;
  animationManifestChecksum?: string;
}

export interface AnimationManifestSnapshot {
  schemaVersion: 1;
  releaseId: string;
  releaseVersion: string;
  generatedAt: string;
  checksum: string;
  clips: AnimationClipDefinition[];
}

export function getAnimationManifestSnapshot(): AnimationManifestSnapshot {
  return ANIMATION_MANIFEST_SNAPSHOT as unknown as AnimationManifestSnapshot;
}

export function resolvePublishedAnimationClips(
  snapshot: AnimationManifestSnapshot,
  content: AnimationManifestRef = CONTENT_SNAPSHOT,
): AnimationClipDefinition[] {
  if (!content.animationManifestReleaseId || !content.animationManifestChecksum) return [];
  if (content.animationManifestReleaseId !== snapshot.releaseId) return [];
  if (content.animationManifestChecksum !== snapshot.checksum) return [];
  return (snapshot.clips ?? []).filter(clip => clip.enabled !== false);
}

export function listAnimationClips(): AnimationClipDefinition[] {
  return resolvePublishedAnimationClips(getAnimationManifestSnapshot());
}

export function findAnimationClip(key?: string): AnimationClipDefinition | undefined {
  if (!key) return undefined;
  return listAnimationClips().find(clip => clip.key === key);
}

export function findAnimationClipFor(targetType: string, state: string, bindings?: Partial<Record<string, string>>): AnimationClipDefinition | undefined {
  void targetType;
  return findAnimationClip(bindings?.[state]);
}
