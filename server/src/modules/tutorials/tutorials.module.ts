import { Module } from '@nestjs/common';
import { TutorialsController } from './tutorials.controller';
import { TutorialsService } from './tutorials.service';
import { TutorialTargetCatalog } from './tutorial-target.catalog';
import { TutorialFeatureCatalog } from './tutorial-feature.catalog';

@Module({ controllers: [TutorialsController], providers: [TutorialsService, TutorialTargetCatalog, TutorialFeatureCatalog],
  exports: [TutorialsService, TutorialTargetCatalog, TutorialFeatureCatalog] })
export class TutorialsModule {}
