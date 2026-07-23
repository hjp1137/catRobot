export function orchestrationFromRows(stageId: string, rows: any) {
  const camera = rows.layout?.camera_json ?? undefined;
  const layout = rows.layout ? {
    stageId,
    canvasWidth: rows.layout.canvas_width,
    canvasHeight: rows.layout.canvas_height,
    sceneMode: rows.layout.scene_mode,
    backgroundThemeId: rows.layout.background_theme_id ?? undefined,
    heroSpawnPointId: rows.layout.hero_spawn_point_key ?? undefined,
    battleArea: rows.layout.battle_area_json,
    camera,
    exploreHud: camera?.exploreHud ?? undefined,
    enabled: rows.layout.enabled,
    version: rows.layout.content_version,
  } : undefined;
  const entriesByWave = new Map<string, any[]>();
  for (const entry of rows.entries) {
    const list = entriesByWave.get(entry.wave_id) ?? [];
    list.push(entry);
    entriesByWave.set(entry.wave_id, list);
  }
  return {
    schemaVersion: 1,
    stageId,
    layout,
    layers: rows.layers.map(layerFromRow),
    spawnPoints: rows.spawnPoints.map(spawnFromRow),
    waves: rows.waves.map((wave: any) => waveFromRow(wave, entriesByWave.get(wave.id) ?? [])),
    completionRule: rows.layout?.completion_rule_json ?? { type: 'all-waves-cleared' },
    failureRule: rows.layout?.failure_rule_json ?? { type: 'hero-dead' },
    rowVersion: rows.layout?.row_version ?? 0,
  };
}

export function layerData(stageId: string, layer: any, index: number) {
  return {
    stage_id: stageId, layer_key: layer.id, name: layer.name, layer_type: layer.type,
    art_key: layer.artKey, background_theme_id: layer.backgroundThemeId, sort_order: layer.order ?? index,
    x: layer.x ?? 0, y: layer.y ?? 0, width: layer.width, height: layer.height, scale: layer.scale ?? 1,
    opacity: layer.opacity ?? 1, tiled: layer.tiled ?? false, scrolls_with_camera: layer.scrollsWithCamera ?? true,
    parallax: layer.parallax ?? 1, enabled: layer.enabled ?? true,
  };
}

export function spawnData(stageId: string, point: any, index: number) {
  return {
    stage_id: stageId, spawn_point_key: point.id, name: point.name, spawn_type: point.type,
    x: point.x, y: point.y, facing: point.facing ?? 'right', battle_area_id: point.battleAreaId,
    enabled: point.enabled ?? true, note: point.note, sort_order: index,
  };
}

export function layoutData(stageId: string, body: any) {
  const layout = body.layout;
  return {
    stage_id: stageId, canvas_width: layout.canvasWidth, canvas_height: layout.canvasHeight,
    scene_mode: layout.sceneMode, background_theme_id: layout.backgroundThemeId,
    hero_spawn_point_key: layout.heroSpawnPointId, battle_area_json: layout.battleArea,
    camera_json: { ...(layout.camera ?? {}), ...(layout.exploreHud ? { exploreHud: layout.exploreHud } : {}) }, completion_rule_json: body.completionRule ?? { type: 'all-waves-cleared' },
    failure_rule_json: body.failureRule ?? { type: 'hero-dead' }, enabled: layout.enabled ?? true,
    content_version: layout.version ?? 1,
  };
}

export function entryData(waveId: string, entry: any, index: number) {
  return {
    wave_id: waveId, entry_key: entry.id, enemy_template_id: entry.enemyTemplateId,
    spawn_point_key: entry.spawnPointId, quantity: entry.count, spawn_interval_ms: entry.spawnIntervalMs ?? 0,
    initial_delay_ms: entry.initialDelayMs ?? 0, elite: entry.elite ?? false,
    level_multiplier: entry.levelMultiplier ?? 1, hp_multiplier: entry.hpMultiplier ?? 1,
    attack_multiplier: entry.attackMultiplier ?? 1, animation_overrides_json: entry.animationClipOverrides,
    enabled: entry.enabled ?? true, sort_order: index,
  };
}

function layerFromRow(row: any) {
  return { id: row.layer_key, name: row.name, type: row.layer_type, artKey: row.art_key ?? undefined, backgroundThemeId: row.background_theme_id ?? undefined, order: row.sort_order, x: row.x, y: row.y, width: row.width ?? undefined, height: row.height ?? undefined, scale: row.scale, opacity: row.opacity, tiled: row.tiled, scrollsWithCamera: row.scrolls_with_camera, parallax: row.parallax, enabled: row.enabled };
}

function spawnFromRow(row: any) {
  return { id: row.spawn_point_key, name: row.name, type: row.spawn_type, x: row.x, y: row.y, facing: row.facing, battleAreaId: row.battle_area_id ?? undefined, enabled: row.enabled, note: row.note ?? undefined };
}

function waveFromRow(row: any, entries: any[]) {
  return { id: row.wave_key, order: row.wave_order, name: row.name, startTrigger: { type: row.start_trigger }, startDelayMs: row.start_delay_ms, entries: entries.map(entryFromRow), maxAlive: row.max_alive, completionRule: { type: row.completion_rule }, completionDelayMs: row.completion_delay_ms, nextWave: row.next_wave ?? undefined, enabled: row.enabled };
}

function entryFromRow(row: any) {
  return { id: row.entry_key, enemyTemplateId: row.enemy_template_id, spawnPointId: row.spawn_point_key, count: row.quantity, spawnIntervalMs: row.spawn_interval_ms, initialDelayMs: row.initial_delay_ms, elite: row.elite, levelMultiplier: row.level_multiplier, hpMultiplier: row.hp_multiplier, attackMultiplier: row.attack_multiplier, animationClipOverrides: row.animation_overrides_json ?? undefined, enabled: row.enabled };
}
