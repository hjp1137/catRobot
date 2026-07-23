import type { StageObjectiveDefinition, StageProgressionDefinition } from '../content/models/StageProgression';
import type { StageObjectiveResult, StageRunResult } from './StageSettlementModels';

export interface StageObjectiveEvaluation {
  objectives: StageObjectiveResult[];
  stars: number;
  requiredCompleted: boolean;
}

export function evaluateStageObjectives(definition: StageProgressionDefinition, run: StageRunResult): StageObjectiveEvaluation {
  const objectives = definition.objectives
    .filter(objective => objective.enabled)
    .sort((a, b) => a.order - b.order)
    .map(objective => evaluate(objective, run));
  const requiredCompleted = run.victory && objectives.filter(x => x.required).every(x => x.supported && x.completed);
  if (!requiredCompleted) return { objectives, stars: 0, requiredCompleted: false };
  const bonus = definition.objectives.filter(x => x.enabled && x.starEligible && !x.required)
    .map(x => objectives.find(result => result.id === x.id)!).filter(Boolean);
  const completedBonus = bonus.filter(x => x.completed).length;
  const stars = bonus.length > 0 && completedBonus === bonus.length ? 3 : completedBonus > 0 ? 2 : 1;
  return { objectives, stars, requiredCompleted: true };
}

function evaluate(objective: StageObjectiveDefinition, run: StageRunResult): StageObjectiveResult {
  const hpRatio = run.heroMaxHp > 0 ? run.heroRemainingHp / run.heroMaxHp : 0;
  let current = 0, target = 1, completed = false, supported = true;
  switch (objective.type) {
    case 'clear-all-waves':
      current = run.clearedWaves; target = run.totalWaves; completed = run.victory && current >= target; break;
    case 'complete-within-duration':
      current = run.elapsedSec; target = objective.params.maxDurationSec ?? 0; completed = run.victory && target > 0 && current <= target; break;
    case 'hero-health-above':
      current = hpRatio; target = objective.params.minHealthRatio ?? 0; completed = run.victory && current >= target; break;
    case 'survive-duration':
      current = run.elapsedSec; target = objective.params.durationSec ?? 0; completed = current >= target && run.heroRemainingHp > 0; break;
    case 'defeat-enemy-count':
      current = run.defeatedEnemies; target = objective.params.count ?? 0; completed = current >= target; break;
    default:
      supported = false;
  }
  return { id: objective.id, name: objective.name, completed, failed: supported && !completed,
    required: objective.required, current, target, displayText: objective.displayText, supported };
}
