import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { flowModel, flowRow, stepModel, stepRow, transitionModel, unlockRuleModel } from './tutorial.mapper';
import { validateTargetId, validateTutorialGraph } from './tutorial.validation';
import { TutorialTargetCatalog } from './tutorial-target.catalog';
import { TutorialFeatureCatalog } from './tutorial-feature.catalog';
import { validateDeleteInput, validateFlowInput, validateOrchestrationInput, validateStepInput } from './tutorial.input-validation';
import { lockTutorialSources, lockTutorialStepSources } from './tutorial.transaction';
import { reconcileTutorialRows } from './tutorial.reconcile';
import { readPublishedTutorial } from './tutorial-published';
export { reconcileTutorialRows } from './tutorial.reconcile';

@Injectable()
export class TutorialsService {
  private readonly targets: TutorialTargetCatalog;
  private readonly features: TutorialFeatureCatalog;

  constructor(private readonly prisma: PrismaService,
    targets: TutorialTargetCatalog = new TutorialTargetCatalog(prisma),
    features: TutorialFeatureCatalog = new TutorialFeatureCatalog()) {
    this.features = features;
    this.targets = targets;
  }

  async listFlows() {
    const db = this.prisma as any;
    const rows = await db.contentTutorialFlow.findMany({ where: { deleted_at: null }, orderBy: { updated_at: 'desc' } });
    const counts = await Promise.all(rows.map((row: any) => db.contentTutorialStep.count({ where: { flow_id: row.id, deleted_at: null } })));
    return rows.map((row: any, index: number) => ({ ...flowModel(row), stepCount: counts[index] }));
  }

  async getFlow(id: string) {
    const db = this.prisma as any;
    const row = await db.contentTutorialFlow.findUnique({ where: { id } });
    if (!row || row.deleted_at) throw new NotFoundException(id);
    const [steps, transitions, unlockRules] = await Promise.all([
      this.listSteps(id), db.contentTutorialStepTransition.findMany({ where: { flow_id: id, deleted_at: null }, orderBy: { sort_order: 'asc' } }),
      db.contentFeatureUnlockRule.findMany({ where: { flow_id: id, deleted_at: null }, orderBy: { sort_order: 'asc' } }),
    ]);
    const flow = flowModel(row);
    return { ...flow, flow, steps, transitions: transitions.map(transitionModel), unlockRules: unlockRules.map(unlockRuleModel) };
  }

  async createFlow(body: any) {
    validateFlowInput(body, 'create');
    if (body.startStepId || body.endStepId) throw new BadRequestException({ code: 'TUTORIAL_NEW_FLOW_STEP_REFERENCE_FORBIDDEN' });
    if (body.enabled === true) throw new BadRequestException({ code: 'TUTORIAL_EMPTY_FLOW_CANNOT_ENABLE' });
    body = { ...body, enabled: false };
    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      await lockFlowSources(tx, body);
      await validateFlowReferences(tx, body, this.features);
      const row = await tx.contentTutorialFlow.create({ data: flowRow(body, true) });
      await markDraft(tx, 'tutorial-flow', body.id, 'create', body);
      return { ...flowModel(row), rowVersion: row.row_version ?? 1 };
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
  }

