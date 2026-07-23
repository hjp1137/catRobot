import { boolField, fail, has, intField, jsonField, object, optionalString,
  referenceField, requiredString, uniqueIds } from './tutorial.field-validation';

export function validateFlowInput(body: any, mode: 'create' | 'update') {
  object(body, 'TUTORIAL_FLOW_BODY_INVALID');
  if (mode === 'create') {
    if (typeof body.id !== 'string' || !/^[A-Za-z0-9._-]{1,120}$/.test(body.id)) fail('TUTORIAL_FLOW_ID_INVALID');
  }
  if (mode === 'create' || has(body, 'name')) requiredString(body, 'name', 160, 'TUTORIAL_FLOW_NAME_INVALID');
  optionalString(body, 'description', 10000, 'TUTORIAL_FLOW_DESCRIPTION_INVALID');
  referenceField(body, 'campaignId', 80);
  referenceField(body, 'startStepId', 120);
  referenceField(body, 'endStepId', 120);
  intField(body, 'priority', 'TUTORIAL_FLOW_PRIORITY_INVALID', 0);
  intField(body, 'rowVersion', 'TUTORIAL_ROW_VERSION_INVALID', 1, mode === 'update');
  intField(body, 'schemaVersion', 'TUTORIAL_SCHEMA_VERSION_INVALID', 1);
  intField(body, 'contentVersion', 'TUTORIAL_CONTENT_VERSION_INVALID', 1);
  for (const [key, code] of [['audience', 'TUTORIAL_FLOW_AUDIENCE_INVALID'],
    ['playerCondition', 'TUTORIAL_FLOW_PLAYER_CONDITION_INVALID'],
    ['startCondition', 'TUTORIAL_FLOW_START_CONDITION_INVALID']] as const) {
    jsonField(body, key, code);
  }
  if (has(body, 'skipUnlockFeatures') && (!Array.isArray(body.skipUnlockFeatures) ||
    body.skipUnlockFeatures.some((item: unknown) => typeof item !== 'string'))) fail('TUTORIAL_SKIP_FEATURES_INVALID');
  for (const key of ['enabled', 'skippable', 'allowReplay']) boolField(body, key, 'TUTORIAL_FLOW_BOOLEAN_INVALID');
}

export function validateStepInput(body: any, mode: 'create' | 'update') {
  object(body, 'TUTORIAL_STEP_BODY_INVALID');
  if ((mode === 'create' || has(body, 'id')) &&
    (typeof body.id !== 'string' || !/^[A-Za-z0-9._-]{1,120}$/.test(body.id))) fail('TUTORIAL_STEP_ID_INVALID');
  intField(body, 'order', 'TUTORIAL_STEP_ORDER_INVALID', 1, true);
  if (mode === 'update') intField(body, 'rowVersion', 'TUTORIAL_ROW_VERSION_INVALID', 1, true);
  else if (has(body, 'rowVersion') && body.rowVersion !== 0) fail('TUTORIAL_ROW_VERSION_INVALID');
  if (body.timeoutMs != null) intField(body, 'timeoutMs', 'TUTORIAL_TIMEOUT_INVALID', 0);
  requiredString(body, 'name', 160, 'TUTORIAL_STEP_NAME_INVALID');
  requiredString(body, 'title', 160, 'TUTORIAL_STEP_TITLE_INVALID');
  requiredString(body, 'body', 10000, 'TUTORIAL_STEP_BODY_TEXT_INVALID');
  requiredString(body, 'triggerType', 60, 'TUTORIAL_STEP_TRIGGER_TYPE_INVALID');
  requiredString(body, 'displayType', 40, 'TUTORIAL_STEP_DISPLAY_TYPE_INVALID');
  requiredString(body, 'targetType', 40, 'TUTORIAL_STEP_TARGET_TYPE_INVALID');
  requiredString(body, 'targetId', 160, 'TUTORIAL_STEP_TARGET_ID_INVALID');
  requiredString(body, 'completionType', 60, 'TUTORIAL_STEP_COMPLETION_TYPE_INVALID');
  optionalString(body, 'characterName', 80, 'TUTORIAL_STEP_CHARACTER_NAME_INVALID');
  optionalString(body, 'fallbackAction', 60, 'TUTORIAL_STEP_FALLBACK_INVALID');
  for (const [key, max] of [['nextStepId', 120], ['skipStepId', 120], ['avatarArtKey', 160],
    ['stageId', 80], ['campaignId', 80], ['featureId', 120]] as const) referenceField(body, key, max);
  for (const key of ['triggerConfig', 'mask', 'arrow', 'completionConfig']) {
    jsonField(body, key, 'TUTORIAL_STEP_JSON_INVALID');
  }
  for (const key of ['enabled', 'blockInput', 'force', 'terminal']) boolField(body, key, 'TUTORIAL_STEP_BOOLEAN_INVALID');
  intField(body, 'contentVersion', 'TUTORIAL_CONTENT_VERSION_INVALID', 1);
}

