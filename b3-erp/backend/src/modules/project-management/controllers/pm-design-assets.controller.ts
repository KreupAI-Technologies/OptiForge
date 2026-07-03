import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmDesignAssetsService } from '../services/pm-design-assets.service';
import { PmDesignAssetEntity } from '../entities/pm-design-asset.entity';

@Controller('project-management/design-assets')
export class PmDesignAssetsController {
  constructor(private readonly service: PmDesignAssetsService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmDesignAssetEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmDesignAssetEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
