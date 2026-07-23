import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ArtResourcesController } from './art-resources.controller';
import { ArtResourcesService } from './art-resources.service';

@Module({
  imports: [AuthModule],
  controllers: [ArtResourcesController],
  providers: [ArtResourcesService],
  exports: [ArtResourcesService],
})
export class ArtResourcesModule {}
