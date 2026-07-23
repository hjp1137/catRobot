/**
 * 存档管理
 * ------------------------------------------------------------------
 * - load：读不上则返回默认存档；解析失败也回退默认（避免脏存档崩溃）
 * - save：JSON 序列化写入；失败仅打日志不抛
 * - reset：清档（调试用）
 *
 * 数据契约见 data/PlayerData.ts。所有 schema 升级走 migrateFrom（占位）。
 */
import { IStorage } from '../engine/IContext';
import {
  PlayerData, SAVE_KEY, SAVE_VERSION, createDefaultPlayerData,
  createDefaultTutorialProgress,
} from '../data/PlayerData';
import { SKILL_CONFIGS } from '../data/SkillConfig';
import { getEquipmentConfig as getEquipmentConfigPub } from '../data/EquipmentConfig';
import { getRuneConfig } from '../data/RuneConfig';
import type { PlayerProgressRepository } from '../progression/PlayerProgressRepository';

export const SAVE_TMP_KEY = `${SAVE_KEY}.tmp`;
export const SAVE_BACKUP_KEY = `${SAVE_KEY}.backup`;
export const SAVE_CORRUPT_KEY = `${SAVE_KEY}.corrupt`;

export class SaveManager implements PlayerProgressRepository {
  constructor(private storage: IStorage) {}

  /** 读取存档；不存在或损坏时返回默认存档（不抛错） */
  load(): PlayerData {
    let raw = this.storage.get(SAVE_KEY);
    const pending = this.storage.get(SAVE_TMP_KEY);
    if (pending) {
      if (isValidJson(pending)) {
        if (raw && !isValidJson(raw)) this.storage.set(SAVE_CORRUPT_KEY, raw);
        else if (raw) this.storage.set(SAVE_BACKUP_KEY, raw);
        this.storage.set(SAVE_KEY, pending); raw = pending;
      } else if (!isValidJson(pending)) this.storage.set(SAVE_CORRUPT_KEY, pending);
      this.storage.remove(SAVE_TMP_KEY);
    }
    if (!raw) return createDefaultPlayerData();
    try {
      const obj = JSON.parse(raw) as Partial<PlayerData>;
      return this.migrate(obj);
    } catch {
      this.storage.set(SAVE_CORRUPT_KEY, raw);
      const backup = this.storage.get(SAVE_BACKUP_KEY);
      if (backup && isValidJson(backup)) {
        this.storage.set(SAVE_KEY, backup);
        return this.migrate(JSON.parse(backup));
      }
      console.warn('[SaveManager] 存档损坏，已保留原文并回退安全默认进度');
      return createDefaultPlayerData();
    }
  }

  save(data: PlayerData): boolean {
    try {
      const current = this.storage.get(SAVE_KEY);
      if (current) { try { JSON.parse(current); this.storage.set(SAVE_BACKUP_KEY, current); } catch { this.storage.set(SAVE_CORRUPT_KEY, current); } }
      const serialized = JSON.stringify({ ...data, version: SAVE_VERSION });
      this.storage.set(SAVE_TMP_KEY, serialized);
      JSON.parse(this.storage.get(SAVE_TMP_KEY) ?? '');
      this.storage.set(SAVE_KEY, serialized);
      if (this.storage.get(SAVE_KEY) !== serialized) throw new Error('SAVE_VERIFY_FAILED');
      this.storage.remove(SAVE_TMP_KEY);
      return true;
    } catch (e) {
      console.warn('[SaveManager] save failed', e);
      return false;
    }
  }

  reset(): PlayerData {
    const fresh = createDefaultPlayerData();
    this.storage.remove(SAVE_KEY);
    this.storage.remove(SAVE_TMP_KEY);
    this.storage.remove(SAVE_BACKUP_KEY);
    this.storage.remove(SAVE_CORRUPT_KEY);
    return fresh;
  }

