# 免费商用 3D 资源选型与两个真实单体验证

核实日期：2026-10-22。实际资源仅限免费、可商用；付费资源只能作为外观参考，不作为交付依赖。

## 本次实际下载与结构检查

| 文件 | 大小 | 网格/骨骼 | 三角形 | 动画 | 依赖 |
| --- | ---: | --- | ---: | ---: | --- |
| `models/Mike.gltf` | 4,423,046 B | 45 节点、1 mesh、1 skin、43 joints | 6,062 | 18 | buffer 与 2048×2048 PNG 均嵌入 |
| `models/Rat.glb` | 550,764 B | 45 节点、1 mesh/2 primitives、1 skin、31 joints | 4,004 | 6 | GLB buffer 嵌入，无贴图，Grey/Pink 材质 |

`model-probe.json` 保存完整节点名称、动画名称/时长、原始下载 URL、网格与依赖检查结果。
检查通过：glTF/GLB 可解析、声明 buffer 长度匹配、bufferView/accessor 不越界、动画目标节点与 skin joint 引用有效、两文件均无外链依赖。
尚未验证：Godot 实际导入、渲染、动画插值/变形、根运动、碰撞、正式战斗接入、帧率。结构 PASS 不等于这些项目已通过。

## Mike：原作者 CC0 完整机甲

- 作者：Quaternius；原始页面：https://quaternius.com/packs/animatedmech.html
- 官方公开下载根目录：https://drive.google.com/drive/folders/1sueV_4CGMpZC8y30mWfgKK9UaT3mkHBX
- Textured/glTF 目录：https://drive.google.com/drive/folders/1NgFuPs8O0dtl5CwSLjlBpgeC10VWYsDu
- 本次 Mike 直链：https://drive.google.com/uc?export=download&id=1XekqFS2x8IRz3W_vYuAvbz0mfDMvD74a
- 原包 License.txt：https://drive.google.com/file/d/1za89GDUfFtTyq8f2uL0_U0Nw_anSzGir/view
- 原样保存许可证：`AnimatedMech-License.original.txt`（364 B，CC0 1.0 Public Domain）。
- 原包有 George、Leela、Mike、Stan 四个完整机甲，各自附动画；不是现成猫专用模块盔甲。
- Mike 实际动作：Dance、Death、Hello、HitRecieve_1、HitRecieve_2、Idle、Jump、Kick、No、Pickup、Punch、Run、Run_Holding、Shoot、SwordSlash、Walk、Walk_Holding、Yes。
- Stan 可选直链：https://drive.google.com/uc?export=download&id=1Wkj9SVzI3SMD-leUFWeREo0PfudxmG8Z
- Stan 仅做 HEAD：HTTP 200、3,787,080 B；未下载。
- George 可选直链：https://drive.google.com/uc?export=download&id=1-LVJXIGatBYD9ldy_BgCvr-rcpWss_wW
- George 仅做 HEAD：HTTP 200、5,152,038 B；未下载。

## Rat：原作者 CC0 单体敌人

- 作者发布页：https://poly.pizza/m/iltq5bVNaV
- 原作者同系列：https://quaternius.itch.io/animated-easy-enemies
- 单体直链：https://static.poly.pizza/64cb7150-8031-44ab-a0c9-e1529a572b23.glb
- 原作者公开页面标 CC0；详细证据保存在 `Rat-license-source.md`，GLB 本身未附独立许可文本。
- 实际动作：RatArmature|Rat_Attack、RatArmature|Rat_Death、RatArmature|Rat_Idle、RatArmature|Rat_Jump、RatArmature|Rat_Run、RatArmature|Rat_Walk。
- 没有单独受击动作；不要用空片段冒充已有动作。可在接入时明确采用短促材质闪烁或补作动画。

## 免费猫与五阶装甲的可行组合

- 免费双足猫：https://alphacentauristudio.itch.io/free-low-poly-rigged-cats
- 原作者商用声明：https://www.reddit.com/r/itchio/comments/1nq9ltt/ive_created_a_free_cats_asset_pack_lowpoly_and/
- 免费内容：两只已绑定骨架的基础猫、FBX、1024 贴图；RAR 1.7 MB。没有下载模型包。
- 作者允许个人与商业项目，禁止把原资源再分发；不是 CC0。应私有保存原资源，不公开作为素材包交付。
- 免费版没有承诺动作、职业附件、表情、Blend 源文件；作者称已用人形动画测试，但未在本项目验证。
- 已看官方图，属于极简卡通底模，不能直接承诺达到最终主角品质；必须调整脸部、比例、材质并接现有 UAL 动作库。
- 机甲选择真实完整模型做离线美术适配：拆分胸肩/腰胯/四肢结构、改变猫比例、处理耳尾、蒙皮与动作穿插；不能改回代码生成薄护片。
- 五阶应围绕同一只猫与同一机械造型逐阶扩大覆盖：轻装→胸背/前臂→肩腰腿甲→躯干四肢全包→完整外骨骼；每阶要有实体厚度与不同轮廓。
- 没有查到免费商用且可直接套用的“猫＋五阶装甲”成品。已生成概念图只能指导制作，不能代替可动画的 3D 模型。

## 不应误选的资源

- Fantasy Outfits：https://quaternius.com/packs/modularcharacteroutfitsfantasy.html
- 免费 Standard 官方范围图：https://quaternius.com/assets/images/fullres/modularcharacteroutfitsfantasy/standard.jpg
- 图明确免费内容是 Peasant/Ranger 男女与颜色变体，CC0；不能把全部 12 套/62 分件归入免费版，也不能把农民/游侠衣服当最终科幻甲。
- Standard ZIP 280 MB 未下载，精确分件清单尚未原包核验；只能作为换装技术参考。
- 可选免费粗粒度模块角色：https://quaternius.com/packs/ultimatemodularcharacters.html
- 该包是 CC0，11 角色、24 动画，每角色 4 个交换模型；仍是人形角色，不能冒称猫专用盔甲系统。

## 最小下一步验证

1. 在独立临时 Godot 项目导入 Mike 与 Rat；保留现有 2D 地图与正式玩法代码。
2. 固定同一镜头、尺寸、灯光，播放 Rat 的 Idle/Run/Attack/Death 与 Mike 的 Idle/Walk/Punch/HitRecieve_1/Death。
3. 检查贴图、落脚、朝向、动画循环、受击/死亡结束行为与侧背面穿插，再把结果接入角色视觉层。
4. 至少保留一段实际运行录屏；动作存在与文件可解析不代表观感或正式战斗验收通过。
