import type { IContext } from '../engine/IContext';
import type { GameManager } from '../core/GameManager';
import type { BattleManager } from '../battle/BattleManager';
import { getBattleHudSafeTop } from '../ui/BattleUI';

export interface BattleTestState {
  scene: string;
  stageId: string | null;
  waveIndex: number;
  waveTotal: number;
  enemyAlive: number;
  enemySpawned: number;
  playerVisible: boolean;
  enemyCount: number;
  enemyTotal: number;
  bullets: number;
  projectiles: number;
  damageNumbers: number;
  impacts: number;
  explosions: number;
  drops: number;
  skillCooldown: boolean;
  hudSafeTop: number;
  canvasWidth: number;
  canvasHeight: number;
  playerHpRatio: number;
  ended: boolean;
  shieldActive: boolean;
  cannonCooldown: boolean;
  battleResult: boolean | null;
  hasBlockingError: boolean;
  stageOrchestrationSource: string;
  stageRuntimeState: string;
  activeWaveIndex: number;
  remainingWaveCount: number;
  heroSpawnPoint: unknown;
  loadedStageLayerCount: number;
}

export function getBattleTestState(
  game: GameManager,
  battle: BattleManager,
  ctx: IContext,
): BattleTestState {
  const snap = battle.feedback.snapshot();
  const player = battle.player;
  const skillStates = battle.getPlayerSkillStates();
  const cannon = skillStates.find(s => s.skillId === 'meow_cannon');
  const shield = skillStates.find(s => s.skillId === 'heavy_shield');
  const bullets = battle.activeProjectiles + snap.projectiles;
  const stageRuntime = battle.stageDirector?.debugSnapshot();
  return {
    scene: game.scene,
    stageId: battle.stage?.id ?? null,
    waveIndex: battle.waveManager ? battle.waveManager.currentWaveIndex + 1 : 0,
    waveTotal: battle.waveManager ? battle.waveManager.totalWaves : 0,
    enemyAlive: battle.aliveEnemies,
    enemySpawned: battle.spawnedEnemyCount,
    playerVisible: game.scene === 'battle' && !!player && !player.dead,
    enemyCount: battle.aliveEnemies,
    enemyTotal: battle.totalEnemies,
    bullets,
    projectiles: bullets,
    damageNumbers: snap.damageNumbers,
    impacts: snap.impacts,
    explosions: snap.explosions,
    drops: snap.drops,
    skillCooldown: skillStates.some(s => s.cooldownRemaining > 0),
    hudSafeTop: getBattleHudSafeTop(ctx.getSystemInfo()),
    canvasWidth: ctx.canvasWidth,
    canvasHeight: ctx.canvasHeight,
    playerHpRatio: player ? player.hpRatio : 0,
    ended: battle.isEnded,
    shieldActive: shield?.isActive ?? false,
    cannonCooldown: (cannon?.cooldownRemaining ?? 0) > 0,
    battleResult: battle.resultState,
    hasBlockingError: false,
    stageOrchestrationSource: battle.stageDirector ? 'published-stage-orchestration-snapshot' : 'legacy-stage-config',
    stageRuntimeState: stageRuntime?.state ?? '',
    activeWaveIndex: stageRuntime?.activeWaveIndex ?? 0,
    remainingWaveCount: stageRuntime?.remainingWaveCount ?? 0,
    heroSpawnPoint: stageRuntime?.heroSpawnPoint,
    loadedStageLayerCount: stageRuntime?.loadedStageLayerCount ?? 0,
  };
}
