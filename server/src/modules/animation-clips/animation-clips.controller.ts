import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AnimationClipsService } from './animation-clips.service';

@Controller('content/animations')
export class AnimationClipsController {
  constructor(private readonly clips: AnimationClipsService) {}

  @Get() list() { return this.clips.list(); }
  @Get('published') published() { return this.clips.publishedSnapshot(); }
  @Get(':clipKey') get(@Param('clipKey') clipKey: string) { return this.clips.get(clipKey); }
  @Post() create(@Body() body: unknown) { return this.clips.create(body); }
  @Put(':clipKey') update(@Param('clipKey') clipKey: string, @Body() body: unknown) { return this.clips.update(clipKey, body); }
  @Delete(':clipKey') remove(@Param('clipKey') clipKey: string) { return this.clips.remove(clipKey); }
  @Get(':clipKey/references') references(@Param('clipKey') clipKey: string) { return this.clips.references(clipKey); }
}
