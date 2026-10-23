import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ArtResourcesService } from '../modules/art-resources/art-resources.service';
import { AnimationClipsService } from '../modules/animation-clips/animation-clips.service';
import { ContentCrudService } from '../modules/content/content-crud.service';

type Sequence = {
  prefix: string;
  filePrefix: string;
  count: number;
  type: 'player' | 'enemy';
  fallback: string;
  width: number;
  durationMs: number;
  filePad?: boolean;
};

const sequences: Sequence[] = [
  { prefix: 'player.mechaCat.run.phase', filePrefix: 'hero-run-', count: 8, type: 'player', fallback: 'player.mechaCat.idle', width: 443, durationMs: 90 },
  { prefix: 'enemy.scrapMouse.run.phase', filePrefix: 'mouse-run-', count: 6, type: 'enemy', fallback: 'enemy.scrapMouse.normal', width: 512, durationMs: 100 },
  { prefix: 'enemy.scrapGuard.run.phase', filePrefix: 'guard-run-', count: 6, type: 'enemy', fallback: 'enemy.scrapGuard.elite', width: 512, durationMs: 110 },
];

const directionalSequences = [
  { prefix: 'player.mechaCat.run.down.phase', filePrefix: 'hero-run-down-', count: 6, type: 'player', fallback: 'player.mechaCat.idle', width: 512, durationMs: 90, filePad: false },
  { prefix: 'player.mechaCat.run.up.phase', filePrefix: 'hero-run-up-', count: 6, type: 'player', fallback: 'player.mechaCat.idle', width: 512, durationMs: 90, filePad: false },
  { prefix: 'enemy.scrapMouse.run.down.phase', filePrefix: 'mouse-run-down-', count: 6, type: 'enemy', fallback: 'enemy.scrapMouse.normal', width: 512, durationMs: 100, filePad: false },
  { prefix: 'enemy.scrapMouse.run.up.phase', filePrefix: 'mouse-run-up-', count: 6, type: 'enemy', fallback: 'enemy.scrapMouse.normal', width: 512, durationMs: 100, filePad: false },
  { prefix: 'enemy.scrapGuard.run.down.phase', filePrefix: 'guard-run-down-', count: 6, type: 'enemy', fallback: 'enemy.scrapGuard.elite', width: 512, durationMs: 110, filePad: false },
  { prefix: 'enemy.scrapGuard.run.up.phase', filePrefix: 'guard-run-up-', count: 6, type: 'enemy', fallback: 'enemy.scrapGuard.elite', width: 512, durationMs: 110, filePad: false },
] satisfies Sequence[];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const prisma = app.get(PrismaService);
  const resources = app.get(ArtResourcesService);
  const clips = app.get(AnimationClipsService);
  const content = app.get(ContentCrudService);
  try {
    for (const sequence of [...sequences, ...directionalSequences]) await importSequence(prisma, resources, sequence);
    await upsertClip(clips, 'hero.mechaCat.move.sequence01', '主角机甲猫跑步', 'hero', sequences[0]);
    await upsertClip(clips, 'enemy.scrapMouse.move.sequence02', '废料鼠跑步', 'enemy', sequences[1]);
    await upsertClip(clips, 'enemy.scrapGuard.move.sequence01', '精英废料守卫跑步', 'enemy', sequences[2]);
    const directionalClips = [
      ['hero.mechaCat.move.down.sequence01', '主角机甲猫向前跑步', 'hero', directionalSequences[0], 'moveDown'],
      ['hero.mechaCat.move.up.sequence01', '主角机甲猫向后跑步', 'hero', directionalSequences[1], 'moveUp'],
      ['enemy.scrapMouse.move.down.sequence01', '废料鼠向前跑步', 'enemy', directionalSequences[2], 'moveDown'],
      ['enemy.scrapMouse.move.up.sequence01', '废料鼠向后跑步', 'enemy', directionalSequences[3], 'moveUp'],
      ['enemy.scrapGuard.move.down.sequence01', '精英守卫向前跑步', 'enemy', directionalSequences[4], 'moveDown'],
      ['enemy.scrapGuard.move.up.sequence01', '精英守卫向后跑步', 'enemy', directionalSequences[5], 'moveUp'],
    ] as const;
    for (const [key, name, type, sequence, state] of directionalClips) await upsertClip(clips, key, name, type, sequence, state);
    await bindDirections(content, 'heroes', 'hero_mecha_cat_default', 'hero.mechaCat');
    await bindDirections(content, 'enemies', 'enemy_scrap_mouse_01', 'enemy.scrapMouse');
    await bindDirections(content, 'enemies', 'enemy_scrap_guard_elite_01', 'enemy.scrapGuard', 'enemy.scrapGuard.move.sequence01');
    console.log('STAGE11_ANIMATION_IMPORT_OK');
  } finally {
    await app.close();
  }
}

async function importSequence(prisma: PrismaService, resources: ArtResourcesService, sequence: Sequence) {
  for (let index = 1; index <= sequence.count; index += 1) {
    const suffix = sequence.filePad === false ? String(index) : String(index).padStart(2, '0');
    const artKey = `${sequence.prefix}${suffix}`;
    const fileName = `${sequence.filePrefix}${suffix}.png`;
    const asset = await prisma.contentImageLibraryAsset.findFirst({ where: { original_filename: fileName, archived_at: null }, orderBy: { created_at: 'desc' } });
    if (!asset) throw new Error(`图库缺少 ${fileName}`);
    let resource = await prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    if (!resource) {
      await resources.createResource({ artKey, resourceType: sequence.type, packName: 'training_ground_v1', fallbackArtKey: sequence.fallback, expectedWidth: sequence.width, expectedHeight: sequence.width, dimensionPolicy: 'recommended', requiredAlpha: true, enabled: true });
      resource = await prisma.contentArtResource.findUnique({ where: { art_key: artKey } });
    }
    if (!resource?.current_draft_version_id) await resources.createVersionFromLibrary(artKey, { imageLibraryAssetId: asset.id });
  }
}

async function upsertClip(clips: AnimationClipsService, clipKey: string, name: string, targetType: 'hero' | 'enemy', sequence: Sequence, state = 'move') {
  const frames = Array.from({ length: sequence.count }, (_, order) => ({ order, artKey: `${sequence.prefix}${sequence.filePad === false ? order + 1 : String(order + 1).padStart(2, '0')}`, durationMs: sequence.durationMs }));
  const body = { clipKey, name, targetType, state, defaultFps: 1000 / sequence.durationMs, defaultFrameDurationMs: sequence.durationMs, loop: true, playMode: 'loop', endBehavior: 'hold-last-frame', enabled: true, version: 1, frames };
  try {
    const current = await clips.get(clipKey);
    await clips.update(clipKey, { ...body, rowVersion: current.rowVersion, version: current.version });
  } catch (error: any) {
    if (error?.status !== 404) throw error;
    await clips.create(body);
  }
}

async function bindDirections(content: ContentCrudService, kind: 'heroes' | 'enemies', id: string, prefix: string, move?: string) {
  const target: any = await content.get(kind, id);
  target.visual = { ...target.visual, animationClipKeys: { ...target.visual?.animationClipKeys,
    ...(move ? { move } : {}), moveDown: `${prefix}.move.down.sequence01`, moveUp: `${prefix}.move.up.sequence01` } };
  await content.update(kind, id, target);
}

void main().catch(error => { console.error(error); process.exitCode = 1; });
