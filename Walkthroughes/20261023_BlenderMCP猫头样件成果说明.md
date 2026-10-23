# Blender MCP 接入与猫头样件成果说明

日期：2026-10-23。范围：本地 Blender MCP、技能筛选与单个无装备猫头样件。

## 当前结论

- 本地 MCP 已通过真实调用验证，Codex 工具已在本聊天热加载；Blender 恢复后的会话 PID 为 26876，原生状态读取正常。
- 独立源已保存为 [cat_head_study.blend](E:/dev-cache/catRobot-blender-mcp-20261023/cat_head_study.blend)。保留原版、样件与来源笼，可在 DCC 中继续编辑。
- 根代理已看过正面、斜面与侧面，旧粗眼贴已换为真眼球与连续眼眶，鼻梁拉扯和侧面浮鼻已处理。整体仍是简单基础猫头，尚未获得用户美术确认。
- 12 张最终对照图已完成同相机、同灯光核对；审阅页六种切换、12 图解码与 720px 布局检查通过，浏览器错误为空。[打开审阅页](D:/projects/hjp/catRobot/Walkthroughes/screenshots/20261023_blender_mcp_head/review.html)。

## 本地 MCP 的已验证事实

- 项目 `.codex/config.toml` 已启用 5 个 Blender 本地工具，保留其他 MCP 配置。根代理已通过原生 `mcp__blender` 实际调用 `get_addon_status`、`get_scene_info`、`execute_blender_code` 与 `look`。
- Blender 4.5.14 LTS；addon 1.8；protocol 14；稳定发行包 wheel 2.2.2；MCP SDK 1.30。
- 本地端点为 `127.0.0.1:9876`，`telemetry=false`；Poly Haven、Sketchfab、Poly Pizza 与全部在线生成集成关闭。
- 旧 Git-main 路径因缺少 `config.py` 导致状态读取失败；已改用稳定 wheel，当前状态读取通过。旧失败不代表恢复后的最终会话状态。
- 隔离环境、技能、源工程及本轮记录放在 `E:/dev-cache/catRobot-blender-mcp-20261023/`。

状态记录：[addon_status_stable.json](E:/dev-cache/catRobot-blender-mcp-20261023/addon_status_stable.json)。恢复后的原生状态实调以本聊天根代理记录为准。

## 猫头采用的实现与几何证据

- 已弃用的 v1 布尔开眼产生额外第二洞，v2 径向开眼拉坏鼻梁；最终 v3 固定 X、Z，只沿 Y 压入杏仁域，避免横向拉扯鼻梁。
- [finish_head.py](D:/projects/hjp/catRobot/tools/blender_mcp_head/finish_head.py) 继续贴合鼻子、鼻孔和 6 个胡须根，并平滑耳缘；本轮没有扩展全身、机甲或武器。
- 最终检查记录中，`AFTER_Skin` 为 120290 顶点、120168 面、1 个连通分量、0 条非流形边；修改器列表为空，网格坐标均有限。
- 来源笼保留 512 点；未发现未打包的 `FILE` 图像资源。检查见 [head_final_inspect.json](E:/dev-cache/catRobot-blender-mcp-20261023/head_final_inspect.json)。
- 最终文件 25,997,146 字节，已通过原生 MCP 保存并重新打开；样件可见、原版与来源笼保留，眼球恢复识别色材质。
- 上述数据只证明本轮检查覆盖的几何与资源状态，不能证明造型获得接受，也不能作为游戏低模或变形拓扑验收。

## 技能采用与许可

- 已隔离下载 [scenario-blender-sculpting](https://github.com/scenario-labs/skills/tree/main/skills/dcc/blender/scenario-blender-sculpting) 和明确要求的背景技能 [scenario-blender-expert](https://github.com/scenario-labs/skills/tree/main/skills/dcc/blender/scenario-blender-expert)。两者标注 MIT，保留 Scenario Inc. 原许可，未全局安装。
- 技能和许可位于 `E:/dev-cache/catRobot-blender-mcp-20261023/skills/`；筛选和版本边界见 [SKILL_DISCOVERY.md](E:/dev-cache/catRobot-blender-mcp-20261023/SKILL_DISCOVERY.md)。
- 适配本地 4.5.14 的 `bx_sculpt.Sculptor` 网格塑形方法已实际导入运行。本轮未使用 `Clay` 的 OpenVDB 路径，真实 `bx_gui` 笔刷没有运行。
- 上游示例面向 Blender 5.2 且多为人头；本轮采用猫头自身比例与地标，并使用本地 4.5.14 渲染实现。实际连接为 ahujasid MCP，不将其表述为 Scenario 插件连接。

## 最终对照与媒体状态

- 识别色：`comparison/{before,after}_{front,three_quarter,profile}.png`；全材质灰模：`clay_comparison/` 下同名 6 图，共 12 张、每张 900×900。
- 原版和样件均已使用 90mm 镜头、对应固定机位与同样 4 盏灯重渲染；新增低位柔光改善下颌可读性。
- [render_final.py](D:/projects/hjp/catRobot/tools/blender_mcp_head/render_final.py) 在实际渲染后记录镜头、位置、旋转、分辨率、引擎、色彩变换与灯光参数。四组实际记录共 12 条已核对，同角度的各参数完全一致；复制图与渲染原图字节一致。[媒体检查](E:/dev-cache/catRobot-blender-mcp-20261023/final_media_checks.json)。
- 实图发现 EEVEE 4.5 的 ViewLayer 材质覆盖未生效，已改成渲染期间逐网格替换材质槽并在结束后恢复；6 张灰模重新渲染，灰模眼球、鼻子和耳内均无识别色。旧错误图不用于交付。
- [导出脚本](D:/projects/hjp/catRobot/tools/export_blender_mcp_head_review.py) 只复制现有 PNG，不重新渲染或转码；12 图与最终源齐全后才生成审阅页，保留原图路径、保存时间和源工程链接。
- [页面模板](D:/projects/hjp/catRobot/tools/blender_mcp_head/review_page.html) 提供三角度和识别色 / 全材质灰模切换，左右固定为原版 / 样件。已导出到 `Walkthroughes/screenshots/20261023_blender_mcp_head/review.html`。
- 实际 Chromium 检查六种切换、12 图解码、当前按钮状态、源文件链接与 720px 无横向溢出，错误列表为空。[浏览器检查](E:/dev-cache/catRobot-blender-mcp-20261023/browser_check.json)。主代理查看实际页面截图及三角度形体；美术确认仍由用户判断。

## 后续打开方法

在项目根目录的 PowerShell 中运行已有 [start.ps1](D:/projects/hjp/catRobot/tools/blender_mcp/start.ps1)：

```powershell
.\tools\blender_mcp\start.ps1 -ScenePath "E:/dev-cache/catRobot-blender-mcp-20261023/cat_head_study.blend"
```

脚本加载任务隔离配置并启动本地 MCP。若 9876 已有监听，它会拒绝重复启动；此时复用现有 Blender 会话。

## 未完成项与交付边界

- 本轮接入、技能应用、单个样件与审阅材料已交付；用户对猫头形体的美术确认仍待完成。
- 毛发、精细表皮、眼材质和最终重拓扑尚未完成。本样件不称成熟精雕或游戏就绪。
- 不替换正式 Godot 模型，不作为游戏低模、UV、最终烘焙、绑定、动画或实机性能验收。原裸猫源保留；未提交、推送或部署。
- 原裸猫源仍为 146,730,831 字节，正式 GLB 49,810,392 字节、正式 Blender 源 64,470,137 字节；大小与修改时间同本轮开始时一致。
