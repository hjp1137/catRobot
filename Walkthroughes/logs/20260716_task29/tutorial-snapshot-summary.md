# 任务29 阶段1B Tutorial Snapshot与发布闭环成果说明

## 范围

- 复用SnapshotGeneratorService、ReleasesService、ContentValidationService和现有发布journal。
- 未执行远程migration、seed、真实publish，未生成R000008，未覆盖R000005-R000007正式文件。
- 未实现管理端或游戏Tutorial Director。

## Snapshot

- `buildTutorialSnapshot`仅读取enabled且未软删的Flow、Step、Transition和Feature Rule。
- 数据按Flow ID、Flow内sortOrder和ID稳定排序，使用正式camelCase mapper。
- 构建时执行图校验、Target/Stage/Campaign/Feature/Art引用校验及Missing/Invalid Art阻断。
- 快照包含schemaVersion、releaseId、releaseVersion、generatedAt、checksum、三类计数、referenceSummary及完整flows。
- Content Snapshot显式声明tutorialSnapshotReleaseId、tutorialSnapshotChecksum和固定path，并嵌入tutorialDefinitions供历史恢复。

## 写入与回滚

- `writeTutorialSnapshot`原子写published JSON和generated TS，并写`content-store/releases/<releaseVersion>/tutorial.snapshot.json`。
- 历史目标已存在时拒绝覆盖；所有目标必须位于注入的项目根内。
- 发布journal捕获Tutorial published文件和历史文件存在状态。
- 发布失败恢复旧published内容，并删除本次新建历史文件；成功时历史文件保留。
- Releases publish继续沿原验证、建Release、build、journal、write、DB提交顺序执行并返回Tutorial三类路径。

## 发布验证与读取

- ContentValidation新增Tutorial图、Trigger/Completion目录、Target、Stage、Campaign、Feature、Art、timeout和force/block fallback校验。
- 校验仍发生在Release创建前，不读取seed或样例作为正式内容。
- Published API只读取固定项目根内的content声明和Tutorial正式快照，不读取MySQL draft。
- 声明缺失、路径非法、release不匹配、checksum篡改或结构非法统一返回LEGACY_FALLBACK。
- 当前R000007未声明Tutorial Snapshot，因此保持legacy fallback。

## Restore

- 历史content snapshot含tutorialDefinitions时，在现有restore事务内按稳定ID upsert或恢复Flow、Step、Transition和Rule。
- 当前缺失项按rowVersion软删，恢复写Tutorial change log，并由现有draft revision/change log闭环记录。
- 旧release缺tutorialDefinitions时不修改当前Tutorial draft，返回`not-declared-noop`。

## Checker与运行模型

- 新增纯函数`check-tutorial-assets-lib.cjs`、固定root CLI和`npm run check:tutorial`。
- 检查唯一ID、图、目录、引用、Art状态、timeout、force fallback、计数、声明、checksum和release一致性。
- 当前R000007命令输出`TUTORIAL_LEGACY_FALLBACK: tutorial-snapshot-not-declared`并exit 0。
- 新增Tutorial运行模型与legacy-safe generated占位，未伪造当前正式快照。

## TDD与验证

- 首个RED：Tutorial build/write/published读取扩展点不存在，测试编译失败。
- Snapshot/发布/恢复精确组：4 suites、16/16通过。
- Tutorial与相关发布验证精确组：8 suites、84/84通过。
- Server全量：18 suites、158/158通过；server typecheck和Prisma validate通过。
- Checker专项：3/3通过；Root标准测试521/521、typecheck和build通过。
- 所有文件写入测试均使用临时目录或root注入，未触碰真实published文件。

## P1审核修复

- Tutorial头像和Art Target发布前必须指向启用、未软删的Physical资源；按`current draft ?? published`选择版本，仅Missing/Invalid拒绝，并要求storage path、checksum和正实际尺寸。
- Stage、Campaign和Art引用目录只接纳启用且未软删实体；快照写入引用实值摘要及离线正式目录摘要。
- 生成器、Published读取和checker复用同一JSON-safe结构校验，覆盖schema、计数、图、目录、引用摘要、timeout与force fallback。
- 自校验和非法Trigger或Target仍会被Published读取和checker拒绝，不再仅依赖checksum发现篡改。
- Release创建后的build、write或数据库提交异常统一将该Release标记为failed；验证失败仍不创建Release。
- P1精确组2 suites、12/12通过；checker专项3/3通过；Server全量18 suites、161/161通过。
- Root标准测试521/521、两端typecheck、Root build和Prisma validate通过；当前`check:tutorial`保持R000007 legacy fallback。
- 最终Art口径回归覆盖published-only、warning draft和invalid draft优先三种场景；Server全量更新为18 suites、165/165。
