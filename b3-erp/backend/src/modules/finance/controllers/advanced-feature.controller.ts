import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AdvancedFeatureService } from '../services/advanced-feature.service';
import { AdvancedFeature } from '../entities/advanced-feature.entity';

@Controller('finance/advanced-features')
export class AdvancedFeatureController {
  constructor(private readonly service: AdvancedFeatureService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId || 'default');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<AdvancedFeature>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<AdvancedFeature>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
