export class TutorialInputLimiter {
  private token: symbol | null = null;
  private allowedTargetId: string | null = null;
  private readonly systemTargets = new Set(['system.back', 'system.skip', 'system.pause']);

  restrict(targetId: string): symbol {
    this.token = Symbol('tutorial-input'); this.allowedTargetId = targetId; return this.token;
  }

  release(token?: symbol): void {
    if (token && token !== this.token) return;
    this.token = null; this.allowedTargetId = null;
  }

  allows(targetId: string): boolean {
    return !this.token || targetId === this.allowedTargetId || this.systemTargets.has(targetId);
  }

  isRestricted(): boolean { return this.token !== null; }
  dispose(): void { this.release(); }
}
