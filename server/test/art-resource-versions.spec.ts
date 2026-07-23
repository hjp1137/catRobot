import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ConflictException } from '@nestjs/common';
import { ArtResourcesService } from '../src/modules/art-resources/art-resources.service';

describe('ArtResourcesService art versions', () => {
  const sourcePng = path.resolve(__dirname, '../../assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cat-art-'));
    process.env.CAT_ROBOT_PROJECT_ROOT = tmpRoot;
    process.env.ART_UPLOAD_ROOT = 'content-store/art/uploads';
    process.env.ART_THUMBNAIL_ROOT = 'content-store/art/thumbnails';
    process.env.ART_MAX_UPLOAD_MB = '12';
    process.env.ART_MAX_PIXEL_COUNT = '16777216';
    process.env.ART_THUMBNAIL_SIZE = '128';
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('uploads a new immutable version and selects it as current draft', async () => {
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue(resource());
    prisma.contentArtResourceVersion.findFirst.mockResolvedValue(null);
    prisma.contentArtResourceVersion.findMany.mockResolvedValue([]);
    prisma.contentArtResourceVersion.count.mockResolvedValue(0);
    prisma.contentArtResourceVersion.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'version_1', ...data }));
    const service = new ArtResourcesService(prisma as any);

    const result = await service.uploadVersion('enemy.scrapMouse.normal', {
      originalname: 'mouse.png',
      mimetype: 'image/png',
      size: fs.statSync(sourcePng).size,
      buffer: fs.readFileSync(sourcePng),
    } as any, 'admin_1');

    expect(result.versionNo).toBe(1);
    expect(result.actualWidth).toBe(64);
    expect(result.actualHeight).toBe(64);
    expect(result.hasAlpha).toBe(true);
    expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(result.storagePath).toBe(`content-store/art/uploads/enemy_scrapMouse_normal/${result.id}/original.png`);
    expect(result.thumbnailPath).toBe(`content-store/art/thumbnails/${result.id}.webp`);
    expect(fs.existsSync(path.join(tmpRoot, result.storagePath))).toBe(true);
    expect(fs.existsSync(path.join(tmpRoot, result.thumbnailPath))).toBe(true);
    expect(prisma.contentArtResource.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ current_draft_version_id: result.id, row_version: { increment: 1 } }),
    }));
    expect(prisma.contentChangeLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action_type: 'upload-art-version', entity_id: 'enemy.scrapMouse.normal' }),
    }));
  });

  it('rejects duplicate upload for the same Art Key checksum', async () => {
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue(resource());
    prisma.contentArtResourceVersion.findFirst.mockResolvedValue({ art_key: 'enemy.scrapMouse.normal', version_no: 2 });
    const service = new ArtResourcesService(prisma as any);

    await expect(service.uploadVersion('enemy.scrapMouse.normal', {
      originalname: 'mouse-copy.png',
      mimetype: 'image/png',
      size: fs.statSync(sourcePng).size,
      buffer: fs.readFileSync(sourcePng),
    } as any, 'admin_1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('serves the original image when an imported physical version has no thumbnail', async () => {
    const target = path.join(tmpRoot, 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResourceVersion.findUnique.mockResolvedValue({
      id: 'b30258e1289df7ad536e4ede54dbbaa0',
      art_key: 'enemy.scrapMouse.normal',
      storage_path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png',
      thumbnail_path: null,
      mime_type: 'image/png',
    });
    const service = new ArtResourcesService(prisma as any);

    const file = await service.fileForVersion('enemy.scrapMouse.normal', 'b30258e1289df7ad536e4ede54dbbaa0', 'thumbnail');

    expect(file.path).toBe(target);
    expect(file.mime).toBe('image/png');
  });

  it('regenerates a stored thumbnail file when it is missing', async () => {
    const target = path.join(tmpRoot, 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResourceVersion.findUnique.mockResolvedValue({
      id: 'b30258e1289df7ad536e4ede54dbbaa0', art_key: 'enemy.scrapMouse.normal',
      storage_path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png',
      thumbnail_path: 'content-store/art/thumbnails/missing.webp', mime_type: 'image/png',
    });
    const service = new ArtResourcesService(prisma as any);

    const file = await service.fileForVersion('enemy.scrapMouse.normal', 'b30258e1289df7ad536e4ede54dbbaa0', 'thumbnail');

    const thumbnail = path.join(tmpRoot, 'content-store/art/thumbnails/missing.webp');
    expect(file.path).toBe(thumbnail);
    expect(file.mime).toBe('image/webp');
    expect(fs.existsSync(thumbnail)).toBe(true);
  });

  it('returns unified display summary for a MySQL draft version', async () => {
    const target = path.join(tmpRoot, 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{
      ...resource(),
      resource_status: 'physical',
      current_draft_version_id: 'draft_1',
      published_version_id: 'pub_1',
      currentDraftVersion: version('draft_1', 'valid'),
      publishedVersion: version('pub_1', 'published'),
    }]);
    const service = new ArtResourcesService(prisma as any);

    const rows = (await service.list()).items;

    expect(rows[0]).toEqual(expect.objectContaining({
      art_key: 'enemy.scrapMouse.normal',
      status: 'physical',
      source: 'mysql-draft-version',
      thumbnailUrl: '/content/resources/enemy.scrapMouse.normal/thumbnail',
      originalUrl: '/content/resources/enemy.scrapMouse.normal/preview',
      hasUnpublishedChange: true,
      width: 64,
      height: 64,
      mimeType: 'image/png',
      checksum: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
  });

  it('reuses the listed resource version for its thumbnail request', async () => {
    const target = path.join(tmpRoot, 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{
      ...resource(), resource_status: 'physical', currentDraftVersion: version('draft_1', 'valid'), publishedVersion: null,
    }]);
    const service = new ArtResourcesService(prisma as any);

    await service.list();
    const file = await service.fileForArtKey('enemy.scrapMouse.normal', 'thumbnail');

    expect(file.path).toBe(target);
    expect(prisma.contentArtResource.findUnique).not.toHaveBeenCalled();
  });

  it('reuses the listed resource summary for its detail request', async () => {
    const target = path.join(tmpRoot, 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{
      ...resource(), resource_status: 'physical', currentDraftVersion: version('draft_1', 'valid'), publishedVersion: null,
    }]);
    const service = new ArtResourcesService(prisma as any);

    await service.list();
    const summary = await service.get('enemy.scrapMouse.normal');

    expect(summary.art_key).toBe('enemy.scrapMouse.normal');
    expect(prisma.contentArtResource.findUnique).not.toHaveBeenCalled();
  });

  it('returns a real backend page with category counts and reference summaries', async () => {
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{
      ...resource(), currentDraftVersion: version('draft_1', 'valid'), publishedVersion: null,
    }]);
    prisma.contentArtResource.count.mockResolvedValue(25);
    const result = await new ArtResourcesService(prisma as any).list({ page: '2', pageSize: '24', category: '角色与敌人' });

    expect(result).toEqual(expect.objectContaining({
      page: 2, pageSize: 24, total: 25, totalPages: 2,
      items: [expect.objectContaining({ art_key: 'enemy.scrapMouse.normal' })],
      categoryCounts: expect.objectContaining({ '角色与敌人': expect.any(Number) }),
    }));
    expect(prisma.contentArtResource.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 24, take: 24 }));
  });

  it('falls back to the published art snapshot before reporting Missing', async () => {
    const releasePath = path.join(tmpRoot, 'assets/art-releases/R000005/enemies/enemy_scrapMouse_normal.png');
    fs.mkdirSync(path.dirname(releasePath), { recursive: true });
    fs.copyFileSync(sourcePng, releasePath);
    writeSnapshot(tmpRoot);
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{ ...resource(), resource_status: 'missing', currentDraftVersion: null, publishedVersion: null }]);
    const service = new ArtResourcesService(prisma as any);

    const rows = (await service.list()).items;

    expect(rows[0]).toEqual(expect.objectContaining({
      status: 'physical',
      source: 'published-art-snapshot',
      publishedVersion: expect.objectContaining({ id: 'snap_1', version_no: 1 }),
      thumbnailUrl: '/content/resources/enemy.scrapMouse.normal/thumbnail',
    }));
  });

  it('uses the valid published chapter background when its selected draft file is missing', async () => {
    const publishedPath = path.join(tmpRoot, 'assets/art-releases/R000007/maps/map_trainingGround_floor.png');
    fs.mkdirSync(path.dirname(publishedPath), { recursive: true });
    fs.copyFileSync(sourcePng, publishedPath);
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue({
      ...resource(), art_key: 'map.trainingGround.floor', resource_status: 'physical',
      current_draft_version_id: 'draft_missing', published_version_id: 'published_valid',
      currentDraftVersion: {
        ...version('draft_missing', 'valid'), art_key: 'map.trainingGround.floor',
        storage_path: 'content-store/art/uploads/missing.png',
      },
      publishedVersion: {
        ...version('published_valid', 'published'), art_key: 'map.trainingGround.floor',
        storage_path: 'assets/art-releases/R000007/maps/map_trainingGround_floor.png',
      },
    });
    const service = new ArtResourcesService(prisma as any);

    const summary = await service.get('map.trainingGround.floor');

    expect(summary).toEqual(expect.objectContaining({
      status: 'physical', source: 'mysql-published-version',
      displayVersion: expect.objectContaining({ id: 'published_valid' }),
      thumbnailUrl: '/content/resources/map.trainingGround.floor/thumbnail',
      draftVersionStatus: 'Missing',
      draftWarning: '草稿版本 Missing，当前展示发布版本',
      fallbackReason: 'draft-version-missing',
    }));
  });

  it('reports a physical version without checksum as Invalid instead of physical', async () => {
    const target = path.join(tmpRoot, 'assets/floor.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue({
      ...resource(), art_key: 'map.trainingGround.floor', resource_status: 'physical',
      current_draft_version_id: 'draft_without_checksum',
      currentDraftVersion: {
        ...version('draft_without_checksum', 'valid'), art_key: 'map.trainingGround.floor',
        storage_path: 'assets/floor.png', checksum: null,
      },
      publishedVersion: null,
    });
    const service = new ArtResourcesService(prisma as any);

    const summary = await service.get('map.trainingGround.floor');

    expect(summary).toEqual(expect.objectContaining({
      status: 'invalid', source: 'mysql-draft-version',
    }));
  });

  it('computes checksum and image metadata for a valid Base Manifest physical fallback', async () => {
    const relative = 'assets/base/floor.png';
    const target = path.join(tmpRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(sourcePng, target);
    const manifestPath = path.join(tmpRoot, 'src/assets/ArtManifest.ts');
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `export const ART_MANIFEST = {
      'map.trainingGround.floor': { path: '${relative}', type: 'background', pack: 'base',
        width: 64, height: 64, transparent: true }
    } as const;`);
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue({
      ...resource(), art_key: 'map.trainingGround.floor', resource_status: 'missing',
      currentDraftVersion: null, publishedVersion: null,
    });
    const service = new ArtResourcesService(prisma as any);

    const summary = await service.get('map.trainingGround.floor');

    expect(summary).toEqual(expect.objectContaining({
      status: 'physical', source: 'base-art-manifest', width: 64, height: 64,
      hasAlpha: true, checksum: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
  });

  it.each([
    ['unsafe path', '../outside.png', undefined, 'unsafe-path'],
    ['read failure', 'assets/base', 'directory', 'read-failed'],
    ['metadata failure', 'assets/base/bad.png', 'not-image', 'metadata-invalid'],
  ])('exposes Base Manifest %s reason', async (_label, relative, fixtureKind, reason) => {
    if (fixtureKind === 'directory') fs.mkdirSync(path.join(tmpRoot, relative), { recursive: true });
    if (fixtureKind === 'not-image') {
      fs.mkdirSync(path.dirname(path.join(tmpRoot, relative)), { recursive: true });
      fs.writeFileSync(path.join(tmpRoot, relative), 'not an image');
    }
    writeBaseManifest(tmpRoot, relative);
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValue({
      ...resource(), art_key: 'map.trainingGround.floor', resource_status: 'missing',
      currentDraftVersion: null, publishedVersion: null,
    });

    const summary = await new ArtResourcesService(prisma as any).get('map.trainingGround.floor');

    expect(summary).toEqual(expect.objectContaining({
      status: 'invalid', source: 'base-art-manifest', fallbackReason: expect.stringContaining(reason),
    }));
  });

  it('does not expose preview URLs for virtual resources', async () => {
    const prisma = prismaMock();
    prisma.contentArtResource.findMany.mockResolvedValue([{
      ...resource(),
      art_key: 'resource.energyCrystal',
      resource_status: 'virtual',
      currentDraftVersion: null,
      publishedVersion: null,
    }]);
    const service = new ArtResourcesService(prisma as any);

    const rows = (await service.list()).items;

    expect(rows[0]).toEqual(expect.objectContaining({
      status: 'virtual',
      source: 'virtual',
      thumbnailUrl: null,
      originalUrl: null,
    }));
  });

  it('returns business references for an Art Key', async () => {
    const prisma = prismaMock();
    prisma.contentEnemyTemplate.findMany.mockResolvedValue([{ id: 'enemy_1', name: '敌人', visual_json: { idleArtKey: 'enemy.scrapMouse.normal' } }]);
    prisma.contentBackgroundTheme.findMany.mockResolvedValue([{ id: 'bg_1', name: '背景', art_json: { floorArtKey: 'map.floor' } }]);
    prisma.contentHeroVisual.findMany.mockResolvedValue([{ id: 'hero_1', name: '主角', visual_json: {}, skills_json: { cannonIconArtKey: 'enemy.scrapMouse.normal' } }]);
    prisma.contentCampaign.findMany.mockResolvedValue([{ id: 'main', name: '主线战役', cover_art_key: 'enemy.scrapMouse.normal' }]);
    prisma.contentCampaignChapter.findMany.mockResolvedValue([{ id: 'chapter_1', name: '第一章', background_art_key: 'enemy.scrapMouse.normal' }]);
    prisma.contentCampaignStageNode.findMany.mockResolvedValue([{ id: 'node_1', name: '铸造通道', icon_art_key: 'enemy.scrapMouse.normal' }]);
    prisma.contentTutorialStep.findMany.mockResolvedValue([{ id: 'tutorial.attack', flow_id: 'tutorial.main', title: '攻击教学', avatar_art_key: 'enemy.scrapMouse.normal' }]);
    const service = new ArtResourcesService(prisma as any);

    const refs = await service.references('enemy.scrapMouse.normal');

    expect(refs).toEqual(expect.objectContaining({ total: 6, items: expect.arrayContaining([
      expect.objectContaining({ type: 'enemy', id: 'enemy_1', field: 'visual_json' }),
      expect.objectContaining({ type: 'hero', id: 'hero_1', field: 'skills_json' }),
      expect.objectContaining({ type: 'campaign', id: 'main', field: 'cover_art_key' }),
      expect.objectContaining({ type: 'campaign-chapter', id: 'chapter_1', field: 'background_art_key' }),
      expect.objectContaining({ type: 'campaign-node', id: 'node_1', field: 'icon_art_key' }),
      expect.objectContaining({ type: 'tutorial-step', id: 'tutorial.attack', field: 'avatar_art_key' }),
    ]) }));
  });

  it('creates a new Art Key and first version in one transaction', async () => {
    const prisma = prismaMock();
    prisma.contentArtResource.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(resource());
    prisma.contentArtResource.create.mockImplementation(({ data }: any) => Promise.resolve({ ...data }));
    prisma.contentArtResourceVersion.findFirst.mockResolvedValue(null);
    prisma.contentArtResourceVersion.findMany.mockResolvedValue([]);
    prisma.contentArtResourceVersion.count.mockResolvedValue(0);
    prisma.contentArtResourceVersion.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'version_1', ...data }));
    const service = new ArtResourcesService(prisma as any);

    const result = await (service as any).createResourceWithVersion({
      artKey: 'enemy.newMouse.normal',
      resourceType: 'enemy',
      packName: 'training_ground_v1',
      expectedWidth: '64',
      expectedHeight: '64',
      dimensionPolicy: 'exact',
      requiredAlpha: 'true',
      fallbackArtKey: 'placeholder.image',
    }, {
      originalname: 'new-mouse.png',
      mimetype: 'image/png',
      size: fs.statSync(sourcePng).size,
      buffer: fs.readFileSync(sourcePng),
    } as any, 'admin_1');

    expect(result.artKey).toBe('enemy.newMouse.normal');
    expect(result.draftVersion.versionNo).toBe(1);
    expect(prisma.contentArtResource.create).toHaveBeenCalledTimes(1);
    expect(prisma.contentArtResourceVersion.create).toHaveBeenCalledTimes(1);
    expect(prisma.contentArtResource.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { art_key: 'enemy.newMouse.normal' },
      data: expect.objectContaining({ current_draft_version_id: expect.any(String) }),
    }));
  });
});

