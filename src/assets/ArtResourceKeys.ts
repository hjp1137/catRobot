export type ArtResourceKey =
  // 基础与通用 UI 资源
  | 'main.bg'
  | 'player.mecha.normal'
  | 'enemy.rat.normal'
  | 'drop.coin'
  | 'drop.part'
  | 'drop.stone'
  | 'ui.equip.icon'
  | 'ui.rune.icon'
  | 'ui.skill.cannon'
  | 'ui.skill.shield'
  // 第三章资源
  | 'map.factory.bg'
  | 'enemy.fireBeetle'
  | 'enemy.blazeHound'
  | 'enemy.magmaGolem'
  | 'status.burn'
  | 'ui.chapter3.icon'
  | 'enemy.furnaceGuard'
  | 'ui.skill.roar'
  | 'ui.skill.fissure'
  // 套装与第三章装备道具
  | 'equip.lavaCannon'
  | 'equip.lavaArmor'
  | 'equip.lavaCore'
  | 'rune.fireGuard'
  | 'ui.set.icon'
  // 第2章与第16.2章新增全局美术
  | 'map.sewer.bg'
  | 'enemy.beetle'
  | 'enemy.toxic'
  | 'enemy.eliteToxic'
  | 'enemy.pollutionQueen'
  | 'enemy.eliteMouse'
  | 'enemy.ratKing'
  | 'equip.rustyClaw'
  | 'equip.neonBlaster'
  | 'equip.starcoreCannon'
  | 'equip.patchedArmor'
  | 'equip.alloyArmor'
  | 'equip.sewerGuard'
  | 'equip.smallCore'
  | 'equip.neonCore'
  | 'equip.starcoreFragment'
  | 'rune.cannonRune'
  | 'rune.shieldRune'
  | 'rune.poisonGuard'
  | 'status.poison'
  // 引导素材
  | 'ui.tutorial.arrow'
  | 'ui.tutorial.move'
  | 'ui.tutorial.skill'
  | 'ui.tutorial.equip'
  // 占位与测试素材 Key
  | 'placeholder.image'

  // ================= 任务18 新增预留首批正式资源 Key =================
  // 1. 玩家
  | 'player.mechaCat.idle'
  | 'player.mechaCat.move'
  | 'player.mechaCat.runLeft'
  | 'player.mechaCat.runRight'
  | 'player.mechaCat.stepLeft'
  | 'player.mechaCat.stepRight'
  | 'player.mechaCat.attack'
  // 2. 敌人
  | 'enemy.scrapMouse.normal'
  | 'enemy.scrapMouse.move'
  | 'enemy.scrapMouse.stepLeft'
  | 'enemy.scrapMouse.stepRight'
  | 'enemy.scrapMouse.attack'
  | 'enemy.scrapMouse.hurt'
  | 'enemy.scrapMouse.dead'
  | 'enemy.scrapBug.normal'
  | 'enemy.droneEye.normal'
  | 'enemy.scrapGuard.elite'
  // 3. 地图
  | 'map.trainingGround.floor'
  | 'map.trainingGround.overhead'
  | 'map.trainingGround.line'
  | 'map.trainingGround.boundary'
  | 'map.trainingGround.zoneMark'
  // 4. 资源点
  | 'resource.energyCrystal'
  | 'resource.scrapPart'
  | 'resource.dataChip'
  // 5. 宝箱
  | 'chest.training.coin'
  | 'chest.training.supply'
  | 'chest.training.opened'
  // 6. UI 与目标 Dock 图标
  | 'icon.guide.arrow'
  | 'icon.objective.enemy'
  | 'icon.objective.resource'
  | 'icon.objective.chest'
  // 7. 特效与大公告板
  | 'effect.hit.energy'
  | 'effect.explosion.small'
  | 'effect.shield.aura'
  | 'effect.cannon.burst'
  | 'ui.notice.clearComplete'
  | 'ui.notice.trainingComplete'
  // 1-1 多帧跑步资源；具体帧顺序与文件由后台动画快照决定
  | `player.mechaCat.run.phase0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  | `enemy.scrapMouse.run.phase0${1 | 2 | 3 | 4 | 5 | 6}`
  | `enemy.scrapGuard.run.phase0${1 | 2 | 3 | 4 | 5 | 6}`
  | `${'player.mechaCat' | 'enemy.scrapMouse' | 'enemy.scrapGuard'}.run.${'up' | 'down'}.phase${1 | 2 | 3 | 4 | 5 | 6}`;
