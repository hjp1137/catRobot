import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { TutorialFeatureCatalog } from './tutorial-feature.catalog';
import { TUTORIAL_STATIC_TARGETS } from '../../../../shared/tutorial-catalog';

@Injectable()
export class TutorialTargetCatalog {
  constructor(private readonly prisma: PrismaService,
    private readonly features: TutorialFeatureCatalog = new TutorialFeatureCatalog()) {}

  async list() {
    const db = this.prisma as any;
    const [stages, campaigns, art] = await Promise.all([
      db.contentStage?.findMany?.({ where: { enabled: true, deleted_at: null }, select: { id: true, name: true } }) ?? [],
      db.contentCampaign?.findMany?.({ where: { enabled: true, deleted_at: null }, select: { id: true, name: true } }) ?? [],
      db.contentArtResource?.findMany?.({ where: { enabled: true, deleted_at: null }, select: { art_key: true } }) ?? [],
    ]);
    return [
      ...TUTORIAL_STATIC_TARGETS.map(([type, id, name]) => ({ type, id, name })),
      ...stages.map((row: any) => ({ type: 'stage', id: row.id, name: row.name })),
      ...campaigns.map((row: any) => ({ type: 'campaign', id: row.id, name: row.name })),
      ...art.map((row: any) => ({ type: 'art', id: row.art_key, name: row.art_key })),
      ...this.features.list().map(row => ({ type: 'feature', id: row.id, name: row.name })),
    ];
  }

  async require(type: string, id: string) {
    const db = this.prisma as any;
    if (type === 'ui' || type === 'canvas') {
      if (!TUTORIAL_STATIC_TARGETS.some(target => target[0] === type && target[1] === id)) this.fail(type, id);
      return;
    }
    if (type === 'feature') { this.features.require(id); return; }
    const delegates: Record<string, [any, any]> = {
      stage: [db.contentStage, { id }], campaign: [db.contentCampaign, { id }], art: [db.contentArtResource, { art_key: id }],
    };
    const [delegate, where] = delegates[type] ?? [];
    if (!delegate) this.fail(type, id);
    const row = await delegate.findUnique({ where });
    if (!row || row.deleted_at || !row.enabled || type === 'art' && ['missing', 'invalid'].includes(row.resource_status)) this.fail(type, id);
  }

  private fail(type: string, id: string): never {
    const code = type === 'ui' ? 'TUTORIAL_UI_TARGET_INVALID' : type === 'canvas' ? 'TUTORIAL_CANVAS_TARGET_INVALID' : `TUTORIAL_${type.toUpperCase()}_REFERENCE_INVALID`;
    throw new BadRequestException({ code, targetType: type, targetId: id });
  }
}
