import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { projectRoot, resolveSafeProjectPath } from '../../common/utils/safe-path';
import { readImageMetadata } from '../../common/utils/image-metadata';
import { containsTransparentPixel } from '../image-library/image-library.image';

type UploadFile = { originalname: string; mimetype: string; size: number; buffer: Buffer };

@Injectable()
export class ArtResourcesService {
  private readonly displayVersionCache = new Map<string, { expiresAt: number; summary: any; version: any }>();

  constructor(private readonly prisma: PrismaService) {}

  async list(query: any = {}) {
    const page = boundedInt(query.page, 1, 1, 100000);
    const pageSize = boundedInt(query.pageSize, 24, 1, 96);
    const typeFilter = query.category ? categoryTypes(query.category) : query.type ? [query.type] : undefined;
    const where = {
        enabled: query.enabled == null ? undefined : query.enabled === 'true',
        resource_type: typeFilter ? { in: typeFilter } : undefined,
        pack_name: query.packName,
        art_key: query.keyword ? { contains: query.keyword } : undefined,
        resource_status: query.status ? query.status : undefined,
        deleted_at: null,
    };
    const [rows, total, grouped] = await Promise.all([
      this.prisma.contentArtResource.findMany({
      where,
      include: { currentDraftVersion: true, publishedVersion: true },
      orderBy: { art_key: 'asc' },
      skip: (page - 1) * pageSize, take: pageSize,
    } as any),
      this.prisma.contentArtResource.count({ where } as any),
      (this.prisma.contentArtResource as any).groupBy?.({ by: ['resource_type'], where: { ...where, resource_type: undefined }, _count: { _all: true } }) ?? [],
    ]);
    const categoryCounts = emptyCategoryCounts();
    for (const row of grouped as any[]) categoryCounts[categoryForType(row.resource_type)] += row._count._all;
    return { items: rows.map(row => this.cacheDisplayVersion(row.art_key, this.withDisplaySummary(row))), page, pageSize, total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)), filters: { keyword: query.keyword ?? '', category: query.category ?? '全部' }, categoryCounts };
  }

  async get(artKey: string) {
    const cached = this.displayVersionCache.get(artKey);
    if (cached && cached.expiresAt > Date.now()) return cached.summary;
    this.displayVersionCache.delete(artKey);
    const row = await this.prisma.contentArtResource.findUnique({
      where: { art_key: artKey },
      include: { currentDraftVersion: true, publishedVersion: true },
    } as any);
    if (!row) throw new NotFoundException(artKey);
    return this.cacheDisplayVersion(artKey, this.withDisplaySummary(row));
  }

  async references(artKey: string) {
    const [enemies, backgrounds, heroes, snapshots, animationFrames, stageLayers, rewardDefinitions,
      campaigns, campaignChapters, campaignNodes, tutorialSteps] = await Promise.all([
      this.prisma.contentEnemyTemplate.findMany({ where: { deleted_at: null } }),
      this.prisma.contentBackgroundTheme.findMany({ where: { deleted_at: null } }),
      this.prisma.contentHeroVisual.findMany({ where: { deleted_at: null } }),
      this.prisma.contentReleaseSnapshot.findMany(),
      (this.prisma as any).contentAnimationFrame.findMany({ where: { art_key: artKey }, include: { clip: true } }),
      (this.prisma as any).contentStageLayer?.findMany ? (this.prisma as any).contentStageLayer.findMany({ where: { art_key: artKey } }) : Promise.resolve([]),
      (this.prisma as any).contentRewardDefinition?.findMany ? (this.prisma as any).contentRewardDefinition.findMany({ where: { icon_art_key: artKey } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaign?.findMany ? (this.prisma as any).contentCampaign.findMany({ where: { cover_art_key: artKey, deleted_at: null } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaignChapter?.findMany ? (this.prisma as any).contentCampaignChapter.findMany({ where: { background_art_key: artKey, deleted_at: null } }) : Promise.resolve([]),
      (this.prisma as any).contentCampaignStageNode?.findMany ? (this.prisma as any).contentCampaignStageNode.findMany({ where: { icon_art_key: artKey } }) : Promise.resolve([]),
      (this.prisma as any).contentTutorialStep?.findMany ? (this.prisma as any).contentTutorialStep.findMany({
        where: { deleted_at: null, OR: [{ avatar_art_key: artKey }, { target_type: 'art', target_id: artKey }] },
      }) : Promise.resolve([]),
    ]);
    const refs: any[] = [];
    for (const row of enemies as any[]) if (containsArtKey(row.visual_json, artKey)) refs.push(ref('enemy', row.id, row.name, 'visual_json'));
    for (const row of backgrounds as any[]) if (containsArtKey(row.art_json, artKey)) refs.push(ref('background', row.id, row.name, 'art_json'));
    for (const row of heroes as any[]) {
      if (containsArtKey(row.visual_json, artKey)) refs.push(ref('hero', row.id, row.name, 'visual_json'));
      if (containsArtKey(row.skills_json, artKey)) refs.push(ref('hero', row.id, row.name, 'skills_json'));
    }
    for (const row of snapshots as any[]) {
      if (containsArtKey(row.snapshot_json, artKey)) refs.push(ref('release-snapshot', row.id, row.release_id, 'snapshot_json'));
    }
    for (const row of animationFrames as any[]) refs.push(ref('animation-frame', row.clip?.clip_key ?? row.clip_id, row.clip?.name ?? row.clip_id, `frame:${row.sort_order}`));
    for (const row of stageLayers as any[]) refs.push(ref('stage-layer', row.layer_key, row.name, `stage:${row.stage_id}`));
    for (const row of rewardDefinitions as any[]) refs.push(ref('reward-definition', `${row.reward_type}:${row.reward_ref_id}`, row.name, 'icon_art_key'));
    for (const row of campaigns as any[]) refs.push(ref('campaign', row.id, row.name, 'cover_art_key'));
    for (const row of campaignChapters as any[]) refs.push(ref('campaign-chapter', row.id, row.name, 'background_art_key'));
    for (const row of campaignNodes as any[]) refs.push(ref('campaign-node', row.id, row.name, 'icon_art_key'));
    for (const row of tutorialSteps as any[]) refs.push(ref('tutorial-step', row.id, row.title,
      row.target_type === 'art' && row.target_id === artKey ? 'target_id' : 'avatar_art_key'));
    const items = refs.map(item => ({ ...item, typeLabel: referenceTypeLabel(item.type), status: '有效', statusCode: 'active' }));
    const summary = Object.entries(items.reduce((result: Record<string, number>, item: any) => {
      result[item.typeLabel] = (result[item.typeLabel] ?? 0) + 1; return result;
    }, {})).map(([label, count]) => ({ label, count }));
    return { total: items.length, summary, items };
  }

  async uploadVersion(artKey: string, file: UploadFile, createdBy?: string) {
    const resource = await this.prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    if (!resource) throw new NotFoundException(artKey);
    if (!file?.buffer?.length) throw new BadRequestException('请选择要上传的图片文件。');

    const maxBytes = Number(process.env.ART_MAX_UPLOAD_MB ?? 12) * 1024 * 1024;
    if (file.size > maxBytes || file.buffer.length > maxBytes) throw new BadRequestException('图片超过大小限制。');

    const check = await this.inspect(file.buffer, resource as any, file.originalname, file.mimetype);
    const duplicate = await this.prisma.contentArtResourceVersion.findFirst({
      where: { art_key: artKey, checksum: check.checksum },
    } as any);
    if (duplicate) throw new ConflictException(`该图片与资源版本 v${duplicate.version_no} 完全相同，无需重复上传。`);

    const sameChecksum = await this.prisma.contentArtResourceVersion.findMany({
      where: { checksum: check.checksum, art_key: { not: artKey } },
      select: { art_key: true, version_no: true },
    } as any);
    const versionNo = (await this.prisma.contentArtResourceVersion.count({ where: { art_key: artKey } })) + 1;
    const versionId = makeVersionId(artKey, versionNo);
    const storagePath = uploadPath(artKey, versionId, check.extension);
    const thumbnailPath = thumbnailPathFor(versionId);

    fs.mkdirSync(path.dirname(resolveSafeProjectPath(storagePath)), { recursive: true });
    fs.writeFileSync(resolveSafeProjectPath(storagePath), file.buffer);
    fs.mkdirSync(path.dirname(resolveSafeProjectPath(thumbnailPath)), { recursive: true });
    await sharp(file.buffer).resize({ width: thumbnailSize(), height: thumbnailSize(), fit: 'inside' }).webp().toFile(resolveSafeProjectPath(thumbnailPath));

    const warnings = [...check.warnings, ...sameChecksum.map((x: any) => `该图片与 ${x.art_key} v${x.version_no} checksum 相同。`)];
    const status = warnings.length ? 'warning' : 'valid';
    const version = await this.prisma.$transaction(async tx => {
      const created = await tx.contentArtResourceVersion.create({ data: {
        id: versionId, art_key: artKey, version_no: versionNo, original_filename: sanitizeName(file.originalname),
        stored_filename: `original${check.extension}`, storage_path: storagePath, thumbnail_path: thumbnailPath,
        mime_type: check.mimeType, file_extension: check.extension, size_bytes: file.buffer.length,
        actual_width: check.width, actual_height: check.height, has_alpha: check.hasAlpha, checksum: check.checksum,
        validation_status: status, validation_errors_json: [], validation_warnings_json: warnings, created_by: createdBy,
      } as any });
      await tx.contentArtResource.update({ where: { art_key: artKey }, data: {
        current_draft_version_id: created.id,
        resource_status: 'physical',
        physical_path: storagePath,
        width: check.width,
        height: check.height,
        transparent: check.hasAlpha,
        checksum: check.checksum,
        row_version: { increment: 1 },
      } as any });
      await tx.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
      await tx.contentChangeLog.create({ data: { entity_type: 'art-resource', entity_id: artKey, action_type: 'upload-art-version', after_json: created as any, operator_id: createdBy } });
      return created;
    });
    return toVersionDto(version);
  }

  async createVersionFromLibrary(artKey: string, dto: any, createdBy?: string) {
    const resource = await this.prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    if (!resource) throw new NotFoundException(artKey);
    const db: any = this.prisma; const variantId = dto.imageLibraryVariantId ? String(dto.imageLibraryVariantId) : undefined;
    const assetId = String(dto.imageLibraryAssetId ?? '');
    const source = variantId ? await db.contentImageLibraryVariant.findUnique({ where: { id: variantId } }) : await db.contentImageLibraryAsset.findUnique({ where: { id: assetId } });
    if (!source || (variantId ? source.source_asset_id !== assetId : false)) throw new BadRequestException('图库图片或派生版本不存在。');
    const buffer = fs.readFileSync(resolveSafeProjectPath(source.storage_path));
    const check = await this.inspect(buffer, resource, source.original_filename ?? source.variant_name, source.mime_type);
    const versionNo = (await this.prisma.contentArtResourceVersion.count({ where: { art_key: artKey } })) + 1;
    const created = await this.prisma.$transaction(async tx => {
      const version = await tx.contentArtResourceVersion.create({ data: { id: makeVersionId(artKey, versionNo), art_key: artKey, version_no: versionNo,
        original_filename: source.original_filename ?? source.variant_name, stored_filename: path.basename(source.storage_path), storage_path: source.storage_path,
        thumbnail_path: source.thumbnail_path, mime_type: check.mimeType, file_extension: check.extension, size_bytes: buffer.length,
        actual_width: check.width, actual_height: check.height, has_alpha: check.hasAlpha, checksum: check.checksum, validation_status: check.warnings.length ? 'warning' : 'valid',
        validation_errors_json: [], validation_warnings_json: check.warnings, image_library_asset_id: assetId, image_library_variant_id: variantId ?? null,
        image_source_mode: variantId ? 'library-variant' : 'library-original', created_by: createdBy } as any });
      await tx.contentArtResource.update({ where: { art_key: artKey }, data: { current_draft_version_id: version.id, resource_status: 'physical', physical_path: source.storage_path, width: check.width, height: check.height, transparent: check.hasAlpha, checksum: check.checksum, row_version: { increment: 1 } } as any });
      return version;
    });
    await this.markDirty('create-art-version-from-library', artKey, created, createdBy); return toVersionDto(created);
  }

  async createResource(dto: any, createdBy?: string) {
    validateArtKey(dto.artKey);
    const exists = await this.prisma.contentArtResource.findUnique({ where: { art_key: dto.artKey } });
    if (exists) throw new ConflictException('Art Key 已存在。');
    if (dto.fallbackArtKey) await this.assertFallback(dto.artKey, dto.fallbackArtKey);
    const created = await this.prisma.contentArtResource.create({ data: {
      art_key: dto.artKey,
      resource_type: dto.resourceType,
      pack_name: dto.packName ?? null,
      physical_path: null,
      fallback_art_key: dto.fallbackArtKey ?? 'placeholder.image',
      resource_status: 'missing',
      width: dto.expectedWidth ?? null,
      height: dto.expectedHeight ?? null,
      transparent: Boolean(dto.requiredAlpha ?? true),
      expected_width: dto.expectedWidth ?? null,
      expected_height: dto.expectedHeight ?? null,
      dimension_policy: dto.dimensionPolicy ?? 'recommended',
      required_alpha: Boolean(dto.requiredAlpha ?? true),
      enabled: dto.enabled ?? true,
    } as any });
    await this.markDirty('create-art-key', dto.artKey, created, createdBy);
    return created;
  }

  async createResourceWithVersion(dto: any, file: UploadFile, createdBy?: string) {
    const data = normalizeResourceDto(dto);
    validateArtKey(data.artKey);
    if (!file?.buffer?.length) throw new BadRequestException('请选择要上传的图片文件。');
    const exists = await this.prisma.contentArtResource.findUnique({ where: { art_key: data.artKey } });
    if (exists) throw new ConflictException('Art Key 已存在。');
    if (data.fallbackArtKey) await this.assertFallback(data.artKey, data.fallbackArtKey);

    const resourceForCheck = resourceFromDto(data);
    const check = await this.inspect(file.buffer, resourceForCheck, file.originalname, file.mimetype);
    const sameChecksum = await this.prisma.contentArtResourceVersion.findMany({
      where: { checksum: check.checksum },
      select: { art_key: true, version_no: true },
    } as any);
    const versionNo = 1;
    const versionId = makeVersionId(data.artKey, versionNo);
    const storagePath = uploadPath(data.artKey, versionId, check.extension);
    const thumbnailPath = thumbnailPathFor(versionId);
    const writtenPaths: string[] = [];

    try {
      fs.mkdirSync(path.dirname(resolveSafeProjectPath(storagePath)), { recursive: true });
      fs.writeFileSync(resolveSafeProjectPath(storagePath), file.buffer);
      writtenPaths.push(storagePath);
      fs.mkdirSync(path.dirname(resolveSafeProjectPath(thumbnailPath)), { recursive: true });
      await sharp(file.buffer).resize({ width: thumbnailSize(), height: thumbnailSize(), fit: 'inside' }).webp().toFile(resolveSafeProjectPath(thumbnailPath));
      writtenPaths.push(thumbnailPath);

      const warnings = [...check.warnings, ...sameChecksum.map((x: any) => `该图片与 ${x.art_key} v${x.version_no} checksum 相同。`)];
      const status = warnings.length ? 'warning' : 'valid';
      const result = await this.prisma.$transaction(async tx => {
        const resource = await tx.contentArtResource.create({ data: {
          art_key: data.artKey,
          resource_type: data.resourceType,
          pack_name: data.packName ?? null,
          physical_path: storagePath,
          fallback_art_key: data.fallbackArtKey ?? 'placeholder.image',
          resource_status: 'physical',
          width: check.width,
          height: check.height,
          transparent: check.hasAlpha,
          expected_width: data.expectedWidth ?? null,
          expected_height: data.expectedHeight ?? null,
          dimension_policy: data.dimensionPolicy ?? 'recommended',
          required_alpha: data.requiredAlpha,
          enabled: data.enabled,
          checksum: check.checksum,
        } as any });
        const version = await tx.contentArtResourceVersion.create({ data: {
          id: versionId, art_key: data.artKey, version_no: versionNo, original_filename: sanitizeName(file.originalname),
          stored_filename: `original${check.extension}`, storage_path: storagePath, thumbnail_path: thumbnailPath,
          mime_type: check.mimeType, file_extension: check.extension, size_bytes: file.buffer.length,
          actual_width: check.width, actual_height: check.height, has_alpha: check.hasAlpha, checksum: check.checksum,
          validation_status: status, validation_errors_json: [], validation_warnings_json: warnings, created_by: createdBy,
        } as any });
        await tx.contentArtResource.update({ where: { art_key: data.artKey }, data: { current_draft_version_id: version.id, row_version: { increment: 1 } } as any });
        await tx.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
        await tx.contentChangeLog.create({ data: { entity_type: 'art-resource', entity_id: data.artKey, action_type: 'create-art-key-with-version', after_json: { resource, version } as any, operator_id: createdBy } });
        return { resource, version };
      });
      return { artKey: data.artKey, resource: result.resource, draftVersion: toVersionDto(result.version) };
    } catch (error) {
      for (const item of writtenPaths) fs.rmSync(resolveSafeProjectPath(item), { force: true });
      throw error;
    }
  }

  async updateResource(artKey: string, dto: any, operatorId?: string) {
    const before = await this.prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    if (!before) throw new NotFoundException(artKey);
    if (dto.fallbackArtKey) await this.assertFallback(artKey, dto.fallbackArtKey);
    const updated = await this.prisma.contentArtResource.update({ where: { art_key: artKey }, data: {
      resource_type: dto.resourceType,
      pack_name: dto.packName,
      fallback_art_key: dto.fallbackArtKey,
      expected_width: dto.expectedWidth,
      expected_height: dto.expectedHeight,
      dimension_policy: dto.dimensionPolicy,
      required_alpha: dto.requiredAlpha,
      enabled: dto.enabled,
      row_version: { increment: 1 },
    } as any });
    await this.markDirty('update-art-metadata', artKey, { before, updated }, operatorId);
    return updated;
  }

  versions(artKey: string) {
    return this.prisma.contentArtResourceVersion.findMany({ where: { art_key: artKey }, orderBy: { version_no: 'desc' } } as any);
  }

  async selectDraft(artKey: string, versionId: string, operatorId?: string) {
    const version = await this.prisma.contentArtResourceVersion.findUnique({ where: { id: versionId } } as any);
    if (!version || version.art_key !== artKey) throw new NotFoundException(versionId);
    if (version.validation_status === 'invalid') throw new ConflictException('invalid 资源版本不能设为草稿。');
    const updated = await this.prisma.contentArtResource.update({ where: { art_key: artKey }, data: { current_draft_version_id: versionId, row_version: { increment: 1 } } as any });
    await this.markDirty('select-draft-art-version', artKey, { versionId }, operatorId);
    return updated;
  }

  async removeDraftVersion(artKey: string, versionId: string, operatorId?: string) {
    const resource = await this.prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    const version = await this.prisma.contentArtResourceVersion.findUnique({ where: { id: versionId } } as any);
    if (!resource || !version || version.art_key !== artKey) throw new NotFoundException(versionId);
    if ((resource as any).published_version_id === versionId || version.validation_status === 'published') throw new ConflictException('已发布版本不可删除。');
    if ((resource as any).current_draft_version_id === versionId) {
      await this.prisma.contentArtResource.update({ where: { art_key: artKey }, data: { current_draft_version_id: null, row_version: { increment: 1 } } as any });
    }
    await this.prisma.contentArtResourceVersion.delete({ where: { id: versionId } } as any);
    if (!(version as any).image_library_asset_id) {
      for (const item of [version.storage_path, version.thumbnail_path].filter((value): value is string => Boolean(value))) {
        fs.rmSync(resolveSafeProjectPath(item), { force: true });
      }
    }
    await this.markDirty('delete-draft-art-version', artKey, { versionId }, operatorId);
    return { ok: true };
  }

  async fileForVersion(artKey: string, versionId: string, kind: 'preview' | 'thumbnail') {
    const version = await this.prisma.contentArtResourceVersion.findUnique({ where: { id: versionId } } as any);
    if (!version || version.art_key !== artKey) throw new NotFoundException(versionId);
    return this.fileForStoredVersion(version, kind, versionId);
  }

  private async fileForStoredVersion(version: any, kind: 'preview' | 'thumbnail', notFoundId: string) {
    let thumbnailPath = kind === 'thumbnail' ? version.thumbnail_path : null;
    if (thumbnailPath && !fs.existsSync(resolveSafeProjectPath(thumbnailPath))) {
      if (!version.storage_path || !fs.existsSync(resolveSafeProjectPath(version.storage_path))) throw new NotFoundException(notFoundId);
      fs.mkdirSync(path.dirname(resolveSafeProjectPath(thumbnailPath)), { recursive: true });
      await sharp(resolveSafeProjectPath(version.storage_path)).resize({ width: thumbnailSize(), height: thumbnailSize(), fit: 'inside' }).webp().toFile(resolveSafeProjectPath(thumbnailPath));
    }
    const target = thumbnailPath ?? version.storage_path;
    if (!target || !fs.existsSync(resolveSafeProjectPath(target))) throw new NotFoundException(notFoundId);
    const mime = thumbnailPath ? 'image/webp' : version.mime_type;
    return { path: resolveSafeProjectPath(target), mime };
  }

  async fileForArtKey(artKey: string, kind: 'preview' | 'thumbnail') {
    const cached = this.displayVersionCache.get(artKey);
    if (cached && cached.expiresAt > Date.now()) return this.fileForStoredVersion(cached.version, kind, artKey);
    this.displayVersionCache.delete(artKey);
    const row = await this.prisma.contentArtResource.findUnique({
      where: { art_key: artKey },
      include: { currentDraftVersion: true, publishedVersion: true },
    } as any);
    if (!row) throw new NotFoundException(artKey);
    const summary = this.withDisplaySummary(row);
    const version = summary.displayVersion;
    if (summary.source.startsWith('mysql-') && version?.id) return this.fileForVersion(artKey, version.id, kind);
    const sourcePath = version?.storage_path;
    if (!sourcePath) throw new NotFoundException(artKey);
    return { path: resolveSafeProjectPath(sourcePath), mime: mimeFromPath(sourcePath) };
  }

  private cacheDisplayVersion(artKey: string, summary: any) {
    if (summary.displayVersion?.storage_path) this.displayVersionCache.set(artKey, { summary, version: summary.displayVersion, expiresAt: Date.now() + 30000 });
    return summary;
  }

  private withDisplaySummary(row: any) {
    const summary: any = resolveDisplaySummary(row);
    const hasFilePreview = summary.status !== 'virtual' && summary.source !== 'virtual';
    return {
      ...row,
      currentDraftVersion: row.currentDraftVersion ?? null,
      publishedVersion: summary.publishedVersion ?? row.publishedVersion ?? null,
      displayVersion: summary.displayVersion,
      displayName: row.display_name ?? row.name ?? row.art_key,
      resourceType: row.resource_type,
      resourcePack: row.pack_name,
      status: summary.status,
      source: summary.source,
      draftVersion: row.currentDraftVersion ?? null,
      thumbnailUrl: hasFilePreview ? resourceUrl(row.art_key, 'thumbnail') : null,
      originalUrl: hasFilePreview ? resourceUrl(row.art_key, 'preview') : null,
      width: summary.width,
      height: summary.height,
      mimeType: summary.mimeType,
      hasAlpha: summary.hasAlpha,
      checksum: summary.checksum,
      draftVersionStatus: summary.draftVersionStatus,
      draftWarning: summary.draftWarning,
      fallbackReason: summary.fallbackReason,
      hasUnpublishedChange: Boolean(row.current_draft_version_id && row.current_draft_version_id !== row.published_version_id),
    };
  }

  private async inspect(buffer: Buffer, resource: any, originalName: string, clientMime: string) {
    const signature = fileSignature(buffer);
    if (!signature) throw new BadRequestException('不支持或伪造的图片格式。');
    const type = String(resource.resource_type ?? '');
    if (signature.extension === '.jpg' && !['background', 'map'].includes(type)) throw new BadRequestException('该资源类型只允许上传 PNG。');
    if (clientMime && !clientMime.includes(signature.kind)) throw new BadRequestException('MIME 类型与真实图片格式不一致。');
    const maxPixels = Number(process.env.ART_MAX_PIXEL_COUNT ?? 16777216);
    const meta = await sharp(buffer, { limitInputPixels: maxPixels }).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (!width || !height || width * height > maxPixels) throw new BadRequestException('图片尺寸超过安全限制。');
    const hasAlpha = Boolean(meta.hasAlpha) && await containsTransparentPixel(buffer);
    const errors = validationErrors(resource, width, height, hasAlpha);
    if (errors.length) throw new BadRequestException({ code: 'ART_IMAGE_INVALID', errors });
    return {
      width, height, hasAlpha, warnings: validationWarnings(resource, width, height, hasAlpha),
      checksum: crypto.createHash('sha256').update(buffer).digest('hex'),
      extension: signature.extension, mimeType: signature.mime,
      originalName: sanitizeName(originalName),
    };
  }

  private async assertFallback(artKey: string, fallbackArtKey: string) {
    if (fallbackArtKey === artKey) throw new ConflictException('fallback 不能指向自身。');
    const fallback = await this.prisma.contentArtResource.findUnique({ where: { art_key: fallbackArtKey } });
    if (!fallback || (fallback as any).resource_status === 'missing') throw new ConflictException('fallback Art Key 不存在或不可用。');
  }

  private async markDirty(action: string, artKey: string, after: any, operatorId?: string) {
    this.displayVersionCache.delete(artKey);
    await this.prisma.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
    await this.prisma.contentChangeLog.create({ data: { entity_type: 'art-resource', entity_id: artKey, action_type: action, after_json: after, operator_id: operatorId } });
  }
}

function fileSignature(buffer: Buffer) {
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.subarray(0, 8).equals(png)) return { kind: 'png', extension: '.png', mime: 'image/png' };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { kind: 'jpeg', extension: '.jpg', mime: 'image/jpeg' };
  return null;
}

function resolveDisplaySummary(row: any) {
  const draft = row.currentDraftVersion;
  let draftFailure: any;
  const rejected: any[] = [];
  if (draft) {
    const summary = versionSummary(row, draft, 'mysql-draft-version');
    if (summary.status === 'physical') return summary;
    draftFailure = summary;
    rejected.push(summary);
  }
  const published = row.publishedVersion;
  if (published) {
    const summary = versionSummary(row, published, 'mysql-published-version');
    if (summary.status === 'physical') return publishedFallbackSummary(summary, draftFailure);
    rejected.push(summary);
  }

  const snapshot = loadPublishedSnapshot()[row.art_key];
  if (snapshot) {
    const summary = assetSummary(row, snapshotPathToVersion(row.art_key, snapshot), 'published-art-snapshot');
    if (summary.status === 'physical') return publishedFallbackSummary(summary, draftFailure);
    rejected.push(summary);
  }

  const base = loadBaseManifest()[row.art_key];
  if (base?.virtual) return assetSummary(row, manifestPathToVersion(row.art_key, base), 'virtual', 'virtual');
  if (base) {
    const summary = assetSummary(row, manifestPathToVersion(row.art_key, base), 'base-art-manifest');
    if (summary.status === 'physical') return summary;
    rejected.push(summary);
  }

  if (rejected.length) return rejected[0];

  return {
    status: row.resource_status === 'virtual' ? 'virtual' : 'missing',
    source: row.resource_status === 'virtual' ? 'virtual' : 'missing',
    displayVersion: null,
    width: row.expected_width ?? row.width ?? null,
    height: row.expected_height ?? row.height ?? null,
    mimeType: null,
    hasAlpha: row.required_alpha ?? row.transparent ?? null,
    checksum: row.checksum ?? null,
  };
}

function publishedFallbackSummary(summary: any, draftFailure?: any) {
  if (!draftFailure) return summary;
  const draftVersionStatus = draftFailure.status === 'missing' ? 'Missing' : 'Invalid';
  return { ...summary, draftVersionStatus,
    draftWarning: `草稿版本 ${draftVersionStatus}，当前展示发布版本`,
    fallbackReason: `draft-version-${draftFailure.status}` };
}

function versionSummary(row: any, version: any, source: string) {
  const file = fileCheck(version.storage_path, version.checksum);
  const status = version.validation_status === 'invalid' || file.status === 'invalid'
    ? 'invalid'
    : file.status === 'missing' ? 'missing' : 'physical';
  return {
    status,
    source,
    displayVersion: version,
    width: version.actual_width ?? row.expected_width ?? row.width ?? null,
    height: version.actual_height ?? row.expected_height ?? row.height ?? null,
    mimeType: version.mime_type ?? mimeFromPath(version.storage_path),
    hasAlpha: version.has_alpha ?? row.required_alpha ?? row.transparent ?? null,
    checksum: version.checksum ?? row.checksum ?? null,
  };
}

function assetSummary(row: any, version: any, source: string, forcedStatus?: string) {
  const invalid = version.validation_status === 'invalid';
  const file = forcedStatus === 'virtual' ? { status: 'virtual' }
    : invalid ? { status: 'invalid' } : fileCheck(version.storage_path, version.checksum);
  return {
    status: forcedStatus ?? (invalid ? 'invalid' : file.status === 'ok' ? 'physical' : file.status),
    source,
    displayVersion: version,
    publishedVersion: source === 'published-art-snapshot' ? version : row.publishedVersion,
    width: version.actual_width ?? row.expected_width ?? row.width ?? null,
    height: version.actual_height ?? row.expected_height ?? row.height ?? null,
    mimeType: version.mime_type ?? mimeFromPath(version.storage_path),
    hasAlpha: version.has_alpha ?? row.required_alpha ?? row.transparent ?? null,
    checksum: version.checksum ?? row.checksum ?? null,
    fallbackReason: version.inspection_reason,
  };
}

function snapshotPathToVersion(artKey: string, entry: any) {
  return {
    id: entry.versionId ?? `snapshot:${artKey}`,
    art_key: artKey,
    version_no: entry.versionNo ?? null,
    storage_path: entry.path,
    thumbnail_path: null,
    mime_type: mimeFromPath(entry.path),
    actual_width: entry.width ?? null,
    actual_height: entry.height ?? null,
    has_alpha: entry.hasAlpha ?? null,
    checksum: entry.checksum ?? null,
    validation_status: 'published',
  };
}

function manifestPathToVersion(artKey: string, entry: any) {
  const inspected = inspectManifestFile(entry);
  return {
    id: `manifest:${artKey}`,
    art_key: artKey,
    version_no: null,
    storage_path: entry.path,
    thumbnail_path: null,
    mime_type: inspected.ok ? inspected.mimeType : mimeFromPath(entry.path),
    actual_width: inspected.ok ? inspected.width : entry.width ?? null,
    actual_height: inspected.ok ? inspected.height : entry.height ?? null,
    has_alpha: inspected.ok ? inspected.hasAlpha : entry.transparent ?? null,
    checksum: inspected.ok ? inspected.checksum : null,
    validation_status: entry.virtual ? 'virtual' : inspected.ok ? 'valid' : 'invalid',
    inspection_reason: inspected.ok ? undefined : inspected.reason,
  };
}

function inspectManifestFile(entry: any) {
  if (!entry.path) return { ok: false as const, reason: 'path-missing' };
  let fullPath: string;
  try {
    fullPath = resolveSafeProjectPath(entry.path);
  } catch (error) { return { ok: false as const, reason: `unsafe-path:${errorMessage(error)}` }; }
  if (!fs.existsSync(fullPath)) return { ok: false as const, reason: 'file-missing' };
  let metadata;
  try { metadata = readImageMetadata(fullPath); }
  catch (error) { return { ok: false as const, reason: `read-failed:${errorMessage(error)}` }; }
  if (!metadata) return { ok: false as const, reason: 'metadata-invalid' };
  if ((entry.width && entry.width !== metadata.width) || (entry.height && entry.height !== metadata.height)) {
    return { ok: false as const, reason: 'dimension-mismatch' };
  }
  if (typeof entry.transparent === 'boolean' && entry.transparent !== metadata.hasAlpha) {
    return { ok: false as const, reason: 'alpha-mismatch' };
  }
  try { return { ok: true as const, ...metadata, checksum: sha256File(fullPath) }; }
  catch (error) { return { ok: false as const, reason: `read-failed:${errorMessage(error)}` }; }
}

function errorMessage(error: unknown) { return error instanceof Error ? error.message : String(error); }

function fileCheck(relativePath?: string | null, checksum?: string | null) {
  if (!relativePath) return { status: 'missing' };
  const fullPath = resolveSafeProjectPath(relativePath);
  if (!fs.existsSync(fullPath)) return { status: 'missing' };
  if (!checksum || sha256File(fullPath) !== checksum) return { status: 'invalid' };
  return { status: 'ok' };
}

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function resourceUrl(artKey: string, kind: 'preview' | 'thumbnail'): string {
  return `/content/resources/${encodeURIComponent(artKey)}/${kind}`;
}

function mimeFromPath(value?: string | null): string {
  const ext = path.extname(value ?? '').toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  return 'application/octet-stream';
}

function loadPublishedSnapshot(): Record<string, any> {
  const snapshotPath = resolveSafeProjectPath('content-store/published/art-manifest.snapshot.json');
  if (!fs.existsSync(snapshotPath)) return {};
  const parsed = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  return parsed.resources ?? {};
}

function loadBaseManifest(): Record<string, any> {
  const compiledPath = path.join(projectRoot(), 'dist/assets/ArtManifest.js');
  if (fs.existsSync(compiledPath)) {
    delete require.cache[compiledPath];
    return require(compiledPath).ART_MANIFEST ?? {};
  }
  const sourcePath = resolveSafeProjectPath('src/assets/ArtManifest.ts');
  if (!fs.existsSync(sourcePath)) return {};
  return parseManifestSource(fs.readFileSync(sourcePath, 'utf8'));
}

function parseManifestSource(source: string): Record<string, any> {
  const result: Record<string, any> = {};
  const entryPattern = /'([^']+)'\s*:\s*\{([^}]+)\}/g;
  for (const match of source.matchAll(entryPattern)) {
    result[match[1]] = {
      path: stringProp(match[2], 'path'),
      type: stringProp(match[2], 'type'),
      pack: stringProp(match[2], 'pack'),
      fallback: stringProp(match[2], 'fallback'),
      virtual: /virtual\s*:\s*true/.test(match[2]),
      width: numberProp(match[2], 'width'),
      height: numberProp(match[2], 'height'),
      transparent: /transparent\s*:\s*true/.test(match[2]),
    };
  }
  return result;
}

