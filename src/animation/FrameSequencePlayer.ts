import type { AnimationClipDefinition, AnimationFrameDefinition } from '../content/models/AnimationClip';

export interface FrameSequenceOptions {
  maxFrameAdvance?: number;
}

export class FrameSequencePlayer {
  private clip: AnimationClipDefinition | null = null;
  private frameIndex = 0;
  private elapsedMs = 0;
  private paused = false;
  private completed = false;
  private playbackSpeed = 1;
  public advanceCount = 0;

  constructor(private readonly options: FrameSequenceOptions = {}) {}

  setAction(_state: string, clip: AnimationClipDefinition): void {
    this.setClip(clip);
  }

  setClip(clip: AnimationClipDefinition | null): void {
    if (this.clip?.key === clip?.key) return;
    this.clip = clip ? { ...clip, frames: [...clip.frames].sort((a, b) => a.order - b.order) } : null;
    this.reset();
  }

  reset(): void {
    this.frameIndex = 0;
    this.elapsedMs = 0;
    this.completed = false;
    this.advanceCount = 0;
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }
  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  }

  stepForward(): void {
    const frames = this.clip?.frames ?? [];
    if (!frames.length) return;
    this.elapsedMs = 0;
    this.advanceFrame();
  }

  stepBackward(): void {
    const frames = this.clip?.frames ?? [];
    if (!frames.length) return;
    this.elapsedMs = 0;
    this.completed = false;
    this.frameIndex = this.frameIndex > 0 ? this.frameIndex - 1 : frames.length - 1;
  }

  currentFrameIndex(): number {
    return this.frameIndex;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  totalDurationMs(): number {
    const frames = this.clip?.frames ?? [];
    return frames.reduce((sum, frame) => sum + this.durationForFrame(frame), 0);
  }

  currentTimeMs(): number {
    const frames = this.clip?.frames ?? [];
    return frames.slice(0, this.frameIndex).reduce((sum, frame) => sum + this.durationForFrame(frame), 0) + this.elapsedMs;
  }

  update(dtSeconds: number): void {
    const frames = this.clip?.frames ?? [];
    if (this.paused || this.completed || frames.length <= 1) return;
    this.elapsedMs += Math.max(0, dtSeconds) * 1000 * this.playbackSpeed;
    const max = this.options.maxFrameAdvance ?? 12;
    this.advanceCount = 0;
    while (this.elapsedMs >= this.currentDurationMs() && this.advanceCount < max) {
      this.elapsedMs -= this.currentDurationMs();
      this.advanceFrame();
      this.advanceCount++;
      if (this.completed) break;
    }
    if (this.advanceCount >= max) this.elapsedMs = 0;
  }

  currentFrame(): AnimationFrameDefinition | null {
    const frames = this.clip?.frames ?? [];
    if (!frames.length) return null;
    return frames[Math.min(this.frameIndex, frames.length - 1)] ?? null;
  }

  private currentDurationMs(): number {
    const frame = this.currentFrame();
    return this.durationForFrame(frame);
  }

  private durationForFrame(frame?: AnimationFrameDefinition | null): number {
    return Math.max(1, frame?.durationMs ?? this.clip?.defaultFrameDurationMs ?? fpsDuration(this.clip?.defaultFps) ?? 100);
  }

  private advanceFrame(): void {
    const frames = this.clip?.frames ?? [];
    if (this.frameIndex < frames.length - 1) {
      this.frameIndex++;
      return;
    }
    if (this.clip?.loop || this.clip?.playMode === 'loop') {
      this.frameIndex = 0;
      return;
    }
    if (this.clip?.playMode === 'once') this.frameIndex = 0;
    else this.frameIndex = frames.length - 1;
    this.completed = true;
  }
}

function fpsDuration(fps?: number): number | undefined {
  return fps && fps > 0 ? 1000 / fps : undefined;
}
