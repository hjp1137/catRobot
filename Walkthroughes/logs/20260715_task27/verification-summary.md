# 任务27验证摘要

验证日期：2026-07-15

## 根工程
- `npm run typecheck`：通过
- `npm run build`：通过
- `npm test`：506/506 通过
- `npm run check:art`：通过，Missing Files 0，Checksum Mismatch 0，Dimension Mismatch 0
- `npm run check:content`：通过
- `npm run check:animation`：通过
- `npm run check:stage`：通过，R000007 保持旧关卡逻辑回退
- `npm run check:progression`：通过，R000007 输出 LEGACY_FALLBACK 且不启用新奖励

## Nest 后端
- `npm run typecheck`：通过
- `npm run build`：通过
- `npm test`：43/43 通过
- `npm run test:e2e`：1/1 通过
- `npm run content:db:generate`：Prisma Client 6.19.0 生成成功
- `npm run content:db:migrate`：6 个迁移，无待执行迁移
- `npm run content:db:status`：远程 MySQL schema up to date
- 最终健康检查：`GET /api/health` 返回 `{"ok":true}`

## 管理端
- `pnpm typecheck`：通过
- `pnpm build`：通过
- `pnpm test`：37/37 通过

## 浏览器GUI
- 草稿失败后切换正式：`STAGE_FAILED -> LEGACY_FALLBACK`，无草稿波次泄漏
- 正式停留后返回草稿：加载完成为 `READY`
- 三星模拟：3 个目标完成，显示首通/常规/首次三星/目标奖励及训练场解锁
- 失败模拟：0 星、无奖励、无解锁
- 保存后 rowVersion：18
- 刷新和 Nest 重启后：目标、奖励、解锁配置均从远程 MySQL 恢复
- 截图：20 张，位于 `Walkthroughes/screenshots/20260715_task27/`

## 最终代码审查收口
- 发布文件写入后数据库失败：数据库事务回滚并恢复整组正式快照及新 Release 资源文件
- 发布进程崩溃/断电：写文件前持久化 journal，Nest 启动时恢复未提交发布或确认已提交发布
- 目标概率奖励全 miss：领取尝试仍永久记账，不允许重复掷骰
- stageRunId：取消200条截断，保持持久 at-most-once
- 正式存档失败：回滚内存奖励/进度并显示 `save-failed`，临时档保留待恢复
- 星级解锁：`requiredStars` 必须为1—3整数
