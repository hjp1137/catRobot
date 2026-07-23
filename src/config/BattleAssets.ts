import type { ResourceKey } from '../core/ResourceManager';
import type { ISystemInfo } from '../engine/IContext';

export interface BattleAssetSlot {
  resourceKey: ResourceKey;
  futurePath: string;
  scale: number;
  anchor: { x: number; y: number };
}

export const BATTLE_ASSET_DIRECTORIES = [
  'assets/images/player',
  'assets/images/enemies',
  'assets/images/bullets',
  'assets/images/effects',
  'assets/images/drops',
  'assets/images/ui',
  'assets/images/backgrounds',
] as const;

export const BATTLE_VISUAL_TUNING = {
  playerDisplayScale: 1.94,
  normalEnemyDisplayScale: 1.12,
  eliteEnemyDisplayScale: 1.09,
  bossEnemyDisplayScale: 1.08,
  enemySeparationRadius: 36,
  bottomSkillAvoidance: 132,
  hudBodyHeight: 54,
  playerHpBarOffset: 24,
  playerFocusAlpha: 0.2,
  projectileVisualWidth: 5,
  projectileCoreRadius: 4,
  damageTextRise: 26,
  basicDamageFont: 'bold 13px sans-serif',
  skillDamageFont: 'bold 17px sans-serif',
  waveNoticeDurationMs: 1400,
  waveNoticeYRatio: 0.22,
  waveNoticePanel: 'rgba(4, 8, 18, 0.62)',
} as const;

export function getBattleHudSafeTop(info: ISystemInfo): number {
  const fallback = Math.max(10, Math.min(24, Math.round(info.windowHeight * 0.018)));
  const statusTop = typeof info.statusBarHeight === 'number' ? info.statusBarHeight + 8 : 0;
  const capsuleTop = typeof info.menuButton?.bottom === 'number' ? info.menuButton.bottom + 8 : 0;
  return Math.round(Math.max(fallback, statusTop, capsuleTop));
}

export function getBattlePlayBounds(w: number, h: number, info: ISystemInfo): { top: number; bottom: number } {
  const top = getBattleHudSafeTop(info) + BATTLE_VISUAL_TUNING.hudBodyHeight;
  const bottom = h - BATTLE_VISUAL_TUNING.bottomSkillAvoidance;
  return { top: Math.min(top, h * 0.42), bottom: Math.max(top + 80, bottom) };
}

export const BATTLE_ASSETS = {
  player: {
    idle: {
      resourceKey: 'player_mecha',
      futurePath: 'assets/images/player/player_mecha_cat_idle.png',
      scale: BATTLE_VISUAL_TUNING.playerDisplayScale,
      anchor: { x: 0.5, y: 0.58 },
    },
    attack: {
      resourceKey: 'player_mecha',
      futurePath: 'assets/images/player/player_mecha_cat_attack.png',
      scale: BATTLE_VISUAL_TUNING.playerDisplayScale,
      anchor: { x: 0.5, y: 0.58 },
    },
  },
  enemies: {
    normal: { resourceKey: 'enemy_rat', futurePath: 'assets/images/enemies/enemy_scrap_bug_01.png', scale: BATTLE_VISUAL_TUNING.normalEnemyDisplayScale, anchor: { x: 0.5, y: 0.55 } },
    elite: { resourceKey: 'enemy_elite_mouse', futurePath: 'assets/images/enemies/enemy_scrap_bug_03.png', scale: BATTLE_VISUAL_TUNING.eliteEnemyDisplayScale, anchor: { x: 0.5, y: 0.55 } },
    boss: { resourceKey: 'enemy_rat_king', futurePath: 'assets/images/enemies/enemy_boss_01.png', scale: BATTLE_VISUAL_TUNING.bossEnemyDisplayScale, anchor: { x: 0.5, y: 0.55 } },
  },
  bullets: {
    basic: { resourceKey: 'skill_cannon', futurePath: 'assets/images/bullets/bullet_energy_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
    laser: { resourceKey: 'skill_roar', futurePath: 'assets/images/bullets/bullet_laser_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
  },
  effects: {
    hit: { resourceKey: 'status_burn', futurePath: 'assets/images/effects/hit_effect_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
    explosion: { resourceKey: 'skill_roar', futurePath: 'assets/images/effects/explosion_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
    cast: { resourceKey: 'skill_fissure', futurePath: 'assets/images/effects/skill_cast_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
  },
  drops: {
    coin: { resourceKey: 'coin', futurePath: 'assets/images/drops/drop_coin_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
    energy: { resourceKey: 'part', futurePath: 'assets/images/drops/drop_energy_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
  },
  ui: {
    skillSlot: { resourceKey: 'ui_set_icon', futurePath: 'assets/images/ui/ui_skill_slot_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
    hudTop: { resourceKey: 'main_bg', futurePath: 'assets/images/ui/ui_hud_top_01.png', scale: 1, anchor: { x: 0.5, y: 0.5 } },
  },
} as const satisfies Record<string, Record<string, BattleAssetSlot>>;

export function getEnemyVisualScale(isBoss: boolean, isElite: boolean): number {
  if (isBoss) return BATTLE_ASSETS.enemies.boss.scale;
  if (isElite) return BATTLE_ASSETS.enemies.elite.scale;
  return BATTLE_ASSETS.enemies.normal.scale;
}