  /** 版本迁移：未来字段重命名/新增时在此分支处理 */
  private migrate(obj: Partial<PlayerData>): PlayerData {
    // v1：当前只有一版。任务3 新增进度字段，旧存档需补默认值。
    const fallback = createDefaultPlayerData();
    const equipmentInventory = this.migrateEquipmentInventory(obj.equipmentInventory);
    const runeInventory = this.migrateRuneInventory(obj.runeInventory);
    const equippedRunes = this.migrateEquippedRunes(obj.equippedRunes, runeInventory);

    let tutorialFinished = obj.tutorialFinished;
    if (typeof tutorialFinished !== 'boolean') {
      let hasClearedAny = false;
      if (obj.stageProgress && typeof obj.stageProgress === 'object') {
        for (const val of Object.values(obj.stageProgress)) {
          if (val && (val as any).cleared) {
            hasClearedAny = true;
            break;
          }
        }
      }
      const hasGrowth = (typeof obj.level === 'number' && obj.level > 1) ||
        (typeof obj.gold === 'number' && obj.gold > 0) ||
        (typeof obj.parts === 'number' && obj.parts > 0) ||
        (equipmentInventory.items.length > 0) ||
        (runeInventory.length > 0) ||
        !!(obj.materials && typeof obj.materials === 'object' && (obj.materials as any).enhanceStone > 0);

      tutorialFinished = hasClearedAny || hasGrowth;
    }

    const out: PlayerData = {
      version: SAVE_VERSION,
      mechaId: obj.mechaId ?? fallback.mechaId,
      level: typeof obj.level === 'number' && obj.level > 0 ? obj.level : fallback.level,
      gold: typeof obj.gold === 'number' && obj.gold >= 0 ? obj.gold : fallback.gold,
      parts: typeof obj.parts === 'number' && obj.parts >= 0 ? obj.parts : fallback.parts,
      stageProgress: this.migrateStageProgress(obj.stageProgress),
      unlockedStageIds: (Array.isArray(obj.unlockedStageIds) && obj.unlockedStageIds.length > 0)
        ? obj.unlockedStageIds : ['1-1'],
      selectedStageId: obj.selectedStageId,
      unlockedSkillIds: (Array.isArray(obj.unlockedSkillIds) && obj.unlockedSkillIds.length > 0)
        ? obj.unlockedSkillIds : ['meow_cannon', 'heavy_shield'],
      skillLevels: this.migrateSkillLevels(obj.skillLevels),
      equipmentInventory,
      runeInventory,
      equippedRunes,
      materials: this.migrateMaterials(obj.materials),
      tutorialFinished,
      tutorial: this.migrateTutorialProgress(obj.tutorial),
      settledStageRunIds: Array.isArray(obj.settledStageRunIds)
        ? obj.settledStageRunIds.filter((id): id is string => typeof id === 'string') : [],
      campaignProgress: this.migrateCampaignProgress(obj.campaignProgress),
    };
    return out;
  }

  private migrateTutorialProgress(raw: unknown): PlayerData['tutorial'] {
    const fallback = createDefaultTutorialProgress();
    if (!raw || typeof raw !== 'object') return fallback;
    const value = raw as Record<string, unknown>;
    const strings = (key: string) => Array.isArray(value[key])
      ? [...new Set((value[key] as unknown[]).filter((id): id is string => typeof id === 'string' && id.length > 0))]
      : [];
    return {
      schemaVersion: 1,
      startedFlowIds: strings('startedFlowIds'),
      currentFlowId: typeof value.currentFlowId === 'string' && value.currentFlowId ? value.currentFlowId : undefined,
      currentStepId: typeof value.currentStepId === 'string' && value.currentStepId ? value.currentStepId : undefined,
      completedStepIds: strings('completedStepIds'), completedFlowIds: strings('completedFlowIds'),
      skippedFlowIds: strings('skippedFlowIds'), unlockedFeatureIds: strings('unlockedFeatureIds'),
      pendingUnlockNoticeIds: strings('pendingUnlockNoticeIds'),
      updatedAt: typeof value.updatedAt === 'number' && value.updatedAt >= 0 ? value.updatedAt : 0,
      recoveryCount: typeof value.recoveryCount === 'number' && Number.isInteger(value.recoveryCount) && value.recoveryCount >= 0
        ? value.recoveryCount : 0,
    };
  }

  private migrateCampaignProgress(raw: unknown): PlayerData['campaignProgress'] {
    const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const strings = (key: string) => Array.isArray(value[key])
      ? [...new Set((value[key] as unknown[]).filter((id): id is string => typeof id === 'string' && id.length > 0))]
      : [];
    const chapterStars: Record<string, number> = {};
    if (value.chapterStars && typeof value.chapterStars === 'object') {
      for (const [id, stars] of Object.entries(value.chapterStars)) {
        if (typeof stars === 'number' && Number.isFinite(stars) && stars >= 0) chapterStars[id] = Math.floor(stars);
      }
    }
    return {
      currentCampaignId: typeof value.currentCampaignId === 'string' ? value.currentCampaignId : undefined,
      currentChapterId: typeof value.currentChapterId === 'string' ? value.currentChapterId : undefined,
      recentStageId: typeof value.recentStageId === 'string' ? value.recentStageId : undefined,
      newlyUnlockedNodeIds: strings('newlyUnlockedNodeIds'),
      playedUnlockNodeIds: strings('playedUnlockNodeIds'),
      completedChapterIds: strings('completedChapterIds'),
      chapterStars,
      claimedChapterRewardIds: strings('claimedChapterRewardIds'),
    };
  }

