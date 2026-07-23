import type { IContext } from '../engine/IContext';
import type { GameManager } from '../core/GameManager';
import type { RuntimeSkillState } from '../player/SkillState';
import type { SkillUseResult } from '../player/PlayerMecha';
import { PlayerMecha } from '../player/PlayerMecha';
import { EnemyMouse } from '../enemy/EnemyMouse';
import { BattleFeedback } from '../battle/BattleFeedback';
import { SoundManager } from '../core/SoundManager';
import { CameraState, clampWorldPoint, createCameraState, followCameraToPoint } from './WorldTransform';
import { drawExploreScene } from './ExploreRenderer';
import { getBattleHudSafeTop as resolveBattleHudSafeTop } from '../config/BattleAssets';
import {
  createExploreSpawnPoints,
  ExploreSpawnPoint,
  seedExploreEnemies,
  updateExploreEnemyAI,
  updateExploreSpawns,
} from './ExploreEnemySystem';
import {
  createExploreObjective,
  formatExploreObjective,
  getExploreEnemySpawnPauseState,
  updateExploreObjectiveCompletion,
} from './ExploreObjectiveSystem';
import {
  createExploreChests,
  createExploreResourceNodes,
  ExploreChest,
  ExploreResourceNode,
  updateExploreInteractions,
} from './ExploreInteractableSystem';
import { TRAINING_GROUND_CONTENT, type ExploreObjectiveState } from './ExploreContentConfig';
import { resolveExploreTerrainMove, type ExploreTerrainObstacle } from './ExploreTerrain';
import { ExploreGuideTarget, getExploreGuideTarget } from './ExploreGuideSystem';
import { getDefaultContentRegistry } from '../content/registry/ContentRegistry';
import type { BackgroundTheme } from '../content/models/BackgroundTheme';
import type { HeroVisualTemplate } from '../content/models/HeroVisualTemplate';
import type { ExplorationStageConfig, StageDefinition, StageWaveDefinition } from '../content/models/StageDefinition';
import type { ExploreHudConfig, StageLayer } from '../content/models/StageOrchestration';
import { findPublishedStageOrchestration } from '../stage/StageOrchestrationRepository';

const EXPLORE_CONFIG = {
  mapId: 'training_ground',
  worldWidth: TRAINING_GROUND_CONTENT.worldWidth,
  worldHeight: TRAINING_GROUND_CONTENT.worldHeight,
  targetOffsetY: 80,
} as const;

export class ExploreScene {
  public stage = { id: 'explore_training', name: '训练场' };
  public readonly hudStatus = '自由探索';
  public activeStageId = TRAINING_GROUND_CONTENT.stageDefinitionId;
  public readonly mapId = EXPLORE_CONFIG.mapId;
  public worldWidth = EXPLORE_CONFIG.worldWidth;
  public worldHeight = EXPLORE_CONFIG.worldHeight;
  public backgroundTheme: BackgroundTheme = getDefaultContentRegistry().getBackground(TRAINING_GROUND_CONTENT.backgroundThemeId);
  public heroVisualTemplate: HeroVisualTemplate = getDefaultContentRegistry().getHeroVisual(TRAINING_GROUND_CONTENT.heroVisualTemplateId);
  public stageLayers: readonly StageLayer[] = [];
  public terrainObstacles: readonly ExploreTerrainObstacle[] = [];
  public exploreHud: ExploreHudConfig | undefined;
  public player!: PlayerMecha;
  public enemies: EnemyMouse[] = [];
  public camera: CameraState;
  public spawnPoints: ExploreSpawnPoint[] = [];
  public resourceNodes: ExploreResourceNode[] = [];
  public chests: ExploreChest[] = [];
  public objective: ExploreObjectiveState = createExploreObjective();
  public coinCollected = 0;
  public readonly feedback = new BattleFeedback();
  private started = false;
  private totalSpawned = 0;
  private lastCollectedDrops = 0;
  private lastEnemyKillGoalCompleted = false;
  private lastObjectiveCompleted = false;
  public killGoalNoticeTimer = 0;
  public completionNoticeTimer = 0;
  public paused = false;
  private settlementStageId: string | null = null;
  private startedAt = 0;
  private stageWaves: StageWaveDefinition[] = [];
  private currentStageWave = 0;
  private currentStageWaveMessage: string | null = null;

