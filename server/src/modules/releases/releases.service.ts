import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SnapshotGeneratorService } from '../../infrastructure/snapshot-generator/snapshot-generator.service';
import { ContentValidationService } from '../content-validation/content-validation.service';
import { entryData, layerData, layoutData, spawnData } from '../content/stage-orchestration.mapper';
import { flowCreateRow, flowPatchRow, stepRow } from '../tutorials/tutorial.mapper';

@Injectable()
export class ReleasesService implements OnModuleInit {
  private publishing = false;
  constructor(private readonly prisma: PrismaService, private readonly validation: ContentValidationService, private readonly snapshots: SnapshotGeneratorService) {}

  async onModuleInit(): Promise<void> {
    for (const journal of this.snapshots.listPublishJournals()) {
      const [release, state] = await Promise.all([
        this.prisma.contentRelease.findUnique({ where: { id: journal.releaseId } }),
        this.prisma.contentSystemState.findUnique({ where: { id: 'singleton' } }),
      ]);
      const committed = release?.status === 'published' && state?.current_release_id === journal.releaseId;
      if (!committed) {
        this.snapshots.restorePublishedState(journal.state);
        if (release) await this.prisma.contentRelease.update({ where: { id: release.id }, data: { status: 'failed', failure_reason: 'interrupted-publish-recovered' } });
      }
      this.snapshots.clearPublishJournal(journal.releaseId);
    }
  }

  async status() {
    const [state, release] = await Promise.all([
      this.prisma.contentSystemState.findUnique({ where: { id: 'singleton' } }),
      this.prisma.contentRelease.findFirst({ orderBy: { created_at: 'desc' } }),
    ]);
    return { state, release };
  }

  async publish(createdBy?: string) {
    if (this.publishing) throw new ConflictException('正在发布中，请稍后重试。');
    this.publishing = true;
    let release: any;
    try {
      const validation = await this.validation.validate();
      if (!validation.valid) throw new ConflictException({ code: 'CONTENT_VALIDATION_FAILED', validation });
      const releaseVersion = await this.nextVersion();
      release = await this.prisma.contentRelease.create({
        data: { release_version: releaseVersion, status: 'publishing', validation_error_count: 0, validation_warning_count: 0, content_summary_json: validation, created_by: createdBy },
      });
      const animationSnapshot = await this.snapshots.buildAnimationManifestSnapshot(release.id, releaseVersion);
      const stageSnapshot = await this.snapshots.buildStageOrchestrationSnapshot(release.id, releaseVersion);
      const progressionSnapshot = await this.snapshots.buildStageProgressionSnapshot(release.id, releaseVersion);
      const campaignSnapshot = await this.snapshots.buildCampaignSnapshot(release.id, releaseVersion);
      const tutorialSnapshot = await this.snapshots.buildTutorialSnapshot(release.id, releaseVersion);
      const artSnapshot = await this.snapshots.buildArtManifestSnapshot(release.id, releaseVersion);
      const snapshot = await this.snapshots.buildSnapshot(release.id, releaseVersion, artSnapshot, animationSnapshot, stageSnapshot, progressionSnapshot, campaignSnapshot, tutorialSnapshot);
      await this.prisma.contentReleaseSnapshot.create({ data: { release_id: release.id, schema_version: 1, snapshot_json: snapshot as any, checksum: snapshot.checksum } });
      const publishedState = this.snapshots.capturePublishedState(artSnapshot, tutorialSnapshot);
      try {
        this.snapshots.writePublishJournal(release.id, publishedState);
        const artPaths = await this.snapshots.writeArtManifestSnapshot(artSnapshot);
        const animationPaths = await this.snapshots.writeAnimationManifestSnapshot(animationSnapshot);
        const stagePaths = await this.snapshots.writeStageOrchestrationSnapshot(stageSnapshot);
        const progressionPaths = await this.snapshots.writeStageProgressionSnapshot(progressionSnapshot);
        const campaignPaths = await this.snapshots.writeCampaignSnapshot(campaignSnapshot);
        const tutorialPaths = await this.snapshots.writeTutorialSnapshot(tutorialSnapshot);
        const paths = await this.snapshots.writeSnapshot(snapshot);
        await this.prisma.$transaction(async tx => {
          await this.snapshots.markArtVersionsPublished(artSnapshot, tx);
          await tx.contentRelease.update({ where: { id: release.id }, data: { status: 'published', snapshot_checksum: snapshot.checksum, snapshot_path: paths.jsonPath, published_at: new Date() } });
          await tx.contentSystemState.update({ where: { id: 'singleton' }, data: { draft_dirty: false, published_revision: { increment: 1 }, current_release_id: release.id } });
        }, { maxWait: 10000, timeout: 60000 });
        try { this.snapshots.clearPublishJournal(release.id); } catch { /* 启动恢复会确认已提交发布 */ }
        return { releaseId: release.id, releaseVersion, checksum: snapshot.checksum, paths: { ...paths, artJsonPath: artPaths.jsonPath, artTsPath: artPaths.tsPath, animationJsonPath: animationPaths.jsonPath, animationTsPath: animationPaths.tsPath, stageJsonPath: stagePaths.jsonPath, stageTsPath: stagePaths.tsPath, progressionJsonPath: progressionPaths.jsonPath, progressionTsPath: progressionPaths.tsPath, campaignJsonPath: campaignPaths.jsonPath, campaignTsPath: campaignPaths.tsPath, tutorialJsonPath: tutorialPaths.jsonPath, tutorialTsPath: tutorialPaths.tsPath, tutorialHistoryJsonPath: tutorialPaths.historyJsonPath } };
      } catch (error) {
        this.snapshots.restorePublishedState(publishedState);
        try { this.snapshots.clearPublishJournal(release.id); } catch { /* 保留日志供启动恢复 */ }
        throw error;
      }
    } catch (error) {
      if (release) {
        try {
          await this.prisma.contentRelease.update({
            where: { id: release.id }, data: { status: 'failed', failure_reason: String(error) },
          });
        } catch { /* 保留原始发布异常 */ }
      }
      throw error;
    } finally {
      this.publishing = false;
    }
  }

