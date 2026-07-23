# 任务29 阶段0 RED→GREEN 摘要

## 状态

- A/B/C 最小实现与自动化验证完成；未修改 Tutorial 主体，未发布 Release，未提交 Git，未创建 GUI 截图。
- `map.trainingGround.floor` 保持原 Art Key；有效发布物理版本可从无效/缺失草稿版本后回退显示，不再误报 Missing。
- `R000007` 未声明 Campaign Snapshot，`check:campaign` 继续输出 `LEGACY_FALLBACK`。

## RED

- `server: npm test -- --runInBand art-resource-versions.spec.ts -t "uses the valid published chapter background"`：1失败；实际 `missing/mysql-draft-version`，预期有效发布版本。
- `server: npm test -- --runInBand content-validation.spec.ts -t "Campaign chapter art validation"`：2失败；无版本、Invalid版本均未产生背景错误。
- `node --test --experimental-strip-types test/campaignAssetCheck.test.ts`：4失败；脚本忽略夹具根目录并错误返回0。
- `server: npm test -- --runInBand campaigns.spec.ts -t "clones a chapter|reorders chapters|enables and disables a chapter|updates campaign order"`：3失败、1通过；Chapter三个方法不存在，Campaign排序既有行为有效。
- `admin: pnpm test -- CampaignEditor.test.ts -t "complete chapter"`：1失败；缺Chapter API与页面动作。
- `node --test ... campaign.test.ts`：锁定详情1失败；`lockDetail`为undefined。
- `node --test ... campaignRuntime.test.ts`：真实LOCKED详情1失败；NEWLY_UNLOCKED可进入用例通过。

## GREEN

- 精确A：资源摘要1/1、完整校验2/2、`check:campaign`异常夹具4/4通过。
- 精确B：后端Campaign排序与Chapter clone/reorder/启停4/4，管理端动作1/1通过。
- 精确C：Campaign与CampaignRuntime合计12/12通过。
- 根工程：pretest 4/4，主测试519/519，`npm run typecheck`通过。
- 后端：14 suites、60/60，`npm run typecheck`通过。
- 管理端：15 files、46/46，`pnpm typecheck`通过。
- `npm run check:campaign`通过，确认R000007安全回退。

## 改动文件

- 资源与校验：`server/src/modules/art-resources/art-resources.service.ts`、`server/src/modules/content-validation/campaign-content.validation.ts`、`content-validation.service.ts`、`scripts/check-campaign-assets.cjs`。
- CRUD：`campaigns.service.ts`、`campaigns.controller.ts`、管理端`api/content.ts`、`CampaignChaptersView.vue`。
- 锁定详情：`CampaignProgressService.ts`、`GameManager.ts`、`CampaignMapUI.ts`。
- 测试：`art-resource-versions.spec.ts`、`content-validation.spec.ts`、`campaigns.spec.ts`、`CampaignEditor.test.ts`、`campaignAssetCheck.test.ts`、`campaign.test.ts`、`campaignRuntime.test.ts`、`package.json`。

## 风险与未执行

- 按阶段约束未执行远程MySQL写入式CRUD、浏览器GUI和截图；当前证据为事务/API/UI源码测试与全量回归。
- 未发布新Campaign Snapshot；正式物理文件深校验由声明Campaign的未来Release触发，R000007保持旧流程。
- Chapter重排使用事务内临时负序号避免唯一键交换冲突；仍需后续远程MySQL真实操作验证。

## 规格复核修复（第二轮 RED→GREEN）

