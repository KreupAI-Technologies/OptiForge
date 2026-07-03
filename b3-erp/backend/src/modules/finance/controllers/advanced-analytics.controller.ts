import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdvancedAnalyticsService } from '../services/advanced-analytics.service';

@ApiTags('Finance - Advanced Analytics')
@Controller('finance/advanced')
export class AdvancedAnalyticsController {
  constructor(private readonly service: AdvancedAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Advanced finance dashboard: general ledger, consolidation, audit-trail, compliance, treasury and cash-forecast summaries aggregated from existing entities',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Advanced finance analytics' })
  async dashboard(): Promise<any> {
    return this.service.getDashboard();
  }
}
