import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { backgroundFromRow, enemyFromRow, heroFromRow } from './content.mapper';

type Kind = 'enemies' | 'backgrounds' | 'heroes';

const DELEGATE: Record<Kind, string> = {
  enemies: 'contentEnemyTemplate',
  backgrounds: 'contentBackgroundTheme',
  heroes: 'contentHeroVisual',
};

@Injectable()
export class ContentCrudService {
  constructor(private readonly prisma: PrismaService) {}

  async list(kind: Kind) {
    const rows = await this.delegate(kind).findMany({ where: { deleted_at: null }, orderBy: { updated_at: 'desc' } });
    return rows.map((row: any) => this.fromRow(kind, row));
  }

  async get(kind: Kind, id: string) {
    const row = await this.delegate(kind).findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException(id);
    return this.fromRow(kind, row);
  }

  async create(kind: Kind, body: any) {
    const row = await this.delegate(kind).create({ data: this.toRow(kind, body, true) });
    await this.markDraft(kind, row.id, 'create', null, row);
    return this.fromRow(kind, row);
  }

  async update(kind: Kind, id: string, body: any) {
    const before = await this.delegate(kind).findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    if (body.rowVersion !== before.row_version) throw new ConflictException('CONTENT_CONFLICT');
    const row = await this.delegate(kind).update({
      where: { id },
      data: { ...this.toRow(kind, body, false), row_version: { increment: 1 } },
    });
    await this.markDraft(kind, id, 'update', before, row);
    return this.fromRow(kind, row);
  }

  async clone(kind: Kind, id: string, newId?: string) {
    const source = await this.delegate(kind).findUnique({ where: { id } });
    if (!source || source.deleted_at) throw new NotFoundException(id);
    const data = { ...source, id: newId ?? `${id}_copy_${Date.now()}`, name: `${source.name} 副本`, row_version: 1 };
    delete data.created_at; delete data.updated_at; delete data.deleted_at;
    const row = await this.delegate(kind).create({ data });
    await this.markDraft(kind, row.id, 'clone', source, row);
    return this.fromRow(kind, row);
  }

  async setEnabled(kind: Kind, id: string, enabled: boolean) {
    const before = await this.delegate(kind).findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    const row = await this.delegate(kind).update({ where: { id }, data: { enabled, row_version: { increment: 1 } } });
    await this.markDraft(kind, id, enabled ? 'enable' : 'disable', before, row);
    return this.fromRow(kind, row);
  }

  async remove(kind: Kind, id: string) {
    const refs = await this.references(kind, id);
    if (refs.length) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', message: '该内容已被关卡引用，禁止删除。', references: refs });
    const before = await this.delegate(kind).findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    const row = await this.delegate(kind).update({ where: { id }, data: { deleted_at: new Date() } });
    await this.markDraft(kind, id, 'delete', before, row);
    return { ok: true };
  }

  async references(kind: Kind, id: string) {
    if (kind === 'enemies') {
      const waves = await this.prisma.contentStageWaveEnemyGroup.findMany({ where: { enemy_template_id: id } });
      const stageEntries = await (this.prisma as any).contentStageWaveEntry?.findMany ? await (this.prisma as any).contentStageWaveEntry.findMany({ where: { enemy_template_id: id } }) : [];
      const spawns = await this.prisma.contentExploreSpawnGroup.findMany({ where: { enemy_template_id: id } });
      const stageWaves = await this.prisma.contentStageWave.findMany({ where: { id: { in: [...new Set(waves.map((row: any) => row.stage_wave_id))] } } });
      const orchestrationWaves = await (this.prisma as any).contentStageOrchestrationWave?.findMany ? await (this.prisma as any).contentStageOrchestrationWave.findMany({ where: { id: { in: [...new Set(stageEntries.map((row: any) => row.wave_id))] } } }) : [];
      const stageIds = [...new Set([...stageWaves.map((row: any) => row.stage_id), ...orchestrationWaves.map((row: any) => row.stage_id), ...spawns.map((row: any) => row.stage_id)])];
      const stages = await this.prisma.contentStage.findMany({ where: { id: { in: stageIds }, deleted_at: null } });
      const stageMap = new Map(stages.map((row: any) => [row.id, row]));
      const waveMap = new Map(stageWaves.map((row: any) => [row.id, row]));
      return [
        ...waves.map((row: any) => {
          const wave = waveMap.get(row.stage_wave_id) as any;
          const stage = wave ? stageMap.get(wave.stage_id) as any : null;
          return { type: 'stage-wave-enemy-group', id: row.id, stageId: wave?.stage_id, stageName: stage?.name, waveNo: wave?.wave_no };
        }),
        ...spawns.map((row: any) => {
          const stage = stageMap.get(row.stage_id) as any;
          return { type: 'explore-spawn-group', id: row.id, groupKey: row.group_key, stageId: row.stage_id, stageName: stage?.name };
        }),
        ...stageEntries.map((row: any) => {
          const wave = orchestrationWaves.find((item: any) => item.id === row.wave_id);
          const stage = stageMap.get(wave?.stage_id) as any;
          return { type: 'stage-wave-entry', id: row.id, stageId: wave?.stage_id, stageName: stage?.name, waveKey: wave?.wave_key, entryKey: row.entry_key };
        }),
      ];
    }
    const field = kind === 'backgrounds' ? 'background_theme_id' : 'hero_visual_template_id';
    const stages = await this.prisma.contentStage.findMany({ where: { [field]: id, deleted_at: null } });
    return stages.map((row: any) => ({ type: 'stage', id: row.id, stageId: row.id, stageName: row.name }));
  }

  private delegate(kind: Kind): any {
    return (this.prisma as any)[DELEGATE[kind]];
  }

  private fromRow(kind: Kind, row: any) {
    if (kind === 'enemies') return enemyFromRow(row);
    if (kind === 'backgrounds') return backgroundFromRow(row);
    return heroFromRow(row);
  }

  private toRow(kind: Kind, body: any, creating: boolean) {
    const base = {
      id: creating ? body.id : undefined,
      name: body.name,
      description: body.description,
      enabled: body.enabled ?? true,
      content_version: body.contentVersion ?? body.version ?? 1,
    };
    if (kind === 'enemies') return { ...base, category: body.category, behavior_type: body.behaviorType, visual_json: body.visual, stats_json: body.stats, combat_json: body.combat, rewards_json: body.rewards, tags_json: body.tags };
    if (kind === 'backgrounds') return { ...base, art_json: body.art, colors_json: body.colors, rendering_json: body.rendering };
    return { ...base, visual_json: body.visual, skills_json: body.skills };
  }

  private async markDraft(entityType: string, entityId: string, action: string, before: any, after: any) {
    await this.prisma.contentSystemState.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
      update: { draft_revision: { increment: 1 }, draft_dirty: true },
    });
    await this.prisma.contentChangeLog.create({ data: { entity_type: entityType, entity_id: entityId, action_type: action, before_json: before, after_json: after } });
  }
}
