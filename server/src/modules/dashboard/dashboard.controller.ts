import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('content/dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    const [enemies, enabledEnemies, backgrounds, heroes, fixedStages, exploreStages, resources, state, release] = await Promise.all([
      this.prisma.contentEnemyTemplate.count({ where: { deleted_at: null } }),
      this.prisma.contentEnemyTemplate.count({ where: { deleted_at: null, enabled: true } }),
      this.prisma.contentBackgroundTheme.count({ where: { deleted_at: null } }),
      this.prisma.contentHeroVisual.count({ where: { deleted_at: null } }),
      this.prisma.contentStage.count({ where: { deleted_at: null, mode: 'fixed_battle' } }),
      this.prisma.contentStage.count({ where: { deleted_at: null, mode: 'explore' } }),
      this.prisma.contentArtResource.groupBy({ by: ['resource_status'], _count: true }),
      this.prisma.contentSystemState.findUnique({ where: { id: 'singleton' } }),
      this.prisma.contentRelease.findFirst({ where: { status: 'published' }, orderBy: { published_at: 'desc' } }),
    ]);
    return { enemies, enabledEnemies, backgrounds, heroes, fixedStages, exploreStages, resources, state, release };
  }
}
