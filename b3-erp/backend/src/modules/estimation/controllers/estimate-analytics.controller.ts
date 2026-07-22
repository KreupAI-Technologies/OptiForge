import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  EstimateAccuracyRecord,
  EstimatorPerformance,
  HistoricalBenchmark,
  RiskAnalysis,
  WinLossRecord,
} from '../entities/estimate-analytics.entity';
import { EstimateAnalyticsService } from '../services/estimate-analytics.service';

@Controller('estimation/analytics')
export class EstimateAnalyticsController {
  constructor(
    private readonly estimateAnalyticsService: EstimateAnalyticsService,
  ) {}

  // Win/Loss Analysis
  @Post('win-loss')
  createWinLossRecord(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<WinLossRecord>,
  ): Promise<WinLossRecord> {
    return this.estimateAnalyticsService.createWinLossRecord(companyId, data);
  }

  @Patch('win-loss/:id')
  updateWinLossRecord(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<WinLossRecord>,
  ): Promise<WinLossRecord> {
    return this.estimateAnalyticsService.updateWinLossRecord(
      companyId,
      id,
      data,
    );
  }

  @Get('win-loss/analysis')
  getWinLossAnalysis(
    @Headers('x-company-id') companyId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.estimateAnalyticsService.getWinLossAnalysis(
      companyId,
      fromDate,
      toDate,
    );
  }

  // Accuracy Analysis
  @Post('accuracy')
  createAccuracyRecord(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<EstimateAccuracyRecord>,
  ): Promise<EstimateAccuracyRecord> {
    return this.estimateAnalyticsService.createAccuracyRecord(companyId, data);
  }

  @Patch('accuracy/:id')
  updateAccuracyRecord(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<EstimateAccuracyRecord>,
  ): Promise<EstimateAccuracyRecord> {
    return this.estimateAnalyticsService.updateAccuracyRecord(
      companyId,
      id,
      data,
    );
  }

  @Get('accuracy/analysis')
  getAccuracyAnalysis(
    @Headers('x-company-id') companyId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.estimateAnalyticsService.getAccuracyAnalysis(
      companyId,
      fromDate,
      toDate,
    );
  }

  // Risk Analysis
  @Post('risk')
  createRiskAnalysis(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<RiskAnalysis>,
  ): Promise<RiskAnalysis> {
    return this.estimateAnalyticsService.createRiskAnalysis(companyId, data);
  }

  @Get('risk/by-estimate/:estimateId')
  findRiskAnalysisByEstimate(
    @Headers('x-company-id') companyId: string,
    @Param('estimateId') estimateId: string,
  ): Promise<RiskAnalysis | null> {
    return this.estimateAnalyticsService.findRiskAnalysisByEstimate(
      companyId,
      estimateId,
    );
  }

  @Patch('risk/:id')
  updateRiskAnalysis(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<RiskAnalysis>,
  ): Promise<RiskAnalysis> {
    return this.estimateAnalyticsService.updateRiskAnalysis(
      companyId,
      id,
      data,
    );
  }

  // Estimator Performance
  @Post('performance/update')
  updateEstimatorPerformance(
    @Headers('x-company-id') companyId: string,
    @Body()
    data: {
      estimatorId: string;
      estimatorName: string;
      year: number;
      month: number;
    },
  ): Promise<EstimatorPerformance> {
    return this.estimateAnalyticsService.updateEstimatorPerformance(
      companyId,
      data.estimatorId,
      data.estimatorName,
      data.year,
      data.month,
    );
  }

  @Get('performance/estimator/:estimatorId')
  getEstimatorPerformance(
    @Headers('x-company-id') companyId: string,
    @Param('estimatorId') estimatorId: string,
    @Query('year') year: string,
  ): Promise<EstimatorPerformance[]> {
    return this.estimateAnalyticsService.getEstimatorPerformance(
      companyId,
      estimatorId,
      parseInt(year),
    );
  }

  @Get('performance/all')
  getAllEstimatorsPerformance(
    @Headers('x-company-id') companyId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<EstimatorPerformance[]> {
    return this.estimateAnalyticsService.getAllEstimatorsPerformance(
      companyId,
      parseInt(year),
      parseInt(month),
    );
  }

  // Category Performance — real aggregation of estimates by category
  @Get('category-performance')
  getCategoryPerformance(@Headers('x-company-id') companyId: string) {
    return this.estimateAnalyticsService.getCategoryPerformance(companyId);
  }

  // Historical Benchmarks
  @Post('benchmarks')
  createBenchmark(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<HistoricalBenchmark>,
  ): Promise<HistoricalBenchmark> {
    return this.estimateAnalyticsService.createBenchmark(companyId, data);
  }

  @Get('benchmarks/all')
  findBenchmarks(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
  ): Promise<HistoricalBenchmark[]> {
    return this.estimateAnalyticsService.findBenchmarks(companyId, {
      category,
      subCategory,
    });
  }

  @Patch('benchmarks/:id')
  updateBenchmark(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<HistoricalBenchmark>,
  ): Promise<HistoricalBenchmark> {
    return this.estimateAnalyticsService.updateBenchmark(companyId, id, data);
  }

  @Post('benchmarks/calculate')
  calculateBenchmarksFromHistory(
    @Headers('x-company-id') companyId: string,
    @Body() data: { category: string; metricName: string },
  ): Promise<HistoricalBenchmark> {
    return this.estimateAnalyticsService.calculateBenchmarksFromHistory(
      companyId,
      data.category,
      data.metricName,
    );
  }
}
