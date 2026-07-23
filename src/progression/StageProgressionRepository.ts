import { CONTENT_SNAPSHOT } from '../content/generated/contentSnapshot';
import { STAGE_PROGRESSION_SNAPSHOT } from '../content/generated/stageProgressionSnapshot';
import type { StageProgressionDefinition, StageProgressionSnapshot } from '../content/models/StageProgression';

export interface StageProgressionManifestRef {
  stageProgressionReleaseId?: string;
  stageProgressionChecksum?: string;
}

export function resolvePublishedStageProgressions(
  snapshot: StageProgressionSnapshot = STAGE_PROGRESSION_SNAPSHOT,
  content: StageProgressionManifestRef = CONTENT_SNAPSHOT as StageProgressionManifestRef,
): StageProgressionDefinition[] {
  if (!content.stageProgressionReleaseId || !content.stageProgressionChecksum) return [];
  if (content.stageProgressionReleaseId !== snapshot.releaseId) return [];
  if (content.stageProgressionChecksum !== snapshot.checksum) return [];
  return snapshot.stages ?? [];
}

export function findPublishedStageProgression(stageId?: string): StageProgressionDefinition | undefined {
  if (!stageId) return undefined;
  return resolvePublishedStageProgressions().find(stage => stage.stageId === stageId);
}
