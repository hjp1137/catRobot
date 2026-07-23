import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  ok() {
    return { ok: true };
  }

  @Get('database')
  async database() {
    const version = await this.prisma.$queryRawUnsafe('SELECT VERSION() as version');
    const database = await this.prisma.$queryRawUnsafe('SELECT DATABASE() as database_name');
    const charset = await this.prisma.$queryRawUnsafe("SHOW VARIABLES LIKE 'character_set_database'");
    const collation = await this.prisma.$queryRawUnsafe("SHOW VARIABLES LIKE 'collation_database'");
    return { version, database, charset, collation };
  }
}
