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
}
