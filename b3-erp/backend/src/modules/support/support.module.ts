import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { SupportAutomationRule } from './entities/support-automation-rule.entity';
import { SupportFaq } from './entities/support-faq.entity';
import { SupportTicketCategory } from './entities/support-ticket-category.entity';
import { SupportResponseTemplate } from './entities/support-response-template.entity';
import { SupportSlaSetting } from './entities/support-sla-setting.entity';
import { SupportAutomationRuleController } from './controllers/support-automation-rule.controller';
import { SupportFaqController } from './controllers/support-faq.controller';
import { SupportTicketCategoryController } from './controllers/support-ticket-category.controller';
import { SupportResponseTemplateController } from './controllers/support-response-template.controller';
import { SupportSlaSettingController } from './controllers/support-sla-setting.controller';
import { SupportAutomationRuleService } from './services/support-automation-rule.service';
import { SupportFaqService } from './services/support-faq.service';
import { SupportTicketCategoryService } from './services/support-ticket-category.service';
import { SupportResponseTemplateService } from './services/support-response-template.service';
import { SupportSlaSettingService } from './services/support-sla-setting.service';
import { AIResponsesService } from './services/ai-responses.service';
import { BacklogService } from './services/backlog.service';
import { ChannelRoutingService } from './services/channel-routing.service';
import { CSATService } from './services/csat.service';
import { ITILService } from './services/itil.service';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { SLATrackingService } from './services/sla-tracking.service';
import { SupportManagementService } from './services/support-management.service';
import { SupportSeederService } from './services/support-seeder.service';
import { SupportSettingsService } from './services/support-settings.service';
import { TicketManagementService } from './services/ticket-management.service';
import { SupportController } from './support.controller';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      SupportAutomationRule,
      SupportFaq,
      SupportTicketCategory,
      SupportResponseTemplate,
      SupportSlaSetting,
    ]),
  ],
  controllers: [
    // Register the specific static routes (e.g. tickets/categories) BEFORE
    // SupportController, whose `tickets/:id` param route would otherwise shadow
    // and 500 them (old Prisma handler with no backing table).
    SupportTicketCategoryController,
    SupportAutomationRuleController,
    SupportFaqController,
    SupportResponseTemplateController,
    SupportSlaSettingController,
    SupportController,
  ],
  providers: [
    SupportAutomationRuleService,
    SupportFaqService,
    SupportTicketCategoryService,
    SupportResponseTemplateService,
    SupportSlaSettingService,
    AIResponsesService,
    BacklogService,
    ChannelRoutingService,
    CSATService,
    ITILService,
    KnowledgeBaseService,
    SLATrackingService,
    SupportSeederService,
    SupportSettingsService,
    TicketManagementService,
    SupportManagementService,
  ],
  exports: [
    SupportAutomationRuleService,
    SupportFaqService,
    SupportTicketCategoryService,
    SupportResponseTemplateService,
    SupportSlaSettingService,
    AIResponsesService,
    BacklogService,
    ChannelRoutingService,
    CSATService,
    ITILService,
    KnowledgeBaseService,
    SLATrackingService,
    SupportSettingsService,
    TicketManagementService,
    SupportManagementService,
  ],
})
export class SupportModule { }
