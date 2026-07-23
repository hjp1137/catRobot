import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ArtResourcesService } from './art-resources.service';

@Controller('content/resources')
@UseGuards(JwtAuthGuard)
export class ArtResourcesController {
  constructor(private readonly resources: ArtResourcesService) {}

  @Get()
  list(@Query() query: any) {
    return this.resources.list(query);
  }

  @Post()
  create(@Body() body: unknown, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.createResource(body, req.user?.id);
  }

  @Post('create-with-version')
  @UseInterceptors(FileInterceptor('file'))
  createWithVersion(@Body() body: unknown, @UploadedFile() file: any, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.createResourceWithVersion(body, file, req.user?.id);
  }

  @Get(':artKey/thumbnail')
  async artKeyThumbnail(@Param('artKey') artKey: string, @Res() res: any) {
    const file = await this.resources.fileForArtKey(artKey, 'thumbnail');
    res.type(file.mime);
    return res.sendFile(file.path);
  }

  @Get(':artKey/preview')
  async preview(@Param('artKey') artKey: string, @Res() res: any) {
    const file = await this.resources.fileForArtKey(artKey, 'preview');
    res.type(file.mime);
    return res.sendFile(file.path);
  }

  @Get(':artKey')
  async get(@Param('artKey') artKey: string) {
    return this.resources.get(artKey);
  }

  @Put(':artKey')
  update(@Param('artKey') artKey: string, @Body() body: unknown, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.updateResource(artKey, body, req.user?.id);
  }

  @Post(':artKey/versions')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('artKey') artKey: string, @UploadedFile() file: any, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.uploadVersion(artKey, file, req.user?.id);
  }

  @Post(':artKey/versions/from-library')
  fromLibrary(@Param('artKey') artKey: string, @Body() body: unknown, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.createVersionFromLibrary(artKey, body, req.user?.id);
  }

  @Get(':artKey/versions')
  versions(@Param('artKey') artKey: string) {
    return this.resources.versions(artKey);
  }

  @Get(':artKey/versions/:versionId')
  version(@Param('artKey') artKey: string, @Param('versionId') versionId: string) {
    return this.resources.versions(artKey).then(rows => rows.find((row: any) => row.id === versionId) ?? Promise.reject(new NotFoundException(versionId)));
  }

  @Post(':artKey/versions/:versionId/select-draft')
  selectDraft(@Param('artKey') artKey: string, @Param('versionId') versionId: string, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.selectDraft(artKey, versionId, req.user?.id);
  }

  @Delete(':artKey/versions/:versionId')
  removeDraft(@Param('artKey') artKey: string, @Param('versionId') versionId: string, @Req() req: any) {
    assertRole(req.user, ['admin', 'editor']);
    return this.resources.removeDraftVersion(artKey, versionId, req.user?.id);
  }

  @Get(':artKey/references')
  references(@Param('artKey') artKey: string) {
    return this.resources.references(artKey);
  }

  @Get(':artKey/versions/:versionId/thumbnail')
  async thumbnail(@Param('artKey') artKey: string, @Param('versionId') versionId: string, @Res() res: any) {
    const file = await this.resources.fileForVersion(artKey, versionId, 'thumbnail');
    res.type(file.mime);
    return res.sendFile(file.path);
  }

  @Get(':artKey/versions/:versionId/preview')
  async versionPreview(@Param('artKey') artKey: string, @Param('versionId') versionId: string, @Res() res: any) {
    const file = await this.resources.fileForVersion(artKey, versionId, 'preview');
    res.type(file.mime);
    return res.sendFile(file.path);
  }

}

function assertRole(user: any, roles: string[]): void {
  if (!roles.includes(user?.role)) throw new ForbiddenException('没有权限执行该操作。');
}
