import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';
import { resolveSafeProjectPath } from '../../common/utils/safe-path';

export type ImageInfo = { mime: string; extension: string; width: number; height: number; hasAlpha: boolean; checksum: string };

export async function inspectImage(buffer: Buffer): Promise<ImageInfo> {
  const meta = await sharp(buffer, { failOn: 'error' }).metadata();
  const mime = meta.format === 'png' ? 'image/png' : meta.format === 'jpeg' ? 'image/jpeg' : meta.format === 'webp' ? 'image/webp' : '';
  if (!mime || !meta.width || !meta.height) throw new BadRequestException('ART_IMAGE_INVALID：文件不是受支持的真实位图。');
  if (meta.width * meta.height > Number(process.env.ART_MAX_PIXEL_COUNT ?? 16777216)) throw new BadRequestException('ART_IMAGE_INVALID：图片像素超过限制。');
  return { mime, extension: mime === 'image/jpeg' ? '.jpg' : `.${meta.format}`, width: meta.width, height: meta.height,
    hasAlpha: await containsTransparentPixel(buffer), checksum: crypto.createHash('sha256').update(buffer).digest('hex') };
}

export async function containsTransparentPixel(buffer: Buffer): Promise<boolean> {
  const { data, info } = await sharp(buffer, { failOn: 'error' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = info.channels - 1; index < data.length; index += info.channels) if (data[index] < 255) return true;
  return false;
}

export function libraryPath(kind: 'originals' | 'variants' | 'thumbnails', assetId: string, variantId?: string, extension = '.png'): string {
  if (kind === 'thumbnails') return `content-store/image-library/thumbnails/${variantId ?? assetId}.webp`;
  return kind === 'originals' ? `content-store/image-library/originals/${assetId}/original${extension}` : `content-store/image-library/variants/${assetId}/${variantId}/image${extension}`;
}

export async function writeImage(relative: string, buffer: Buffer, thumbnail: string): Promise<void> {
  const target = resolveSafeProjectPath(relative); const thumb = resolveSafeProjectPath(thumbnail);
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, buffer);
  fs.mkdirSync(path.dirname(thumb), { recursive: true }); await sharp(buffer).resize(256, 256, { fit: 'inside' }).webp().toFile(thumb);
}

export function safeId(): string { return crypto.randomUUID(); }
