import type { ExploreObjectiveState } from './ExploreContentConfig';
import { TRAINING_GROUND_CONTENT } from './ExploreContentConfig';
import type { StageObjectiveDefinition } from '../content/models/StageDefinition';

export interface ExploreObjectiveDisplay {
  enemyKilledRaw: number;
  enemyKilledDisplay: number;
  enemyKillRequired: number;
  enemyKillGoalCompleted: boolean;
  resourceCollectedRaw: number;
  resourceCollectedDisplay: number;
  resourceRequired: number;
  resourceGoalCompleted: boolean;
  chestsOpenedRaw: number;
  chestsOpenedDisplay: number;
  chestRequired: number;
  chestGoalCompleted: boolean;
}

export interface ExploreEnemySpawnPauseState {
  enemySpawnPaused: boolean;
  enemySpawnPausedByKillGoal: boolean;
  enemySpawnPausedByCompletion: boolean;
}

export function createExploreObjective(objectives?: StageObjectiveDefinition[]): ExploreObjectiveState {
  const required = (type: StageObjectiveDefinition['type'], fallback: number) =>
    objectives ? (objectives.find(item => item.type === type)?.required ?? 0) : fallback;
  return {
    enemyKillsRequired: required('defeat', TRAINING_GROUND_CONTENT.objective.enemyKillsRequired),
    enemyKills: 0,
    enemyKillGoalCompleted: false,
    resourcesRequired: required('resource', TRAINING_GROUND_CONTENT.objective.resourcesRequired),
    resourcesCollected: 0,
    resourceGoalCompleted: false,
    chestsRequired: required('chest', TRAINING_GROUND_CONTENT.objective.chestsRequired),
    chestsOpened: 0,
    chestGoalCompleted: false,
    completed: false,
  };
}

export function updateExploreObjectiveCompletion(objective: ExploreObjectiveState): boolean {
  objective.enemyKillGoalCompleted = objective.enemyKills >= objective.enemyKillsRequired;
  objective.resourceGoalCompleted = objective.resourcesCollected >= objective.resourcesRequired;
  objective.chestGoalCompleted = objective.chestsOpened >= objective.chestsRequired;
  if (objective.completed) return false;
  const done = objective.enemyKillGoalCompleted
    && objective.resourceGoalCompleted
    && objective.chestGoalCompleted;
  if (!done) return false;
  objective.completed = true;
  return true;
}

export function getExploreEnemySpawnPauseState(objective: ExploreObjectiveState): ExploreEnemySpawnPauseState {
  const enemySpawnPausedByKillGoal = objective.enemyKillGoalCompleted;
  const enemySpawnPausedByCompletion = objective.completed;
  return {
    enemySpawnPaused: enemySpawnPausedByKillGoal || enemySpawnPausedByCompletion,
    enemySpawnPausedByKillGoal,
    enemySpawnPausedByCompletion,
  };
}

export function getExploreObjectiveDisplay(objective: ExploreObjectiveState): ExploreObjectiveDisplay {
  return {
    enemyKilledRaw: objective.enemyKills,
    enemyKilledDisplay: capProgress(objective.enemyKills, objective.enemyKillsRequired),
    enemyKillRequired: objective.enemyKillsRequired,
    enemyKillGoalCompleted: objective.enemyKillGoalCompleted,
    resourceCollectedRaw: objective.resourcesCollected,
    resourceCollectedDisplay: capProgress(objective.resourcesCollected, objective.resourcesRequired),
    resourceRequired: objective.resourcesRequired,
    resourceGoalCompleted: objective.resourceGoalCompleted,
    chestsOpenedRaw: objective.chestsOpened,
    chestsOpenedDisplay: capProgress(objective.chestsOpened, objective.chestsRequired),
    chestRequired: objective.chestsRequired,
    chestGoalCompleted: objective.chestGoalCompleted,
  };
}

export function formatExploreObjective(objective: ExploreObjectiveState): string {
  if (objective.completed) return '训练完成';
  const display = getExploreObjectiveDisplay(objective);
  return `目标：击败 ${display.enemyKilledDisplay}/${display.enemyKillRequired}｜`
    + `资源 ${display.resourceCollectedDisplay}/${display.resourceRequired}｜`
    + `宝箱 ${display.chestsOpenedDisplay}/${display.chestRequired}`;
}

function capProgress(value: number, required: number): number {
  return Math.min(Math.max(0, value), required);
}
