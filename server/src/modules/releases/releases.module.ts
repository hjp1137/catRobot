import { Module } from '@nestjs/common';
import { SnapshotGeneratorService } from '../../infrastructure/snapshot-generator/snapshot-generator.service';
import { ContentValidationModule } from '../content-validation/content-validation.module';
import { AuthModule } from '../auth/auth.module';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

@Module({
  imports: [AuthModule, ContentValidationModule],
  controllers: [ReleasesController],
  providers: [ReleasesService, SnapshotGeneratorService],
})
export class ReleasesModule {}
