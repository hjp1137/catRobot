import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { StageOrchestrationService } from './stage-orchestration.service';

@Controller('content/stages/:stageId')
export class StageOrchestrationController {
  constructor(private readonly orchestration: StageOrchestrationService) {}

  @Get('orchestration')
  getOrchestration(@Param('stageId') stageId: string) {
    return this.orchestration.getOrchestration(stageId);
  }

  @Get('orchestration/published')
  getPublishedOrchestration(@Param('stageId') stageId: string) {
    return this.orchestration.getPublishedOrchestration(stageId);
  }

  @Put('orchestration')
  saveOrchestration(@Param('stageId') stageId: string, @Body() body: unknown) {
    return this.orchestration.saveOrchestration(stageId, body);
  }

  @Get('layout')
  async getLayout(@Param('stageId') stageId: string) {
    return (await this.orchestration.getOrchestration(stageId)).layout;
  }

  @Put('layout')
  saveLayout(@Param('stageId') stageId: string, @Body() body: any) {
    return this.orchestration.saveOrchestration(stageId, body);
  }

  @Get('layers')
  async layers(@Param('stageId') stageId: string) {
    return (await this.orchestration.getOrchestration(stageId)).layers;
  }

  @Get('spawn-points')
  async spawnPoints(@Param('stageId') stageId: string) {
    return (await this.orchestration.getOrchestration(stageId)).spawnPoints;
  }

  @Delete('spawn-points/:spawnPointId')
  removeSpawnPoint(@Param('stageId') stageId: string, @Param('spawnPointId') spawnPointId: string) {
    return this.orchestration.removeSpawnPoint(stageId, spawnPointId);
  }

  @Get('waves')
  async waves(@Param('stageId') stageId: string) {
    return (await this.orchestration.getOrchestration(stageId)).waves;
  }
}
