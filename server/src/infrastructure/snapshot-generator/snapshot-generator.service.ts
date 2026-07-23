import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { projectRoot } from '../../common/utils/safe-path';
import { backgroundFromRow, enemyFromRow, heroFromRow, stageFromRow } from '../../modules/content/content.mapper';
import { orchestrationFromRows } from '../../modules/content/stage-orchestration.mapper';
import { flowModel, stepModel, transitionModel, unlockRuleModel } from '../../modules/tutorials/tutorial.mapper';
import { validateTutorialGraph } from '../../modules/tutorials/tutorial.validation';
import { TutorialTargetCatalog } from '../../modules/tutorials/tutorial-target.catalog';
import { TutorialFeatureCatalog } from '../../modules/tutorials/tutorial-feature.catalog';
import { collectTutorialReferences } from '../../../../shared/tutorial-publication-validation';
import { TUTORIAL_FEATURES } from '../../../../shared/tutorial-catalog';
import { selectTutorialArtVersion } from '../../modules/content-validation/tutorial-art-version';

@Injectable()
export class SnapshotGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSnapshot(releaseId: string, releaseVersion: string, artSnapshot?: any, animationSnapshot?: any, stageSnapshot?: any, progressionSnapshot?: any, campaignSnapshot?: any, tutorialSnapshot?: any) {
    const [enemies, backgrounds, heroVisuals, stages] = await Promise.all([
      this.prisma.contentEnemyTemplate.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { id: 'asc' } }),
      this.prisma.contentBackgroundTheme.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { id: 'asc' } }),
      this.prisma.contentHeroVisual.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { id: 'asc' } }),
      this.prisma.contentStage.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { id: 'asc' } }),
    ]);
    const content = {
      schemaVersion: 1 as const,
      releaseId,
      releaseVersion,
      generatedAt: new Date().toISOString(),
      checksum: '',
      enemies: enemies.map(row => runtimeEntity(enemyFromRow(row))),
      backgrounds: backgrounds.map(row => runtimeEntity(backgroundFromRow(row))),
      heroVisuals: heroVisuals.map(row => runtimeEntity(heroFromRow(row))),
      stages: await Promise.all(stages.map(row => this.stageWithChildren(row))),
      artManifestReleaseId: artSnapshot?.releaseId,
      artManifestChecksum: artSnapshot?.checksum,
      animationManifestReleaseId: animationSnapshot?.releaseId,
      animationManifestChecksum: animationSnapshot?.checksum,
      stageOrchestrationReleaseId: stageSnapshot?.releaseId,
      stageOrchestrationChecksum: stageSnapshot?.checksum,
      stageProgressionReleaseId: progressionSnapshot?.releaseId,
      stageProgressionChecksum: progressionSnapshot?.checksum,
      campaignSnapshotReleaseId: campaignSnapshot?.releaseId,
      campaignSnapshotChecksum: campaignSnapshot?.checksum,
      campaignSnapshotPath: campaignSnapshot ? 'content-store/published/campaign.snapshot.json' : undefined,
      tutorialSnapshotReleaseId: tutorialSnapshot?.releaseId,
      tutorialSnapshotChecksum: tutorialSnapshot?.checksum,
      tutorialSnapshotPath: tutorialSnapshot ? 'content-store/published/tutorial.snapshot.json' : undefined,
      animationClips: animationSnapshot?.clips ?? [],
      stageOrchestrations: (stageSnapshot?.stages ?? []).map((stage: any) => ({
        stageId: stage.stageId,
        releaseId: stageSnapshot.releaseId,
        checksum: stageSnapshot.checksum,
        waveCount: stage.waves.length,
        spawnPointCount: stage.spawnPoints.length,
        layerCount: stage.layers.length,
      })),
      stageProgressions: (progressionSnapshot?.stages ?? []).map((stage: any) => ({ stageId: stage.stageId, objectiveCount: stage.objectives.length, rewardEntryCount: stage.rewardPools.reduce((sum: number, pool: any) => sum + pool.entries.length, 0), unlockRuleCount: stage.unlockRules.length })),
      stageProgressionDefinitions: progressionSnapshot?.stages ?? [],
      stageRewardCatalog: progressionSnapshot?.rewardCatalog ?? [],
      stageOrchestrationDefinitions: stageSnapshot?.stages ?? [],
      campaignDefinitions: campaignSnapshot?.campaigns ?? [],
      tutorialDefinitions: tutorialSnapshot?.flows ?? [],
      artResources: artSnapshot ? Object.entries(artSnapshot.resources).filter(([, entry]: any) => entry.status !== 'virtual').map(([artKey, entry]: any) => ({
        artKey,
        versionId: entry.versionId,
        versionNo: entry.versionNo,
        checksum: entry.checksum,
        path: entry.path,
      })) : [],
    };
    content.checksum = checksum({ ...content, checksum: '' });
    return content;
  }

  async buildTutorialSnapshot(releaseId: string, releaseVersion: string) {
    const db = this.prisma as any;
    const [flowRows, stepRows, transitionRows, ruleRows] = await Promise.all([
      db.contentTutorialFlow.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { id: 'asc' } }),
      db.contentTutorialStep.findMany({ where: { enabled: true, deleted_at: null }, orderBy: [{ flow_id: 'asc' }, { sort_order: 'asc' }, { id: 'asc' }] }),
      db.contentTutorialStepTransition.findMany({ where: { enabled: true, deleted_at: null }, orderBy: [{ flow_id: 'asc' }, { sort_order: 'asc' }, { id: 'asc' }] }),
      db.contentFeatureUnlockRule.findMany({ where: { enabled: true, deleted_at: null }, orderBy: [{ flow_id: 'asc' }, { sort_order: 'asc' }, { id: 'asc' }] }),
    ]);
    const flowIds = new Set(flowRows.map((row: any) => row.id));
    const targets = new TutorialTargetCatalog(db, new TutorialFeatureCatalog());
    const features = new TutorialFeatureCatalog();
    const flows = [] as any[];
    for (const row of flowRows) {
      const steps = stepRows.filter((item: any) => item.flow_id === row.id && flowIds.has(item.flow_id)).map(stepModel);
      const transitions = transitionRows.filter((item: any) => item.flow_id === row.id).map(transitionModel);
      const unlockRules = ruleRows.filter((item: any) => item.flow_id === row.id).map(unlockRuleModel);
      validateTutorialGraph({ startStepId: row.start_step_id, steps, transitions });
      for (const step of steps) {
        await targets.require(step.targetType, step.targetId);
        if (step.stageId) await targets.require('stage', step.stageId);
        if (step.campaignId) await targets.require('campaign', step.campaignId);
        if (step.avatarArtKey) await targets.require('art', step.avatarArtKey);
      }
      for (const rule of unlockRules) features.require(rule.featureId);
      flows.push({ ...flowModel(row), steps, transitions, unlockRules });
    }
    const activeSteps = stepRows.filter((row: any) => flowIds.has(row.flow_id));
    const activeRules = ruleRows.filter((row: any) => flowIds.has(row.flow_id));
    const referenceSummary = { ...collectTutorialReferences(flows), catalog: await tutorialPublicationCatalog(db) };
    const snapshot = { schemaVersion: 1 as const, releaseId, releaseVersion, generatedAt: new Date().toISOString(),
      checksum: '', flowCount: flows.length, stepCount: activeSteps.length,
      featureUnlockRuleCount: activeRules.length, referenceSummary, flows };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async buildCampaignSnapshot(releaseId: string, releaseVersion: string) {
    const db = this.prisma as any;
    const [campaignRows, chapterRows, nodeRows, connectionRows] = await Promise.all([
      db.contentCampaign.findMany({ where: { enabled: true, deleted_at: null }, orderBy: { sort_order: 'asc' } }),
      db.contentCampaignChapter.findMany({ where: { enabled: true, deleted_at: null }, orderBy: [{ campaign_id: 'asc' }, { chapter_no: 'asc' }] }),
      db.contentCampaignStageNode.findMany({ where: { enabled: true }, orderBy: [{ chapter_id: 'asc' }, { sort_order: 'asc' }] }),
      db.contentCampaignNodeConnection.findMany({ where: { enabled: true }, orderBy: [{ chapter_id: 'asc' }, { sort_order: 'asc' }] }),
    ]);
    const campaigns = campaignRows.map((row: any) => ({
      id: row.id, name: row.name, subtitle: row.subtitle ?? '', description: row.description ?? '',
      coverArtKey: row.cover_art_key ?? undefined, defaultChapterId: row.default_chapter_id ?? '',
      order: row.sort_order, enabled: row.enabled, schemaVersion: row.schema_version, contentVersion: row.content_version,
      chapters: chapterRows.filter((chapter: any) => chapter.campaign_id === row.id).map((chapter: any) => ({
        id: chapter.id, campaignId: chapter.campaign_id, chapterNo: chapter.chapter_no, name: chapter.name,
        subtitle: chapter.subtitle ?? '', description: chapter.description ?? '', backgroundArtKey: chapter.background_art_key,
        canvasWidth: chapter.canvas_width, canvasHeight: chapter.canvas_height, viewportX: chapter.viewport_x,
        viewportY: chapter.viewport_y, enabled: chapter.enabled, completionText: chapter.completion_text ?? '',
        completionRewardRef: chapter.completion_reward_ref ?? undefined,
        nodes: nodeRows.filter((node: any) => node.chapter_id === chapter.id).map(nodeModel),
        connections: connectionRows.filter((path: any) => path.chapter_id === chapter.id).map(connectionModel),
      })),
    }));
    const snapshot = { schemaVersion: 1 as const, releaseId, releaseVersion, generatedAt: new Date().toISOString(), checksum: '',
      campaignCount: campaigns.length, chapterCount: chapterRows.length, nodeCount: nodeRows.length,
      connectionCount: connectionRows.length, campaigns };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async buildStageOrchestrationSnapshot(releaseId: string, releaseVersion: string) {
    const layouts = await (this.prisma as any).contentStageSceneLayout.findMany({ where: { enabled: true }, orderBy: { stage_id: 'asc' } });
    const stages = [];
    for (const layout of layouts) stages.push(await this.stageOrchestrationWithChildren(layout.stage_id));
    const snapshot = { schemaVersion: 1 as const, releaseId, releaseVersion, generatedAt: new Date().toISOString(), checksum: '', stages };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async buildStageProgressionSnapshot(releaseId: string, releaseVersion: string) {
    const [configs, objectives, pools, entries, rules, catalog] = await Promise.all([
      (this.prisma as any).contentStageProgressionConfig.findMany({ orderBy: { stage_id: 'asc' } }),
      (this.prisma as any).contentStageProgressionObjective.findMany({ where: { enabled: true }, orderBy: [{ stage_id: 'asc' }, { sort_order: 'asc' }] }),
      (this.prisma as any).contentStageRewardPool.findMany({ where: { enabled: true }, orderBy: [{ stage_id: 'asc' }, { sort_order: 'asc' }] }),
      (this.prisma as any).contentStageRewardEntry.findMany({ where: { enabled: true }, orderBy: { sort_order: 'asc' } }),
      (this.prisma as any).contentStageUnlockRule.findMany({ where: { enabled: true }, orderBy: [{ stage_id: 'asc' }, { sort_order: 'asc' }] }),
      (this.prisma as any).contentRewardDefinition.findMany({ where: { enabled: true }, orderBy: [{ reward_type: 'asc' }, { reward_ref_id: 'asc' }] }),
    ]);
    const stages = configs.map((config: any) => ({
      stageId: config.stage_id, recommendedPower: config.recommended_power,
      victoryText: config.victory_text ?? '', failureText: config.failure_text ?? '',
      objectives: objectives.filter((x: any) => x.stage_id === config.stage_id).map(progressionObjective),
      rewardPools: pools.filter((x: any) => x.stage_id === config.stage_id).map((pool: any) => ({
        id: pool.pool_key, name: pool.name, group: pool.group_type, objectiveId: pool.objective_key ?? undefined,
        selectionMode: pool.selection_mode, entries: entries.filter((x: any) => x.pool_id === pool.id).map(progressionRewardEntry),
      })),
      unlockRules: rules.filter((x: any) => x.stage_id === config.stage_id).map(progressionUnlockRule),
    }));
    const snapshot = { schemaVersion: 1 as const, releaseId, releaseVersion, generatedAt: new Date().toISOString(), checksum: '',
      stageCount: stages.length, objectiveCount: objectives.length, rewardEntryCount: entries.length, unlockRuleCount: rules.length,
      rewardCatalog: catalog.map((x: any) => ({ type: x.reward_type, refId: x.reward_ref_id, name: x.name, iconArtKey: x.icon_art_key ?? undefined })), stages };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async buildAnimationManifestSnapshot(releaseId: string, releaseVersion: string) {
    const rows = await (this.prisma as any).contentAnimationClip.findMany({
      where: { enabled: true, deleted_at: null },
      include: { frames: { orderBy: { sort_order: 'asc' } } },
      orderBy: { clip_key: 'asc' },
    });
    const snapshot = {
      schemaVersion: 1 as const,
      releaseId,
      releaseVersion,
      generatedAt: new Date().toISOString(),
      checksum: '',
      clips: rows.map(animationClipFromRow),
    };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async buildArtManifestSnapshot(releaseId: string, releaseVersion: string) {
    const referencedKeys = await this.collectReferencedArtKeys();
    const resources = await this.prisma.contentArtResource.findMany({
      where: { art_key: { in: [...referencedKeys] }, enabled: true, deleted_at: null },
      orderBy: { art_key: 'asc' },
    } as any);
    const versionIds = resources.map((row: any) => row.current_draft_version_id ?? row.published_version_id).filter(Boolean);
    const versions = await this.prisma.contentArtResourceVersion.findMany({
      where: { id: { in: versionIds }, validation_status: { not: 'invalid' } },
    } as any);
    const versionById = new Map(versions.map((row: any) => [row.id, row]));
    const entries: Record<string, any> = {};
    for (const resource of resources as any[]) {
      if (resource.resource_status === 'virtual') {
        entries[resource.art_key] = { type: resource.resource_type, pack: resource.pack_name, status: 'virtual', fallback: resource.fallback_art_key };
        continue;
      }
      const versionId = resource.current_draft_version_id ?? resource.published_version_id;
      const version = versionById.get(versionId);
      if (!version) continue;
      entries[resource.art_key] = {
        type: resource.resource_type,
        pack: resource.pack_name,
        versionId: version.id,
        versionNo: version.version_no,
        path: releaseAssetPath(releaseVersion, resource.resource_type, resource.art_key, version.file_extension ?? path.extname(version.storage_path) ?? '.png'),
        width: version.actual_width,
        height: version.actual_height,
        hasAlpha: version.has_alpha,
        checksum: version.checksum,
        fallback: resource.fallback_art_key,
      };
    }
    const snapshot = {
      schemaVersion: 1 as const,
      releaseId,
      releaseVersion,
      generatedAt: new Date().toISOString(),
      checksum: '',
      resources: entries,
    };
    snapshot.checksum = checksum({ ...snapshot, checksum: '' });
    return snapshot;
  }

  async writeSnapshot(snapshot: unknown) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.CONTENT_SNAPSHOT_JSON_PATH ?? 'content-store/published/content.snapshot.json');
    const tsPath = path.resolve(root, process.env.CONTENT_SNAPSHOT_TS_PATH ?? 'src/content/generated/contentSnapshot.ts');
    for (const target of [jsonPath, tsPath]) {
      if (!target.startsWith(root + path.sep)) throw new Error('快照路径越界');
      fs.mkdirSync(path.dirname(target), { recursive: true });
    }
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `import type { ContentSnapshot } from '../models/ContentTypes';\n\nexport const CONTENT_SNAPSHOT: ContentSnapshot = ${stableJson(snapshot)};\n`);
    return { jsonPath, tsPath };
  }

  async writeArtManifestSnapshot(snapshot: any) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.ART_MANIFEST_JSON_PATH ?? 'content-store/published/art-manifest.snapshot.json');
    const tsPath = path.resolve(root, process.env.ART_MANIFEST_TS_PATH ?? 'src/assets/generated/artManifestSnapshot.ts');
    for (const target of [jsonPath, tsPath]) {
      if (!target.startsWith(root + path.sep)) throw new Error('Art Manifest 快照路径越界');
      fs.mkdirSync(path.dirname(target), { recursive: true });
    }
    await this.copyArtReleaseFiles(snapshot);
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `export const ART_MANIFEST_SNAPSHOT = ${stableJson(snapshot)} as const;\n`);
    return { jsonPath, tsPath };
  }

  async writeAnimationManifestSnapshot(snapshot: any) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.ANIMATION_MANIFEST_JSON_PATH ?? 'content-store/published/animation-manifest.snapshot.json');
    const tsPath = path.resolve(root, process.env.ANIMATION_MANIFEST_TS_PATH ?? 'src/assets/generated/animationManifestSnapshot.ts');
    for (const target of [jsonPath, tsPath]) {
      if (!target.startsWith(root + path.sep)) throw new Error('Animation Manifest 快照路径越界');
      fs.mkdirSync(path.dirname(target), { recursive: true });
    }
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `export const ANIMATION_MANIFEST_SNAPSHOT = ${stableJson(snapshot)} as const;\n`);
    return { jsonPath, tsPath };
  }

  async writeStageOrchestrationSnapshot(snapshot: any) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.STAGE_ORCHESTRATION_JSON_PATH ?? 'content-store/published/stage-orchestration.snapshot.json');
    const tsPath = path.resolve(root, process.env.STAGE_ORCHESTRATION_TS_PATH ?? 'src/content/generated/stageOrchestrationSnapshot.ts');
    for (const target of [jsonPath, tsPath]) {
      if (!target.startsWith(root + path.sep)) throw new Error('Stage Orchestration 快照路径越界');
      fs.mkdirSync(path.dirname(target), { recursive: true });
    }
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `import type { StageOrchestrationSnapshot } from '../models/StageOrchestration';\n\nexport const STAGE_ORCHESTRATION_SNAPSHOT: StageOrchestrationSnapshot = ${stableJson(snapshot)};\n`);
    return { jsonPath, tsPath };
  }

  async writeStageProgressionSnapshot(snapshot: any) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.STAGE_PROGRESSION_JSON_PATH ?? 'content-store/published/stage-progression.snapshot.json');
    const tsPath = path.resolve(root, process.env.STAGE_PROGRESSION_TS_PATH ?? 'src/content/generated/stageProgressionSnapshot.ts');
    for (const target of [jsonPath, tsPath]) { if (!target.startsWith(root + path.sep)) throw new Error('Stage Progression 快照路径越界'); fs.mkdirSync(path.dirname(target), { recursive: true }); }
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `import type { StageProgressionSnapshot } from '../models/StageProgression';\n\nexport const STAGE_PROGRESSION_SNAPSHOT: StageProgressionSnapshot = ${stableJson(snapshot)};\n`);
    return { jsonPath, tsPath };
  }

  async writeCampaignSnapshot(snapshot: any) {
    const root = projectRoot();
    const jsonPath = path.resolve(root, process.env.CAMPAIGN_SNAPSHOT_JSON_PATH ?? 'content-store/published/campaign.snapshot.json');
    const tsPath = path.resolve(root, process.env.CAMPAIGN_SNAPSHOT_TS_PATH ?? 'src/content/generated/campaignSnapshot.ts');
    for (const target of [jsonPath, tsPath]) { if (!target.startsWith(root + path.sep)) throw new Error('Campaign快照路径越界'); fs.mkdirSync(path.dirname(target), { recursive: true }); }
    atomicWrite(jsonPath, stableJson(snapshot));
    atomicWrite(tsPath, `import type { CampaignSnapshot } from '../models/Campaign';\n\nexport const CAMPAIGN_SNAPSHOT: CampaignSnapshot = ${stableJson(snapshot)};\n`);
    return { jsonPath, tsPath };
  }

  async writeTutorialSnapshot(snapshot: any, root = projectRoot()) {
    const safeRoot = path.resolve(root);
    const jsonPath = path.resolve(safeRoot, 'content-store/published/tutorial.snapshot.json');
    const tsPath = path.resolve(safeRoot, 'src/content/generated/tutorialSnapshot.ts');
    if (!/^R\d{6}$/.test(snapshot.releaseVersion)) throw new Error('Tutorial releaseVersion非法');
    const historyJsonPath = path.resolve(safeRoot, 'content-store/releases', snapshot.releaseVersion, 'tutorial.snapshot.json');
    for (const target of [jsonPath, tsPath, historyJsonPath]) {
      if (!target.startsWith(safeRoot + path.sep)) throw new Error('Tutorial快照路径越界');
    }
    if (fs.existsSync(historyJsonPath)) throw new Error('Tutorial历史快照已存在，禁止覆盖');
    for (const target of [jsonPath, tsPath, historyJsonPath]) fs.mkdirSync(path.dirname(target), { recursive: true });
    const json = stableJson(snapshot);
    atomicWrite(jsonPath, json);
    atomicWrite(tsPath, `import type { TutorialSnapshot } from '../models/Tutorial';\n\nexport const TUTORIAL_SNAPSHOT: TutorialSnapshot = ${json};\n`);
    atomicWrite(historyJsonPath, json);
    return { jsonPath, tsPath, historyJsonPath };
  }

  capturePublishedState(artSnapshot: any, tutorialSnapshot?: any, root = projectRoot()) {
    root = path.resolve(root);
    const files = publishedTargets(root).map(filePath => ({
      filePath,
      content: fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null,
    }));
    const artFiles = Object.values(artSnapshot.resources ?? {}).filter((entry: any) => entry.status !== 'virtual').map((entry: any) => {
      const filePath = path.resolve(root, entry.path);
      if (!filePath.startsWith(root + path.sep)) throw new Error('发布资源路径越界');
      return { filePath, existed: fs.existsSync(filePath) };
    });
    const createdFiles = tutorialSnapshot ? [path.resolve(root, 'content-store/releases', tutorialSnapshot.releaseVersion, 'tutorial.snapshot.json')]
      .map(filePath => ({ filePath, existed: fs.existsSync(filePath) })) : [];
    return { files, artFiles, createdFiles };
  }

  restorePublishedState(state: any): void {
    const root = projectRoot();
    for (const item of state.files ?? []) {
      if (item.content == null) fs.rmSync(item.filePath, { force: true });
      else { fs.mkdirSync(path.dirname(item.filePath), { recursive: true }); atomicWrite(item.filePath, item.content); }
    }
    for (const item of state.artFiles ?? []) if (!item.existed) { fs.rmSync(item.filePath, { force: true }); removeEmptyParents(path.dirname(item.filePath), root); }
    for (const item of state.createdFiles ?? []) if (!item.existed) { fs.rmSync(item.filePath, { force: true }); removeEmptyParents(path.dirname(item.filePath), root); }
  }

  writePublishJournal(releaseId: string, state: any): void {
    const filePath = publishJournalPath(releaseId);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    atomicWrite(filePath, stableJson({ releaseId, state }));
  }

  listPublishJournals(): Array<{ releaseId: string; state: any }> {
    const root = publishJournalRoot();
    if (!fs.existsSync(root)) return [];
    return fs.readdirSync(root).filter(name => name.endsWith('.json')).map(name => {
      const value = JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
      if (!value?.releaseId || !value?.state) throw new Error(`发布恢复日志无效：${name}`);
      return value;
    });
  }

  clearPublishJournal(releaseId: string): void {
    fs.rmSync(publishJournalPath(releaseId), { force: true });
  }

  async markArtVersionsPublished(snapshot: any, client?: any) {
    const entries = Object.entries(snapshot.resources) as Array<[string, any]>;
    const update = async (tx: any) => {
      for (const [artKey, entry] of entries) {
        if ((entry as any).status === 'virtual') continue;
        await tx.contentArtResource.update({ where: { art_key: artKey }, data: { published_version_id: entry.versionId } as any });
        await tx.contentArtResourceVersion.update({ where: { id: entry.versionId }, data: { validation_status: 'published', published_at: new Date() } as any });
        await tx.contentChangeLog.create({ data: { entity_type: 'art-resource', entity_id: artKey, action_type: 'publish-art-version', after_json: entry } });
      }
    };
    if (client) await update(client); else await this.prisma.$transaction(update);
  }

  private async copyArtReleaseFiles(snapshot: any) {
    const entries = Object.values(snapshot.resources) as any[];
    const versionIds = entries.filter(entry => entry.status !== 'virtual').map(entry => entry.versionId).filter(Boolean);
    const versions = await this.prisma.contentArtResourceVersion.findMany({ where: { id: { in: versionIds } } } as any);
    const versionById = new Map(versions.map((row: any) => [row.id, row]));
    const stagingRoot = path.resolve(projectRoot(), process.env.ART_STAGING_ROOT ?? 'content-store/art/staging', snapshot.releaseId);
    if (!stagingRoot.startsWith(projectRoot() + path.sep)) throw new Error('Art staging 路径越界');
    fs.rmSync(stagingRoot, { recursive: true, force: true });
    for (const entry of entries) {
      if (entry.status === 'virtual') continue;
      const version = versionById.get(entry.versionId);
      if (!version) throw new Error(`资源版本不存在：${entry.versionId}`);
      const target = path.resolve(projectRoot(), entry.path);
      if (!target.startsWith(projectRoot() + path.sep)) throw new Error('发布资源路径越界');
      if (fs.existsSync(target)) throw new Error(`发布资源目标已存在，拒绝覆盖：${entry.path}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.resolve(projectRoot(), version.storage_path), target);
    }
  }

  private async collectReferencedArtKeys() {
    const [enemies, backgrounds, heroes, animationFrames, stageLayers, rewardDefinitions, campaigns, chapters, campaignNodes] = await Promise.all([
      this.prisma.contentEnemyTemplate.findMany({ where: { enabled: true, deleted_at: null }, select: { visual_json: true } as any }),
      this.prisma.contentBackgroundTheme.findMany({ where: { enabled: true, deleted_at: null }, select: { art_json: true } as any }),
      this.prisma.contentHeroVisual.findMany({ where: { enabled: true, deleted_at: null }, select: { visual_json: true, skills_json: true } as any }),
      (this.prisma as any).contentAnimationFrame?.findMany ? (this.prisma as any).contentAnimationFrame.findMany({ select: { art_key: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageLayer?.findMany ? (this.prisma as any).contentStageLayer.findMany({ select: { art_key: true } }) : Promise.resolve([]),
      (this.prisma as any).contentRewardDefinition?.findMany ? (this.prisma as any).contentRewardDefinition.findMany({ where: { enabled: true }, select: { icon_art_key: true } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaign?.findMany ? (this.prisma as any).contentCampaign.findMany({ where: { enabled: true, deleted_at: null }, select: { cover_art_key: true } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaignChapter?.findMany ? (this.prisma as any).contentCampaignChapter.findMany({ where: { enabled: true, deleted_at: null }, select: { background_art_key: true } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaignStageNode?.findMany ? (this.prisma as any).contentCampaignStageNode.findMany({ where: { enabled: true }, select: { icon_art_key: true } }) : Promise.resolve([]),
    ]);
    const keys = new Set<string>();
    for (const row of enemies as any[]) collectStringValues(row.visual_json, keys);
    for (const row of backgrounds as any[]) collectStringValues(row.art_json, keys);
    for (const row of heroes as any[]) {
      collectStringValues(row.visual_json, keys);
      collectStringValues(row.skills_json, keys);
    }
    for (const row of animationFrames as any[]) keys.add(row.art_key);
    for (const row of stageLayers as any[]) if (row.art_key) keys.add(row.art_key);
    for (const row of rewardDefinitions as any[]) if (row.icon_art_key) keys.add(row.icon_art_key);
    for (const row of campaigns as any[]) if (row.cover_art_key) keys.add(row.cover_art_key);
    for (const row of chapters as any[]) if (row.background_art_key) keys.add(row.background_art_key);
    for (const row of campaignNodes as any[]) if (row.icon_art_key) keys.add(row.icon_art_key);
    return keys;
  }

  private async stageOrchestrationWithChildren(stageId: string) {
    const waves = await (this.prisma as any).contentStageOrchestrationWave.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    const rows = {
      layout: await (this.prisma as any).contentStageSceneLayout.findUnique({ where: { stage_id: stageId } }),
      layers: await (this.prisma as any).contentStageLayer.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } }),
      spawnPoints: await (this.prisma as any).contentStageSpawnPoint.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } }),
      waves,
      entries: await (this.prisma as any).contentStageWaveEntry.findMany({ where: { wave_id: { in: waves.map((w: any) => w.id) } }, orderBy: { sort_order: 'asc' } }),
    };
    const runtime = orchestrationFromRows(stageId, rows) as any;
    delete runtime.rowVersion;
    return runtime;
  }

  private async stageWithChildren(row: any) {
    const waves = await this.prisma.contentStageWave.findMany({ where: { stage_id: row.id }, orderBy: { sort_order: 'asc' } });
    const waveGroups = await this.prisma.contentStageWaveEnemyGroup.findMany({ where: { stage_wave_id: { in: waves.map(w => w.id) } }, orderBy: { sort_order: 'asc' } });
    const spawns = await this.prisma.contentExploreSpawnGroup.findMany({ where: { stage_id: row.id }, orderBy: { sort_order: 'asc' } });
    const objectives = await this.prisma.contentStageObjective.findMany({ where: { stage_id: row.id }, orderBy: { sort_order: 'asc' } });
    return runtimeEntity(stageFromRow(row, {
      waves: waves.map(w => stageWave(w, waveGroups.filter(g => g.stage_wave_id === w.id).map(stageEnemyGroup))),
      exploration: spawns.length ? { worldWidth: row.world_width, worldHeight: row.world_height, spawnGroups: spawns.map(g => ({ id: g.group_key, enemyTemplateId: g.enemy_template_id, spawnPoint: { x: g.spawn_x, y: g.spawn_y, radius: g.spawn_radius }, initialCount: g.initial_count, maxAlive: g.max_alive, respawnInterval: g.respawn_interval, active: true })) } : undefined,
      objectives: objectives.map(o => ({ type: o.objective_type, required: o.required_count })),
    }));
  }
}

function runtimeEntity<T extends Record<string, unknown>>(value: T): Omit<T, 'rowVersion' | 'updatedAt'> {
  const { rowVersion: _rowVersion, updatedAt: _updatedAt, ...runtime } = value as any;
  return runtime;
}

function stageEnemyGroup(row: any) {
  const group: any = { enemyTemplateId: row.enemy_template_id, count: row.enemy_count };
  if (isSpawnGroup(row.spawn_area_id)) group.spawnGroup = row.spawn_area_id;
  else if (row.spawn_area_id) group.spawnAreaId = row.spawn_area_id;
  if (row.spawn_interval != null) group.spawnInterval = row.spawn_interval;
  if (row.level_multiplier != null) group.levelMultiplier = row.level_multiplier;
  return group;
}

function stageWave(row: any, groups: any[]) {
  const wave: any = { wave: row.wave_no, groups };
  if (row.wave_key) wave.id = row.wave_key;
  if (row.name) wave.name = row.name;
  if (row.message) wave.message = row.message;
  if (row.spawn_delay != null) wave.spawnDelay = row.spawn_delay;
  return wave;
}

function isSpawnGroup(value: unknown): boolean {
  return value === 'around_player' || value === 'left_right' || value === 'top' || value === 'default';
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortValue(value), null, 2);
}

function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result: Record<string, unknown>, key) => {
    if (value[key] !== undefined) result[key] = sortValue(value[key]);
    return result;
  }, {});
}

function checksum(value: unknown): string {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex');
}

async function tutorialPublicationCatalog(db: any) {
  const [stages, campaigns, art, versions] = await Promise.all([
    db.contentStage?.findMany?.({ where: { enabled: true, deleted_at: null } }) ?? [],
    db.contentCampaign?.findMany?.({ where: { enabled: true, deleted_at: null } }) ?? [],
    db.contentArtResource?.findMany?.({ where: { enabled: true, deleted_at: null, resource_status: 'physical' } }) ?? [],
    db.contentArtResourceVersion?.findMany?.() ?? [],
  ]);
  const versionById = new Map<string, any>(versions.map((row: any) => [row.id, row]));
  const artKeys = art.filter((row: any) => {
    return !!selectTutorialArtVersion(row, versionById);
  }).map((row: any) => row.art_key).sort();
  return { stageIds: stages.map((x: any) => x.id).sort(), campaignIds: campaigns.map((x: any) => x.id).sort(),
    artKeys, featureIds: TUTORIAL_FEATURES.map(x => x.id).sort() };
}

function atomicWrite(target: string, content: string): void {
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, target);
}

function removeEmptyParents(directory: string, root: string): void {
  for (let current = directory; current.startsWith(root + path.sep) && current !== root; current = path.dirname(current)) {
    if (!fs.existsSync(current) || fs.readdirSync(current).length) break;
    fs.rmdirSync(current);
  }
}

function publishedTargets(root: string): string[] {
  return [
    process.env.CONTENT_SNAPSHOT_JSON_PATH ?? 'content-store/published/content.snapshot.json',
    process.env.CONTENT_SNAPSHOT_TS_PATH ?? 'src/content/generated/contentSnapshot.ts',
    process.env.ART_MANIFEST_JSON_PATH ?? 'content-store/published/art-manifest.snapshot.json',
    process.env.ART_MANIFEST_TS_PATH ?? 'src/assets/generated/artManifestSnapshot.ts',
    process.env.ANIMATION_MANIFEST_JSON_PATH ?? 'content-store/published/animation-manifest.snapshot.json',
    process.env.ANIMATION_MANIFEST_TS_PATH ?? 'src/assets/generated/animationManifestSnapshot.ts',
    process.env.STAGE_ORCHESTRATION_JSON_PATH ?? 'content-store/published/stage-orchestration.snapshot.json',
    process.env.STAGE_ORCHESTRATION_TS_PATH ?? 'src/content/generated/stageOrchestrationSnapshot.ts',
    process.env.STAGE_PROGRESSION_JSON_PATH ?? 'content-store/published/stage-progression.snapshot.json',
    process.env.STAGE_PROGRESSION_TS_PATH ?? 'src/content/generated/stageProgressionSnapshot.ts',
    process.env.CAMPAIGN_SNAPSHOT_JSON_PATH ?? 'content-store/published/campaign.snapshot.json',
    process.env.CAMPAIGN_SNAPSHOT_TS_PATH ?? 'src/content/generated/campaignSnapshot.ts',
    'content-store/published/tutorial.snapshot.json',
    'src/content/generated/tutorialSnapshot.ts',
  ].map(value => {
    const target = path.resolve(root, value);
    if (!target.startsWith(root + path.sep)) throw new Error('快照路径越界');
    return target;
  });
}

function publishJournalRoot(): string {
  const root = projectRoot();
  const target = path.resolve(root, process.env.PUBLISH_JOURNAL_ROOT ?? 'content-store/publish-journal');
  if (!target.startsWith(root + path.sep)) throw new Error('发布恢复日志路径越界');
  return target;
}

function publishJournalPath(releaseId: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(releaseId)) throw new Error('发布恢复日志ID非法');
  return path.join(publishJournalRoot(), `${releaseId}.json`);
}

function collectStringValues(value: unknown, output: Set<string>): void {
  if (typeof value === 'string' && value.includes('.')) {
    output.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, output);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStringValues(item, output);
  }
}

function releaseAssetPath(releaseVersion: string, resourceType: string, artKey: string, extension: string): string {
  const folderMap: Record<string, string> = {
    player: 'players',
    enemy: 'enemies',
    background: 'backgrounds',
    map: 'maps',
    ui: 'ui',
    icon: 'ui',
    effect: 'effects',
    drop: 'drops',
    placeholder: 'placeholders',
  };
  const folder = folderMap[resourceType] ?? `${resourceType}s`;
  const safeName = artKey.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return path.posix.join('assets/art-releases', releaseVersion, folder, `${safeName}${extension}`);
}

function animationClipFromRow(row: any) {
  return {
    id: row.id,
    key: row.clip_key,
    name: row.name,
    targetType: row.target_type,
    state: row.state,
    defaultFps: row.default_fps ?? undefined,
    defaultFrameDurationMs: row.default_frame_duration_ms ?? undefined,
    loop: row.loop,
    playMode: row.play_mode,
    endBehavior: row.end_behavior,
    enabled: row.enabled,
    version: row.content_version,
    frames: (row.frames ?? []).map((frame: any) => ({
      id: frame.id,
      order: frame.sort_order,
      artKey: frame.art_key,
      durationMs: frame.duration_ms ?? undefined,
      offsetX: frame.offset_x ?? undefined,
      offsetY: frame.offset_y ?? undefined,
      scale: frame.scale ?? undefined,
      flipX: frame.flip_x,
      note: frame.note ?? undefined,
    })),
  };
}

function nodeModel(row: any) {
  return { id: row.id, chapterId: row.chapter_id, stageId: row.stage_id, name: row.name,
    x: row.x, y: row.y, type: row.node_type, iconArtKey: row.icon_art_key ?? undefined,
    isStart: row.is_start, isEnd: row.is_end, order: row.sort_order,
    recommendedPower: row.recommended_power, description: row.description ?? undefined, enabled: row.enabled };
}

function connectionModel(row: any) {
  return { id: row.id, chapterId: row.chapter_id, fromNodeId: row.from_node_id,
    toNodeId: row.to_node_id, pathType: row.path_type, oneWay: row.one_way,
    order: row.sort_order, enabled: row.enabled };
}

function progressionObjective(x: any) {
  return { id: x.objective_key, name: x.name, type: x.objective_type, required: x.required,
    params: x.params_json ?? {}, order: x.sort_order, displayText: x.display_text,
    progressDisplay: x.progress_display, starEligible: x.star_eligible, enabled: x.enabled };
}

function progressionRewardEntry(x: any) {
  return { id: x.entry_key, rewardType: x.reward_type, rewardRefId: x.reward_ref_id,
    minQuantity: x.min_quantity, maxQuantity: x.max_quantity, probability: x.probability,
    guaranteed: x.guaranteed, enabled: x.enabled };
}

function progressionUnlockRule(x: any) {
  return { id: x.rule_key, type: x.rule_type, prerequisiteStageId: x.prerequisite_stage_id ?? undefined,
    requiredStars: x.required_stars, nextStageId: x.next_stage_id ?? undefined, enabled: x.enabled };
}
