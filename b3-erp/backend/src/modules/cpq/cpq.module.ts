import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  // Product Configuration
  CPQProduct,
  ProductOption,
  ProductBundle,
  BundleItem,
  ConfigurationRule,
  CompatibilityRule,
  ProductConfiguration,
  // Pricing Engine
  PricingRule,
  VolumeDiscount,
  CustomerPricing,
  ContractPricing,
  PromotionalPricing,
  DynamicPricingRule,
  // Quote
  Quote,
  QuoteItem,
  QuoteTemplate,
  QuoteVersion,
  // Guided Selling
  SalesPlaybook,
  RecommendationRule,
  SalesQuestionnaire,
  QuestionnaireResponse,
  RecommendationEvent,
  // Proposal & Contract
  Proposal,
  ProposalTemplate,
  ContentLibraryItem,
  Contract,
  ContractTemplate,
  ContractClause,
  // Analytics
  QuoteAnalytics,
  CPQWinLossRecord,
  PricingAnalytics,
  SalesCycleAnalytics,
  DiscountAnalytics,
  ProductPerformance,
  // Settings
  CPQSettings,
  CPQUserPermission,
  CPQApprovalWorkflow,
  CPQApprovalRequest,
  CPQNotificationSetting,
  CPQIntegration,
} from './entities';
import { CPQApprovalItem } from './entities/cpq-approval-item.entity';
import {
  CPQPricingVersion,
  CPQApprovalMatrixRule,
} from './entities/cpq-advanced.entity';
import {
  CPQGuidedSellingQuestion,
  CPQMarginGuardrail,
} from './entities/cpq-advanced2.entity';
import {
  CPQConfigRuleItem,
  CPQCompatibilityEntry,
  CPQCrossSellRule,
  CPQRecommendation,
  CPQCodeListItem,
  CPQIntegrationSyncLog,
} from './entities/cpq-orphans.entity';
import {
  CPQWorkflowRequest,
  CPQQuoteVersionRow,
  CPQNotificationSettingRow,
  CPQPermissionRole,
  CPQIntegrationEndpoint,
  CPQConfigStep,
} from './entities/cpq-orphans-2.entity';

// Services
import {
  ProductConfigurationService,
  PricingEngineService,
  QuoteService,
  GuidedSellingService,
  ProposalContractService,
  CPQAnalyticsService,
  CPQSettingsService,
} from './services';
import { CPQApprovalItemService } from './services/cpq-approval-item.service';
import {
  CPQPricingVersionService,
  CPQApprovalMatrixService,
} from './services/cpq-advanced.service';
import {
  CPQGuidedSellingQuestionService,
  CPQMarginGuardrailService,
} from './services/cpq-advanced2.service';
import { CPQAnalyticsDashboardsService } from './services/cpq-analytics-dashboards.service';
import {
  CPQConfigRuleItemService,
  CPQCompatibilityEntryService,
  CPQCrossSellRuleService,
  CPQRecommendationService,
  CPQCodeListItemService,
  CPQIntegrationSyncLogService,
} from './services/cpq-orphans.service';
import {
  CPQWorkflowRequestService,
  CPQQuoteVersionRowService,
  CPQNotificationSettingRowService,
  CPQPermissionRoleService,
  CPQIntegrationEndpointService,
  CPQConfigStepService,
} from './services/cpq-orphans-2.service';

