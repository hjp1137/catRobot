import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BatchImageVariantDto, CreateImageVariantDto, ImageLibraryQueryDto, RenameImageLibraryAssetDto } from './image-library.dto';
import { ImageLibraryService } from './image-library.service';

@Controller('content/image-library') @UseGuards(JwtAuthGuard)
export class ImageLibraryController {
  constructor(private readonly images: ImageLibraryService) {}
  @Get() list(@Query() query: ImageLibraryQueryDto) { return this.images.list(query); }
  @Post('upload') @UseInterceptors(FileInterceptor('file')) upload(@UploadedFile() file: any, @Req() req: any) { edit(req); return this.images.upload(file, req.user?.id); }
  @Post('upload-batch') @UseInterceptors(FilesInterceptor('files', 96)) async uploadBatch(@UploadedFiles() files: any[], @Req() req: any) { edit(req); const results = await Promise.all((files ?? []).map(async file => { try { return { ok: true, file: file.originalname, result: await this.images.upload(file, req.user?.id) }; } catch (error: any) { return { ok: false, file: file.originalname, error: error.message }; } })); return { results, succeeded: results.filter(x => x.ok).length, failed: results.filter(x => !x.ok).length }; }
  @Post('variants/batch') batchVariant(@Body() dto: BatchImageVariantDto, @Req() req: any) { edit(req); return this.images.createVariants(dto.assetIds, dto, req.user?.id); }
  @Get(':assetId') get(@Param('assetId') id: string) { return this.images.get(id); }
  @Patch(':assetId') rename(@Param('assetId') id: string, @Body() dto: RenameImageLibraryAssetDto, @Req() req: any) { edit(req); return this.images.rename(id, dto.displayName); }
  @Post(':assetId/variants') variant(@Param('assetId') id: string, @Body() dto: CreateImageVariantDto, @Req() req: any) { edit(req); return this.images.createVariant(id, dto, req.user?.id); }
  @Get(':assetId/variants/:variantId/thumbnail') async variantThumbnail(@Param('assetId') id: string, @Param('variantId') variantId: string, @Res() res: any) { const file = await this.images.variantFile(id, variantId); res.type(file.mime); return res.sendFile(file.path); }
  @Get(':assetId/variants/:variantId/preview') async variantPreview(@Param('assetId') id: string, @Param('variantId') variantId: string, @Res() res: any) { const file = await this.images.variantFile(id, variantId, false); res.type(file.mime); return res.sendFile(file.path); }
  @Delete(':assetId/variants/:variantId') archiveVariant(@Param('assetId') id: string, @Param('variantId') variantId: string, @Req() req: any) { edit(req); return this.images.archiveVariant(id, variantId); }
  @Get(':assetId/thumbnail') async thumbnail(@Param('assetId') id: string, @Res() res: any) { const file = await this.images.file(id); res.type(file.mime); return res.sendFile(file.path); }
  @Get(':assetId/preview') async preview(@Param('assetId') id: string, @Res() res: any) { const file = await this.images.file(id, false); res.type(file.mime); return res.sendFile(file.path); }
  @Delete(':assetId') archive(@Param('assetId') id: string, @Req() req: any) { edit(req); return this.images.archive(id); }
}
function edit(req: any) { if (!['admin', 'editor'].includes(req.user?.role)) throw new ForbiddenException('没有权限执行该操作。'); }
