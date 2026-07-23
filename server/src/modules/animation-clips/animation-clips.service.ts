import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { projectRoot } from '../../common/utils/safe-path';
import { clipData, clipFromRow, clipRefs, containsValue, frameData, validateClip } from './animation-clips.mapper';

@Injectable()
export class AnimationClipsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await (this.prisma as any).contentAnimationClip.findMany({
      where: { deleted_at: null },
      include: { frames: { orderBy: { sort_order: 'asc' } } },
      orderBy: { updated_at: 'desc' },
    });
    return rows.map(clipFromRow);
  }

  async get(clipKey: string) {
    const row = await (this.prisma as any).contentAnimationClip.findFirst({
      where: { clip_key: clipKey, deleted_at: null },
      include: { frames: { orderBy: { sort_order: 'asc' } } },
    });
    if (!row) throw new NotFoundException(clipKey);
    return clipFromRow(row);
  }

  publishedSnapshot() {
    const root = projectRoot();
    const target = path.resolve(root, process.env.ANIMATION_MANIFEST_JSON_PATH ?? 'content-store/published/animation-manifest.snapshot.json');
    const contentTarget = path.resolve(root, process.env.CONTENT_SNAPSHOT_JSON_PATH ?? 'content-store/published/content.snapshot.json');
    if (!target.startsWith(root + path.sep)) throw new ConflictException('ANIMATION_MANIFEST_PATH_INVALID');
    if (!contentTarget.startsWith(root + path.sep)) throw new ConflictException('CONTENT_SNAPSHOT_PATH_INVALID');
    const content = readJson(contentTarget);
    if (!content.ok) return emptyPublishedSnapshot('content-snapshot-missing-or-invalid');
    if (!content.value.animationManifestReleaseId || !content.value.animationManifestChecksum) {
      return emptyPublishedSnapshot('content-snapshot-animation-manifest-not-declared', content.value);
    }
    if (!fs.existsSync(target)) return emptyPublishedSnapshot('animation-manifest-missing', content.value);
    try {
      const snapshot = JSON.parse(fs.readFileSync(target, 'utf8'));
      if (snapshot?.schemaVersion !== 1 || !Array.isArray(snapshot.clips)) return emptyPublishedSnapshot('animation-manifest-invalid', content.value);
      if (snapshot.releaseId !== content.value.animationManifestReleaseId) return emptyPublishedSnapshot('animation-manifest-release-mismatch', content.value);
      if (snapshot.checksum !== content.value.animationManifestChecksum) return emptyPublishedSnapshot('animation-manifest-checksum-mismatch', content.value);
      if (snapshot.checksum !== checksum({ ...snapshot, checksum: '' })) return emptyPublishedSnapshot('animation-manifest-checksum-invalid', content.value);
      return { ...snapshot, enabled: true, reason: 'ok', currentContentRelease: content.value.releaseVersion };
    } catch {
      return emptyPublishedSnapshot('animation-manifest-invalid', content.value);
    }
  }

  async create(body: any) {
    validateClip(body);
    const row = await this.prisma.$transaction(async tx => {
      const clip = await (tx as any).contentAnimationClip.create({ data: clipData(body, true) });
      await (tx as any).contentAnimationFrame.createMany({ data: frameData(clip.id, body.frames) });
      return clip;
    });
    await this.markDraft(row.clip_key, 'create', null, body);
    return this.get(row.clip_key);
  }

  async update(clipKey: string, body: any) {
    validateClip(body);
    const before = await (this.prisma as any).contentAnimationClip.findUnique({ where: { clip_key: clipKey } });
    if (!before || before.deleted_at) throw new NotFoundException(clipKey);
    if (body.rowVersion !== before.row_version) throw new ConflictException('CONTENT_CONFLICT');
    await this.prisma.$transaction(async tx => {
      await (tx as any).contentAnimationFrame.deleteMany({ where: { clip_id: before.id } });
      await (tx as any).contentAnimationFrame.createMany({ data: frameData(before.id, body.frames) });
      await (tx as any).contentAnimationClip.update({ where: { clip_key: clipKey }, data: { ...clipData(body, false), row_version: { increment: 1 } } });
    });
    await this.markDraft(clipKey, 'update', before, body);
    return this.get(clipKey);
  }

  async remove(clipKey: string) {
    const refs = await this.references(clipKey);
    if (refs.length) throw new ConflictException({ code: 'ANIMATION_CLIP_REFERENCE_EXISTS', references: refs });
    const row = await (this.prisma as any).contentAnimationClip.findUnique({ where: { clip_key: clipKey } });
    if (!row || row.deleted_at) throw new NotFoundException(clipKey);
    await (this.prisma as any).contentAnimationClip.update({ where: { clip_key: clipKey }, data: { deleted_at: new Date() } });
    await this.markDraft(clipKey, 'delete', row, null);
    return { ok: true };
  }

  async references(clipKey: string) {
    const [enemies, heroes, snapshots] = await Promise.all([
      this.prisma.contentEnemyTemplate.findMany({ where: { deleted_at: null }, select: { id: true, name: true, visual_json: true } as any }),
      this.prisma.contentHeroVisual.findMany({ where: { deleted_at: null }, select: { id: true, name: true, visual_json: true } as any }),
      this.prisma.contentReleaseSnapshot.findMany({ select: { id: true, release_id: true, snapshot_json: true } as any }),
    ]);
    return [
      ...clipRefs('enemy', enemies, clipKey),
      ...clipRefs('hero', heroes, clipKey),
      ...snapshots.filter((row: any) => containsValue(row.snapshot_json, clipKey)).map((row: any) => ({ type: 'release-snapshot', id: row.id, releaseId: row.release_id })),
    ];
  }

  private async markDraft(entityId: string, action: string, before: any, after: any) {
    await this.prisma.contentSystemState.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', draft_revision: 1, draft_dirty: true },
      update: { draft_revision: { increment: 1 }, draft_dirty: true },
    });
    await this.prisma.contentChangeLog.create({ data: { entity_type: 'animation-clips', entity_id: entityId, action_type: action, before_json: before, after_json: after } });
  }
}

function emptyPublishedSnapshot(reason: string, content?: any) {
  return {
    schemaVersion: 1, releaseId: '', releaseVersion: '', generatedAt: '', checksum: '',
    enabled: false, clips: [], reason, fallback: 'static-art', currentContentRelease: content?.releaseVersion ?? '',
  };
}

function readJson(target: string): { ok: true; value: any } | { ok: false } {
  try {
    if (!fs.existsSync(target)) return { ok: false };
    return { ok: true, value: JSON.parse(fs.readFileSync(target, 'utf8')) };
  } catch {
    return { ok: false };
  }
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
