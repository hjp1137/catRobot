# training_ground_v1 正式美术资源包槽位说明

本目录为《喵喵机甲》训练场垂直切片的首批正式美术资源包（v1 版本）。
后续美术设计师或者资源生成脚本，在将正式美术图片存入此包时，请严格遵守以下物理文件名槽位及尺寸要求：

## 1. 玩家主角槽位 (`players/`)
- `players/player_mecha_cat_idle_01.png`
  - 物理含义：主角机甲猫待机 Sprite
  - Manifest Key: `player.mechaCat.idle`
  - 建议尺寸：`256x256 px`
  - 背景要求：透明 (RGBA)
- `players/player_mecha_cat_move_01.png`
  - 物理含义：主角机甲猫移动 Sprite
  - Manifest Key: `player.mechaCat.move`
  - 建议尺寸：`256x256 px`
- `players/player_mecha_cat_attack_01.png`
  - 物理含义：主角机甲猫攻击 Sprite
  - Manifest Key: `player.mechaCat.attack`
  - 建议尺寸：`256x256 px`

## 2. 敌人槽位 (`enemies/`)
- `enemies/enemy_scrap_mouse_idle_01.png`
  - 物理含义：普通机械废料鼠怪 Sprite
  - Manifest Key: `enemy.scrapMouse.normal`
  - 建议尺寸：`128x128 px`
  - 背景要求：透明 (RGBA)
- `enemies/enemy_scrap_bug_idle_01.png`
  - 物理含义：普通铁甲甲虫怪 Sprite
  - Manifest Key: `enemy.scrapBug.normal`
  - 建议尺寸：`128x128 px`
- `enemies/enemy_drone_eye_idle_01.png`
  - 物理含义：普通红眼飞眼怪 Sprite
  - Manifest Key: `enemy.droneEye.normal`
  - 建议尺寸：`128x128 px`
- `enemies/enemy_scrap_guard_elite_01.png`
  - 物理含义：精英机械卫士 Sprite
  - Manifest Key: `enemy.scrapGuard.elite`
  - 建议尺寸：`192x192 px`

## 3. 地图槽位 (`maps/`)
- `maps/map_training_ground_tile_floor_01.png`
  - 物理含义：训练场地砖贴图
  - Manifest Key: `map.trainingGround.floor`
  - 建议尺寸：`256x256 px` (支持循环平铺)
- `maps/map_training_ground_tile_line_01.png`
  - 物理含义：训练场分割线贴图
  - Manifest Key: `map.trainingGround.line`
  - 建议尺寸：`128x128 px`
- `maps/map_training_ground_boundary_01.png`
  - 物理含义：训练场边缘物理障碍碰撞墙体贴图
  - Manifest Key: `map.trainingGround.boundary`
  - 建议尺寸：`256x256 px`
- `maps/map_training_ground_zone_mark_01.png`
  - 物理含义：地面引导方向/区域边界标志贴图
  - Manifest Key: `map.trainingGround.zoneMark`
  - 建议尺寸：`128x128 px`
