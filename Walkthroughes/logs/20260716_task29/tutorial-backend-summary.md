# 任务29 阶段1A Tutorial后端摘要

## 范围

- 新增MySQL草稿模型、migration、事务API、乐观锁、引用保护与默认草稿。
- 未生成Tutorial Snapshot，未修改发布链路、游戏端或管理端，未执行远程migration，未发布Release。

## RED→GREEN

- RED 1：`tutorials.spec.ts`因Tutorial service/validation不存在而TS2307失败。
- GREEN 1：Flow/Step事务CRUD、图校验、结构化409、删除保护和编排回滚测试8/8通过。
- RED 2：默认草稿模块不存在而TS2307失败。
- GREEN 2：默认草稿幂等测试加入后Tutorial测试9/9通过。
- RED 3：Stage删除仍执行后续写入，未报告Tutorial Step引用。
- GREEN 3：Stage Tutorial引用保护精确测试1/1通过。
- RED 4：Art Key引用查询不返回Tutorial Step。
- GREEN 4：Art Key引用测试返回Flow Step和字段。

## 实现

- Prisma：`content_tutorial_flow`、`content_tutorial_step`、`content_tutorial_step_transition`、`content_feature_unlock_rule`。
- 模型支持rowVersion、enabled、软删除、时间、Step排序、next/skip、Transition、Feature规则及引用索引。
- API：GET/POST tutorials；GET/PUT/DELETE flow；GET/POST steps；PUT/DELETE step；PUT orchestration；GET published。
- `published`固定返回`LEGACY_FALLBACK`骨架，不读取MySQL草稿冒充正式内容。
- 全部写操作使用事务；CAS失败返回`CONTENT_CONFLICT`及local/remote rowVersion；业务写、draft revision和change log同事务。
- Flow删除保护Step/Rule；Step删除保护next/skip/Transition/Rule；Stage和Art Key引用查询包含Tutorial。
- 目标、Stage、Campaign、Art、Feature使用结构化校验错误；UI目标限定在稳定语义目录。

## 默认草稿

- Flow：`tutorial.main.firstJourney`，Campaign：`campaign_main_01`，Stage：`stage_battle_1_1`。
- Art Key：`ui.tutorial.arrow`、`ui.tutorial.move`、`ui.tutorial.skill`、`ui.tutorial.equip`。
- 七步覆盖主线入口、1-1、开战、移动、攻击、奖励、装备；三条Feature规则解锁Campaign、Equipment、Inventory。
- seed存在即跳过，不覆盖人工草稿，不写ContentRelease或正式快照。

## 验证

- 受影响后端：3 suites，27/27通过。
- 后端全量：15 suites，99/99通过。
- `npm --prefix server run typecheck`：通过。
- `npx prisma validate`：通过。
- `npx prisma generate`：成功，Prisma Client 6.19.0，229ms。
- 未执行远程migration、远程seed、真实MySQL持久化或Nest重启回读。

## 规格修复轮

- Flow新增audience、playerCondition、endStepId、allowReplay、priority、skipUnlockFeatures；Step新增中文name和contentVersion。
- Transition和Feature Rule继续独立行，返回rowVersion/deletedAt；migration与mapper同步。
- 编排不再deleteMany硬删重建：按ID新增、rowVersion CAS更新，缺失行软删除并递增版本；整体使用Serializable事务。
- Flow/Step删除的回读、引用检查、CAS和change log均在同一Serializable事务，避免check-then-delete竞态。
- 新增Target/Feature Catalog与`GET /api/content/tutorials/targets|features`；UI/Canvas稳定目录和Stage/Campaign/Art/Feature真实目录统一校验。
- Flow校验Campaign及同Flow start/end；Step校验同Flow next/skip；Rule校验Step、Feature和Stage。
- Campaign删除反向保护Tutorial Flow；Stage删除和Art Key引用继续包含Tutorial Step。
- 默认草稿扩为19步完整首章链，覆盖欢迎、主线、第一章、1-1详情、移动、攻击、敌人、波次、通关、结算、地图、新节点、背包、装备和完成。
- 跳过只解锁Campaign、Inventory、Equipment安全基础功能；软删默认Flow可按CAS恢复，已有活动Flow保持幂等跳过。
- hardening精确测试8/8通过；Campaign反向保护精确测试1/1通过。
- 修复后后端全量16 suites、107/107通过；随后新增Campaign反向保护用例单独1/1通过。
- 修复后typecheck、Prisma validate和Prisma generate通过，generate耗时305ms。
- 真实MySQL migration、seed和持久化证据按主计划留最终DB阶段，本轮未执行。