function stringProp(source: string, name: string): string | undefined {
  return source.match(new RegExp(`${name}\\s*:\\s*'([^']+)'`))?.[1];
}

function numberProp(source: string, name: string): number | undefined {
  const value = source.match(new RegExp(`${name}\\s*:\\s*(\\d+)`))?.[1];
  return value ? Number(value) : undefined;
}

function resourceFromDto(dto: any) {
  return {
    resource_type: dto.resourceType,
    expected_width: dto.expectedWidth ?? null,
    expected_height: dto.expectedHeight ?? null,
    dimension_policy: dto.dimensionPolicy ?? 'recommended',
    required_alpha: Boolean(dto.requiredAlpha ?? true),
  };
}

function normalizeResourceDto(dto: any) {
  return {
    artKey: String(dto.artKey ?? ''),
    resourceType: String(dto.resourceType ?? ''),
    packName: dto.packName == null || dto.packName === '' ? null : String(dto.packName),
    expectedWidth: optionalNumber(dto.expectedWidth),
    expectedHeight: optionalNumber(dto.expectedHeight),
    dimensionPolicy: dto.dimensionPolicy ?? 'recommended',
    requiredAlpha: optionalBoolean(dto.requiredAlpha, true),
    fallbackArtKey: dto.fallbackArtKey == null || dto.fallbackArtKey === '' ? undefined : String(dto.fallbackArtKey),
    enabled: optionalBoolean(dto.enabled, true),
  };
}

function optionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new BadRequestException('数字字段格式不合法。');
  return parsed;
}

function optionalBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
}

function validationErrors(resource: any, width: number, height: number, hasAlpha: boolean): string[] {
  const errors: string[] = [];
  if (resource.required_alpha && !hasAlpha) errors.push('该资源要求透明通道。');
  if (resource.dimension_policy === 'exact') {
    if (resource.expected_width && resource.expected_width !== width) errors.push(`宽度必须为 ${resource.expected_width}px。`);
    if (resource.expected_height && resource.expected_height !== height) errors.push(`高度必须为 ${resource.expected_height}px。`);
  }
  return errors;
}

function validationWarnings(resource: any, width: number, height: number, hasAlpha: boolean): string[] {
  const warnings: string[] = [];
  if (!resource.required_alpha && hasAlpha) warnings.push('图片包含透明通道，当前资源类型不强制要求。');
  if (resource.dimension_policy === 'recommended') {
    if (resource.expected_width && resource.expected_width !== width) warnings.push(`建议宽度为 ${resource.expected_width}px，当前为 ${width}px。`);
    if (resource.expected_height && resource.expected_height !== height) warnings.push(`建议高度为 ${resource.expected_height}px，当前为 ${height}px。`);
  }
  return warnings;
}

function makeVersionId(artKey: string, versionNo: number): string {
  return `${safeKey(artKey).slice(0, 18)}_${crypto.randomBytes(4).toString('hex')}_${versionNo}`.slice(0, 36);
}

