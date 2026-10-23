# 喵喵机甲：星核觉醒 / Mecha Cat: Starcore Awakening

## Godot 重构版（2026-10-17）

双击 [运行Godot版.cmd](运行Godot版.cmd)，或使用 Godot 4.7.2 导入 [godot/project.godot](godot/project.godot)。
Godot 客户端复用当前已发布的第一章十关，包含自动射击、主动技能、局内强化、机库养成、装备符文与旧存档 JSON 导入。
机甲与背包已合并：上方人物、六部位配件和左右武器，下方直接浏览物品；底部保留机甲、进化、战斗、营地4个小入口。点击符文直接显示效果和匹配装备的5孔镶嵌选项。
建筑按等级开放，配装比较、镶嵌与成长收益使用真实数据；见[机甲背包合并成果与截图](Walkthroughes/20261017_机甲背包合并与符文直观镶嵌成果说明.md)。
战斗入口现为章总览地图→章内十关路线图，地图只保留关卡名称/星级及当前节点颜色，点击关卡弹出详情、奖励和出击；营地保留建筑，人物随机漫游，并有维修机器人、货车与小星舰活动。见[关卡详情弹窗成果](Walkthroughes/20261017_清爽关卡地图与详情弹窗成果说明.md)。
装备精简为头盔、上衣、裤子、鞋子、护甲、戒指六种配件，左右手武器单独保留；五阶25套、2/4/6件套装共鸣与按难度掉落，见[六部位装备成果](Walkthroughes/20261017_六部位机甲装备精简成果说明.md)。
符文采用六部位及武器共7类刻纹宝石，每件装备5孔，同部件镶嵌且随穿戴生效。旧左右护甲、左右戒指和项链随存档迁移合并，原物品与符文孔保留。
进化按金币显示可进化/不足/满级，成功后播放聚能升级动画；背包装配、镶嵌与选中分别用底色和徽标区分，符文分类可进入图鉴查看所有真实符文及拥有数。见[进化反馈与符文图鉴成果](Walkthroughes/20261018_进化反馈背包标识与符文图鉴成果说明.md)。
第一章十关现有独立地形与美术主题；战斗右侧小地图可点击放大，M打开战术地图，支持缩放、拖动及标点寻路；见 [地图成果与实机截图](Walkthroughes/20261015_十关差异地图与大小地图成果说明.md)。
战斗地图已扩大9倍，加入两处中继探索和每关首领；击败首领即可通关，详见 [探索战斗成果](Walkthroughes/20261015_探索战斗局内经验与关卡首领成果说明.md)。
角色采用位移驱动步态、统一脚底定位与连续机械关节动作；活体互相阻挡，点击寻路绕怪，死亡释放碰撞。玩家基础速度340，怪物145～185，保留首领探索节奏。
十关现用斜俯视2.5D工业设施，按脚点排序并在遮挡人物时淡出，保留焦痕/碎料/管线、脉冲区与加速通道。
沿途补充757处紧凑检修/管阀/废料/配电实体，每关五个地面环境分区，搭配线缆、格栅、修补板和污迹，保留主路与目标战斗净空；见[环境密度成果与实机画面](Walkthroughes/20261015_战场环境密度与区域氛围成果说明.md)。
局内升级三选一已移除，改为每关1～2个宝箱及怪物概率掉落强化，靠近直接获得；见 [宝箱掉落与斜俯视界面成果](Walkthroughes/20261015_战场宝箱掉落强化与斜俯视界面成果说明.md)。
战斗布局现为左侧46px图标卡片，击杀/当前存活/宝箱及效果单列竖排、数字置于卡内；右侧地图/任务，顶部关卡名后接时间、底部细血条，右下图标技能保留快捷键；玩家跑步步距调整为250并补充身体协调。见[自然奔跑与极简布局实机成果](Walkthroughes/20261017_自然奔跑与战斗极简布局成果说明.md)。
规则与25套名称详见 [装备设计](docs/20261011_机甲装备套装与掉落设计.md)。
补充机库、鼠王、重装鼠卫、无人机、机械甲虫及货币图标，详见 [素材记录](godot/ART_SOURCES.md)。

