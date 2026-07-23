import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReleasesService } from './releases.service';

@Controller('content')
export class ReleasesController {
  constructor(private readonly releases: ReleasesService) {}

  @Post('publish')
  @UseGuards(JwtAuthGuard)
  publish(@Req() req: { user?: { id?: string } }) { return this.releases.publish(req.user?.id); }
  @Get('publish-status') status() { return this.releases.status(); }
  @Get('releases') list() { return this.releases.list(); }
  @Get('releases/:id') get(@Param('id') id: string) { return this.releases.get(id); }
  @Post('releases/:id/restore')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) { return this.releases.restore(id); }
  @Get('releases/:id/snapshot') snapshot(@Param('id') id: string) { return this.releases.snapshot(id); }
}
