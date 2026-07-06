import { Controller, Get, Query } from '@nestjs/common';
import { SpendAnalysisService } from '../services/spend-analysis.service';

// Read-only spend analytics endpoints backed by SpendAnalysisService.
// Dates default to trailing 12 months when not supplied so dashboards can
// call with no params.
@Controller('procurement/spend-analysis')
export class SpendAnalysisController {
  constructor(private readonly service: SpendAnalysisService) {}

  private range(start?: string, end?: string): { start: string; end: string } {
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  }

  @Get('overview')
  getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
    @Query('costCenter') costCenter?: string,
    @Query('vendor') vendor?: string,
    @Query('category') category?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getSpendOverview(start, end, {
      department,
      costCenter,
      vendor,
      category,
    });
  }

  @Get('vendors')
  getVendorAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getVendorAnalysis(start, end);
  }

  @Get('categories')
  getCategoryAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getCategoryAnalysis(start, end);
  }

  @Get('maverick')
  getMaverick(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getMaverickSpending(start, end);
  }

  @Get('savings')
  getSavings(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getSavingsOpportunities(start, end);
  }

  @Get('abc')
  getAbc(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('dimension') dimension?: 'vendor' | 'category' | 'item',
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getABCAnalysis(start, end, dimension ?? 'vendor');
  }

  @Get('trend')
  getTrend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('granularity')
    granularity?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getSpendTrend(start, end, granularity ?? 'monthly');
  }

  @Get('departments')
  getDepartments(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const { start, end } = this.range(startDate, endDate);
    return this.service.getDepartmentSpend(start, end);
  }
}
