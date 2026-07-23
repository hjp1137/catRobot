# 任务29 Tutorial 运行时验证摘要

## 结论

- 正式内容未声明 Tutorial Snapshot 时走 `LEGACY_FALLBACK`，R000007 行为保持不变。
- 声明、checksum 与结构匹配时启用 `TutorialDirector`，小游戏不读取 MySQL 草稿。
- 首次触发、UI/Canvas 目标、输入限制、跳过、重玩、断点续引和自愈均有自动测试。
- 默认流程为 19 步；功能目录 8 项，步骤解锁与安全跳过共用一个服务。

## 运行时闭环

- `TutorialSnapshotRepository` 负责正式声明与 checksum 门禁。
- `TutorialDirector` 负责触发、等待目标、等待动作、完成、跳过、暂停和销毁。
- `TutorialTargetRegistry` 与生产解析器按语义目标解析 UI/Canvas 逻辑坐标。
- `TutorialInputLimiter` 只放行当前目标，结束、跳过和销毁都会恢复输入。
- `SaveManager` 升级并持久化流程、步骤、解锁、恢复次数与一次性提示队列。
- 已完成业务动作通过现有状态事实跳过，不重发奖励、不重复装备。
- 功能解锁入口立即刷新；一次性提示由首页现有 toast 消费，每条只显示一次。

## TDD 与门禁

- 一次性提示 RED：19 项中 1 项失败，实际 toast 为空。
- 一次性提示 GREEN：19/19。
- 根项目最终：547/547，0 失败。
- `typecheck`、`build`、`check:art/content/animation/stage/progression/campaign/tutorial` 全通过。
- `check:tutorial` 当前输出 `TUTORIAL_LEGACY_FALLBACK: tutorial-snapshot-not-declared`，符合未发布边界。

## 证据

- `tdd-unlock-notice-red.log`
- `tdd-unlock-notice-green.log`
- `final-root-test.log`
- `final-root-check-tutorial.log`

## 独立终审修复

- 修复旧版已完成玩家重复启动及功能入口回锁，旧玩家启动保持IDLE并无提示补齐全部既有功能。
- 修复默认Flow生产事件链，新增章节返回、首件装备目标与当前场景重触发，远程草稿同步migration。
- 小游戏端要求Tutorial Release与Content Release一致，并重算稳定JSON SHA-256，拒绝篡改内容。
- `result.continue`复用真实ResultUI返回按钮边界；RED为undefined，GREEN为真实逻辑坐标。
- 最终独立复核结论：无Critical、无Important。
