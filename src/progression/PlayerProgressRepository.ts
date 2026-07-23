import type { PlayerData } from '../data/PlayerData';
import { createDefaultPlayerData } from '../data/PlayerData';

export interface PlayerProgressRepository {
  load(): PlayerData;
  save(data: PlayerData): boolean;
  reset(): PlayerData;
}

export class InMemoryPlayerProgressRepository implements PlayerProgressRepository {
  private value: PlayerData;
  constructor(initial: PlayerData = createDefaultPlayerData()) { this.value = clone(initial); }
  load(): PlayerData { return clone(this.value); }
  save(data: PlayerData): boolean { this.value = clone(data); return true; }
  reset(): PlayerData { this.value = createDefaultPlayerData(); return this.load(); }
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
