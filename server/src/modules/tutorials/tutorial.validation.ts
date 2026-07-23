import { BadRequestException } from '@nestjs/common';

const TARGET_TYPES = new Set(['ui', 'canvas', 'stage', 'campaign', 'feature', 'art']);

export function validateTutorialGraph(input: any): void {
  const steps = Array.isArray(input?.steps) ? input.steps : [];
  if (!steps.length) fail('TUTORIAL_STEP_REQUIRED');
  const ids = new Set<string>();
  for (const step of steps) {
    if (!step.id || ids.has(step.id)) fail('TUTORIAL_STEP_ID_DUPLICATE', { stepId: step.id });
    ids.add(step.id);
    if (!TARGET_TYPES.has(step.targetType)) fail('TUTORIAL_TARGET_TYPE_INVALID', { stepId: step.id });
    if (step.blockInput && !step.fallbackAction) fail('TUTORIAL_FORCED_STEP_FALLBACK_REQUIRED', { stepId: step.id });
    if (!step.terminal && !step.nextStepId) fail('TUTORIAL_STEP_EXIT_REQUIRED', { stepId: step.id });
    if (step.timeoutMs != null && (!Number.isInteger(step.timeoutMs) || step.timeoutMs < 0)) fail('TUTORIAL_TIMEOUT_INVALID', { stepId: step.id });
  }
  const start = input.startStepId || steps.slice().sort((a: any, b: any) => a.order - b.order)[0]?.id;
  if (!ids.has(start)) fail('TUTORIAL_START_STEP_INVALID', { startStepId: start });
  for (const step of steps) {
    if (step.nextStepId && !ids.has(step.nextStepId)) fail('TUTORIAL_NEXT_STEP_INVALID', { stepId: step.id, nextStepId: step.nextStepId });
    if (step.skipStepId && !ids.has(step.skipStepId)) fail('TUTORIAL_SKIP_STEP_INVALID', { stepId: step.id, skipStepId: step.skipStepId });
  }
  const edges = new Map<string, string[]>(steps.map((step: any) => [step.id, [step.nextStepId, step.skipStepId].filter(Boolean)]));
  for (const transition of input.transitions ?? []) {
    if (!ids.has(transition.fromStepId) || !ids.has(transition.toStepId)) fail('TUTORIAL_TRANSITION_INVALID');
    edges.get(transition.fromStepId)?.push(transition.toStepId);
  }
  const reachable = new Set<string>(); const active = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) fail('TUTORIAL_CYCLE', { stepId: id });
    if (reachable.has(id)) return;
    reachable.add(id); active.add(id);
    for (const next of edges.get(id) ?? []) visit(next);
    active.delete(id);
  };
  visit(start);
  const orphan = steps.find((step: any) => !reachable.has(step.id));
  if (orphan) fail('TUTORIAL_STEP_UNREACHABLE', { stepId: orphan.id });
}

export function validateTargetId(targetType: string, targetId: string): void {
  if (!TARGET_TYPES.has(targetType)) fail('TUTORIAL_TARGET_TYPE_INVALID', { targetType });
  if (!targetId) fail('TUTORIAL_TARGET_ID_REQUIRED', { targetType });
}

function fail(code: string, detail: Record<string, unknown> = {}): never {
  throw new BadRequestException({ code, ...detail });
}