  constructor(private ctx: IContext, private game: GameManager) {
    this.camera = createCameraState(ctx.canvasWidth, ctx.canvasHeight, this.worldWidth, this.worldHeight);
  }

  start(stage?: StageDefinition): void {
    const fallback = TRAINING_GROUND_CONTENT;
    const exploration = stage?.exploration;
    this.activeStageId = stage?.id ?? fallback.stageDefinitionId;
    this.stage = { id: stage?.legacyStageId ?? 'explore_training', name: stage?.name ?? '训练场' };
    this.settlementStageId = stage?.legacyStageId ?? null;
    this.startedAt = this.ctx.now();
    this.worldWidth = exploration?.worldWidth ?? fallback.worldWidth;
    this.worldHeight = exploration?.worldHeight ?? fallback.worldHeight;
    this.backgroundTheme = getDefaultContentRegistry().getBackground(stage?.backgroundThemeId ?? fallback.backgroundThemeId);
    this.heroVisualTemplate = getDefaultContentRegistry().getHeroVisual(stage?.heroVisualTemplateId ?? fallback.heroVisualTemplateId);
    this.applyPublishedTerrain(this.activeStageId);
    SoundManager.getInstance().stopAll();
    this.feedback.reset();
    this.enemies = [];
    this.stageWaves = stage?.waves ?? [];
    this.currentStageWave = 0;
    this.currentStageWaveMessage = null;
    this.spawnPoints = this.stageWaves.length ? [] : createExploreSpawnPoints(exploration);
    this.resourceNodes = (!stage || stage.objectives?.some(item => item.type === 'resource'))
      ? createExploreResourceNodes() : [];
    this.chests = (!stage || stage.objectives?.some(item => item.type === 'chest'))
      ? createExploreChests() : [];
    this.objective = createExploreObjective(stage?.objectives);
    this.coinCollected = 0;
    this.lastCollectedDrops = 0;
    this.totalSpawned = 0;
    this.lastEnemyKillGoalCompleted = false;
    this.lastObjectiveCompleted = false;
    this.killGoalNoticeTimer = 0;
    this.completionNoticeTimer = 0;
    this.paused = false;
    this.started = true;
    this.camera = createCameraState(this.ctx.canvasWidth, this.ctx.canvasHeight, this.worldWidth, this.worldHeight);
    const stats = this.game.battleStats;
    this.player = new PlayerMecha(this.ctx, this.game.mechaConfig, this.game.player.level, this.worldWidth / 2,
      Math.round(this.worldHeight * 0.55), this.game.player.skillLevels, stats);
    this.player.movementBounds = {
      minX: this.player.radius, minY: this.player.radius,
      maxX: this.worldWidth - this.player.radius, maxY: this.worldHeight - this.player.radius,
    };
    this.enemies = this.stageWaves.length
      ? this.spawnStageWave(this.stageWaves[0])
      : seedExploreEnemies(this.ctx, this.player, this.spawnPoints, this.worldWidth, this.worldHeight);
    this.totalSpawned = this.enemies.length;
    this.updateCamera();
  }