  list() {
    return this.prisma.contentRelease.findMany({ orderBy: { created_at: 'desc' } });
  }

  async get(id: string) {
    const release = await this.prisma.contentRelease.findUnique({ where: { id } });
    if (!release) throw new NotFoundException(id);
    return release;
  }

  async snapshot(id: string) {
    const snapshot = await this.prisma.contentReleaseSnapshot.findFirst({ where: { release_id: id } });
    if (!snapshot) throw new NotFoundException(id);
    return snapshot;
  }

  async restore(id: string) {
    const snapshot = await this.snapshot(id);
    const data = snapshot.snapshot_json as any;
    const hasTutorial = Array.isArray(data.tutorialDefinitions);
    await this.prisma.$transaction(async tx => {
      for (const enemy of data.enemies ?? []) await tx.contentEnemyTemplate.upsert({ where: { id: enemy.id }, create: this.enemyRow(enemy), update: this.enemyRow(enemy) });
      for (const bg of data.backgrounds ?? []) await tx.contentBackgroundTheme.upsert({ where: { id: bg.id }, create: this.backgroundRow(bg), update: this.backgroundRow(bg) });
      for (const hero of data.heroVisuals ?? data.heroes ?? []) await tx.contentHeroVisual.upsert({ where: { id: hero.id }, create: this.heroRow(hero), update: this.heroRow(hero) });
      for (const clip of data.animationClips ?? []) await this.restoreAnimationClip(tx, clip);
      for (const art of data.artResources ?? []) {
        await tx.contentArtResource.updateMany({ where: { art_key: art.artKey }, data: { current_draft_version_id: art.versionId, row_version: { increment: 1 } } as any });
        await tx.contentChangeLog.create({ data: { entity_type: 'art-resource', entity_id: art.artKey, action_type: 'restore-art-version-to-draft', after_json: art } });
      }
      for (const stage of data.stages ?? []) {
        await this.deleteStageChildren(tx, stage.id);
        await tx.contentStage.upsert({ where: { id: stage.id }, create: this.stageRow(stage), update: this.stageRow(stage) });
        await this.writeStageChildren(tx, stage.id, stage);
      }
      for (const progression of data.stageProgressionDefinitions ?? []) await this.restoreStageProgression(tx, progression);
      for (const orchestration of data.stageOrchestrationDefinitions ?? []) await this.restoreStageOrchestration(tx, orchestration);
      for (const campaign of data.campaignDefinitions ?? data.campaigns ?? []) await this.restoreCampaign(tx, campaign);
      if (hasTutorial) await this.restoreTutorials(tx, data.tutorialDefinitions);
      await tx.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
      await tx.contentChangeLog.create({ data: { entity_type: 'release', entity_id: id, action_type: 'restore', after_json: data } });
    }, { maxWait: 10000, timeout: 20000 });
    return { ok: true, restoredReleaseId: id, tutorialRestore: hasTutorial ? 'restored' : 'not-declared-noop' };
  }

