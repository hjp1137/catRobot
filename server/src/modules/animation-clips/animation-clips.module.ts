import { Module } from '@nestjs/common';
import { AnimationClipsController } from './animation-clips.controller';
import { AnimationClipsService } from './animation-clips.service';

@Module({
  controllers: [AnimationClipsController],
  providers: [AnimationClipsService],
  exports: [AnimationClipsService],
})
export class AnimationClipsModule {}
