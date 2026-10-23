import { ArtResourceKey } from './ArtResourceKeys';

export interface ArtResourceEntry {
  path: string;
  type: 'sprite' | 'icon' | 'background' | 'placeholder' | 'status' | 'player' | 'enemy' | 'map' | 'ui' | 'effect' | 'drop';
  pack: string;
  fallback?: ArtResourceKey;
  virtual?: boolean;
  width?: number;
  height?: number;
  transparent?: boolean;
}

export const ART_PACKS = {
  base: { name: '基础资源包', enabled: true },
  prototype: { name: '程序化占位包', enabled: true },
  training_ground_v1: { name: '训练场正式资源包 v1', enabled: true },
};

export const ART_MANIFEST = {
  'main.bg': { path: 'assets/main_bg.png', type: 'background', pack: 'base', fallback: 'placeholder.image' },
  'player.mecha.normal': { path: 'assets/player_mecha.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.rat.normal': { path: 'assets/enemy_rat.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'drop.coin': { path: 'assets/coin.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'drop.part': { path: 'assets/part.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'drop.stone': { path: 'assets/stone.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'ui.equip.icon': { path: 'assets/equip_icon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.rune.icon': { path: 'assets/rune_icon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.skill.cannon': { path: 'assets/art-packs/training_ground_v1/ui/ui_skill_cannon_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'ui.skill.shield': { path: 'assets/art-packs/training_ground_v1/ui/ui_skill_shield_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },

  // 第三章资源
  'map.factory.bg': { path: 'assets/factory_bg.png', type: 'background', pack: 'base', fallback: 'placeholder.image' },
  'enemy.fireBeetle': { path: 'assets/enemy_fire_beetle.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.blazeHound': { path: 'assets/enemy_blaze_hound.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.magmaGolem': { path: 'assets/enemy_magma_golem.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'status.burn': { path: 'assets/status_burn.png', type: 'status', pack: 'base', fallback: 'placeholder.image' },
  'ui.chapter3.icon': { path: 'assets/chapter3_icon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'enemy.furnaceGuard': { path: 'assets/enemy_furnace_guard.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'ui.skill.roar': { path: 'assets/skill_roar.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.skill.fissure': { path: 'assets/skill_fissure.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },

  // 套装与第三章装备道具
  'equip.lavaCannon': { path: 'assets/equip_lava_cannon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.lavaArmor': { path: 'assets/equip_lava_armor.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.lavaCore': { path: 'assets/equip_lava_core.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'rune.fireGuard': { path: 'assets/rune_fire_guard.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.set.icon': { path: 'assets/ui_set_icon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },

  // 第2章与第16.2章新增全局美术
  'map.sewer.bg': { path: 'assets/sewer_bg.png', type: 'background', pack: 'base', fallback: 'placeholder.image' },
  'enemy.beetle': { path: 'assets/enemy_beetle.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.toxic': { path: 'assets/enemy_toxic.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.eliteToxic': { path: 'assets/enemy_elite_toxic.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.pollutionQueen': { path: 'assets/enemy_pollution_queen.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.eliteMouse': { path: 'assets/enemy_elite_mouse.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'enemy.ratKing': { path: 'assets/enemy_rat_king.png', type: 'sprite', pack: 'base', fallback: 'placeholder.image' },
  'equip.rustyClaw': { path: 'assets/equip_rusty_claw.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.neonBlaster': { path: 'assets/equip_neon_blaster.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.starcoreCannon': { path: 'assets/equip_starcore_cannon.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.patchedArmor': { path: 'assets/equip_patched_armor.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.alloyArmor': { path: 'assets/equip_alloy_armor.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.sewerGuard': { path: 'assets/equip_sewer_guard.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.smallCore': { path: 'assets/equip_small_core.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.neonCore': { path: 'assets/equip_neon_core.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'equip.starcoreFragment': { path: 'assets/equip_starcore_fragment.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'rune.cannonRune': { path: 'assets/rune_cannon_rune.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'rune.shieldRune': { path: 'assets/rune_shield_rune.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'rune.poisonGuard': { path: 'assets/rune_poison_guard.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'status.poison': { path: 'assets/status_poison.png', type: 'status', pack: 'base', fallback: 'placeholder.image' },

  // 引导素材
  'ui.tutorial.arrow': { path: 'assets/ui_tutorial_arrow.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.tutorial.move': { path: 'assets/ui_tutorial_move.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.tutorial.skill': { path: 'assets/ui_tutorial_skill.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },
  'ui.tutorial.equip': { path: 'assets/ui_tutorial_equip.png', type: 'icon', pack: 'base', fallback: 'placeholder.image' },

  // 占位与 fallback 素材
  'placeholder.image': { path: 'assets/stone.png', type: 'placeholder', pack: 'prototype' },

  // ================= 任务18 新增预留首批正式资源 Key (全部设为 virtual: true) =================
  // 1. 玩家 (player.mechaCat.idle/move/attack已移除virtual以提供真实物理文件存在自检)
  'player.mechaCat.idle': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 128, height: 128, transparent: true },
  'player.mechaCat.move': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_move_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 128, height: 128, transparent: true },
  'player.mechaCat.runLeft': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_run_left_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'player.mechaCat.idle', width: 1254, height: 1254, transparent: true },
  'player.mechaCat.runRight': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_run_right_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'player.mechaCat.idle', width: 1254, height: 1254, transparent: true },
  'player.mechaCat.stepLeft': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_step_left_02.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'player.mechaCat.runLeft', width: 1254, height: 1254, transparent: true },
  'player.mechaCat.stepRight': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_step_right_02.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'player.mechaCat.runRight', width: 1254, height: 1254, transparent: true },
  'player.mechaCat.attack': { path: 'assets/art-packs/training_ground_v1/players/player_mecha_cat_attack_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 128, height: 128, transparent: true },
  // 2. 敌人 (mouse/bug/eye/elite已落地为实体图片，移除virtual)
  'enemy.scrapMouse.normal': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'enemy.scrapMouse.move': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.normal', width: 64, height: 64, transparent: true },
  'enemy.scrapMouse.stepLeft': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_step_left_02.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.move', width: 1254, height: 1254, transparent: true },
  'enemy.scrapMouse.stepRight': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_step_right_02.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.move', width: 1254, height: 1254, transparent: true },
  'enemy.scrapMouse.attack': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.normal', width: 64, height: 64, transparent: true },
  'enemy.scrapMouse.hurt': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.normal', width: 64, height: 64, transparent: true },
  'enemy.scrapMouse.dead': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'enemy.scrapMouse.normal', width: 64, height: 64, transparent: true },
  'enemy.scrapBug.normal': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_bug_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'enemy.droneEye.normal': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_drone_eye_idle_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'enemy.scrapGuard.elite': { path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_guard_elite_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  // 3. 地图 (floor/line/boundary/zoneMark已落地为实体图片，移除virtual)
  'map.trainingGround.floor': { path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_tile_floor_01.png', type: 'background', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 800, height: 1200, transparent: false },
  'map.trainingGround.overhead': { path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_overhead_01.png', type: 'background', pack: 'training_ground_v1', fallback: 'map.trainingGround.floor', width: 1006, height: 1563, transparent: false },
  'map.trainingGround.line': { path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_tile_line_01.png', type: 'background', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'map.trainingGround.boundary': { path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_boundary_01.png', type: 'background', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  'map.trainingGround.zoneMark': { path: 'assets/art-packs/training_ground_v1/maps/map_training_ground_zone_mark_01.png', type: 'background', pack: 'training_ground_v1', fallback: 'placeholder.image', width: 64, height: 64, transparent: true },
  // 4. 资源点
  'resource.energyCrystal': { path: 'assets/art-packs/training_ground_v1/drop_energy_crystal_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'resource.scrapPart': { path: 'assets/art-packs/training_ground_v1/drop_scrap_part_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'resource.dataChip': { path: 'assets/art-packs/training_ground_v1/drop_data_chip_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  // 5. 宝箱
  'chest.training.coin': { path: 'assets/art-packs/training_ground_v1/chest_training_coin_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'chest.training.supply': { path: 'assets/art-packs/training_ground_v1/chest_training_supply_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'chest.training.opened': { path: 'assets/art-packs/training_ground_v1/chest_training_opened_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  // 6. UI 与目标 Dock 图标
  'icon.guide.arrow': { path: 'assets/art-packs/training_ground_v1/icon_guide_arrow_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'icon.objective.enemy': { path: 'assets/art-packs/training_ground_v1/icon_objective_enemy_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'icon.objective.resource': { path: 'assets/art-packs/training_ground_v1/icon_objective_resource_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'icon.objective.chest': { path: 'assets/art-packs/training_ground_v1/icon_objective_chest_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  // 7. 特效与大公告板
  'effect.hit.energy': { path: 'assets/art-packs/training_ground_v1/effect_hit_energy_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'effect.explosion.small': { path: 'assets/art-packs/training_ground_v1/effect_explosion_small_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'effect.shield.aura': { path: 'assets/art-packs/training_ground_v1/effect_shield_aura_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'effect.cannon.burst': { path: 'assets/art-packs/training_ground_v1/effect_cannon_burst_01.png', type: 'sprite', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'ui.notice.clearComplete': { path: 'assets/art-packs/training_ground_v1/ui_notice_clear_complete_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
  'ui.notice.trainingComplete': { path: 'assets/art-packs/training_ground_v1/ui_notice_training_complete_01.png', type: 'icon', pack: 'training_ground_v1', fallback: 'placeholder.image', virtual: true },
} satisfies Partial<Record<ArtResourceKey, ArtResourceEntry>>;