  update(dt: number): void {
    if (!this.started || !this.player || this.paused) return;
    this.feedback.update(dt, this.player.x, this.player.y);
    this.collectDropCoins();
    const playerBeforeMove = { x: this.player.x, y: this.player.y };
    const enemyBeforeMove = new Map(this.enemies.map(enemy => [enemy, { x: enemy.x, y: enemy.y }]));
    this.player.update(dt, this.enemies, this.terrainObstacles);
    this.clampPlayer(playerBeforeMove);
    this.flushCombatFeedback();
    updateExploreEnemyAI(this.enemies, this.player, this.worldWidth, this.worldHeight, dt);
    for (const enemy of this.enemies) {
      const before = enemyBeforeMove.get(enemy);
      if (!before) continue;
      const resolved = resolveExploreTerrainMove(before, enemy, enemy.radius, this.terrainObstacles);
      enemy.x = resolved.x;
      enemy.y = resolved.y;
    }
    this.applyInteractables();
    this.recordKilledEnemies();
    this.enemies = this.enemies.filter(e => !e.dead);
    if (this.stageWaves.length) this.advanceStageWave();
    else this.totalSpawned += updateExploreSpawns(
      this.ctx, this.player, this.enemies, this.spawnPoints,
      this.worldWidth, this.worldHeight, dt, this.enemySpawnPaused,
    );
    if (this.killGoalNoticeTimer > 0) this.killGoalNoticeTimer -= dt;
    if (this.completionNoticeTimer > 0) this.completionNoticeTimer -= dt;
    const killDone = this.objective.enemyKillGoalCompleted;
    if (killDone && !this.lastEnemyKillGoalCompleted) {
      this.killGoalNoticeTimer = 2.0;
    }
    this.lastEnemyKillGoalCompleted = killDone;
    const objDone = this.objective.completed;
    if (objDone && !this.lastObjectiveCompleted) {
      this.completionNoticeTimer = 3.0;
      const stageId = this.settlementStageId;
      if (stageId && this.game.finishFreeMapStage(stageId, this.player.hpRatio, this.ctx.now() - this.startedAt)) return;
    }
    this.lastObjectiveCompleted = objDone;
    this.updateCamera();
  }

  render(): void { if (this.started && this.player) drawExploreScene(this.ctx.canvas, this, this.ctx.now()); }

  usePlayerSkill(skillId: string): SkillUseResult {
    if (!this.started || this.paused || !this.player || this.player.dead) return { ok: false, reason: 'cooldown' };
    const result = this.player.useSkill(skillId, this.enemies);
    this.flushCombatFeedback();
    return result;
  }

  getPlayerSkillStates(): RuntimeSkillState[] { return this.player ? this.player.skillState.list() : []; }

  pause(): void { if (this.started) this.paused = true; }
  resume(): void { if (this.started) this.paused = false; }
  clear(): void {
    this.paused = false; this.started = false; this.enemies = []; this.spawnPoints = [];
    this.resourceNodes = []; this.chests = []; this.feedback.reset();
    this.player?.clearActiveProjectiles(); SoundManager.getInstance().stopAll();
  }

  private spawnStageWave(wave: StageWaveDefinition): EnemyMouse[] {
    const exploration: ExplorationStageConfig = {
      worldWidth: this.worldWidth, worldHeight: this.worldHeight,
      spawnGroups: wave.groups.map((group, index) => ({
        id: `wave_${wave.wave}_${index}`, enemyTemplateId: group.enemyTemplateId,
        spawnPoint: { x: 360 + (index % 3) * 540, y: 760 + Math.floor(index / 3) * 620, radius: 150 },
        initialCount: group.count, maxAlive: group.count, respawnInterval: Number.MAX_SAFE_INTEGER, active: false,
      })),
    };
    this.spawnPoints = createExploreSpawnPoints(exploration);
    this.currentStageWaveMessage = wave.message ?? null;
    return seedExploreEnemies(this.ctx, this.player, this.spawnPoints, this.worldWidth, this.worldHeight);
  }

  private advanceStageWave(): void {
    if (this.enemies.length || this.currentStageWave >= this.stageWaves.length - 1) return;
    this.currentStageWave++;
    const spawned = this.spawnStageWave(this.stageWaves[this.currentStageWave]);
    this.enemies = spawned;
    this.totalSpawned += spawned.length;
  }

  private clampPlayer(beforeMove: { x: number; y: number }): void {
    const terrainPoint = resolveExploreTerrainMove(beforeMove, this.player, this.player.radius, this.terrainObstacles);
    const p = clampWorldPoint(terrainPoint, this.worldWidth, this.worldHeight, this.player.radius);
    const safeTop = resolveBattleHudSafeTop(this.ctx.getSystemInfo());
    const minY = safeTop + 48 + 32;
    this.player.x = p.x;
    this.player.y = Math.max(minY, p.y);
  }

