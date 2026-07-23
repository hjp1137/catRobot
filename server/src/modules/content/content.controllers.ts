import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ContentCrudService } from './content-crud.service';

function id(query: { id?: string }) {
  return query.id;
}

@Controller('content/enemies')
export class EnemiesController {
  constructor(private readonly crud: ContentCrudService) {}
  @Get() list() { return this.crud.list('enemies'); }
  @Get(':id') get(@Param('id') itemId: string) { return this.crud.get('enemies', itemId); }
  @Post() create(@Body() body: unknown) { return this.crud.create('enemies', body); }
  @Put(':id') update(@Param('id') itemId: string, @Body() body: unknown) { return this.crud.update('enemies', itemId, body); }
  @Post(':id/clone') clone(@Param('id') itemId: string, @Query() query: { id?: string }) { return this.crud.clone('enemies', itemId, id(query)); }
  @Post(':id/enable') enable(@Param('id') itemId: string) { return this.crud.setEnabled('enemies', itemId, true); }
  @Post(':id/disable') disable(@Param('id') itemId: string) { return this.crud.setEnabled('enemies', itemId, false); }
  @Delete(':id') remove(@Param('id') itemId: string) { return this.crud.remove('enemies', itemId); }
  @Get(':id/references') refs(@Param('id') itemId: string) { return this.crud.references('enemies', itemId); }
}

@Controller('content/backgrounds')
export class BackgroundsController {
  constructor(private readonly crud: ContentCrudService) {}
  @Get() list() { return this.crud.list('backgrounds'); }
  @Get(':id') get(@Param('id') itemId: string) { return this.crud.get('backgrounds', itemId); }
  @Post() create(@Body() body: unknown) { return this.crud.create('backgrounds', body); }
  @Put(':id') update(@Param('id') itemId: string, @Body() body: unknown) { return this.crud.update('backgrounds', itemId, body); }
  @Post(':id/clone') clone(@Param('id') itemId: string, @Query() query: { id?: string }) { return this.crud.clone('backgrounds', itemId, id(query)); }
  @Post(':id/enable') enable(@Param('id') itemId: string) { return this.crud.setEnabled('backgrounds', itemId, true); }
  @Post(':id/disable') disable(@Param('id') itemId: string) { return this.crud.setEnabled('backgrounds', itemId, false); }
  @Delete(':id') remove(@Param('id') itemId: string) { return this.crud.remove('backgrounds', itemId); }
  @Get(':id/references') refs(@Param('id') itemId: string) { return this.crud.references('backgrounds', itemId); }
}

@Controller('content/heroes')
export class HeroesController {
  constructor(private readonly crud: ContentCrudService) {}
  @Get() list() { return this.crud.list('heroes'); }
  @Get(':id') get(@Param('id') itemId: string) { return this.crud.get('heroes', itemId); }
  @Post() create(@Body() body: unknown) { return this.crud.create('heroes', body); }
  @Put(':id') update(@Param('id') itemId: string, @Body() body: unknown) { return this.crud.update('heroes', itemId, body); }
  @Post(':id/clone') clone(@Param('id') itemId: string, @Query() query: { id?: string }) { return this.crud.clone('heroes', itemId, id(query)); }
  @Post(':id/enable') enable(@Param('id') itemId: string) { return this.crud.setEnabled('heroes', itemId, true); }
  @Post(':id/disable') disable(@Param('id') itemId: string) { return this.crud.setEnabled('heroes', itemId, false); }
  @Delete(':id') remove(@Param('id') itemId: string) { return this.crud.remove('heroes', itemId); }
  @Get(':id/references') refs(@Param('id') itemId: string) { return this.crud.references('heroes', itemId); }
}