- RED后端：8个真实行为用例失败；Campaign/Chapter update未进入事务，启停和删除忽略客户端rowVersion，事务启动失败仍写数据，默认章节无节点时可被误删。
- RED管理端：共享错误映射模块不存在；Campaign/Chapter启停和删除API未发送rowVersion，两页面未统一处理结构化409。
- RED资源：Physical版本缺checksum时摘要仍为physical，Campaign完整校验未报错。
- GREEN后端：Campaign/Chapter update、enable、disable、delete全部用客户端rowVersion做CAS；数据写、draft revision和change log位于同一事务；删除保持软删除。
- GREEN引用保护：Chapter被`Campaign.default_chapter_id`引用时返回`CONTENT_REFERENCE_EXISTS`，不再仅检查地图节点。
- GREEN管理端：新增可执行`campaignMutationErrorMessage`，两页保存、重排、启停、删除统一显示并发冲突刷新提示和引用解除提示；API在POST body或DELETE data中发送rowVersion。
- GREEN资源：DB Physical版本或Campaign引用版本缺checksum均判Invalid/校验失败；正式`check:campaign`继续要求checksum。
- 精确验证：Campaign后端17/17、资源摘要2/2、Campaign背景版本校验3/3、管理端错误映射与接线7/7、根阶段0测试16/16通过；三端typecheck和`check:campaign`通过。
- 新增文件：`admin/apps/web-antd/src/views/content/campaignMutationErrors.ts`及其直接单元测试。

## 最终阶段0修复轮

- RED后端：4个创建事务用例失败；Campaign/Chapter创建未进入事务，change log失败后业务记录仍被保留，事务启动失败也未阻止写入。
- GREEN后端：`createCampaign`和`createChapter`把业务新增、draft revision与change log收敛到同一事务；回滚感知测试确认事务或markDraft失败均不留下业务记录。
- RED管理端：2个可执行错误处理用例失败；只有消息映射，没有负责执行mutation、通知错误与成功后刷新的共享入口。
- GREEN管理端：新增`runCampaignMutation`；Campaign与Chapter页面的保存、重排、启停、删除均通过共享入口执行，拒绝mutation会回调409冲突或引用保护消息且不刷新。
- 精确验证：Campaign后端20/20，管理端共享错误处理与页面接线9/9通过；根、后端、管理端typecheck均通过。
- 未增加依赖，未提交Git，未发布Release，未执行远程写入或GUI截图。

## 质量审查修复轮（六项 RED→GREEN）

- Chapter软删除在同一事务把正数`chapter_no`迁移到同Campaign负数归档区，保留软删除并释放正数唯一键；删除后可创建同序号章节。
- Chapter重排拒绝重复ID、活动章节非完整覆盖、重复或非正数序号；两阶段每次`updateMany.count`必须为1，否则返回结构化400/409并回滚。
- `runCampaignMutation`分离写入与刷新异常；写入成功后刷新失败返回成功，并给出“已保存但刷新失败”的独立提示，避免诱导重复写入。
- `check:campaign`在读取Art资源前校验内容快照的Art releaseId/checksum声明、Art Snapshot releaseId/checksum及稳定checksum。
- Campaign草稿资源校验读取真实PNG/JPEG元数据，校验版本宽高为正、文件与版本尺寸/alpha一致、exact尺寸策略和必要alpha。
- Base Manifest物理回退对真实有效图片现场计算checksum和元数据；无预存checksum不再固定Invalid，缺失、非法或声明不一致仍拒绝。
- LOCKED多入边按前置节点顺序汇总全部未满足节点和星级，不再受连接数组顺序影响；单入边详情兼容原结构。
- RED：后端Chapter归档/重排6项、资源维度4项、Base fallback 1项失败；管理端刷新隔离1项失败；根Art声明链4项、多入边1项失败。
- GREEN：后端相关45/45、管理端相关10/10、根相关14/14通过；根、后端、管理端typecheck通过，正式`check:campaign`保持R000007 `LEGACY_FALLBACK`。
- 未新增依赖，未提交Git，未发布Release，未执行远程写入或GUI截图。

## 最终唯一键区间修复

