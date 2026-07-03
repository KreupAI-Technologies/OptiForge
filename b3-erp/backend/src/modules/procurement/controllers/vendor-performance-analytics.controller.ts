import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VendorPerformanceAnalyticsService } from '../services/vendor-performance-analytics.service';

@Controller('procurement/vendor-performance')
export class VendorPerformanceAnalyticsController {
  constructor(
    private readonly service: VendorPerformanceAnalyticsService,
  ) {}

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Query('category') category?: string) {
    return this.service.getVendorMetrics(category);
  }
}
