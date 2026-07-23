import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StageDirector } from '../dist/stage/StageDirector.js';

test('任务26：StageDirector 按延迟、间隔和存活上限生成敌人并通关', () => {
  const spawned: any[] = [];
  const director = new StageDirector(stageRuntime(), {
    spawnEnemy: request => {
      const id = `enemy_${spawned.length + 1}`;
      spawned.push({ id, ...request });
      return id;
    },
  });

  director.start();
  director.update(0.1);
  assert.equal(spawned.length, 0);
  director.update(0.11);
  assert.equal(spawned.length, 1);
  assert.equal(spawned[0].spawnPoint.id, 'enemy_left');
  director.update(0.5);
  assert.equal(spawned.length, 2);
  director.update(1);
  assert.equal(spawned.length, 2, 'maxAlive blocks third spawn');

  director.markEnemyDefeated('enemy_1');
  director.update(0.5);
  assert.equal(spawned.length, 3);
  director.markEnemyDefeated('enemy_2');
  director.markEnemyDefeated('enemy_3');
  director.update(0.1);
  assert.equal(director.state, 'STAGE_CLEAR');
  assert.deepEqual(director.getRunStats(), {
    spawnedEnemies: 3,
    defeatedEnemies: 3,
    clearedWaves: 1,
    totalWaves: 1,
  });
});

test('任务26：StageDirector 在主角死亡后失败并停止后续生成', () => {
  const spawned: any[] = [];
  const director = new StageDirector(stageRuntime(), {
    spawnEnemy: request => {
      const id = `enemy_${spawned.length + 1}`;
      spawned.push({ id, ...request });
      return id;
    },
  });

  director.start();
  director.update(0.3);
  director.markHeroDead();
  director.update(2);

  assert.equal(director.state, 'STAGE_FAILED');
  assert.equal(spawned.length, 1);
  assert.equal(director.debugSnapshot().aliveEnemyCount, 0);
});

test('任务26.1：StageDirector 暂停恢复、重置与销毁均保持状态闭环', () => {
  const spawned: string[] = [];
  const director = new StageDirector(stageRuntime(), {
    spawnEnemy: () => {
      const id = `enemy_${spawned.length + 1}`;
      spawned.push(id);
      return id;
    },
  });

  director.start();
  director.update(0.3);
  director.pause();
  director.update(10);
  assert.equal(director.state, 'PAUSED');
  assert.equal(spawned.length, 1);

  director.resume();
  director.markEnemyDefeated('enemy_1');
  director.update(0.5);
  assert.equal(spawned.length, 2);

  director.reset();
  assert.deepEqual(director.debugSnapshot(), {
    state: 'READY',
    activeWaveIndex: 0,
    spawnedEnemyCount: 0,
    aliveEnemyCount: 0,
    remainingWaveCount: 0,
    heroSpawnPoint: stageRuntime().spawnPoints[0],
    loadedStageLayerCount: 0,
    defeatedEnemyCount: 0,
    clearedWaveCount: 0,
    totalWaveCount: 1,
  });

  director.dispose();
  director.update(10);
  assert.equal(director.state, 'DISPOSED');
  assert.equal(spawned.length, 2);
});

function stageRuntime(): any {
  return {
    schemaVersion: 1,
    stageId: 'stage_battle_1_1',
    layout: { canvasWidth: 750, canvasHeight: 1334, sceneMode: 'fixed-screen', heroSpawnPointId: 'hero_start', battleArea: { x: 0, y: 160, width: 750, height: 980 }, enabled: true },
    layers: [],
    spawnPoints: [
      { id: 'hero_start', name: '主角', type: 'hero', x: 375, y: 980, facing: 'right', enabled: true },
      { id: 'enemy_left', name: '左侧入口', type: 'enemy', x: 120, y: 360, facing: 'right', enabled: true },
    ],
    waves: [{
      id: 'wave_1',
      order: 1,
      name: '第1波',
      startTrigger: { type: 'stage-start' },
      startDelayMs: 200,
      maxAlive: 2,
      completionRule: { type: 'all-enemies-cleared' },
      completionDelayMs: 0,
      enabled: true,
      entries: [{
        id: 'entry_1',
        enemyTemplateId: 'enemy_scrap_mouse_01',
        spawnPointId: 'enemy_left',
        count: 3,
        spawnIntervalMs: 500,
        initialDelayMs: 0,
        elite: false,
        levelMultiplier: 1,
        hpMultiplier: 1,
        attackMultiplier: 1,
        enabled: true,
      }],
    }],
    completionRule: { type: 'all-waves-cleared' },
    failureRule: { type: 'hero-dead' },
  };
}
