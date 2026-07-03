import { Controller, Get } from '@nestjs/common';
import { SalesAnalyticsService } from './services/sales-analytics.service';

@Controller('crm/analytics/sales')
export class SalesAnalyticsController {
  constructor(private readonly analyticsService: SalesAnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }
}
