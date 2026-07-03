import { Controller, Get } from '@nestjs/common';
import { PmAnalyticsService } from '../services/pm-analytics.service';

@Controller('project-management/analytics')
export class PmAnalyticsController {
  constructor(private readonly analyticsService: PmAnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }
}