## 第二轮规格修复

- `reconcileTutorialRows`查询包含软删行的全量ID；事务内先以rowVersion CAS把Step排序、Transition来源键、Rule Feature键迁入安全临时区，再恢复最终唯一键。
- 排序交换、软删同ID恢复、软删排序占位均不执行重复PK create；现存缺失项保持软删，活动缺失项软删并递增版本。
- 状态型唯一约束fake会真实模拟主键/`flow_id+sort_order`冲突；交换和恢复2/2通过。
- 回滚fake维护事务写集：两条Step已尝试写入后Flow CAS失败，提交集仍为空。
- 新Flow禁止携带不存在的start/end；空Flow的独立Step协议只允许创建单个终态首步，并原子设置start/end；后续结构组装要求使用orchestration。
- Step更新和删除基于完整候选图执行可达性、出口和环校验；启用Flow不会由独立CRUD保存为无效图。
- Target与Feature定义移至`shared/tutorial-catalog`共享包，server只保留数据库目录适配器，不再私有声明静态目录。
- Stage、Campaign、Art反向保护同时覆盖专用引用字段和`target_type+target_id`；Flow与Step正向引用在Serializable事务内先锁源行再校验和写入。
- 默认19步分别使用页面、节点、移动、攻击、击敌、清波、通关、结算、奖励、返回、背包和装备真实事件语义，不再统一使用`page.enter/target.click`。
- active默认Flow每次seed会补建缺失Step/Rule、恢复软删稳定ID，同时保留已有活动行的人工字段；完整active数据不递增draft revision。
- 第二轮精确Tutorial测试20/20、引用回归60/60通过；最终后端全量16 suites、111/111通过。
- 最终server typecheck和Prisma validate通过；本轮Prisma generate成功，耗时332ms。
- 并发证据为状态型事务fake；远程MySQL双连接CAS/锁顺序验证仍明确留最终DB阶段。

## 第三轮规格修复

- 新建零Step Flow强制`enabled=false`，显式启用返回`TUTORIAL_EMPTY_FLOW_CANNOT_ENABLE`；新建时仍禁止不存在的start/end。
- Flow启用或修改enabled、start/end、Campaign、audience、playerCondition时，在Serializable事务内加载完整Step/Transition候选图；启用态要求Step、start、end、终态end、可达路径和无意环全部有效。
- Campaign删除事务首条对Campaign执行`row_version increment:0`锁行，随后回读版本并检查Chapter、Tutorial Flow和Campaign target Step，最终CAS软删；隔离级别Serializable。
- Stage删除同样在Serializable事务首条锁Stage，再查询Progression、Campaign Node和Tutorial专用/target引用；子表删除、Stage软删、draft revision和change log在同一事务。
- reconcile查询固定`orderBy id asc`并二次稳定排序；临时sortOrder从MySQL Int全域按当前全量占用值和payload最终值动态挑选未占用值，不依赖固定保留区。
- Transition临时fromStepId和Rule临时featureId同样基于当前与目标占用动态分配；旧临时值不会冲突。
- 软删同ID恢复使用Serializable事务内数据库当前rowVersion，公开编排payload无需暴露隐藏版本；活动行仍严格校验客户端rowVersion。
- `TutorialManager`真实导入`shared/tutorial-catalog/index.js`及其TS声明，仅暴露只读共享目录契约，不改变legacy状态机。
- 第三轮RED覆盖四项Tutorial约束、Campaign/Stage锁顺序和运行端共享目录消费；均完成GREEN。
- Server最终全量16 suites、117/117通过；server typecheck与Prisma validate通过。
- Root build和typecheck通过；Tutorial相关运行端测试11/11通过，其中共享目录专项1/1通过。
- 远程MySQL migration、seed及双连接交错验证仍留最终DB阶段，本轮未执行任何远程写入。

