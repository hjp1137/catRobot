# 任务22 基于VbenVue3 NestJS与MySQL的内容配置管理后台计划

## 1. 当前任务21配置基础

- 已有 `EnemyTemplate`、`BackgroundTheme`、`HeroVisualTemplate`、`StageDefinition`。
- 固定屏 `stage_battle_1_1` 与自由探索 `stage_explore_training_01` 已通过 `LocalContentRepository` 加载。
- 当前主数据源仍是 `src/content/data/*.ts`，本任务新增数据库草稿与发布快照，不重构战斗核心。

## 2. Vben管理端方案

- 在 `admin/apps/web-antd` 建立 Vben Admin 5.x、Vue 3、Vite、TypeScript、Ant Design Vue 管理端。
- 页面覆盖内容总览、敌人、背景、主角、关卡、美术资源、校验与发布。
- 正式登录走 NestJS `/api/auth/login`，不使用 Mock 登录作为正式入口。

## 3. NestJS后端方案

- 在 `server/` 建立 NestJS 11 模块化单体。
- 模块包括 Auth、Dashboard、Enemies、Backgrounds、Heroes、Stages、ArtResources、Validation、Releases、Snapshots、AuditLogs、Health、Prisma。
- API 只通过 REST 暴露，前端和小游戏都不直接连接 MySQL。

## 4. MySQL 8.0.33兼容方案

- 使用 Prisma MySQL provider，所有新增表使用 `content_` 前缀。
- 迁移只使用 `prisma migrate deploy`，不执行 reset、force reset、DROP DATABASE。
- 任务开始和成果说明记录 `SELECT VERSION()`、`SELECT DATABASE()`、字符集和排序规则检查要求。

## 5. 数据表设计

- 建立管理员、敌人、背景、主角、关卡、波次、波次敌人组、探索刷新组、关卡目标、美术资源、发布、快照、系统状态、操作日志表。
- 内容表包含软删除、启用状态、`content_version` 与 `row_version`。
- 关卡子表通过服务层事务保存，避免孤立数据。

## 6. migration安全方案

- 提交 Prisma schema 与 migration SQL。
- 迁移前提供状态检查命令，不修改已有业务表。
- `.env` 不提交，`.env.example` 只保留占位连接串。

## 7. 草稿与发布机制

- MySQL 内容表即草稿源。
- 新增、编辑、删除、启停内容后递增 `draft_revision`，设置 `draft_dirty=true`，写入 `content_change_log`。
- 发布前必须完整校验，失败不创建成功版本，不覆盖旧快照。

## 8. 快照生成方案

- 发布成功生成稳定排序 JSON 和 TS 快照。
- 输出 `content-store/published/content.snapshot.json` 与 `src/content/generated/contentSnapshot.ts`。
- checksum 基于不含 checksum 字段的稳定 JSON 计算。

## 9. 游戏接入方案

- `LocalContentRepository` 优先读取 `CONTENT_SNAPSHOT`。
- 无快照回退任务21内置默认配置；非法快照使 `check:content` 失败。
- 调试探针输出 `repositorySource`、release、checksum 与 active stage。

## 10. 页面规划

- 内容总览展示数量、草稿状态、当前发布版本和快捷操作。
- 内容管理页提供搜索、筛选、分页、排序、CRUD、复制、启停、引用查看。
- Art Key 使用公共选择器，不允许输入任意物理路径。

## 11. API规划

- API 路径以 `/api/content/*` 为主。
- 内容模块提供 list、detail、create、update、clone、enable、disable、delete、references。
- 发布模块提供 validate、publish、publish-status、releases、restore、snapshot。

## 12. 测试计划

- 根项目执行 `typecheck`、`build`、`check:art`、`check:content`、`npm test`。
- 后端执行 typecheck、build、unit/e2e 测试；没有测试库时只运行非破坏性测试并说明。
- 管理端执行 install、lint、typecheck、build、test，按真实脚本记录。

## 13. 风险点

- 当前未提供远程 MySQL 凭据，禁止写入真实密码；若无凭据则迁移只能准备，不能实连生产库。
- Vben 完整工程体量大，需保持管理端与小游戏隔离，避免根项目包管理器被强行迁移。
- 后台配置只影响发布快照，不直接改战斗、渲染器业务逻辑。

## 14. 不处理范围

- 不做图片上传、裁剪、动作帧编辑器、地图拖拽编辑器、CDN、热更新、复杂权限、多租户、微服务。
- 不改战斗平衡，不迁移全部历史章节，不强制微信开发者工具 GUI 自动化。
