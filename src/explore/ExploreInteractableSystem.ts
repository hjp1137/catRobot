import type { PlayerMecha } from '../player/PlayerMecha';
import type { ExploreChestConfig, ExploreObjectiveState, ExploreResourceNodeConfig } from './ExploreContentConfig';
import { TRAINING_GROUND_CONTENT } from './ExploreContentConfig';

export type ExploreResourceNode = ExploreResourceNodeConfig;
export type ExploreChest = ExploreChestConfig;

export interface ExploreInteractionResult {
  resourceGain: number;
  coinGain: number;
  openedChests: number;
}

export function createExploreResourceNodes(): ExploreResourceNode[] {
  return TRAINING_GROUND_CONTENT.resourceNodes.map(n => ({ ...n }));
}

export function createExploreChests(): ExploreChest[] {
  return TRAINING_GROUND_CONTENT.chests.map(c => ({ ...c }));
}

export function updateExploreInteractions(
  player: PlayerMecha,
  resources: ExploreResourceNode[],
  chests: ExploreChest[],
  objective: ExploreObjectiveState,
): ExploreInteractionResult {
  const result = { resourceGain: 0, coinGain: 0, openedChests: 0 };
  for (const node of resources) {
    if (node.collected || Math.hypot(player.x - node.x, player.y - node.y) > player.radius + 28) continue;
    node.collected = true;
    if (node.type === 'coin') result.coinGain += node.amount;
    else result.resourceGain += node.amount;
  }
  for (const chest of chests) {
    if (chest.opened || Math.hypot(player.x - chest.x, player.y - chest.y) > player.radius + 38) continue;
    chest.opened = true;
    objective.chestsOpened++;
    result.openedChests++;
    applyChestReward(player, chest, result);
  }
  return result;
}

function applyChestReward(player: PlayerMecha, chest: ExploreChest, result: ExploreInteractionResult): void {
  if (chest.rewardType === 'coin') {
    result.coinGain += chest.rewardAmount;
    return;
  }
  if (chest.rewardType === 'heal') {
    player.hp = Math.min(player.maxHp, player.hp + chest.rewardAmount);
    return;
  }
  if (chest.rewardType === 'energy') {
    result.resourceGain += chest.rewardAmount;
    return;
  }
  player.shieldHitFlash = Math.max(player.shieldHitFlash, 0.35);
}
