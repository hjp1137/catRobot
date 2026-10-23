/**
 * BattleManager —— 一局战斗的控制器
 * ------------------------------------------------------------------
 * 生命周期：start(stage) → 多次 update(dt)/render() → 胜负判定后
 *          调用 game.finishBattle(outcome)，结束本局。
 *
 * 状态字段：
 *  - started / ended：防止重复结算
 *  - enemies：活动敌人列表（dead 的会在 update 后过滤掉）
 *
 * 生成策略（MVP）：开局按 enemyCount 在画布随机点一次性生成。
 */
import { IContext } from '../engine/IContext';
import { GameManager } from '../core/GameManager';
import { StageConfig, StageWaveConfig } from '../data/StageConfig';
import { ENEMY_CONFIGS } from '../data/EnemyConfig';
import { PlayerMecha } from '../player/PlayerMecha';
import { EnemyMouse } from '../enemy/EnemyMouse';
import { WaveManager } from './WaveManager';
// 任务2：视觉升级，render 委托给 render 层
import { drawTrainingBackground, drawAttackRange, drawSewerBackground, drawFactoryBackground, drawBackgroundTheme } from '../render/BackgroundRenderer';
import { drawMecha } from '../render/MechaRenderer';
import { ResourceManager } from '../core/ResourceManager';
import { drawEnemy } from '../render/Chapter2EnemyRenderer';
import { drawShockwave } from '../render/BossRenderer';
import { drawToxicField, drawEruption } from '../render/Chapter2BossRenderer';
import { drawLavaRoar, drawLavaFissure, drawLavaPool } from '../render/Chapter3BossRenderer';
import { drawMeowCannonEffect, drawShieldEffect } from '../render/SkillRenderer';
import { circle, healthBar } from '../render/DrawUtils';
import type { SkillUseResult } from '../player/PlayerMecha';
import type { RuntimeSkillState } from '../player/SkillState';
import { SoundManager } from '../core/SoundManager';
import { BattleFeedback } from './BattleFeedback';
import { BATTLE_ASSETS, BATTLE_VISUAL_TUNING, getBattlePlayBounds, getEnemyVisualScale } from '../config/BattleAssets';
import { Theme } from '../render/Theme';
import { getDefaultContentRegistry } from '../content/registry/ContentRegistry';
import { createEnemyConfigFromTemplate } from '../content/adapters/EnemyTemplateAdapter';
import type { BackgroundTheme } from '../content/models/BackgroundTheme';
import type { HeroVisualTemplate } from '../content/models/HeroVisualTemplate';
import { resolveAnimatedArtKey, resolveDirectionalAnimationState } from '../animation/AnimationRuntime';
import type { ArtResourceKey } from '../assets/ArtResourceKeys';
import { StageDirector } from '../stage/StageDirector';
import { findPublishedStageOrchestration } from '../stage/StageOrchestrationRepository';
import type { StageSpawnRequest } from '../stage/StageDirectorTypes';

export class BattleManager {
  public player!: PlayerMecha;
  public enemies: EnemyMouse[] = [];
  public stage!: StageConfig;
  /** 任务4：波次管理器 */
  public waveManager!: WaveManager;
  public readonly feedback = new BattleFeedback();
  private started = false;
  private ended = false;
  /** 战斗开始时间（秒），用于星级「通关用时」判定 */
  private startTime = 0;
  private spawnedEnemies = 0;
  private battleResult: boolean | null = null;
  public activeStageId = '';
  public backgroundTheme: BackgroundTheme | undefined;
  public heroVisualTemplate: HeroVisualTemplate | undefined;
  public stageDirector: StageDirector | undefined;
  private stageRuntimeEnemySeq = 0;
  private stageRunSeq = 0;
  private stageRunId = '';
  private defeatedEnemies = 0;
  public paused = false;

  constructor(
    private ctx: IContext,
    private game: GameManager,
  ) {}

