import fs from 'node:fs';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { resolveSafeProjectPath } from '../../common/utils/safe-path';
import { inspectImage, libraryPath, safeId, writeImage } from './image-library.image';

type Upload = { originalname: string; buffer: Buffer; size: number; mimetype: string };

@Injectable()
export class ImageLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any = {}) {
    const page = clamp(query.page, 1, 1, 100000), pageSize = clamp(query.pageSize, 24, 1, 96);
    const where: any = { archived_at: null, group_name: query.groupName, has_alpha: bool(query.hasAlpha),
      display_name: query.keyword ? { contains: String(query.keyword) } : undefined };
    if (query.used === 'true') where.artVersions = { some: {} }; if (query.used === 'false') where.artVersions = { none: {} };
    const [items, total] = await Promise.all([(this.prisma as any).contentImageLibraryAsset.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: order(query.sort), include: { variants: { where: { archived_at: null }, take: 8, orderBy: { created_at: 'desc' } }, _count: { select: { artVersions: true } } } }), (this.prisma as any).contentImageLibraryAsset.count({ where })]);
    return { items: items.map((item: any) => ({ ...item, storage_path: undefined, thumbnail_path: undefined, thumbnailUrl: `/content/image-library/${item.id}/thumbnail` })), page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async upload(file: Upload, createdBy?: string) {
    if (!file?.buffer?.length || file.size > Number(process.env.ART_MAX_UPLOAD_MB ?? 12) * 1024 * 1024) throw new BadRequestException('ART_IMAGE_INVALID：请选择限制内的图片。');
    const info = await inspectImage(file.buffer); const duplicate = await (this.prisma as any).contentImageLibraryAsset.findUnique({ where: { checksum_sha256: info.checksum } });
    if (duplicate) return { duplicate: true, asset: duplicate };
    const id = safeId(), storage = libraryPath('originals', id, undefined, info.extension), thumbnail = libraryPath('thumbnails', id);
    await writeImage(storage, file.buffer, thumbnail);
    const asset = await (this.prisma as any).contentImageLibraryAsset.create({ data: { id, original_filename: clean(file.originalname), display_name: clean(file.originalname), storage_path: storage, thumbnail_path: thumbnail, mime_type: info.mime, extension: info.extension, width: info.width, height: info.height, file_size: file.buffer.length, has_alpha: info.hasAlpha, checksum_sha256: info.checksum, created_by: createdBy } });
    return { duplicate: false, asset };
  }

  async createVariant(assetId: string, dto: any, createdBy?: string) {
    const asset = await (this.prisma as any).contentImageLibraryAsset.findUnique({ where: { id: assetId } }); if (!asset) throw new NotFoundException(assetId);
    const source = resolveSafeProjectPath(dto.variantId ? (await this.variant(dto.variantId, assetId)).storage_path : asset.storage_path);
    const id = safeId(), ext = dto.format === 'jpeg' ? '.jpg' : '.png', storage = libraryPath('variants', assetId, id, ext), thumbnail = libraryPath('thumbnails', assetId, id);
    const transparent = dto.transparent === true || dto.transparent === 'true';
    let pipe = sharp(source); if (dto.crop) pipe = pipe.extract(dto.crop); pipe = pipe.resize(dto.width, dto.height, { fit: dto.fit === 'cover' ? 'cover' : 'contain', position: dto.position ?? 'centre', background: transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : dto.background ?? '#ffffff' });
    const output = await (dto.format === 'jpeg' ? pipe.jpeg() : pipe.png()).toBuffer(); const info = await inspectImage(output);
    const duplicate = await (this.prisma as any).contentImageLibraryVariant.findUnique({ where: { checksum_sha256: info.checksum } }); if (duplicate) return { duplicate: true, variant: duplicate };
    await writeImage(storage, output, thumbnail);
    const variant = await (this.prisma as any).contentImageLibraryVariant.create({ data: { id, source_asset_id: assetId, variant_name: String(dto.name ?? `${info.width}x${info.height}`), storage_path: storage, thumbnail_path: thumbnail, mime_type: info.mime, width: info.width, height: info.height, file_size: output.length, has_alpha: info.hasAlpha, checksum_sha256: info.checksum, transform_config: { ...dto, sharp: { fit: dto.fit ?? 'contain', format: dto.format ?? 'png' } }, created_by: createdBy } });
    return { duplicate: false, variant };
  }

  async createVariants(assetIds: string[], dto: any, createdBy?: string) {
    const ids = [...new Set((assetIds ?? []).map(String).filter(Boolean))];
    if (!ids.length || ids.length > 96) throw new BadRequestException('请选择 1 至 96 张图片。');
    const results = await Promise.all(ids.map(async assetId => {
      try { return { assetId, ok: true, result: await this.createVariant(assetId, dto, createdBy) }; }
      catch (error) { return { assetId, ok: false, error: message(error) }; }
    }));
    return { results, succeeded: results.filter(item => item.ok).length, failed: results.filter(item => !item.ok).length };
  }

  async rename(id: string, displayName: string) { return (this.prisma as any).contentImageLibraryAsset.update({ where: { id }, data: { display_name: clean(displayName) } }); }
  async get(id: string) {
    const asset = await (this.prisma as any).contentImageLibraryAsset.findUnique({ where: { id }, include: { variants: { where: { archived_at: null }, orderBy: { created_at: 'desc' }, include: { _count: { select: { artVersions: true } } } }, _count: { select: { artVersions: true } } } });
    if (!asset) throw new NotFoundException(id);
    return { ...asset, storage_path: undefined, thumbnail_path: undefined, thumbnailUrl: `/content/image-library/${id}/thumbnail`, previewUrl: `/content/image-library/${id}/preview`, variants: asset.variants.map((row: any) => ({ ...row, storage_path: undefined, thumbnail_path: undefined, thumbnailUrl: `/content/image-library/${id}/variants/${row.id}/thumbnail`, previewUrl: `/content/image-library/${id}/variants/${row.id}/preview` })) };
  }
  async file(id: string, thumbnail = true) { const row = await (this.prisma as any).contentImageLibraryAsset.findUnique({ where: { id } }); if (!row) throw new NotFoundException(id); return { path: resolveSafeProjectPath(thumbnail ? row.thumbnail_path : row.storage_path), mime: thumbnail ? 'image/webp' : row.mime_type }; }
  async variantFile(assetId: string, variantId: string, thumbnail = true) { const row = await this.variant(variantId, assetId); return { path: resolveSafeProjectPath(thumbnail ? row.thumbnail_path : row.storage_path), mime: thumbnail ? 'image/webp' : row.mime_type }; }
  async archive(id: string) { const asset = await (this.prisma as any).contentImageLibraryAsset.findUnique({ where: { id }, include: { _count: { select: { artVersions: true } } } }); if (!asset) throw new NotFoundException(id); if (asset._count.artVersions) throw new ConflictException('已被 Art Key 引用的图库文件不能归档。'); return (this.prisma as any).contentImageLibraryAsset.update({ where: { id }, data: { archived_at: new Date(), status: 'archived' } }); }
  async archiveVariant(assetId: string, variantId: string) { const row = await (this.prisma as any).contentImageLibraryVariant.findUnique({ where: { id: variantId }, include: { _count: { select: { artVersions: true } } } }); if (!row || row.source_asset_id !== assetId) throw new NotFoundException(variantId); if (row._count.artVersions) throw new ConflictException('已被 Art Key 引用的派生版本不能归档。'); return (this.prisma as any).contentImageLibraryVariant.update({ where: { id: variantId }, data: { archived_at: new Date() } }); }
  private async variant(id: string, assetId: string) { const row = await (this.prisma as any).contentImageLibraryVariant.findUnique({ where: { id } }); if (!row || row.source_asset_id !== assetId) throw new NotFoundException(id); return row; }
}
function clamp(value: any, fallback: number, min: number, max: number) { const n = Number(value); return Number.isInteger(n) ? Math.max(min, Math.min(max, n)) : fallback; }
function bool(value: any) { return value === undefined ? undefined : value === 'true' || value === true; }
function order(value: any): any { return ['created_at', 'updated_at', 'file_size'].includes(value) ? { [value]: 'desc' } : { updated_at: 'desc' }; }
function clean(value: unknown) { const text = String(value ?? '').trim().replace(/[\\/]/g, '_'); if (!text) throw new BadRequestException('名称不能为空。'); return text.slice(0, 255); }
function message(error: unknown) { return error instanceof Error ? error.message : String(error); }
