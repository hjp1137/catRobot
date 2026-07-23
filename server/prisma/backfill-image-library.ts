import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { inspectImage } from '../src/modules/image-library/image-library.image';

const prisma = new PrismaClient();
type Stats = Record<'scanned' | 'created' | 'reused' | 'linked' | 'virtual' | 'missing' | 'invalid', number>;

async function main() {
  const stats: Stats = { scanned: 0, created: 0, reused: 0, linked: 0, virtual: 0, missing: 0, invalid: 0 };
  const versions = await prisma.contentArtResourceVersion.findMany({ include: { resource: true } } as any);
  for (const version of versions as any[]) {
    stats.scanned++; if (version.image_library_asset_id) continue;
    if (version.resource.resource_status === 'virtual') { stats.virtual++; continue; }
    const target = path.resolve('..', version.storage_path);
    if (!fs.existsSync(target)) { stats.missing++; continue; }
    try {
      const buffer = fs.readFileSync(target), info = await inspectImage(buffer);
      let asset = await (prisma as any).contentImageLibraryAsset.findUnique({ where: { checksum_sha256: info.checksum } });
      if (asset) stats.reused++; else {
        asset = await (prisma as any).contentImageLibraryAsset.create({ data: { id: crypto.randomUUID(), original_filename: path.basename(version.storage_path), display_name: path.basename(version.storage_path), storage_path: version.storage_path, thumbnail_path: version.thumbnail_path, mime_type: info.mime, extension: info.extension, width: info.width, height: info.height, file_size: buffer.length, has_alpha: info.hasAlpha, checksum_sha256: info.checksum, source_type: 'legacy-import' } }); stats.created++;
      }
      await prisma.contentArtResourceVersion.update({ where: { id: version.id }, data: { image_library_asset_id: asset.id, image_source_mode: 'legacy-storage' } as any }); stats.linked++;
    } catch { stats.invalid++; }
  }
  console.log(JSON.stringify({ imageLibraryMigration: stats }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
