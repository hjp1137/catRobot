import {
  CHAPTER_ONE_CAMPAIGN,
  CHAPTER_ONE_CONNECTIONS,
  CHAPTER_ONE_NODES,
  CHAPTER_ONE_STAGES,
} from './chapter-one-blueprint';

export async function seedChapterOne(prisma: any, result: { created: number; skipped: number }) {
  await seedBossTemplate(prisma, result);
  for (const stage of CHAPTER_ONE_STAGES) {
    await seedStage(prisma, stage, result);
    await seedOrchestration(prisma, stage, result);
    await seedProgression(prisma, stage, result);
  }
  await seedCampaign(prisma, result);
  await prisma.contentSystemState.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
    update: { draft_revision: { increment: 1 }, draft_dirty: true },
  });
  await prisma.contentChangeLog.create({
    data: {
      entity_type: 'campaign', entity_id: CHAPTER_ONE_CAMPAIGN.id,
      action_type: 'seed-chapter-one-ten-stages',
      after_json: { chapterId: CHAPTER_ONE_CAMPAIGN.chapterId, stageCount: 10, nodeCount: 10, bossStageId: 'stage_ch1_10' },
    },
  });
}

async function seedBossTemplate(prisma: any, result: { created: number; skipped: number }) {
  const data = {
    name: '机械鼠王',
    description: '第一章最终首领，拥有震荡冲击和高强度追击能力。',
    category: 'boss', behavior_type: 'melee',
    visual_json: {
      idleArtKey: 'enemy.scrapGuard.elite',
      moveArtKey: 'enemy.scrapGuard.elite',
      attackArtKey: 'enemy.scrapGuard.elite',
      displayScale: 1.45, collisionRadius: 32,
    },
    stats_json: { maxHp: 220, attack: 7, defense: 4, moveSpeed: 55 },
    combat_json: {
      attackInterval: 1.6, attackRange: 52, detectRadius: 420,
      chaseRadius: 600, contactDamage: true,
    },
    rewards_json: { coinMin: 10, coinMax: 18 },
    tags_json: ['boss', 'chapter-one'], enabled: true, content_version: 1,
  };
  const existing = await prisma.contentEnemyTemplate.findUnique({ where: { id: 'enemy_scrap_mouse_king_01' } });
  await prisma.contentEnemyTemplate.upsert({
    where: { id: 'enemy_scrap_mouse_king_01' },
    create: { id: 'enemy_scrap_mouse_king_01', ...data }, update: data,
  });
  const stageWave = await prisma.contentStageWave.findUnique({
    where: { stage_id_wave_no: { stage_id: 'stage_ch1_10', wave_no: 5 } },
  });
  if (stageWave) await prisma.contentStageWaveEnemyGroup.updateMany({
    where: { stage_wave_id: stageWave.id },
    data: { enemy_template_id: 'enemy_scrap_mouse_king_01', enemy_count: 1 },
  });
  const sceneWave = await prisma.contentStageOrchestrationWave.findUnique({
    where: { stage_id_wave_key: { stage_id: 'stage_ch1_10', wave_key: 'wave_5' } },
  });
  if (sceneWave) await prisma.contentStageWaveEntry.updateMany({
    where: { wave_id: sceneWave.id },
    data: { enemy_template_id: 'enemy_scrap_mouse_king_01', quantity: 1, elite: true },
  });
  result[existing ? 'skipped' : 'created'] += 1;
}

async function seedStage(prisma: any, stage: any, result: any) {
  const existing = await prisma.contentStage.findUnique({ where: { id: stage.id } });
  const data = {
    legacy_stage_id: stage.legacyStageId, name: stage.name, mode: 'explore',
    hero_visual_template_id: stage.heroVisualTemplateId,
    background_theme_id: stage.backgroundThemeId,
    world_width: stage.worldWidth, world_height: stage.worldHeight,
    enabled: true, content_version: 1,
  };
  if (existing) {
    await prisma.contentStage.update({ where: { id: stage.id }, data });
    await syncExploration(prisma, stage);
    result.skipped += 1;
    return;
  }
  await prisma.$transaction(async (tx: any) => {
    await tx.contentStage.create({ data: { id: stage.id, ...data } });
    for (const wave of stage.waves) {
      const row = await tx.contentStageWave.create({ data: {
        stage_id: stage.id, wave_no: wave.order, wave_key: wave.id,
        name: wave.name, message: wave.name, spawn_delay: wave.startDelayMs / 1000,
        sort_order: wave.order - 1,
      } });
      await tx.contentStageWaveEnemyGroup.createMany({ data: wave.entries.map((entry: any, index: number) => ({
        stage_wave_id: row.id, enemy_template_id: entry.enemyTemplateId,
        enemy_count: entry.count, spawn_area_id: entry.spawnPointId,
        spawn_interval: entry.spawnIntervalMs / 1000,
        level_multiplier: entry.levelMultiplier, sort_order: index,
      })) });
    }
    await tx.contentStageObjective.createMany({ data: stage.objectives.map((objective: any, index: number) => ({
      stage_id: stage.id, objective_type: objective.type,
      required_count: objective.required, sort_order: index,
    })) });
  });
  await syncExploration(prisma, stage);
  result.created += 1;
}