  async updateFlow(id: string, body: any) {
    validateFlowInput(body, 'update');
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      await lockFlowSources(tx, body);
      const before = await activeFlow(tx, id); assertVersion(body.rowVersion, before.row_version);
      await validateFlowReferences(tx, body, this.features);
      await validateFlowStepReferences(tx, id, body);
      await validateFlowCandidate(tx, before, body);
      const changed = await tx.contentTutorialFlow.updateMany({ where: { id, row_version: body.rowVersion, deleted_at: null }, data: { ...flowRow(body), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(body.rowVersion);
      await markDraft(tx, 'tutorial-flow', id, 'update', body);
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ...body, id, rowVersion: body.rowVersion + 1 };
  }

  async listSteps(flowId: string) {
    const db = this.prisma as any;
    const rows = await db.contentTutorialStep.findMany({ where: { flow_id: flowId, deleted_at: null }, orderBy: { sort_order: 'asc' } });
    return rows.map(stepModel);
  }

  async createStep(flowId: string, body: any) {
    validateStepInput(body, 'create');
    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      await lockTutorialStepSources(tx, body);
      const flow = await activeFlow(tx, flowId);
      await validateReferences(tx, body, new TutorialTargetCatalog(tx, this.features), this.features);
      await validateStepLinks(tx, flowId, body);
      const existing = await tx.contentTutorialStep.findMany({ where: { flow_id: flowId, deleted_at: null } });
      if (existing.length) throw new BadRequestException({ code: 'TUTORIAL_STEP_USE_ORCHESTRATION' });
      if (!body.terminal || body.nextStepId || body.skipStepId) {
        throw new BadRequestException({ code: 'TUTORIAL_FIRST_STEP_MUST_BE_TERMINAL' });
      }
      validateTutorialGraph({ startStepId: body.id, steps: [body], transitions: [] });
      const row = await tx.contentTutorialStep.create({ data: stepRow(flowId, body, true) });
      const flowChanged = await tx.contentTutorialFlow.updateMany({ where: { id: flowId, row_version: flow.row_version, deleted_at: null },
        data: { start_step_id: body.id, end_step_id: body.id, row_version: { increment: 1 } } });
      if (flowChanged.count !== 1) throw conflict(flow.row_version);
      await markDraft(tx, 'tutorial-step', body.id, 'create', body);
      return { ...stepModel(row), id: row.id ?? body.id, rowVersion: row.row_version ?? 1 };
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
  }

  async updateStep(flowId: string, stepId: string, body: any) {
    validateStepInput(body, 'update');
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      await lockTutorialStepSources(tx, body);
      await activeFlow(tx, flowId);
      const before = await activeStep(tx, flowId, stepId); assertVersion(body.rowVersion, before.row_version);
      await validateReferences(tx, body, new TutorialTargetCatalog(tx, this.features), this.features);
      await validateStepLinks(tx, flowId, body);
      await validateCandidateGraph(tx, flowId, stepId, body);
      const changed = await tx.contentTutorialStep.updateMany({ where: { id: stepId, flow_id: flowId, row_version: body.rowVersion, deleted_at: null }, data: { ...stepRow(flowId, body), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(body.rowVersion);
      await markDraft(tx, 'tutorial-step', stepId, 'update', body);
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ...body, id: stepId, flowId, rowVersion: body.rowVersion + 1 };
  }

  async removeStep(flowId: string, stepId: string, rowVersion: number) {
    validateDeleteInput([flowId, stepId], rowVersion);
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      const flow = await activeFlow(tx, flowId);
      const flowLocked = await tx.contentTutorialFlow.updateMany({ where: { id: flowId, row_version: flow.row_version, deleted_at: null },
        data: { row_version: { increment: 0 } } });
      if (flowLocked.count !== 1) throw conflict(flow.row_version);
      const before = await activeStep(tx, flowId, stepId); assertVersion(rowVersion, before.row_version);
      const stepLocked = await tx.contentTutorialStep.updateMany({ where: { id: stepId, flow_id: flowId, row_version: rowVersion, deleted_at: null },
        data: { row_version: { increment: 0 } } });
      if (stepLocked.count !== 1) throw conflict(rowVersion, before.row_version);
      const [next, skip, transition, rule] = await Promise.all([
        tx.contentTutorialStep.count({ where: { flow_id: flowId, next_step_id: stepId, deleted_at: null } }),
        tx.contentTutorialStep.count({ where: { flow_id: flowId, skip_step_id: stepId, deleted_at: null } }),
        tx.contentTutorialStepTransition.count({ where: { flow_id: flowId, OR: [{ from_step_id: stepId }, { to_step_id: stepId }], deleted_at: null } }),
        tx.contentFeatureUnlockRule.count({ where: { flow_id: flowId, step_id: stepId, deleted_at: null } }),
      ]);
      if (next + skip + transition + rule) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', references: { next, skip, transition, rule } });
      const remaining = await tx.contentTutorialStep.findMany({ where: { flow_id: flowId, deleted_at: null } });
      const candidates = remaining.filter((row: any) => row.id !== stepId).map(stepModel);
      if (candidates.length) await validateCandidateGraph(tx, flowId, stepId, undefined);
      const changed = await tx.contentTutorialStep.updateMany({ where: { id: stepId, flow_id: flowId, row_version: rowVersion, deleted_at: null }, data: { enabled: false, deleted_at: new Date(), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(rowVersion);
      if (!candidates.length) {
        const cleared = await tx.contentTutorialFlow.updateMany({ where: { id: flowId, row_version: flow.row_version, deleted_at: null },
          data: { start_step_id: null, end_step_id: null, row_version: { increment: 1 } } });
        if (cleared.count !== 1) throw conflict(flow.row_version);
      }
      await markDraft(tx, 'tutorial-step', stepId, 'delete', { rowVersion });
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ok: true };
  }

  async removeFlow(id: string, rowVersion: number) {
    validateDeleteInput([id], rowVersion);
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      const before = await activeFlow(tx, id); assertVersion(rowVersion, before.row_version);
      const [steps, rules] = await Promise.all([
        tx.contentTutorialStep.count({ where: { flow_id: id, deleted_at: null } }),
        tx.contentFeatureUnlockRule.count({ where: { flow_id: id, deleted_at: null } }),
      ]);
      if (steps + rules) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', references: { steps, rules } });
      const changed = await tx.contentTutorialFlow.updateMany({ where: { id, row_version: rowVersion, deleted_at: null }, data: { enabled: false, deleted_at: new Date(), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(rowVersion);
      await markDraft(tx, 'tutorial-flow', id, 'delete', { rowVersion });
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ok: true };
  }

  async saveOrchestration(flowId: string, body: any) {
    validateOrchestrationInput(body);
    if (body.flow.id !== flowId) throw new BadRequestException({ code: 'TUTORIAL_FLOW_ID_MISMATCH', flowId, bodyFlowId: body.flow.id });
    const flowInput = body.flow;
    const graph = { ...body, startStepId: flowInput.startStepId, endStepId: flowInput.endStepId };
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      await lockTutorialSources(tx, body);
      const before = await activeFlow(tx, flowId);
      const locked = await tx.contentTutorialFlow.updateMany({ where: { id: flowId, row_version: flowInput.rowVersion, deleted_at: null },
        data: { row_version: { increment: 0 } } });
      if (locked.count !== 1) throw conflict(flowInput.rowVersion, before.row_version);
      validateTutorialGraph(graph);
      if (flowInput.endStepId && !body.steps.some((step: any) => step.id === flowInput.endStepId)) {
        throw new BadRequestException({ code: 'TUTORIAL_END_STEP_INVALID', endStepId: flowInput.endStepId });
      }
      const txTargets = new TutorialTargetCatalog(tx, this.features);
      for (const step of body.steps) await validateReferences(tx, step, txTargets, this.features);
      validateRules(body, this.features);
      await reconcileTutorialRows(tx.contentTutorialStep, flowId, body.steps,
        (item: any) => stepRow(flowId, item, true), (item: any) => stepRow(flowId, item), 'step');
      await reconcileTutorialRows(tx.contentTutorialStepTransition, flowId, body.transitions ?? [],
        (item: any, index: number) => transitionRow(flowId, item, index),
        (item: any, index: number) => transitionRow(flowId, item, index), 'transition');
      await reconcileTutorialRows(tx.contentFeatureUnlockRule, flowId, body.unlockRules ?? [],
        (item: any, index: number) => unlockRow(flowId, item, index),
        (item: any, index: number) => unlockRow(flowId, item, index), 'rule');
      const changed = await tx.contentTutorialFlow.updateMany({ where: { id: flowId, row_version: flowInput.rowVersion, deleted_at: null },
        data: { ...flowRow(flowInput), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(flowInput.rowVersion);
      await markDraft(tx, 'tutorial-flow', flowId, 'orchestration', body);
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return this.getFlow(flowId);
  }

  listTargets() { return this.targets.list(); }
  listFeatures() { return this.features.list(); }

  getPublished() {
    return readPublishedTutorial();
  }
}

async function activeFlow(db: any, id: string) {
  const row = await db.contentTutorialFlow.findUnique({ where: { id } });
  if (!row || row.deleted_at) throw new NotFoundException(id);
  return row;
}

async function activeStep(db: any, flowId: string, id: string) {
  const row = await db.contentTutorialStep.findUnique({ where: { id } });
  if (!row || row.deleted_at || row.flow_id && row.flow_id !== flowId) throw new NotFoundException(id);
  return row;
}

function assertVersion(local: number, remote: number) {
  if (local !== remote) throw conflict(local, remote);
}

function conflict(local: number, remote?: number) {
  return new ConflictException({ code: 'CONTENT_CONFLICT', localRowVersion: local, remoteRowVersion: remote });
}

function validateRules(body: any, features: TutorialFeatureCatalog) {
  const ids = new Set(body.steps.map((step: any) => step.id));
  for (const rule of body.unlockRules ?? []) {
    if (rule.stepId && !ids.has(rule.stepId)) throw new BadRequestException({ code: 'TUTORIAL_RULE_STEP_INVALID', stepId: rule.stepId });
    features.require(rule.featureId);
    if (rule.stageId && !body.steps.some((step: any) => step.stageId === rule.stageId)) {
      throw new BadRequestException({ code: 'TUTORIAL_RULE_STAGE_INVALID', stageId: rule.stageId });
    }
  }
}

async function validateReferences(db: any, body: any, targets: TutorialTargetCatalog, features: TutorialFeatureCatalog) {
  validateTargetId(body.targetType, body.targetId);
  await targets.require(body.targetType, body.targetId);
  if (body.stageId) {
    const row = await db.contentStage.findUnique({ where: { id: body.stageId } });
    if (!row || row.deleted_at || !row.enabled) throw new BadRequestException({ code: 'TUTORIAL_STAGE_REFERENCE_INVALID', stageId: body.stageId });
  }
  if (body.campaignId) {
    const row = await db.contentCampaign.findUnique({ where: { id: body.campaignId } });
    if (!row || row.deleted_at || !row.enabled) throw new BadRequestException({ code: 'TUTORIAL_CAMPAIGN_REFERENCE_INVALID', campaignId: body.campaignId });
  }
  if (body.avatarArtKey) {
    const row = await db.contentArtResource.findUnique({ where: { art_key: body.avatarArtKey } });
    if (!row || row.deleted_at || !row.enabled || ['missing', 'invalid'].includes(row.resource_status)) {
      throw new BadRequestException({ code: 'TUTORIAL_ART_REFERENCE_INVALID', artKey: body.avatarArtKey });
    }
  }
  if (body.featureId) features.require(body.featureId);
}

async function validateFlowReferences(db: any, body: any, features: TutorialFeatureCatalog) {
  if (body.campaignId) {
    const row = await db.contentCampaign.findUnique({ where: { id: body.campaignId } });
    if (!row || row.deleted_at || !row.enabled) throw new BadRequestException({ code: 'TUTORIAL_CAMPAIGN_REFERENCE_INVALID', campaignId: body.campaignId });
  }
  for (const featureId of body.skipUnlockFeatures ?? []) {
    const feature = features.require(featureId);
    if (!feature.safeOnSkip) throw new BadRequestException({ code: 'TUTORIAL_SKIP_FEATURE_UNSAFE', featureId });
  }
}

async function lockFlowSources(tx: any, body: any) {
  if (!body.campaignId) return;
  const changed = await tx.contentCampaign.updateMany({ where: { id: body.campaignId, deleted_at: null },
    data: { row_version: { increment: 0 } } });
  if (changed.count !== 1) throw new BadRequestException({ code: 'TUTORIAL_CAMPAIGN_REFERENCE_INVALID', campaignId: body.campaignId });
}

async function validateCandidateGraph(tx: any, flowId: string, changedId: string, replacement?: any) {
  const [flow, rows, transitions] = await Promise.all([
    activeFlow(tx, flowId),
    tx.contentTutorialStep.findMany({ where: { flow_id: flowId, deleted_at: null }, orderBy: { sort_order: 'asc' } }),
    tx.contentTutorialStepTransition.findMany({ where: { flow_id: flowId, deleted_at: null } }),
  ]);
  const steps = rows.filter((row: any) => row.id !== changedId).map(stepModel);
  if (replacement) steps.push({ ...replacement, id: changedId });
  if (!steps.length) return;
  validateTutorialGraph({ startStepId: flow.start_step_id, steps, transitions: transitions.map((row: any) => ({
    fromStepId: row.from_step_id, toStepId: row.to_step_id,
  })) });
}

async function validateStepLinks(db: any, flowId: string, body: any) {
  for (const [field, id] of [['nextStepId', body.nextStepId], ['skipStepId', body.skipStepId]]) {
    if (!id) continue;
    const row = await db.contentTutorialStep.findUnique({ where: { id } });
    if (!row || row.deleted_at || row.flow_id !== flowId) throw new BadRequestException({ code: field === 'nextStepId' ? 'TUTORIAL_NEXT_STEP_INVALID' : 'TUTORIAL_SKIP_STEP_INVALID', stepId: body.id, targetStepId: id });
  }
}

async function validateFlowStepReferences(db: any, flowId: string, body: any) {
  for (const [field, id] of [['startStepId', body.startStepId], ['endStepId', body.endStepId]]) {
    if (!id) continue;
    const row = await db.contentTutorialStep.findUnique({ where: { id } });
    if (!row || row.deleted_at || row.flow_id !== flowId) throw new BadRequestException({
      code: field === 'startStepId' ? 'TUTORIAL_START_STEP_INVALID' : 'TUTORIAL_END_STEP_INVALID', [field]: id,
    });
  }
}

async function validateFlowCandidate(tx: any, before: any, body: any) {
  const critical = ['enabled', 'startStepId', 'endStepId', 'campaignId', 'audience', 'playerCondition'];
  if (!critical.some(key => Object.prototype.hasOwnProperty.call(body, key))) return;
  const enabled = body.enabled ?? before.enabled;
  const startStepId = body.startStepId ?? before.start_step_id;
  const endStepId = body.endStepId ?? before.end_step_id;
  const [rows, transitions] = await Promise.all([
    tx.contentTutorialStep.findMany({ where: { flow_id: before.id, deleted_at: null }, orderBy: { sort_order: 'asc' } }),
    tx.contentTutorialStepTransition.findMany({ where: { flow_id: before.id, deleted_at: null } }),
  ]);
  if (!rows.length) {
    if (enabled) throw new BadRequestException({ code: 'TUTORIAL_ENABLED_FLOW_STEPS_REQUIRED' });
    return;
  }
  if (!startStepId || !endStepId) throw new BadRequestException({ code: 'TUTORIAL_FLOW_BOUNDARY_REQUIRED' });
  const steps = rows.map(stepModel);
  const end = steps.find((step: any) => step.id === endStepId);
  if (!end) throw new BadRequestException({ code: 'TUTORIAL_END_STEP_INVALID', endStepId });
  if (enabled && !end.terminal) throw new BadRequestException({ code: 'TUTORIAL_END_STEP_NOT_TERMINAL', endStepId });
  validateTutorialGraph({ startStepId, steps, transitions: transitions.map((row: any) => ({
    fromStepId: row.from_step_id, toStepId: row.to_step_id,
  })) });
}

function transitionRow(flowId: string, item: any, index: number) {
  return { id: item.id, flow_id: flowId, from_step_id: item.fromStepId, to_step_id: item.toStepId,
    condition_type: item.conditionType ?? 'always', condition_json: item.condition ?? {}, sort_order: item.order ?? index,
    enabled: item.enabled ?? true, row_version: item.rowVersion ?? 1, deleted_at: null };
}

function unlockRow(flowId: string, item: any, index: number) {
  return { id: item.id, flow_id: flowId, step_id: item.stepId ?? null, feature_id: item.featureId,
    unlock_trigger: item.unlockTrigger ?? 'step.complete', condition_json: item.condition ?? {},
    unlock_on_skip: item.unlockOnSkip ?? false, sort_order: item.order ?? index, enabled: item.enabled ?? true,
    row_version: item.rowVersion ?? 1, deleted_at: null };
}

async function markDraft(db: any, entityType: string, entityId: string, action: string, after: any) {
  await db.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
  await db.contentChangeLog.create({ data: { entity_type: entityType, entity_id: entityId, action_type: action, after_json: after } });
}
