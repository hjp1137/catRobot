'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../server/node_modules/sharp');
const dotenv = require('../server/node_modules/dotenv');
const { PrismaClient } = require('../server/node_modules/@prisma/client');
const { inspectArtFile } = require('./task29_1-maintenance-lib.cjs');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
let keys = [];
const prisma = new PrismaClient();

async function reconcile(tx, artKey) {
  const resource = await tx.contentArtResource.findUnique({ where: { art_key: artKey }, include: { currentDraftVersion: true } });
  if (!resource?.currentDraftVersion) throw new Error(`missing draft version: ${artKey}`);
  const prior = resource.currentDraftVersion;
  const metadata = await inspectArtFile(prior.storage_path);
  const thumbnailPath = `content-store/art/task31/${artKey.replace(/[^a-zA-Z0-9]+/g, '_')}.webp`;
  const thumbnail = path.resolve(process.cwd(), thumbnailPath);
  fs.mkdirSync(path.dirname(thumbnail), { recursive: true });
  await sharp(path.resolve(process.cwd(), prior.storage_path)).resize({ width: 256, height: 256, fit: 'inside' }).webp().toFile(thumbnail);
  const aggregate = await tx.contentArtResourceVersion.aggregate({ where: { art_key: artKey }, _max: { version_no: true } });
  const version = await tx.contentArtResourceVersion.create({ data: {
    id: crypto.randomBytes(16).toString('hex'), art_key: artKey, version_no: (aggregate._max.version_no ?? 0) + 1,
    original_filename: path.basename(prior.storage_path), stored_filename: path.basename(prior.storage_path), storage_path: prior.storage_path,
    thumbnail_path: thumbnailPath, mime_type: metadata.mimeType, file_extension: path.extname(prior.storage_path),
    size_bytes: fs.statSync(path.resolve(process.cwd(), prior.storage_path)).size, actual_width: metadata.width,
    actual_height: metadata.height, has_alpha: metadata.hasAlpha, checksum: metadata.checksum, validation_status: 'valid',
    validation_errors_json: [], validation_warnings_json: [], created_by: 'task31_art_metadata_repair',
  } });
  await tx.contentArtResource.update({ where: { art_key: artKey }, data: { current_draft_version_id: version.id,
    physical_path: prior.storage_path, width: metadata.width, height: metadata.height, transparent: metadata.hasAlpha,
    checksum: metadata.checksum, resource_status: 'physical', row_version: { increment: 1 } } });
  return { artKey, versionNo: version.version_no, width: metadata.width, height: metadata.height, checksum: metadata.checksum };
}

async function main() {
  const resources = await prisma.contentArtResource.findMany({ where: { enabled: true, resource_status: 'physical' }, include: { currentDraftVersion: true } });
  keys = resources.filter(row => row.currentDraftVersion && (!(row.currentDraftVersion.actual_width > 0) || !(row.currentDraftVersion.actual_height > 0)))
    .map(row => row.art_key).sort();
  if (!keys.length) throw new Error('no invalid physical Art metadata found');
  const repaired = await prisma.$transaction(async tx => {
    const rows = []; for (const key of keys) rows.push(await reconcile(tx, key));
    await tx.contentSystemState.update({ where: { id: 'singleton' }, data: { draft_revision: { increment: 1 }, draft_dirty: true } });
    return rows;
  }, { maxWait: 10000, timeout: 20000 });
  console.log(JSON.stringify({ repaired }, null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
