/**
 * 简易事件总线
 * ------------------------------------------------------------------
 * 解耦 UI 与逻辑层：例如战斗胜利时 BattleManager emit('battle.win')，
 * GameManager 监听后切场景、发奖、存档。UI 也可订阅以刷新数字。
 *
 * 不引入第三方库，30 行实现足以胜任 MVP。
 */
export type EventHandler = (payload?: any) => void;

export class EventManager {
  private map = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): () => void {
    let set = this.map.get(event);
    if (!set) { set = new Set(); this.map.set(event, set); }
    set.add(handler);
    // 返回取消订阅函数，避免遗忘 off 导致泄漏
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    this.map.get(event)?.delete(handler);
  }

  emit(event: string, payload?: any): void {
    this.map.get(event)?.forEach(h => {
      try { h(payload); } catch (e) { console.warn(`[EventManager] handler error for ${event}`, e); }
    });
  }

  clear(): void { this.map.clear(); }
}

/** 全局事件名常量，避免拼写错误 */
export const EVT = {
  BATTLE_WIN: 'battle.win',
  BATTLE_LOSE: 'battle.lose',
  PLAYER_DATA_CHANGED: 'player.changed',
  UPGRADE_RESULT: 'upgrade.result',
  SCENE_CHANGED: 'scene.changed',
} as const;