async function syncExploration(prisma: any, stage: any) {
  await prisma.contentExploreSpawnGroup.deleteMany({ where: { stage_id: stage.id } });
  await prisma.contentExploreSpawnGroup.createMany({
    data: stage.exploration.spawnGroups.map((group: any, index: number) => ({
      stage_id: stage.id, group_key: group.id,
      enemy_template_id: group.enemyTemplateId,
      spawn_x: group.spawnPoint.x, spawn_y: group.spawnPoint.y,
      spawn_radius: group.spawnPoint.radius,
      initial_count: group.initialCount, max_alive: group.maxAlive,
      respawn_interval: group.respawnInterval, sort_order: index,
    })),
  });
}

async function seedOrchestration(prisma: any, stage: any, result: any) {
  const existing = await prisma.contentStageSceneLayout.findUnique({ where: { stage_id: stage.id } });
  const layout = stage.orchestration.layout;
  const layoutData = {
    canvas_width: layout.canvasWidth, canvas_height: layout.canvasHeight,
    scene_mode: layout.sceneMode, background_theme_id: layout.backgroundThemeId,
    hero_spawn_point_key: layout.heroSpawnPointId,
    battle_area_json: layout.battleArea,
    camera_json: { ...layout.camera, exploreHud: layout.exploreHud },
    completion_rule_json: stage.orchestration.completionRule,
    failure_rule_json: stage.orchestration.failureRule,
    enabled: true, content_version: 1,
  };
  if (existing) {
    await prisma.contentStageSceneLayout.update({ where: { stage_id: stage.id }, data: layoutData });
    await syncStageMapLayers(prisma, stage);
    result.skipped += 1;
    return;
  }
  await prisma.$transaction(async (tx: any) => {
    await tx.contentStageSceneLayout.create({ data: { stage_id: stage.id, ...layoutData } });
    await tx.contentStageLayer.createMany({ data: stageLayerRows(stage) });
    await tx.contentStageSpawnPoint.createMany({ data: stage.orchestration.spawnPoints.map((point: any, index: number) => ({
      stage_id: stage.id, spawn_point_key: point.id, name: point.name,
      spawn_type: point.type, x: point.x, y: point.y, facing: point.facing,
      enabled: point.enabled, sort_order: index,
    })) });
    for (const wave of stage.orchestration.waves) {
      const row = await tx.contentStageOrchestrationWave.create({ data: {
        stage_id: stage.id, wave_key: wave.id, name: wave.name,
        wave_order: wave.order, start_trigger: wave.startTrigger.type,
        start_delay_ms: wave.startDelayMs, max_alive: wave.maxAlive,
        completion_rule: wave.completionRule.type,
        completion_delay_ms: wave.completionDelayMs,
        next_wave: wave.nextWave, enabled: wave.enabled, sort_order: wave.order - 1,
      } });
      await tx.contentStageWaveEntry.createMany({ data: wave.entries.map((entry: any, index: number) => ({
        wave_id: row.id, entry_key: entry.id, enemy_template_id: entry.enemyTemplateId,
        spawn_point_key: entry.spawnPointId, quantity: entry.count,
        spawn_interval_ms: entry.spawnIntervalMs, initial_delay_ms: entry.initialDelayMs,
        elite: entry.elite, level_multiplier: entry.levelMultiplier,
        hp_multiplier: entry.hpMultiplier, attack_multiplier: entry.attackMultiplier,
        enabled: entry.enabled, sort_order: index,
      })) });
    }
  });
  result.created += 1;
}

export async function syncStageMapLayers(prisma: any, stage: any): Promise<void> {
  await prisma.$transaction(async (tx: any) => {
    await tx.contentStageLayer.deleteMany({ where: { stage_id: stage.id } });
    await tx.contentStageLayer.createMany({ data: stageLayerRows(stage) });
  });
}

function stageLayerRows(stage: any) {
  return stage.orchestration.layers.map((layer: any) => ({
    stage_id: stage.id, layer_key: layer.id, name: layer.name, layer_type: layer.type,
    art_key: layer.artKey, background_theme_id: layer.backgroundThemeId,
    sort_order: layer.order, x: layer.x, y: layer.y, width: layer.width, height: layer.height,
    scale: layer.scale, opacity: layer.opacity, tiled: layer.tiled,
    scrolls_with_camera: layer.scrollsWithCamera, parallax: layer.parallax, enabled: layer.enabled,
  }));
}