  private async restoreTutorials(tx: any, flows: any[]) {
    const flowIds = new Set(flows.map(flow => flow.id));
    const stepIds = new Set(flows.flatMap(flow => (flow.steps ?? []).map((step: any) => step.id)));
    const transitionIds = new Set(flows.flatMap(flow => (flow.transitions ?? []).map((item: any) => item.id)));
    const ruleIds = new Set(flows.flatMap(flow => (flow.unlockRules ?? []).map((item: any) => item.id)));
    for (const flow of flows) {
      await tx.contentTutorialFlow.upsert({ where: { id: flow.id }, create: flowCreateRow(flow),
        update: { ...flowPatchRow(flow), deleted_at: null, row_version: { increment: 1 } } });
      for (const step of flow.steps ?? []) await tx.contentTutorialStep.upsert({ where: { id: step.id },
        create: stepRow(flow.id, step, true), update: { ...stepRow(flow.id, step), deleted_at: null, row_version: { increment: 1 } } });
      for (const [index, item] of (flow.transitions ?? []).entries()) await tx.contentTutorialStepTransition.upsert({ where: { id: item.id },
        create: restoreTransitionRow(flow.id, item, index),
        update: { ...restoreTransitionRow(flow.id, item, index), id: undefined, row_version: { increment: 1 } } });
      for (const [index, item] of (flow.unlockRules ?? []).entries()) await tx.contentFeatureUnlockRule.upsert({ where: { id: item.id },
        create: restoreRuleRow(flow.id, item, index),
        update: { ...restoreRuleRow(flow.id, item, index), id: undefined, row_version: { increment: 1 } } });
      await tx.contentChangeLog.create({ data: { entity_type: 'tutorial-flow', entity_id: flow.id,
        action_type: 'restore-release-to-draft', after_json: flow } });
    }
    await softDeleteMissing(tx.contentFeatureUnlockRule, ruleIds);
    await softDeleteMissing(tx.contentTutorialStepTransition, transitionIds);
    await softDeleteMissing(tx.contentTutorialStep, stepIds);
    await softDeleteMissing(tx.contentTutorialFlow, flowIds);
  }

  private async nextVersion() {
    const latest = await this.prisma.contentRelease.findFirst({ orderBy: { release_version: 'desc' } });
    const latestNumber = Number(String((latest as any)?.release_version ?? '').match(/^R(\d+)$/)?.[1] ?? 0);
    if (latestNumber > 0) return `R${String(latestNumber + 1).padStart(6, '0')}`;
    const count = await this.prisma.contentRelease.count();
    return `R${String(count + 1).padStart(6, '0')}`;
  }

  private enemyRow(enemy: any) {
    return { id: enemy.id, name: enemy.name, description: enemy.description, category: enemy.category, behavior_type: enemy.behaviorType, visual_json: enemy.visual, stats_json: enemy.stats, combat_json: enemy.combat, rewards_json: enemy.rewards, tags_json: enemy.tags, enabled: enemy.enabled, content_version: enemy.version, row_version: 1, deleted_at: null };
  }

  private backgroundRow(bg: any) {
    return { id: bg.id, name: bg.name, description: bg.description, art_json: bg.art, colors_json: bg.colors, rendering_json: bg.rendering, enabled: bg.enabled, content_version: bg.version, row_version: 1, deleted_at: null };
  }

  private heroRow(hero: any) {
    return { id: hero.id, name: hero.name, description: hero.description, visual_json: hero.visual, skills_json: hero.skills, enabled: hero.enabled, content_version: hero.version, row_version: 1, deleted_at: null };
  }

