import { IContext } from '../engine/IContext';
import { getArtPath } from '../assets/ArtResourceResolver';
import type { ArtResourceKey } from '../assets/ArtResourceKeys';
import { listAnimationClips } from '../animation/AnimationManifestRepository';

export type LoadStatus = 'PENDING' | 'LOADING' | 'LOADED' | 'FAILED';

export const IMAGE_RESOURCES = {
  main_bg: getArtPath('main.bg'),
  player_mecha: getArtPath('player.mecha.normal'),
  enemy_rat: getArtPath('enemy.rat.normal'),
  coin: getArtPath('drop.coin'),
  part: getArtPath('drop.part'),
  stone: getArtPath('drop.stone'),
  equip_icon: getArtPath('ui.equip.icon'),
  rune_icon: getArtPath('ui.rune.icon'),
  skill_cannon: getArtPath('ui.skill.cannon'),
  skill_shield: getArtPath('ui.skill.shield'),
  // 第三章资源
  factory_bg: getArtPath('map.factory.bg'),
  enemy_fire_beetle: getArtPath('enemy.fireBeetle'),
  enemy_blaze_hound: getArtPath('enemy.blazeHound'),
  enemy_magma_golem: getArtPath('enemy.magmaGolem'),
  status_burn: getArtPath('status.burn'),
  chapter3_icon: getArtPath('ui.chapter3.icon'),
  enemy_furnace_guard: getArtPath('enemy.furnaceGuard'),
  skill_roar: getArtPath('ui.skill.roar'),
  skill_fissure: getArtPath('ui.skill.fissure'),
  // 套装与第三章装备道具
  equip_lava_cannon: getArtPath('equip.lavaCannon'),
  equip_lava_armor: getArtPath('equip.lavaArmor'),
  equip_lava_core: getArtPath('equip.lavaCore'),
  rune_fire_guard: getArtPath('rune.fireGuard'),
  ui_set_icon: getArtPath('ui.set.icon'),
  // 第2章与第16.2章新增全局美术
  sewer_bg: getArtPath('map.sewer.bg'),
  enemy_beetle: getArtPath('enemy.beetle'),
  enemy_toxic: getArtPath('enemy.toxic'),
  enemy_elite_toxic: getArtPath('enemy.eliteToxic'),
  enemy_pollution_queen: getArtPath('enemy.pollutionQueen'),
  enemy_elite_mouse: getArtPath('enemy.eliteMouse'),
  enemy_rat_king: getArtPath('enemy.ratKing'),
  equip_rusty_claw: getArtPath('equip.rustyClaw'),
  equip_neon_blaster: getArtPath('equip.neonBlaster'),
  equip_starcore_cannon: getArtPath('equip.starcoreCannon'),
  equip_patched_armor: getArtPath('equip.patchedArmor'),
  equip_alloy_armor: getArtPath('equip.alloyArmor'),
  equip_sewer_guard: getArtPath('equip.sewerGuard'),
  equip_small_core: getArtPath('equip.smallCore'),
  equip_neon_core: getArtPath('equip.neonCore'),
  equip_starcore_fragment: getArtPath('equip.starcoreFragment'),
  rune_cannon_rune: getArtPath('rune.cannonRune'),
  rune_shield_rune: getArtPath('rune.shieldRune'),
  rune_poison_guard: getArtPath('rune.poisonGuard'),
  status_poison: getArtPath('status.poison'),
  // 引导素材
  ui_tutorial_arrow: getArtPath('ui.tutorial.arrow'),
  ui_tutorial_move: getArtPath('ui.tutorial.move'),
  ui_tutorial_skill: getArtPath('ui.tutorial.skill'),
  ui_tutorial_equip: getArtPath('ui.tutorial.equip'),
  player_mecha_cat_idle: getArtPath('player.mechaCat.idle'),
  player_mecha_cat_move: getArtPath('player.mechaCat.move'),
  player_mecha_cat_run_left: getArtPath('player.mechaCat.runLeft'),
  player_mecha_cat_run_right: getArtPath('player.mechaCat.runRight'),
  player_mecha_cat_attack: getArtPath('player.mechaCat.attack'),
  enemy_scrap_mouse: getArtPath('enemy.scrapMouse.normal'),
  enemy_scrap_bug: getArtPath('enemy.scrapBug.normal'),
  enemy_drone_eye: getArtPath('enemy.droneEye.normal'),
  enemy_scrap_guard_elite: getArtPath('enemy.scrapGuard.elite'),
  map_training_ground_floor: getArtPath('map.trainingGround.floor'),
  map_training_ground_line: getArtPath('map.trainingGround.line'),
  map_training_ground_boundary: getArtPath('map.trainingGround.boundary'),
  map_training_ground_zone_mark: getArtPath('map.trainingGround.zoneMark'),
};