  private migrateStageProgress(raw: unknown): PlayerData['stageProgress'] {
    if (!raw || typeof raw !== 'object') return {};
    const output: PlayerData['stageProgress'] = {};
    for (const [stageId, value] of Object.entries(raw)) {
      if (!value || typeof value !== 'object') continue;
      const item = value as any;
      output[stageId] = {
        cleared: item.cleared === true,
        bestStars: Math.max(0, Math.min(3, Number(item.bestStars) || 0)),
        clearCount: Math.max(0, Math.floor(Number(item.clearCount) || 0)),
        firstClearedAt: validNumber(item.firstClearedAt), lastClearedAt: validNumber(item.lastClearedAt),
        bestClearTimeSec: validNumber(item.bestClearTimeSec), bestHealthRatio: validNumber(item.bestHealthRatio),
        firstClearRewardClaimed: item.firstClearRewardClaimed === true,
        firstThreeStarRewardClaimed: item.firstThreeStarRewardClaimed === true,
        claimedObjectiveRewardIds: Array.isArray(item.claimedObjectiveRewardIds) ? item.claimedObjectiveRewardIds.filter((id: any) => typeof id === 'string') : [],
        lastAttemptAt: validNumber(item.lastAttemptAt), lastResult: item.lastResult === 'victory' || item.lastResult === 'failure' ? item.lastResult : undefined,
        lastFailureReason: typeof item.lastFailureReason === 'string' ? item.lastFailureReason : undefined,
      };
    }
    return output;
  }

  private migrateMaterials(raw: unknown): { enhanceStone: number } {
    const fallback = { enhanceStone: 0 };
    if (!raw || typeof raw !== 'object') return fallback;
    const m = raw as Record<string, unknown>;
    const enhanceStone = typeof m.enhanceStone === 'number' && m.enhanceStone >= 0
      ? Math.floor(m.enhanceStone)
      : 0;
    return { enhanceStone };
  }

  /** 任务9：装备背包迁移 —— 补默认；清理指向不存在 uid 的穿戴 */
  private migrateEquipmentInventory(raw: unknown): import('../data/EquipmentData').EquipmentInventory {
    if (!raw || typeof raw !== 'object') return { items: [], equipped: {} };
    const inv = raw as Partial<import('../data/EquipmentData').EquipmentInventory>;
    const rawItems = Array.isArray(inv.items) ? inv.items.filter(i => i && i.uid && i.configId) : [];
    
    // 任务10：过滤无效 configId 并补齐/钳制 level
    const items: import('../data/EquipmentData').EquipmentInstance[] = [];
    for (const i of rawItems) {
      const cfg = getEquipmentConfigPub(i.configId);
      if (!cfg) continue;
      let level = typeof i.level === 'number' ? Math.floor(i.level) : 0;
      if (level < 0) level = 0;
      if (level > 10) level = 10;
      let locked = typeof (i as any).locked === 'boolean' ? (i as any).locked : false;
      items.push({
        uid: i.uid,
        configId: i.configId,
        level,
        obtainedAt: typeof i.obtainedAt === 'number' ? i.obtainedAt : 0,
        locked,
      });
    }

    const equipped = (inv.equipped && typeof inv.equipped === 'object') ? { ...inv.equipped } : {};
    const validUids = new Set(items.map(i => i.uid));
    // 清理无效穿戴
    for (const k of Object.keys(equipped)) {
      const uid = equipped[k as keyof typeof equipped];
      if (typeof uid === 'string' && !validUids.has(uid)) delete equipped[k as keyof typeof equipped];
    }
    return { items, equipped };
  }

  /** 任务9：符文背包迁移 */
  private migrateRuneInventory(raw: unknown): import('../data/RuneConfig').RuneInstance[] {
    if (!Array.isArray(raw)) return [];
    const items: import('../data/RuneConfig').RuneInstance[] = [];
    for (const r of raw) {
      if (r && typeof r === 'object' && typeof r.uid === 'string' && typeof r.configId === 'string') {
        const cfg = getRuneConfig(r.configId);
        if (!cfg) continue;
        items.push({
          uid: r.uid,
          configId: r.configId,
          obtainedAt: typeof r.obtainedAt === 'number' ? r.obtainedAt : 0,
        });
      }
    }
    return items;
  }

  /** 任务9：已装备符文迁移 —— 最多 2，且 uid 需在背包中存在 */
  private migrateEquippedRunes(raw: unknown, runeInv: import('../data/RuneConfig').RuneInstance[]): string[] {
    if (!Array.isArray(raw)) return [];
    const validUids = new Set(runeInv.map((r) => r.uid));
    return raw.filter((u: any) => typeof u === 'string' && validUids.has(u)).slice(0, 2);
  }

  /** 任务6：技能等级迁移 —— 补默认技能为 1，钳制 1..maxLevel */
  private migrateSkillLevels(raw: unknown): Record<string, number> {
    const out: Record<string, number> = { meow_cannon: 1, heavy_shield: 1 };
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      for (const id of Object.keys(out)) {
        const v = obj[id];
        if (typeof v === 'number' && v >= 1) {
          out[id] = Math.floor(v);
        }
      }
    }
    // 钳制到 maxLevel（防御脏存档）
    for (const id of Object.keys(out)) {
      const cfg = SKILL_CONFIGS[id];
      if (cfg) out[id] = Math.max(1, Math.min(cfg.maxLevel, out[id]));
    }
    return out;
  }
}

export class WxStoragePlayerProgressRepository extends SaveManager {}

function validNumber(value: unknown): number | undefined { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined; }
function isValidJson(value: string): boolean { try { JSON.parse(value); return true; } catch { return false; } }
