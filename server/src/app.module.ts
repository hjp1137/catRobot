import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ContentModule } from './modules/content/content.module';
import { ArtResourcesModule } from './modules/art-resources/art-resources.module';
import { ContentValidationModule } from './modules/content-validation/content-validation.module';
import { ReleasesModule } from './modules/releases/releases.module';
import { HealthModule } from './modules/health/health.module';
import { AnimationClipsModule } from './modules/animation-clips/animation-clips.module';
import { TutorialsModule } from './modules/tutorials/tutorials.module';
import { ImageLibraryModule } from './modules/image-library/image-library.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    ContentModule,
    ArtResourcesModule,
    ContentValidationModule,
    AnimationClipsModule,
    TutorialsModule,
    ImageLibraryModule,
    ReleasesModule,
    HealthModule,
  ],
})
export class AppModule {}
