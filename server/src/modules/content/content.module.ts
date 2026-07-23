import { Module } from '@nestjs/common';
import { ContentCrudService } from './content-crud.service';
import { StagesService } from './stages.service';
import { EnemiesController, BackgroundsController, HeroesController } from './content.controllers';
import { StagesController } from './stages.controller';
import { StageOrchestrationController } from './stage-orchestration.controller';
import { StageOrchestrationService } from './stage-orchestration.service';
import { StageProgressionController } from './stage-progression.controller';
import { StageProgressionService } from './stage-progression.service';
import { CampaignChaptersController, CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';

@Module({
  controllers: [EnemiesController, BackgroundsController, HeroesController, StagesController, StageOrchestrationController, StageProgressionController, CampaignsController, CampaignChaptersController],
  providers: [ContentCrudService, StagesService, StageOrchestrationService, StageProgressionService, CampaignsService],
  exports: [ContentCrudService, StagesService, StageOrchestrationService, StageProgressionService, CampaignsService],
})
export class ContentModule {}
