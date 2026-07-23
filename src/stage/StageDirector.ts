import type { StageRuntimeConfig, StageSpawnPoint, StageWave, StageWaveEntry } from '../content/models/StageOrchestration';
import type { StageDirectorHooks, StageDirectorState } from './StageDirectorTypes';

interface EntryState { entry: StageWaveEntry; spawned: number; timerMs: number; }

export class StageDirector {
  public state: StageDirectorState = 'INITIALIZING';
  private previousState: StageDirectorState = 'INITIALIZING';
  private waveIndex = 0;
  private waitMs = 0;
  private entryStates: EntryState[] = [];
  private alive = new Set<string>();
  private totalSpawned = 0;
  private defeatedEnemies = 0;
  private clearedWaves = 0;

  constructor(private readonly config: StageRuntimeConfig, private readonly hooks: StageDirectorHooks) {}

  start(): void {
    this.waveIndex = 0;
    this.alive.clear();
    this.totalSpawned = 0;
    this.defeatedEnemies = 0;
    this.clearedWaves = 0;
    this.prepareWave(0);
    this.state = 'PREPARING';
  }

  update(dt: number): void {
    if (this.isTerminal() || this.state === 'PAUSED') return;
    const deltaMs = Math.max(0, dt * 1000);
    if (this.state === 'PREPARING' || this.state === 'WAVE_CLEAR') {
      this.waitMs -= deltaMs;
      if (this.waitMs > 0) return;
      if (this.state === 'WAVE_CLEAR') return this.advanceAfterClear();
      this.state = 'WAVE_RUNNING';
    }
    if (this.state !== 'WAVE_RUNNING') return;
    this.spawnEntries(deltaMs);
    if (this.entryStates.every(item => item.spawned >= item.entry.count) && this.alive.size === 0) {
      this.clearedWaves++;
      if (this.waveIndex >= this.enabledWaves().length - 1) this.state = 'STAGE_CLEAR';
      else { this.state = 'WAVE_CLEAR'; this.waitMs = this.currentWave().completionDelayMs; }
    }
  }

  pause(): void {
    if (this.isTerminal() || this.state === 'PAUSED') return;
    this.previousState = this.state;
    this.state = 'PAUSED';
  }

  resume(): void { if (this.state === 'PAUSED') this.state = this.previousState; }

  reset(): void {
    this.state = 'READY';
    this.waveIndex = 0;
    this.waitMs = 0;
    this.entryStates = [];
    this.alive.clear();
    this.totalSpawned = 0;
    this.defeatedEnemies = 0;
    this.clearedWaves = 0;
  }

  dispose(): void { this.alive.clear(); this.entryStates = []; this.state = 'DISPOSED'; }
  markEnemyDefeated(id: string): void { if (this.alive.delete(id)) this.defeatedEnemies++; }
  setAliveEnemyIds(ids: string[]): void {
    const next = new Set(ids);
    for (const id of this.alive) if (!next.has(id)) this.defeatedEnemies++;
    this.alive = next;
  }
  markHeroDead(): void { this.alive.clear(); this.state = 'STAGE_FAILED'; }

  debugSnapshot() {
    return {
      state: this.state,
      activeWaveIndex: this.waveIndex,
      spawnedEnemyCount: this.entryStates.reduce((sum, item) => sum + item.spawned, 0),
      aliveEnemyCount: this.alive.size,
      remainingWaveCount: Math.max(0, this.enabledWaves().length - this.waveIndex - 1),
      heroSpawnPoint: this.heroSpawnPoint(),
      loadedStageLayerCount: this.config.layers.filter(l => l.enabled).length,
      defeatedEnemyCount: this.defeatedEnemies,
      clearedWaveCount: this.clearedWaves,
      totalWaveCount: this.enabledWaves().length,
    };
  }

  getRunStats() {
    return { spawnedEnemies: this.totalSpawned, defeatedEnemies: this.defeatedEnemies,
      clearedWaves: this.clearedWaves, totalWaves: this.enabledWaves().length };
  }

  private spawnEntries(deltaMs: number): void {
    const maxAlive = Math.max(1, this.currentWave().maxAlive);
    for (const item of this.entryStates) {
      if (!item.entry.enabled || item.spawned >= item.entry.count || this.alive.size >= maxAlive) continue;
      item.timerMs -= deltaMs;
      if (item.timerMs > 0) continue;
      const spawnPoint = this.spawnPoint(item.entry.spawnPointId);
      const id = this.hooks.spawnEnemy({ stageId: this.config.stageId, wave: this.currentWave(), entry: item.entry, spawnPoint });
      this.alive.add(id);
      item.spawned += 1;
      this.totalSpawned++;
      item.timerMs = item.entry.spawnIntervalMs;
    }
  }

  private prepareWave(index: number): void {
    this.waveIndex = index;
    const wave = this.currentWave();
    this.waitMs = wave.startDelayMs;
    this.entryStates = wave.entries.filter(e => e.enabled).map(entry => ({ entry, spawned: 0, timerMs: entry.initialDelayMs }));
  }

  private advanceAfterClear(): void { this.prepareWave(this.waveIndex + 1); this.state = 'PREPARING'; }
  private enabledWaves(): StageWave[] { return this.config.waves.filter(w => w.enabled).sort((a, b) => a.order - b.order); }
  private currentWave(): StageWave { return this.enabledWaves()[this.waveIndex]; }
  private spawnPoint(id: string): StageSpawnPoint { const p = this.config.spawnPoints.find(s => s.id === id && s.enabled); if (!p) throw new Error(`出生点不存在：${id}`); return p; }
  private heroSpawnPoint(): StageSpawnPoint | undefined { return this.config.spawnPoints.find(p => p.id === this.config.layout.heroSpawnPointId); }
  private isTerminal(): boolean { return this.state === 'STAGE_CLEAR' || this.state === 'STAGE_FAILED' || this.state === 'DISPOSED'; }
}