  start(stage: StageConfig): void {
    this.stage = stage;
    this.started = true;
    this.ended = false;
    this.paused = false;
    this.enemies = [];
    this.feedback.reset();
    this.startTime = this.ctx.now();
    this.spawnedEnemies = 0;
    this.battleResult = null;
    this.stageDirector = undefined;
    this.stageRuntimeEnemySeq = 0;
    this.stageRunId = `${stage.contentStageId ?? stage.id}:${Math.floor(this.ctx.now() * 1000)}:${++this.stageRunSeq}`;
    this.defeatedEnemies = 0;
    this.resolveContentBindings(stage);

    // 强力阻断旧局音频残留
    SoundManager.getInstance().stopAll();

    // 玩家从画面中下方出生；任务6：传入技能等级；任务9：传入装备/符文 battleStats
    const w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    const battleStats = this.game.battleStats;
    this.player = new PlayerMecha(this.ctx, this.game.mechaConfig, this.game.player.level, w / 2, h * 0.75,
      this.game.player.skillLevels, battleStats);
    this.startStageDirectorIfAvailable(stage);

    // 任务4：波次管理（无 waves 时自动转单波）
    this.waveManager = new WaveManager(stage);
  }

  private startStageDirectorIfAvailable(stage: StageConfig): void {
    const runtime = findPublishedStageOrchestration(stage.contentStageId);
    if (!runtime) return;
    const hero = runtime.spawnPoints.find(point => point.id === runtime.layout.heroSpawnPointId);
    if (hero) {
      this.player.x = this.mapStageX(hero.x, runtime.layout.canvasWidth);
      this.player.y = this.mapStageY(hero.y, runtime.layout.canvasHeight);
    }
    this.stageDirector = new StageDirector(runtime, { spawnEnemy: request => this.spawnStageEnemy(request) });
    this.stageDirector.start();
  }

  private resolveContentBindings(stage: StageConfig): void {
    const registry = getDefaultContentRegistry();
    this.activeStageId = stage.contentStageId ?? '';
    this.backgroundTheme = stage.backgroundThemeId ? registry.getBackground(stage.backgroundThemeId) : undefined;
    this.heroVisualTemplate = stage.heroVisualTemplateId ? registry.getHeroVisual(stage.heroVisualTemplateId) : undefined;
  }

  private createEnemyConfig(group: StageWaveConfig['enemies'][number]) {
    if (group.enemyTemplateId) {
      const template = getDefaultContentRegistry().getEnemy(group.enemyTemplateId);
      return createEnemyConfigFromTemplate(template, group.levelMultiplier ?? 1);
    }
    return ENEMY_CONFIGS[group.enemyId];
  }

  private spawnStageEnemy(request: StageSpawnRequest): string {
    const template = getDefaultContentRegistry().getEnemy(request.entry.enemyTemplateId);
    const cfg = createEnemyConfigFromTemplate(template, request.entry.levelMultiplier ?? 1);
    cfg.maxHp *= request.entry.hpMultiplier ?? 1;
    cfg.attack *= request.entry.attackMultiplier ?? 1;
    const id = `stage_enemy_${++this.stageRuntimeEnemySeq}`;
    const enemy = new EnemyMouse(this.ctx, cfg, this.mapStageX(request.spawnPoint.x, 750), this.mapStageY(request.spawnPoint.y, 1334));
    (enemy as any).stageRuntimeEnemyId = id;
    this.enemies.push(enemy);
    this.spawnedEnemies++;
    return id;
  }

  private mapStageX(x: number, canvasWidth: number): number {
    return (x / canvasWidth) * this.ctx.canvasWidth;
  }

  private mapStageY(y: number, canvasHeight: number): number {
    return (y / canvasHeight) * this.ctx.canvasHeight;
  }

