import type { IContext } from '../engine/IContext';
import type { GameManager } from '../core/GameManager';
import { TutorialManager } from '../core/TutorialManager';
import { CONTENT_SNAPSHOT } from '../content/generated/contentSnapshot';
import { TUTORIAL_SNAPSHOT } from '../content/generated/tutorialSnapshot';
import type { TutorialSnapshot } from '../content/models/Tutorial';
import { TutorialSnapshotRepository } from './TutorialSnapshotRepository';
import { TutorialTargetRegistry } from './TutorialTargetRegistry';
import { TutorialInputLimiter } from './TutorialInputLimiter';
import { TutorialFeatureService } from './TutorialFeatureService';
import { TutorialDirector } from './TutorialDirector';
import { TutorialRuntimeController } from './TutorialRuntimeController';
import { registerGameTutorialTargets } from './GameTutorialTargetResolver';

export function createTutorialController(ctx: IContext, game: GameManager,
  content: any = CONTENT_SNAPSHOT, snapshot: TutorialSnapshot | null = TUTORIAL_SNAPSHOT): any {
  const repository = new TutorialSnapshotRepository(content, snapshot);
  if (repository.mode !== 'PUBLISHED' || !repository.snapshot) {
    (game as any).enableTutorial = true;
    return new TutorialManager(ctx, game);
  }
  const targets = new TutorialTargetRegistry(), limiter = new TutorialInputLimiter();
  const save = () => game.save.save(game.player);
  const features = new TutorialFeatureService(game.player, save);
  features.unlockDefaults();
  if (game.player.tutorialFinished) features.unlockAll(false);
  game.setFeatureUnlockService(features);
  const director = new TutorialDirector({
    snapshot: repository.snapshot, player: game.player, save, events: game.events, targets, input: limiter, features,
    now: () => ctx.now() * 1000, isCompletionSatisfied: step => completionAlreadyTrue(game, step),
  });
  const unregisterTargets = registerGameTutorialTargets(ctx, game, targets);
  const controller = new TutorialRuntimeController(ctx, game, director, limiter, unregisterTargets);
  controller.start(); return controller;
}

function completionAlreadyTrue(game: GameManager, step: any): boolean {
  if (step.completionType === 'equipment.equipped') {
    return Object.keys(game.player.equipmentInventory.equipped).length > 0;
  }
  const stageId = step.stageId ?? game.player.selectedStageId;
  const progress = stageId ? game.player.stageProgress[stageId] : undefined;
  if (step.completionType === 'stage.cleared') return !!progress?.cleared;
  if (step.completionType === 'reward.claimed') {
    return !!progress?.firstClearRewardClaimed || !!progress?.claimedObjectiveRewardIds?.length;
  }
  return false;
}
