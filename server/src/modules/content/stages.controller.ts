import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { StagesService } from './stages.service';

@Controller('content/stages')
export class StagesController {
  constructor(private readonly stages: StagesService) {}

  @Get() list() { return this.stages.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.stages.get(id); }
  @Post() create(@Body() body: unknown) { return this.stages.create(body); }
  @Put(':id') update(@Param('id') id: string, @Body() body: unknown) { return this.stages.update(id, body); }
  @Post(':id/clone') clone(@Param('id') id: string, @Query('id') newId?: string) { return this.stages.clone(id, newId); }
  @Post(':id/enable') enable(@Param('id') id: string) { return this.stages.setEnabled(id, true); }
  @Post(':id/disable') disable(@Param('id') id: string) { return this.stages.setEnabled(id, false); }
  @Delete(':id') remove(@Param('id') id: string) { return this.stages.remove(id); }
}
