import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ImageLibraryController } from './image-library.controller';
import { ImageLibraryService } from './image-library.service';

@Module({ imports: [AuthModule], controllers: [ImageLibraryController], providers: [ImageLibraryService], exports: [ImageLibraryService] })
export class ImageLibraryModule {}
