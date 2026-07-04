import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { SupportAutomationRule } from './entities/support-automation-rule.entity';
import { SupportFaq } from './entities/support-faq.entity';
import { SupportTicketCategory } from './entities/support-ticket-category.entity';
import { SupportResponseTemplate } from './entities/support-response-template.entity';
import { SupportReportTemplate } from './entities/support-report-template.entity';
import { SupportSlaSetting } from './entities/support-sla-setting.entity';
import { SupportAgent } from './entities/support-agent.entity';
import { SupportAgentSkill } from './entities/support-agent-skill.entity';
import { SupportEscalationRule } from './entities/support-escalation-rule.entity';
import { SupportAssignmentRule } from './entities/support-assignment-rule.entity';
import { SupportGuide } from './entities/support-guide.entity';
import { SupportTroubleshootingArticle } from './entities/support-troubleshooting-article.entity';
import { SupportKnownError } from './entities/support-known-error.entity';
import { SupportHardwareAsset } from './entities/support-hardware-asset.entity';
import { SupportSoftwareAsset } from './entities/support-software-asset.entity';
import { SupportScheduledChange } from './entities/support-scheduled-change.entity';
import { OmnichannelInteraction } from './entities/omnichannel-interaction.entity';
import { SupportAutomationRuleController } from './controllers/support-automation-rule.controller';
import { SupportFaqController } from './controllers/support-faq.controller';
import { SupportTicketCategoryController } from './controllers/support-ticket-category.controller';
import { SupportResponseTemplateController } from './controllers/support-response-template.controller';
import { SupportReportTemplateController } from './controllers/support-report-template.controller';
import { SupportSlaSettingController } from './controllers/support-sla-setting.controller';
import { SupportAgentController } from './controllers/support-agent.controller';
import { SupportAgentSkillController } from './controllers/support-agent-skill.controller';
import { SupportEscalationRuleController } from './controllers/support-escalation-rule.controller';
import { SupportAssignmentRuleController } from './controllers/support-assignment-rule.controller';
import { SupportGuideController } from './controllers/support-guide.controller';
import { SupportTroubleshootingArticleController } from './controllers/support-troubleshooting-article.controller';
import { SupportKnownErrorController } from './controllers/support-known-error.controller';
import { SupportHardwareAssetController } from './controllers/support-hardware-asset.controller';
import { SupportSoftwareAssetController } from './controllers/support-software-asset.controller';
import { SupportScheduledChangeController } from './controllers/support-scheduled-change.controller';
import { OmnichannelInteractionController } from './controllers/omnichannel-interaction.controller';
import { SupportAutomationRuleService } from './services/support-automation-rule.service';
import { SupportFaqService } from './services/support-faq.service';
import { SupportTicketCategoryService } from './services/support-ticket-category.service';
import { SupportResponseTemplateService } from './services/support-response-template.service';
import { SupportReportTemplateService } from './services/support-report-template.service';
import { SupportSlaSettingService } from './services/support-sla-setting.service';
import { SupportAgentService } from './services/support-agent.service';
import { SupportAgentSkillService } from './services/support-agent-skill.service';
import { SupportEscalationRuleService } from './services/support-escalation-rule.service';
import { SupportAssignmentRuleService } from './services/support-assignment-rule.service';
import { SupportGuideService } from './services/support-guide.service';
import { SupportTroubleshootingArticleService } from './services/support-troubleshooting-article.service';
import { SupportKnownErrorService } from './services/support-known-error.service';
import { SupportHardwareAssetService } from './services/support-hardware-asset.service';
import { SupportSoftwareAssetService } from './services/support-software-asset.service';
import { SupportScheduledChangeService } from './services/support-scheduled-change.service';
import { OmnichannelInteractionService } from './services/omnichannel-interaction.service';
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
      SupportReportTemplate,
      SupportSlaSetting,
      SupportAgent,
      SupportAgentSkill,
      SupportEscalationRule,
      SupportAssignmentRule,
      SupportGuide,
      SupportTroubleshootingArticle,
      SupportKnownError,
      SupportHardwareAsset,
      SupportSoftwareAsset,
      SupportScheduledChange,
      OmnichannelInteraction,
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
    SupportReportTemplateController,
    SupportSlaSettingController,
    SupportAgentController,
    SupportAgentSkillController,
    SupportEscalationRuleController,
    SupportAssignmentRuleController,
    SupportGuideController,
    SupportTroubleshootingArticleController,
    SupportKnownErrorController,
    SupportHardwareAssetController,
    SupportSoftwareAssetController,
    SupportScheduledChangeController,
    OmnichannelInteractionController,
    SupportController,
  ],
  providers: [
    SupportAutomationRuleService,
    SupportFaqService,
    SupportTicketCategoryService,
    SupportResponseTemplateService,
    SupportReportTemplateService,
    SupportSlaSettingService,
    SupportAgentService,
    SupportAgentSkillService,
    SupportEscalationRuleService,
    SupportAssignmentRuleService,
    SupportGuideService,
    SupportTroubleshootingArticleService,
    SupportKnownErrorService,
    SupportHardwareAssetService,
    SupportSoftwareAssetService,
    SupportScheduledChangeService,
    OmnichannelInteractionService,
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
