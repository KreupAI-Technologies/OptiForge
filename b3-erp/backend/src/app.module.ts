import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { rateLimitConfig, CustomThrottlerGuard } from './common/security/rate-limit.config';
import { CsrfGuard } from './common/security/csrf.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AuditLogger } from './common/logging/audit-logger.service';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfigFactory } from './common/cache/cache.config';

// Modules
import { AccountsModule } from './modules/accounts/accounts.module';
import { AfterSalesServiceModule } from './modules/after-sales-service/after-sales-service.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CommonMastersModule } from './modules/common-masters/common-masters.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { PortalModule } from './modules/portal/portal.module';
import { CoreModule } from './modules/core/core.module';
import { CPQModule } from './modules/cpq/cpq.module';
import { CrmModule } from './modules/crm/crm.module';
import { EstimationModule } from './modules/estimation/estimation.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { IotModule } from './modules/iot/iot.module';
import { ItAdminModule } from './modules/it-admin/it-admin.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { PackagingModule } from './modules/packaging/packaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { ProductionModule } from './modules/production/production.module';
import { ProjectManagementModule } from './modules/project-management/project-management.module';
import { QualityModule } from './modules/quality/quality.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdvancedFeaturesModule } from './modules/advanced-features/advanced-features.module';
import { SalesModule } from './modules/sales/sales.module';
import { SupportModule } from './modules/support/support.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot(rateLimitConfig),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: cacheConfigFactory,
      inject: [ConfigService],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get('DATABASE_URL');
        if (url) {
          return {
            type: 'postgres',
            url,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
            logging: configService.get('DB_LOGGING') === 'true',
            ssl: { rejectUnauthorized: false },
          };
        }
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: +configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'manufacturing_erp'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: configService.get('DB_LOGGING') === 'true',
          ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),

    // Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('BULL_REDIS_HOST', 'localhost'),
          port: +configService.get('BULL_REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    // Application Modules
    CoreModule,
    AccountsModule,
    CrmModule,
    CPQModule,
    SalesModule,
    AfterSalesServiceModule,
    EstimationModule,
    InventoryModule,
    HealthModule,
    ProductionModule,
    ProcurementModule,
    FinanceModule,
    HrModule,
    QualityModule,
    WorkflowModule,
    ApprovalsModule,
    ReportsModule,
    DashboardModule,
    AdvancedFeaturesModule,
    LogisticsModule,
    PackagingModule,
    NotificationsModule,
    SupportModule,
    ItAdminModule,
    ProjectManagementModule,
    AuthModule,
    PrismaModule,
    CommonMastersModule,
    ComplianceModule,
    DocumentationModule,
    CollaborationModule,
    PortalModule,
    IotModule,
  ],
  providers: [
    // Rate limiting runs first so floods are rejected before auth work.
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // CSRF: reject cross-origin mutating requests before doing auth work.
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    // Global authentication: every route requires a valid JWT unless it is
    // annotated with @Public(). Default-deny for the whole API surface.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AuditLogger,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
