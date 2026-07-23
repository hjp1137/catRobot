/**
 * WaveManager —— 波次推进（任务4）
 * ------------------------------------------------------------------
 * 把 stage.waves（或无 waves 时把 enemies[] 转单波）作为队列管理。
 * 当前波敌人全部死亡后，等待 spawnDelay 再生成下一波。
 * 最后一波清空 → isLastWaveCleared=true（由 BattleManager 判胜利）。
 *
 * 不直接生成敌人，而是通过 spawnCallback 把 StageEnemyConfig[] 交给
 * BattleManager 实例化（保持 EnemyMouse 创建逻辑在 BattleManager 集中）。
 */
import { StageConfig, StageWaveConfig } from '../data/StageConfig';
import { BATTLE_VISUAL_TUNING } from '../config/BattleAssets';

/** 生成一波敌人的回调：BattleManager 实现 */
export type SpawnWaveCallback = (wave: StageWaveConfig) => void;

export class WaveManager {
  private waves: StageWaveConfig[];
  private currentIndex = 0;
  /** 下一波生成前的剩余延迟（秒）；<=0 表示可生成 */
  private nextSpawnDelay = 0;
  /** 是否已生成当前波 */
  private currentSpawned = false;
  /** 当前波是否已清空（由 BattleManager 每帧告知存活数） */
  private currentCleared = false;
  private finished = false;

  /** 当前波次切换提示（显示一段时间） */
  private activeMessage: string | null = null;
  private messageTimer = 0;

  constructor(stage: StageConfig) {
    this.waves = this.normalizeWaves(stage);
  }

  /** 无 waves → 把 enemies[] 转为单波；有 waves → 直接用 */
  private normalizeWaves(stage: StageConfig): StageWaveConfig[] {
    if (stage.waves && stage.waves.length > 0) return stage.waves;
    return [{
      id: stage.id + '-single',
      name: undefined,
      enemies: stage.enemies,
      spawnDelay: 0,
      message: undefined,
    }];
  }

  /**
   * 每帧推进。
   * @param aliveCount 当前波存活敌人数（BattleManager 传入）
   * @param spawnCallback 生成某波敌人
   */
  update(dt: number, aliveCount: number, spawnCallback: SpawnWaveCallback): void {
    if (this.finished) return;

    // 消息计时
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.activeMessage = null;
    }

    // 生成当前波
    if (!this.currentSpawned) {
      if (this.nextSpawnDelay > 0) {
        this.nextSpawnDelay -= dt;
        if (this.nextSpawnDelay > 0) return;
      }
      // 生成
      const wave = this.waves[this.currentIndex];
      spawnCallback(wave);
      this.currentSpawned = true;
      this.currentCleared = false;
      if (wave.message) {
        this.activeMessage = wave.message;
        this.messageTimer = BATTLE_VISUAL_TUNING.waveNoticeDurationMs / 1000;
      }
      return;
    }

    // 判定当前波是否清空
    if (!this.currentCleared && aliveCount === 0) {
      this.currentCleared = true;
      // 还有下一波？
      if (this.currentIndex < this.waves.length - 1) {
        this.currentIndex++;
        this.currentSpawned = false;
        this.nextSpawnDelay = this.waves[this.currentIndex].spawnDelay ?? 0;
      } else {
        // 最后一波清空
        this.finished = true;
      }
    }
  }

  /** 当前波序号（0-based） */
  get currentWaveIndex(): number { return this.currentIndex; }
  get totalWaves(): number { return this.waves.length; }
  get isLastWaveCleared(): boolean { return this.finished; }
  get currentMessage(): string | null { return this.activeMessage; }
  /** 是否多波关卡 */
  get isMultiWave(): boolean { return this.waves.length > 1; }
  /** 当前波配置 */
  get currentWave(): StageWaveConfig { return this.waves[this.currentIndex]; }
  /** 当前波配置总敌人数 */
  get currentWaveTotal(): number {
    return this.currentWave.enemies.reduce((sum, enemy) => sum + enemy.count, 0);
  }
}