function prismaMock() {
  const prisma: any = {
    contentArtResource: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    contentArtResourceVersion: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contentSystemState: { upsert: jest.fn().mockResolvedValue({}) },
    contentChangeLog: { create: jest.fn().mockResolvedValue({}) },
    contentEnemyTemplate: { findMany: jest.fn().mockResolvedValue([]) },
    contentBackgroundTheme: { findMany: jest.fn().mockResolvedValue([]) },
    contentHeroVisual: { findMany: jest.fn().mockResolvedValue([]) },
    contentAnimationFrame: { findMany: jest.fn().mockResolvedValue([]) },
    contentCampaign: { findMany: jest.fn().mockResolvedValue([]) },
    contentCampaignChapter: { findMany: jest.fn().mockResolvedValue([]) },
    contentCampaignStageNode: { findMany: jest.fn().mockResolvedValue([]) },
    contentTutorialStep: { findMany: jest.fn().mockResolvedValue([]) },
    contentReleaseSnapshot: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn((fn: any) => fn(prisma)),
  };
  return prisma;
}

function version(id: string, validationStatus: string) {
  return {
    id,
    art_key: 'enemy.scrapMouse.normal',
    version_no: id === 'draft_1' ? 2 : 1,
    storage_path: 'assets/art-packs/training_ground_v1/enemies/enemy_scrap_mouse_idle_01.png',
    thumbnail_path: null,
    mime_type: 'image/png',
    actual_width: 64,
    actual_height: 64,
    has_alpha: true,
    checksum: '604fd3002057873447c48580973e7836cb4a75dc95dfffbc0e1cd2779efb8cba',
    validation_status: validationStatus,
  };
}

