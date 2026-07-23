# 喵喵机甲：星核觉醒 — 微信小游戏 MVP

竖屏 2D 轻量 RPG 微信小游戏原型。玩家驾驶「橘猫重甲」机甲，在训练场击败机械鼠，获取金币与零件，升级机甲提升战力，数据本地持久化。

## 技术栈

- 运行平台：**微信小游戏**（原生，appid `wx199a1710156d3471`，libVersion 3.15.2）
- 语言：**TypeScript**（严格模式）
- 渲染：Canvas 2D 手绘（无引擎依赖，体积小、加载快）
- 存档：`wx.setStorageSync` / `localStorage` 自动适配

> 任务文档原始要求为 Cocos Creator 4.x，但当前工程为原生微信小游戏工程、本机无 Cocos 编辑器无法本地闭环验证，经确认改为「原生微信小游戏 + TypeScript」。详见 `plans/20260618_任务1_喵喵机甲_微信小游戏MVP工程.md`。

## 目录结构

```
catRobot/
├─ game.js                 # 微信小游戏入口 → require('./dist/main')
├─ game.json               # 运行时配置（竖屏 portrait）
├─ project.config.json     # 微信开发者工具项目配置
├─ tsconfig.json           # src → dist 编译配置（CommonJS）
├─ package.json            # 脚本：build / typecheck / test
├─ src/                    # TypeScript 源码
│  ├─ engine/              # 平台抽象（IContext/Input/Mock/WxGame）
│  ├─ core/                # GameManager / SaveManager / EventManager
│  ├─ data/                # 配置表（机甲/敌人/关卡/升级）+ PlayerData
│  ├─ player/              # PlayerMecha
│  ├─ enemy/               # EnemyMouse
│  ├─ battle/              # BattleManager
│  ├─ ui/                  # MainUI / BattleUI / ResultUI / UIWidgets
│  └─ main.ts              # 引导入口
├─ test/                   # Node 单元测试（392 项，全绿）
├─ dist/                   # 编译产物（tsc 输出，自动生成，勿手改）
├─ plans/                  # 实现方案文档
├─ Walkthroughes/          # 成果说明文档
├─ server/                 # NestJS 内容管理服务 + Prisma
└─ admin/apps/web-antd/    # Vue 3 内容管理后台
```

## 开发命令

```bash
npm install              # 安装 typescript + @types/node
npm run build            # 编译 src → dist
npm run typecheck        # 仅类型检查（不产出）
npm test                 # 编译 + 运行 392 项测试
```

## 内容管理后台

后台由 NestJS 服务（`3100`）和 Vue 管理端（`5602`）组成。

```bash
copy server\.env.example server\.env  # 填写 DATABASE_URL 和 JWT_SECRET
npm --prefix server run start:dev
pnpm.cmd --dir admin/apps/web-antd dev
```

资源页会并发显示缩略图。远程 MySQL 的连接串建议保留
`connection_limit=4&pool_timeout=15`；不要把真实 `server/.env` 提交到仓库。

### 资源预览故障排查

- 控制台出现 `P2024`：确认 3100 服务已重启并使用上述连接池配置。
- `Invalid资源`：刷新动作编排页，后台会重新读取资源摘要。
- 旧缩略图文件丢失：后端会从原图自动补建 WebP；原图不存在时返回 404。
- 网络面板出现旧的 `CONNECTION_REFUSED`：清空控制台并刷新页面；动作预览已对失败请求去重，不会因切帧循环请求。

## 在微信开发者工具中运行

1. `npm run build` 生成 `dist/`
2. 打开微信开发者工具，导入项目，目录指向本仓库根目录
3. appid 已配置在 `project.config.json`（`wx199a1710156d3471`），或切换为自己的测试号
4. 编译预览：进入主界面 → 开始战斗 → WASD/触摸移动 → 自动攻击 → 结算 → 返回 → 升级

## 玩法

- 主界面显示机甲信息（名称/等级/战力/金币/零件）与升级消耗
- 点击「开始战斗」进入训练场 1-1，4 只机械鼠
- 玩家自动攻击范围内最近敌人；敌人接触玩家造成持续伤害
- 全灭敌人 → 胜利结算 +50 金币 +5 零件；玩家阵亡 → 失败
- 返回主界面后消耗资源升级（公式：金币=等级×50，零件=等级×5），战力随等级成长

## 验证

- TypeScript 严格模式类型检查：通过
- 392 项测试覆盖升级/存档/战斗胜负/奖励/移动/UI 命中：全绿
- 18 个编译产物模块 CommonJS require 加载：通过

> 因本机无微信开发者工具 GUI，实际设备预览需用户在开发者工具中完成；代码层面已具备完整构建条件。

## 后续扩展方向

更多机甲 / 敌人 / 关卡（改 `src/data/*.ts` 配置即可）；技能系统、装备系统、剧情；微信登录、云存档、排行榜、好友助战。
