/**
 * 装备实例与背包（任务9）
 * ------------------------------------------------------------------
 * 装备配置是静态数据；玩家获得的是 EquipmentInstance（含稳定 uid）。
 */
import { EquipmentSlot } from './EquipmentConfig';

export interface EquipmentInstance {
  /** 背包内唯一 id */
  uid: string;
  /** 指向 EquipmentConfig.id */
  configId: string;
  /** 强化等级 */
  level: number;
  /** 获得时间戳（秒） */
  obtainedAt: number;
  /** 装备是否锁定 */
  locked?: boolean;
}

export interface EquipmentInventory {
  items: EquipmentInstance[];
  /** 各槽位当前穿戴的装备 uid */
  equipped: Partial<Record<EquipmentSlot, string>>;
}

export function createDefaultInventory(): EquipmentInventory {
  return { items: [], equipped: {} };
}

/** 生成装备 uid */
export function generateEquipmentUid(): string {
  return 'eq_' + Date.now().toString(36) + '_' + Math.floor(Math.random() * 1e6).toString(36);
}
