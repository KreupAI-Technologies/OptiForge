import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CashAnalyticsService } from '../services/cash-analytics.service';

@ApiTags('Finance - Cash Analytics')
@Controller('finance/cash')
export class CashAnalyticsController {
  constructor(private readonly service: CashAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Cash dashboard: stats, recent transactions, forecast',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cash dashboard data' })
  async dashboard(): Promise<any> {
    return this.service.getDashboard();
  }
}
