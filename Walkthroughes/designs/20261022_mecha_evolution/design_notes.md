# 五阶原创猫机甲设计参考

## 图像与状态

- 生成方式：内置 `image_gen`，不是CLI或外部付费建模服务。
- 保存图：`five_tiers_concept.png`；原始生成文件保留在 Codex generated_images 目录。
- 参考输入：项目已有 `tmp/cat3d-armor-20261022/before/bare_model.png`，仅用于灰虎斑猫、白口鼻、青绿眼、猫耳和尾巴的身份。
- 未上传任何付费模型、贴图或付费源文件。造型为原创方向，采用“等级提升带来整体覆盖和结构升级”的设计原则。
- 这是建模参考图，**不是游戏截图，也不是已完成可旋转、可换装或可驱动的三维模型**。
- 图像目检：五个等级标签齐全、主体完整；低阶露出腹部和大腿，高阶闭合躯干、髋腿、肩臂与脚部，猫脸与耳形仍可辨认。
- 后续建模应降低细碎装饰密度，保证现有游戏比例下的轮廓可读；实际覆盖率尚未测量。

## 参考资源的用途

- [Synty POLYGON Mech Pack](https://syntystore.com/products/polygon-mech-pack)：仅研究成套轮廓、模块划分和武器空间；不购买、不导入其资源。
- [Quaternius Animated Mech](https://quaternius.com/packs/animatedmech.html)：作者公开CC0、4个完整带动画机甲；可作为真实敌方机甲候选，不能误称为猫专用模块甲。
- [Kenney Sci-Fi UI](https://kenney.nl/assets/ui-pack-sci-fi)：CC0界面素材候选；不是包含本游戏业务的完整HUD。
- [Godot三维导入](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html)：使用成熟GLB/glTF导入流程，模型质量由资产制作决定。
- [BoneAttachment3D](https://docs.godotengine.org/en/stable/classes/class_boneattachment3d.html) 与 [AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html)：分别复用刚性挂接和动画混合能力；柔性部分仍须正确蒙皮。

## 最终生成提示词

以下为本次内置工具使用的英文提示词；生成时附上述项目猫图，非透明背景。

Create an ORIGINAL polished stylized 3D game character concept sheet for a commercial Godot action RPG. Wide landscape composition, five equally sized panels showing the SAME upright anthropomorphic gray tabby CAT hero, full body, identical relaxed three-quarter front standing pose, same camera and scale, feet aligned. Use the attached image ONLY to preserve cat identity: gray tabby fur, white muzzle, bright cyan-green eyes, triangular ears, slim curved tail. Improve anatomy, appealing face, athletic proportions and material quality greatly; do not preserve its primitive limbs or gun. The hero is upright and confident, shoulders relaxed, arms slightly out so armor is visible; no held weapons. Five visibly distinct progressive MECHA armor tiers, inspired only by the general idea of mythic armor evolution, NOT any existing franchise character or specific armor. Panel 1 BLACK IRON: light practical exoskeleton, substantial chest breastplate, forearm guards and armored boots, about 25% coverage, graphite iron. Panel 2 BRONZE: connected chest/back frame, shoulders, bracers and greaves, about 45% coverage, warm aged bronze. Panel 3 SILVER: cohesive torso shell, articulated waist/hip and thigh armor, complete arms and shins, cat-ear shaped open-face helmet, about 65% coverage, cool silver steel. Panel 4 GOLD: complete heroic articulated armor, chest/back/shoulders/arms/hands/hips/legs/feet integrated into a beautiful unified suit, about 85% coverage, rich gold with restrained blue energy accents. Panel 5 STELLAR: nearly complete premium heavy cat mecha with sophisticated layered full-body armor, clear mechanical joint articulation, open-face or transparent face protection showing the recognizable cat face, protective cat ears, articulated tail sheath and restrained compact dorsal thrusters, about 95% coverage, pearl metal and deep midnight blue with refined cyan energy seams. Coverage, engineering, volume, silhouette and craftsmanship MUST visibly increase each tier, not merely recoloring the same plates. High tiers should look like a real full mecha suit with larger meaningful surfaces. Preserve distinct cat silhouette and face in every tier. Practical compact sci-fi proportions suitable for top-down game play, no huge wings or oversized spikes, no floating disconnected plates, no random jewelry. Premium original low-to-medium poly stylized game art with beautiful sculpted bevels and readable PBR metal, physically plausible joints and weapon handling clearance. Dark warm neutral studio backdrop, consistent soft cinematic lighting, very clear side-by-side comparison. Elegant concise Chinese labels under panels: 黑铁, 青铜, 白银, 黄金, 星辰. Small bottom caption exactly: 原创机甲设计参考 · 非游戏实机画面. The image is an art direction reference, NOT a screenshot of a game. All designs original.
