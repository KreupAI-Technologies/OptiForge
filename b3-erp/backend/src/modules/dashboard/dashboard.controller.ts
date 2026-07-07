import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Cross-module aggregate KPI counts for the root and /dashboard landing pages.
   * GET /api/v1/dashboard/overview
   */
  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
