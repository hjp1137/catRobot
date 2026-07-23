import type { EventManager } from '../core/EventManager';
import type { TutorialSnapshot } from '../content/models/Tutorial';
import type { TutorialTargetRegistry, ResolvedTutorialTarget } from './TutorialTargetRegistry';
import type { TutorialInputLimiter } from './TutorialInputLimiter';
import type { TutorialFeatureService } from './TutorialFeatureService';

export type TutorialDirectorState = 'IDLE' | 'WAITING_TRIGGER' | 'RESOLVING_TARGET' | 'SHOWING' |
  'WAITING_ACTION' | 'COMPLETING' | 'PAUSED' | 'SKIPPED' | 'COMPLETED' | 'ERROR_RECOVERY' | 'DISPOSED';
interface Deps { snapshot: TutorialSnapshot; player: any; save: () => boolean; events: EventManager;
  targets: TutorialTargetRegistry; input: TutorialInputLimiter; features: TutorialFeatureService; now: () => number;
  isCompletionSatisfied?: (step: any) => boolean; }

export class TutorialDirector {
  private state: TutorialDirectorState = 'IDLE'; private flow: any = null; private step: any = null;
  private target: ResolvedTutorialTarget | null = null; private offs: Array<() => void> = []; private inputToken?: symbol;
  private deadline = 0; private pausedState: TutorialDirectorState = 'IDLE'; private replaying = false;
  constructor(private d: Deps) {}

  start(): void {
    if (this.state === 'DISPOSED') return;
    const progress = this.d.player.tutorial; const resumed = this.d.snapshot.flows.find((f: any) => f.id === progress.currentFlowId);
    if (this.d.player.tutorialFinished && !resumed) { this.state = 'IDLE'; return; }
    this.flow = resumed ?? this.d.snapshot.flows.find((f: any) => f.enabled &&
      !progress.completedFlowIds.includes(f.id) && !progress.skippedFlowIds.includes(f.id));
    if (!this.flow) { this.state = 'IDLE'; return; }
    const stepId = resumed && progress.currentStepId || this.flow.startStepId;
    this.step = this.flow.steps.find((s: any) => s.id === stepId);
    if (!this.step && resumed && progress.currentStepId) progress.recoveryCount++;
    this.step ??= this.flow.steps.find((s: any) => s.id === this.flow.startStepId);
    if (!this.step) { this.recover('step-missing'); return; }
    addUnique(progress.startedFlowIds, this.flow.id); progress.currentFlowId = this.flow.id; progress.currentStepId = this.step.id;
    this.bindStep(); this.persist();
    if (this.d.isCompletionSatisfied?.(this.step)) this.completeStep();
  }

  update(): void {
    if (this.state !== 'ERROR_RECOVERY' || this.d.now() < this.deadline) return;
    this.d.player.tutorial.recoveryCount++; this.d.targets.invalidate();
    if (this.resolveTarget(true)) return;
    this.step?.fallbackAction === 'skip-flow' ? this.skip(true) : this.completeStep();
  }

  pause(): void { if (['IDLE', 'DISPOSED', 'COMPLETED'].includes(this.state)) return;
    this.pausedState = this.state; this.state = 'PAUSED'; this.releaseInput(); this.persist(); }
  resume(): void { if (this.state !== 'PAUSED') return; this.state = this.pausedState; this.persist();
    if (this.state === 'WAITING_ACTION') this.resolveTarget(true); }
  invalidateTarget(): void { if (!this.step) return; this.target = null; this.releaseInput(); this.recover('target-invalidated'); }

  skip(confirmed: boolean): boolean {
    if (!confirmed || !this.flow?.skippable) return false;
    this.clearListeners(); this.releaseInput(); this.state = 'SKIPPED';
    addUnique(this.d.player.tutorial.skippedFlowIds, this.flow.id);
    this.d.player.tutorialFinished = true;
    const ids = [...(this.flow.skipUnlockFeatures ?? []), ...(this.flow.unlockRules ?? []).filter((r: any) => r.unlockOnSkip).map((r: any) => r.featureId)];
    this.d.features.unlockSafe(ids); this.clearCurrent(); this.persist(); return true;
  }

