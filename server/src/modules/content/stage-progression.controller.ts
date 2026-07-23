import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { StageProgressionService } from './stage-progression.service';

@Controller('content')
export class StageProgressionController {
  constructor(private readonly progression: StageProgressionService) {}

  @Get('reward-definitions')
  rewardCatalog() { return this.progression.rewardCatalog(); }

  @Get('stages/:stageId/progression')
  get(@Param('stageId') stageId: string) { return this.progression.get(stageId); }

  @Get('stages/:stageId/progression/published')
  published(@Param('stageId') stageId: string) { return this.progression.getPublished(stageId); }

  @Put('stages/:stageId/progression')
  save(@Param('stageId') stageId: string, @Body() body: unknown) { return this.progression.save(stageId, body); }
}
