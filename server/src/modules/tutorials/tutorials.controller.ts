import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TutorialsService } from './tutorials.service';

@Controller('content/tutorials')
export class TutorialsController {
  constructor(private readonly tutorials: TutorialsService) {}

  @Get('published') published() { return this.tutorials.getPublished(); }
  @Get('targets') targets() { return this.tutorials.listTargets(); }
  @Get('features') features() { return this.tutorials.listFeatures(); }
  @Get() list() { return this.tutorials.listFlows(); }
  @Post() create(@Body() body: unknown) { return this.tutorials.createFlow(body); }
  @Get(':flowId') get(@Param('flowId') id: string) { return this.tutorials.getFlow(id); }
  @Put(':flowId') update(@Param('flowId') id: string, @Body() body: unknown) { return this.tutorials.updateFlow(id, body); }
  @Delete(':flowId') remove(@Param('flowId') id: string, @Body() body: any) { return this.tutorials.removeFlow(id, body?.rowVersion); }
  @Get(':flowId/steps') steps(@Param('flowId') id: string) { return this.tutorials.listSteps(id); }
  @Post(':flowId/steps') createStep(@Param('flowId') id: string, @Body() body: unknown) { return this.tutorials.createStep(id, body); }
  @Put(':flowId/steps/:stepId') updateStep(@Param('flowId') flowId: string, @Param('stepId') stepId: string, @Body() body: unknown) {
    return this.tutorials.updateStep(flowId, stepId, body);
  }
  @Delete(':flowId/steps/:stepId') removeStep(@Param('flowId') flowId: string, @Param('stepId') stepId: string, @Body() body: any) {
    return this.tutorials.removeStep(flowId, stepId, body?.rowVersion);
  }
  @Put(':flowId/orchestration') orchestration(@Param('flowId') id: string, @Body() body: unknown) {
    return this.tutorials.saveOrchestration(id, body);
  }
}
