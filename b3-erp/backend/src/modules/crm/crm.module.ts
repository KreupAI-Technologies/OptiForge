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
  ],
  exports: [
    InteractionsService,
    LeadsService,
    SalesTerritoryService,
    CrmMastersService,
  ],
})
export class CrmModule { }