// Controllers
import {
  ProductConfigurationController,
  PricingEngineController,
  QuoteController,
  GuidedSellingController,
  ProposalContractController,
  CPQAnalyticsController,
  CPQSettingsController,
} from './controllers';
import { CPQApprovalItemController } from './controllers/cpq-approval-item.controller';
import {
  CPQPricingVersionController,
  CPQApprovalMatrixController,
} from './controllers/cpq-advanced.controller';
import {
  CPQGuidedSellingQuestionController,
  CPQMarginGuardrailController,
} from './controllers/cpq-advanced2.controller';
import { CPQAnalyticsDashboardsController } from './controllers/cpq-analytics-dashboards.controller';
import {
  CPQConfigRuleItemController,
  CPQCompatibilityEntryController,
  CPQCrossSellRuleController,
  CPQRecommendationController,
  CPQCodeListItemController,
  CPQIntegrationSyncLogController,
} from './controllers/cpq-orphans.controller';
import {
  CPQWorkflowRequestController,
  CPQQuoteVersionRowController,
  CPQNotificationSettingRowController,
  CPQPermissionRoleController,
  CPQIntegrationEndpointController,
  CPQConfigStepController,
} from './controllers/cpq-orphans-2.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Product Configuration
      CPQProduct,
      ProductOption,
      ProductBundle,
      BundleItem,
      ConfigurationRule,
      CompatibilityRule,
      ProductConfiguration,
      // Pricing Engine
      PricingRule,
      VolumeDiscount,
      CustomerPricing,
      ContractPricing,
      PromotionalPricing,
      DynamicPricingRule,
      // Quote
      Quote,
      QuoteItem,
      QuoteTemplate,
      QuoteVersion,
      // Guided Selling
      SalesPlaybook,
      RecommendationRule,
      SalesQuestionnaire,
      QuestionnaireResponse,
      RecommendationEvent,
      // Proposal & Contract
      Proposal,
      ProposalTemplate,
      ContentLibraryItem,
      Contract,
      ContractTemplate,
      ContractClause,
      // Analytics
      QuoteAnalytics,
      CPQWinLossRecord,
      PricingAnalytics,
      SalesCycleAnalytics,
      DiscountAnalytics,
      ProductPerformance,
      // Settings
      CPQSettings,
      CPQUserPermission,
      CPQApprovalWorkflow,
      CPQApprovalRequest,
      CPQNotificationSetting,
      CPQIntegration,
      CPQApprovalItem,
      // Orphan-page tables
      CPQConfigRuleItem,
      CPQCompatibilityEntry,
      CPQCrossSellRule,
      CPQRecommendation,
      CPQCodeListItem,
      CPQIntegrationSyncLog,
      // Orphan-page tables (second pass)
      CPQWorkflowRequest,
      CPQQuoteVersionRow,
      CPQNotificationSettingRow,
      CPQPermissionRole,
      CPQIntegrationEndpoint,
      CPQConfigStep,
      // Advanced-features tabs (pricing version control + approval matrix)
      CPQPricingVersion,
      CPQApprovalMatrixRule,
      // Advanced-features tabs (guided-selling questions + margin guardrails)
      CPQGuidedSellingQuestion,
      CPQMarginGuardrail,
    ]),
  ],
  controllers: [
    ProductConfigurationController,
    PricingEngineController,
    QuoteController,
    GuidedSellingController,
    ProposalContractController,
    CPQAnalyticsController,
    CPQSettingsController,
    CPQApprovalItemController,
    CPQAnalyticsDashboardsController,
    CPQConfigRuleItemController,
    CPQCompatibilityEntryController,
    CPQCrossSellRuleController,
    CPQRecommendationController,
    CPQCodeListItemController,
    CPQIntegrationSyncLogController,
    CPQWorkflowRequestController,
    CPQQuoteVersionRowController,
    CPQNotificationSettingRowController,
    CPQPermissionRoleController,
    CPQIntegrationEndpointController,
    CPQConfigStepController,
    CPQPricingVersionController,
    CPQApprovalMatrixController,
    CPQGuidedSellingQuestionController,
    CPQMarginGuardrailController,
  ],
  providers: [
    ProductConfigurationService,
    PricingEngineService,
    QuoteService,
    GuidedSellingService,
    ProposalContractService,
    CPQAnalyticsService,
    CPQSettingsService,
    CPQApprovalItemService,
    CPQAnalyticsDashboardsService,
    CPQConfigRuleItemService,
    CPQCompatibilityEntryService,
    CPQCrossSellRuleService,
    CPQRecommendationService,
    CPQCodeListItemService,
    CPQIntegrationSyncLogService,
    CPQWorkflowRequestService,
    CPQQuoteVersionRowService,
    CPQNotificationSettingRowService,
    CPQPermissionRoleService,
    CPQIntegrationEndpointService,
    CPQConfigStepService,
    CPQPricingVersionService,
    CPQApprovalMatrixService,
    CPQGuidedSellingQuestionService,
    CPQMarginGuardrailService,
  ],
  exports: [
    ProductConfigurationService,
    PricingEngineService,
    QuoteService,
    GuidedSellingService,
    ProposalContractService,
    CPQAnalyticsService,
    CPQSettingsService,
  ],
})
export class CPQModule {}
