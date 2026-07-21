import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { AuditLog } from './entities/audit-log.entity';
import { UserSession } from './entities/user-session.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { SystemConfig } from './entities/system-config.entity';
import { ComplianceRequirement } from './entities/compliance-requirement.entity';
import { ComplianceRequirementController } from './controllers/compliance-requirement.controller';
import { ComplianceRequirementService } from './services/compliance-requirement.service';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UserPreference } from './entities/user-preference.entity';
import { AccessPolicyDef } from './entities/access-policy.entity';
import { CustomFieldDef } from './entities/custom-field.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { IntegrationConfig } from './entities/integration-config.entity';
import { IpWhitelistEntry } from './entities/ip-whitelist-entry.entity';
import { ScheduledJob } from './entities/scheduled-job.entity';
import { AutomationRule } from './entities/automation-rule.entity';
import { SecurityAlert } from './entities/security-alert.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { PasswordPolicy } from './entities/password-policy.entity';
import { NotificationSetting } from './entities/notification-setting.entity';
import { UserGroup } from './entities/user-group.entity';
import { LicenseFeature } from './entities/license-feature.entity';
import { LicenseUser } from './entities/license-user.entity';
import { SecurityPolicy } from './entities/security-policy.entity';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { BackupRecord } from './entities/backup-record.entity';
import { ExportDataset } from './entities/export-dataset.entity';
import { SystemMonitor } from './entities/system-monitor.entity';

// Services
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { RolePermissionService } from './services/role-permission.service';
import { UserRoleService } from './services/user-role.service';
import { AuditLogService } from './services/audit-log.service';
import { UserSessionService } from './services/user-session.service';
import { PasswordHistoryService } from './services/password-history.service';
import { SystemConfigService } from './services/system-config.service';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { AdminManagementService } from './services/admin-management.service';
import { AccessPolicyService } from './services/access-policy.service';
import { CustomFieldService } from './services/custom-field.service';
import { DocumentTemplateService } from './services/document-template.service';
import { IntegrationConfigService } from './services/integration-config.service';
import { IpWhitelistService } from './services/ip-whitelist.service';
import { ScheduledJobService } from './services/scheduled-job.service';
import { AutomationRuleService } from './services/automation-rule.service';
import { SecurityAlertService } from './services/security-alert.service';
import { AlertRuleService } from './services/alert-rule.service';
import { PasswordPolicyService } from './services/password-policy.service';
import { NotificationSettingService } from './services/notification-setting.service';
import { UserGroupService } from './services/user-group.service';
import { LicenseFeatureService } from './services/license-feature.service';
import { LicenseUserService } from './services/license-user.service';
import { SecurityPolicyService } from './services/security-policy.service';
import { WebhookEndpointService } from './services/webhook-endpoint.service';
import { ApiEndpointService } from './services/api-endpoint.service';
import { BackupRecordService } from './services/backup-record.service';
import { ExportDatasetService } from './services/export-dataset.service';
import { SystemMonitorService } from './services/system-monitor.service';

// Seeders
import { RoleSeederService } from './services/role-seeder.service';
import { PermissionSeederService } from './services/permission-seeder.service';
import { SystemConfigSeederService } from './services/system-config-seeder.service';
import { RolePermissionSeederService } from './services/role-permission-seeder.service';
import { AdminUserSeederService } from './services/admin-user-seeder.service';

