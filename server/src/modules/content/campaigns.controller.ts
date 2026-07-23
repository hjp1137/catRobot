import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('content/campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get('published') published() { return this.campaigns.getPublished(); }
  @Get() list() { return this.campaigns.listCampaigns(); }
  @Post() create(@Body() body: unknown) { return this.campaigns.createCampaign(body); }
  @Get(':campaignId') get(@Param('campaignId') id: string) { return this.campaigns.getCampaign(id); }
  @Put(':campaignId') update(@Param('campaignId') id: string, @Body() body: unknown) { return this.campaigns.updateCampaign(id, body); }
  @Post(':campaignId/clone') clone(@Param('campaignId') id: string, @Body() body: any) { return this.campaigns.cloneCampaign(id, body?.id); }
  @Post(':campaignId/enable') enable(@Param('campaignId') id: string, @Body() body: any) { return this.campaigns.setCampaignEnabled(id, true, body?.rowVersion); }
  @Post(':campaignId/disable') disable(@Param('campaignId') id: string, @Body() body: any) { return this.campaigns.setCampaignEnabled(id, false, body?.rowVersion); }
  @Delete(':campaignId') remove(@Param('campaignId') id: string, @Body() body: any) { return this.campaigns.removeCampaign(id, body?.rowVersion); }
  @Get(':campaignId/chapters') chapters(@Param('campaignId') id: string) { return this.campaigns.listChapters(id); }
  @Post(':campaignId/chapters') createChapter(@Param('campaignId') id: string, @Body() body: unknown) { return this.campaigns.createChapter(id, body); }
  @Post(':campaignId/chapters/reorder') reorderChapters(@Param('campaignId') id: string, @Body() body: unknown) { return this.campaigns.reorderChapters(id, body); }
}

@Controller('content/chapters')
export class CampaignChaptersController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get(':chapterId/map') map(@Param('chapterId') id: string) { return this.campaigns.getChapterMap(id); }
  @Put(':chapterId') update(@Param('chapterId') id: string, @Body() body: unknown) { return this.campaigns.updateChapter(id, body); }
  @Post(':chapterId/clone') clone(@Param('chapterId') id: string, @Body() body: any) { return this.campaigns.cloneChapter(id, body?.id); }
  @Post(':chapterId/enable') enable(@Param('chapterId') id: string, @Body() body: any) { return this.campaigns.setChapterEnabled(id, true, body?.rowVersion); }
  @Post(':chapterId/disable') disable(@Param('chapterId') id: string, @Body() body: any) { return this.campaigns.setChapterEnabled(id, false, body?.rowVersion); }
  @Put(':chapterId/map') saveMap(@Param('chapterId') id: string, @Body() body: unknown) { return this.campaigns.saveChapterMap(id, body); }
  @Delete(':chapterId') remove(@Param('chapterId') id: string, @Body() body: any) { return this.campaigns.removeChapter(id, body?.rowVersion); }
}