  private stageRow(stage: any): any {
    return {
      id: stage.id,
      legacy_stage_id: stage.legacyStageId,
      name: stage.name,
      description: stage.description,
      mode: stage.mode === 'fixed-battle' ? 'fixed_battle' : 'explore',
      hero_visual_template_id: stage.heroVisualTemplateId,
      background_theme_id: stage.backgroundThemeId,
      world_width: stage.exploration?.worldWidth,
      world_height: stage.exploration?.worldHeight,
      enabled: stage.enabled,
      content_version: stage.version,
      row_version: 1,
      deleted_at: null,
    };
  }

  private async deleteStageChildren(tx: any, stageId: string) {
    const waves = await tx.contentStageWave.findMany({ where: { stage_id: stageId } });
    await tx.contentStageWaveEnemyGroup.deleteMany({ where: { stage_wave_id: { in: waves.map((w: any) => w.id) } } });
    await tx.contentStageWave.deleteMany({ where: { stage_id: stageId } });
    await tx.contentExploreSpawnGroup.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageObjective.deleteMany({ where: { stage_id: stageId } });
  }

  private async writeStageChildren(tx: any, stageId: string, stage: any) {
    for (const [i, wave] of (stage.waves ?? []).entries()) {
      const row = await tx.contentStageWave.create({ data: { stage_id: stageId, wave_no: wave.wave, wave_key: wave.id, name: wave.name, message: wave.message, spawn_delay: wave.spawnDelay, sort_order: i } });
      for (const [j, group] of (wave.groups ?? []).entries()) {
        await tx.contentStageWaveEnemyGroup.create({ data: { stage_wave_id: row.id, enemy_template_id: group.enemyTemplateId, enemy_count: group.count, spawn_area_id: group.spawnAreaId ?? group.spawnGroup, spawn_interval: group.spawnInterval, level_multiplier: group.levelMultiplier, sort_order: j } });
      }
    }
    for (const [i, group] of (stage.exploration?.spawnGroups ?? []).entries()) {
      await tx.contentExploreSpawnGroup.create({ data: { stage_id: stageId, group_key: group.id, enemy_template_id: group.enemyTemplateId, spawn_x: group.spawnPoint.x, spawn_y: group.spawnPoint.y, spawn_radius: group.spawnPoint.radius, initial_count: group.initialCount, max_alive: group.maxAlive, respawn_interval: group.respawnInterval, sort_order: i } });
    }
    for (const [i, objective] of (stage.objectives ?? []).entries()) {
      await tx.contentStageObjective.create({ data: { stage_id: stageId, objective_type: objective.type, required_count: objective.required, sort_order: i, config_json: objective.config } });
    }
  }

  private async restoreAnimationClip(tx: any, clip: any) {
    const existing = await tx.contentAnimationClip.findUnique({ where: { clip_key: clip.key } });
    if (existing) {
      await tx.contentAnimationFrame.deleteMany({ where: { clip_id: existing.id } });
      await tx.contentAnimationClip.update({ where: { clip_key: clip.key }, data: this.animationRow(clip) });
      await this.writeAnimationFrames(tx, existing.id, clip);
      return;
    }
    const row = await tx.contentAnimationClip.create({ data: this.animationRow(clip, true) });
    await this.writeAnimationFrames(tx, row.id, clip);
  }

