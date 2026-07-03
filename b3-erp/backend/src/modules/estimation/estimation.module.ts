import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BOQController,
  CostEstimateController,
  EstimateAnalyticsController,
  EstimateTemplateController,
  MarkupSettingController,
  PriceListController,
  PricingController,
  ResourceRateController,
  WorkflowStageSettingController,
} from './controllers';
import {
  BOQ,
  BOQItem,
  BOQTemplate,
  CostCategory,
  CostEstimate,
  CostEstimateItem,
  EquipmentRate,
  EstimateAccuracyRecord,
  EstimateApprovalWorkflow,
  EstimateTemplate,
  EstimateVersion,
  EstimatorPerformance,
  HistoricalBenchmark,
  LaborRateCard,
  MarkupRule,
  MarkupSetting,
  MaterialRateCard,
  PriceList,
  Pricing,
  ResourceRate,
  RiskAnalysis,
  SubcontractorRate,
  WinLossRecord,
  WorkflowStageSetting,
} from './entities';
import {
  BOQService,
  CostEstimateService,
  EstimateAnalyticsService,
  EstimateTemplateService,
  MarkupSettingService,
  PriceListService,
  PricingService,
  ResourceRateService,
  WorkflowStageSettingService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // BOQ
      BOQ,
      BOQItem,
      BOQTemplate,
      // Cost Estimate
      CostEstimate,
      CostEstimateItem,
      // Pricing
      Pricing,
      MarkupRule,
      // Settings (orphan pages)
      PriceList,
      MarkupSetting,
      WorkflowStageSetting,
      // Resource Rates
      ResourceRate,
      MaterialRateCard,
      LaborRateCard,
      EquipmentRate,
      SubcontractorRate,
      // Templates & Settings
      EstimateTemplate,
      CostCategory,
      EstimateApprovalWorkflow,
      EstimateVersion,
      // Analytics
      WinLossRecord,
      EstimateAccuracyRecord,
      RiskAnalysis,
      EstimatorPerformance,
      HistoricalBenchmark,
    ]),
  ],
  controllers: [
    BOQController,
    CostEstimateController,
    EstimateAnalyticsController,
    EstimateTemplateController,
    MarkupSettingController,
    PriceListController,
    PricingController,
    ResourceRateController,
    WorkflowStageSettingController,
  ],
  providers: [
    BOQService,
    CostEstimateService,
    EstimateAnalyticsService,
    EstimateTemplateService,
    MarkupSettingService,
    PriceListService,
    PricingService,
    ResourceRateService,
    WorkflowStageSettingService,
  ],
  exports: [
    BOQService,
    CostEstimateService,
    EstimateAnalyticsService,
    EstimateTemplateService,
    MarkupSettingService,
    PriceListService,
    PricingService,
    ResourceRateService,
    WorkflowStageSettingService,
  ],
})
export class EstimationModule {}
