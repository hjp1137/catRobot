import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { validateStageProgression } from './stage-progression.validation';
import { projectRoot } from '../../common/utils/safe-path';

@Injectable()
export class StageProgressionService {
  constructor(private readonly prisma: PrismaService) {}

  async get(stageId: string) {
    await validateStageExists(this.prisma, stageId);
    const config = await (this.prisma as any).contentStageProgressionConfig.findUnique({ where: { stage_id: stageId } });
    const objectives = await (this.prisma as any).contentStageProgressionObjective.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    const pools = await (this.prisma as any).contentStageRewardPool.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    const entries = await (this.prisma as any).contentStageRewardEntry.findMany({ where: { pool_id: { in: pools.map((x: any) => x.id) } }, orderBy: { sort_order: 'asc' } });
    const unlockRules = await (this.prisma as any).contentStageUnlockRule.findMany({ where: { stage_id: stageId }, orderBy: { sort_order: 'asc' } });
    return fromRows(stageId, config, objectives, pools, entries, unlockRules);
  }

  async rewardCatalog() {
    const definitions = await (this.prisma as any).contentRewardDefinition.findMany({ where: { enabled: true }, orderBy: [{ reward_type: 'asc' }, { name: 'asc' }] });
    const artKeys = definitions.map((x: any) => x.icon_art_key).filter(Boolean);
    const resources = artKeys.length ? await (this.prisma as any).contentArtResource.findMany({ where: { art_key: { in: artKeys }, enabled: true, deleted_at: null } }) : [];
    return definitions.map((definition: any) => ({ ...definition,
      referenceStatus: !definition.icon_art_key ? 'valid' : resources.find((x: any) => x.art_key === definition.icon_art_key)?.resource_status ?? 'missing',
    }));
  }

  getPublished(stageId: string) {
    const root = projectRoot();
    const contentPath = path.resolve(root, process.env.CONTENT_SNAPSHOT_JSON_PATH ?? 'content-store/published/content.snapshot.json');
    const progressionPath = path.resolve(root, process.env.STAGE_PROGRESSION_JSON_PATH ?? 'content-store/published/stage-progression.snapshot.json');
    if (!contentPath.startsWith(root + path.sep) || !progressionPath.startsWith(root + path.sep)) throw new ConflictException('STAGE_PROGRESSION_PATH_INVALID');
    return resolvePublishedStageProgression(readJson(contentPath), readJson(progressionPath), stageId);
  }

  async save(stageId: string, body: any) {
    await validateStageProgression(this.prisma, stageId, body);
    const saved = await this.prisma.$transaction(async tx => {
      const before = await (tx as any).contentStageProgressionConfig.findUnique({ where: { stage_id: stageId } });
      if (before && body.rowVersion !== before.row_version) throw progressionConflict(body.rowVersion, before.row_version);
      let config: any;
      if (before) {
        const changed = await (tx as any).contentStageProgressionConfig.updateMany({
          where: { stage_id: stageId, row_version: body.rowVersion },
          data: { ...configData(stageId, body), row_version: { increment: 1 } },
        });
        if (changed.count !== 1) {
          const remote = await (tx as any).contentStageProgressionConfig.findUnique({ where: { stage_id: stageId } });
          throw progressionConflict(body.rowVersion, remote?.row_version);
        }
        config = await (tx as any).contentStageProgressionConfig.findUnique({ where: { stage_id: stageId } });
      } else {
        config = await (tx as any).contentStageProgressionConfig.create({ data: configData(stageId, body) });
      }
      const oldPools = await (tx as any).contentStageRewardPool.findMany({ where: { stage_id: stageId } });
      await (tx as any).contentStageRewardEntry.deleteMany({ where: { pool_id: { in: oldPools.map((x: any) => x.id) } } });
      await (tx as any).contentStageRewardPool.deleteMany({ where: { stage_id: stageId } });
      await (tx as any).contentStageProgressionObjective.deleteMany({ where: { stage_id: stageId } });
      await (tx as any).contentStageUnlockRule.deleteMany({ where: { stage_id: stageId } });
      await (tx as any).contentStageProgressionObjective.createMany({ data: (body.objectives ?? []).map((x: any, i: number) => objectiveData(stageId, x, i)) });
      for (const [i, pool] of (body.rewardPools ?? []).entries()) {
        const row = await (tx as any).contentStageRewardPool.create({ data: poolData(stageId, pool, i) });
        await (tx as any).contentStageRewardEntry.createMany({ data: (pool.entries ?? []).map((x: any, j: number) => entryData(row.id, x, j)) });
      }
      await (tx as any).contentStageUnlockRule.createMany({ data: (body.unlockRules ?? []).map((x: any, i: number) => ruleData(stageId, x, i)) });
      await this.markDraft(stageId, before, body, tx);
      return config;
    });
    return { ...body, stageId, rowVersion: saved.row_version };
  }

  private async markDraft(stageId: string, before: any, after: any, client: any = this.prisma) {
    await client.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
    await client.contentChangeLog.create({ data: { entity_type: 'stage-progression', entity_id: stageId, action_type: 'save-progression', before_json: before, after_json: after } });
  }
}

