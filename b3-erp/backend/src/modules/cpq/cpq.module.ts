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