  private async restoreStageProgression(tx: any, value: any) {
    const pools = await tx.contentStageRewardPool.findMany({ where: { stage_id: value.stageId } });
    await tx.contentStageRewardEntry.deleteMany({ where: { pool_id: { in: pools.map((x: any) => x.id) } } });
    await tx.contentStageRewardPool.deleteMany({ where: { stage_id: value.stageId } });
    await tx.contentStageProgressionObjective.deleteMany({ where: { stage_id: value.stageId } });
    await tx.contentStageUnlockRule.deleteMany({ where: { stage_id: value.stageId } });
    await tx.contentStageProgressionConfig.upsert({ where: { stage_id: value.stageId },
      create: progressionConfig(value), update: { ...progressionConfig(value), row_version: { increment: 1 } } });
    await tx.contentStageProgressionObjective.createMany({ data: (value.objectives ?? []).map((x: any, i: number) => ({
      stage_id: value.stageId, objective_key: x.id, name: x.name, objective_type: x.type, required: x.required,
      params_json: x.params, display_text: x.displayText, progress_display: x.progressDisplay,
      star_eligible: x.starEligible, enabled: x.enabled, sort_order: x.order ?? i,
    })) });
    for (const [i, pool] of (value.rewardPools ?? []).entries()) {
      const row = await tx.contentStageRewardPool.create({ data: { stage_id: value.stageId, pool_key: pool.id,
        name: pool.name, group_type: pool.group, objective_key: pool.objectiveId, selection_mode: pool.selectionMode,
        enabled: pool.enabled ?? true, sort_order: i } });
      await tx.contentStageRewardEntry.createMany({ data: (pool.entries ?? []).map((x: any, j: number) => ({ pool_id: row.id,
        entry_key: x.id, reward_type: x.rewardType, reward_ref_id: x.rewardRefId, min_quantity: x.minQuantity,
        max_quantity: x.maxQuantity, probability: x.probability, guaranteed: x.guaranteed, enabled: x.enabled, sort_order: j })) });
    }
    await tx.contentStageUnlockRule.createMany({ data: (value.unlockRules ?? []).map((x: any, i: number) => ({
      stage_id: value.stageId, rule_key: x.id, rule_type: x.type, prerequisite_stage_id: x.prerequisiteStageId,
      required_stars: x.requiredStars, next_stage_id: x.nextStageId, enabled: x.enabled, sort_order: i,
    })) });
  }

  private async restoreStageOrchestration(tx: any, value: any) {
    const stageId = value.stageId;
    const oldWaves = await tx.contentStageOrchestrationWave.findMany({ where: { stage_id: stageId } });
    await tx.contentStageWaveEntry.deleteMany({ where: { wave_id: { in: oldWaves.map((item: any) => item.id) } } });
    await tx.contentStageOrchestrationWave.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageLayer.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageSpawnPoint.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageSceneLayout.upsert({ where: { stage_id: stageId }, create: { ...layoutData(stageId, value), row_version: 1 }, update: { ...layoutData(stageId, value), row_version: { increment: 1 } } });
    await tx.contentStageLayer.createMany({ data: (value.layers ?? []).map((item: any, index: number) => layerData(stageId, item, index)) });
    await tx.contentStageSpawnPoint.createMany({ data: (value.spawnPoints ?? []).map((item: any, index: number) => spawnData(stageId, item, index)) });
    for (const [index, wave] of (value.waves ?? []).entries()) {
      const row = await tx.contentStageOrchestrationWave.create({ data: { stage_id: stageId, wave_key: wave.id,
        name: wave.name, wave_order: wave.order ?? index, start_trigger: wave.startTrigger?.type ?? 'stage-start',
        start_delay_ms: wave.startDelayMs ?? 0, max_alive: wave.maxAlive ?? 8,
        completion_rule: wave.completionRule?.type ?? 'all-enemies-cleared', completion_delay_ms: wave.completionDelayMs ?? 0,
        next_wave: wave.nextWave, enabled: wave.enabled ?? true, sort_order: index } });
      await tx.contentStageWaveEntry.createMany({ data: (wave.entries ?? []).map((item: any, entryIndex: number) => entryData(row.id, item, entryIndex)) });
    }
  }

  private async restoreCampaign(tx: any, campaign: any) {
    await tx.contentCampaign.upsert({ where: { id: campaign.id }, create: campaignData(campaign), update: { ...campaignData(campaign), row_version: { increment: 1 } } });
    for (const chapter of campaign.chapters ?? []) {
      await tx.contentCampaignNodeConnection.deleteMany({ where: { chapter_id: chapter.id } });
      await tx.contentCampaignStageNode.deleteMany({ where: { chapter_id: chapter.id } });
      await tx.contentCampaignChapter.upsert({ where: { id: chapter.id }, create: chapterData(chapter), update: { ...chapterData(chapter), row_version: { increment: 1 } } });
      await tx.contentCampaignStageNode.createMany({ data: (chapter.nodes ?? []).map((item: any) => campaignNodeData(chapter.id, item)) });
      await tx.contentCampaignNodeConnection.createMany({ data: (chapter.connections ?? []).map((item: any) => campaignConnectionData(chapter.id, item)) });
    }
  }