- 操作与迁移边界：[Godot 说明](godot/README.md)
- 同步内容：`node scripts/sync-godot-content.cjs`
- 本地验证：`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-godot.ps1`
- 本轮交付为可运行的 Godot Windows 工程；微信小游戏适配及真机发布尚未验收。

以下为保留的原 TypeScript 微信客户端与内容后台说明。

竖屏 2D 轻量 RPG 微信小游戏原型。玩家驾驶「橘猫重甲」机甲，在训练场击败机械鼠，获取金币与零件，升级机甲提升战力，数据本地持久化。

A portrait 2D lightweight RPG prototype for WeChat Mini Games. Pilot the Orange Cat Heavy Armor, defeat mechanical mice in the training ground, collect rewards, and upgrade your mech.

## 开源与维护 / Open Source and Maintenance

本项目是开源项目，欢迎通过 Issue 和 Pull Request 参与改进。项目会持续维护，逐步完善游戏体验、内容管理能力、测试与文档。

This is an open-source project. Issues and pull requests are welcome. It will be actively maintained with ongoing improvements to gameplay, content administration, tests, and documentation.

## 技术栈 / Tech Stack

- 运行平台：**微信小游戏**（原生，appid `wx199a1710156d3471`，libVersion 3.15.2）
- 语言：**TypeScript**（严格模式）
- 渲染：Canvas 2D 手绘（无引擎依赖，体积小、加载快）
- 存档：`wx.setStorageSync` / `localStorage` 自动适配

- Platform: **WeChat Mini Game** (native, AppID `wx199a1710156d3471`, libVersion 3.15.2)
- Language: **TypeScript** with strict mode
- Rendering: Canvas 2D, with no game-engine dependency
- Saves: automatic adaptation between `wx.setStorageSync` and `localStorage`

> 任务文档原始要求为 Cocos Creator 4.x，但当前工程为原生微信小游戏工程、本机无 Cocos 编辑器无法本地闭环验证，经确认改为「原生微信小游戏 + TypeScript」。详见 `plans/20260618_任务1_喵喵机甲_微信小游戏MVP工程.md`。
>
> The original brief requested Cocos Creator 4.x. This repository uses native WeChat Mini Game APIs and TypeScript so it can be built and verified locally without a Cocos installation.

## 目录结构 / Project Structure

```
catRobot/
├─ game.js                 # Mini Game entry / 微信小游戏入口
├─ game.json               # Runtime configuration / 运行时配置
├─ project.config.json     # WeChat Developer Tools config / 开发者工具配置
├─ tsconfig.json           # src → dist TypeScript config / 编译配置
├─ package.json            # Scripts: build / typecheck / test
├─ src/                    # TypeScript source / 源码
│  ├─ engine/              # Platform abstraction / 平台抽象
│  ├─ core/                # Game and save services / 游戏与存档服务
│  ├─ data/                # Mech, enemy, stage, and upgrade data / 配置表
│  ├─ player/              # PlayerMecha
│  ├─ enemy/               # EnemyMouse
│  ├─ battle/              # BattleManager
│  ├─ ui/                  # MainUI / BattleUI / ResultUI / UIWidgets
│  └─ main.ts              # 引导入口
├─ test/                   # Node unit and integration tests
├─ dist/                   # Generated build output / 自动生成，勿手改
├─ plans/                  # Implementation plans / 实现方案
├─ Walkthroughes/          # Delivery notes / 成果说明
├─ server/                 # NestJS + Prisma content API / 内容管理服务
└─ admin/apps/web-antd/    # Vue 3 content admin / 内容管理后台
```

## 开发命令 / Development Commands

```bash
npm install              # Install dependencies / 安装依赖
npm run build            # Compile src → dist / 编译
npm run typecheck        # Type check only / 仅类型检查
npm test                 # Compile and run tests / 编译并运行测试
```

