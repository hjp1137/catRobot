import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { validateCampaignMap } from './campaign.validation';
import { projectRoot } from '../../common/utils/safe-path';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MYSQL_INT_MIN = -2_147_483_648;
const CHAPTER_ARCHIVE_NO_MIN = -1_073_741_824;
const CHAPTER_ARCHIVE_NO_MAX = -1;
const CHAPTER_REORDER_TEMP_NO_MAX = CHAPTER_ARCHIVE_NO_MIN - 1;
export const CHAPTER_REORDER_TEMP_CAPACITY = CHAPTER_REORDER_TEMP_NO_MAX - MYSQL_INT_MIN + 1;

export function assertChapterReorderCapacity(count: number): void {
  if (!Number.isSafeInteger(count) || count < 0 || count > CHAPTER_REORDER_TEMP_CAPACITY) {
    throw new BadRequestException({ code: 'CAMPAIGN_CHAPTER_ORDER_CAPACITY_EXCEEDED' });
  }
}

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublished() {
    const contentPath = path.resolve(projectRoot(), 'content-store/published/content.snapshot.json');
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    const fallback = (reason: string) => ({ enabled: false, source: 'LEGACY_FALLBACK', releaseVersion: content.releaseVersion, reason, campaigns: [] });
    if (!content.campaignSnapshotReleaseId || !content.campaignSnapshotChecksum) return fallback('content-snapshot-campaign-not-declared');
    const snapshotPath = path.resolve(projectRoot(), content.campaignSnapshotPath ?? 'content-store/published/campaign.snapshot.json');
    if (!snapshotPath.startsWith(projectRoot() + path.sep) || !fs.existsSync(snapshotPath)) return fallback('campaign-snapshot-missing');
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    if (snapshot.releaseId !== content.campaignSnapshotReleaseId) return fallback('campaign-release-mismatch');
    if (snapshot.checksum !== content.campaignSnapshotChecksum || campaignChecksum(snapshot) !== snapshot.checksum) return fallback('campaign-checksum-mismatch');
    return { enabled: true, source: 'published-campaign-snapshot', releaseVersion: content.releaseVersion,
      checksum: snapshot.checksum, campaigns: snapshot.campaigns ?? [] };
  }

  async createCampaign(body: any) {
    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      const row = await tx.contentCampaign.create({ data: campaignRow(body, true) });
      await markDraft(tx, 'campaign', row.id, 'create', body);
      return row;
    });
  }

  async listCampaigns() {
    const db = this.prisma as any;
    const [campaigns, chapters, nodes] = await Promise.all([
      db.contentCampaign.findMany({ where: { deleted_at: null }, orderBy: { sort_order: 'asc' } }),
      db.contentCampaignChapter.findMany({ where: { deleted_at: null } }),
      db.contentCampaignStageNode.findMany({}),
    ]);
    return campaigns.map((row: any) => ({ ...campaignModel(row), rowVersion: row.row_version,
      chapterCount: chapters.filter((item: any) => item.campaign_id === row.id).length,
      nodeCount: nodes.filter((item: any) => chapters.some((chapter: any) => chapter.campaign_id === row.id && chapter.id === item.chapter_id)).length,
      draftDirty: true, updatedAt: row.updated_at }));
  }

  async getCampaign(id: string) {
    const db = this.prisma as any;
    const row = await db.contentCampaign.findUnique({ where: { id } });
    if (!row || row.deleted_at) throw new NotFoundException(id);
    return { ...campaignModel(row), rowVersion: row.row_version, chapters: await this.listChapters(id) };
  }

  async updateCampaign(id: string, body: any) {
    const db = this.prisma as any;
    const before = await db.contentCampaign.findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    if (body.rowVersion !== before.row_version) throw conflict(body.rowVersion, before.row_version);
    await db.$transaction(async (tx: any) => {
      const changed = await tx.contentCampaign.updateMany({
        where: { id, row_version: body.rowVersion, deleted_at: null },
        data: { ...campaignRow(body), row_version: { increment: 1 } },
      });
      if (changed.count !== 1) throw conflict(body.rowVersion, undefined);
      await markDraft(tx, 'campaign', id, 'update', body);
    });
    return { ...body, id, rowVersion: body.rowVersion + 1 };
  }

  async cloneCampaign(id: string, newId = `${id}_copy_${Date.now()}`) {
    const db = this.prisma as any;
    const source = await db.contentCampaign.findUnique({ where: { id } });
    if (!source || source.deleted_at) throw new NotFoundException(id);
    const chapters = await db.contentCampaignChapter.findMany({ where: { campaign_id: id, deleted_at: null } });
    const chapterIds = chapters.map((row: any) => row.id);
    const [nodes, connections] = await Promise.all([
      db.contentCampaignStageNode.findMany({ where: { chapter_id: { in: chapterIds } } }),
      db.contentCampaignNodeConnection.findMany({ where: { chapter_id: { in: chapterIds } } }),
    ]);
    await db.$transaction(async (tx: any) => {
      await tx.contentCampaign.create({ data: { ...withoutDbFields(source), id: newId,
        name: `${source.name} 副本`, default_chapter_id: null, row_version: 1 } });
      for (const [index, chapter] of chapters.entries()) {
        const chapterId = `${newId}_chapter_${index + 1}`;
        await tx.contentCampaignChapter.create({ data: { ...withoutDbFields(chapter), id: chapterId,
          campaign_id: newId, row_version: 1 } });
        const ownNodes = nodes.filter((row: any) => row.chapter_id === chapter.id);
        const nodeIds = new Map(ownNodes.map((row: any) => [row.id, `${chapterId}_${row.id}`]));
        if (ownNodes.length) await tx.contentCampaignStageNode.createMany({ data: ownNodes.map((row: any) => ({
          ...withoutDbFields(row), id: nodeIds.get(row.id), chapter_id: chapterId })) });
        const ownConnections = connections.filter((row: any) => row.chapter_id === chapter.id);
        if (ownConnections.length) await tx.contentCampaignNodeConnection.createMany({ data: ownConnections.map((row: any) => ({
          ...withoutDbFields(row), id: `${chapterId}_${row.id}`, chapter_id: chapterId,
          from_node_id: nodeIds.get(row.from_node_id), to_node_id: nodeIds.get(row.to_node_id) })) });
      }
      await markDraft(tx, 'campaign', newId, 'clone', { sourceId: id });
    });
    return { ...campaignModel(source), id: newId, name: `${source.name} 副本`, rowVersion: 1 };
  }

  async setCampaignEnabled(id: string, enabled: boolean, rowVersion: number) {
    const db = this.prisma as any;
    const row = await db.contentCampaign.findUnique({ where: { id } });
    if (!row || row.deleted_at) throw new NotFoundException(id);
    return this.updateCampaign(id, { ...campaignModel(row), rowVersion, enabled });
  }

  async removeCampaign(id: string, rowVersion: number) {
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      const lock = await tx.contentCampaign.updateMany({ where: { id, deleted_at: null },
        data: { row_version: { increment: 0 } } });
      if (lock.count !== 1) throw new NotFoundException(id);
      const before = await tx.contentCampaign.findUnique({ where: { id } });
      if (!before || before.deleted_at) throw new NotFoundException(id);
      if (rowVersion !== before.row_version) throw conflict(rowVersion, before.row_version);
      const count = await tx.contentCampaignChapter.count({ where: { campaign_id: id, deleted_at: null } });
      const tutorialCount = tx.contentTutorialFlow?.count
        ? await tx.contentTutorialFlow.count({ where: { campaign_id: id, deleted_at: null } }) : 0;
      const tutorialTargetCount = tx.contentTutorialStep?.count
        ? await tx.contentTutorialStep.count({ where: { target_type: 'campaign', target_id: id, deleted_at: null } }) : 0;
      const references = [];
      if (count) references.push({ entity: 'campaignChapter', campaignId: id, count });
      if (tutorialCount) references.push({ entity: 'tutorialFlow', campaignId: id, count: tutorialCount });
      if (tutorialTargetCount) references.push({ entity: 'tutorialStepTarget', campaignId: id, count: tutorialTargetCount });
      if (references.length) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', references });
      const changed = await tx.contentCampaign.updateMany({
        where: { id, row_version: rowVersion, deleted_at: null },
        data: { deleted_at: new Date(), enabled: false, row_version: { increment: 1 } },
      });
      if (changed.count !== 1) throw conflict(rowVersion, undefined);
      await markDraft(tx, 'campaign', id, 'delete', { rowVersion });
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ok: true };
  }

  async createChapter(campaignId: string, body: any) {
    const db = this.prisma as any;
    return db.$transaction(async (tx: any) => {
      const row = await tx.contentCampaignChapter.create({ data: chapterRow({ ...body, campaignId }, true) });
      await markDraft(tx, 'campaign-chapter', row.id, 'create', body);
      return row;
    });
  }

  async updateChapter(id: string, body: any) {
    const db = this.prisma as any;
    const before = await db.contentCampaignChapter.findUnique({ where: { id } });
    if (!before || before.deleted_at) throw new NotFoundException(id);
    if (body.rowVersion !== before.row_version) throw conflict(body.rowVersion, before.row_version);
    await db.$transaction(async (tx: any) => {
      const changed = await tx.contentCampaignChapter.updateMany({
        where: { id, row_version: body.rowVersion, deleted_at: null },
        data: { ...chapterRow(body), row_version: { increment: 1 } },
      });
      if (changed.count !== 1) throw conflict(body.rowVersion, undefined);
      await markDraft(tx, 'campaign-chapter', id, 'update', body);
    });
    return { ...body, id, rowVersion: body.rowVersion + 1 };
  }

  async cloneChapter(id: string, newId = `${id}_copy_${Date.now()}`) {
    const db = this.prisma as any;
    const source = await db.contentCampaignChapter.findUnique({ where: { id } });
    if (!source || source.deleted_at) throw new NotFoundException(id);
    const [siblings, nodes, connections] = await Promise.all([
      db.contentCampaignChapter.findMany({ where: { campaign_id: source.campaign_id, deleted_at: null } }),
      db.contentCampaignStageNode.findMany({ where: { chapter_id: id } }),
      db.contentCampaignNodeConnection.findMany({ where: { chapter_id: id } }),
    ]);
    const chapterNo = Math.max(0, ...siblings.map((row: any) => row.chapter_no)) + 1;
    await db.$transaction(async (tx: any) => {
      await tx.contentCampaignChapter.create({ data: { ...withoutDbFields(source), id: newId,
        chapter_no: chapterNo, name: `${source.name} 副本`, row_version: 1 } });
      const nodeIds = new Map(nodes.map((row: any) => [row.id, `${newId}_${row.id}`]));
      if (nodes.length) await tx.contentCampaignStageNode.createMany({ data: nodes.map((row: any) => ({
        ...withoutDbFields(row), id: nodeIds.get(row.id), chapter_id: newId })) });
      if (connections.length) await tx.contentCampaignNodeConnection.createMany({ data: connections.map((row: any) => ({
        ...withoutDbFields(row), id: `${newId}_${row.id}`, chapter_id: newId,
        from_node_id: nodeIds.get(row.from_node_id), to_node_id: nodeIds.get(row.to_node_id) })) });
      await markDraft(tx, 'campaign-chapter', newId, 'clone', { sourceId: id });
    });
    return { ...chapterModel(source), id: newId, chapterNo, name: `${source.name} 副本`, rowVersion: 1 };
  }

  async reorderChapters(campaignId: string, body: any) {
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) throw new BadRequestException({ code: 'CAMPAIGN_CHAPTER_ORDER_EMPTY' });
    assertChapterReorderCapacity(items.length);
    const ids = new Set(items.map((item: any) => item.id));
    const orders = new Set(items.map((item: any) => item.chapterNo));
    if (ids.size !== items.length || orders.size !== items.length ||
      items.some((item: any) => !item.id || !Number.isInteger(item.chapterNo) || item.chapterNo < 1)) {
      throw new BadRequestException({ code: 'CAMPAIGN_CHAPTER_ORDER_INVALID' });
    }
    const ordered = [...items].sort((a: any, b: any) => a.chapterNo - b.chapterNo);
    const db = this.prisma as any;
    await db.$transaction(async (tx: any) => {
      const active = await tx.contentCampaignChapter.findMany({
        where: { campaign_id: campaignId, deleted_at: null }, select: { id: true },
      });
      if (active.length !== ordered.length || active.some((row: any) => !ids.has(row.id))) {
        throw new BadRequestException({ code: 'CAMPAIGN_CHAPTER_ORDER_INVALID' });
      }
      for (const [index, item] of ordered.entries()) {
        const changed = await tx.contentCampaignChapter.updateMany({
          where: { id: item.id, campaign_id: campaignId, row_version: item.rowVersion, deleted_at: null },
          data: { chapter_no: CHAPTER_REORDER_TEMP_NO_MAX - index },
        });
        if (changed.count !== 1) throw conflict(item.rowVersion, undefined);
      }
      for (const [index, item] of ordered.entries()) {
        const changed = await tx.contentCampaignChapter.updateMany({
          where: { id: item.id, campaign_id: campaignId, row_version: item.rowVersion, deleted_at: null },
          data: { chapter_no: index + 1, row_version: { increment: 1 } },
        });
        if (changed.count !== 1) throw conflict(item.rowVersion, undefined);
      }
      await markDraft(tx, 'campaign-chapter', campaignId, 'reorder', body);
    });
    return { items: ordered.map((item: any, index: number) => ({
      id: item.id, chapterNo: index + 1, rowVersion: item.rowVersion + 1,
    })) };
  }

  async setChapterEnabled(id: string, enabled: boolean, rowVersion: number) {
    const db = this.prisma as any;
    const row = await db.contentCampaignChapter.findUnique({ where: { id } });
    if (!row || row.deleted_at) throw new NotFoundException(id);
    return this.updateChapter(id, { ...chapterModel(row), rowVersion, enabled });
  }

  async listChapters(campaignId: string) {
    const db = this.prisma as any;
    const [rows, nodes] = await Promise.all([
      db.contentCampaignChapter.findMany({ where: { campaign_id: campaignId, deleted_at: null }, orderBy: { chapter_no: 'asc' } }),
      db.contentCampaignStageNode.findMany({}),
    ]);
    return rows.map((row: any) => { const own = nodes.filter((item: any) => item.chapter_id === row.id); return {
      ...chapterModel(row), rowVersion: row.row_version, nodeCount: own.length,
      startNode: own.find((item: any) => item.is_start)?.name, endNode: own.find((item: any) => item.is_end)?.name,
      updatedAt: row.updated_at } });
  }

  async removeChapter(id: string, rowVersion: number) {
    const db = this.prisma as any;
    const locator = await db.contentCampaignChapter.findUnique({
      where: { id }, select: { campaign_id: true },
    });
    if (!locator) throw new NotFoundException(id);
    await db.$transaction(async (tx: any) => {
      // 事务首条DB操作：InnoDB写锁先于一致性读取建立快照；increment 0不改变版本值。
      const campaignLock = await tx.contentCampaign.updateMany({
        where: { id: locator.campaign_id, deleted_at: null },
        data: { row_version: { increment: 0 } },
      });
      if (campaignLock.count !== 1) {
        throw new ConflictException({ code: 'CAMPAIGN_CHAPTER_ARCHIVE_LOCK_FAILED' });
      }
      const before = await tx.contentCampaignChapter.findUnique({ where: { id } });
      if (!before || before.deleted_at) throw new NotFoundException(id);
      if (rowVersion !== before.row_version) throw conflict(rowVersion, before.row_version);
      const [nodeCount, defaultCount] = await Promise.all([
        tx.contentCampaignStageNode.count({ where: { chapter_id: id } }),
        tx.contentCampaign.count({ where: { default_chapter_id: id, deleted_at: null } }),
      ]);
      const references: any[] = [];
      if (nodeCount) references.push({ entity: 'campaignNode', chapterId: id, count: nodeCount });
      if (defaultCount) references.push({ entity: 'campaignDefaultChapter', chapterId: id, count: defaultCount });
      if (references.length) throw new ConflictException({ code: 'CONTENT_REFERENCE_EXISTS', references });
      const archived = await tx.contentCampaignChapter.findFirst({
        where: { campaign_id: before.campaign_id,
          chapter_no: { gte: CHAPTER_ARCHIVE_NO_MIN, lte: CHAPTER_ARCHIVE_NO_MAX } },
        orderBy: { chapter_no: 'asc' }, select: { chapter_no: true },
      });
      if (archived?.chapter_no === CHAPTER_ARCHIVE_NO_MIN) {
        throw new ConflictException({ code: 'CAMPAIGN_CHAPTER_ARCHIVE_CAPACITY_EXCEEDED' });
      }
      const archiveNo = archived ? archived.chapter_no - 1 : CHAPTER_ARCHIVE_NO_MAX;
      const changed = await tx.contentCampaignChapter.updateMany({
        where: { id, row_version: rowVersion, deleted_at: null },
        data: { chapter_no: archiveNo, deleted_at: new Date(), enabled: false, row_version: { increment: 1 } },
      });
      if (changed.count !== 1) throw conflict(rowVersion, undefined);
      await markDraft(tx, 'campaign-chapter', id, 'delete', { rowVersion });
    }, { isolationLevel: 'Serializable', maxWait: 10000, timeout: 20000 });
    return { ok: true };
  }

  async getChapterMap(chapterId: string) {
    const db = this.prisma as any;
    const [chapter, nodes, connections] = await Promise.all([
      db.contentCampaignChapter.findUnique({ where: { id: chapterId } }),
      db.contentCampaignStageNode.findMany({ where: { chapter_id: chapterId }, orderBy: { sort_order: 'asc' } }),
      db.contentCampaignNodeConnection.findMany({ where: { chapter_id: chapterId }, orderBy: { sort_order: 'asc' } }),
    ]);
    if (!chapter) throw new NotFoundException(chapterId);
    return { rowVersion: chapter.row_version, chapter: chapterModel(chapter), nodes: nodes.map(nodeModel), connections: connections.map(connectionModel) };
  }

  async saveChapterMap(chapterId: string, body: any) {
    try { validateCampaignMap(body); } catch (error) {
      throw new BadRequestException({ code: (error as Error).message, message: (error as Error).message });
    }
    const db = this.prisma as any;
    const before = await db.contentCampaignChapter.findUnique({ where: { id: chapterId } });
    if (!before) throw new NotFoundException(chapterId);
    if (body.rowVersion !== before.row_version) throw conflict(body.rowVersion, before.row_version);
    await validateReferences(db, body);
    const nextVersion = before.row_version + 1;
    await db.$transaction(async (tx: any) => {
      const changed = await tx.contentCampaignChapter.updateMany({ where: { id: chapterId, row_version: body.rowVersion }, data: { ...chapterRow(body.chapter), row_version: { increment: 1 } } });
      if (changed.count !== 1) throw conflict(body.rowVersion, undefined);
      await tx.contentCampaignNodeConnection.deleteMany({ where: { chapter_id: chapterId } });
      await tx.contentCampaignStageNode.deleteMany({ where: { chapter_id: chapterId } });
      await tx.contentCampaignStageNode.createMany({ data: body.nodes.map((item: any) => nodeRow(chapterId, item)) });
      await tx.contentCampaignNodeConnection.createMany({ data: body.connections.map((item: any) => connectionRow(chapterId, item)) });
      await markDraft(tx, 'campaign-chapter', chapterId, 'update-map', body);
    });
    return { ...body, rowVersion: nextVersion };
  }
}

