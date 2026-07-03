import { Controller, Get } from '@nestjs/common';
import { SalesAnalyticsService } from '../services/sales-analytics.service';

@Controller('sales/analytics')
export class SalesAnalyticsController {
  constructor(private readonly service: SalesAnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboard();
  }

  @Get('products')
  getProducts() {
    return this.service.getProducts();
  }

  @Get('customers')
  getCustomers() {
    return this.service.getCustomers();
  }

  @Get('forecast')
  getForecast() {
    return this.service.getForecast();
  }
}
