# 喵喵机甲：星核觉醒 / Mecha Cat: Starcore Awakening

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