function conflict(local: number, remote?: number) { return new ConflictException({ code: 'CONTENT_CONFLICT', localRowVersion: local, remoteRowVersion: remote }); }
function withoutDbFields(row: any) {
  const { created_at, updated_at, deleted_at, ...data } = row;
  return data;
}
async function validateReferences(db: any, body: any) {
  const stageIds = [...new Set(body.nodes.map((item: any) => item.stageId))];
  const stages = await db.contentStage.findMany({ where: { id: { in: stageIds }, deleted_at: null }, select: { id: true } });
  if (stages.length !== stageIds.length) throw new BadRequestException({ code: 'CAMPAIGN_STAGE_REFERENCE_INVALID' });
  const artKeys = [...new Set([body.chapter?.backgroundArtKey, ...body.nodes.map((item: any) => item.iconArtKey)].filter(Boolean))];
  const art = await db.contentArtResource.findMany({ where: { art_key: { in: artKeys }, enabled: true } });
  if (art.length !== artKeys.length || art.some((item: any) => ['missing', 'invalid'].includes(item.resource_status))) throw new BadRequestException({ code: 'CAMPAIGN_ART_REFERENCE_INVALID' });
}

function campaignRow(body: any, creating = false) {
  return { id: creating ? body.id : undefined, name: body.name, subtitle: body.subtitle ?? '', description: body.description ?? '',
    cover_art_key: body.coverArtKey, default_chapter_id: body.defaultChapterId, sort_order: body.order ?? 0,
    enabled: body.enabled ?? true, schema_version: body.schemaVersion ?? 1, content_version: body.contentVersion ?? 1,
    row_version: creating ? 1 : undefined, deleted_at: null };
}
function campaignModel(row: any) {
  return { id: row.id, name: row.name, subtitle: row.subtitle ?? '', description: row.description ?? '',
    coverArtKey: row.cover_art_key ?? undefined, defaultChapterId: row.default_chapter_id ?? '',
    order: row.sort_order, enabled: row.enabled, schemaVersion: row.schema_version,
    contentVersion: row.content_version };
}
function chapterRow(body: any, creating = false) {
  return { id: creating ? body.id : undefined, campaign_id: body.campaignId, chapter_no: body.chapterNo ?? 1,
    name: body.name, subtitle: body.subtitle ?? '', description: body.description ?? '', background_art_key: body.backgroundArtKey,
    canvas_width: body.canvasWidth ?? 1000, canvas_height: body.canvasHeight ?? 600,
    viewport_x: body.viewportX ?? 0, viewport_y: body.viewportY ?? 0, enabled: body.enabled ?? true,
    completion_text: body.completionText ?? '', completion_reward_ref: body.completionRewardRef,
    row_version: creating ? 1 : undefined, deleted_at: null };
}
function nodeRow(chapterId: string, item: any) {
  return { id: item.id, chapter_id: chapterId, stage_id: item.stageId, name: item.name, x: item.x, y: item.y,
    node_type: item.type, icon_art_key: item.iconArtKey, is_start: item.isStart ?? false, is_end: item.isEnd ?? false,
    sort_order: item.order ?? 0, recommended_power: item.recommendedPower ?? 0, description: item.description,
    enabled: item.enabled ?? true };
}
function connectionRow(chapterId: string, item: any) {
  return { id: item.id, chapter_id: chapterId, from_node_id: item.fromNodeId, to_node_id: item.toNodeId,
    path_type: item.pathType ?? 'normal', one_way: item.oneWay ?? true, sort_order: item.order ?? 0,
    enabled: item.enabled ?? true };
}
function chapterModel(row: any) {
  return { id: row.id, campaignId: row.campaign_id, chapterNo: row.chapter_no, name: row.name, subtitle: row.subtitle ?? '',
    description: row.description ?? '', backgroundArtKey: row.background_art_key, canvasWidth: row.canvas_width,
    canvasHeight: row.canvas_height, viewportX: row.viewport_x, viewportY: row.viewport_y, enabled: row.enabled,
    completionText: row.completion_text ?? '', completionRewardRef: row.completion_reward_ref ?? undefined };
}
function nodeModel(row: any) { return { id: row.id, chapterId: row.chapter_id, stageId: row.stage_id, name: row.name,
  x: row.x, y: row.y, type: row.node_type, iconArtKey: row.icon_art_key ?? undefined, isStart: row.is_start,
  isEnd: row.is_end, order: row.sort_order, recommendedPower: row.recommended_power,
  description: row.description ?? undefined, enabled: row.enabled }; }
function connectionModel(row: any) { return { id: row.id, chapterId: row.chapter_id, fromNodeId: row.from_node_id,
  toNodeId: row.to_node_id, pathType: row.path_type, oneWay: row.one_way, order: row.sort_order, enabled: row.enabled }; }
async function markDraft(db: any, entityType: string, entityId: string, action: string, after: any) {
  await db.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
  await db.contentChangeLog.create({ data: { entity_type: entityType, entity_id: entityId, action_type: action, after_json: after } });
}

export function campaignChecksum(value: any): string {
  return crypto.createHash('sha256').update(stable(value.checksum == null ? value : { ...value, checksum: '' })).digest('hex');
}
function stable(value: any): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
