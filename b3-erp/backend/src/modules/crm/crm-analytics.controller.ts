import { Controller, Get } from '@nestjs/common';
import { CrmAnalyticsService } from './services/crm-analytics.service';

@Controller('crm/analytics')
export class CrmAnalyticsController {
  constructor(private readonly service: CrmAnalyticsService) {}

  @Get('lead-scoring')
  getLeadScoring() {
    return this.service.getLeadScoring();
  }

  @Get('forecast')
  getForecast() {
    return this.service.getForecast();
  }

  @Get('interaction-analysis')
  getInteractionAnalysis() {
    return this.service.getInteractionAnalysis();
  }

  @Get('customers')
  getCustomerAnalytics() {
    return this.service.getCustomerAnalytics();
  }

  @Get('revenue')
  getRevenueAnalytics() {
    return this.service.getRevenueAnalytics();
  }

  @Get('team')
  getTeamAnalytics() {
    return this.service.getTeamAnalytics();
  }

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('pipeline-forecast')
  getPipelineForecast() {
    return this.service.getPipelineForecast();
  }
}
