import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { stageFromRow } from './content.mapper';

@Injectable()
export class StagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.contentStage.findMany({ where: { deleted_at: null }, orderBy: { updated_at: 'desc' } });
    return Promise.all(rows.map(async row => stageFromRow(row, await this.children(row.id))));
  }

  async get(id: string) {
    const row = await this.prisma.contentStage.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException(id);
    return stageFromRow(row, await this.children(id));
  }

  async create(body: any) {
    this.validate(body);
    const row = await this.prisma.$transaction(async tx => {
      const stage = await tx.contentStage.create({ data: this.stageData(body, true) });
      await this.writeChildren(tx, stage.id, body);
      return stage;
    });
    await this.markDraft(row.id, 'create', null, row);
    return this.get(row.id);
  }

  async update(id: string, body: any) {
    this.validate(body);
    const before = await this.prisma.contentStage.findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    if (body.rowVersion !== before.row_version) throw new ConflictException('CONTENT_CONFLICT');
    const row = await this.prisma.$transaction(async tx => {
      await this.deleteChildren(tx, id);
      await this.writeChildren(tx, id, body);
      return tx.contentStage.update({ where: { id }, data: { ...this.stageData(body, false), row_version: { increment: 1 } } });
    });
    await this.markDraft(id, 'update', before, row);
    return this.get(id);
  }

  async clone(id: string, newId?: string) {
    const source = await this.get(id);
    return this.create({ ...source, id: newId ?? `${id}_copy_${Date.now()}`, name: `${source.name} 副本` });
  }

  async setEnabled(id: string, enabled: boolean) {
    const before = await this.prisma.contentStage.findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    const row = await this.prisma.contentStage.update({ where: { id }, data: { enabled, row_version: { increment: 1 } } });
    await this.markDraft(id, enabled ? 'enable' : 'disable', before, row);
    return this.get(id);
  }

  async remove(id: string) {
    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      const lock = await tx.contentStage.updateMany({ where: { id, deleted_at: null },
        data: { row_version: { increment: 0 } } });
      if (lock.count !== 1) throw new NotFoundException(id);
      const before = await tx.contentStage.findUnique({ where: { id } });
      if (!before || before.deleted_at) throw new NotFoundException(id);
      const progressionRefs = await tx.contentStageUnlockRule.findMany({
        where: { OR: [{ prerequisite_stage_id: id }, { next_stage_id: id }] },
      });
      const externalRefs = progressionRefs.filter((row: any) => row.stage_id !== id);
      const campaignRefs = await (tx.contentCampaignStageNode?.findMany({ where: { stage_id: id } }) ?? []);
      const tutorialRefs = await (tx.contentTutorialStep?.findMany({ where: { deleted_at: null,
        OR: [{ stage_id: id }, { target_type: 'stage', target_id: id }] },
        select: { id: true, flow_id: true, stage_id: true, target_type: true, target_id: true } }) ?? []);
      const references = [...externalRefs.map((row: any) => ({ stageId: row.stage_id, ruleId: row.rule_key ?? row.id,
          field: row.prerequisite_stage_id === id ? 'prerequisiteStageId' : 'nextStageId' })),
        ...campaignRefs.map((row: any) => ({ entity: 'campaignNode', nodeId: row.id,
          chapterId: row.chapter_id, stageId: row.stage_id, name: row.name })),
        ...tutorialRefs.map((row: any) => ({ entity: 'tutorialStep', flowId: row.flow_id, stepId: row.id,
          field: row.target_type === 'stage' && row.target_id === id ? 'targetId' : 'stageId', stageId: id }))];
      if (references.length) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS',
        message: '该关卡已被解锁规则、战役节点或引导引用，禁止删除。', references });
      await this.deleteChildren(tx, id);
      await this.deleteProgression(tx, id);
      await tx.contentStage.update({ where: { id }, data: { deleted_at: new Date() } });
      await this.markDraft(id, 'delete', before, null, tx);
      return { ok: true };
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
  }

  private async children(stageId: string) {
    const waves = await this.prisma.contentStageWave.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    const groups = await this.prisma.contentStageWaveEnemyGroup.findMany({ where: { stage_wave_id: { in: waves.map(w => w.id) } }, orderBy: { sort_order: 'asc' } });
    const spawnGroups = await this.prisma.contentExploreSpawnGroup.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    const objectives = await this.prisma.contentStageObjective.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    return {
      waves: waves.map(w => stageWaveRow(w, groups.filter(g => g.stage_wave_id === w.id).map(stageEnemyGroupRow))),
      exploration: spawnGroups.length ? { spawnGroups: spawnGroups.map(g => ({ id: g.group_key, enemyTemplateId: g.enemy_template_id, spawnPoint: { x: g.spawn_x, y: g.spawn_y, radius: g.spawn_radius }, initialCount: g.initial_count, maxAlive: g.max_alive, respawnInterval: g.respawn_interval, active: true })) } : undefined,
      objectives: objectives.map(o => ({ type: o.objective_type, required: o.required_count, config: o.config_json })),
    };
  }

  private async writeChildren(tx: any, stageId: string, body: any) {
    for (const [i, wave] of (body.waves ?? []).entries()) {
      const row = await tx.contentStageWave.create({ data: { stage_id: stageId, wave_no: wave.wave, wave_key: wave.id, name: wave.name, message: wave.message, spawn_delay: wave.spawnDelay, sort_order: i } });
      for (const [j, group] of (wave.groups ?? []).entries()) {
        await tx.contentStageWaveEnemyGroup.create({ data: { stage_wave_id: row.id, enemy_template_id: group.enemyTemplateId, enemy_count: group.count, spawn_area_id: group.spawnAreaId ?? group.spawnGroup, spawn_interval: group.spawnInterval, level_multiplier: group.levelMultiplier, sort_order: j } });
      }
    }
    for (const [i, group] of (body.exploration?.spawnGroups ?? []).entries()) {
      await tx.contentExploreSpawnGroup.create({ data: { stage_id: stageId, group_key: group.id, enemy_template_id: group.enemyTemplateId, spawn_x: group.spawnPoint.x, spawn_y: group.spawnPoint.y, spawn_radius: group.spawnPoint.radius, initial_count: group.initialCount, max_alive: group.maxAlive, respawn_interval: group.respawnInterval, sort_order: i } });
    }
    for (const [i, objective] of (body.objectives ?? []).entries()) {
      await tx.contentStageObjective.create({ data: { stage_id: stageId, objective_type: objective.type, required_count: objective.required, sort_order: i, config_json: objective.config } });
    }
  }

  private async deleteChildren(tx: any, stageId: string) {
    const waves = await tx.contentStageWave.findMany({ where: { stage_id: stageId } });
    await tx.contentStageWaveEnemyGroup.deleteMany({ where: { stage_wave_id: { in: waves.map((w: any) => w.id) } } });
    await tx.contentStageWave.deleteMany({ where: { stage_id: stageId } });
    await tx.contentExploreSpawnGroup.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageObjective.deleteMany({ where: { stage_id: stageId } });
  }

  private async deleteProgression(tx: any, stageId: string) {
    const pools = await tx.contentStageRewardPool.findMany({ where: { stage_id: stageId } });
    await tx.contentStageRewardEntry.deleteMany({ where: { pool_id: { in: pools.map((row: any) => row.id) } } });
    await tx.contentStageRewardPool.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageProgressionObjective.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageUnlockRule.deleteMany({ where: { stage_id: stageId } });
    await tx.contentStageProgressionConfig.deleteMany({ where: { stage_id: stageId } });
  }

  private stageData(body: any, creating: boolean): any {
    return {
      id: creating ? body.id : undefined,
      legacy_stage_id: body.legacyStageId,
      name: body.name,
      description: body.description,
      mode: body.mode === 'fixed-battle' ? 'fixed_battle' : 'explore',
      hero_visual_template_id: body.heroVisualTemplateId,
      background_theme_id: body.backgroundThemeId,
      world_width: body.exploration?.worldWidth,
      world_height: body.exploration?.worldHeight,
      enabled: body.enabled ?? true,
      content_version: body.contentVersion ?? body.version ?? 1,
    };
  }

  private validate(body: any) {
    for (const group of body.exploration?.spawnGroups ?? []) {
      if (group.initialCount > group.maxAlive) throw new BadRequestException('initialCount 不得大于 maxAlive');
      if (group.spawnPoint.radius <= 0 || group.respawnInterval <= 0) throw new BadRequestException('刷新半径和间隔必须大于 0');
      if (body.exploration?.worldWidth && group.spawnPoint.x > body.exploration.worldWidth) throw new BadRequestException('spawn_x 超出世界范围');
      if (body.exploration?.worldHeight && group.spawnPoint.y > body.exploration.worldHeight) throw new BadRequestException('spawn_y 超出世界范围');
    }
  }

  private async markDraft(entityId: string, action: string, before: any, after: any, db: any = this.prisma) {
    await db.contentSystemState.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
      update: { draft_revision: { increment: 1 }, draft_dirty: true },
    });
    await db.contentChangeLog.create({ data: { entity_type: 'stages', entity_id: entityId, action_type: action, before_json: before, after_json: after } });
  }
}

function stageWaveRow(row: any, groups: any[]) {
  const wave: any = { wave: row.wave_no, groups };
  if (row.wave_key) wave.id = row.wave_key;
  if (row.name) wave.name = row.name;
  if (row.message) wave.message = row.message;
  if (row.spawn_delay != null) wave.spawnDelay = row.spawn_delay;
  return wave;
}

function stageEnemyGroupRow(row: any) {
  const group: any = { enemyTemplateId: row.enemy_template_id, count: row.enemy_count };
  if (row.spawn_area_id) group.spawnAreaId = row.spawn_area_id;
  if (row.spawn_interval != null) group.spawnInterval = row.spawn_interval;
  if (row.level_multiplier != null) group.levelMultiplier = row.level_multiplier;
  return group;
}