  private updateCamera(): void {
    this.camera = followCameraToPoint(this.camera, this.player, { targetOffsetY: EXPLORE_CONFIG.targetOffsetY, followLerp: 1 });
  }

  private applyPublishedTerrain(stageId: string): void {
    const runtime = findPublishedStageOrchestration(stageId);
    this.stageLayers = runtime?.layers ?? [];
    this.exploreHud = runtime?.layout.exploreHud;
    this.terrainObstacles = this.stageLayers
      .filter(layer => layer.enabled && layer.type === 'collision' && layer.width && layer.height)
      .map(layer => ({ id: layer.id, x: layer.x, y: layer.y, w: layer.width!, h: layer.height!, label: layer.name, kind: 'machine' as const }));
  }

  private flushCombatFeedback(): void {
    for (const event of this.player.drainCombatFeedback()) this.feedback.recordHit(event);
  }

  private collectDropCoins(): void {
    const collected = this.feedback.snapshot().collectedDrops;
    if (collected <= this.lastCollectedDrops) return;
    this.coinCollected += collected - this.lastCollectedDrops;
    this.lastCollectedDrops = collected;
  }

  private applyInteractables(): void {
    const result = updateExploreInteractions(this.player, this.resourceNodes, this.chests, this.objective);
    this.coinCollected += result.coinGain;
    if (result.resourceGain > 0) this.objective.resourcesCollected += result.resourceGain;
    updateExploreObjectiveCompletion(this.objective);
  }

  private recordKilledEnemies(): void {
    const killed = this.enemies.filter(e => e.dead).length;
    if (killed <= 0) return;
    this.objective.enemyKills += killed;
    updateExploreObjectiveCompletion(this.objective);
  }

  get aliveEnemies(): number { return this.enemies.length; }
  get activeProjectiles(): number { return this.player?.activeProjectileCount ?? 0; }
  get spawnedEnemyCount(): number { return this.totalSpawned; }
  get totalEnemies(): number { return this.objective.completed ? this.aliveEnemies : this.spawnPoints.reduce((sum, sp) => sum + sp.maxAlive, 0); }
  get currentWaveEnemyTotal(): number { return this.totalEnemies; }
  get currentBoss(): EnemyMouse | null { return null; }
  get isBossStage(): boolean { return false; }
  get waveMessage(): string | null { return this.currentStageWaveMessage; }
  get waveProgress(): string { return this.stageWaves.length ? `${this.currentStageWave + 1}/${this.stageWaves.length}` : ''; }
  get isEnded(): boolean { return false; }
  get spawnPointCount(): number { return this.spawnPoints.length; }
  get activeSpawnPoints(): number { return this.spawnPoints.filter(sp => sp.active).length; }
  get activeBackgroundThemeId(): string { return this.backgroundTheme.id; }
  get activeHeroVisualTemplateId(): string { return this.heroVisualTemplate.id; }
  get activeEnemyTemplateIds(): string[] { return [...new Set(this.spawnPoints.map(sp => sp.enemyTemplateId))]; }
  get objectiveHudText(): string { return formatExploreObjective(this.objective); }
  get isExploreObjectiveCompleted(): boolean { return this.objective.completed; }
  get enemySpawnPaused(): boolean { return getExploreEnemySpawnPauseState(this.objective).enemySpawnPaused; }
  get enemySpawnPausedByKillGoal(): boolean {
    return getExploreEnemySpawnPauseState(this.objective).enemySpawnPausedByKillGoal;
  }
  get enemySpawnPausedByCompletion(): boolean {
    return getExploreEnemySpawnPauseState(this.objective).enemySpawnPausedByCompletion;
  }
  getGuideTarget(): ExploreGuideTarget { return getExploreGuideTarget(this); }
  get nextActionText(): string { return this.getGuideTarget().label; }
  get killGoalNoticeVisible(): boolean { return this.killGoalNoticeTimer > 0; }
  get completionNoticeVisible(): boolean { return this.completionNoticeTimer > 0; }
}