  private spawnWave = (wave: StageWaveConfig): void => {
    const w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    const bounds = this.getPlayBounds();
    const top = bounds.top;
    const bottom = bounds.bottom;
    const waveTotal = wave.enemies.reduce((sum, group) => sum + group.count, 0);
    let spawnIndex = 0;
    
    let hasBoss = false;
    for (const group of wave.enemies) {
      const cfg = this.createEnemyConfig(group);
      if (cfg && (cfg.variant === 'boss' || cfg.variant === 'chapter2_boss' || cfg.variant === 'chapter3_boss')) {
        hasBoss = true;
      }
    }
    if (hasBoss) {
      SoundManager.getInstance().play('alert');
    }

    for (const group of wave.enemies) {
      const cfg = this.createEnemyConfig(group);
      if (!cfg) continue;
      for (let i = 0; i < group.count; i++) {
        const pos = this.pickSpawnPosition(spawnIndex++, waveTotal, cfg.radius, top, bottom, group.spawnGroup);
        const enemy = new EnemyMouse(this.ctx, cfg, pos.x, pos.y);
        // 任务4：boss 召唤回调；任务8：第二章 boss 召唤回调
        if (enemy.bossSkill) {
          enemy.bossSkill.onSummon = (count: number) => this.summonMice(count);
        }
        if (enemy.pollutionSkill) {
          enemy.pollutionSkill.onSummon = (count: number) => this.summonMice(count);
        }
        if (enemy.furnaceSkill) {
          enemy.furnaceSkill.onSummon = (count: number) => this.summonFireBeetles(count);
        }
        this.enemies.push(enemy);
        this.spawnedEnemies++;
      }
    }
  };

  private pickSpawnPosition(index: number, total: number, radius: number, top: number, bottom: number, group = 'default'): { x: number; y: number } {
    const w = this.ctx.canvasWidth;
    const h = this.ctx.canvasHeight;
    const playTop = top + radius;
    const playBottom = Math.max(playTop, bottom - radius);
    if (group === 'around_player' && this.player) {
      const angles = [-Math.PI * 0.9, -Math.PI * 0.65, -Math.PI * 0.35, -Math.PI * 0.1, Math.PI];
      const angle = angles[index % angles.length];
      const ring = 145 + Math.floor(index / angles.length) * 28;
      return {
        x: this.clamp(this.player.x + Math.cos(angle) * ring, radius, w - radius),
        y: this.clamp(this.player.y + Math.sin(angle) * ring, playTop, playBottom),
      };
    }
    if (group === 'left_right' && this.player) {
      const side = index % 2 === 0 ? -1 : 1;
      const lane = Math.floor(index / 2);
      return {
        x: this.clamp(this.player.x + side * (155 + lane * 24), radius, w - radius),
        y: this.clamp(this.player.y - 80 + lane * 42, playTop, playBottom),
      };
    }
    if (group === 'top') {
      const x = ((index + 1) / (total + 1)) * w;
      return { x: this.clamp(x, radius, w - radius), y: playTop + radius * 1.5 };
    }
    const anchors = [
      { x: 0.18, y: 0.22 }, { x: 0.82, y: 0.22 }, { x: 0.22, y: 0.42 },
      { x: 0.78, y: 0.42 }, { x: 0.5, y: 0.17 }, { x: 0.35, y: 0.34 },
      { x: 0.65, y: 0.34 }, { x: 0.5, y: 0.48 },
    ];
    const anchor = anchors[index % anchors.length];
    const ringOffset = Math.floor(index / anchors.length) * 18;
    const jitterX = (this.ctx.random() - 0.5) * Math.min(34, w * 0.08);
    const jitterY = (this.ctx.random() - 0.5) * Math.min(28, h * 0.04);
    const x = this.clamp(anchor.x * w + jitterX + ringOffset, radius, w - radius);
    const y = this.clamp(anchor.y * h + jitterY + ringOffset, top + radius, bottom - radius);
    if (total <= 1) {
      return {
        x: this.clamp(radius + this.ctx.random() * (w - radius * 2), radius, w - radius),
        y: this.clamp(top + this.ctx.random() * (bottom - top), playTop, playBottom),
      };
    }
    return { x, y };
  }

  private clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  private getPlayBounds(): { top: number; bottom: number } {
    return getBattlePlayBounds(this.ctx.canvasWidth, this.ctx.canvasHeight, this.ctx.getSystemInfo());
  }