function uploadPath(artKey: string, versionId: string, extension: string): string {
  return path.posix.join(normalizeEnvPath('ART_UPLOAD_ROOT', 'content-store/art/uploads'), safeKey(artKey), versionId, `original${extension}`);
}

function thumbnailPathFor(versionId: string): string {
  return path.posix.join(normalizeEnvPath('ART_THUMBNAIL_ROOT', 'content-store/art/thumbnails'), `${versionId}.webp`);
}

function normalizeEnvPath(name: string, fallback: string): string {
  const value = String(process.env[name] ?? fallback).replaceAll('\\', '/');
  if (path.isAbsolute(value) || value.split('/').includes('..')) throw new BadRequestException(`${name} 只允许项目内相对路径。`);
  return value.replace(/^\/+/, '');
}

function safeKey(artKey: string): string {
  return artKey.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function thumbnailSize(): number {
  return Math.max(32, Math.min(512, Number(process.env.ART_THUMBNAIL_SIZE ?? 256)));
}

function sanitizeName(name: string): string {
  return path.basename(name).replace(/[^\w.\-\u4e00-\u9fa5]/g, '_').slice(0, 120);
}

function containsArtKey(value: unknown, artKey: string): boolean {
  if (value === artKey) return true;
  if (Array.isArray(value)) return value.some(item => containsArtKey(item, artKey));
  if (value && typeof value === 'object') return Object.values(value).some(item => containsArtKey(item, artKey));
  return false;
}

function ref(type: string, id: string, name: string | null | undefined, field: string) {
  return { type, id, name, field };
}

function referenceTypeLabel(type: string) {
  return ({ enemy: '敌人模板', background: '背景主题', hero: '英雄视觉', 'release-snapshot': '历史发布快照',
    'animation-frame': '动画帧', 'stage-layer': '关卡图层', 'reward-definition': '奖励定义', campaign: '战役',
    'campaign-chapter': '章节', 'campaign-node': '关卡节点', 'tutorial-step': '教程步骤' } as Record<string, string>)[type] ?? type;
}

const ART_CATEGORIES: Record<string, string[]> = {
  '角色与敌人': ['enemy', 'player', 'character'], '场景与地图': ['background', 'map', 'terrain', 'scene'],
  '界面资源': ['ui', 'icon', 'placeholder', 'sprite'], '特效': ['effect'],
  '掉落与道具': ['drop', 'equipment', 'item', 'chest'],
};

function boundedInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value); return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function categoryTypes(category: unknown): string[] | undefined {
  const value = String(category ?? ''); return value === '全部' ? undefined : ART_CATEGORIES[value];
}

function categoryForType(type: string): string {
  return Object.entries(ART_CATEGORIES).find(([, types]) => types.includes(type))?.[0] ?? '其他';
}

function emptyCategoryCounts(): Record<string, number> {
  return Object.fromEntries(['全部', ...Object.keys(ART_CATEGORIES), '其他'].map(key => [key, 0]));
}

function validateArtKey(value: string): void {
  if (!/^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/.test(value)) throw new BadRequestException('Art Key 格式不合法。');
}

function toVersionDto(version: any) {
  return {
    id: version.id,
    artKey: version.art_key,
    versionNo: version.version_no,
    storagePath: version.storage_path,
    thumbnailPath: version.thumbnail_path,
    actualWidth: version.actual_width,
    actualHeight: version.actual_height,
    hasAlpha: version.has_alpha,
    checksum: version.checksum,
    validationStatus: version.validation_status,
    warnings: version.validation_warnings_json ?? [],
  };
}
