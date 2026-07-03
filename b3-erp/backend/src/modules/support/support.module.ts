import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { SupportAutomationRule } from './entities/support-automation-rule.entity';
import { SupportFaq } from './entities/support-faq.entity';
import { SupportAutomationRuleController } from './controllers/support-automation-rule.controller';
import { SupportFaqController } from './controllers/support-faq.controller';
import { SupportAutomationRuleService } from './services/support-automation-rule.service';
import { SupportFaqService } from './services/support-faq.service';
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
    TypeOrmModule.forFeature([SupportAutomationRule, SupportFaq]),
  ],
  controllers: [
    SupportController,
    SupportAutomationRuleController,
    SupportFaqController,
  ],
  providers: [
    SupportAutomationRuleService,
    SupportFaqService,
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
