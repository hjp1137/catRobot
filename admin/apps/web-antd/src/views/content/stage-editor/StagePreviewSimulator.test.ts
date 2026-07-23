import { describe, expect, it } from 'vitest';
import { StagePreviewSimulator } from './StagePreviewSimulator';

describe('StagePreviewSimulator', () => {
  it('runs preparing, waves, pause/resume and stage clear', () => {
    const sim = new StagePreviewSimulator(sample());
    expect(sim.start().state).toBe('PREPARING');
    expect(sim.tick(100).state).toBe('WAVE_RUNNING');
    expect(sim.snapshot.spawned).toBe(1);
    expect(sim.pause().state).toBe('PAUSED');
    sim.tick(5000);
    expect(sim.snapshot.spawned).toBe(1);
    expect(sim.resume().state).toBe('WAVE_RUNNING');
    sim.defeatWave();
    expect(sim.tick(1).state).toBe('WAVE_CLEAR');
    expect(sim.skipWait().state).toBe('PREPARING');
    sim.tick(1);
    sim.defeatWave();
    expect(sim.tick(1).state).toBe('STAGE_CLEAR');
  });

  it('applies speed and stops permanently after hero death', () => {
    const config = sample();
    config.waves[0].entries[0].spawnIntervalMs = 1000;
    const sim = new StagePreviewSimulator(config);
    sim.setSpeed(4);
    sim.start();
    sim.tick(100);
    expect(sim.snapshot.speed).toBe(4);
    const before = sim.heroDead();
    sim.tick(9999);
    expect(sim.snapshot).toEqual(before);
    expect(sim.snapshot.state).toBe('STAGE_FAILED');
  });

  it('destroys failed draft state before entering published legacy fallback', () => {
    const draft = new StagePreviewSimulator(sample());
    draft.start();
    draft.tick(100);
    expect(draft.heroDead().state).toBe('STAGE_FAILED');

    const disposed = draft.dispose();
    const published = new StagePreviewSimulator(undefined, 'LEGACY_FALLBACK');

    expect(disposed.state).toBe('DISPOSED');
    expect(published.snapshot).toEqual({
      state: 'LEGACY_FALLBACK', waveIndex: -1, waveName: '-', spawned: 0,
      alive: 0, remaining: 0, waitMs: 0, currentEntry: '-', speed: 1,
    });
  });

  it('stops draft spawning after disposal and creates a fresh READY draft on return', () => {
    const draft = new StagePreviewSimulator(sample());
    draft.start();
    draft.tick(100);
    const before = draft.dispose();

    draft.tick(10_000);
    expect(draft.snapshot).toEqual(before);

    const returnedDraft = new StagePreviewSimulator(sample());
    expect(returnedDraft.snapshot.state).toBe('READY');
    expect(returnedDraft.snapshot.spawned).toBe(0);
    expect(returnedDraft.snapshot.currentEntry).toBe('-');
  });

  it('previews three-star rewards and failed settlement without writing player data', () => {
    const win = new StagePreviewSimulator(sample(), 'READY', progression());
    win.start(); win.tick(100); win.defeatWave(); win.tick(1); win.skipWait(); win.tick(1); win.defeatWave(); win.tick(1);
    expect(win.snapshot.settlement).toMatchObject({ victory: true, stars: 3, rewards: ['gold×50'], unlocks: ['stage_battle_1_2'] });

    const fail = new StagePreviewSimulator(sample(), 'READY', progression());
    fail.start(); fail.tick(100); fail.heroDead();
    expect(fail.snapshot.settlement).toMatchObject({ victory: false, stars: 0, rewards: [] });
  });
});

function sample(): any {
  const entry = { id: 'entry_1', enemyTemplateId: 'enemy_scrap_mouse_01', spawnPointId: 'enemy_1', count: 1, initialDelayMs: 0, spawnIntervalMs: 100, enabled: true };
  return {
    waves: [
      { id: 'wave_1', name: '第一波', order: 1, startDelayMs: 100, completionDelayMs: 200, maxAlive: 2, enabled: true, entries: [entry] },
      { id: 'wave_2', name: '第二波', order: 2, startDelayMs: 0, completionDelayMs: 0, maxAlive: 2, enabled: true, entries: [{ ...entry, id: 'entry_2' }] },
    ],
  };
}

function progression(): any {
  return { objectives: [
    { id: 'clear', displayText: '清除全部波次', type: 'clear-all-waves', required: true, starEligible: true, enabled: true, params: {} },
    { id: 'fast', displayText: '60秒内', type: 'complete-within-duration', required: false, starEligible: true, enabled: true, params: { maxDurationSec: 60 } },
    { id: 'health', displayText: '生命50%', type: 'hero-health-above', required: false, starEligible: true, enabled: true, params: { minHealthRatio: .5 } },
  ], rewardPools: [{ group: 'first-clear', entries: [{ rewardRefId: 'gold', minQuantity: 50, enabled: true }] }],
    unlockRules: [{ type: 'prerequisite-stars', requiredStars: 3, nextStageId: 'stage_battle_1_2', enabled: true }] };
}
