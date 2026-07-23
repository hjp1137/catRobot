# 《喵喵机甲》training_ground_v1正式美术资源包接入说明

本文档用于指导后续美术设计师和素材生成程序，如何将正式的 PNG 图片素材放入 `training_ground_v1`（训练场正式资源包 v1）中，并进行 Manifest 配置切换和工程验证。

---

## 1. 物理目录结构
资源包位于项目根目录的 `assets/art-packs/training_ground_v1/` 中：
- `players/`：存放主角待机、移动和攻击图片（如 `player_mecha_cat_idle_01.png`）。
- `enemies/`：存放三类普通怪与一类精英怪图片（如 `enemy_scrap_mouse_idle_01.png`）。
- `maps/`：存放训练场地砖、边界和标志图片（如 `map_training_ground_tile_floor_01.png`）。

---

## 2. 槽位文件名与 Key 对照表

| 建议文件名 | 物理用途 | 目标存放子目录 | Manifest Key |
| :--- | :--- | :--- | :--- |
| `player_mecha_cat_idle_01.png` | 主角猫待机 Sprite | `players/` | `player.mechaCat.idle` |
| `player_mecha_cat_move_01.png` | 主角猫移动 Sprite | `players/` | `player.mechaCat.move` |
| `player_mecha_cat_attack_01.png` | 主角猫攻击 Sprite | `players/` | `player.mechaCat.attack` |
| `enemy_scrap_mouse_idle_01.png` | 普通机械老鼠怪 | `enemies/` | `enemy.scrapMouse.normal` |
| `enemy_scrap_bug_idle_01.png` | 普通机械甲虫怪 | `enemies/` | `enemy.scrapBug.normal` |
| `enemy_drone_eye_idle_01.png` | 普通机械飞眼怪 | `enemies/` | `enemy.droneEye.normal` |
| `enemy_scrap_guard_elite_01.png` | 精英机械卫士 | `enemies/` | `enemy.scrapGuard.elite` |
| `map_training_ground_tile_floor_01.png` | 训练场地砖 | `maps/` | `map.trainingGround.floor` |
| `map_training_ground_tile_line_01.png` | 训练场分割线 | `maps/` | `map.trainingGround.line` |
| `map_training_ground_boundary_01.png` | 边缘障碍碰撞墙 | `maps/` | `map.trainingGround.boundary` |
| `map_training_ground_zone_mark_01.png` | 地面区域引导标志 | `maps/` | `map.trainingGround.zoneMark` |

---

## 3. 正式图片素材接入的 4 步工作流

### 步骤一：放入物理图片
准备好透明 RGBA 格式、尺寸符合要求的正式 PNG 图片，重命名为对照表中的“建议文件名”，拖放到对应的子目录（如 `players/`）中。

### 步骤二：修改 Manifest 映射
打开 `src/assets/ArtManifest.ts`，找到对应的 Key：
1. 确认 `path` 指向了该图片的物理路径（例如 `assets/art-packs/training_ground_v1/players/player_mecha_cat_idle_01.png`）。
2. **移除 `virtual: true` 字段！** （若不移除，自检脚本将直接跳过物理文件检测；移除后，物理文件必须存在才能通过自检，从而确保图片在打包发布时 100% 存在）。

### 步骤三：运行缺失检测
在终端运行：
```bash
npm run build
npm run check:art
```
如果物理图片没有放对位置，或者路径拼写错误，自检脚本会抛出 `❌ [Missing] 缺失资源` 并以 `exit 1` 阻断构建。如果输出 `✅ 资源自检成功！`，则说明物理文件已经安全落地。

### 步骤四：在小游戏中启用正式资源包
打开 `src/assets/ArtManifest.ts`，在最上方的 `ART_PACKS` 对象中，将 `training_ground_v1` 的启用标志设为 `true`：
```ts
export const ART_PACKS = {
  base: { name: '基础资源包', enabled: true },
  prototype: { name: '程序化占位包', enabled: true },
  training_ground_v1: { name: '训练场正式资源包 v1', enabled: true }, // 一键激活！
};
```
刷新微信开发者工具，新美术资源即可直接在自由探索训练场场景中全局无缝生效！

---

## 4. 常见错误及故障排查 (Troubleshooting)

- **缺失资源报错 (Missing Assets)**：
  - *表现*：自检输出 `❌ [Missing] 缺失资源 [player.mechaCat.idle]`。
  - *原因*：你移除了 `virtual: true`，但是在 `assets/art-packs/training_ground_v1/players/` 物理目录下没有放置对应的图片，或者拼写不一致。
- **降级回退 (Fallback)**：
  - *表现*：启用包后没有报错，但游戏内图片依然显示为占位方块（`assets/stone.png`）。
  - *原因*：当 `ART_PACKS.training_ground_v1.enabled` 处于 `false` 时，或者 ResourceManager 判定该包未启用时，解析器会自动走 fallback 链，将 Key 安全解析为默认占位符。请核对资源包是否设为 `enabled: true`。
- **透明背景错误 / 设备缩放模糊**：
  - *表现*：图片边缘有白边，或者像素变模糊。
  - *原因*：微信小游戏平台限制，美术资源必须输出为纯透明 RGBA 格式 PNG（透明通道无白灰杂边）。并且在 Manifest 中应当指定正确的 `width` 和 `height` 元数据以配合 DPR 渲染适配。
