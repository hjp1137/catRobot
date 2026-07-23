import { ConflictException } from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AnimationClipsService } from '../src/modules/animation-clips/animation-clips.service';
import { SnapshotGeneratorService } from '../src/infrastructure/snapshot-generator/snapshot-generator.service';

describe('AnimationClipsService', () => {
  it('creates a clip with ordered frames and reports enemy references on delete', async () => {
    const prisma: any = prismaMock();
    prisma.contentAnimationClip.create.mockResolvedValue({ id: 'clip_1', clip_key: 'enemy.scrapMouse.idle', frames: [] });
    prisma.contentAnimationClip.findFirst.mockResolvedValue(clipRow());
    prisma.contentAnimationFrame.createMany.mockResolvedValue({ count: 2 });
    prisma.contentAnimationClip.findUnique.mockResolvedValue({ clip_key: 'enemy.scrapMouse.idle' });
    prisma.contentEnemyTemplate.findMany.mockResolvedValue([{ id: 'enemy_1', name: '废料鼠', visual_json: { animationClipKeys: { idle: 'enemy.scrapMouse.idle' } } }]);
    const service = new AnimationClipsService(prisma);

    await service.create({
      clipKey: 'enemy.scrapMouse.idle',
      name: '废料鼠待机测试片段',
      targetType: 'enemy',
      state: 'idle',
      playMode: 'loop',
      loop: true,
      defaultFrameDurationMs: 120,
      frames: [
        { artKey: 'enemy.scrapMouse.normal', order: 0 },
        { artKey: 'enemy.scrapBug.normal', order: 1 },
      ],
    });

    await expect(service.remove('enemy.scrapMouse.idle')).rejects.toBeInstanceOf(ConflictException);
  });

  it('lets snapshot generation include animation clips and frame art keys', async () => {
    const prisma: any = prismaMock();
    prisma.contentAnimationClip.findMany.mockResolvedValue([clipRow()]);
    prisma.contentAnimationFrame.findMany.mockResolvedValue([{ art_key: 'enemy.scrapBug.normal' }]);
    const service = new SnapshotGeneratorService(prisma);
    const snapshot: any = await service.buildAnimationManifestSnapshot('release_1', 'R000008');
    const keys = await (service as any).collectReferencedArtKeys();

    expect(snapshot.clips[0].frames.map((f: any) => f.artKey)).toEqual(['enemy.scrapMouse.normal', 'enemy.scrapBug.normal']);
    expect(keys.has('enemy.scrapBug.normal')).toBe(true);
  });

  it('does not expose isolated animation snapshot as published preview', () => {
    const paths = writePublishedFixture({ declareAnimation: false });
    process.env.CONTENT_SNAPSHOT_JSON_PATH = paths.content;
    process.env.ANIMATION_MANIFEST_JSON_PATH = paths.animation;
    const service = new AnimationClipsService(prismaMock());

    const result: any = service.publishedSnapshot();

    expect(result.enabled).toBe(false);
    expect(result.clips).toEqual([]);
    expect(result.reason).toBe('content-snapshot-animation-manifest-not-declared');
    expect(result.currentContentRelease).toBe('R000007');
    cleanupPublishedFixture(paths);
  });

  it('exposes published animation preview only when content declaration matches checksum', () => {
    const paths = writePublishedFixture({ declareAnimation: true });
    process.env.CONTENT_SNAPSHOT_JSON_PATH = paths.content;
    process.env.ANIMATION_MANIFEST_JSON_PATH = paths.animation;
    const service = new AnimationClipsService(prismaMock());

    const result: any = service.publishedSnapshot();

    expect(result.enabled).toBe(true);
    expect(result.releaseVersion).toBe('R000008');
    expect(result.clips).toHaveLength(1);
    cleanupPublishedFixture(paths);
  });
});

