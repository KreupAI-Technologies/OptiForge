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
  ],
  exports: [
    InteractionsService,
    LeadsService,
    SalesTerritoryService,
    CrmMastersService,
  ],
})
export class CrmModule { }
