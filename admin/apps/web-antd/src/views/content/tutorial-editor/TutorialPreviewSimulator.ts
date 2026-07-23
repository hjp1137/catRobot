export type TutorialPreviewState = 'IDLE' | 'SHOWING' | 'MISSING_TARGET' | 'COMPLETED' | 'DISPOSED';

export interface TutorialPreviewSnapshot {
  state: TutorialPreviewState;
  scenario: string;
  stepId: string | null;
  highlightedTargetId: string | null;
  title: string;
  body: string;
  index: number;
  total: number;
  fallback?: string;
  persisted: false;
}

export class TutorialPreviewSimulator {
  private index = -1;
  private timers = new Set<number>();
  private disposed = false;
  snapshot: TutorialPreviewSnapshot;

  constructor(private steps: any[], private resolvableTargets?: string[]) {
    this.snapshot = this.make('IDLE', 'fresh');
  }

  previewStep(stepId: string) {
    this.disposed = false;
    this.index = Math.max(0, this.steps.findIndex(step => step.id === stepId));
    return this.show('single');
  }

  startFlow(scenario = 'fresh') {
    this.clearTimers(); this.disposed = false;
    const starts: Record<string, number> = { progressed: 3, interrupted: 7, cleared: 10, completed: this.steps.length, skipped: this.steps.length };
    this.index = Math.min(starts[scenario] ?? 0, this.steps.length);
    if (this.index >= this.steps.length) return this.snapshot = this.make('COMPLETED', scenario);
    return this.show(scenario);
  }

  next() {
    if (this.disposed || this.snapshot.state === 'COMPLETED') return this.snapshot;
    this.index += 1;
    if (this.index >= this.steps.length) return this.snapshot = this.make('COMPLETED', this.snapshot.scenario);
    return this.show(this.snapshot.scenario);
  }

  skip() { return this.snapshot = this.make('COMPLETED', 'skipped'); }

  dispose() {
    this.clearTimers(); this.disposed = true; this.index = -1;
    return this.snapshot = this.make('DISPOSED', 'none');
  }

  debug() { return { timerCount: this.timers.size, disposed: this.disposed }; }

  private show(scenario: string) {
    const step = this.steps[this.index];
    if (!step) return this.snapshot = this.make('COMPLETED', scenario);
    const missing = this.resolvableTargets && !this.resolvableTargets.includes(step.targetId);
    return this.snapshot = { ...this.make(missing ? 'MISSING_TARGET' : 'SHOWING', scenario),
      stepId: step.id, highlightedTargetId: missing ? null : step.targetId,
      title: step.title, body: step.body, fallback: missing ? (step.fallbackAction ?? 'skip-step') : undefined };
  }

  private make(state: TutorialPreviewState, scenario: string): TutorialPreviewSnapshot {
    return { state, scenario, stepId: null, highlightedTargetId: null, title: '', body: '',
      index: Math.max(0, this.index), total: this.steps.length, persisted: false };
  }

  private clearTimers() { for (const timer of this.timers) window.clearTimeout(timer); this.timers.clear(); }
}