// Controllers
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { UserSessionController } from './controllers/user-session.controller';
import { SystemConfigController } from './controllers/system-config.controller';
import { NotificationController } from './controllers/notification.controller';
import { NotificationPreferenceController } from './controllers/notification-preference.controller';
import { UserPreferenceController } from './controllers/user-preference.controller';
import { UserPreferenceService } from './services/user-preference.service';
import { AccessPolicyController } from './controllers/access-policy.controller';
import { CustomFieldController } from './controllers/custom-field.controller';
import { DocumentTemplateController } from './controllers/document-template.controller';
import { IntegrationConfigController } from './controllers/integration-config.controller';
import { IpWhitelistController } from './controllers/ip-whitelist.controller';
import { ScheduledJobController } from './controllers/scheduled-job.controller';
import { AutomationRuleController } from './controllers/automation-rule.controller';
import { SecurityAlertController } from './controllers/security-alert.controller';
import { AlertRuleController } from './controllers/alert-rule.controller';
import { PasswordPolicyController } from './controllers/password-policy.controller';
import { NotificationSettingController } from './controllers/notification-setting.controller';
import { UserGroupController } from './controllers/user-group.controller';
import { LicenseFeatureController } from './controllers/license-feature.controller';
import { LicenseUserController } from './controllers/license-user.controller';
import { SecurityPolicyController } from './controllers/security-policy.controller';
import { WebhookEndpointController } from './controllers/webhook-endpoint.controller';
import { ApiEndpointController } from './controllers/api-endpoint.controller';
import { BackupRecordController } from './controllers/backup-record.controller';
import { ExportDatasetController } from './controllers/export-dataset.controller';
import { SystemMonitorController } from './controllers/system-monitor.controller';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      RolePermission,
      UserRole,
      AuditLog,
      UserSession,
      PasswordHistory,
      SystemConfig,
      Notification,
      NotificationPreference,
      UserPreference,
      AccessPolicyDef,
      CustomFieldDef,
      DocumentTemplate,
      IntegrationConfig,
      IpWhitelistEntry,
      ScheduledJob,
      AutomationRule,
      SecurityAlert,
      AlertRule,
      PasswordPolicy,
      NotificationSetting,
      UserGroup,
      LicenseFeature,
      LicenseUser,
      SecurityPolicy,
      WebhookEndpoint,
      ApiEndpoint,
      BackupRecord,
      ExportDataset,
      SystemMonitor,
      ComplianceRequirement,
    ]),
  ],
  controllers: [
    UserController,
    RoleController,
    PermissionController,
    UserRoleController,
    AuditLogController,
    UserSessionController,
    SystemConfigController,
    NotificationController,
    NotificationPreferenceController,
    AccessPolicyController,
    CustomFieldController,
    DocumentTemplateController,
    IntegrationConfigController,
    IpWhitelistController,
    ScheduledJobController,
    AutomationRuleController,
    SecurityAlertController,
    AlertRuleController,
    PasswordPolicyController,
    NotificationSettingController,
    UserGroupController,
    LicenseFeatureController,
    LicenseUserController,
    SecurityPolicyController,
    WebhookEndpointController,
    ApiEndpointController,
    BackupRecordController,
    ExportDatasetController,
    SystemMonitorController,
    ComplianceRequirementController,
  ],
  providers: [
    UserService,
    RoleService,
    PermissionService,
    RolePermissionService,
    UserRoleService,
    AuditLogService,
    UserSessionService,
    PasswordHistoryService,
    SystemConfigService,
    NotificationService,
    NotificationPreferenceService,
    UserPreferenceService,
    AdminManagementService,
    AccessPolicyService,
    CustomFieldService,
    DocumentTemplateService,
    IntegrationConfigService,
    IpWhitelistService,
    ScheduledJobService,
    AutomationRuleService,
    SecurityAlertService,
    AlertRuleService,
    PasswordPolicyService,
    NotificationSettingService,
    UserGroupService,
    LicenseFeatureService,
    LicenseUserService,
    SecurityPolicyService,
    WebhookEndpointService,
    ApiEndpointService,
    BackupRecordService,
    ExportDatasetService,
    SystemMonitorService,
    ComplianceRequirementService,
    // Seeders
    RoleSeederService,
    PermissionSeederService,
    SystemConfigSeederService,
    RolePermissionSeederService,
    AdminUserSeederService,
  ],
  exports: [
    UserService,
    RoleService,
    PermissionService,
    RolePermissionService,
    UserRoleService,
    AuditLogService,
    UserSessionService,
    PasswordHistoryService,
    SystemConfigService,
    NotificationService,
    NotificationPreferenceService,
    UserPreferenceService,
    AdminManagementService,
  ],
})
export class ItAdminModule { }