async function seedProgression(prisma: any, stage: any, result: any) {
  const progression = stage.progression;
  const existing = await prisma.contentStageProgressionConfig.findUnique({ where: { stage_id: stage.id } });
  if (!existing) {
    await prisma.$transaction(async (tx: any) => {
      await tx.contentStageProgressionConfig.create({ data: {
        stage_id: stage.id, recommended_power: progression.recommendedPower,
        victory_text: progression.victoryText, failure_text: progression.failureText,
      } });
      await tx.contentStageProgressionObjective.createMany({ data: progression.objectives.map((objective: any, index: number) => ({
        stage_id: stage.id, objective_key: objective.id, name: objective.name,
        objective_type: objective.type, required: objective.required,
        params_json: objective.params, display_text: objective.displayText,
        progress_display: objective.progressDisplay, star_eligible: objective.starEligible,
        sort_order: index,
      })) });
      for (const [index, pool] of progression.rewardPools.entries()) {
        const row = await tx.contentStageRewardPool.create({ data: {
          stage_id: stage.id, pool_key: pool.id, name: pool.name,
          group_type: pool.group, selection_mode: 'independent-probability', sort_order: index,
        } });
        await tx.contentStageRewardEntry.createMany({ data: pool.entries.map((entry: any, entryIndex: number) => ({
          pool_id: row.id, entry_key: entry.id, reward_type: entry.type,
          reward_ref_id: entry.ref, min_quantity: entry.min, max_quantity: entry.max,
          probability: entry.probability, guaranteed: entry.probability === 1,
          sort_order: entryIndex,
        })) });
      }
    });
    result.created += 1;
  } else {
    await prisma.contentStageProgressionConfig.update({ where: { stage_id: stage.id }, data: {
      recommended_power: progression.recommendedPower,
      victory_text: progression.victoryText, failure_text: progression.failureText,
    } });
    result.skipped += 1;
  }
  await prisma.contentStageUnlockRule.deleteMany({ where: { stage_id: stage.id } });
  if (progression.unlockRules.length) await prisma.contentStageUnlockRule.createMany({ data: progression.unlockRules.map((rule: any, index: number) => ({
    stage_id: stage.id, rule_key: rule.id, rule_type: rule.type,
    prerequisite_stage_id: rule.prerequisiteStageId,
    required_stars: rule.requiredStars, next_stage_id: rule.nextStageId,
    sort_order: index,
  })) });
}

async function seedCampaign(prisma: any, result: any) {
  const campaign = CHAPTER_ONE_CAMPAIGN;
  await prisma.contentCampaign.upsert({
    where: { id: campaign.id },
    create: {
      id: campaign.id, name: campaign.name, subtitle: campaign.subtitle,
      description: campaign.description, cover_art_key: 'map.trainingGround.floor',
      default_chapter_id: campaign.chapterId, sort_order: 1,
      enabled: true, schema_version: 1, content_version: 1,
    },
    update: {
      name: campaign.name, subtitle: campaign.subtitle, description: campaign.description,
      default_chapter_id: campaign.chapterId, enabled: true,
    },
  });
  await prisma.contentCampaignChapter.upsert({
    where: { id: campaign.chapterId },
    create: {
      id: campaign.chapterId, campaign_id: campaign.id, chapter_no: 1,
      name: campaign.chapterName, subtitle: '边境反攻', description: campaign.description,
      background_art_key: 'map.trainingGround.floor', canvas_width: 600, canvas_height: 1360,
      viewport_x: 0, viewport_y: 0, enabled: true,
      completion_text: '机械鼠王已被摧毁，废料边境防线重新点亮。',
    },
    update: {
      name: campaign.chapterName, subtitle: '边境反攻', description: campaign.description,
      canvas_width: 600, canvas_height: 1360, enabled: true,
      completion_text: '机械鼠王已被摧毁，废料边境防线重新点亮。',
    },
  });
  for (const node of CHAPTER_ONE_NODES) await prisma.contentCampaignStageNode.upsert({
    where: { id: node.id },
    create: { id: node.id, ...nodeData(campaign.chapterId, node) },
    update: nodeData(campaign.chapterId, node),
  });
  for (const edge of CHAPTER_ONE_CONNECTIONS) await prisma.contentCampaignNodeConnection.upsert({
    where: { id: edge.id },
    create: { id: edge.id, ...edgeData(campaign.chapterId, edge) },
    update: edgeData(campaign.chapterId, edge),
  });
  result.created += 1;
}

function nodeData(chapterId: string, node: any) {
  return {
    chapter_id: chapterId, stage_id: node.stageId, name: node.name,
    x: node.x, y: node.y, node_type: node.type, icon_art_key: node.iconArtKey,
    is_start: node.isStart, is_end: node.isEnd, sort_order: node.order,
    recommended_power: node.recommendedPower, description: node.description,
    enabled: node.enabled,
  };
}

function edgeData(chapterId: string, edge: any) {
  return {
    chapter_id: chapterId, from_node_id: edge.fromNodeId,
    to_node_id: edge.toNodeId, path_type: edge.pathType,
    one_way: edge.oneWay, sort_order: edge.order, enabled: edge.enabled,
  };
}
