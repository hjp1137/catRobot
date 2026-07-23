export function flowModel(row: any) {
  return { id: row.id, name: row.name, description: row.description ?? '', campaignId: row.campaign_id ?? null,
    startStepId: row.start_step_id ?? null, endStepId: row.end_step_id ?? null,
    startCondition: row.start_condition_json ?? {}, audience: row.audience_json ?? {}, playerCondition: row.player_condition_json ?? {},
    skipUnlockFeatures: row.skip_unlock_features_json ?? [], skippable: row.skippable, allowReplay: row.allow_replay,
    priority: row.priority, enabled: row.enabled, schemaVersion: row.schema_version,
    contentVersion: row.content_version, rowVersion: row.row_version, createdAt: row.created_at, updatedAt: row.updated_at };
}

export function flowCreateRow(body: any) {
  return { id: body.id, name: body.name, description: body.description ?? '',
    campaign_id: body.campaignId ?? null, start_step_id: body.startStepId ?? null, end_step_id: body.endStepId ?? null,
    start_condition_json: body.startCondition ?? {}, audience_json: body.audience ?? {},
    player_condition_json: body.playerCondition ?? {}, skip_unlock_features_json: body.skipUnlockFeatures ?? [],
    skippable: body.skippable ?? true, allow_replay: body.allowReplay ?? false, priority: body.priority ?? 0,
    enabled: body.enabled ?? false, schema_version: body.schemaVersion ?? 1, content_version: body.contentVersion ?? 1,
    row_version: 1 };
}

export function flowPatchRow(body: any) {
  const map: Record<string, string> = { name: 'name', description: 'description', campaignId: 'campaign_id',
    startStepId: 'start_step_id', endStepId: 'end_step_id', startCondition: 'start_condition_json',
    audience: 'audience_json', playerCondition: 'player_condition_json', skipUnlockFeatures: 'skip_unlock_features_json',
    skippable: 'skippable', allowReplay: 'allow_replay', priority: 'priority', enabled: 'enabled',
    schemaVersion: 'schema_version', contentVersion: 'content_version' };
  const result: Record<string, unknown> = {};
  for (const [source, target] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(body, source)) result[target] = body[source];
  }
  return result;
}

export const flowRow = (body: any, creating = false) => creating ? flowCreateRow(body) : flowPatchRow(body);

export function stepModel(row: any) {
  return { id: row.id, flowId: row.flow_id, order: row.sort_order, name: row.name, triggerType: row.trigger_type,
    triggerConfig: row.trigger_json ?? {}, displayType: row.display_type, targetType: row.target_type, targetId: row.target_id,
    title: row.title, body: row.body, characterName: row.character_name ?? '', avatarArtKey: row.avatar_art_key ?? null,
    mask: row.mask_json ?? {}, arrow: row.arrow_json ?? {}, blockInput: row.block_input, force: row.force ?? false,
    completionType: row.completion_type, completionConfig: row.completion_json ?? {}, timeoutMs: row.timeout_ms,
    fallbackAction: row.fallback_action, nextStepId: row.next_step_id, skipStepId: row.skip_step_id,
    stageId: row.stage_id, campaignId: row.campaign_id ?? null, featureId: row.feature_id, terminal: row.terminal, enabled: row.enabled,
    contentVersion: row.content_version, rowVersion: row.row_version, updatedAt: row.updated_at, deletedAt: row.deleted_at };
}

export function stepRow(flowId: string, body: any, creating = false) {
  return { ...(creating ? { id: body.id } : {}), flow_id: flowId, sort_order: body.order, name: body.name ?? body.title,
    trigger_type: body.triggerType, trigger_json: body.triggerConfig ?? {}, display_type: body.displayType ?? 'dialog',
    target_type: body.targetType, target_id: body.targetId, title: body.title, body: body.body,
    character_name: body.characterName ?? null, avatar_art_key: body.avatarArtKey ?? null,
    mask_json: body.mask ?? {}, arrow_json: body.arrow ?? {}, block_input: body.blockInput ?? false, force: body.force ?? false,
    completion_type: body.completionType, completion_json: body.completionConfig ?? {}, timeout_ms: body.timeoutMs ?? null,
    fallback_action: body.fallbackAction ?? null, next_step_id: body.nextStepId ?? null,
    skip_step_id: body.skipStepId ?? null, stage_id: body.stageId ?? null, campaign_id: body.campaignId ?? null,
    feature_id: body.featureId ?? null,
    terminal: body.terminal ?? false, enabled: body.enabled ?? true, content_version: body.contentVersion ?? 1,
    ...(creating ? { row_version: 1, deleted_at: null } : {}) };
}

export function transitionModel(row: any) {
  return { id: row.id, flowId: row.flow_id, fromStepId: row.from_step_id, toStepId: row.to_step_id,
    conditionType: row.condition_type, condition: row.condition_json ?? {}, order: row.sort_order,
    enabled: row.enabled, rowVersion: row.row_version, createdAt: row.created_at, updatedAt: row.updated_at,
    deletedAt: row.deleted_at };
}

export function unlockRuleModel(row: any) {
  return { id: row.id, flowId: row.flow_id, stepId: row.step_id ?? undefined, featureId: row.feature_id,
    unlockTrigger: row.unlock_trigger, condition: row.condition_json ?? {}, unlockOnSkip: row.unlock_on_skip,
    order: row.sort_order, enabled: row.enabled, rowVersion: row.row_version, createdAt: row.created_at,
    updatedAt: row.updated_at, deletedAt: row.deleted_at };
}
