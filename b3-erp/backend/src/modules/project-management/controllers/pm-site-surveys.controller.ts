import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PmSiteSurveysService } from '../services/pm-site-surveys.service';
import { PmSiteSurveyEntity } from '../entities/pm-site-survey.entity';

@Controller('project-management/site-survey')
export class PmSiteSurveysController {
  constructor(private readonly service: PmSiteSurveysService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<PmSiteSurveyEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<PmSiteSurveyEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
