import type { IContext } from '../engine/IContext';
import type { GameManager } from '../core/GameManager';
import type { ExploreScene } from '../explore/ExploreScene';
import { getExploreEnemySpawnPauseState, getExploreObjectiveDisplay } from '../explore/ExploreObjectiveSystem';
import { getBattleHudSafeTop as resolveBattleHudSafeTop } from '../config/BattleAssets';

export interface ExploreTestState {
  scene: 'explore' | string;
  mapId: string;
  activeStageId: string;
  activeBackgroundThemeId: string;
  activeHeroVisualTemplateId: string;
  activeEnemyTemplateIds: string[];
  playerWorldX: number;
  playerWorldY: number;
  cameraX: number;
  cameraY: number;
  worldWidth: number;
  worldHeight: number;
  enemyAlive: number;
  enemyKilled: number;
  enemyKilledRaw: number;
  enemyKilledDisplay: number;
  enemyKillRequired: number;
  enemyKillGoalCompleted: boolean;
  spawnPointCount: number;
  activeSpawnPoints: number;
  resourceCollected: number;
  resourceTotal: number;
  resourceCollectedRaw: number;
  resourceCollectedDisplay: number;
  resourceRequired: number;
  resourceGoalCompleted: boolean;
  chestsOpened: number;
  chestTotal: number;
  chestsOpenedRaw: number;
  chestsOpenedDisplay: number;
  chestRequired: number;
  chestGoalCompleted: boolean;
  objectiveCompleted: boolean;
  spawnPaused: boolean;
  enemySpawnPaused: boolean;
  enemySpawnPausedByKillGoal: boolean;
  enemySpawnPausedByCompletion: boolean;
  coinCollected: number;
  projectiles: number;
  joystickActive: boolean;
  skillCooldowns: {
    shield: number;
    cannon: number;
  };
  guideTargetType: 'enemy' | 'resource' | 'chest' | 'complete';
  guideTargetId: string;
  guideTargetDistance: number;
  guideTargetVisibleOnScreen: boolean;
  guideArrowVisible: boolean;
  nextActionText: string;
  clearNoticeVisible: boolean;
  completionNoticeVisible: boolean;
  hudMode: 'edge-minimal' | string;
  hudHeight: number;
  hudTopTextOnly: boolean;
  leftObjectiveDockVisible: boolean;
  rightGuideDockVisible: boolean;
  playerScreenSafeTop: number;
  playerScreenY: number;
  playerOccludedByHud: boolean;
  objectiveCompactText: string;
}

export function getExploreTestState(
  game: GameManager,
  explore: ExploreScene,
  ctx: IContext,
): ExploreTestState {
  const states = explore.getPlayerSkillStates();
  const shield = states.find(s => s.skillId === 'heavy_shield');
  const cannon = states.find(s => s.skillId === 'meow_cannon');
  const snap = explore.feedback.snapshot();
  const objective = getExploreObjectiveDisplay(explore.objective);
  const spawnPause = getExploreEnemySpawnPauseState(explore.objective);
  const guide = explore.getGuideTarget();
  return {
    scene: game.scene,
    mapId: explore.mapId,
    activeStageId: explore.activeStageId,
    activeBackgroundThemeId: explore.activeBackgroundThemeId,
    activeHeroVisualTemplateId: explore.activeHeroVisualTemplateId,
    activeEnemyTemplateIds: explore.activeEnemyTemplateIds,
    playerWorldX: Math.round(explore.player.x),
    playerWorldY: Math.round(explore.player.y),
    cameraX: Math.round(explore.camera.x),
    cameraY: Math.round(explore.camera.y),
    worldWidth: explore.worldWidth,
    worldHeight: explore.worldHeight,
    enemyAlive: explore.aliveEnemies,
    enemyKilled: explore.objective.enemyKills,
    enemyKilledRaw: objective.enemyKilledRaw,
    enemyKilledDisplay: objective.enemyKilledDisplay,
    enemyKillRequired: objective.enemyKillRequired,
    enemyKillGoalCompleted: objective.enemyKillGoalCompleted,
    spawnPointCount: explore.spawnPointCount,
    activeSpawnPoints: explore.activeSpawnPoints,
    resourceCollected: explore.objective.resourcesCollected,
    resourceTotal: explore.objective.resourcesRequired,
    resourceCollectedRaw: objective.resourceCollectedRaw,
    resourceCollectedDisplay: objective.resourceCollectedDisplay,
    resourceRequired: objective.resourceRequired,
    resourceGoalCompleted: objective.resourceGoalCompleted,
    chestsOpened: explore.objective.chestsOpened,
    chestTotal: explore.objective.chestsRequired,
    chestsOpenedRaw: objective.chestsOpenedRaw,
    chestsOpenedDisplay: objective.chestsOpenedDisplay,
    chestRequired: objective.chestRequired,
    chestGoalCompleted: objective.chestGoalCompleted,
    objectiveCompleted: explore.objective.completed,
    spawnPaused: spawnPause.enemySpawnPaused,
    enemySpawnPaused: spawnPause.enemySpawnPaused,
    enemySpawnPausedByKillGoal: spawnPause.enemySpawnPausedByKillGoal,
    enemySpawnPausedByCompletion: spawnPause.enemySpawnPausedByCompletion,
    coinCollected: explore.coinCollected,
    projectiles: explore.activeProjectiles + snap.projectiles,
    joystickActive: ctx.input.moveX !== 0 || ctx.input.moveY !== 0,
    skillCooldowns: {
      shield: Math.round((shield?.cooldownRemaining ?? 0) * 1000),
      cannon: Math.round((cannon?.cooldownRemaining ?? 0) * 1000),
    },
    guideTargetType: guide.type,
    guideTargetId: guide.id,
    guideTargetDistance: guide.distance,
    guideTargetVisibleOnScreen: guide.visibleOnScreen,
    guideArrowVisible: guide.type !== 'complete' && !guide.visibleOnScreen,
    nextActionText: guide.label,
    clearNoticeVisible: explore.killGoalNoticeVisible,
    completionNoticeVisible: explore.completionNoticeVisible,
    hudMode: 'edge-minimal',
    hudHeight: resolveBattleHudSafeTop(ctx.getSystemInfo()) + 48,
    hudTopTextOnly: true,
    leftObjectiveDockVisible: true,
    rightGuideDockVisible: !explore.objective.completed,
    playerScreenSafeTop: resolveBattleHudSafeTop(ctx.getSystemInfo()) + 48 + 32,
    playerScreenY: Math.round(explore.player.y - explore.camera.y),
    playerOccludedByHud: (explore.player.y - explore.camera.y) < (resolveBattleHudSafeTop(ctx.getSystemInfo()) + 48),
    objectiveCompactText: `${explore.objective.enemyKillGoalCompleted ? '敌√' : '敌 ' + objective.enemyKilledDisplay + '/' + objective.enemyKillRequired}｜` +
      `${explore.objective.resourceGoalCompleted ? '资√' : '资 ' + objective.resourceCollectedDisplay + '/' + objective.resourceRequired}｜` +
      `${explore.objective.chestGoalCompleted ? '箱√' : '箱 ' + objective.chestsOpenedDisplay + '/' + objective.chestRequired}`
  };
}