export type ResourceKey = keyof typeof IMAGE_RESOURCES;

export class ResourceManager {
  private static instance: ResourceManager | null = null;
  private images = new Map<string, any>();
  private statuses = new Map<string, LoadStatus>();
  private artKeyResourceIds = new Map<string, string>();
  private context: IContext | null = null;

  private constructor() {
    for (const key of Object.keys(IMAGE_RESOURCES)) {
      this.statuses.set(key, 'PENDING');
    }
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  public getStatus(key: string): LoadStatus {
    return this.statuses.get(key) || 'FAILED';
  }

  public isLoaded(key: string): boolean {
    return this.getStatus(key) === 'LOADED';
  }

  public isFailed(key: string): boolean {
    return this.getStatus(key) === 'FAILED';
  }

  public getImage(key: string): any | null {
    if (this.isLoaded(key)) {
      return this.images.get(key) || null;
    }
    return null;
  }

  public getImageByArtKey(key: ArtResourceKey | undefined): any | null {
    if (!key) return null;
    const resourceId = this.artResourceId(key);
    if (this.statuses.get(resourceId) === 'LOADED') return this.images.get(resourceId) || null;
    const path = getArtPath(key);
    const match = Object.entries(IMAGE_RESOURCES).find(([, src]) => src === path);
    if (match) return this.getImage(match[0]);
    if (this.context) void this.loadArtKey(key, this.context);
    return null;
  }

  public async loadArtKey(key: ArtResourceKey, context: IContext): Promise<void> {
    this.context = context;
    const resourceId = this.artResourceId(key);
    const status = this.statuses.get(resourceId);
    if (status === 'LOADING' || status === 'LOADED') return;
    this.statuses.set(resourceId, 'LOADING');
    const img = context.createImage();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        this.images.set(resourceId, img);
        this.statuses.set(resourceId, 'LOADED');
        resolve();
      };
      img.onerror = (err: any) => {
        context.log(`Art key load failed [${key}]: ${getArtPath(key)}`, err);
        this.statuses.set(resourceId, 'FAILED');
        resolve();
      };
      img.src = getArtPath(key);
    });
  }

  public async loadAll(context: IContext): Promise<void> {
    this.context = context;
    const promises = Object.entries(IMAGE_RESOURCES).map(([key, src]) => {
      const currentStatus = this.statuses.get(key);
      if (currentStatus === 'LOADING' || currentStatus === 'LOADED') {
        return Promise.resolve();
      }

      this.statuses.set(key, 'LOADING');
      const img = context.createImage();
      
      return new Promise<void>((resolve) => {
        img.onload = () => {
          this.images.set(key, img);
          this.statuses.set(key, 'LOADED');
          resolve();
        };
        img.onerror = (err: any) => {
          context.log(`Resource load failed [${key}]: ${src}`, err);
          this.statuses.set(key, 'FAILED');
          resolve();
        };
        img.src = src;
      });
    });

    const animationKeys = new Set<ArtResourceKey>();
    for (const clip of listAnimationClips()) {
      for (const frame of clip.frames) animationKeys.add(frame.artKey);
    }
    const animationPromises = Array.from(animationKeys).map(key => this.loadArtKey(key, context));
    await Promise.all([...promises, ...animationPromises]);
  }

  public resetForTest(): void {
    this.images.clear();
    this.statuses.clear();
    this.artKeyResourceIds.clear();
    this.context = null;
    for (const key of Object.keys(IMAGE_RESOURCES)) {
      this.statuses.set(key, 'PENDING');
    }
  }

  private artResourceId(key: ArtResourceKey): string {
    const existing = this.artKeyResourceIds.get(key);
    if (existing) return existing;
    const id = `art:${key}`;
    this.artKeyResourceIds.set(key, id);
    if (!this.statuses.has(id)) this.statuses.set(id, 'PENDING');
    return id;
  }
}