  private separateEnemies(): void {
    const bounds = this.getPlayBounds();
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i];
      if (a.dead) continue;
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j];
        if (b.dead) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const min = Math.max((a.radius + b.radius) * 1.12, BATTLE_VISUAL_TUNING.enemySeparationRadius);
        if (dist >= min) continue;
        const push = (min - dist) * 0.5;
        const ux = dx / dist;
        const uy = dy / dist;
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
      }
      a.x = this.clamp(a.x, a.radius, this.ctx.canvasWidth - a.radius);
      a.y = this.clamp(a.y, bounds.top + a.radius, bounds.bottom - a.radius);
    }
  }

  /** 任务4：boss 召唤小鼠（boss 血量低时触发） */
  private summonMice(count: number): void {
    const w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    const cfg = ENEMY_CONFIGS['mouse'];
    for (let i = 0; i < count; i++) {
      const x = cfg.radius + this.ctx.random() * (w - cfg.radius * 2);
      const y = this.stage.spawnMargin + this.ctx.random() * (h * 0.5 - this.stage.spawnMargin);
      this.enemies.push(new EnemyMouse(this.ctx, cfg, x, y));
    }
  }

  /** 任务14：第三章 boss 召唤熔岩甲虫 */
  private summonFireBeetles(count: number): void {
    const w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    const cfg = ENEMY_CONFIGS['fire_beetle'];
    for (let i = 0; i < count; i++) {
      const x = cfg.radius + this.ctx.random() * (w - cfg.radius * 2);
      const y = this.stage.spawnMargin + this.ctx.random() * (h * 0.5 - this.stage.spawnMargin);
      this.enemies.push(new EnemyMouse(this.ctx, cfg, x, y));
    }
  }

  update(dt: number): void {
    if (!this.started || this.ended || this.paused) return;

    if (Math.abs(this.ctx.input.moveX) + Math.abs(this.ctx.input.moveY) > 0.05) {
      this.game.events.emit('battle.player-moved', { x: this.ctx.input.moveX, y: this.ctx.input.moveY });
      this.game.events.emit('player-moved', { x: this.ctx.input.moveX, y: this.ctx.input.moveY });
    }
    const enemyCountBeforeCleanup = this.enemies.length;
    if (this.player) this.feedback.update(dt, this.player.x, this.player.y);
    this.player.update(dt, this.enemies);
    this.flushCombatFeedback();
    for (const e of this.enemies) e.update(dt, this.player);
    this.separateEnemies();

    // 清理死亡敌人
    const defeatedThisFrame = this.enemies.filter(e => e.dead).length;
    this.defeatedEnemies += defeatedThisFrame;
    this.enemies = this.enemies.filter(e => !e.dead);
    if (defeatedThisFrame) {
      this.game.events.emit('battle.enemy-defeated', { count: defeatedThisFrame });
      this.game.events.emit('enemy-defeated', { count: defeatedThisFrame });
    }
    if (enemyCountBeforeCleanup > 0 && this.enemies.length === 0) {
      this.game.events.emit('battle.wave-cleared'); this.game.events.emit('wave-cleared');
    }

    if (this.stageDirector) {
      this.stageDirector.setAliveEnemyIds(this.enemies.map(e => (e as any).stageRuntimeEnemyId).filter(Boolean));
      this.stageDirector.update(dt);
    } else {
      // 任务4/13：波次推进（按清理后的真实存活数生成/切换）
      this.waveManager.update(dt, this.enemies.length, this.spawnWave);
    }

    // 胜负判定
    if (this.player.dead) {
      this.stageDirector?.markHeroDead();
      this.endBattle(false);
    } else if (this.stageDirector?.state === 'STAGE_CLEAR') {
      this.endBattle(true);
    } else if (!this.stageDirector && this.waveManager.isLastWaveCleared && this.enemies.length === 0) {
      // 任务4：最后一波清空才胜利
      this.endBattle(true);
    }
  }

  /** 战斗用时（秒） */
  get elapsedSec(): number {
    if (this.startTime === undefined || this.startTime === null) return 0;
    return Math.max(0, this.ctx.now() - this.startTime);
  }

  /**
   * 任务5：玩家释放主动技能。
   * 战斗结束（胜负判定后）拒绝触发。
   */
  usePlayerSkill(skillId: string): SkillUseResult {
    if (this.ended || !this.started || this.paused) {
      return { ok: false, reason: 'cooldown' };
    }
    if (!this.player || this.player.dead) {
      return { ok: false, reason: 'cooldown' };
    }
    const result = this.player.useSkill(skillId, this.enemies);
    this.flushCombatFeedback();
    return result;
  }

  /** 任务5：获取技能状态列表（供 BattleUI 画按钮） */
  getPlayerSkillStates(): RuntimeSkillState[] {
    return this.player ? this.player.skillState.list() : [];
  }

  /** 任务5：战斗是否已结束（供外部拒绝技能） */
  get isEnded(): boolean { return this.ended; }

  pause(): void { if (this.started && !this.ended) { this.paused = true; this.stageDirector?.pause(); } }
  resume(): void { if (this.paused && !this.ended) { this.paused = false; this.stageDirector?.resume(); } }
  abort(): void {
    if (!this.started || this.ended) return;
    this.paused = false; this.started = false; this.ended = true;
    this.player?.clearActiveProjectiles(); this.enemies = [];
    this.stageDirector?.dispose(); SoundManager.getInstance().stopAll();
  }

  private flushCombatFeedback(): void {
    if (!this.player) return;
    for (const event of this.player.drainCombatFeedback()) {
      this.feedback.recordHit(event);
      this.game.events.emit('battle.attack-used', { kind: event.kind });
      this.game.events.emit('player-attacked', { kind: event.kind });
    }
  }

  private endBattle(win: boolean): void {
    this.ended = true;
    this.started = false;
    this.battleResult = win;
    if (this.player) this.player.clearActiveProjectiles();
    for (const e of this.enemies) {
      if (e.furnaceSkill) {
        e.furnaceSkill.stop();
      }
      if (e.pollutionSkill) {
        e.pollutionSkill.stop();
      }
    }

    SoundManager.getInstance().stopAll();
    if (win) {
      SoundManager.getInstance().play('victory');
    } else {
      SoundManager.getInstance().play('defeat');
    }

    const directorStats = this.stageDirector?.getRunStats();
    const endedAt = this.ctx.now();
    const run = {
      stageRunId: this.stageRunId,
      stageId: this.stage.id,
      contentStageId: this.stage.contentStageId ?? this.stage.id,
      victory: win,
      startedAt: this.startTime,
      endedAt,
      elapsedSec: Math.max(0, endedAt - this.startTime),
      clearedWaves: directorStats?.clearedWaves ?? (win ? this.waveManager.totalWaves : Math.max(0, this.waveManager.currentWaveIndex)),
      totalWaves: directorStats?.totalWaves ?? this.waveManager.totalWaves,
      defeatedEnemies: Math.max(this.defeatedEnemies, directorStats?.defeatedEnemies ?? 0),
      heroRemainingHp: this.player?.hp ?? 0,
      heroMaxHp: this.player?.maxHp ?? 0,
      failureReason: win ? undefined : 'hero-dead',
    };
    this.stageDirector?.dispose();
    this.game.finishBattle({
      win,
      stageId: this.stage.id,
      contentStageId: run.contentStageId,
      run,
      elapsedSec: run.elapsedSec,
      hpRatio: this.player ? this.player.hpRatio : 0,
      // clearResult 由 GameManager.finishBattle 委托 ProgressManager 填充
      clearResult: null,
      loot: null,
    });
  }

  get currentStageRunId(): string { return this.stageRunId; }

  render(): void {
    const c = this.ctx.canvas;
    const w = this.ctx.canvasWidth, h = this.ctx.canvasHeight;
    const time = this.ctx.now();

    // 任务21：优先使用 StageDefinition 绑定的背景主题；旧章节分支仅作兼容。
    if (this.backgroundTheme) {
      drawBackgroundTheme(c, w, h, time, this.backgroundTheme);
    } else if (this.stage.chapterId === 'chapter2') {
      drawSewerBackground(c, w, h, time);
    } else if (this.stage.chapterId === 'chapter3') {
      const res = ResourceManager.getInstance();
      if (res.isLoaded('factory_bg')) {
        const img = res.getImage('factory_bg');
        if (img) {
          c.drawImage(img, 0, 0, w, h);
        } else {
          drawFactoryBackground(c, w, h, time);
        }
      } else {
        drawFactoryBackground(c, w, h, time);
      }
    } else {
      drawTrainingBackground(c, w, h, time);
    }

    // 攻击范围（淡橙色提示 + 呼吸能量环）
    if (this.player) {
      drawAttackRange(c, this.player.x, this.player.y, this.game.mechaConfig.attackRange, time);
    }

    // 敌人（机械鼠）
    for (const e of this.enemies) {
      // 朝向玩家方向（鼻子朝向）
      let dirX = 1, dirY = 0;
      if (this.player) {
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        const d = Math.hypot(dx, dy);
        if (d > 0) { dirX = dx / d; dirY = dy / d; }
      }
      const visualRadius = e.radius * (e.visual?.displayScale ?? getEnemyVisualScale(e.isBoss, e.variant === 'elite' || e.variant === 'elite_toxic' || e.variant === 'fire_elite'));
      const directionalState = resolveDirectionalAnimationState(
        e.animationState, dirX, dirY, e.visual?.animationClipKeys,
      );
      const enemyArtKey = resolveAnimatedArtKey({
        player: e.animationPlayer,
        targetType: 'enemy',
        state: directionalState,
        bindings: e.visual?.animationClipKeys,
        fallbackArtKey: artKeyForState(e.visual, e.animationState),
      });
      drawEnemy(c, {
        cx: e.x, cy: e.y, radius: visualRadius,
        hpRatio: e.hpRatio, hitFlash: e.hitFlash, dirX, dirY, showBar: false,
        variant: e.variant, artKey: enemyArtKey, shadowScale: e.visual?.shadowScale,
      });
      // 任务4：boss 震荡冲击效果
      if (e.bossSkill) {
        const sw = e.bossSkill.getRenderState();
        if (sw) drawShockwave(c, sw);
      }
      // 任务8：第二章 boss 毒液领域 + 污染喷发
      if (e.pollutionSkill) {
        const field = e.pollutionSkill.getFieldRenderState();
        if (field) drawToxicField(c, field);
        const eruption = e.pollutionSkill.getEruptionRenderState();
        if (eruption) drawEruption(c, eruption);
      }
      // 任务14：第三章 boss 熔岩咆哮 + 熔岩裂隙 + 环境熔岩地面
      if (e.furnaceSkill) {
        const roar = e.furnaceSkill.getRoarRenderState();
        if (roar) drawLavaRoar(c, roar);
        const fissure = e.furnaceSkill.getFissureRenderState();
        if (fissure) drawLavaFissure(c, fissure);
        for (const pool of e.furnaceSkill.getLavaPools()) {
          drawLavaPool(c, pool);
        }
      }
    }

    this.renderActiveProjectiles(c);
    this.feedback.render(c);

    // 玩家（橘猫重甲）
    if (this.player) {
      const playerVisualRadius = this.player.radius * BATTLE_ASSETS.player.idle.scale * (this.heroVisualTemplate?.visual.displayScale ?? 1);
      const directionalState = resolveDirectionalAnimationState(
        this.player.animationState, this.player.moveDirectionX, this.player.moveDirectionY,
        this.heroVisualTemplate?.visual.animationClipKeys,
      );
      const playerArtKey = resolveAnimatedArtKey({
        player: this.player.animationPlayer,
        targetType: 'hero',
        state: directionalState,
        bindings: this.heroVisualTemplate?.visual.animationClipKeys,
        fallbackArtKey: artKeyForState(this.heroVisualTemplate?.visual, this.player.animationState),
      });
      drawMecha(c, {
        cx: this.player.x, cy: this.player.y, radius: playerVisualRadius,
        hitFlash: this.player.hitFlash,
        attackFlash: this.player.attackFlash,
        facing: this.player.facing,
        battleFocus: true,
        time,
        artKey: playerArtKey,
        shadowScale: this.heroVisualTemplate?.visual.shadowScale,
      });
      // 玩家头顶血条（绿色，带数字）
      const bw = 60;
      healthBar(c, this.player.x - bw / 2, this.player.y - playerVisualRadius - BATTLE_VISUAL_TUNING.playerHpBarOffset, bw, 6,
        this.player.hpRatio, { showText: `${Math.ceil(this.player.hp)}` });
      // 任务5：重甲护盾特效（画在玩家外层）
      const shieldState = this.player.skillState.get('heavy_shield');
      if (shieldState?.isActive) {
        drawShieldEffect(c, this.player.x, this.player.y, playerVisualRadius,
          true, shieldState.activeRemaining, this.player.shieldHitFlash, time);
      }
      // 任务5/6：喵能炮释放特效（按玩家技能等级 range/halfAngle）
      if (this.player.meowCannonFlash > 0) {
        const lvl = this.player.skillState.getLevel('meow_cannon');
        drawMeowCannonEffect(c, this.player.x, this.player.y, this.player.facingAngle, this.player.meowCannonFlash, lvl);
      }
    }
  }

  private renderActiveProjectiles(c: IContext['canvas']): void {
    if (!this.player) return;
    c.save();
    for (const p of this.player.getActiveProjectiles()) {
      const dx = p.x - p.fromX;
      const dy = p.y - p.fromY;
      const len = Math.hypot(dx, dy) || 1;
      const tail = Math.min(22, len);
      const tx = p.x - dx / len * tail;
      const ty = p.y - dy / len * tail;
      c.strokeStyle = Theme.color.cyan;
      c.lineWidth = BATTLE_VISUAL_TUNING.projectileVisualWidth;
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(p.x, p.y); c.stroke();
      circle(c, p.x, p.y, BATTLE_VISUAL_TUNING.projectileCoreRadius, Theme.color.white);
    }
    c.restore();
  }

  /** UI 顶栏读取：剩余敌人数量 */
  get aliveEnemies(): number { return this.enemies.length; }
  get activeProjectiles(): number { return this.player?.activeProjectileCount ?? 0; }
  get spawnedEnemyCount(): number { return this.spawnedEnemies; }
  get resultState(): boolean | null { return this.battleResult; }
  get activeBackgroundThemeId(): string { return this.backgroundTheme?.id ?? ''; }
  get activeHeroVisualTemplateId(): string { return this.heroVisualTemplate?.id ?? ''; }
  get currentWaveEnemyTotal(): number {
    return this.waveManager?.currentWaveTotal ?? this.totalEnemies;
  }
  /** 任务4：总敌人数 = 所有波次敌人之和（兼容单波/多波） */
  get totalEnemies(): number {
    if (!this.stage) return 0;
    const waves = this.stage.waves && this.stage.waves.length > 0
      ? this.stage.waves
      : [{ enemies: this.stage.enemies } as StageWaveConfig];
    return waves.reduce((sum, w) => sum + w.enemies.reduce((s, e) => s + e.count, 0), 0);
  }

  /** 任务4：当前存活 Boss（供 BattleUI 画 Boss 血条） */
  get currentBoss(): EnemyMouse | null {
    return this.enemies.find(e => e.isBoss && !e.dead) ?? null;
  }
  /** 任务4：是否 Boss 关 */
  get isBossStage(): boolean { return !!this.stage?.isBossStage; }
  /** 任务4：波次切换提示文字 */
  get waveMessage(): string | null { return this.waveManager?.currentMessage ?? null; }
  /** 任务4：当前波/总波（如 "2/3"） */
  get waveProgress(): string {
    if (!this.waveManager) return '';
    if (!this.waveManager.isMultiWave) return '';
    return `${this.waveManager.currentWaveIndex + 1}/${this.waveManager.totalWaves}`;
  }
}

function artKeyForState(visual: any, state: string): ArtResourceKey | undefined {
  const map: Record<string, string> = {
    idle: 'idleArtKey',
    move: 'moveArtKey',
    attack: 'attackArtKey',
    hit: 'hitArtKey',
    death: 'deathArtKey',
  };
  return (visual?.[map[state] ?? 'idleArtKey'] ?? visual?.idleArtKey) as ArtResourceKey | undefined;
}
