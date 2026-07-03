import { Controller, Get } from '@nestjs/common';
import { SalesAnalyticsService } from '../services/sales-analytics.service';

@Controller('sales/analytics')
export class SalesAnalyticsController {
  constructor(private readonly service: SalesAnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }
}
