function json<T>(value: unknown, fallback: T): T {
  return (value ?? fallback) as T;
}

export function enemyFromRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category,
    behaviorType: row.behavior_type,
    visual: json(row.visual_json, {}),
    stats: json(row.stats_json, {}),
    combat: json(row.combat_json, {}),
    rewards: json(row.rewards_json, undefined),
    tags: json(row.tags_json, undefined),
    enabled: row.enabled,
    version: row.content_version,
    rowVersion: row.row_version,
    updatedAt: row.updated_at,
  };
}

export function backgroundFromRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    art: json(row.art_json, {}),
    colors: json(row.colors_json, undefined),
    rendering: json(row.rendering_json, {}),
    enabled: row.enabled,
    version: row.content_version,
    rowVersion: row.row_version,
    updatedAt: row.updated_at,
  };
}

export function heroFromRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    visual: json(row.visual_json, {}),
    skills: json(row.skills_json, {}),
    enabled: row.enabled,
    version: row.content_version,
    rowVersion: row.row_version,
    updatedAt: row.updated_at,
  };
}

export function stageFromRow(row: any, children: { waves?: unknown[]; exploration?: unknown; objectives?: unknown[] } = {}) {
  return {
    id: row.id,
    legacyStageId: row.legacy_stage_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    mode: row.mode === 'fixed_battle' ? 'fixed-battle' : 'explore',
    heroVisualTemplateId: row.hero_visual_template_id,
    backgroundThemeId: row.background_theme_id,
    waves: children.waves,
    exploration: children.exploration,
    objectives: children.objectives,
    enabled: row.enabled,
    version: row.content_version,
    rowVersion: row.row_version,
    updatedAt: row.updated_at,
  };
}
