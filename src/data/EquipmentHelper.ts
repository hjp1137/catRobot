/** 任务9：装备实例生成辅助 */
import { EquipmentInstance, generateEquipmentUid } from './EquipmentData';
import { getEquipmentConfig } from './EquipmentConfig';

export function generateEquipmentInstance(configId: string, obtainedAt: number): EquipmentInstance {
  const cfg = getEquipmentConfig(configId);
  const locked = cfg ? cfg.rarity === 'epic' : false;
  return { uid: generateEquipmentUid(), configId, level: 0, obtainedAt, locked };
}

export { generateEquipmentUid };
