import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { CrmMastersController } from './crm-masters.controller';
import { CrmMastersService } from './crm-masters.service';
import { EmailTemplateController } from './email-template.controller';
import { SalesAnalyticsController } from './sales-analytics.controller';
import { SocialIntegrationController } from './social-integration.controller';
import { EmailTemplate } from './entities/email-template.entity';
import { SocialIntegration } from './entities/social-integration.entity';
import { EmailTemplateService } from './services/email-template.service';
import { SalesAnalyticsService } from './services/sales-analytics.service';
import { SocialIntegrationService } from './services/social-integration.service';
import { Interaction } from './entities/interaction.entity';
import { LeadSource } from './entities/lead-source.entity';
import { LeadStatusEntity } from './entities/lead-status.entity';
import { Lead } from './entities/lead.entity';
import { SalesTerritory } from './entities/sales-territory.entity';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { SalesTerritoryController } from './sales-territory.controller';
import { LeadSourceSeederService } from './services/lead-source-seeder.service';
import { LeadStatusSeederService } from './services/lead-status-seeder.service';
import { SalesTerritoryService } from './services/sales-territory.service';
import { QuoteTemplate } from './entities/quote-template.entity';
import { ContractTemplate } from './entities/contract-template.entity';
import { CampaignTemplate } from './entities/campaign-template.entity';
import { SalesTeam } from './entities/sales-team.entity';
import { AssignmentRule } from './entities/assignment-rule.entity';
import { QuoteTemplateService } from './services/quote-template.service';
import { ContractTemplateService } from './services/contract-template.service';
import { CampaignTemplateService } from './services/campaign-template.service';
import { SalesTeamService } from './services/sales-team.service';
import { AssignmentRuleService } from './services/assignment-rule.service';
import { QuoteTemplateController } from './quote-template.controller';
import { ContractTemplateController } from './contract-template.controller';
import { CampaignTemplateController } from './campaign-template.controller';
import { SalesTeamController } from './sales-team.controller';
import { AssignmentRuleController } from './assignment-rule.controller';
import { CustomerSegment } from './entities/customer-segment.entity';
import { ContactList } from './entities/contact-list.entity';
import { ContactRole } from './entities/contact-role.entity';
import { ActivityRecord } from './entities/activity-record.entity';
import { PipelineStageConfig } from './entities/pipeline-stage-config.entity';
import { CustomerSegmentService } from './services/customer-segment.service';
import { ContactListService } from './services/contact-list.service';
import { ContactRoleService } from './services/contact-role.service';
import { ActivityRecordService } from './services/activity-record.service';
import { PipelineStageConfigService } from './services/pipeline-stage-config.service';
import { CrmAnalyticsService } from './services/crm-analytics.service';
import { CustomerSegmentController } from './customer-segment.controller';
import { ContactListController } from './contact-list.controller';
import { ContactRoleController } from './contact-role.controller';
import { ActivityRecordController } from './activity-record.controller';
import { PipelineStageConfigController } from './pipeline-stage-config.controller';
import { CrmAnalyticsController } from './crm-analytics.controller';
// Second-pass wired features
import { CrmCustomer } from './entities/crm-customer.entity';
import { CrmProposal } from './entities/crm-proposal.entity';
import { CrmCampaign } from './entities/crm-campaign.entity';
import { CrmEmailCampaign } from './entities/crm-email-campaign.entity';
import { CrmContractRenewal } from './entities/crm-contract-renewal.entity';
import { CrmContractAmendment } from './entities/crm-contract-amendment.entity';
import { CrmCustomerService } from './services/crm-customer.service';
import { CrmProposalService } from './services/crm-proposal.service';
import { CrmCampaignService } from './services/crm-campaign.service';
import { CrmEmailCampaignService } from './services/crm-email-campaign.service';
import { CrmContractRenewalService } from './services/crm-contract-renewal.service';
import { CrmContractAmendmentService } from './services/crm-contract-amendment.service';
import { CrmOpportunitiesService } from './services/crm-opportunities.service';
import { CrmCustomerController } from './crm-customer.controller';
import { CrmProposalController } from './crm-proposal.controller';
import { CrmCampaignController } from './crm-campaign.controller';
import { CrmEmailCampaignController } from './crm-email-campaign.controller';
import { CrmContractRenewalController } from './crm-contract-renewal.controller';
import { CrmContractAmendmentController } from './crm-contract-amendment.controller';
import { CrmOpportunitiesController } from './crm-opportunities.controller';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      Lead,
      Interaction,
      LeadSource,
      LeadStatusEntity,
      SalesTerritory,
      EmailTemplate,
      SocialIntegration,
      QuoteTemplate,
      ContractTemplate,
      CampaignTemplate,
      SalesTeam,
      AssignmentRule,
      CustomerSegment,
      ContactList,
      ContactRole,
      ActivityRecord,
      PipelineStageConfig,
      CrmCustomer,
      CrmProposal,
      CrmCampaign,
      CrmEmailCampaign,
      CrmContractRenewal,
      CrmContractAmendment,
    ]),
  ],
  controllers: [
    InteractionsController,
    LeadsController,
    SalesTerritoryController,
    CrmMastersController,
    EmailTemplateController,
    SalesAnalyticsController,
    SocialIntegrationController,
    QuoteTemplateController,
    ContractTemplateController,
    CampaignTemplateController,
    SalesTeamController,
    AssignmentRuleController,
    CustomerSegmentController,
    ContactListController,
    ContactRoleController,
    ActivityRecordController,
    PipelineStageConfigController,
    CrmAnalyticsController,
    CrmCustomerController,
    CrmProposalController,
    CrmCampaignController,
    CrmEmailCampaignController,
    CrmContractRenewalController,
    CrmContractAmendmentController,
    CrmOpportunitiesController,
  ],
  providers: [
    InteractionsService,
    LeadsService,
    SalesTerritoryService,
    LeadSourceSeederService,
    LeadStatusSeederService,
    CrmMastersService,
    EmailTemplateService,
    SalesAnalyticsService,
    SocialIntegrationService,
    QuoteTemplateService,
    ContractTemplateService,
    CampaignTemplateService,
    SalesTeamService,
    AssignmentRuleService,
    CustomerSegmentService,
    ContactListService,
    ContactRoleService,
    ActivityRecordService,
    PipelineStageConfigService,
    CrmAnalyticsService,
    CrmCustomerService,
    CrmProposalService,
    CrmCampaignService,
    CrmEmailCampaignService,
    CrmContractRenewalService,
    CrmContractAmendmentService,
    CrmOpportunitiesService,
  ],
  exports: [
    InteractionsService,
    LeadsService,
    SalesTerritoryService,
    CrmMastersService,
  ],
})
export class CrmModule { }
