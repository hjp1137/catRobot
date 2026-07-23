import type { PlayerData, StageProgress } from '../data/PlayerData';
import type { StageRewardPool } from '../content/models/StageProgression';
import { generateEquipmentInstance } from '../data/EquipmentHelper';
import { generateRuneInstance } from '../data/RuneHelper';
import { getEquipmentConfig } from '../data/EquipmentConfig';
import type { GrantedStageReward, StageObjectiveResult, StageSettlementOptions } from './StageSettlementModels';

export interface RewardGrantContext {
  firstClear: boolean;
  firstThreeStar: boolean;
  objectives: StageObjectiveResult[];
  previous: StageProgress;
}

export function grantStageRewards(
  player: PlayerData,
  pools: StageRewardPool[],
  context: RewardGrantContext,
  options: StageSettlementOptions,
): GrantedStageReward[] {
  const granted: GrantedStageReward[] = [];
  for (const pool of pools) {
    if (!eligible(pool, context)) continue;
    for (const entry of pool.entries.filter(x => x.enabled)) {
      const selected = pool.selectionMode === 'all' || entry.guaranteed || options.random() < entry.probability;
      if (!selected) continue;
      const quantity = entry.minQuantity + Math.floor(options.random() * (entry.maxQuantity - entry.minQuantity + 1));
      const result: GrantedStageReward = { poolId: pool.id, entryId: entry.id, rewardType: entry.rewardType, rewardRefId: entry.rewardRefId, quantity };
      apply(player, result, options.now());
      granted.push(result);
    }
    if (pool.group === 'objective-bonus' && pool.objectiveId) {
      context.previous.claimedObjectiveRewardIds = [...new Set([...(context.previous.claimedObjectiveRewardIds ?? []), pool.objectiveId])];
    }
  }
  return granted;
}

function eligible(pool: StageRewardPool, context: RewardGrantContext): boolean {
  if (pool.group === 'first-clear') return context.firstClear;
  if (pool.group === 'repeat-clear') return true;
  if (pool.group === 'first-three-star') return context.firstThreeStar;
  if (pool.group === 'objective-bonus') {
    if (!pool.objectiveId || context.previous.claimedObjectiveRewardIds?.includes(pool.objectiveId)) return false;
    return context.objectives.some(x => x.id === pool.objectiveId && x.completed);
  }
  return false;
}

function apply(player: PlayerData, reward: GrantedStageReward, now: number): void {
  if (reward.rewardType === 'currency') {
    if (reward.rewardRefId === 'gold') player.gold += reward.quantity;
    else if (reward.rewardRefId === 'parts') player.parts += reward.quantity;
    return;
  }
  if (reward.rewardType === 'material') {
    if (reward.rewardRefId === 'enhanceStone') player.materials.enhanceStone += reward.quantity;
    return;
  }
  if (reward.rewardType === 'rune') {
    for (let i = 0; i < reward.quantity; i++) player.runeInventory.push(generateRuneInstance(reward.rewardRefId, now));
    return;
  }
  for (let i = 0; i < reward.quantity; i++) {
    if (player.equipmentInventory.items.length < 60) player.equipmentInventory.items.push(generateEquipmentInstance(reward.rewardRefId, now));
    else {
      const rarity = getEquipmentConfig(reward.rewardRefId)?.rarity ?? 'common';
      const stones = ({ common: 2, rare: 6, epic: 18 } as const)[rarity];
      player.materials.enhanceStone += stones;
      reward.convertedToEnhanceStone = (reward.convertedToEnhanceStone ?? 0) + stones;
    }
  }
}
