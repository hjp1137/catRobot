import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { projectRoot } from '../../common/utils/safe-path';
import { entryData, layerData, layoutData, orchestrationFromRows, spawnData } from './stage-orchestration.mapper';

@Injectable()
export class StageOrchestrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrchestration(stageId: string) {
    await this.ensureStage(stageId);
    return orchestrationFromRows(stageId, await this.rows(stageId));
  }

  async getPublishedOrchestration(stageId: string) {
    const root = projectRoot();
    const contentPath = path.resolve(root, process.env.CONTENT_SNAPSHOT_JSON_PATH ?? 'content-store/published/content.snapshot.json');
    const stagePath = path.resolve(root, process.env.STAGE_ORCHESTRATION_JSON_PATH ?? 'content-store/published/stage-orchestration.snapshot.json');
    if (!contentPath.startsWith(root + path.sep) || !stagePath.startsWith(root + path.sep)) throw new ConflictException('STAGE_SNAPSHOT_PATH_INVALID');
    const content = readJson(contentPath);
    if (!content) return publishedFallback('content-snapshot-missing-or-invalid', undefined, stageId);
    if (!content.stageOrchestrationReleaseId || !content.stageOrchestrationChecksum) {
      return publishedFallback('content-snapshot-stage-orchestration-not-declared', content, stageId);
    }
    const snapshot = readJson(stagePath);
    if (!snapshot || snapshot.releaseId !== content.stageOrchestrationReleaseId) return publishedFallback('stage-orchestration-release-mismatch', content, stageId);
    if (snapshot.checksum !== content.stageOrchestrationChecksum || snapshot.checksum !== stageChecksum(snapshot)) {
      return publishedFallback('stage-orchestration-checksum-mismatch', content, stageId);
    }
    const orchestration = snapshot.stages?.find((stage: any) => stage.stageId === stageId) ?? null;
    if (!orchestration) return publishedFallback('stage-orchestration-stage-not-found', content, stageId);
    return {
      enabled: true,
      reason: 'ok',
      releaseId: snapshot.releaseId,
      releaseVersion: content.releaseVersion,
      checksum: snapshot.checksum,
      source: 'published-stage-orchestration-snapshot',
      orchestration,
      visuals: publishedVisuals(content, stageId),
    };
  }

  async saveOrchestration(stageId: string, body: any) {
    await this.ensureStage(stageId);
    await this.validate(stageId, body);
    const before = await (this.prisma as any).contentStageSceneLayout.findUnique({ where: { stage_id: stageId } });
    if (before && body.rowVersion !== before.row_version) {
      throw new ConflictException({
        code: 'CONTENT_CONFLICT',
        message: '草稿已被其他会话更新，请重新加载后再保存。',
        localRowVersion: body.rowVersion,
        remoteRowVersion: before.row_version,
      });
    }
    const layout = await this.prisma.$transaction(async tx => {
      await this.deleteChildren(tx, stageId);
      const saved = before
        ? await (tx as any).contentStageSceneLayout.update({ where: { stage_id: stageId }, data: { ...layoutData(stageId, body), row_version: { increment: 1 } } })
        : await (tx as any).contentStageSceneLayout.create({ data: layoutData(stageId, body) });
      await (tx as any).contentStageLayer.createMany({ data: (body.layers ?? []).map((x: any, i: number) => layerData(stageId, x, i)) });
      await (tx as any).contentStageSpawnPoint.createMany({ data: (body.spawnPoints ?? []).map((x: any, i: number) => spawnData(stageId, x, i)) });
      for (const [i, wave] of (body.waves ?? []).entries()) await this.writeWave(tx, stageId, wave, i);
      return saved;
    });
    await this.markDraft(stageId, 'save-orchestration', before, body);
    return { ...(await this.getOrchestration(stageId)), rowVersion: layout.row_version };
  }

  async removeSpawnPoint(stageId: string, spawnPointId: string) {
    const point = await (this.prisma as any).contentStageSpawnPoint.findFirst({ where: { stage_id: stageId, spawn_point_key: spawnPointId } });
    if (!point) throw new NotFoundException(spawnPointId);
    const entries = await (this.prisma as any).contentStageWaveEntry.findMany({ where: { spawn_point_key: spawnPointId } });
    if (entries.length) {
      const waves = await (this.prisma as any).contentStageOrchestrationWave.findMany({ where: { id: { in: entries.map((x: any) => x.wave_id) } } });
      throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', message: '出生点已被波次引用，禁止删除。', references: entries.map((entry: any) => {
        const wave = waves.find((x: any) => x.id === entry.wave_id);
        return { stageId, waveId: wave?.wave_key, waveName: wave?.name, entryId: entry.entry_key, enemyTemplateId: entry.enemy_template_id, field: 'spawnPointId' };
      }) });
    }
    await (this.prisma as any).contentStageSpawnPoint.deleteMany({ where: { stage_id: stageId, spawn_point_key: spawnPointId } });
    await this.markDraft(stageId, 'delete-spawn-point', point, null);
    return { ok: true };
  }

  private async rows(stageId: string) {
    const waves = await (this.prisma as any).contentStageOrchestrationWave.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    return {
      layout: await (this.prisma as any).contentStageSceneLayout.findUnique({ where: { stage_id: stageId } }),
      layers: await (this.prisma as any).contentStageLayer.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } }),
      spawnPoints: await (this.prisma as any).contentStageSpawnPoint.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } }),
      waves,
      entries: await (this.prisma as any).contentStageWaveEntry.findMany({ where: { wave_id: { in: waves.map((x: any) => x.id) } }, orderBy: { sort_order: 'asc' } }),
    };
  }

  private async writeWave(tx: any, stageId: string, wave: any, index: number) {
    const row = await (tx as any).contentStageOrchestrationWave.create({ data: { stage_id: stageId, wave_key: wave.id, name: wave.name, wave_order: wave.order, start_trigger: wave.startTrigger?.type ?? 'stage-start', start_delay_ms: wave.startDelayMs ?? 0, max_alive: wave.maxAlive ?? 8, completion_rule: wave.completionRule?.type ?? 'all-enemies-cleared', completion_delay_ms: wave.completionDelayMs ?? 0, next_wave: wave.nextWave, enabled: wave.enabled ?? true, sort_order: index } });
    await (tx as any).contentStageWaveEntry.createMany({ data: (wave.entries ?? []).map((x: any, i: number) => entryData(row.id, x, i)) });
  }

  private async deleteChildren(tx: any, stageId: string) {
    const waves = await (tx as any).contentStageOrchestrationWave.findMany({ where: { stage_id: stageId } });
    await (tx as any).contentStageWaveEntry.deleteMany({ where: { wave_id: { in: waves.map((x: any) => x.id) } } });
    await (tx as any).contentStageOrchestrationWave.deleteMany({ where: { stage_id: stageId } });
    await (tx as any).contentStageLayer.deleteMany({ where: { stage_id: stageId } });
    await (tx as any).contentStageSpawnPoint.deleteMany({ where: { stage_id: stageId } });
  }

  private async ensureStage(stageId: string) {
    const stage = await this.prisma.contentStage.findFirst({ where: { id: stageId, deleted_at: null } });
    if (!stage) throw new NotFoundException(stageId);
    return stage;
  }

  private async validate(stageId: string, body: any) {
    const points = body.spawnPoints ?? [];
    const hud = body.layout?.exploreHud;
    if (hud && !['standard', 'compact', 'tactical'].includes(hud.layout ?? 'standard')) throw new BadRequestException('自由探索 HUD 布局不合法');
    if (hud?.theme && !['legacy', 'industrial'].includes(hud.theme)) throw new BadRequestException('自由探索 HUD 主题不合法');
    if (hud?.skillButtonShape && !['circle', 'hex'].includes(hud.skillButtonShape)) throw new BadRequestException('技能按钮形状不合法');
    if (hud?.showWaveNotice != null && typeof hud.showWaveNotice !== 'boolean') throw new BadRequestException('自由探索 HUD 波次提示配置不合法');
    if (hud?.showSkillLabels != null && typeof hud.showSkillLabels !== 'boolean') throw new BadRequestException('技能标签配置不合法');
    validateHudNumber(hud, 'skillButtonSize', 56, 88);
    validateHudNumber(hud, 'skillButtonGap', 8, 36);
    validateHudNumber(hud, 'skillButtonRight', 12, 48);
    validateHudNumber(hud, 'skillButtonBottom', 16, 72);
    validateHudNumber(hud, 'panelOpacity', 0.35, 0.95);
    if (points.filter((x: any) => x.type === 'hero' && x.enabled !== false).length !== 1) throw new BadRequestException('固定屏关卡必须有且仅有一个启用主角出生点');
    const pointIds = new Set(points.map((x: any) => x.id));
    const enemyIds = new Set((await this.prisma.contentEnemyTemplate.findMany({ where: { enabled: true, deleted_at: null } })).map((x: any) => x.id));
    for (const wave of body.waves ?? []) for (const entry of wave.entries ?? []) {
      if (!pointIds.has(entry.spawnPointId)) throw new BadRequestException(`出生点不存在：${entry.spawnPointId}`);
      if (!enemyIds.has(entry.enemyTemplateId)) throw new BadRequestException(`敌人模板不存在：${entry.enemyTemplateId}`);
      if (entry.count <= 0 || entry.spawnIntervalMs < 0) throw new BadRequestException('波次条目数量和间隔不合法');
    }
    const artKeys = [...new Set<string>((body.layers ?? []).filter((x: any) => x.enabled !== false).map((x: any) => x.artKey).filter(Boolean))];
    if (artKeys.length) {
      const resources = await this.prisma.contentArtResource.findMany({
        where: { art_key: { in: artKeys }, enabled: true, deleted_at: null },
        include: { currentDraftVersion: true },
      } as any);
      const validKeys = new Set(resources
        .filter((row: any) => row.resource_status !== 'missing' && row.currentDraftVersion?.validation_status !== 'invalid')
        .map((row: any) => row.art_key));
      const invalid = artKeys.filter(key => !validKeys.has(key));
      if (invalid.length) throw new BadRequestException({ code: 'STAGE_ART_RESOURCE_INVALID', artKeys: invalid });
    }
  }

  private async markDraft(entityId: string, action: string, before: any, after: any) {
    await this.prisma.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
    await this.prisma.contentChangeLog.create({ data: { entity_type: 'stage-orchestration', entity_id: entityId, action_type: action, before_json: before, after_json: after } });
  }
}

