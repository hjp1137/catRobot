import type { StageSpawnPoint, StageWave, StageWaveEntry } from '../content/models/StageOrchestration';

export type StageDirectorState =
  'INITIALIZING' | 'READY' | 'PREPARING' | 'WAVE_RUNNING' | 'WAVE_CLEAR' | 'STAGE_CLEAR' | 'STAGE_FAILED' | 'PAUSED' | 'DISPOSED';

export interface StageSpawnRequest {
  stageId: string;
  wave: StageWave;
  entry: StageWaveEntry;
  spawnPoint: StageSpawnPoint;
}

export interface StageDirectorHooks {
  spawnEnemy(request: StageSpawnRequest): string;
}
