# Antigravity 2.0 桌面版文件桥接自动监控计划

1. 新增 `ANTIGRAVITY_TASK.md` 作为 Codex 向 Antigravity 2.0 下发任务的唯一入口。
2. 在 Antigravity 2.0 创建每30分钟计划任务（`0,30 * * * *`），仅读取并实施状态为 `PENDING` 或 `RUNNING` 的桥接任务。
3. Antigravity 完成后生成 `ANTIGRAVITY_RESULT.md` 并等待 Codex 独立验收；Codex 每15分钟审核，决定补充实施或推进路线图。