function validateHudNumber(hud: any, field: string, min: number, max: number): void {
  const value = hud?.[field];
  if (value == null) return;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new BadRequestException(`自由探索 HUD ${field} 超出范围`);
  }
}

function publishedFallback(reason: string, content?: any, stageId?: string) {
  return {
    enabled: false,
    reason,
    releaseId: content?.releaseId ?? null,
    releaseVersion: content?.releaseVersion ?? null,
    checksum: content?.stageOrchestrationChecksum ?? null,
    source: 'legacy-stage-config',
    message: '当前正式版本未启用关卡编排，运行时使用旧关卡逻辑。',
    orchestration: null,
    visuals: publishedVisuals(content, stageId),
  };
}

function publishedVisuals(content: any, stageId?: string) {
  return {
    stage: content?.stages?.find((item: any) => item.id === stageId) ?? null,
    enemies: content?.enemies ?? [],
    backgrounds: content?.backgrounds ?? [],
    heroVisuals: content?.heroVisuals ?? [],
    artResources: content?.artResources ?? [],
  };
}

function readJson(filePath: string): any | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function stageChecksum(snapshot: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(sortValue({ ...snapshot, checksum: '' }), null, 2)).digest('hex');
}

function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result: Record<string, unknown>, key) => {
    if (value[key] !== undefined) result[key] = sortValue(value[key]);
    return result;
  }, {});
}