function progressionConflict(localRowVersion: unknown, remoteRowVersion: unknown) {
  return new ConflictException({ code: 'CONTENT_CONFLICT', message: '目标与奖励草稿已被其他会话更新。', localRowVersion, remoteRowVersion });
}

export function resolvePublishedStageProgression(content: any, snapshot: any, stageId: string) {
  const fallback = (reason: string) => ({ enabled: false, reason, releaseId: content?.releaseId ?? null,
    releaseVersion: content?.releaseVersion ?? null, checksum: content?.stageProgressionChecksum ?? null,
    source: 'legacy-stage-config', progression: null });
  if (!content?.stageProgressionReleaseId || !content?.stageProgressionChecksum) return fallback('content-snapshot-stage-progression-not-declared');
  if (!snapshot || snapshot.releaseId !== content.stageProgressionReleaseId) return fallback('stage-progression-release-mismatch');
  if (snapshot.checksum !== content.stageProgressionChecksum || snapshot.checksum !== progressionChecksum(snapshot)) return fallback('stage-progression-checksum-mismatch');
  const progression = snapshot.stages?.find((item: any) => item.stageId === stageId);
  if (!progression) return fallback('stage-progression-stage-not-found');
  return { enabled: true, reason: 'ok', releaseId: snapshot.releaseId, releaseVersion: content.releaseVersion,
    checksum: snapshot.checksum, source: 'published-stage-progression-snapshot', progression };
}

export function progressionChecksum(snapshot: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(sortValue({ ...snapshot, checksum: '' }), null, 2)).digest('hex');
}

function readJson(filePath: string): any | null {
  try { return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null; }
  catch { return null; }
}

function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result: any, key) => { if (value[key] !== undefined) result[key] = sortValue(value[key]); return result; }, {});
}

async function validateStageExists(prisma: any, stageId: string) {
  const stage = await prisma.contentStage.findFirst({ where: { id: stageId, deleted_at: null } });
  if (!stage) throw new ConflictException(`关卡不存在：${stageId}`);
}

function configData(stageId: string, b: any) { return { stage_id: stageId, recommended_power: b.recommendedPower ?? 0, victory_text: b.victoryText, failure_text: b.failureText }; }
function objectiveData(stageId: string, x: any, i: number) { return { stage_id: stageId, objective_key: x.id, name: x.name, objective_type: x.type, required: x.required ?? false, params_json: x.params, display_text: x.displayText, progress_display: x.progressDisplay, star_eligible: x.starEligible ?? false, enabled: x.enabled ?? true, sort_order: x.order ?? i }; }
function poolData(stageId: string, x: any, i: number) { return { stage_id: stageId, pool_key: x.id, name: x.name, group_type: x.group, objective_key: x.objectiveId, selection_mode: x.selectionMode ?? 'all', enabled: x.enabled ?? true, sort_order: i }; }
function entryData(poolId: string, x: any, i: number) { return { pool_id: poolId, entry_key: x.id, reward_type: x.rewardType, reward_ref_id: x.rewardRefId, min_quantity: x.minQuantity, max_quantity: x.maxQuantity, probability: x.probability ?? 1, guaranteed: x.guaranteed ?? false, enabled: x.enabled ?? true, sort_order: i }; }
function ruleData(stageId: string, x: any, i: number) { return { stage_id: stageId, rule_key: x.id, rule_type: x.type, prerequisite_stage_id: x.prerequisiteStageId, required_stars: x.requiredStars ?? 0, next_stage_id: x.nextStageId, enabled: x.enabled ?? true, sort_order: i }; }
function fromRows(stageId: string, c: any, os: any[], ps: any[], es: any[], rs: any[]) { return { stageId, rowVersion: c?.row_version ?? 0, recommendedPower: c?.recommended_power ?? 0, victoryText: c?.victory_text ?? '', failureText: c?.failure_text ?? '', objectives: os.map(x => ({ id: x.objective_key, name: x.name, type: x.objective_type, required: x.required, params: x.params_json ?? {}, order: x.sort_order, displayText: x.display_text, progressDisplay: x.progress_display, starEligible: x.star_eligible, enabled: x.enabled })), rewardPools: ps.map(p => ({ id: p.pool_key, name: p.name, group: p.group_type, objectiveId: p.objective_key ?? undefined, selectionMode: p.selection_mode, enabled: p.enabled, entries: es.filter(e => e.pool_id === p.id).map(e => ({ id: e.entry_key, rewardType: e.reward_type, rewardRefId: e.reward_ref_id, minQuantity: e.min_quantity, maxQuantity: e.max_quantity, probability: e.probability, guaranteed: e.guaranteed, enabled: e.enabled })) })), unlockRules: rs.map(x => ({ id: x.rule_key, type: x.rule_type, prerequisiteStageId: x.prerequisite_stage_id ?? undefined, requiredStars: x.required_stars, nextStageId: x.next_stage_id ?? undefined, enabled: x.enabled })) }; }