  replay(flowId: string): boolean {
    const flow: any = this.d.snapshot.flows.find((f: any) => f.id === flowId && f.allowReplay);
    if (!flow || this.state === 'DISPOSED') return false;
    this.clearListeners(); this.releaseInput(); this.flow = flow; this.step = flow.steps.find((s: any) => s.id === flow.startStepId);
    this.replaying = true; this.bindStep(); return true;
  }

  dispose(): void { this.clearListeners(); this.releaseInput(); this.target = null; this.state = 'DISPOSED'; }
  debug(): any { return { state: this.state, flowId: this.flow?.id, stepId: this.step?.id, target: this.target,
    title: this.step?.title, body: this.step?.body, completionType: this.step?.completionType, skippable: !!this.flow?.skippable,
    replaying: this.replaying, deadline: this.deadline }; }

  refreshTarget(): void {
    this.d.targets.invalidate();
    if (this.state === 'WAITING_ACTION' && this.target) this.resolveTarget(true);
  }

  private bindStep(): void {
    this.clearListeners(); this.target = null; this.state = 'WAITING_TRIGGER';
    this.offs.push(this.d.events.on(this.step.triggerType, () => this.onTriggered()));
    this.offs.push(this.d.events.on(this.step.completionType, payload => this.onCompleted(payload)));
  }

  private onTriggered(): void { if (this.state !== 'WAITING_TRIGGER') return; this.resolveTarget(); }
  private resolveTarget(refresh = false): boolean {
    this.state = 'RESOLVING_TARGET'; const type = this.step.targetType;
    if (type !== 'ui' && type !== 'canvas') { this.state = 'WAITING_ACTION'; return true; }
    this.target = this.d.targets.resolve(type, this.step.targetId, refresh);
    if (!this.target) { this.recover('target-missing'); return false; }
    this.state = 'SHOWING'; if (this.step.blockInput || this.step.force) this.inputToken = this.d.input.restrict(this.step.targetId);
    this.state = 'WAITING_ACTION'; return true;
  }

  private onCompleted(payload: any): void { if (this.state !== 'WAITING_ACTION') return;
    if (payload?.targetId && payload.targetId !== this.step.targetId) return; this.completeStep(); }

  private completeStep(): void {
    if (!this.step || !this.flow || this.state === 'DISPOSED') return;
    const completionType = this.step.completionType;
    this.state = 'COMPLETING'; this.releaseInput(); addUnique(this.d.player.tutorial.completedStepIds, this.step.id);
    this.d.events.emit('tutorial.step-completed', { flowId: this.flow.id, stepId: this.step.id });
    this.d.events.emit('tutorial-step-completed', { flowId: this.flow.id, stepId: this.step.id });
    for (const rule of this.flow.unlockRules ?? []) {
      if (rule.enabled !== false && rule.stepId === this.step.id && rule.unlockTrigger === 'step.complete') this.d.features.unlock(rule.featureId);
    }
    const nextId = this.step.nextStepId;
    if (nextId) {
      const next = this.flow.steps.find((item: any) => item.id === nextId);
      if (!next) { this.recover('next-step-missing'); return; }
      this.step = next; this.d.player.tutorial.currentStepId = next.id; this.bindStep(); this.persist();
      if (this.step.triggerType === completionType) this.onTriggered();
      if (this.d.isCompletionSatisfied?.(this.step)) this.completeStep();
      return;
    }
    addUnique(this.d.player.tutorial.completedFlowIds, this.flow.id); this.d.player.tutorialFinished = true; this.state = 'COMPLETED';
    this.clearListeners(); this.clearCurrent(); this.persist();
  }

  private recover(_reason: string): void {
    this.state = 'ERROR_RECOVERY'; this.releaseInput(); this.deadline = this.d.now() + Math.max(0, this.step?.timeoutMs ?? 5000);
  }

  private clearCurrent(): void {
    this.d.player.tutorial.currentFlowId = undefined; this.d.player.tutorial.currentStepId = undefined;
  }

  private persist(): void { this.d.player.tutorial.updatedAt = this.d.now(); this.d.save(); }
  private clearListeners(): void { for (const off of this.offs.splice(0)) off(); }
  private releaseInput(): void { this.d.input.release(this.inputToken); this.inputToken = undefined; }
}

function addUnique(values: string[], value: string): void { if (!values.includes(value)) values.push(value); }
