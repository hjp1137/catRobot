import { CONTENT_SNAPSHOT } from '../content/generated/contentSnapshot';
import { STAGE_ORCHESTRATION_SNAPSHOT } from '../content/generated/stageOrchestrationSnapshot';
import type { StageOrchestrationSnapshot, StageRuntimeConfig } from '../content/models/StageOrchestration';

export interface StageOrchestrationManifestRef {
  stageOrchestrationReleaseId?: string;
  stageOrchestrationChecksum?: string;
}

export function resolvePublishedStageOrchestrations(
  snapshot: StageOrchestrationSnapshot = STAGE_ORCHESTRATION_SNAPSHOT,
  content: StageOrchestrationManifestRef = CONTENT_SNAPSHOT as StageOrchestrationManifestRef,
): StageRuntimeConfig[] {
  if (!content.stageOrchestrationReleaseId || !content.stageOrchestrationChecksum) return [];
  if (content.stageOrchestrationReleaseId !== snapshot.releaseId) return [];
  if (content.stageOrchestrationChecksum !== snapshot.checksum) return [];
  return (snapshot.stages ?? []).filter(stage => stage.layout.enabled);
}

export function findPublishedStageOrchestration(stageId?: string): StageRuntimeConfig | undefined {
  if (!stageId) return undefined;
  return resolvePublishedStageOrchestrations().find(stage => stage.stageId === stageId);
}