export function validateOrchestrationInput(body: any) {
  object(body, 'TUTORIAL_ORCHESTRATION_BODY_INVALID');
  if (!body.flow || typeof body.flow !== 'object' || Array.isArray(body.flow)) fail('TUTORIAL_ORCHESTRATION_FLOW_REQUIRED');
  validateCompleteFlow(body.flow);
  if (!Array.isArray(body.steps) || !Array.isArray(body.transitions) || !Array.isArray(body.unlockRules)) {
    fail('TUTORIAL_ORCHESTRATION_ARRAY_INVALID');
  }
  for (const step of body.steps) validateStepInput(step, step.rowVersion == null || step.rowVersion === 0 ? 'create' : 'update');
  for (const step of body.steps) for (const key of ['campaignId', 'stageId', 'avatarArtKey']) {
    if (!has(step, key)) fail('TUTORIAL_STEP_REFERENCE_FIELD_REQUIRED', { field: key });
  }
  for (const item of body.transitions) validateTransition(item);
  for (const item of body.unlockRules) validateRule(item);
  uniqueIds(body.steps, 'TUTORIAL_STEP_ID_DUPLICATE');
  uniqueIds(body.transitions, 'TUTORIAL_TRANSITION_ID_DUPLICATE');
  uniqueIds(body.unlockRules, 'TUTORIAL_RULE_ID_DUPLICATE');
}

export function validateDeleteInput(ids: unknown[], rowVersion: unknown) {
  if (ids.some(id => typeof id !== 'string' || !/^[A-Za-z0-9._-]{1,120}$/.test(id))) {
    fail('TUTORIAL_ID_INVALID');
  }
  if (!Number.isInteger(rowVersion) || (rowVersion as number) < 1) fail('TUTORIAL_ROW_VERSION_INVALID');
}

function validateCompleteFlow(flow: any) {
  validateFlowInput(flow, 'update');
  if (typeof flow.id !== 'string' || !/^[A-Za-z0-9._-]{1,120}$/.test(flow.id)) fail('TUTORIAL_FLOW_ID_INVALID');
  for (const key of ['campaignId', 'startStepId', 'endStepId']) referenceField(flow, key, key === 'campaignId' ? 80 : 120, true);
  for (const key of ['description', 'startCondition', 'audience', 'playerCondition', 'skipUnlockFeatures',
    'skippable', 'allowReplay', 'priority', 'enabled', 'schemaVersion', 'contentVersion']) {
    if (!has(flow, key)) fail('TUTORIAL_FLOW_FIELD_REQUIRED', { field: key });
  }
}

function validateTransition(item: any) {
  object(item, 'TUTORIAL_TRANSITION_INVALID');
  requiredString(item, 'id', 120, 'TUTORIAL_TRANSITION_ID_INVALID');
  requiredString(item, 'fromStepId', 120, 'TUTORIAL_TRANSITION_FROM_INVALID');
  requiredString(item, 'toStepId', 120, 'TUTORIAL_TRANSITION_TO_INVALID');
  requiredString(item, 'conditionType', 60, 'TUTORIAL_TRANSITION_CONDITION_TYPE_INVALID');
  jsonField(item, 'condition', 'TUTORIAL_TRANSITION_CONDITION_INVALID');
  intField(item, 'order', 'TUTORIAL_TRANSITION_ORDER_INVALID', 0);
  boolField(item, 'enabled', 'TUTORIAL_TRANSITION_ENABLED_INVALID');
  validateItemVersion(item);
}

function validateRule(item: any) {
  object(item, 'TUTORIAL_RULE_INVALID');
  requiredString(item, 'id', 120, 'TUTORIAL_RULE_ID_INVALID');
  referenceField(item, 'stepId', 120);
  referenceField(item, 'stageId', 80);
  requiredString(item, 'featureId', 120, 'TUTORIAL_RULE_FEATURE_ID_INVALID');
  requiredString(item, 'unlockTrigger', 60, 'TUTORIAL_RULE_TRIGGER_INVALID');
  jsonField(item, 'condition', 'TUTORIAL_RULE_CONDITION_INVALID');
  boolField(item, 'unlockOnSkip', 'TUTORIAL_RULE_SKIP_INVALID');
  boolField(item, 'enabled', 'TUTORIAL_RULE_ENABLED_INVALID');
  intField(item, 'order', 'TUTORIAL_RULE_ORDER_INVALID', 0);
  validateItemVersion(item);
}

function validateItemVersion(item: any) {
  if (has(item, 'rowVersion') && item.rowVersion !== 0) intField(item, 'rowVersion', 'TUTORIAL_ROW_VERSION_INVALID', 1);
}
