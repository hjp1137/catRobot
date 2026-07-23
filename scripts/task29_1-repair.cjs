const crypto = require('node:crypto');
const dotenv = require('../server/node_modules/dotenv');
const { PrismaClient } = require('../server/node_modules/@prisma/client');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../server/node_modules/sharp');
const { cleanupTask29Data, inspectArtFile } = require('./task29_1-maintenance-lib.cjs');

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
const prisma = new PrismaClient();
const AVATAR = 'player.mechaCat.idle';
const ARROW = 'ui.tutorial.arrow';
const ART_KEYS = ['map.trainingGround.floor', AVATAR, ARROW];
const STEP_IDS = ['welcome', 'openCampaign', 'chapterOne', 'stageDetail', 'stagePower', 'stageReward', 'startStage', 'move', 'attack', 'firstEnemy', 'firstWave', 'clear', 'resultStars', 'resultReward', 'returnMap', 'newNode', 'inventory', 'equipment', 'complete'].map(id => `tutorial.${id}`);

async function releaseReferences() {
  const rows = await prisma.contentReleaseSnapshot.findMany({ select: { release_id: true, snapshot_json: true } });
  return rows.flatMap(row => ['campaign_task29_gui', 'campaign_task29_gui_copy']
    .filter(campaignId => JSON.stringify(row.snapshot_json).includes(campaignId)).map(campaignId => ({ releaseId: row.release_id, campaignId })));
}

async function reconcileArt(tx, artKey) {
  const row = await tx.contentArtResource.findUnique({ where: { art_key: artKey }, include: { currentDraftVersion: true } });
  if (!row?.currentDraftVersion) throw new Error(`current draft art missing: ${artKey}`);
  const version = row.currentDraftVersion; const metadata = await inspectArtFile(version.storage_path);
  const thumbnailPath = `content-store/art/task29_1/${artKey.replace(/[^a-zA-Z0-9]+/g, '_')}.webp`;
  const thumbnail = path.resolve(process.cwd(), thumbnailPath);
  fs.mkdirSync(path.dirname(thumbnail), { recursive: true });
  await sharp(path.resolve(process.cwd(), version.storage_path)).resize({ width: 256, height: 256, fit: 'inside' }).webp().toFile(thumbnail);
  const same = version.actual_width === metadata.width && version.actual_height === metadata.height && version.has_alpha === metadata.hasAlpha && version.checksum === metadata.checksum && version.thumbnail_path === thumbnailPath;
  const next = same ? version : await tx.contentArtResourceVersion.create({ data: {
    id: crypto.randomBytes(16).toString('hex'), art_key: artKey, version_no: (await tx.contentArtResourceVersion.aggregate({ where: { art_key: artKey }, _max: { version_no: true } }))._max.version_no + 1,
    original_filename: path.basename(version.storage_path), stored_filename: path.basename(version.storage_path), storage_path: version.storage_path, thumbnail_path: thumbnailPath,
    mime_type: metadata.mimeType, file_extension: path.extname(version.storage_path), size_bytes: fs.statSync(path.resolve(process.cwd(), version.storage_path)).size,
    actual_width: metadata.width, actual_height: metadata.height, has_alpha: metadata.hasAlpha, checksum: metadata.checksum,
    validation_status: 'valid', validation_errors_json: [], validation_warnings_json: [], created_by: 'task29_1_repair',
  } });
  await tx.contentArtResource.update({ where: { art_key: artKey }, data: { current_draft_version_id: next.id, physical_path: version.storage_path,
    width: metadata.width, height: metadata.height, transparent: metadata.hasAlpha, checksum: metadata.checksum, resource_status: 'physical', row_version: { increment: 1 } } });
  return { artKey, versionId: next.id, versionNo: next.version_no, metadata, thumbnailPath };
}

async function main() {
  const refs = await releaseReferences();
  const cleanup = await cleanupTask29Data(prisma, refs);
  const result = await prisma.$transaction(async tx => {
    const arts = []; for (const artKey of ART_KEYS) arts.push(await reconcileArt(tx, artKey));
    const flow = await tx.contentTutorialFlow.findUnique({ where: { id: 'tutorial.main.firstJourney' } });
    if (!flow || flow.deleted_at) throw new Error('default tutorial flow missing');
    const steps = await tx.contentTutorialStep.updateMany({ where: { id: { in: STEP_IDS }, flow_id: flow.id, enabled: true, deleted_at: null },
      data: { avatar_art_key: AVATAR, arrow_json: { artKey: ARROW, direction: 'auto' }, row_version: { increment: 1 } } });
    if (steps.count !== STEP_IDS.length) throw new Error(`default tutorial step count mismatch: ${steps.count}`);
    const changed = await tx.contentTutorialFlow.updateMany({ where: { id: flow.id, row_version: flow.row_version, deleted_at: null }, data: { row_version: { increment: 1 }, content_version: { increment: 1 } } });
    if (changed.count !== 1) throw new Error('default tutorial flow conflict');
    await tx.contentSystemState.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', draft_revision: 1, draft_dirty: true }, update: { draft_revision: { increment: 1 }, draft_dirty: true } });
    return { arts, tutorialStepCount: steps.count, tutorialFlowRowVersion: flow.row_version + 1 };
  }, { timeout: 20000 });
  console.log(JSON.stringify({ cleanup, result }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