## 第四轮质量收口

- `saveOrchestration`把Flow回读、源引用锁、起始CAS锁、图校验、引用校验、三类行reconcile、最终CAS和change log统一放入单个Serializable事务。
- 源锁顺序固定为Campaign、Stage、Art，并按ID排序；Flow起始CAS锁失败时不执行编排行写入，最终CAS失败时事务整体回滚。
- Flow、Step、Transition和Feature Rule统一使用camelCase响应mapper；Flow补齐contentVersion、createdAt、updatedAt，并区分create默认值与patch字段语义。
- 新增运行时输入校验，非法数字、布尔、JSON、必填字段和rowVersion返回结构化400；编排兼容新建项`rowVersion: 0`及可省略Transition/Rule数组。
- reconcile只处理活动行、同ID恢复行和占用本次目标唯一键的软删行，不再扰动无关软删历史。
- reconcile、输入校验和事务锁拆出独立模块；共享Tutorial目录递归冻结，并加入结构一致性与深冻结标准测试。
- 根工程标准`npm test`已包含`tutorialCatalog.test.ts`，共享目录测试不再依赖专项命令。
- 新增质量测试8/8通过；Tutorial精确回归3 suites、32/32通过；关联引用回归6 suites、83/83通过。
- Server最终全量17 suites、125/125通过；server typecheck与Prisma validate通过。
- Root标准测试521/521、typecheck和build通过。
- 本轮仍未执行远程migration、远程seed、真实MySQL写入或发布。

## 最终锁序与输入契约收口

- 正式`PUT /content/tutorials/:flowId/orchestration`改为完整`flow`对象加Steps、Transitions和Unlock Rules；Flow ID与路径不一致时在事务前拒绝。
- 完整Flow必须显式携带Campaign、start/end Step引用字段；完整Step必须显式携带Campaign、Stage和Avatar Art引用字段，禁止从首次Flow回读继承锁资源。
- 编排事务从纯内存payload提取引用，首个数据库操作按Campaign、Stage、Art及各自ID排序锁源；随后才允许Flow回读与Flow CAS。
- updateFlow、createStep、updateStep同样保持资源锁先于Flow回读；精确测试记录第一次数据库事件并断言锁序。
- GET Flow新增嵌套`flow`完整模型，同时保留原有顶层字段；Steps统一返回`triggerConfig`、`completionConfig`、Campaign和force字段，可直接构造正式编排PUT。
- Step模型及本地migration新增`campaign_id`与`force`持久字段；未执行migration，仅生成并验证迁移文件。
- 输入校验覆盖Flow、Step、Transition和Rule全部持久字段的类型、长度、JSON、整数、布尔、版本与引用ID；title/body等必填字段缺失、数字型引用及重复ID均在Prisma前返回结构化400。
- 最终质量精确测试29/29；Tutorial回归3 suites、52/52；关联回归6 suites、103/103。
- 最终Server全量17 suites、145/145；server typecheck、Prisma validate及Prisma Client generate通过。
- 最终Root标准测试521/521、typecheck和build通过。
- 未执行远程migration、远程seed、真实MySQL写入、服务重启或发布。

## 删除路径最终收口

- removeFlow和removeStep在事务前校验路径ID及rowVersion；空ID、越界格式、undefined、字符串版本和零版本分别返回`TUTORIAL_ID_INVALID`或`TUTORIAL_ROW_VERSION_INVALID`，不进入Prisma。
- removeStep在Serializable事务内统一执行Flow回读、Flow CAS锁、Step回读、Step CAS锁、引用计数和Step软删CAS，固定Flow先于Step。
- 删除顺序测试记录首次数据库事件，验证Flow read、Flow lock、Step read、Step lock顺序，并验证引用计数位于Step锁后、软删CAS前。
- 最终质量测试35/35；Tutorial与关联回归6 suites、110/110。
- 最终Server全量17 suites、152/152；server typecheck和Prisma validate通过。
- 最终Root标准测试521/521、typecheck和build通过；未执行远程写入或发布。
