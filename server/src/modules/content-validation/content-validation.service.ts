import { Injectable } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { projectRoot } from '../../common/utils/safe-path';
import { validateCampaignContent } from './campaign-content.validation';
import { validateTutorialContent } from './tutorial-content.validation';

@Injectable()
export class ContentValidationService {
  constructor(private readonly prisma: PrismaService) {}

  async validate() {
    const errors: any[] = [];
    const artVersionDelegate = (this.prisma as any).contentArtResourceVersion;
    const animationDelegate = (this.prisma as any).contentAnimationClip;
    const [enemies, backgrounds, heroes, stages, waves, waveGroups, spawns, objectives, artResources, artVersions, animationClips, layouts, layers, stageSpawnPoints, orchestrationWaves, waveEntries, progressionObjectives, rewardPools, rewardEntries, unlockRules, rewardDefinitions] = await Promise.all([
      this.prisma.contentEnemyTemplate.findMany({ where: { enabled: true, deleted_at: null } }),
      this.prisma.contentBackgroundTheme.findMany({ where: { enabled: true, deleted_at: null } }),
      this.prisma.contentHeroVisual.findMany({ where: { enabled: true, deleted_at: null } }),
      this.prisma.contentStage.findMany({ where: { enabled: true, deleted_at: null } }),
      this.prisma.contentStageWave.findMany(),
      this.prisma.contentStageWaveEnemyGroup.findMany(),
      this.prisma.contentExploreSpawnGroup.findMany(),
      this.prisma.contentStageObjective.findMany(),
      this.prisma.contentArtResource.findMany({ where: { enabled: true } }),
      artVersionDelegate?.findMany ? artVersionDelegate.findMany() : Promise.resolve([]),
      animationDelegate?.findMany ? animationDelegate.findMany({ where: { enabled: true, deleted_at: null }, include: { frames: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageSceneLayout?.findMany ? (this.prisma as any).contentStageSceneLayout.findMany({ where: { enabled: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageLayer?.findMany ? (this.prisma as any).contentStageLayer.findMany({ where: { enabled: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageSpawnPoint?.findMany ? (this.prisma as any).contentStageSpawnPoint.findMany({ where: { enabled: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageOrchestrationWave?.findMany ? (this.prisma as any).contentStageOrchestrationWave.findMany({ where: { enabled: true } }) : Promise.resolve([]),
      (this.prisma as any).contentStageWaveEntry?.findMany ? (this.prisma as any).contentStageWaveEntry.findMany({ where: { enabled: true } }) : Promise.resolve([]),
      optionalRows(this.prisma, 'contentStageProgressionObjective'),
      optionalRows(this.prisma, 'contentStageRewardPool'),
      optionalRows(this.prisma, 'contentStageRewardEntry'),
      optionalRows(this.prisma, 'contentStageUnlockRule'),
      optionalRows(this.prisma, 'contentRewardDefinition'),
    ]);
    const [campaigns, campaignChapters, campaignNodes, campaignConnections] = await Promise.all([
      optionalRows(this.prisma, 'contentCampaign'), optionalRows(this.prisma, 'contentCampaignChapter'),
      optionalRows(this.prisma, 'contentCampaignStageNode'), optionalRows(this.prisma, 'contentCampaignNodeConnection'),
    ]);
    const [tutorialFlows, tutorialSteps, tutorialTransitions, tutorialRules] = await Promise.all([
      activeOptionalRows(this.prisma, 'contentTutorialFlow'), activeOptionalRows(this.prisma, 'contentTutorialStep'),
      activeOptionalRows(this.prisma, 'contentTutorialStepTransition'), activeOptionalRows(this.prisma, 'contentFeatureUnlockRule'),
    ]);
    const enemyIds = new Set(enemies.map(x => x.id));
    const backgroundIds = new Set(backgrounds.map(x => x.id));
    const heroIds = new Set(heroes.map(x => x.id));
    const stageById = new Map(stages.map(x => [x.id, x]));
    const waveById = new Map(waves.map(x => [x.id, x]));
    const artByKey = new Map(artResources.map(x => [x.art_key, x]));
    const activeTutorialArtByKey = new Map(artResources.filter((x: any) => x.enabled !== false && !x.deleted_at)
      .map((x: any) => [x.art_key, x]));
    const versionById = new Map((artVersions as any[]).map(x => [x.id, x]));
    const clipKeys = new Set((animationClips as any[]).map(x => x.clip_key));
    for (const art of artResources as any[]) {
      checkArt(errors, artByKey, versionById, 'artResource', art.art_key, 'currentDraftVersion', art.art_key);
    }
    for (const clip of animationClips as any[]) validateAnimationClip(errors, clip, artByKey, versionById);
    validateStageOrchestration(errors, layouts as any[], layers as any[], stageSpawnPoints as any[], orchestrationWaves as any[], waveEntries as any[], stageById, enemyIds, artByKey, versionById);
    validateStageProgression(errors, progressionObjectives as any[], rewardPools as any[], rewardEntries as any[], unlockRules as any[], rewardDefinitions as any[], stageById);
    validateCampaignContent(errors, campaigns, campaignChapters, campaignNodes, campaignConnections, stageById, artByKey, versionById);
    validateTutorialContent(errors, { flows: tutorialFlows, steps: tutorialSteps, transitions: tutorialTransitions, rules: tutorialRules },
      { stageIds: new Set(stages.map(x => x.id)), campaignIds: new Set(campaigns.filter((x: any) => x.enabled !== false && !x.deleted_at).map((x: any) => x.id)),
        artByKey: activeTutorialArtByKey, versionById });
    for (const step of tutorialSteps as any[]) {
      checkArt(errors, activeTutorialArtByKey, versionById, 'tutorial', step.id, 'avatarArtKey', step.avatar_art_key);
      checkArt(errors, activeTutorialArtByKey, versionById, 'tutorial', step.id, 'arrowArtKey', step.arrow_json?.artKey);
      if (step.target_type === 'art') checkArt(errors, activeTutorialArtByKey, versionById, 'tutorial', step.id, 'targetId', step.target_id);
    }
    for (const enemy of enemies) validateEnemy(errors, enemy, artByKey, versionById, clipKeys);
    for (const background of backgrounds) validateBackground(errors, background, artByKey, versionById);
    for (const hero of heroes) validateHero(errors, hero, artByKey, versionById, clipKeys);
    for (const stage of stages) {
      if (!backgroundIds.has(stage.background_theme_id)) errors.push(issue('stage', stage.id, 'backgroundThemeId', '背景主题不存在或未启用'));
      if (!heroIds.has(stage.hero_visual_template_id)) errors.push(issue('stage', stage.id, 'heroVisualTemplateId', '主角表现不存在或未启用'));
      const stageWaves = waves.filter(x => x.stage_id === stage.id);
      if (stage.mode === 'fixed_battle' && stageWaves.length === 0) errors.push(issue('stage', stage.id, 'waves', '固定屏关卡必须配置波次'));
      for (const [wi, wave] of stageWaves.entries()) {
        const groups = waveGroups.filter(x => x.stage_wave_id === wave.id);
        if (groups.length === 0) errors.push(issue('stage', stage.id, `waves[${wi}].groups`, '波次必须配置敌人组'));
        for (const [gi, group] of groups.entries()) {
          if (!enemyIds.has(group.enemy_template_id)) errors.push(issue('stage', stage.id, `waves[${wi}].groups[${gi}].enemyTemplateId`, '敌人不存在或未启用'));
          if (group.enemy_count <= 0) errors.push(issue('stage', stage.id, `waves[${wi}].groups[${gi}].count`, '必须大于 0'));
        }
      }
    }
    for (const spawn of spawns) {
      if (!enemyIds.has(spawn.enemy_template_id)) errors.push(issue('exploreSpawn', spawn.group_key, 'enemyTemplateId', '敌人不存在或未启用'));
      if (spawn.initial_count > spawn.max_alive) errors.push(issue('exploreSpawn', spawn.group_key, 'initialCount', '不得大于 maxAlive'));
      const stage = stageById.get(spawn.stage_id);
      if (!stage) errors.push(issue('exploreSpawn', spawn.group_key, 'stageId', '关卡不存在或未启用'));
      if (stage?.world_width != null && (spawn.spawn_x < 0 || spawn.spawn_x > stage.world_width)) errors.push(issue('exploreSpawn', spawn.group_key, 'spawnPoint.x', '坐标超出世界范围'));
      if (stage?.world_height != null && (spawn.spawn_y < 0 || spawn.spawn_y > stage.world_height)) errors.push(issue('exploreSpawn', spawn.group_key, 'spawnPoint.y', '坐标超出世界范围'));
      if (spawn.spawn_radius <= 0 || spawn.respawn_interval <= 0) errors.push(issue('exploreSpawn', spawn.group_key, 'spawnPoint', '刷新半径和间隔必须大于 0'));
    }
    for (const objective of objectives) {
      const stage = stageById.get(objective.stage_id);
      if (!stage) errors.push(issue('objective', objective.id, 'stageId', '关卡不存在或未启用'));
      if (objective.required_count <= 0) errors.push(issue('objective', objective.id, 'required', '必须大于 0'));
    }
    for (const group of waveGroups) {
      if (!waveById.has(group.stage_wave_id)) errors.push(issue('stageWaveGroup', group.id, 'stageWaveId', '波次不存在'));
    }
    const result = { valid: errors.length === 0, errorCount: errors.length, warningCount: 0, errors, warnings: [] };
    await this.prisma.contentSystemState.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', last_validation_at: new Date(), last_validation_result_json: result },
      update: { last_validation_at: new Date(), last_validation_result_json: result },
    });
    return result;
  }
}

function issue(entityType: string, entityId: string, field: string, message: string) {
  return { entityType, entityId, field, reason: message, message, suggestion: '请在对应编辑页面修正后重新校验。' };
}

function validateEnemy(errors: any[], row: any, artByKey: Map<string, any>, versionById: Map<string, any>, clipKeys: Set<string>): void {
  const stats = row.stats_json ?? {};
  const combat = row.combat_json ?? {};
  const visual = row.visual_json ?? {};
  if ((stats.maxHp ?? 0) <= 0) errors.push(issue('enemy', row.id, 'stats.maxHp', '必须大于 0'));
  if ((stats.attack ?? 0) < 0) errors.push(issue('enemy', row.id, 'stats.attack', '必须大于等于 0'));
  if ((stats.moveSpeed ?? 0) < 0) errors.push(issue('enemy', row.id, 'stats.moveSpeed', '必须大于等于 0'));
  if ((combat.attackInterval ?? 0) <= 0) errors.push(issue('enemy', row.id, 'combat.attackInterval', '必须大于 0'));
  if ((visual.displayScale ?? 0) <= 0) errors.push(issue('enemy', row.id, 'visual.displayScale', '必须大于 0'));
  if (visual.shadowScale != null && visual.shadowScale < 0) errors.push(issue('enemy', row.id, 'visual.shadowScale', '不得小于 0'));
  for (const field of ['iconArtKey', 'idleArtKey', 'moveArtKey', 'attackArtKey', 'hitArtKey', 'deathArtKey']) {
    checkArt(errors, artByKey, versionById, 'enemy', row.id, `visual.${field}`, visual[field]);
  }
  checkClipBindings(errors, 'enemy', row.id, visual.animationClipKeys, clipKeys);
}

function validateBackground(errors: any[], row: any, artByKey: Map<string, any>, versionById: Map<string, any>): void {
  const art = row.art_json ?? {};
  const rendering = row.rendering_json ?? {};
  for (const field of ['backgroundArtKey', 'floorArtKey', 'lineArtKey', 'boundaryArtKey', 'zoneMarkArtKey']) {
    checkArt(errors, artByKey, versionById, 'background', row.id, `art.${field}`, art[field]);
  }
  for (const [i, key] of (art.decorationArtKeys ?? []).entries()) {
    checkArt(errors, artByKey, versionById, 'background', row.id, `art.decorationArtKeys[${i}]`, key);
  }
  if (rendering.tileWidth != null && rendering.tileWidth <= 0) errors.push(issue('background', row.id, 'rendering.tileWidth', '必须大于 0'));
  if (rendering.tileHeight != null && rendering.tileHeight <= 0) errors.push(issue('background', row.id, 'rendering.tileHeight', '必须大于 0'));
}

function validateHero(errors: any[], row: any, artByKey: Map<string, any>, versionById: Map<string, any>, clipKeys: Set<string>): void {
  const visual = row.visual_json ?? {};
  const skills = row.skills_json ?? {};
  if ((visual.displayScale ?? 0) <= 0) errors.push(issue('hero', row.id, 'visual.displayScale', '必须大于 0'));
  if (visual.shadowScale != null && visual.shadowScale < 0) errors.push(issue('hero', row.id, 'visual.shadowScale', '不得小于 0'));
  for (const field of ['iconArtKey', 'idleArtKey', 'moveArtKey', 'attackArtKey', 'hitArtKey', 'deathArtKey']) {
    checkArt(errors, artByKey, versionById, 'hero', row.id, `visual.${field}`, visual[field]);
  }
  for (const field of ['shieldIconArtKey', 'cannonIconArtKey', 'shieldEffectArtKey', 'cannonEffectArtKey']) {
    checkArt(errors, artByKey, versionById, 'hero', row.id, `skills.${field}`, skills[field]);
  }
  checkClipBindings(errors, 'hero', row.id, visual.animationClipKeys, clipKeys);
}

function validateAnimationClip(errors: any[], row: any, artByKey: Map<string, any>, versionById: Map<string, any>): void {
  const frames = [...(row.frames ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
  if (!row.clip_key) errors.push(issue('animationClip', row.id, 'clipKey', '不能为空'));
  if (!['enemy', 'hero', 'effect'].includes(row.target_type)) errors.push(issue('animationClip', row.clip_key, 'targetType', '不合法'));
  if (!['loop', 'once', 'hold-last-frame'].includes(row.play_mode)) errors.push(issue('animationClip', row.clip_key, 'playMode', '不合法'));
  if (!frames.length) errors.push(issue('animationClip', row.clip_key, 'frames', '至少需要一帧'));
  if (row.default_fps != null && row.default_fps <= 0) errors.push(issue('animationClip', row.clip_key, 'defaultFps', '必须大于 0'));
  if (row.default_frame_duration_ms != null && row.default_frame_duration_ms <= 0) errors.push(issue('animationClip', row.clip_key, 'defaultFrameDurationMs', '必须大于 0'));
  frames.forEach((frame: any, index: number) => {
    if (frame.sort_order !== index) errors.push(issue('animationClip', row.clip_key, `frames[${index}].order`, '帧顺序必须从 0 连续递增'));
    if (frame.duration_ms != null && frame.duration_ms <= 0) errors.push(issue('animationClip', row.clip_key, `frames[${index}].durationMs`, '必须大于 0'));
    checkArt(errors, artByKey, versionById, 'animationClip', row.clip_key, `frames[${index}].artKey`, frame.art_key);
  });
}

function validateStageOrchestration(errors: any[], layouts: any[], layers: any[], points: any[], waves: any[], entries: any[], stageById: Map<string, any>, enemyIds: Set<string>, artByKey: Map<string, any>, versionById: Map<string, any>): void {
  for (const layout of layouts) {
    if (!stageById.has(layout.stage_id)) errors.push(issue('stageOrchestration', layout.stage_id, 'stageId', '关卡不存在或未启用'));
    if (layout.canvas_width <= 0 || layout.canvas_height <= 0) errors.push(issue('stageOrchestration', layout.stage_id, 'canvas', '逻辑画布尺寸不合法'));
    const stagePoints = points.filter(point => point.stage_id === layout.stage_id);
    if (stagePoints.filter(point => point.spawn_type === 'hero').length !== 1) errors.push(issue('stageOrchestration', layout.stage_id, 'spawnPoints.hero', '必须有且仅有一个主角出生点'));
    if (layout.hero_spawn_point_key && !stagePoints.some(point => point.spawn_point_key === layout.hero_spawn_point_key)) errors.push(issue('stageOrchestration', layout.stage_id, 'heroSpawnPointId', '主角出生点不存在'));
  }
  for (const layer of layers) {
    if (layer.art_key) checkArt(errors, artByKey, versionById, 'stageLayer', layer.layer_key, 'artKey', layer.art_key);
    if (layer.opacity < 0 || layer.opacity > 1) errors.push(issue('stageLayer', layer.layer_key, 'opacity', '透明度必须在0到1之间'));
    if (layer.scale <= 0) errors.push(issue('stageLayer', layer.layer_key, 'scale', '缩放必须大于0'));
  }
  const pointByStage = new Map<string, Set<string>>();
  for (const point of points) {
    const set = pointByStage.get(point.stage_id) ?? new Set<string>();
    set.add(point.spawn_point_key);
    pointByStage.set(point.stage_id, set);
  }
  const waveById = new Map(waves.map(wave => [wave.id, wave]));
  for (const entry of entries) {
    const wave = waveById.get(entry.wave_id);
    if (!wave) errors.push(issue('stageWaveEntry', entry.entry_key, 'waveId', '波次不存在'));
    if (!enemyIds.has(entry.enemy_template_id)) errors.push(issue('stageWaveEntry', entry.entry_key, 'enemyTemplateId', '敌人不存在或未启用'));
    if (entry.quantity <= 0 || entry.spawn_interval_ms < 0) errors.push(issue('stageWaveEntry', entry.entry_key, 'quantity', '数量必须大于0且间隔不得为负'));
    if (wave && !pointByStage.get((wave as any).stage_id)?.has(entry.spawn_point_key)) errors.push(issue('stageWaveEntry', entry.entry_key, 'spawnPointId', '出生点不存在'));
  }
}

function validateStageProgression(errors: any[], objectives: any[], pools: any[], entries: any[], rules: any[], definitions: any[], stageById: Map<string, any>): void {
  const objectiveTypes = new Set(['clear-all-waves', 'survive-duration', 'hero-health-above', 'complete-within-duration', 'defeat-enemy-count']);
  const rewardTypes = new Set(['equipment', 'rune', 'material', 'currency']);
  const groups = new Set(['first-clear', 'repeat-clear', 'first-three-star', 'objective-bonus']);
  const refs = new Set(definitions.filter(x => x.enabled !== false).map(x => `${x.reward_type}:${x.reward_ref_id}`));
  const objectiveKeys = new Map<string, Set<string>>();
  for (const objective of objectives.filter(x => x.enabled !== false)) {
    const keys = objectiveKeys.get(objective.stage_id) ?? new Set<string>();
    if (keys.has(objective.objective_key)) errors.push(issue('stageObjective', objective.objective_key, 'id', '目标ID重复'));
    keys.add(objective.objective_key); objectiveKeys.set(objective.stage_id, keys);
    if (!stageById.has(objective.stage_id)) errors.push(issue('stageObjective', objective.objective_key, 'stageId', '关卡不存在'));
    if (!objectiveTypes.has(objective.objective_type)) errors.push(issue('stageObjective', objective.objective_key, 'type', '目标类型不合法'));
    const p = objective.params_json ?? {};
    if (objective.objective_type === 'complete-within-duration' && !(p.maxDurationSec > 0)) errors.push(issue('stageObjective', objective.objective_key, 'params.maxDurationSec', '必须大于0'));
    if (objective.objective_type === 'hero-health-above' && !(p.minHealthRatio >= 0 && p.minHealthRatio <= 1)) errors.push(issue('stageObjective', objective.objective_key, 'params.minHealthRatio', '必须在0到1'));
    if (objective.objective_type === 'survive-duration' && !(p.durationSec > 0)) errors.push(issue('stageObjective', objective.objective_key, 'params.durationSec', '必须大于0'));
    if (objective.objective_type === 'defeat-enemy-count' && !(p.count > 0)) errors.push(issue('stageObjective', objective.objective_key, 'params.count', '必须大于0'));
  }
  for (const stageId of new Set(objectives.map(x => x.stage_id))) if (!objectives.some(x => x.stage_id === stageId && x.enabled !== false && x.required)) errors.push(issue('stageProgression', stageId, 'objectives', '至少需要一个必需目标'));
  const poolById = new Map(pools.map(x => [x.id, x]));
  for (const pool of pools.filter(x => x.enabled !== false)) {
    if (!groups.has(pool.group_type)) errors.push(issue('stageRewardPool', pool.pool_key, 'group', '奖励组不合法'));
    if (pool.group_type === 'objective-bonus' && !objectiveKeys.get(pool.stage_id)?.has(pool.objective_key)) errors.push(issue('stageRewardPool', pool.pool_key, 'objectiveId', '目标引用不存在'));
  }
  for (const entry of entries.filter(x => x.enabled !== false)) {
    const pool: any = poolById.get(entry.pool_id);
    if (!pool) errors.push(issue('stageRewardEntry', entry.entry_key, 'poolId', '奖励池不存在'));
    if (!rewardTypes.has(entry.reward_type) || !refs.has(`${entry.reward_type}:${entry.reward_ref_id}`)) errors.push(issue('stageRewardEntry', entry.entry_key, 'rewardRefId', '奖励类型或引用不存在'));
    if (entry.min_quantity <= 0 || entry.max_quantity < entry.min_quantity) errors.push(issue('stageRewardEntry', entry.entry_key, 'quantity', '奖励数量不合法'));
    if (entry.probability < 0 || entry.probability > 1) errors.push(issue('stageRewardEntry', entry.entry_key, 'probability', '概率必须在0到1'));
  }
  validateUnlockGraph(errors, rules.filter(x => x.enabled !== false), stageById);
}

function validateUnlockGraph(errors: any[], rules: any[], stageById: Map<string, any>): void {
  const graph = new Map<string, string[]>();
  for (const rule of rules) {
    if (rule.prerequisite_stage_id && !stageById.has(rule.prerequisite_stage_id)) errors.push(issue('stageUnlockRule', rule.rule_key, 'prerequisiteStageId', '前置关卡不存在'));
    if (rule.next_stage_id && !stageById.has(rule.next_stage_id)) errors.push(issue('stageUnlockRule', rule.rule_key, 'nextStageId', '下一关不存在'));
    if (rule.next_stage_id === rule.stage_id) errors.push(issue('stageUnlockRule', rule.rule_key, 'nextStageId', '关卡不得自引用'));
    if (rule.next_stage_id) graph.set(rule.stage_id, [...(graph.get(rule.stage_id) ?? []), rule.next_stage_id]);
  }
  const visiting = new Set<string>(), done = new Set<string>();
  const visit = (id: string): boolean => { if (visiting.has(id)) return true; if (done.has(id)) return false; visiting.add(id); for (const next of graph.get(id) ?? []) if (visit(next)) return true; visiting.delete(id); done.add(id); return false; };
  for (const id of graph.keys()) if (visit(id)) { errors.push(issue('stageUnlockRule', id, 'dependencies', '检测到循环解锁依赖')); break; }
}

function optionalRows(prisma: any, delegate: string): Promise<any[]> {
  return prisma[delegate]?.findMany ? prisma[delegate].findMany() : Promise.resolve([]);
}

function activeOptionalRows(prisma: any, delegate: string): Promise<any[]> {
  return prisma[delegate]?.findMany ? prisma[delegate].findMany({ where: { enabled: true, deleted_at: null } }) : Promise.resolve([]);
}

function checkClipBindings(errors: any[], entityType: string, entityId: string, bindings: Record<string, string> | undefined, clipKeys: Set<string>): void {
  for (const [state, clipKey] of Object.entries(bindings ?? {})) {
    if (!clipKeys.has(clipKey)) errors.push(issue(entityType, entityId, `visual.animationClipKeys.${state}`, `Animation Clip 不存在：${clipKey}`));
  }
}

function checkArt(errors: any[], artByKey: Map<string, any>, versionById: Map<string, any>, entityType: string, entityId: string, field: string, key?: string): void {
  if (!key) return;
  const row = artByKey.get(key);
  if (!row) errors.push(issue(entityType, entityId, field, `Art Key 不存在或未启用：${key}`));
  else if (row.resource_status === 'missing') errors.push(issue(entityType, entityId, field, `Art Key 物理资源缺失：${key}`));
  else validateArtVersion(errors, row, versionById, entityType, entityId, field, key);
}

function validateArtVersion(errors: any[], row: any, versionById: Map<string, any>, entityType: string, entityId: string, field: string, key: string): void {
  if (row.resource_status !== 'physical') return;
  const versionId = row.current_draft_version_id ?? row.published_version_id;
  if (!versionId) {
    errors.push(issue(entityType, entityId, field, `Art Key 缺少可发布版本：${key}`));
    return;
  }
  const version = versionById.get(versionId);
  if (!version) {
    errors.push(issue(entityType, entityId, field, `资源版本不存在：${key} / ${versionId}`));
    return;
  }
  if (!(version.actual_width > 0) || !(version.actual_height > 0)) {
    errors.push(issue(entityType, entityId, field, `资源实际尺寸不合法：${key}`));
    return;
  }
  if (version.validation_status === 'invalid') errors.push(issue(entityType, entityId, field, `资源版本校验失败：${key}`));
  const fullPath = path.resolve(projectRoot(), version.storage_path);
  if (!fullPath.startsWith(projectRoot() + path.sep) || !fs.existsSync(fullPath)) {
    errors.push(issue(entityType, entityId, field, `资源文件不存在：${key}`));
    return;
  }
  if (version.checksum) {
    const actual = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
    if (actual !== version.checksum) errors.push(issue(entityType, entityId, field, `资源 checksum 不一致：${key}`));
  }
  if (row.dimension_policy === 'exact') {
    if (row.expected_width && row.expected_width !== version.actual_width) errors.push(issue(entityType, entityId, field, `资源宽度不符合 exact 规则：${key}`));
    if (row.expected_height && row.expected_height !== version.actual_height) errors.push(issue(entityType, entityId, field, `资源高度不符合 exact 规则：${key}`));
  }
  if (row.required_alpha && !version.has_alpha) errors.push(issue(entityType, entityId, field, `资源缺少透明通道：${key}`));
}