- RED：占用追踪测试先软删除章节再重排，旧实现的归档号`-1`与首个临时号`-1`碰撞，模拟MySQL唯一键抛出`P2002`。
- GREEN：归档号固定使用`[-1073741824,-1]`，兼容既有负数归档；重排临时号使用`[-2147483648,-1073741825]`，两个区间互不重叠且均在MySQL Int范围内。
- 两个区间各提供1,073,741,824个序号；重排入口显式校验容量，归档区耗尽返回`CAMPAIGN_CHAPTER_ARCHIVE_CAPACITY_EXCEEDED`。
- 行为测试真实追踪同Campaign的`chapter_no`占用并模拟`P2002`，不使用固定成功计数；Campaign后端26/26与server typecheck通过。
- 未提交Git，未执行远程写入或发布。

## 最终并发归档修补

- `removeChapter`在引用检查后、读取归档最小序号前，对所属Campaign执行`row_version increment: 0`的真实UPDATE；MySQL InnoDB会取得该Campaign行写锁，但rowVersion数值不变。
- 同Campaign并发软删除因此串行执行“读取最小归档号、分配、CAS删除、markDraft”，避免两个事务选择相同archiveNo。
- 并发行为测试的事务delegate强制检查Campaign锁先于归档查询和更新；两个并发删除最终得到`-1`、`-2`。
- 归档达到`CHAPTER_ARCHIVE_NO_MIN`时返回`CAMPAIGN_CHAPTER_ARCHIVE_CAPACITY_EXCEEDED`，不执行章节更新。
- 导出纯容量守卫与`CHAPTER_REORDER_TEMP_CAPACITY`；直接验证capacity通过、capacity+1结构化失败，不创建巨型数组。
- RED：并发归档在锁前读取失败，容量守卫未导出；GREEN：Campaign后端29/29与server typecheck通过。
- 未提交Git，未执行远程写入或发布。

## MVCC顺序修补

- 事务外仅按Chapter ID读取`campaign_id`用于定位锁行，不使用该快照做删除判定。
- interactive transaction显式使用`Serializable`、`maxWait: 10000`、`timeout: 20000`；事务内第一条DB操作是Campaign `row_version increment: 0`写锁。
- 获取锁后在同一tx重新读取Chapter、校验rowVersion、统计节点和默认章节引用、读取最小归档号、CAS软删除并执行markDraft。
- 调用序列测试断言写锁为tx首个DB调用，后续全部读取使用tx delegate，且`$transaction`收到`isolationLevel: Serializable`。
- RED：事务外locator未调用，旧实现tx内Chapter读取先于写锁；GREEN：Campaign后端30/30与server typecheck通过。
- 真实远程MySQL并发验证留最终DB阶段；本轮未远程写入、未提交Git、未发布。

## 反模式修复轮

- 有效发布版本回退继续保持顶层`physical`、缩略图和预览可用，同时返回`draftVersionStatus`、`draftWarning`和`fallbackReason`，不再隐藏草稿Missing/Invalid。
- `ArtResourceField`以warning alert显示“草稿版本 Missing/Invalid，当前展示发布版本”，不阻断已发布图片预览。
- `inspectManifestFile`改为结构化`ok/reason`结果；越界路径、读取失败、图片元数据无效及声明不一致均在Invalid摘要的`fallbackReason`中保留明确原因。
- 新增76行`scripts/check-campaign-assets-lib.cjs`纯校验库，由调用方传入root；CLI固定项目根目录调用，不再读取`CAMPAIGN_CHECK_ROOT`。
- Campaign资产测试直接import校验库并传fixture，不再修改进程环境或spawn CLI。
- RED：Server草稿回退/Manifest原因4项、管理端警告1项、CLI环境入口与纯库缺失失败；GREEN：Server资源14/14、管理端1/1、Campaign校验10/10通过。
- 根、Server、管理端typecheck及正式`check:campaign`通过；R000007保持`LEGACY_FALLBACK`。
- 未提交Git，未执行远程写入或发布。
