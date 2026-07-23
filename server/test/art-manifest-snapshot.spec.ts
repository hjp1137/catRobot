import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SnapshotGeneratorService } from '../src/infrastructure/snapshot-generator/snapshot-generator.service';

describe('SnapshotGeneratorService art manifest snapshot', () => {
  let previousRoot: string | undefined;

  beforeEach(() => {
    previousRoot = process.env.CAT_ROBOT_PROJECT_ROOT;
  });

  afterEach(() => {
    if (previousRoot === undefined) delete process.env.CAT_ROBOT_PROJECT_ROOT;
    else process.env.CAT_ROBOT_PROJECT_ROOT = previousRoot;
  });

  it('builds a published art manifest from referenced draft versions only', async () => {
    const prisma = {
      contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([
        { visual_json: { idleArtKey: 'enemy.scrapMouse.normal' } },
      ]) },
      contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([
        { art_json: { floorArtKey: 'map.trainingGround.floor' } },
      ]) },
      contentHeroVisual: { findMany: jest.fn().mockResolvedValue([
        { visual_json: { idleArtKey: 'player.mechaCat.idle' }, skills_json: {} },
      ]) },
      contentAnimationFrame: { findMany: jest.fn().mockResolvedValue([]) },
      contentStage: { findMany: jest.fn().mockResolvedValue([]) },
      contentArtResource: { findMany: jest.fn().mockResolvedValue([
        resource('enemy.scrapMouse.normal', 'enemy', 'ver_enemy'),
        resource('map.trainingGround.floor', 'map', 'ver_floor'),
      ]) },
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue([
        version('ver_enemy', 'enemy.scrapMouse.normal', 3),
        version('ver_floor', 'map.trainingGround.floor', 1),
      ]) },
    };
    const service = new SnapshotGeneratorService(prisma as any);

    const snapshot = await service.buildArtManifestSnapshot('rel_1', 'R000006');

    expect(snapshot.releaseVersion).toBe('R000006');
    expect(snapshot.resources['enemy.scrapMouse.normal']).toMatchObject({
      type: 'enemy',
      versionId: 'ver_enemy',
      versionNo: 3,
      path: 'assets/art-releases/R000006/enemies/enemy_scrapMouse_normal.png',
      width: 64,
      height: 64,
      hasAlpha: true,
    });
    expect(snapshot.resources['map.trainingGround.floor'].path).toBe('assets/art-releases/R000006/maps/map_trainingGround_floor.png');
    expect(snapshot.resources['player.mechaCat.idle']).toBeUndefined();
    expect(snapshot.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(snapshot)).not.toContain(':\\\\');
  });

  it('refuses to overwrite an existing release asset directory', async () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-release-guard-'));
    process.env.CAT_ROBOT_PROJECT_ROOT = tmpRoot;
    const source = path.join(tmpRoot, 'content-store/art/uploads/enemy/ver_enemy/original.png');
    const target = path.join(tmpRoot, 'assets/art-releases/R000006/enemies/enemy_scrapMouse_normal.png');
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(source, 'new-bytes');
    fs.writeFileSync(target, 'old-bytes');
    const before = fs.readFileSync(target, 'utf8');
    const service = new SnapshotGeneratorService({
      contentArtResourceVersion: { findMany: jest.fn().mockResolvedValue([
        { id: 'ver_enemy', storage_path: 'content-store/art/uploads/enemy/ver_enemy/original.png' },
      ]) },
    } as any);

    await expect(service.writeArtManifestSnapshot({
      releaseId: 'rel_1',
      releaseVersion: 'R000006',
      resources: {
        'enemy.scrapMouse.normal': {
          versionId: 'ver_enemy',
          path: 'assets/art-releases/R000006/enemies/enemy_scrapMouse_normal.png',
        },
      },
    })).rejects.toThrow('发布资源目标已存在');

    expect(fs.readFileSync(target, 'utf8')).toBe(before);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });
});

function resource(art_key: string, resource_type: string, current_draft_version_id: string) {
  return {
    art_key,
    resource_type,
    pack_name: 'training_ground_v1',
    fallback_art_key: 'placeholder.image',
    current_draft_version_id,
    published_version_id: null,
    enabled: true,
  };
}

function version(id: string, art_key: string, version_no: number) {
  return {
    id,
    art_key,
    version_no,
    storage_path: `content-store/art/uploads/${art_key}/${id}/original.png`,
    actual_width: 64,
    actual_height: 64,
    has_alpha: true,
    checksum: `${id}_checksum`,
    validation_status: 'valid',
  };
}
