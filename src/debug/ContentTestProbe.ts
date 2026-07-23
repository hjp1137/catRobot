import type { GameManager } from '../core/GameManager';
import type { BattleManager } from '../battle/BattleManager';
import type { ExploreScene } from '../explore/ExploreScene';
import { getDefaultContentRegistry, getDefaultContentRepository } from '../content/registry/ContentRegistry';
import type { ContentRepositorySource } from '../content/models/ContentTypes';
import { validateContentData } from '../content/validation/ContentValidator';
import { ART_MANIFEST_SNAPSHOT } from '../assets/generated/artManifestSnapshot';
import { getAnimationManifestSnapshot } from '../animation/AnimationManifestRepository';
import { STAGE_ORCHESTRATION_SNAPSHOT } from '../content/generated/stageOrchestrationSnapshot';

export interface ContentTestState {
  repositorySource: ContentRepositorySource;
  repositoryType: ContentRepositorySource;
  releaseId?: string;
  releaseVersion?: string;
  snapshotChecksum?: string;
  artManifestSource: 'mysql-published-art-snapshot' | 'base-manifest';
  artManifestReleaseVersion?: string;
  artManifestChecksum?: string;
  loadedArtResourceCount: number;
  animationManifestSource: 'mysql-published-animation-snapshot' | 'empty';
  animationManifestReleaseVersion?: string;
  loadedAnimationClipCount: number;
  loadedAnimationFrameCount: number;
  stageOrchestrationSource: 'mysql-published-stage-orchestration-snapshot' | 'legacy-stage-config';
  stageOrchestrationReleaseVersion?: string;
  stageOrchestrationChecksum?: string;
  loadedStageOrchestrationCount: number;
  activeEnemyAnimation?: string;
  activeHeroAnimation?: string;
  loaded: boolean;
  enemyTemplateCount: number;
  backgroundThemeCount: number;
  heroVisualTemplateCount: number;
  stageCount: number;
  activeStageId: string;
  activeBackgroundThemeId: string;
  activeHeroVisualTemplateId: string;
  activeEnemyTemplateIds: string[];
  validationPassed: boolean;
  stageRuntimeMode: 'free-map' | 'fixed-screen' | 'none';
  stageResult: string | null;
  stageExitReason: string | null;
  stageSettlementApplied: boolean;
  stageRewardApplied: boolean;
  stageProgressionApplied: boolean;
  stageTemporaryStateCleared: boolean;
  stageReturnTarget: string;
}

export function getContentTestState(
  game: GameManager,
  battle: BattleManager,
  explore: ExploreScene,
): ContentTestState {
  const registry = getDefaultContentRegistry();
  const repo = getDefaultContentRepository();
  const validation = validateContentData(repo.getContentData());
  const meta = repo.getSnapshotMeta();
  const animationSnapshot = getAnimationManifestSnapshot();
  const isExplore = game.scene === 'explore';
  const activeEnemyTemplateIds = isExplore
    ? explore.activeEnemyTemplateIds
    : [...new Set(battle.enemies.map(e => e.contentTemplateId).filter(Boolean))];
  return {
    repositorySource: repo.getRepositorySource(),
    repositoryType: repo.getRepositorySource(),
    releaseId: meta?.releaseId,
    releaseVersion: meta?.releaseVersion,
    snapshotChecksum: meta?.snapshotChecksum,
    artManifestSource: ART_MANIFEST_SNAPSHOT.releaseVersion ? 'mysql-published-art-snapshot' : 'base-manifest',
    artManifestReleaseVersion: ART_MANIFEST_SNAPSHOT.releaseVersion,
    artManifestChecksum: ART_MANIFEST_SNAPSHOT.checksum,
    loadedArtResourceCount: Object.keys(ART_MANIFEST_SNAPSHOT.resources).length,
    animationManifestSource: animationSnapshot.clips.length ? 'mysql-published-animation-snapshot' : 'empty',
    animationManifestReleaseVersion: animationSnapshot.releaseVersion,
    loadedAnimationClipCount: animationSnapshot.clips.length,
    loadedAnimationFrameCount: animationSnapshot.clips.reduce((sum, clip) => sum + clip.frames.length, 0),
    stageOrchestrationSource: STAGE_ORCHESTRATION_SNAPSHOT.stages.length ? 'mysql-published-stage-orchestration-snapshot' : 'legacy-stage-config',
    stageOrchestrationReleaseVersion: STAGE_ORCHESTRATION_SNAPSHOT.releaseVersion,
    stageOrchestrationChecksum: STAGE_ORCHESTRATION_SNAPSHOT.checksum,
    loadedStageOrchestrationCount: STAGE_ORCHESTRATION_SNAPSHOT.stages.length,
    activeEnemyAnimation: (isExplore ? explore.enemies[0] : battle.enemies[0])?.animationState,
    activeHeroAnimation: (isExplore ? explore.player : battle.player)?.animationState,
    loaded: true,
    enemyTemplateCount: registry.listEnemies().length,
    backgroundThemeCount: registry.listBackgrounds().length,
    heroVisualTemplateCount: registry.listHeroVisuals().length,
    stageCount: registry.listStages().length,
    activeStageId: isExplore ? explore.activeStageId : battle.activeStageId,
    activeBackgroundThemeId: isExplore ? explore.activeBackgroundThemeId : battle.activeBackgroundThemeId,
    activeHeroVisualTemplateId: isExplore ? explore.activeHeroVisualTemplateId : battle.activeHeroVisualTemplateId,
    activeEnemyTemplateIds,
    validationPassed: validation.valid,
    stageRuntimeMode: isExplore ? 'free-map' : game.scene === 'battle' ? 'fixed-screen' : 'none',
    stageResult: game.stageResult,
    stageExitReason: game.stageExitReason,
    stageSettlementApplied: Boolean(game.lastOutcome?.settlement || game.lastOutcome?.clearResult),
    stageRewardApplied: Boolean(game.lastOutcome?.settlement?.rewardsGranted || game.lastOutcome?.loot),
    stageProgressionApplied: game.stageResult === 'victory',
    stageTemporaryStateCleared: game.stageResult === 'aborted' ? explore.aliveEnemies === 0 : false,
    stageReturnTarget: game.scene,
  };
}