function writeSnapshot(root: string) {
  const target = path.join(root, 'content-store/published/art-manifest.snapshot.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify({
    resources: {
      'enemy.scrapMouse.normal': {
        versionId: 'snap_1',
        versionNo: 1,
        path: 'assets/art-releases/R000005/enemies/enemy_scrapMouse_normal.png',
        type: 'enemy',
        pack: 'training_ground_v1',
        width: 64,
        height: 64,
        hasAlpha: true,
        checksum: '604fd3002057873447c48580973e7836cb4a75dc95dfffbc0e1cd2779efb8cba',
      },
    },
  }));
}

function writeBaseManifest(root: string, relative: string) {
  const target = path.join(root, 'src/assets/ArtManifest.ts');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `export const ART_MANIFEST = {
    'map.trainingGround.floor': { path: '${relative.replaceAll('\\', '/')}', type: 'background', pack: 'base',
      width: 64, height: 64, transparent: true }
  } as const;`);
}

function resource() {
  return {
    art_key: 'enemy.scrapMouse.normal',
    resource_type: 'enemy',
    pack_name: 'training_ground_v1',
    expected_width: 64,
    expected_height: 64,
    dimension_policy: 'exact',
    required_alpha: true,
    fallback_art_key: 'placeholder.image',
    enabled: true,
  };
}