  private animationRow(clip: any, creating = false) {
    return { clip_key: creating ? clip.key : undefined, name: clip.name, target_type: clip.targetType, state: clip.state, default_fps: clip.defaultFps, default_frame_duration_ms: clip.defaultFrameDurationMs, loop: clip.loop, play_mode: clip.playMode, end_behavior: clip.endBehavior ?? 'hold-last-frame', enabled: clip.enabled ?? true, content_version: clip.version ?? 1, row_version: 1, deleted_at: null };
  }

  private async writeAnimationFrames(tx: any, clipId: string, clip: any) {
    for (const frame of clip.frames ?? []) await tx.contentAnimationFrame.create({ data: { clip_id: clipId, sort_order: frame.order, art_key: frame.artKey, duration_ms: frame.durationMs, offset_x: frame.offsetX, offset_y: frame.offsetY, scale: frame.scale, flip_x: frame.flipX ?? false, note: frame.note } });
  }
}

function progressionConfig(value: any) {
  return { stage_id: value.stageId, recommended_power: value.recommendedPower ?? 0,
    victory_text: value.victoryText, failure_text: value.failureText };
}
function campaignData(value: any) { return { id: value.id, name: value.name, subtitle: value.subtitle,
  description: value.description, cover_art_key: value.coverArtKey, default_chapter_id: value.defaultChapterId,
  sort_order: value.order ?? 0, enabled: value.enabled ?? true, schema_version: value.schemaVersion ?? 1,
  content_version: value.contentVersion ?? 1, row_version: 1, deleted_at: null }; }
function chapterData(value: any) { return { id: value.id, campaign_id: value.campaignId, chapter_no: value.chapterNo,
  name: value.name, subtitle: value.subtitle, description: value.description, background_art_key: value.backgroundArtKey,
  canvas_width: value.canvasWidth, canvas_height: value.canvasHeight, viewport_x: value.viewportX ?? 0,
  viewport_y: value.viewportY ?? 0, enabled: value.enabled ?? true, completion_text: value.completionText,
  completion_reward_ref: value.completionRewardRef, row_version: 1, deleted_at: null }; }
function campaignNodeData(chapterId: string, value: any) { return { id: value.id, chapter_id: chapterId,
  stage_id: value.stageId, name: value.name, x: value.x, y: value.y, node_type: value.type,
  icon_art_key: value.iconArtKey, is_start: value.isStart, is_end: value.isEnd, sort_order: value.order,
  recommended_power: value.recommendedPower, description: value.description, enabled: value.enabled ?? true }; }
function campaignConnectionData(chapterId: string, value: any) { return { id: value.id, chapter_id: chapterId,
  from_node_id: value.fromNodeId, to_node_id: value.toNodeId, path_type: value.pathType,
  one_way: value.oneWay, sort_order: value.order, enabled: value.enabled ?? true }; }

function restoreTransitionRow(flowId: string, item: any, index: number) {
  return { id: item.id, flow_id: flowId, from_step_id: item.fromStepId, to_step_id: item.toStepId,
    condition_type: item.conditionType, condition_json: item.condition ?? {}, sort_order: item.order ?? index,
    enabled: item.enabled ?? true, row_version: 1, deleted_at: null };
}
function restoreRuleRow(flowId: string, item: any, index: number) {
  return { id: item.id, flow_id: flowId, step_id: item.stepId ?? null, feature_id: item.featureId,
    unlock_trigger: item.unlockTrigger, condition_json: item.condition ?? {}, unlock_on_skip: item.unlockOnSkip ?? false,
    sort_order: item.order ?? index, enabled: item.enabled ?? true, row_version: 1, deleted_at: null };
}
async function softDeleteMissing(delegate: any, keep: Set<string>) {
  const rows = await delegate.findMany({ where: { deleted_at: null } });
  for (const row of rows) if (!keep.has(row.id)) await delegate.updateMany({ where: { id: row.id,
    row_version: row.row_version, deleted_at: null }, data: { enabled: false, deleted_at: new Date(), row_version: { increment: 1 } } });
}
