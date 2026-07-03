import { Controller, Get, Headers } from '@nestjs/common';
import { CPQAnalyticsDashboardsService } from '../services/cpq-analytics-dashboards.service';

/**
 * Read-only dashboard endpoints that aggregate the existing cpq_quotes /
 * cpq_quote_items tables into the exact shapes the analytics pages render.
 * No new tables are created for these routes.
 */
@Controller('cpq/analytics/dashboards')
export class CPQAnalyticsDashboardsController {
  constructor(
    private readonly service: CPQAnalyticsDashboardsService,
  ) {}

  @Get('win-rate')
  getWinRate(@Headers('x-company-id') companyId: string) {
    return this.service.getWinRateDashboard(companyId);
  }

  @Get('quotes')
  getQuotes(@Headers('x-company-id') companyId: string) {
    return this.service.getQuotesDashboard(companyId);
  }

  @Get('discounts')
  getDiscounts(@Headers('x-company-id') companyId: string) {
    return this.service.getDiscountsDashboard(companyId);
  }

  @Get('sales-cycle')
  getSalesCycle(@Headers('x-company-id') companyId: string) {
    return this.service.getSalesCycleDashboard(companyId);
  }

  @Get('pricing')
  getPricing(@Headers('x-company-id') companyId: string) {
    return this.service.getPricingDashboard(companyId);
  }

  @Get('products')
  getProducts(@Headers('x-company-id') companyId: string) {
    return this.service.getProductsDashboard(companyId);
  }
}
