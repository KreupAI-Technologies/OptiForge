import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';

// Entities
import { ServiceType } from './entities/service-type.entity';
import { WarrantyTypeEntity } from './entities/warranty-type.entity';
import { KnowledgeBase } from './entities/knowledge-base.entity';
import { SparePart } from './entities/spare-part.entity';
import { KnowledgeFaq } from './entities/knowledge-faq.entity';
import { KnowledgeManual } from './entities/knowledge-manual.entity';

// Knowledge base (FAQs + Manuals)
import { KnowledgeFaqController } from './knowledge/knowledge-faq.controller';
import { KnowledgeFaqService } from './knowledge/knowledge-faq.service';
import { KnowledgeManualController } from './knowledge/knowledge-manual.controller';
import { KnowledgeManualService } from './knowledge/knowledge-manual.service';

// Service Contracts
import { ServiceContractsController } from './service-contracts/service-contracts.controller';
import { ServiceContractsService } from './service-contracts/service-contracts.service';

// Warranties
import { WarrantiesController } from './warranties/warranties.controller';
import { WarrantiesService } from './warranties/warranties.service';

// Service Requests
import { ServiceRequestsController } from './service-requests/service-requests.controller';
import { ServiceRequestsService } from './service-requests/service-requests.service';

// Installations
import { InstallationsController } from './installations/installations.controller';
import { InstallationsService } from './installations/installations.service';

// Field Service
import { FieldServiceController } from './field-service/field-service.controller';
import { FieldServiceService } from './field-service/field-service.service';

// Service Billing
import { ServiceBillingController } from './service-billing/service-billing.controller';
import { ServiceBillingService } from './service-billing/service-billing.service';

// Seeders
import { ServiceTypeSeederService } from './services/service-type-seeder.service';
import { WarrantyTypeSeederService } from './services/warranty-type-seeder.service';
import { AfterSalesService } from './services/after-sales.service';
import { AfterSalesManagementService } from './services/after-sales-management.service';
import { AfterSalesController } from './after-sales.controller';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      ServiceType,
      WarrantyTypeEntity,
      KnowledgeBase,
      SparePart,
      KnowledgeFaq,
      KnowledgeManual,
    ]),
  ],
  controllers: [
    ServiceContractsController,
    WarrantiesController,
    ServiceRequestsController,
    InstallationsController,
    FieldServiceController,
    ServiceBillingController,
    KnowledgeFaqController,
    KnowledgeManualController,
    AfterSalesController,
  ],
  providers: [
    ServiceContractsService,
    WarrantiesService,
    ServiceRequestsService,
    InstallationsService,
    FieldServiceService,
    ServiceBillingService,
    KnowledgeFaqService,
    KnowledgeManualService,
    ServiceTypeSeederService,
    WarrantyTypeSeederService,
    AfterSalesService,
    AfterSalesManagementService,
  ],
  exports: [
    ServiceContractsService,
    WarrantiesService,
    ServiceRequestsService,
    InstallationsService,
    FieldServiceService,
    ServiceBillingService,
    AfterSalesService,
    AfterSalesManagementService,
  ],
})
export class AfterSalesServiceModule { }
