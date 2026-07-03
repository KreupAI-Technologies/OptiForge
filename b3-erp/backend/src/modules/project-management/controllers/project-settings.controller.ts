import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { ProjectSettingsService } from '../services/project-settings.service';
import { ProjectSettingsEntity } from '../entities/project-settings.entity';

@Controller('project-management/settings')
export class ProjectSettingsController {
  constructor(private readonly settingsService: ProjectSettingsService) {}

  @Get()
  get(@Query('companyId') companyId?: string) {
    return this.settingsService.findOne(companyId || 'default');
  }

  @Put()
  update(
    @Body() body: Partial<ProjectSettingsEntity>,
    @Query('companyId') companyId?: string,
  ) {
    return this.settingsService.upsert(companyId || body.companyId || 'default', body);
  }
}