## 内容管理后台 / Content Administration

后台由 NestJS 服务（`3100`）和 Vue 管理端（`5602`）组成。

The admin console consists of a NestJS API service on `3100` and a Vue web application on `5602`.

```bash
copy server\.env.example server\.env  # 填写 DATABASE_URL 和 JWT_SECRET
npm --prefix server run start:dev
pnpm.cmd --dir admin/apps/web-antd dev
```

资源页会并发显示缩略图。远程 MySQL 的连接串建议保留
`connection_limit=4&pool_timeout=15`；不要把真实 `server/.env` 提交到仓库。

The resource list loads thumbnails concurrently. For remote MySQL, keep
`connection_limit=4&pool_timeout=15` in the connection string. Never commit a real `server/.env` file.

### 资源预览故障排查 / Resource Preview Troubleshooting

- 控制台出现 `P2024`：确认 3100 服务已重启并使用上述连接池配置。
- `Invalid资源`：刷新动作编排页，后台会重新读取资源摘要。
- 旧缩略图文件丢失：后端会从原图自动补建 WebP；原图不存在时返回 404。
- 网络面板出现旧的 `CONNECTION_REFUSED`：清空控制台并刷新页面；动作预览已对失败请求去重，不会因切帧循环请求。

- `P2024` in the console: restart the API service and confirm the pool settings above are active.
- `Invalid资源`: refresh the animation editor so the resource summary is loaded again.
- Missing legacy thumbnail: the server rebuilds a WebP thumbnail from the original image; a missing original returns `404`.
- Stale `CONNECTION_REFUSED`: clear the console and refresh. Animation previews deduplicate failed requests and do not retry on every frame.

## 在微信开发者工具中运行 / Run in WeChat Developer Tools

1. `npm run build` 生成 `dist/`
2. 打开微信开发者工具，导入项目，目录指向本仓库根目录
3. appid 已配置在 `project.config.json`（`wx199a1710156d3471`），或切换为自己的测试号
4. 编译预览：进入主界面 → 开始战斗 → WASD/触摸移动 → 自动攻击 → 结算 → 返回 → 升级

1. Run `npm run build` to generate `dist/`.
2. Open WeChat Developer Tools and import this repository root.
3. The AppID is configured in `project.config.json`; replace it with your own test AppID if needed.
4. Compile and preview: main screen → battle → WASD/touch movement → auto attack → settlement → upgrade.

## 玩法 / Gameplay

- 主界面显示机甲信息（名称/等级/战力/金币/零件）与升级消耗
- 点击「开始战斗」进入训练场 1-1，4 只机械鼠
- 玩家自动攻击范围内最近敌人；敌人接触玩家造成持续伤害
- 全灭敌人 → 胜利结算 +50 金币 +5 零件；玩家阵亡 → 失败
- 返回主界面后消耗资源升级（公式：金币=等级×50，零件=等级×5），战力随等级成长

- The main screen shows mech information and upgrade costs.
- Start Training Ground 1-1 to face four mechanical mice.
- The player auto-attacks nearby enemies; contact deals continuous damage.
- Defeating all enemies grants coins and parts; defeat returns the player to the main screen.
- Spend resources to upgrade the mech: coins = level × 50, parts = level × 5.

## 验证 / Verification

- TypeScript strict-mode type checking.
- Unit and integration tests covering upgrades, saves, battles, rewards, movement, and UI interaction.
- Production builds for the game, API service, and content administration console.

> 微信开发者工具或真实设备预览需要在本地完成。WeChat Developer Tools or real-device verification must be completed locally.

## 后续扩展方向 / Roadmap

更多机甲 / 敌人 / 关卡（改 `src/data/*.ts` 配置即可）；技能系统、装备系统、剧情；微信登录、云存档、排行榜、好友助战。

Future directions include more mechs, enemies, and stages; expanded skills, equipment, and story content; WeChat login, cloud saves, rankings, and social assistance.
