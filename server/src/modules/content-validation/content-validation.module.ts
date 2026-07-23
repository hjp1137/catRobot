import { Module } from '@nestjs/common';
import { ContentValidationController } from './content-validation.controller';
import { ContentValidationService } from './content-validation.service';

@Module({
  controllers: [ContentValidationController],
  providers: [ContentValidationService],
  exports: [ContentValidationService],
})
export class ContentValidationModule {}
