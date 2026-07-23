export type PreviewState = 'READY' | 'PREPARING' | 'WAVE_RUNNING' | 'WAVE_CLEAR' | 'STAGE_CLEAR' | 'STAGE_FAILED' | 'PAUSED' | 'LEGACY_FALLBACK' | 'DISPOSED';
export interface PreviewSettlement { victory: boolean; stars: number; objectives: Array<{ id:string; text:string; completed:boolean }>; rewards: string[]; unlocks: string[]; }
export interface PreviewSnapshot { state: PreviewState; waveIndex: number; waveName: string; spawned: number; alive: number; remaining: number; waitMs: number; currentEntry: string; speed: number; settlement?: PreviewSettlement; }

export class StagePreviewSimulator {
  private waves: any[];
  private speed = 1;
  private previous: PreviewState = 'READY';
  private waveIndex = -1;
  private waitMs = 0;
  private entries: Array<{ value: any; spawned: number; timer: number }> = [];
  private value: PreviewSnapshot = emptySnapshot();
  private elapsedMs = 0;
  private defeated = 0;

  constructor(config: any, initialState: 'READY' | 'LEGACY_FALLBACK' = 'READY', private progression?: any) {
    this.waves = (config?.waves ?? []).filter((wave: any) => wave.enabled !== false).sort((a: any, b: any) => a.order - b.order);
    this.value = emptySnapshot(1, initialState);
  }

  get snapshot(): PreviewSnapshot { return { ...this.value }; }
  start(): PreviewSnapshot { this.prepare(0); return this.snapshot; }
  setSpeed(speed: number): PreviewSnapshot { this.speed = [1, 2, 4].includes(speed) ? speed : 1; this.sync(); return this.snapshot; }
  pause(): PreviewSnapshot { if (!terminal(this.value.state) && this.value.state !== 'PAUSED') { this.previous = this.value.state; this.value.state = 'PAUSED'; } return this.snapshot; }
  resume(): PreviewSnapshot { if (this.value.state === 'PAUSED') this.value.state = this.previous; return this.snapshot; }
  reset(): PreviewSnapshot { this.waveIndex = -1; this.entries = []; this.waitMs = 0; this.elapsedMs = 0; this.defeated = 0; this.value = emptySnapshot(this.speed); return this.snapshot; }
  dispose(): PreviewSnapshot {
    this.waveIndex = -1;
    this.entries = [];
    this.waitMs = 0;
    this.waves = [];
    this.value = emptySnapshot(this.speed, 'DISPOSED');
    return this.snapshot;
  }
  heroDead(): PreviewSnapshot { this.value.state = 'STAGE_FAILED'; this.value.alive = 0; this.value.settlement = this.settlement(false); return this.snapshot; }
  defeatOne(): PreviewSnapshot { if (this.value.alive > 0) this.defeated++; this.value.alive = Math.max(0, this.value.alive - 1); return this.snapshot; }
  defeatWave(): PreviewSnapshot { this.defeated += this.value.alive + this.value.remaining; this.value.alive = 0; for (const entry of this.entries) entry.spawned = entry.value.count; this.sync(); return this.snapshot; }
  skipWait(): PreviewSnapshot {
    if (this.value.state === 'WAVE_CLEAR') this.prepare(this.waveIndex + 1);
    else if (this.value.state === 'PREPARING') { this.waitMs = 0; this.tick(0); }
    return this.snapshot;
  }

  tick(elapsedMs: number): PreviewSnapshot {
    if (terminal(this.value.state) || this.value.state === 'PAUSED' || this.value.state === 'READY') return this.snapshot;
    const delta = Math.max(0, elapsedMs) * this.speed;
    this.elapsedMs += delta;
    if (this.value.state === 'PREPARING') {
      this.waitMs -= delta;
      if (this.waitMs > 0) { this.sync(); return this.snapshot; }
      this.value.state = 'WAVE_RUNNING';
    } else if (this.value.state === 'WAVE_CLEAR') {
      this.waitMs -= delta;
      if (this.waitMs <= 0) this.prepare(this.waveIndex + 1);
      this.sync(); return this.snapshot;
    }
    this.spawn(delta);
    if (this.entries.every(entry => entry.spawned >= entry.value.count) && this.value.alive === 0) {
      if (this.waveIndex >= this.waves.length - 1) { this.value.state = 'STAGE_CLEAR'; this.value.settlement = this.settlement(true); }
      else { this.value.state = 'WAVE_CLEAR'; this.waitMs = this.waves[this.waveIndex].completionDelayMs ?? 0; }
    }
    this.sync(); return this.snapshot;
  }