function prismaMock(): any {
  const prisma: any = {
    contentAnimationClip: { create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
    contentAnimationFrame: { createMany: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() },
    contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([]) },
    contentHeroVisual: { findMany: jest.fn().mockResolvedValue([]) },
    contentReleaseSnapshot: { findMany: jest.fn().mockResolvedValue([]) },
    contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([]) },
    contentStage: { findMany: jest.fn().mockResolvedValue([]) },
    contentStageWave: { findMany: jest.fn().mockResolvedValue([]) },
    contentStageWaveEnemyGroup: { findMany: jest.fn().mockResolvedValue([]) },
    contentExploreSpawnGroup: { findMany: jest.fn().mockResolvedValue([]) },
    contentStageObjective: { findMany: jest.fn().mockResolvedValue([]) },
    contentSystemState: { upsert: jest.fn() },
    contentChangeLog: { create: jest.fn() },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };
  return prisma;
}

function clipRow() {
  return {
    id: 'clip_1',
    clip_key: 'enemy.scrapMouse.idle',
    name: '废料鼠待机',
    target_type: 'enemy',
    state: 'idle',
    default_frame_duration_ms: 120,
    loop: true,
    play_mode: 'loop',
    end_behavior: 'hold-last-frame',
    enabled: true,
    content_version: 1,
    frames: [
      { sort_order: 0, art_key: 'enemy.scrapMouse.normal', duration_ms: null, offset_x: 0, offset_y: 0, scale: 1, flip_x: false, note: null },
      { sort_order: 1, art_key: 'enemy.scrapBug.normal', duration_ms: null, offset_x: 0, offset_y: 0, scale: 1, flip_x: false, note: null },
    ],
  };
}

function writePublishedFixture(options: { declareAnimation: boolean }) {
  const root = path.resolve(process.cwd(), '..');
  const dir = path.join(root, 'scratch', 'test-animation-published');
  fs.mkdirSync(dir, { recursive: true });
  const animation: any = {
    schemaVersion: 1,
    releaseId: 'release_animation_1',
    releaseVersion: 'R000008',
    generatedAt: '2026-07-14T00:00:00.000Z',
    checksum: '',
    clips: [clipFromFixture()],
  };
  animation.checksum = checksum({ ...animation, checksum: '' });
  const content: any = {
    schemaVersion: 1,
    releaseId: 'release_content_1',
    releaseVersion: 'R000007',
    generatedAt: '2026-07-14T00:00:00.000Z',
    checksum: 'content_checksum',
    enemies: [],
    backgrounds: [],
    heroVisuals: [],
    stages: [],
  };
  if (options.declareAnimation) {
    content.animationManifestReleaseId = animation.releaseId;
    content.animationManifestChecksum = animation.checksum;
  }
  const paths = { dir, content: 'scratch/test-animation-published/content.snapshot.json', animation: 'scratch/test-animation-published/animation-manifest.snapshot.json' };
  fs.writeFileSync(path.join(root, paths.content), JSON.stringify(content, null, 2));
  fs.writeFileSync(path.join(root, paths.animation), JSON.stringify(animation, null, 2));
  return paths;
}

function cleanupPublishedFixture(paths: { dir: string }) {
  delete process.env.CONTENT_SNAPSHOT_JSON_PATH;
  delete process.env.ANIMATION_MANIFEST_JSON_PATH;
  fs.rmSync(paths.dir, { recursive: true, force: true });
}

function clipFromFixture() {
  return {
    key: 'enemy.scrapMouse.idle.preview',
    name: '预览片段',
    targetType: 'enemy',
    state: 'idle',
    playMode: 'loop',
    loop: true,
    enabled: true,
    frames: [{ order: 0, artKey: 'enemy.scrapMouse.normal' }],
  };
}

function checksum(value: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(sortValue(value), null, 2)).digest('hex');
}

function sortValue(value: any): any {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result: Record<string, unknown>, key) => {
    if (value[key] !== undefined) result[key] = sortValue(value[key]);
    return result;
  }, {});
}
