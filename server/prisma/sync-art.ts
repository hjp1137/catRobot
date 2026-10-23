import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { ART_MANIFEST } from '../../src/assets/ArtManifest';

const prisma = new PrismaClient();

async function main() {
  let upserted = 0;
  for (const [artKey, entry] of Object.entries(ART_MANIFEST)) {
    const manifestEntry = entry as { path: string; virtual?: boolean };
    const fullPath = path.resolve('..', manifestEntry.path);
    const physical = !manifestEntry.virtual && fs.existsSync(fullPath);
    const status = manifestEntry.virtual ? 'virtual' : physical ? 'physical' : 'missing';
    await prisma.contentArtResource.upsert({
      where: { art_key: artKey },
      create: row(artKey, entry, status) as any,
      update: row(artKey, entry, status) as any,
    });
    if (physical) await syncInitialVersion(artKey, entry, fullPath);
    upserted += 1;
  }
  console.log(`Art Manifest同步完成：upsert ${upserted}，未删除任何人工数据。`);
}

function row(artKey: string, entry: any, status: string) {
  return {
    art_key: artKey,
    resource_type: resourceType(artKey, entry),
    pack_name: entry.pack,
    physical_path: entry.path,
    fallback_art_key: entry.fallback,
    resource_status: status as any,
    width: entry.width,
    height: entry.height,
    transparent: entry.transparent ?? true,
    expected_width: entry.width,
    expected_height: entry.height,
    dimension_policy: entry.width && entry.height ? 'recommended' : 'free',
    required_alpha: entry.transparent ?? true,
    enabled: true,
  };
}

function resourceType(artKey: string, entry: any): string {
  const prefix = artKey.split('.')[0];
  if (['player', 'enemy', 'map', 'ui', 'effect', 'drop', 'placeholder'].includes(prefix)) return prefix;
  if (prefix === 'icon') return 'ui';
  if (entry.type === 'background') return 'background';
  if (entry.type === 'icon') return 'ui';
  return entry.type;
}

async function syncInitialVersion(artKey: string, entry: any, fullPath: string) {
  const versionId = crypto.createHash('md5').update(`init:${artKey}`).digest('hex');
  const checksum = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
  await prisma.contentArtResourceVersion.upsert({
    where: { id: versionId },
    create: {
      id: versionId,
      art_key: artKey,
      version_no: 1,
      original_filename: path.basename(entry.path),
      stored_filename: path.basename(entry.path),
      storage_path: entry.path,
      mime_type: 'image/png',
      file_extension: path.extname(entry.path) || '.png',
      size_bytes: fs.statSync(fullPath).size,
      actual_width: entry.width ?? 0,
      actual_height: entry.height ?? 0,
      has_alpha: entry.transparent ?? true,
      checksum,
      validation_status: 'published',
      published_at: new Date(),
    } as any,
    update: { checksum, size_bytes: fs.statSync(fullPath).size } as any,
  });
  await prisma.contentArtResource.updateMany({ where: { art_key: artKey, current_draft_version_id: null }, data: { current_draft_version_id: versionId } as any });
  await prisma.contentArtResource.updateMany({ where: { art_key: artKey, published_version_id: null }, data: { published_version_id: versionId } as any });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
}).finally(() => prisma.$disconnect());