  private prepare(index: number) {
    this.waveIndex = index;
    const wave = this.waves[index];
    if (!wave) { this.value.state = 'STAGE_CLEAR'; return; }
    this.entries = (wave.entries ?? []).filter((entry: any) => entry.enabled !== false).map((value: any) => ({ value, spawned: 0, timer: value.initialDelayMs ?? 0 }));
    this.value = { state: 'PREPARING', waveIndex: index, waveName: wave.name, spawned: 0, alive: 0, remaining: 0, waitMs: 0, currentEntry: '-', speed: this.speed };
    this.waitMs = wave.startDelayMs ?? 0; this.sync();
  }

  private spawn(delta: number) {
    const maxAlive = Math.max(1, this.waves[this.waveIndex]?.maxAlive ?? 1);
    for (const entry of this.entries) {
      if (entry.spawned >= entry.value.count || this.value.alive >= maxAlive) continue;
      entry.timer -= delta;
      while (entry.timer <= 0 && entry.spawned < entry.value.count && this.value.alive < maxAlive) {
        entry.spawned += 1;
        this.value.alive += 1;
        this.value.currentEntry = entry.value.id;
        entry.timer += Math.max(1, entry.value.spawnIntervalMs ?? 0);
      }
    }
  }

  private sync() {
    this.value.waveIndex = this.waveIndex;
    this.value.waveName = this.waves[this.waveIndex]?.name ?? '-';
    this.value.spawned = this.entries.reduce((sum, entry) => sum + entry.spawned, 0);
    this.value.remaining = this.entries.reduce((sum, entry) => sum + Math.max(0, entry.value.count - entry.spawned), 0);
    this.value.waitMs = Math.max(0, Math.round(this.waitMs));
    this.value.speed = this.speed;
  }

  private settlement(victory: boolean): PreviewSettlement {
    const objectives = (this.progression?.objectives ?? []).filter((x:any)=>x.enabled!==false).map((x:any)=>({
      id:x.id, text:x.displayText, completed: objectiveComplete(x, victory, this.elapsedMs, this.defeated), required:Boolean(x.required), starEligible:Boolean(x.starEligible),
    }));
    const requiredOk = victory && objectives.filter((x:any)=>x.required).every((x:any)=>x.completed);
    const bonus = objectives.filter((x:any)=>!x.required&&x.starEligible&&x.completed).length;
    const totalBonus = objectives.filter((x:any)=>!x.required&&x.starEligible).length;
    const stars = requiredOk ? (totalBonus > 0 && bonus === totalBonus ? 3 : bonus > 0 ? 2 : 1) : 0;
    const eligiblePools = requiredOk ? (this.progression?.rewardPools ?? []).filter((pool:any)=>pool.group==='repeat-clear'||pool.group==='first-clear'||(pool.group==='first-three-star'&&stars===3)||(pool.group==='objective-bonus'&&objectives.some((x:any)=>x.id===pool.objectiveId&&x.completed))) : [];
    const rewards = eligiblePools.flatMap((pool:any)=>pool.entries??[]).filter((x:any)=>x.enabled!==false).map((x:any)=>`${x.rewardRefId}×${x.minQuantity}`);
    const unlocks = requiredOk ? (this.progression?.unlockRules??[]).filter((x:any)=>x.enabled!==false&&(x.type==='default-unlocked'||x.type==='prerequisite-clear'||stars>=x.requiredStars)).map((x:any)=>x.nextStageId).filter(Boolean) : [];
    return { victory: requiredOk, stars, objectives, rewards, unlocks };
  }
}

function objectiveComplete(x:any,victory:boolean,elapsedMs:number,defeated:number):boolean {
  if(x.type==='clear-all-waves')return victory;
  if(x.type==='complete-within-duration')return victory&&elapsedMs/1000<=x.params.maxDurationSec;
  if(x.type==='hero-health-above')return victory&&1>=x.params.minHealthRatio;
  if(x.type==='survive-duration')return elapsedMs/1000>=x.params.durationSec;
  if(x.type==='defeat-enemy-count')return defeated>=x.params.count;
  return false;
}

function emptySnapshot(speed = 1, state: PreviewState = 'READY'): PreviewSnapshot {
  return { state, waveIndex: -1, waveName: '-', spawned: 0, alive: 0, remaining: 0, waitMs: 0, currentEntry: '-', speed };
}

function terminal(state: PreviewState): boolean {
  return state === 'STAGE_CLEAR' || state === 'STAGE_FAILED' || state === 'LEGACY_FALLBACK' || state === 'DISPOSED';
}
