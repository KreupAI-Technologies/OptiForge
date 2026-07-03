import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SiteIssuesService } from '../services/site-issues.service';
import { SiteIssueEntity } from '../entities/site-issue.entity';

@Controller('project-management/site-issues')
export class SiteIssuesController {
  constructor(private readonly service: SiteIssuesService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('status') status?: string) {
    return this.service.findAll(companyId || 'default', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<SiteIssueEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<SiteIssueEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
